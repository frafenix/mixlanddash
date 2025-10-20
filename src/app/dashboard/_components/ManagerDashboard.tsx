import { RoleBasedAccess } from '@/components/RoleBasedAccess';
import SectionMain from '@/app/_components/Section/Main';
import SectionTitleLineWithButton from '@/app/_components/Section/TitleLineWithButton';
import CardBox from '@/app/_components/CardBox';
import Button from '@/app/_components/Button';
import {
  mdiAccount,
  mdiAccountGroup,
  mdiAccountMultiple,
  mdiAlertCircle,
  mdiBeach,
  mdiBell,
  mdiCalendarCheck,
  mdiChartLine,
  mdiChartTimelineVariant,
  mdiClockAlert,
  mdiReceipt,
} from '@mdi/js'
import Icon from '@/app/_components/Icon';
import { getManagerDashboardData } from '@/db/queries';
import { stackServerApp } from '@/lib/stack';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { companies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import ReloadButton from './ReloadButton';

export default async function ManagerDashboard() {
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect('/handler/sign-in');
  }

  // Get user's company
  const userCompany = await db.query.companies.findFirst({
    where: eq(companies.userId, user.id)
  });

  if (!userCompany) {
    return (
      <SectionMain>
        <CardBox>
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Nessuna Azienda Trovata</h3>
            <p className="text-gray-600 mb-4">
              Non sei associato a nessuna azienda. Contatta l'amministratore.
            </p>
          </div>
        </CardBox>
      </SectionMain>
    );
  }

  let dashboardData;
  try {
    dashboardData = await getManagerDashboardData(user.id, userCompany.id);
  } catch (error) {
    console.error('Error loading manager dashboard data:', error);
    return (
      <RoleBasedAccess allowedRoles={['manager']}>
        <SectionMain>
          <SectionTitleLineWithButton
            icon={mdiChartLine}
            title="Manager Dashboard"
            main
          />
          <CardBox>
            <div className="p-6 text-center">
              <Icon path={mdiAlertCircle} size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Errore di Caricamento</h3>
              <p className="text-gray-600 mb-4">
                Si è verificato un errore durante il caricamento dei dati del dashboard.
              </p>
              <ReloadButton />
            </div>
          </CardBox>
        </SectionMain>
      </RoleBasedAccess>
    );
  }

  return (
    <RoleBasedAccess allowedRoles={['manager']}>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title="Manager Dashboard"
          main
        >
          <Button
            href="/dashboard/team"
            label="Gestisci Team"
            color="info"
            icon={mdiAccountGroup}
            small
          />
        </SectionTitleLineWithButton>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <CardBox className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Membri Team</p>
                <p className="text-3xl font-bold">{dashboardData.stats.teamMembers}</p>
              </div>
              <Icon path={mdiAccountMultiple} size={48} className="text-blue-200" />
            </div>
          </CardBox>

          <CardBox className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Presenze da Approvare</p>
                <p className="text-3xl font-bold">{dashboardData.stats.pendingAttendances}</p>
              </div>
              <Icon path={mdiCalendarCheck} size={48} className="text-green-200" />
            </div>
          </CardBox>

          <CardBox className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Ferie da Approvare</p>
                <p className="text-3xl font-bold">{dashboardData.stats.pendingHolidays}</p>
              </div>
              <Icon path={mdiBeach} size={48} className="text-yellow-200" />
            </div>
          </CardBox>

          <CardBox className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Membri Attivi</p>
                <p className="text-3xl font-bold">{dashboardData.stats.activeMembers}</p>
              </div>
              <Icon path={mdiClockAlert} size={48} className="text-purple-200" />
            </div>
          </CardBox>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <CardBox className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-700">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Icon path={mdiAccountGroup} size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {dashboardData.stats.totalMembers}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</h3>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {dashboardData.stats.activeMembers} attivi • {dashboardData.stats.pendingInvites || 0} inviti
              </p>
            </div>
          </CardBox>

          <CardBox className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 border-green-200 dark:border-green-700">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Icon path={mdiCalendarCheck} size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {dashboardData.stats.pendingAttendances}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Presenze</h3>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {dashboardData.stats.pendingAttendances} da approvare
              </p>
            </div>
          </CardBox>

          <CardBox className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/10 border-yellow-200 dark:border-yellow-700">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Icon path={mdiBeach} size={24} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {dashboardData.stats.pendingHolidays}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Ferie</h3>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {dashboardData.stats.pendingHolidays} richieste in attesa
              </p>
            </div>
          </CardBox>

          <CardBox className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 border-purple-200 dark:border-purple-700">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Icon path={mdiReceipt} size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {dashboardData.stats.pendingExpenses || 0}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Spese</h3>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                €{dashboardData.stats.totalExpenses || 0} totali • {dashboardData.stats.pendingExpenses || 0} da approvare
              </p>
            </div>
          </CardBox>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <CardBox className="hover:shadow-lg transition-shadow duration-200">
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Team Management</h3>
              <div className="space-y-2">
                <Button
                  href="/dashboard/team"
                  label="Visualizza Team"
                  color="info"
                  icon={mdiAccountGroup}
                  className="w-full justify-start"
                />
                <Button
                  href="/dashboard/presenze"
                  label="Approva Presenze"
                  color="success"
                  icon={mdiCalendarCheck}
                  className="w-full justify-start"
                />
                <Button
                  href="/dashboard/ferie"
                  label="Approva Ferie"
                  color="warning"
                  icon={mdiBeach}
                  className="w-full justify-start"
                />
                <Button
                  href="/dashboard/spese"
                  label="Approva Spese"
                  color="info"
                  icon={mdiReceipt}
                  className="w-full justify-start"
                />
              </div>
            </div>
          </CardBox>

          <CardBox className="hover:shadow-lg transition-shadow duration-200">
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Personal Area</h3>
              <div className="space-y-2">
                <Button
                  href="/dashboard/mie-presenze"
                  label="Le Mie Presenze"
                  color="info"
                  icon={mdiCalendarCheck}
                  className="w-full justify-start"
                />
                <Button
                  href="/dashboard/mie-ferie"
                  label="Le Mie Ferie"
                  color="warning"
                  icon={mdiBeach}
                  className="w-full justify-start"
                />
                <Button
                  href="/dashboard/mie-spese"
                  label="Le Mie Spese"
                  color="info"
                  icon={mdiReceipt}
                  className="w-full justify-start"
                />
                <Button
                  href="/dashboard/profilo"
                  label="Profilo Personale"
                  color="info"
                  icon={mdiAccount}
                  className="w-full justify-start"
                />
              </div>
            </div>
          </CardBox>

          <CardBox className="hover:shadow-lg transition-shadow duration-200">
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Reports & Analytics</h3>
              <div className="space-y-2">
                <Button
                  href="/dashboard/reports/team"
                  label="Report Team"
                  color="info"
                  icon={mdiChartLine}
                  className="w-full justify-start"
                />
                <Button
                  href="/dashboard/reports/attendance"
                  label="Report Presenze"
                  color="success"
                  icon={mdiCalendarCheck}
                  className="w-full justify-start"
                />
                <Button
                  href="/dashboard/reports/holidays"
                  label="Report Ferie"
                  color="warning"
                  icon={mdiBeach}
                  className="w-full justify-start"
                />
                <Button
                  href="/dashboard/reports/expenses"
                  label="Report Spese"
                  color="contrast"
                  icon={mdiReceipt}
                  className="w-full justify-start"
                />
              </div>
            </div>
          </CardBox>
        </div>

        {/* Notifications & Alerts */}
        {(dashboardData.stats.pendingAttendances > 0 || dashboardData.stats.pendingHolidays > 0 || dashboardData.stats.pendingExpenses > 0) && (
          <CardBox className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-200 dark:border-blue-700">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Icon path={mdiBell} size={24} className="text-blue-600 dark:text-blue-400 mr-3" />
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Notifiche & Avvisi</h3>
                <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {(dashboardData.stats.pendingAttendances || 0) + (dashboardData.stats.pendingHolidays || 0) + (dashboardData.stats.pendingExpenses || 0)} nuovi
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dashboardData.stats.pendingAttendances > 0 && (
                  <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mr-3">
                          <Icon path={mdiCalendarCheck} size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">Presenze</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {dashboardData.stats.pendingAttendances} richieste in attesa
                          </p>
                        </div>
                      </div>
                      <Button
                        href="/dashboard/presenze"
                        label="Vai"
                        color="success"
                        small
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                )}
                
                {dashboardData.stats.pendingHolidays > 0 && (
                  <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-yellow-100 dark:border-yellow-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mr-3">
                          <Icon path={mdiBeach} size={20} className="text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">Ferie</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {dashboardData.stats.pendingHolidays} richieste in attesa
                          </p>
                        </div>
                      </div>
                      <Button
                        href="/dashboard/ferie"
                        label="Vai"
                        color="warning"
                        small
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                )}
                
                {dashboardData.stats.pendingExpenses > 0 && (
                  <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mr-3">
                          <Icon path={mdiReceipt} size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">Spese</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {dashboardData.stats.pendingExpenses} richieste in attesa
                          </p>
                        </div>
                      </div>
                      <Button
                        href="/dashboard/spese"
                        label="Vai"
                        color="contrast"
                        small
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardBox>
        )}

        {/* Team Members */}
        <CardBox className="hover:shadow-lg transition-shadow duration-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Membri del Team</h3>
              <Button
                href="/dashboard/team"
                label="Gestisci Team"
                color="info"
                small
                icon={mdiAccountGroup}
                className="rounded-lg"
              />
            </div>
            
            <div className="space-y-3">
              {dashboardData.teamMembers.slice(0, 5).map((member: any) => (
                <div
                  key={member.userId as string}
                  className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-white/70 dark:hover:bg-gray-800/50 transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {member.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{member.email}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{member.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Ultimo accesso</p>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {member.lastLoginAt
                          ? new Date(member.lastLoginAt).toLocaleDateString('it-IT')
                          : 'Mai'}
                      </p>
                    </div>
                    
                    <div className={`w-3 h-3 rounded-full ${
                      member.lastLoginAt &&
                      new Date(member.lastLoginAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        ? 'bg-green-400'
                        : 'bg-gray-400'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
            
            {dashboardData.teamMembers.length > 5 && (
              <div className="mt-4 text-center">
                <Button
                  href="/dashboard/team"
                  label={`Visualizza tutti i ${dashboardData.teamMembers.length} membri`}
                  color="info"
                  small
                  outline
                />
              </div>
            )}
          </div>
        </CardBox>

        {/* Recent Activities */}
        {dashboardData.recentActivities.length > 0 && (
          <CardBox className="hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Attività Recenti</h3>
                <Button
                  href="/dashboard/attivita"
                  label="Visualizza tutte"
                  color="info"
                  small
                  outline
                />
              </div>
              
              <div className="space-y-4">
                {dashboardData.recentActivities.slice(0, 5).map((activity: any) => (
                  <div
                    key={activity.id as string}
                    className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-white/70 dark:hover:bg-gray-800/50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'attendance' 
                          ? 'bg-green-100 dark:bg-green-900/30' 
                          : activity.type === 'holiday'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30'
                          : 'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        <Icon
                          path={
                            activity.type === 'attendance' ? mdiCalendarCheck :
                            activity.type === 'holiday' ? mdiBeach :
                            activity.type === 'expense' ? mdiReceipt : mdiCalendarCheck
                          }
                          size={20}
                          className={
                            activity.type === 'attendance' ? 'text-green-600 dark:text-green-400' :
                            activity.type === 'holiday' ? 'text-yellow-600 dark:text-yellow-400' :
                            activity.type === 'expense' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400'
                          }
                        />
                      </div>
                      
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {activity.type === 'attendance' ? 'Presenza' : 
                           activity.type === 'holiday' ? 'Ferie' :
                           activity.type === 'expense' ? 'Spesa' : 'Attività'} - 
                          {activity.month}/{activity.year}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                            activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            activity.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {activity.status === 'approved' ? 'Approvato' :
                             activity.status === 'pending' ? 'In attesa' :
                             activity.status === 'rejected' ? 'Rifiutato' : activity.status}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.userName || 'Utente'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {new Date(activity.createdAt).toLocaleDateString('it-IT')}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.createdAt).toLocaleTimeString('it-IT', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBox>
        )}
      </SectionMain>
    </RoleBasedAccess>
  )
}