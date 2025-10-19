"use client";

import { useState, useEffect } from "react";
import { 
  mdiAccountGroup, 
  mdiClockOutline, 
  mdiTrendingUp, 
  mdiAlert,
  mdiCheckCircle,
  mdiClockAlert,
  mdiChartPie,
  mdiCalendarClock,
  mdiAccountClock,
  mdiEmailAlert,
  mdiAccountMultiple,
  mdiChartLine,
  mdiCurrencyEur,
  mdiHome,
  mdiOfficeBuilding,
  mdiFood,
  mdiWifi,
  mdiMapMarker,
  mdiProgressCheck,
  mdiCloseCircle,
  mdiFileDocument,
  mdiCog
} from "@mdi/js";
import ColoredCardBox from "./ColoredCardBox";
import CardBox from "../../_components/CardBox";
import Button from "../../_components/Button";
import Icon from "../../_components/Icon";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { useRouter } from "next/navigation";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

// Dati mock per l'Admin Dashboard
const mockAdminData = {
  // Riepilogo team e utenti
  totalUsers: 127,
  activeUsers: 119,
  totalTeams: 8,
  activeTeams: 7,
  newUsersThisMonth: 12,
  
  // Andamento mensile presenze
  monthlyAttendance: {
    submitted: 95,
    approved: 87,
    pending: 8,
    rejected: 2,
    totalExpected: 127
  },
  
  // Stato invii (percentuali completamento)
  submissionStats: {
    completionRate: 74.8, // (95/127)*100
    approvalRate: 91.6,   // (87/95)*100
    onTimeSubmissions: 82,
    lateSubmissions: 13
  },
  
  // KPI buoni pasto e lavoro remoto
  mealVouchers: {
    totalUsed: 1847,
    totalAvailable: 2540,
    utilizationRate: 72.7,
    monthlyTrend: [65, 68, 71, 73, 72.7]
  },
  
  remoteWork: {
    remoteDays: 892,
    officeDays: 1456,
    remoteRate: 38.0,
    monthlyTrend: [35, 37, 39, 38.5, 38.0]
  },
  
  // Grafici
  attendanceChart: {
    approved: 68.5,
    pending: 6.3,
    rejected: 1.6,
    notSubmitted: 23.6
  },
  
  // Trend mensile (ultimi 6 mesi)
  monthlyTrend: {
    labels: ['Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
    attendance: [92, 89, 94, 91, 93, 95],
    remote: [35, 37, 39, 38, 40, 38]
  },
  
  // Alert e notifiche
  alerts: [
    { id: 1, type: "warning", message: "3 utenti non hanno ancora inviato le presenze", priority: "high", date: "2024-12-15" },
    { id: 2, type: "info", message: "Nuovo team 'Marketing Digital' creato", priority: "medium", date: "2024-12-14" },
    { id: 3, type: "error", message: "Sistema buoni pasto: limite mensile raggiunto", priority: "high", date: "2024-12-13" },
    { id: 4, type: "success", message: "Report mensile generato con successo", priority: "low", date: "2024-12-12" }
  ]
};

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(mockAdminData);

  // Funzioni di navigazione rapida
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'team-users':
        router.push('/dashboard/team-users');
        break;
      case 'presenze':
        router.push('/dashboard/presenze');
        break;
      case 'report':
        router.push('/dashboard/report');
        break;
      case 'impostazioni':
        router.push('/dashboard/impostazioni');
        break;
      default:
        break;
    }
  };

  // Funzioni per icone e colori degli alert
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return mdiAlert;
      case 'error': return mdiCloseCircle;
      case 'success': return mdiCheckCircle;
      case 'info': return mdiEmailAlert;
      default: return mdiEmailAlert;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-orange-500';
      case 'error': return 'text-red-500';
      case 'success': return 'text-green-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  // Dati per il grafico a ciambella delle presenze
  const attendanceChartData = {
    labels: ['Approvate', 'In Attesa', 'Rifiutate', 'Non Inviate'],
    datasets: [
      {
        data: [
          stats.attendanceChart.approved, 
          stats.attendanceChart.pending, 
          stats.attendanceChart.rejected,
          stats.attendanceChart.notSubmitted
        ],
        backgroundColor: [
          '#10B981', // Verde per approvate
          '#F59E0B', // Giallo per in attesa
          '#EF4444', // Rosso per rifiutate
          '#6B7280'  // Grigio per non inviate
        ],
        borderWidth: 0,
      },
    ],
  };

  // Dati per il grafico lineare del trend mensile
  const trendChartData = {
    labels: stats.monthlyTrend.labels,
    datasets: [
      {
        label: 'Presenze Inviate (%)',
        data: stats.monthlyTrend.attendance,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Lavoro Remoto (%)',
        data: stats.monthlyTrend.remote,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Andamento Mensile - Ultimi 6 Mesi'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        }
      }
    },
  };

  return (
    <div className="space-y-6">
      {/* Card Riepilogo Principale */}
      <CardBox>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Icon path={mdiAccountGroup} size={1.5} className="mr-3 text-blue-600" />
            Panoramica Amministrativa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Utenti Attivi */}
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
              <Icon path={mdiAccountMultiple} size={2} className="mx-auto mb-2 text-blue-600" />
              <p className="text-3xl font-bold text-blue-800 dark:text-blue-300">{stats.activeUsers}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Utenti Attivi</p>
              <p className="text-xs text-gray-500 mt-1">su {stats.totalUsers} totali</p>
            </div>
            
            {/* Team Attivi */}
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
              <Icon path={mdiAccountGroup} size={2} className="mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold text-green-800 dark:text-green-300">{stats.activeTeams}</p>
              <p className="text-sm text-green-600 dark:text-green-400">Team Attivi</p>
              <p className="text-xs text-gray-500 mt-1">su {stats.totalTeams} totali</p>
            </div>
            
            {/* Tasso Completamento */}
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
              <Icon path={mdiProgressCheck} size={2} className="mx-auto mb-2 text-orange-600" />
              <p className="text-3xl font-bold text-orange-800 dark:text-orange-300">{stats.submissionStats.completionRate}%</p>
              <p className="text-sm text-orange-600 dark:text-orange-400">Completamento</p>
              <p className="text-xs text-gray-500 mt-1">presenze inviate</p>
            </div>
            
            {/* Nuovi Utenti */}
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
              <Icon path={mdiTrendingUp} size={2} className="mx-auto mb-2 text-purple-600" />
              <p className="text-3xl font-bold text-purple-800 dark:text-purple-300">{stats.newUsersThisMonth}</p>
              <p className="text-sm text-purple-600 dark:text-purple-400">Nuovi Utenti</p>
              <p className="text-xs text-gray-500 mt-1">questo mese</p>
            </div>
          </div>
        </div>
      </CardBox>

      {/* Statistiche Presenze e KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Presenze Approvate */}
        <ColoredCardBox
          gradient={false}
          className="bg-green-600 text-white cursor-pointer hover:bg-green-700 transition-colors"
          onClick={() => handleQuickAction('presenze')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Presenze Approvate</p>
              <p className="text-3xl font-bold mt-1">{stats.monthlyAttendance.approved}</p>
              <p className="text-green-200 text-xs mt-1">{stats.submissionStats.approvalRate}% del totale</p>
            </div>
            <Icon path={mdiCheckCircle} size={2} className="text-green-200" />
          </div>
        </ColoredCardBox>

        {/* Presenze in Attesa */}
        <ColoredCardBox
          gradient={false}
          className="bg-orange-500 text-white cursor-pointer hover:bg-orange-600 transition-colors"
          onClick={() => handleQuickAction('presenze')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">In Attesa Approvazione</p>
              <p className="text-3xl font-bold mt-1">{stats.monthlyAttendance.pending}</p>
              <p className="text-orange-200 text-xs mt-1">Da processare</p>
            </div>
            <Icon path={mdiClockAlert} size={2} className="text-orange-200" />
          </div>
        </ColoredCardBox>

        {/* KPI Buoni Pasto */}
        <ColoredCardBox
          gradient={false}
          className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors"
          onClick={() => handleQuickAction('report')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Utilizzo Buoni Pasto</p>
              <p className="text-3xl font-bold mt-1">{stats.mealVouchers.utilizationRate}%</p>
              <p className="text-blue-200 text-xs mt-1">{stats.mealVouchers.totalUsed} su {stats.mealVouchers.totalAvailable}</p>
            </div>
            <Icon path={mdiFood} size={2} className="text-blue-200" />
          </div>
        </ColoredCardBox>

        {/* KPI Lavoro Remoto */}
        <ColoredCardBox
          gradient={false}
          className="bg-purple-600 text-white cursor-pointer hover:bg-purple-700 transition-colors"
          onClick={() => handleQuickAction('report')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Lavoro Remoto</p>
              <p className="text-3xl font-bold mt-1">{stats.remoteWork.remoteRate}%</p>
              <p className="text-purple-200 text-xs mt-1">{stats.remoteWork.remoteDays} giorni remoti</p>
            </div>
            <Icon path={mdiHome} size={2} className="text-purple-200" />
          </div>
        </ColoredCardBox>
      </div>

      {/* Grafici e Analisi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafico Stato Presenze */}
        <CardBox>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Icon path={mdiChartPie} size={1} className="mr-2 text-blue-600" />
              Stato Presenze Mensili
            </h3>
            <div className="h-64">
              <Doughnut data={attendanceChartData} options={chartOptions} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.attendanceChart.approved}%</p>
                <p className="text-sm text-gray-600">Approvate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">{stats.attendanceChart.pending}%</p>
                <p className="text-sm text-gray-600">In Attesa</p>
              </div>
            </div>
          </div>
        </CardBox>

        {/* Grafico Trend Mensile */}
        <CardBox>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Icon path={mdiChartLine} size={1} className="mr-2 text-green-600" />
              Andamento Mensile
            </h3>
            <div className="h-64">
              <Line data={trendChartData} options={lineChartOptions} />
            </div>
          </div>
        </CardBox>
      </div>

      {/* Dettagli KPI e Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dettagli KPI */}
        <CardBox>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Icon path={mdiTrendingUp} size={1} className="mr-2 text-purple-600" />
              Indicatori Chiave (KPI)
            </h3>
            <div className="space-y-4">
              {/* Buoni Pasto */}
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center">
                  <Icon path={mdiFood} size={1} className="mr-3 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Buoni Pasto</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Utilizzo mensile</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">{stats.mealVouchers.utilizationRate}%</p>
                  <p className="text-xs text-gray-500">+2.3% vs mese scorso</p>
                </div>
              </div>

              {/* Lavoro Remoto */}
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center">
                  <Icon path={mdiHome} size={1} className="mr-3 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Smart Working</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Giorni remoti</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">{stats.remoteWork.remoteRate}%</p>
                  <p className="text-xs text-gray-500">-1.5% vs mese scorso</p>
                </div>
              </div>

              {/* Puntualità */}
              <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center">
                  <Icon path={mdiClockOutline} size={1} className="mr-3 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Invii Puntuali</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Presenze in tempo</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-600">{stats.submissionStats.onTimeSubmissions}</p>
                  <p className="text-xs text-gray-500">su {stats.monthlyAttendance.submitted} totali</p>
                </div>
              </div>
            </div>
          </div>
        </CardBox>

        {/* Alert e Notifiche */}
        <CardBox>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Icon path={mdiEmailAlert} size={1} className="mr-2 text-red-600" />
                Alert Sistema
              </h3>
              <Button
                label="Vedi Tutti"
                color="info"
                small
                outline
                onClick={() => handleQuickAction('impostazioni')}
              />
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.alerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <Icon 
                    path={getAlertIcon(alert.type)} 
                    size={1} 
                    className={getAlertColor(alert.type)} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {alert.message}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(alert.date).toLocaleDateString('it-IT')}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                        alert.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardBox>
      </div>

      {/* Azioni Rapide Admin */}
      <CardBox>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Icon path={mdiCog} size={1} className="mr-2 text-gray-600" />
            Azioni Rapide Amministratore
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              label="Gestisci Team & Utenti"
              color="info"
              icon={mdiAccountGroup}
              className="w-full justify-start"
              onClick={() => handleQuickAction('team-users')}
            />
            <Button
              label="Approva Presenze"
              color="success"
              icon={mdiCheckCircle}
              className="w-full justify-start"
              onClick={() => handleQuickAction('presenze')}
            />
            <Button
              label="Genera Report"
              color="warning"
              icon={mdiChartLine}
              className="w-full justify-start"
              onClick={() => handleQuickAction('report')}
            />
            <Button
              label="Configurazioni"
              color="danger"
              icon={mdiCog}
              className="w-full justify-start"
              onClick={() => handleQuickAction('impostazioni')}
            />
          </div>
        </div>
      </CardBox>
    </div>
  );
}