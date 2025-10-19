"use client";

import { useState, useEffect } from "react";
import { 
  mdiCalendarClock, 
  mdiCurrencyEur, 
  mdiClockOutline, 
  mdiHome, 
  mdiOfficeBuilding,
  mdiFlash,
  mdiFileDocument,
  mdiBeach,
  mdiChartPie,
  mdiTrendingUp,
  mdiAccountClock
} from "@mdi/js";
import ColoredCardBox from "./ColoredCardBox";
import CardBox from "../../_components/CardBox";
import Button from "../../_components/Button";
import Icon from "../../_components/Icon";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { useRouter } from "next/navigation";

ChartJS.register(ArcElement, Tooltip, Legend);

// Tipi per le statistiche utente
interface UserStats {
  monthlyHours: number;
  totalLeaveRequests: number;
  totalVacationDays: number;
  remoteDays: number;
  officeDays: number;
  pendingExpenses: number;
  approvedExpenses: number;
}

export default function UserDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<UserStats>({
    monthlyHours: 0,
    totalLeaveRequests: 0,
    totalVacationDays: 0,
    remoteDays: 0,
    officeDays: 0,
    pendingExpenses: 0,
    approvedExpenses: 0,
  });

  // Simuliamo il caricamento delle statistiche
  useEffect(() => {
    // In un'app reale, questi dati verrebbero da API
    const mockStats: UserStats = {
      monthlyHours: 168,
      totalLeaveRequests: 3,
      totalVacationDays: 12,
      remoteDays: 8,
      officeDays: 14,
      pendingExpenses: 2,
      approvedExpenses: 5,
    };
    
    setStats(mockStats);
  }, []);

  // Dati per il grafico remoto vs ufficio
  const workLocationData = {
    labels: ['Giorni in Ufficio', 'Giorni da Remoto'],
    datasets: [
      {
        data: [stats.officeDays, stats.remoteDays],
        backgroundColor: ['#2563eb', '#10b981'],
        borderColor: ['#1d4ed8', '#059669'],
        borderWidth: 2,
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
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} giorni (${percentage}%)`;
          },
        },
      },
    },
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'presenze':
        router.push('/dashboard/presenze');
        break;
      case 'ferie':
        router.push('/dashboard/ferie');
        break;
      case 'spese':
        router.push('/dashboard/spese');
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistiche principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ColoredCardBox
          gradient={false}
          className="bg-blue-600 text-white cursor-pointer hover:bg-blue-700 transition-colors"
          onClick={() => handleQuickAction('presenze')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Ore Lavorate</p>
              <p className="text-3xl font-bold mt-1">{stats.monthlyHours}h</p>
              <p className="text-blue-200 text-xs mt-1">Mese corrente</p>
            </div>
            <Icon path={mdiClockOutline} size={2} className="text-blue-200" />
          </div>
        </ColoredCardBox>

        <ColoredCardBox
          gradient={false}
          className="bg-green-600 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Permessi Richiesti</p>
              <p className="text-3xl font-bold mt-1">{stats.totalLeaveRequests}</p>
              <p className="text-green-200 text-xs mt-1">Totali</p>
            </div>
            <Icon path={mdiAccountClock} size={2} className="text-green-200" />
          </div>
        </ColoredCardBox>

        <ColoredCardBox
          gradient={false}
          className="bg-orange-500 text-white cursor-pointer hover:bg-orange-600 transition-colors"
          onClick={() => handleQuickAction('ferie')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Giorni di Ferie</p>
              <p className="text-3xl font-bold mt-1">{stats.totalVacationDays}</p>
              <p className="text-orange-200 text-xs mt-1">Richiesti</p>
            </div>
            <Icon path={mdiBeach} size={2} className="text-orange-200" />
          </div>
        </ColoredCardBox>

        <ColoredCardBox
          gradient={false}
          className="bg-purple-600 text-white cursor-pointer hover:bg-purple-700 transition-colors"
          onClick={() => handleQuickAction('spese')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Note Spese</p>
              <p className="text-3xl font-bold mt-1">{stats.pendingExpenses + stats.approvedExpenses}</p>
              <p className="text-purple-200 text-xs mt-1">{stats.pendingExpenses} in attesa</p>
            </div>
            <Icon path={mdiCurrencyEur} size={2} className="text-purple-200" />
          </div>
        </ColoredCardBox>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pulsanti rapidi */}
        <CardBox>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Icon path={mdiFlash} size={1} className="mr-2 text-blue-600" />
              Azioni Rapide
            </h3>
            <div className="space-y-3">
              <Button
                label="Invia Foglio Presenze"
                color="info"
                icon={mdiCalendarClock}
                className="w-full justify-start"
                onClick={() => handleQuickAction('presenze')}
              />
              <Button
                label="Richiedi Ferie/Permessi"
                color="success"
                icon={mdiBeach}
                className="w-full justify-start"
                onClick={() => handleQuickAction('ferie')}
              />
              <Button
                label="Invia Nota Spese"
                color="warning"
                icon={mdiFileDocument}
                className="w-full justify-start"
                onClick={() => handleQuickAction('spese')}
              />
            </div>
          </div>
        </CardBox>

        {/* Grafico remoto vs ufficio */}
        <CardBox>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Icon path={mdiChartPie} size={1} className="mr-2 text-green-600" />
              Modalità di Lavoro
            </h3>
            <div className="h-64">
              <Pie data={workLocationData} options={chartOptions} />
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Ultimi 30 giorni: {stats.officeDays + stats.remoteDays} giorni lavorativi
              </p>
            </div>
          </div>
        </CardBox>
      </div>

      {/* Riepilogo attività recenti */}
      <CardBox>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Icon path={mdiTrendingUp} size={1} className="mr-2 text-purple-600" />
            Riepilogo Attività
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Icon path={mdiOfficeBuilding} size={2} className="mx-auto mb-2 text-blue-600" />
              <p className="font-semibold text-blue-800">{stats.officeDays} giorni</p>
              <p className="text-sm text-blue-600">In ufficio</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Icon path={mdiHome} size={2} className="mx-auto mb-2 text-green-600" />
              <p className="font-semibold text-green-800">{stats.remoteDays} giorni</p>
              <p className="text-sm text-green-600">Da remoto</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Icon path={mdiCurrencyEur} size={2} className="mx-auto mb-2 text-purple-600" />
              <p className="font-semibold text-purple-800">{stats.approvedExpenses}</p>
              <p className="text-sm text-purple-600">Spese approvate</p>
            </div>
          </div>
        </div>
      </CardBox>
    </div>
  );
}