"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SectionMain from "../../_components/Section/Main";
import SectionTitleLineWithButton from "../../_components/Section/TitleLineWithButton";
import CardBox from "../../_components/CardBox";
import ColoredCardBox from "../_components/ColoredCardBox";
import Button from "../../_components/Button";
import NotificationBar from "../../_components/NotificationBar";
import { 
  mdiCashMultiple, 
  mdiPlus, 
  mdiFilter, 
  mdiDownload, 
  mdiCheckCircle,
  mdiAlertCircle,
  mdiCancel,
  mdiEye,
  mdiCurrencyEur,
  mdiTrendingUp,
  mdiClockOutline,
  mdiFileDocument,
  mdiChartPie
} from "@mdi/js";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import PillTag from "../../_components/PillTag";
import { ColorKey } from "../../_interfaces";
import Icon from "../../_components/Icon";
import ExpenseModal from "./_components/ExpenseModal";
import { useAuth } from "@/lib/auth";
import { RoleBasedAccess } from "@/components/RoleBasedAccess";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

// Tipi per la gestione delle spese
type ExpenseStatus = "pending" | "approved" | "rejected";
type ExpenseType = "trasferta" | "vitto" | "alloggio" | "viaggio" | "altro";

interface Expense {
  id: string;
  userId: string;
  userName: string;
  type: ExpenseType;
  date: string;
  amount: number;
  currency: string;
  description: string;
  project?: string;
  client?: string;
  status: ExpenseStatus;
  requestDate: string;
  approvalDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  attachments?: string[];
  category?: string;
}

interface ExpenseSummary {
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
  monthlyTotal: number;
}

// Dati mock per il riepilogo spese
const mockExpenseSummary: ExpenseSummary = {
  totalApproved: 1250.50,
  totalPending: 450.75,
  totalRejected: 200.00,
  monthlyTotal: 1701.25,
};

// Dati mock per le spese
const mockExpenses: Expense[] = [
  {
    id: "1",
    userId: "user1",
    userName: "Mario Rossi",
    type: "trasferta",
    date: "2025-01-15",
    amount: 150.00,
    currency: "EUR",
    description: "Taxi aeroporto Milano",
    project: "Progetto Alfa",
    client: "Cliente XYZ",
    status: "approved",
    requestDate: "2025-01-16",
    approvalDate: "2025-01-17",
    approvedBy: "Giuseppe Bianchi",
    attachments: ["scontrino1.jpg"],
  },
  {
    id: "2",
    userId: "user2",
    userName: "Luca Verdi",
    type: "vitto",
    date: "2025-01-20",
    amount: 45.50,
    currency: "EUR",
    description: "Pranzo lavoro con cliente",
    project: "Progetto Beta",
    status: "pending",
    requestDate: "2025-01-21",
  },
  {
    id: "3",
    userId: "user3",
    userName: "Anna Neri",
    type: "alloggio",
    date: "2025-01-10",
    amount: 120.00,
    currency: "EUR",
    description: "Hotel Roma 2 notti",
    project: "Progetto Gamma",
    status: "rejected",
    requestDate: "2025-01-11",
    approvalDate: "2025-01-12",
    approvedBy: "Giuseppe Bianchi",
    rejectionReason: "Superato budget massimo",
    attachments: ["fattura_hotel.pdf"],
  },
];

const getStatusColor = (status: ExpenseStatus): ColorKey => {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    case "pending":
      return "warning";
    default:
      return "info";
  }
};

const getStatusLabel = (status: ExpenseStatus): string => {
  switch (status) {
    case "approved":
      return "Approvata";
    case "rejected":
      return "Rifiutata";
    case "pending":
      return "In attesa";
    default:
      return "Sconosciuto";
  }
};

const getTypeLabel = (type: ExpenseType): string => {
  switch (type) {
    case "trasferta":
      return "Trasferta";
    case "vitto":
      return "Vitto";
    case "alloggio":
      return "Alloggio";
    case "viaggio":
      return "Viaggio";
    case "altro":
      return "Altro";
    default:
      return "Altro";
  }
};

const getTypeColor = (type: ExpenseType): ColorKey => {
  switch (type) {
    case "trasferta":
      return "info";
    case "vitto":
      return "success";
    case "alloggio":
      return "warning";
    case "viaggio":
      return "danger";
    case "altro":
      return "light";
    default:
      return "light";
  }
};

export default function SpesePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary>(mockExpenseSummary);
  const [filterStatus, setFilterStatus] = useState<ExpenseStatus | "all">("all");
  const [filterType, setFilterType] = useState<ExpenseType | "all">("all");
  const [isNewExpenseModalActive, setIsNewExpenseModalActive] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    color: ColorKey;
  } | null>(null);

  // Filtro delle spese
  const filteredExpenses = expenses.filter(expense => {
    const statusMatch = filterStatus === "all" || expense.status === filterStatus;
    const typeMatch = filterType === "all" || expense.type === filterType;
    return statusMatch && typeMatch;
  });

  // Funzione per calcolare i dati del grafico a torta
  const getChartData = () => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      if (expense.status === 'approved') {
        const typeLabel = getTypeLabel(expense.type);
        acc[typeLabel] = (acc[typeLabel] || 0) + expense.amount;
      }
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Emerald
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Purple
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgba(243, 244, 246, 1)',
        bodyColor: 'rgba(209, 213, 219, 1)',
        borderColor: 'rgba(75, 85, 99, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: €${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

  const handleNewExpense = () => {
    setIsNewExpenseModalActive(true);
  };

  const handleFilterChange = (status: ExpenseStatus | "all") => {
    setFilterStatus(status);
  };

  const handleTypeFilterChange = (type: ExpenseType | "all") => {
    setFilterType(type);
  };

  const handleExpenseSubmit = (expenseData: Partial<Expense>) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      userId: "current-user",
      userName: "Utente Corrente",
      type: expenseData.type || "altro",
      date: expenseData.date || new Date().toISOString().split('T')[0],
      amount: expenseData.amount || 0,
      currency: expenseData.currency || "EUR",
      description: expenseData.description || "",
      project: expenseData.project,
      client: expenseData.client,
      status: "pending",
      requestDate: new Date().toISOString().split('T')[0],
      attachments: expenseData.attachments,
    };

    setExpenses(prev => [newExpense, ...prev]);
    setNotification({
      message: "Nota spesa inviata per approvazione",
      color: "success"
    });
    setIsNewExpenseModalActive(false);
  };

  const handleApproveExpense = (id: string) => {
    setExpenses(expenses.map(expense => 
      expense.id === id 
        ? { ...expense, status: 'approved' as const, approvalDate: new Date().toISOString().split('T')[0], approvedBy: user?.name || 'Manager' }
        : expense
    ));
  };

  const handleRejectExpense = (id: string) => {
    const reason = window.prompt('Motivo del rifiuto (opzionale):');
    if (reason !== null) {
      setExpenses(expenses.map(expense => 
        expense.id === id 
          ? { ...expense, status: 'rejected' as const, rejectionReason: reason || 'Rifiutata' }
          : expense
      ));
    }
  };

  return (
    <>
      <SectionTitleLineWithButton
        icon={mdiCashMultiple}
        title="Note Spese e Trasferte"
        main
      >
        <Button
          icon={mdiPlus}
          label="Nuova nota spese"
          color="success"
          onClick={handleNewExpense}
        />
      </SectionTitleLineWithButton>

      {notification && (
        <NotificationBar
          color={notification.color}
          icon={notification.color === "success" ? mdiCheckCircle : mdiAlertCircle}
        >
          {notification.message}
        </NotificationBar>
      )}

      {isNewExpenseModalActive && (
        <ExpenseModal
          isActive={isNewExpenseModalActive}
          onClose={() => setIsNewExpenseModalActive(false)}
          onSubmit={handleExpenseSubmit}
        />
      )}

      <SectionMain>
        {/* Filtri rapidi */}
        <CardBox className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
              Filtra per stato:
            </span>
            <Button
              label="Tutte"
              color={filterStatus === "all" ? "info" : "lightDark"}
              small
              onClick={() => handleFilterChange("all")}
            />
            <Button
              label="In attesa"
              color={filterStatus === "pending" ? "warning" : "lightDark"}
              small
              onClick={() => handleFilterChange("pending")}
            />
            <Button
              label="Approvate"
              color={filterStatus === "approved" ? "success" : "lightDark"}
              small
              onClick={() => handleFilterChange("approved")}
            />
            <Button
              label="Rifiutate"
              color={filterStatus === "rejected" ? "danger" : "lightDark"}
              small
              onClick={() => handleFilterChange("rejected")}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
              Filtra per tipo:
            </span>
            <Button
              label="Tutti"
              color={filterType === "all" ? "info" : "lightDark"}
              small
              onClick={() => handleTypeFilterChange("all")}
            />
            <Button
              label="Trasferta"
              color={filterType === "trasferta" ? "info" : "lightDark"}
              small
              onClick={() => handleTypeFilterChange("trasferta")}
            />
            <Button
              label="Vitto"
              color={filterType === "vitto" ? "success" : "lightDark"}
              small
              onClick={() => handleTypeFilterChange("vitto")}
            />
            <Button
              label="Alloggio"
              color={filterType === "alloggio" ? "warning" : "lightDark"}
              small
              onClick={() => handleTypeFilterChange("alloggio")}
            />
            <Button
              label="Viaggio"
              color={filterType === "viaggio" ? "danger" : "lightDark"}
              small
              onClick={() => handleTypeFilterChange("viaggio")}
            />
            <Button
              label="Altro"
              color={filterType === "altro" ? "light" : "lightDark"}
              small
              onClick={() => handleTypeFilterChange("altro")}
            />
          </div>
        </CardBox>

        {/* Riepilogo spese */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Card Totale Approvato */}
          <ColoredCardBox
            color="success"
            gradient
            className="animate-fade-in-up stagger-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <Icon path={mdiCheckCircle} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Approvate
                  </h3>
                  <p className="text-sm text-green-200">
                    Totale spese
                  </p>
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              €{expenseSummary.totalApproved.toFixed(2)}
            </div>
          </ColoredCardBox>

          {/* Card In Attesa */}
          <ColoredCardBox
            color="warning"
            gradient
            className="animate-fade-in-up stagger-2"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                  <Icon path={mdiClockOutline} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    In Attesa
                  </h3>
                  <p className="text-sm text-yellow-200">
                    Da approvare
                  </p>
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              €{expenseSummary.totalPending.toFixed(2)}
            </div>
          </ColoredCardBox>

          {/* Card Rifiutate */}
          <ColoredCardBox
            color="danger"
            gradient
            className="animate-fade-in-up stagger-3"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                  <Icon path={mdiCancel} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Rifiutate
                  </h3>
                  <p className="text-sm text-red-200">
                    Non approvate
                  </p>
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              €{expenseSummary.totalRejected.toFixed(2)}
            </div>
          </ColoredCardBox>

          {/* Card Totale Mese */}
          <ColoredCardBox
            color="info"
            gradient
            className="animate-fade-in-up stagger-4"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <Icon path={mdiTrendingUp} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Totale Mese
                  </h3>
                  <p className="text-sm text-blue-200">
                    Tutte le spese
                  </p>
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              €{expenseSummary.monthlyTotal.toFixed(2)}
            </div>
          </ColoredCardBox>
        </div>

        {/* Grafico distribuzione spese per categoria */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <CardBox className="animate-fade-in-up stagger-5 h-96">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Icon path={mdiChartPie} className="w-5 h-5 mr-2" />
                Distribuzione Spese per Categoria
              </h3>
              <div className="h-80">
                <Pie data={getChartData()} options={chartOptions} />
              </div>
            </CardBox>
          </div>
          
          {/* Card aggiuntiva per statistiche */}
          <div>
            <CardBox className="animate-fade-in-up stagger-6 h-96">
              <h3 className="text-lg font-semibold mb-4">Statistiche Rapide</h3>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Spesa media</p>
                  <p className="text-xl font-bold">
                    €{(expenseSummary.totalApproved / Math.max(expenses.filter(e => e.status === 'approved').length, 1)).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Numero spese approvate</p>
                  <p className="text-xl font-bold">
                    {expenses.filter(e => e.status === 'approved').length}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tasso di approvazione</p>
                  <p className="text-xl font-bold">
                    {expenses.length > 0 
                      ? ((expenses.filter(e => e.status === 'approved').length / expenses.length) * 100).toFixed(1)
                      : 0}%
                  </p>
                </div>
              </div>
            </CardBox>
          </div>
        </div>

        {/* Tabella storico spese */}
        <CardBox hasTable className="animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Storico Note Spese</h3>
            <div className="flex space-x-2">
              <Button
                icon={mdiFilter}
                label="Filtri avanzati"
                color="lightDark"
                small
                outline
              />
              <Button
                icon={mdiDownload}
                label="Esporta"
                color="info"
                small
                outline
              />
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Data Spesa</th>
                <th>Tipo</th>
                <th>Importo</th>
                <th>Progetto/Cliente</th>
                <th>Utente</th>
                <th>Stato</th>
                <th>Commento Manager</th>
                <th>Data Richiesta</th>
                <th>Allegati</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">
                    Nessuna nota spesa trovata
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td data-label="Data Spesa">
                      {format(new Date(expense.date), "dd/MM/yyyy", { locale: it })}
                    </td>
                    <td data-label="Tipo">
                      <PillTag
                        label={getTypeLabel(expense.type)}
                        color={getTypeColor(expense.type)}
                        small
                      />
                    </td>
                    <td data-label="Importo">
                      <span className="font-semibold">
                        {expense.currency} {expense.amount.toFixed(2)}
                      </span>
                    </td>
                    <td data-label="Progetto/Cliente">
                      <div>
                        {expense.project && (
                          <div className="text-sm font-medium">{expense.project}</div>
                        )}
                        {expense.client && (
                          <div className="text-xs text-gray-500">{expense.client}</div>
                        )}
                      </div>
                    </td>
                    <td data-label="Utente">
                      <div className="text-sm">{expense.userName}</div>
                    </td>
                    <td data-label="Stato">
                      <PillTag
                        label={getStatusLabel(expense.status)}
                        color={getStatusColor(expense.status)}
                        small
                      />
                    </td>
                    <td data-label="Commento Manager">
                      <span className="text-sm text-gray-600">
                        {expense.rejectionReason || expense.approvedBy || '-'}
                      </span>
                    </td>
                    <td data-label="Data Richiesta">
                      {format(new Date(expense.requestDate), "dd/MM/yyyy", { locale: it })}
                    </td>
                    <td data-label="Allegati">
                      {expense.attachments && expense.attachments.length > 0 ? (
                        <Button
                          icon={mdiFileDocument}
                          label={`${expense.attachments.length} file`}
                          color="info"
                          small
                          outline
                          onClick={() => {/* TODO: Implementa download allegati */}}
                        />
                      ) : (
                        <span className="text-gray-400 text-sm">Nessuno</span>
                      )}
                    </td>
                    <td data-label="Azioni" className="before:hidden lg:w-1 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <Button
                          icon={mdiEye}
                          color="info"
                          small
                          onClick={() => {/* TODO: Implementa visualizzazione dettagli */}}
                        />
                        <RoleBasedAccess allowedRoles={['manager', 'admin']}>
                          {expense.status === "pending" && (
                            <>
                              <Button
                                icon={mdiCheckCircle}
                                color="success"
                                small
                                onClick={() => handleApproveExpense(expense.id)}
                              />
                              <Button
                                icon={mdiCancel}
                                color="danger"
                                small
                                onClick={() => handleRejectExpense(expense.id)}
                              />
                            </>
                          )}
                        </RoleBasedAccess>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardBox>
      </SectionMain>
    </>
  );
}