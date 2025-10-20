import { RoleBasedAccess } from '@/components/RoleBasedAccess';
import SectionMain from '@/app/_components/Section/Main';
import SectionTitleLineWithButton from '@/app/_components/Section/TitleLineWithButton';
import CardBox from '@/app/_components/CardBox';
import Button from '@/app/_components/Button';
import { mdiCalendarCheck, mdiBeach, mdiClockOutline, mdiCurrencyEur, mdiChartLine, mdiAccount, mdiAlertCircle } from '@mdi/js';
import Icon from '@/app/_components/Icon';
import { getUserDashboardData, getUserCompany } from '@/db/queries';
import { stackServerApp } from '@/lib/stack';
import { redirect } from 'next/navigation';

export default async function UserDashboard() {
  // Check for development mode and mock authentication
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // Mock dashboard data for testing
    const mockDashboardData = {
      pendingAttendance: 2,
      approvedLeave: 5,
      pendingExpenses: 1,
      totalHours: 160
    };

    return (
      <RoleBasedAccess allowedRoles={['user']}>
        <SectionMain>
          <SectionTitleLineWithButton
            icon={mdiChartLine}
            title="Dashboard Personale (Test Mode)"
            main
          />
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <CardBox>
              <div className="p-6 text-center">
                <Icon path={mdiCalendarCheck} size={32} className="text-blue-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">{mockDashboardData.pendingAttendance}</h3>
                <p className="text-gray-600">Presenze in Attesa</p>
              </div>
            </CardBox>
            
            <CardBox>
              <div className="p-6 text-center">
                <Icon path={mdiBeach} size={32} className="text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">{mockDashboardData.approvedLeave}</h3>
                <p className="text-gray-600">Giorni di Ferie</p>
              </div>
            </CardBox>
            
            <CardBox>
              <div className="p-6 text-center">
                <Icon path={mdiCurrencyEur} size={32} className="text-yellow-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">{mockDashboardData.pendingExpenses}</h3>
                <p className="text-gray-600">Note Spese</p>
              </div>
            </CardBox>
            
            <CardBox>
              <div className="p-6 text-center">
                <Icon path={mdiClockOutline} size={32} className="text-purple-500 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">{mockDashboardData.totalHours}h</h3>
                <p className="text-gray-600">Ore Totali</p>
              </div>
            </CardBox>
          </div>

          {/* Quick Actions */}
          <CardBox>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Azioni Rapide</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  href="/dashboard/le-mie-presenze"
                  label="Le Mie Presenze"
                  color="info"
                  icon={mdiCalendarCheck}
                />
                <Button
                  href="/dashboard/le-mie-ferie"
                  label="Le Mie Ferie"
                  color="success"
                  icon={mdiBeach}
                />
                <Button
                  href="/dashboard/le-mie-spese"
                  label="Le Mie Spese"
                  color="warning"
                  icon={mdiCurrencyEur}
                />
                <Button
                  href="/dashboard/profile"
                  label="Profilo"
                  color="contrast"
                  icon={mdiAccount}
                />
              </div>
            </div>
          </CardBox>
        </SectionMain>
      </RoleBasedAccess>
    );
  }

  const user = await stackServerApp.getUser();
  if (!user) {
    redirect('/handler/sign-in');
  }

  const company = await getUserCompany(user.id);
  if (!company) {
    // Handle case where user has no company
    return <div>Error: Company not found for user.</div>;
  }

  let dashboardData;
  try {
    dashboardData = await getUserDashboardData(user.id, company.id);
  } catch (error) {
    console.error('Error loading user dashboard data:', error);
    return (
      <RoleBasedAccess allowedRoles={['user']}>
        <SectionMain>
          <SectionTitleLineWithButton
            icon={mdiChartLine}
            title="Dashboard Personale"
            main
          />
          <CardBox>
            <div className="p-6 text-center">
              <Icon path={mdiAlertCircle} size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Errore di Caricamento</h3>
              <p className="text-gray-600 mb-4">
                Si è verificato un errore durante il caricamento dei dati del dashboard.
              </p>
              <Button
                onClick={() => window.location.reload()}
                label="Ricarica"
                color="info"
              />
            </div>
          </CardBox>
        </SectionMain>
      </RoleBasedAccess>
    );
  }

  return (
    <RoleBasedAccess allowedRoles={['user']}>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiAccount}
          title="Il Mio Dashboard"
          main
        >
          <Button
            href="/dashboard/profile"
            label="Profilo"
            color="info"
            icon={mdiAccount}
            small
          />
        </SectionTitleLineWithButton>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <CardBox className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Presenze Mese Corrente</p>
                <p className="text-3xl font-bold">{String(dashboardData.currentMonthAttendance?.days ?? 0)}</p>
              </div>
              <Icon path={mdiCalendarCheck} size={48} className="text-blue-200" />
            </div>
          </CardBox>

          <CardBox className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Ore Lavorate</p>
                <p className="text-3xl font-bold">{dashboardData.stats.totalAttendances}</p>
              </div>
              <Icon path={mdiClockOutline} size={48} className="text-green-200" />
            </div>
          </CardBox>

          <CardBox className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Ferie Disponibili</p>
                <p className="text-3xl font-bold">{dashboardData.stats.approvedHolidays}</p>
              </div>
              <Icon path={mdiBeach} size={48} className="text-yellow-200" />
            </div>
          </CardBox>

          <CardBox className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Spese Mese Corrente</p>
                <p className="text-3xl font-bold">€{dashboardData.recentHolidays[0]?.days || '0.00'}</p>
              </div>
              <Icon path={mdiCurrencyEur} size={48} className="text-purple-200" />
            </div>
          </CardBox>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CardBox>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Gestione Presenze</h3>
              <div className="space-y-3">
                <Button
                  href="/dashboard/presenze"
                  label="Registra Presenza"
                  color="info"
                  icon={mdiCalendarCheck}
                />
                <Button
                  href="/dashboard/presenze/history"
                  label="Storico Presenze"
                  color="success"
                  icon={mdiChartLine}
                />
              </div>
            </div>
          </CardBox>

          <CardBox>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Gestione Ferie</h3>
              <div className="space-y-3">
                <Button
                  href="/dashboard/ferie/new"
                  label="Richiedi Ferie"
                  color="warning"
                  icon={mdiBeach}
                />
                <Button
                  href="/dashboard/ferie"
                  label="Stato Ferie"
                  color="info"
                  icon={mdiChartLine}
                />
              </div>
            </div>
          </CardBox>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CardBox>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Gestione Spese</h3>
              <div className="space-y-3">
                <Button
                  href="/dashboard/spese/new"
                  label="Registra Spesa"
                  color="info"
                  icon={mdiCurrencyEur}
                />
                <Button
                  href="/dashboard/spese"
                  label="Storico Spese"
                  color="info"
                  icon={mdiChartLine}
                />
              </div>
            </div>
          </CardBox>

          <CardBox>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Profilo & Impostazioni</h3>
              <div className="space-y-3">
                <Button
                  href="/dashboard/profile"
                  label="Visualizza Profilo"
                  color="info"
                  icon={mdiAccount}
                />
                <Button
                  href="/dashboard/profile/settings"
                  label="Impostazioni"
                  color="success"
                  icon={mdiChartLine}
                />
              </div>
            </div>
          </CardBox>
        </div>

        {/* Pending Requests */}
        {(dashboardData.stats.pendingHolidays > 0) && (
          <CardBox className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Richieste in Attesa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.stats.pendingHolidays > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-yellow-900 dark:text-yellow-100">Ferie</p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          {dashboardData.stats.pendingHolidays} richieste in attesa di approvazione
                        </p>
                      </div>
                      <Button
                        href="/dashboard/ferie"
                        label="Visualizza"
                        color="warning"
                        small
                      />
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </CardBox>
        )}

        {/* Recent Attendances */}
        {dashboardData.recentAttendances.length > 0 && (
          <CardBox className="mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Presenze Recenti</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Data</th>
                      <th className="text-left py-2">Entrata</th>
                      <th className="text-left py-2">Uscita</th>
                      <th className="text-left py-2">Totale Ore</th>
                      <th className="text-left py-2">Stato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentAttendances.map((attendance) => (
                      <tr key={attendance.id} className="border-b">
                        <td className="py-2">
                          {new Date(attendance.createdAt).toLocaleDateString('it-IT')}
                        </td>
                        <td className="py-2">
                          {attendance.month ? new Date(attendance.createdAt).toLocaleTimeString('it-IT') : '-'}
                        </td>
                        <td className="py-2">
                          {attendance.year ? new Date(attendance.updatedAt).toLocaleTimeString('it-IT') : '-'}
                        </td>
                        <td className="py-2">
                          {attendance.days ? `${attendance.days}h` : '-'}
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            attendance.status === 'approved' ? 'bg-green-100 text-green-800' :
                            attendance.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {attendance.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardBox>
        )}

        {/* Recent Expenses */}
        {dashboardData.recentHolidays.length > 0 && (
          <CardBox>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Spese Recenti</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Data</th>
                      <th className="text-left py-2">Descrizione</th>
                      <th className="text-left py-2">Importo</th>
                      <th className="text-left py-2">Stato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentHolidays.map((expense) => (
                      <tr key={expense.id} className="border-b">
                        <td className="py-2">
                          {new Date(expense.startDate).toLocaleDateString('it-IT')}
                        </td>
                        <td className="py-2">{expense.reason}</td>
                        <td className="py-2 font-medium">
                          €{expense.days.toFixed(2)}
                        </td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            expense.status === 'approved' ? 'bg-green-100 text-green-800' :
                            expense.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {expense.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardBox>
        )}
      </SectionMain>
    </RoleBasedAccess>
  );
}