"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SectionMain from "../../../_components/Section/Main";
import SectionTitleLineWithButton from "../../../_components/Section/TitleLineWithButton";
import CardBox from "../../../_components/CardBox";
import CardBoxWidget from "../../../_components/CardBox/Widget";
import Button from "../../../_components/Button";
import NotificationBar from "../../../_components/NotificationBar";
import { 
  mdiCashMultiple, 
  mdiAccountMultiple,
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
  mdiChartPie,
  mdiClose
} from "@mdi/js";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import PillTag from "../../../_components/PillTag";
import { ColorKey } from "../../../_interfaces";
import Icon from "../../../_components/Icon";

// Tipi per la gestione delle spese
type ExpenseStatus = "pending" | "approved" | "rejected";
type ExpenseType = "trasferta" | "vitto" | "alloggio" | "viaggio" | "altro";

interface TeamMember {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  avatar?: string;
}

interface Expense {
  id: string;
  employee: TeamMember;
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

// Dati mock team
const mockTeamMembers: TeamMember[] = [
  { id: "1", name: "Mario", surname: "Rossi", email: "mario.rossi@company.com", role: "Senior Developer" },
  { id: "2", name: "Luca", surname: "Bianchi", email: "luca.bianchi@company.com", role: "Project Manager" },
  { id: "3", name: "Giulia", surname: "Verdi", email: "giulia.verdi@company.com", role: "UX Designer" },
  { id: "4", name: "Andrea", surname: "Neri", email: "andrea.neri@company.com", role: "Backend Developer" },
  { id: "5", name: "Sara", surname: "Gialli", email: "sara.gialli@company.com", role: "QA Engineer" },
];

// Dati mock per le spese team
const mockTeamExpenses: Expense[] = [
  {
    id: "1",
    employee: mockTeamMembers[0],
    type: "trasferta",
    date: "2025-01-15",
    amount: 150.00,
    currency: "EUR",
    description: "Taxi aeroporto Milano",
    project: "Progetto Alfa",
    client: "Cliente XYZ",
    status: "pending",
    requestDate: "2025-01-16",
  },
  {
    id: "2",
    employee: mockTeamMembers[1],
    type: "vitto",
    date: "2025-01-20",
    amount: 45.50,
    currency: "EUR",
    description: "Pranzo lavoro con cliente",
    project: "Progetto Beta",
    status: "approved",
    requestDate: "2025-01-21",
    approvalDate: "2025-01-22",
    approvedBy: "Admin User",
  },
  {
    id: "3",
    employee: mockTeamMembers[2],
    type: "alloggio",
    date: "2025-01-10",
    amount: 120.00,
    currency: "EUR",
    description: "Hotel Roma 2 notti",
    project: "Progetto Gamma",
    status: "rejected",
    requestDate: "2025-01-11",
    approvalDate: "2025-01-12",
    approvedBy: "Admin User",
    rejectionReason: "Superato budget massimo",
    attachments: ["fattura_hotel.pdf"],
  },
  {
    id: "4",
    employee: mockTeamMembers[3],
    type: "viaggio",
    date: "2025-01-25",
    amount: 250.00,
    currency: "EUR",
    description: "Biglietto treno Roma-Milano",
    project: "Progetto Delta",
    status: "pending",
    requestDate: "2025-01-26",
  },
  {
    id: "5",
    employee: mockTeamMembers[4],
    type: "altro",
    date: "2025-01-18",
    amount: 75.00,
    currency: "EUR",
    description: "Materiali ufficio",
    project: "Progetto Epsilon",
    status: "approved",
    requestDate: "2025-01-19",
    approvalDate: "2025-01-20",
    approvedBy: "Admin User",
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

export default function SpeseTeamPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>(mockTeamExpenses);
  const [filterStatus, setFilterStatus] = useState<ExpenseStatus | "all">("all");
  const [filterEmployee, setFilterEmployee] = useState<string>("all");
  const [filterType, setFilterType] = useState<ExpenseType | "all">("all");
  const [notification, setNotification] = useState<{
    message: string;
    color: ColorKey;
  } | null>(null);

  // Filtro delle spese
  const filteredExpenses = expenses.filter(expense => {
    const statusMatch = filterStatus === "all" || expense.status === filterStatus;
    const employeeMatch = filterEmployee === "all" || expense.employee.id === filterEmployee;
    const typeMatch = filterType === "all" || expense.type === filterType;
    return statusMatch && employeeMatch && typeMatch;
  });

  // Statistiche
  const stats = {
    total: filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    pending: filteredExpenses.filter(e => e.status === "pending").reduce((sum, exp) => sum + exp.amount, 0),
    approved: filteredExpenses.filter(e => e.status === "approved").reduce((sum, exp) => sum + exp.amount, 0),
    rejected: filteredExpenses.filter(e => e.status === "rejected").reduce((sum, exp) => sum + exp.amount, 0),
  };

  const handleApprove = (expenseId: string) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === expenseId 
        ? { ...expense, status: "approved", approvalDate: new Date().toISOString(), approvedBy: "Admin User" }
        : expense
    ));
    setNotification({ message: "Spesa approvata con successo", color: "success" });
  };

  const handleReject = (expenseId: string) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === expenseId 
        ? { ...expense, status: "rejected", approvalDate: new Date().toISOString(), approvedBy: "Admin User" }
        : expense
    ));
    setNotification({ message: "Spesa rifiutata", color: "danger" });
  };

  const handleExport = () => {
    // Simula export dati
    const csvContent = [
      ["Dipendente", "Tipo", "Data", "Importo", "Descrizione", "Progetto", "Stato"],
      ...filteredExpenses.map(exp => [
        `${exp.employee.name} ${exp.employee.surname}`,
        getTypeLabel(exp.type),
        format(new Date(exp.date), "dd/MM/yyyy"),
        exp.amount.toFixed(2),
        exp.description,
        exp.project || "",
        getStatusLabel(exp.status)
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spese_team_${format(new Date(), "yyyy-MM")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SectionTitleLineWithButton
        icon={mdiAccountMultiple}
        title="Note Spese - Team"
        main
      >
        <Button
          icon={mdiDownload}
          label="Export CSV"
          color="info"
          onClick={handleExport}
          className="mt-4 sm:mr-4"
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

      <SectionMain>
        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <CardBoxWidget
            icon={mdiTrendingUp}
            iconColor="info"
            number={stats.total}
            label="Totale Spese"
          />
          <CardBoxWidget
            icon={mdiClockOutline}
            iconColor="warning"
            number={stats.pending}
            label="In Attesa"
          />
          <CardBoxWidget
            icon={mdiCheckCircle}
            iconColor="success"
            number={stats.approved}
            label="Approvate"
          />
          <CardBoxWidget
            icon={mdiClose}
            iconColor="danger"
            number={stats.rejected}
            label="Rifiutate"
          />
        </div>

        {/* Filtri */}
        <CardBox className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dipendente</label>
              <select
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutti i dipendenti</option>
                {mockTeamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.surname}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stato</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ExpenseStatus | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutti gli stati</option>
                <option value="pending">In attesa</option>
                <option value="approved">Approvate</option>
                <option value="rejected">Rifiutate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as ExpenseType | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutti i tipi</option>
                <option value="trasferta">Trasferta</option>
                <option value="vitto">Vitto</option>
                <option value="alloggio">Alloggio</option>
                <option value="viaggio">Viaggio</option>
                <option value="altro">Altro</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                icon={mdiFilter}
                label="Reset"
                color="white"
                onClick={() => {
                  setFilterEmployee("all");
                  setFilterStatus("all");
                  setFilterType("all");
                }}
              />
            </div>
          </div>
        </CardBox>

        {/* Tabella Spese */}
        <CardBox>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Dipendente</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Data</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Importo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Descrizione</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Progetto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Stato</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {expense.employee.name} {expense.employee.surname}
                        </div>
                        <div className="text-sm text-gray-500">{expense.employee.role}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <PillTag color={getTypeColor(expense.type)} label={getTypeLabel(expense.type)} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {format(new Date(expense.date), "dd MMM yyyy", { locale: it })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">
                        {expense.amount.toFixed(2)} {expense.currency}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">{expense.description}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">{expense.project || "-"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <PillTag color={getStatusColor(expense.status)} label={getStatusLabel(expense.status)} />
                    </td>
                    <td className="py-3 px-4">
                      {expense.status === "pending" ? (
                        <div className="flex gap-2">
                          <Button
                          icon={mdiCheckCircle}
                          color="success"
                          onClick={() => handleApprove(expense.id)}
                          className="px-2 py-1"
                        />
                        <Button
                          icon={mdiClose}
                          color="danger"
                          onClick={() => handleReject(expense.id)}
                          className="px-2 py-1"
                        />
                        </div>
                      ) : (
                        <Button
                          icon={mdiEye}
                          color="info"
                          small
                          className="px-2 py-1"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBox>
      </SectionMain>
    </>
  );
}