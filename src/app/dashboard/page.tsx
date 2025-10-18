import {
  mdiAccountMultiple,
  mdiCartOutline,
  mdiChartTimelineVariant,
  mdiGithub,
  mdiMonitorCellphone,
  mdiCalendarClock,
  mdiCurrencyEur,
  mdiTrendingUp,
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

export const metadata: Metadata = {
  title: getPageTitle("Dashboard"),
};

export default async function DashboardPage() {
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

  const clientsListed = clients.slice(0, 4);

  return (
    <SectionMain>
      {/* User Switcher per testing - solo in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-6">
          <UserSwitcher />
        </div>
      )}

      <SectionTitleLineWithButton
        icon={mdiChartTimelineVariant}
        title="Overview"
        main
      >
      </SectionTitleLineWithButton>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ColoredCardBox
          gradient={false}
          className="animate-fade-in-up stagger-1 bg-[#26b56b] text-white"
        >
          <p className="text-lg font-semibold">
            <Icon path={mdiAccountMultiple} size={1} className="inline-block mr-2" />
            Dipendenti attivi
          </p>
          <p className="text-3xl font-bold mt-2">512</p>
        </ColoredCardBox>

        <ColoredCardBox
          gradient={false}
          className="animate-fade-in-up stagger-2 bg-[#2563eb] text-white"
        >
          <p className="text-lg font-semibold">
            <Icon path={mdiCalendarClock} size={1} className="inline-block mr-2" />
            Ferie pendenti
          </p>
          <p className="text-3xl font-bold mt-2">128</p>
        </ColoredCardBox>

        <ColoredCardBox
          gradient={false}
          className="animate-fade-in-up stagger-3 bg-[#182951] text-white"
        >
          <p className="text-lg font-semibold">
            <Icon path={mdiChartTimelineVariant} size={1} className="inline-block mr-2" />
            Ore straordinario
          </p>
          <p className="text-3xl font-bold mt-2">256</p>
        </ColoredCardBox>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col justify-between">
          {transactions.map((transaction: Transaction) => (
            <CardBoxTransaction
              key={transaction.id}
              transaction={transaction}
            />
          ))}
        </div>
        <div className="flex flex-col justify-between">
          {clientsListed.map((client: Client) => (
            <CardBoxClient key={client.id} client={client} />
          ))}
        </div>
      </div>

      <div className="my-6">
        <SectionBannerStarOnGitHub />
      </div>

      <ChartLineSampleComponentBlock />

      <SectionTitleLineWithButton icon={mdiAccountMultiple} title="Clients" />

      <NotificationBar color="info" icon={mdiMonitorCellphone}>
        <b>Responsive table.</b> Collapses on mobile
      </NotificationBar>

      <CardBox hasTable>
        <TableSampleClients clients={clients} />
      </CardBox>

      {/* Sezioni basate sui ruoli */}
      <RoleBasedAccess allowedRoles={['admin', 'manager']}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
          <CardBox>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Gestione Team</h3>
              <p className="text-gray-600 mb-4">
                Visualizza e gestisci i membri del tuo team, approva le richieste di ferie e monitora le presenze.
              </p>
              <Button 
                label="Gestisci Team" 
                color="info" 
                icon={mdiAccountMultiple}
              />
            </div>
          </CardBox>
          
          <CardBox>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Report Avanzati</h3>
              <p className="text-gray-600 mb-4">
                Accedi a report dettagliati su presenze, produttività e analisi del team.
              </p>
              <Button 
                label="Visualizza Report" 
                color="success" 
                icon={mdiChartTimelineVariant}
              />
            </div>
          </CardBox>
        </div>
      </RoleBasedAccess>

      <RoleBasedAccess allowedRoles={['admin']}>
        <CardBox>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Amministrazione Sistema</h3>
            <p className="text-gray-600 mb-4">
              Gestisci utenti, configurazioni aziendali e impostazioni di sistema.
            </p>
            <div className="flex gap-3">
              <Button 
                label="Gestisci Utenti" 
                color="danger" 
                icon={mdiAccountMultiple}
              />
              <Button 
                label="Configurazioni" 
                color="warning" 
                icon={mdiMonitorCellphone}
                outline
              />
            </div>
          </div>
        </CardBox>
      </RoleBasedAccess>
    </SectionMain>
  );
}
