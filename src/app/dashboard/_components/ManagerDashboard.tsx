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
  mdiEmailAlert
} from "@mdi/js";
import ColoredCardBox from "./ColoredCardBox";
import CardBox from "../../_components/CardBox";
import Button from "../../_components/Button";
import Icon from "../../_components/Icon";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useRouter } from "next/navigation";

ChartJS.register(ArcElement, Tooltip, Legend);

// Dati mock per il Manager Dashboard
const mockManagerData = {
  teamMembers: 8,
  attendanceSubmitted: 6,
  attendancePending: 2,
  punctualityRate: 92.5,
  alerts: [
    { id: 1, type: "sick", user: "Mario Rossi", message: "Malattia - 3 giorni", date: "2024-12-15" },
    { id: 2, type: "vacation", user: "Laura Bianchi", message: "Ferie richieste dal 20/12", date: "2024-12-14" },
    { id: 3, type: "late", user: "Giuseppe Verdi", message: "Ritardo frequente questa settimana", date: "2024-12-13" }
  ],
  attendanceChart: {
    approved: 75,
    pending: 15,
    rejected: 10
  }
};

export default function ManagerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(mockManagerData);

  // Dati per il grafico a ciambella
  const chartData = {
    labels: ['Approvate', 'In Attesa', 'Rifiutate'],
    datasets: [
      {
        data: [stats.attendanceChart.approved, stats.attendanceChart.pending, stats.attendanceChart.rejected],
        backgroundColor: [
          '#10B981', // Verde per approvate
          '#F59E0B', // Giallo per in attesa
          '#EF4444'  // Rosso per rifiutate
        ],
        borderWidth: 0,
      },
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

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'presenze':
        router.push('/dashboard/presenze');
        break;
      case 'team':
        router.push('/dashboard/team');
        break;
      case 'report':
        router.push('/dashboard/report');
        break;
      default:
        break;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'sick':
        return mdiAlert;
      case 'vacation':
        return mdiCalendarClock;
      case 'late':
        return mdiClockAlert;
      default:
        return mdiAlert;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'sick':
        return 'text-red-600';
      case 'vacation':
        return 'text-blue-600';
      case 'late':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Card principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Presenze inviate questo mese */}
        <ColoredCardBox
          gradient={false}
          className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors"
          onClick={() => handleQuickAction('presenze')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Presenze Inviate</p>
              <p className="text-3xl font-bold mt-1">{stats.attendanceSubmitted}/{stats.teamMembers}</p>
              <p className="text-blue-200 text-xs mt-1">Questo mese</p>
            </div>
            <Icon path={mdiClockOutline} size={2} className="text-blue-200" />
          </div>
        </ColoredCardBox>

        {/* Presenze in attesa */}
        <ColoredCardBox
          gradient={false}
          className="bg-orange-500 text-white cursor-pointer hover:bg-orange-600 transition-colors"
          onClick={() => handleQuickAction('presenze')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">In Attesa Approvazione</p>
              <p className="text-3xl font-bold mt-1">{stats.attendancePending}</p>
              <p className="text-orange-200 text-xs mt-1">Da approvare</p>
            </div>
            <Icon path={mdiAccountClock} size={2} className="text-orange-200" />
          </div>
        </ColoredCardBox>

        {/* Tasso di puntualità */}
        <ColoredCardBox
          gradient={false}
          className="bg-green-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Tasso Puntualità</p>
              <p className="text-3xl font-bold mt-1">{stats.punctualityRate}%</p>
              <p className="text-green-200 text-xs mt-1">Team performance</p>
            </div>
            <Icon path={mdiTrendingUp} size={2} className="text-green-200" />
          </div>
        </ColoredCardBox>

        {/* Alert e note */}
        <ColoredCardBox
          gradient={false}
          className="bg-purple-600 text-white cursor-pointer hover:bg-purple-700 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Alert Attivi</p>
              <p className="text-3xl font-bold mt-1">{stats.alerts.length}</p>
              <p className="text-purple-200 text-xs mt-1">Richiede attenzione</p>
            </div>
            <Icon path={mdiAlert} size={2} className="text-purple-200" />
          </div>
        </ColoredCardBox>
      </div>

      {/* Sezione inferiore con grafico e alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafico presenze */}
        <CardBox>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Icon path={mdiChartPie} size={1} className="mr-2 text-blue-600" />
              Stato Presenze Team
            </h3>
            <div className="h-64">
              <Doughnut data={chartData} options={chartOptions} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.attendanceChart.approved}%</p>
                <p className="text-sm text-gray-600">Approvate</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-500">{stats.attendanceChart.pending}%</p>
                <p className="text-sm text-gray-600">In Attesa</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{stats.attendanceChart.rejected}%</p>
                <p className="text-sm text-gray-600">Rifiutate</p>
              </div>
            </div>
          </div>
        </CardBox>

        {/* Alert e note degli utenti */}
        <CardBox>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Icon path={mdiEmailAlert} size={1} className="mr-2 text-red-600" />
                Alert e Note Recenti
              </h3>
              <Button
                label="Vedi Tutti"
                color="info"
                small
                outline
                onClick={() => handleQuickAction('team')}
              />
            </div>
            <div className="space-y-3">
              {stats.alerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <Icon 
                    path={getAlertIcon(alert.type)} 
                    size={1} 
                    className={getAlertColor(alert.type)} 
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {alert.user}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(alert.date).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardBox>
      </div>

      {/* Azioni rapide */}
      <CardBox>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Icon path={mdiAccountGroup} size={1} className="mr-2 text-green-600" />
            Azioni Rapide Manager
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              label="Gestisci Presenze"
              color="info"
              icon={mdiClockOutline}
              className="w-full justify-start"
              onClick={() => handleQuickAction('presenze')}
            />
            <Button
              label="Visualizza Team"
              color="success"
              icon={mdiAccountGroup}
              className="w-full justify-start"
              onClick={() => handleQuickAction('team')}
            />
            <Button
              label="Genera Report"
              color="warning"
              icon={mdiChartPie}
              className="w-full justify-start"
              onClick={() => handleQuickAction('report')}
            />
          </div>
        </div>
      </CardBox>
    </div>
  );
}