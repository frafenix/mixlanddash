import {
  mdiAccountMultiple,
  mdiCartOutline,
  mdiChartTimelineVariant,
  mdiGithub,
  mdiMonitorCellphone,
  mdiCalendarClock,
  mdiCurrencyEur,
  mdiTrendingUp,
  mdiAlertCircle,
} from "@mdi/js";
import Button from "../_components/Button";
import SectionMain from "../_components/Section/Main";
import SectionTitleLineWithButton from "../_components/Section/TitleLineWithButton";
import CardBoxWidget from "../_components/CardBox/Widget";
import CardBoxTransaction from "../_components/CardBox/Transaction";
import { Client, Transaction } from "../_interfaces";
import CardBoxClient from "../_components/CardBox/Client";
import SectionBannerStarOnGitHub from "../_components/Section/Banner/StarOnGitHub";
import CardBox from "../_components/CardBox";
import Icon from "../_components/Icon";
import NotificationBar from "../_components/NotificationBar";
import TableSampleClients from "./_components/Table/SampleClients";
import { getPageTitle } from "../_lib/config";
import { clients, transactions } from "./_lib/sampleData";
import ChartLineSampleComponentBlock from "./_components/ChartLineSample/ComponentBlock";
import ColoredCardBox from "./_components/ColoredCardBox";
import { UserSwitcher } from "@/components/UserSwitcher";
import { RoleBasedAccess } from "@/components/RoleBasedAccess";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { stackServerApp } from "@/lib/stack";
import { db } from "@/lib/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import AdminDashboard from "./_components/AdminDashboard";
import ManagerDashboard from "./_components/ManagerDashboard";
import UserDashboard from "./_components/UserDashboard";

export const metadata: Metadata = {
  title: getPageTitle("Dashboard"),
};

export default async function DashboardPage() {
  // Check for development mode and mock authentication
  const cookieStore = await cookies();
  const roleOverride = cookieStore.get('mock_role')?.value;
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Use mock authentication in development if role override is present
  if (isDevelopment && roleOverride && ['admin','manager','user'].includes(roleOverride)) {
    const userRole = roleOverride as 'admin' | 'manager' | 'user';
    
    // Render role-specific dashboard directly for testing
    if (userRole === 'admin') {
      return <AdminDashboard />;
    } else if (userRole === 'manager') {
      return <ManagerDashboard />;
    } else {
      return <UserDashboard />;
    }
  }

  // Guard: richiede autenticazione e onboarding completato
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/handler/sign-in");
  }

  let isOnboardingCompleted = false;
  try {
    const userCompany = await db.query.companies.findFirst({
      where: eq(companies.userId, user.id),
      columns: {
        onboardingCompleted: true,
      },
    });
    isOnboardingCompleted = !!userCompany?.onboardingCompleted;
  } catch (error) {
    console.error('Errore controllo onboarding in dashboard:', error);
    isOnboardingCompleted = false;
  }

  if (!isOnboardingCompleted) {
    redirect("/onboarding");
  }

  // Get user role from server user metadata
  let userRole = "user";
  if ('metadata' in user && user.metadata) {
    const metadata = user.metadata as { role?: string };
    userRole = (metadata?.role || "user") as 'admin' | 'manager' | 'user';
  }

  // Validate role
  if (!['admin', 'manager', 'user'].includes(userRole)) {
    console.warn('Invalid user role:', userRole);
    return (
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title="Dashboard"
          main
        />
        <CardBox>
          <div className="p-6 text-center">
            <Icon path={mdiTrendingUp} size={48} className="text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ruolo Non Valido</h3>
            <p className="text-gray-600 mb-4">
              Il tuo ruolo utente non è valido. Contatta l'amministratore.
            </p>
          </div>
        </CardBox>
      </SectionMain>
    );
  }

  // Render role-specific dashboard
  if (userRole === 'admin') {
    return <AdminDashboard />;
  } else if (userRole === 'manager') {
    return <ManagerDashboard />;
  } else {
    return <UserDashboard />;
  }
}
