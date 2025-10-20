import { db } from '@/lib/db';
import { users, companies, teams, attendances, holidays, invitations, locations, expenses } from '@/db/schema';
import { eq, and, or, desc, count, sum, sql, arrayContains } from 'drizzle-orm';
import type { Role } from '@/db/schema';

// Define a User type based on the schema
export type User = typeof users.$inferSelect;

// Admin Dashboard Queries
export async function getAdminDashboardData() {
  try {
    const [
      totalUsers,
      totalCompanies,
      pendingInvitations,
      activeSubscriptions,
      recentUsers,
      systemStats
    ] = await Promise.all([
      // Total users count
      db.select({ count: count() }).from(users),
      
      // Total companies count
      db.select({ count: count() }).from(companies),
      
      // Pending invitations count
      db.select({ count: count() })
        .from(invitations)
        .where(eq(invitations.status, 'pending')),
      
      // Active subscriptions count
      db.select({ count: count() })
        .from(users)
        .where(eq(users.subscriptionStatus, 'active')),
      
      // Recent users (last 7 days)
      db.select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(10),
      
      // System statistics
      db.select({
        totalRevenue: sum(sql`CAST(${users.subscriptionPlan} AS INTEGER)`).mapWith(Number),
        avgUsersPerCompany: sql<number>`COUNT(${users.id})::float / NULLIF(COUNT(DISTINCT ${companies.id}), 0)`
      }).from(users).leftJoin(companies, eq(users.id, companies.userId))
    ]);

    return {
      stats: {
        totalUsers: totalUsers[0]?.count || 0,
        totalCompanies: totalCompanies[0]?.count || 0,
        pendingInvitations: pendingInvitations[0]?.count || 0,
        activeSubscriptions: activeSubscriptions[0]?.count || 0,
      },
      recentUsers: recentUsers,
      systemStats: systemStats[0] || { totalRevenue: 0, avgUsersPerCompany: 0 }
    };
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    throw new Error('Failed to fetch admin dashboard data');
  }
}

// Manager Dashboard Queries
export async function getManagerDashboardData(userId: string, companyId: number) {
  try {
    const managerTeams = await db
      .select({
        members: teams.members,
      })
      .from(teams)
      .where(
        and(
          eq(teams.companyId, companyId),
          arrayContains(teams.members, [userId])
        )
      );

    const memberIds = [...new Set(managerTeams.flatMap((team) => team.members))];

    if (memberIds.length === 0) {
      // Handle case where manager has no team members
      return {
        stats: {
          teamMembers: 0,
          pendingAttendances: 0,
          pendingHolidays: 0,
          activeMembers: 0,
          totalMembers: 0,
          pendingInvites: 0,
          pendingExpenses: 0,
          totalExpenses: 0,
        },
        teamMembers: [],
        recentActivities: [],
      };
    }

    const [
      teamMembers,
      pendingAttendances,
      pendingHolidays,
      teamStats,
      recentActivities,
      pendingExpenses,
      totalExpenses,
      pendingInvites,
    ] = await Promise.all([
      // Get team members for manager's teams
      db
        .select({
          userId: users.id,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
          lastLoginAt: users.lastLoginAt,
        })
        .from(users)
        .where(or(...memberIds.map((id) => eq(users.id, id as string)))),

      // Pending attendances for approval
      db
        .select({ count: count() })
        .from(attendances)
        .where(
          and(
            eq(attendances.companyId, companyId),
            eq(attendances.status, 'submitted')
          )
        ),

      // Pending holidays for approval
      db
        .select({ count: count() })
        .from(holidays)
        .where(
          and(
            eq(holidays.companyId, companyId),
            eq(holidays.status, 'pending')
          )
        ),

      // Team statistics
      db
        .select({
          totalMembers: count(users.id),
          activeMembers: count(
            sql`CASE WHEN ${users.lastLoginAt} > NOW() - INTERVAL '30 days' THEN 1 END`
          ),
        })
        .from(users)
        .where(or(...memberIds.map((id) => eq(users.id, id as string)))),

      // Recent activities (attendances and holidays)
      db
        .select({
          id: attendances.id,
          type: sql`'attendance'`.as<'attendance' | 'holiday'>(),
          userId: attendances.userId,
          status: attendances.status,
          month: attendances.month,
          year: attendances.year,
          createdAt: attendances.createdAt,
        })
        .from(attendances)
        .where(eq(attendances.companyId, companyId))
        .orderBy(desc(attendances.createdAt))
        .limit(5),

      // Pending expenses for approval
      db
        .select({ count: count() })
        .from(expenses)
        .where(
          and(
            eq(expenses.companyId, companyId),
            eq(expenses.status, 'pending')
          )
        ),

      // Total expenses amount
      db
        .select({ total: sum(expenses.amount).mapWith(Number) })
        .from(expenses)
        .where(eq(expenses.companyId, companyId)),

      // Pending invitations
      db
        .select({ count: count() })
        .from(invitations)
        .where(
          and(
            eq(invitations.companyId, companyId),
            eq(invitations.status, 'pending')
          )
        ),
    ]);

    return {
      stats: {
        teamMembers: teamMembers.length,
        pendingAttendances: pendingAttendances[0]?.count || 0,
        pendingHolidays: pendingHolidays[0]?.count || 0,
        activeMembers: teamStats[0]?.activeMembers || 0,
        totalMembers: teamStats[0]?.totalMembers || 0,
        pendingExpenses: pendingExpenses[0]?.count || 0,
        totalExpenses: totalExpenses[0]?.total || 0,
        pendingInvites: pendingInvites[0]?.count || 0,
      },
      teamMembers,
      recentActivities,
    };
  } catch (error) {
    console.error('Error fetching manager dashboard data:', error);
    throw new Error('Failed to fetch manager dashboard data');
  }
}

// User Dashboard Queries
export async function getUserDashboardData(userId: string, companyId: number) {
  try {
    const [
      userAttendances,
      userHolidays,
      userStats,
      currentMonthAttendance,
      upcomingHolidays
    ] = await Promise.all([
      // User's attendances
      db.select()
        .from(attendances)
        .where(and(
          eq(attendances.userId, userId),
          eq(attendances.companyId, companyId)
        ))
        .orderBy(desc(attendances.createdAt))
        .limit(5),
      
      // User's holidays
      db.select()
        .from(holidays)
        .where(and(
          eq(holidays.userId, userId),
          eq(holidays.companyId, companyId)
        ))
        .orderBy(desc(holidays.createdAt))
        .limit(5),
      
      // User statistics
      db.select({
        totalAttendances: count(attendances.id),
        totalHolidays: count(holidays.id),
        pendingHolidays: count(sql`CASE WHEN ${holidays.status} = 'pending' THEN 1 END`),
        approvedHolidays: count(sql`CASE WHEN ${holidays.status} = 'approved' THEN 1 END`),
      }).from(attendances)
        .leftJoin(holidays, eq(attendances.userId, holidays.userId))
        .where(eq(attendances.userId, userId)),
      
      // Current month attendance
      db.select()
        .from(attendances)
        .where(and(
          eq(attendances.userId, userId),
          eq(attendances.companyId, companyId),
          eq(attendances.month, new Date().getMonth() + 1),
          eq(attendances.year, new Date().getFullYear())
        )),
      
      // Upcoming holidays
      db.select()
        .from(holidays)
        .where(and(
          eq(holidays.userId, userId),
          eq(holidays.companyId, companyId),
          eq(holidays.status, 'approved'),
          sql`${holidays.startDate} >= CURRENT_DATE`
        ))
        .orderBy(holidays.startDate)
        .limit(3)
    ]);

    return {
      stats: {
        totalAttendances: userStats[0]?.totalAttendances || 0,
        totalHolidays: userStats[0]?.totalHolidays || 0,
        pendingHolidays: userStats[0]?.pendingHolidays || 0,
        approvedHolidays: userStats[0]?.approvedHolidays || 0,
      },
      recentAttendances: userAttendances,
      recentHolidays: userHolidays,
      currentMonthAttendance: currentMonthAttendance[0],
      upcomingHolidays
    };
  } catch (error) {
    console.error('Error fetching user dashboard data:', error);
    throw new Error('Failed to fetch user dashboard data');
  }
}

// Utility function to get user's company
export async function getUserCompany(userId: string) {
  try {
    const company = await db.query.companies.findFirst({
      where: eq(companies.userId, userId)
    });
    
    return company;
  } catch (error) {
    console.error('Error fetching user company:', error);
    return null;
  }
}

// Get all users for admin
export async function getAllUsers(limit = 50, offset = 0) {
  try {
    const allUsers = await db.select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
    
    return allUsers;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw new Error('Failed to fetch users');
  }
}

// Get company users for manager
export async function getCompanyUsers(companyId: number, limit = 50, offset = 0) {
  try {
    const companyUsers = await db.select()
      .from(users)
      .where(eq(users.id, sql`(SELECT user_id FROM companies WHERE id = ${companyId})`))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
    
    return companyUsers;
  } catch (error) {
    console.error('Error fetching company users:', error);
    throw new Error('Failed to fetch company users');
  }
}