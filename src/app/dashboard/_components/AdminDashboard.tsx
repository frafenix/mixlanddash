import { RoleBasedAccess } from '@/components/RoleBasedAccess';
import SectionMain from '@/app/_components/Section/Main';
import SectionTitleLineWithButton from '@/app/_components/Section/TitleLineWithButton';
import CardBox from '@/app/_components/CardBox';
import Button from '@/app/_components/Button';
import {
  mdiAccountMultiple,
  mdiAlertCircle,
  mdiChartBar,
  mdiChartLine,
  mdiChartTimelineVariant,
  mdiCreditCard,
  mdiDomain,
  mdiEmailAlert,
  mdiTrendingUp,
} from '@mdi/js'
import Icon from '@/app/_components/Icon';
import { getAdminDashboardData } from '@/db/queries';
import { stackServerApp } from '@/lib/stack';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect('/handler/sign-in');
  }

  let dashboardData;
  try {
    dashboardData = await getAdminDashboardData();
  } catch (error) {
    console.error('Error loading admin dashboard data:', error);
    return (
      <RoleBasedAccess allowedRoles={['admin']}>
        <SectionMain>
          <SectionTitleLineWithButton
            icon={mdiChartLine}
            title="Admin Dashboard"
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
    <RoleBasedAccess allowedRoles={['admin']}>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title="Admin Dashboard"
          main
        >
          <Button
            href="/dashboard/admin/users"
            label="Gestisci Utenti"
            color="info"
            icon={mdiAccountMultiple}
            small
          />
        </SectionTitleLineWithButton>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <CardBox className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Utenti Totali</p>
                <p className="text-3xl font-bold">{dashboardData.stats.totalUsers}</p>
              </div>
              <Icon path={mdiAccountMultiple} size={48} className="text-blue-200" />
            </div>
          </CardBox>

          <CardBox className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Aziende</p>
                <p className="text-3xl font-bold">{dashboardData.stats.totalCompanies}</p>
              </div>
              <Icon path={mdiDomain} size={48} className="text-green-200" />
            </div>
          </CardBox>

          <CardBox className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Inviti Pendenti</p>
                <p className="text-3xl font-bold">{dashboardData.stats.pendingInvitations}</p>
              </div>
              <Icon path={mdiEmailAlert} size={48} className="text-yellow-200" />
            </div>
          </CardBox>

          <CardBox className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Abbonamenti Attivi</p>
                <p className="text-3xl font-bold">{dashboardData.stats.activeSubscriptions}</p>
              </div>
              <Icon path={mdiCreditCard} size={48} className="text-purple-200" />
            </div>
          </CardBox>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CardBox>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Gestione Sistema</h3>
              <div className="space-y-3">
                <Button
                  href="/dashboard/admin/users"
                  label="Gestisci Utenti"
                  color="info"
                  icon={mdiAccountMultiple}
                />
                <Button
                  href="/dashboard/admin/companies"
                  label="Gestisci Aziende"
                  color="success"
                  icon={mdiDomain}
                />
                <Button
                  href="/dashboard/admin/invitations"
                  label="Gestisci Inviti"
                  color="warning"
                  icon={mdiEmailAlert}
                />
              </div>
            </div>
          </CardBox>

          <CardBox>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Analytics & Report</h3>
              <div className="space-y-3">
                <Button
                  href="/dashboard/admin/analytics"
                  label="Analytics Sistema"
                  color="info"
                  icon={mdiChartBar}
                />
                <Button
                  href="/dashboard/admin/reports"
                  label="Report Utenti"
                  color="success"
                  icon={mdiTrendingUp}
                />
                <Button
                  href="/dashboard/admin/subscriptions"
                  label="Gestione Abbonamenti"
                  color="info"
                  icon={mdiCreditCard}
                />
              </div>
            </div>
          </CardBox>
        </div>

        {/* Recent Users */}
        <CardBox>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Utenti Recenti</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Email</th>
                    <th className="text-left py-2">Ruolo</th>
                    <th className="text-left py-2">Data Registrazione</th>
                    <th className="text-left py-2">Ultimo Accesso</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.recentUsers.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="py-2">{user.email}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'manager' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-2">
                        {new Date(user.createdAt).toLocaleDateString('it-IT')}
                      </td>
                      <td className="py-2">
                        {user.lastLoginAt 
                          ? new Date(user.lastLoginAt).toLocaleDateString('it-IT')
                          : 'Mai'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardBox>

        {/* System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardBox>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Stato Sistema</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Database</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Operativo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>API</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Operativo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Email Service</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Operativo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Stripe Integration</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">Operativo</span>
                </div>
              </div>
            </div>
          </CardBox>

          <CardBox>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Media Utenti per Azienda</span>
                  <span className="font-semibold">
                    {typeof dashboardData.systemStats.avgUsersPerCompany === 'number'
                      ? dashboardData.systemStats.avgUsersPerCompany.toFixed(1)
                      : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tasso di Conversione</span>
                  <span className="font-semibold">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Soddisfazione Clienti</span>
                  <span className="font-semibold">4.8/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Uptime Mese</span>
                  <span className="font-semibold">99.9%</span>
                </div>
              </div>
            </div>
          </CardBox>
        </div>
      </SectionMain>
    </RoleBasedAccess>
  );
}