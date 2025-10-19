"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SectionMain from "../../_components/Section/Main";
import SectionTitleLineWithButton from "../../_components/Section/TitleLineWithButton";
import CardBox from "../../_components/CardBox";
import CardBoxWidget from "../../_components/CardBox/Widget";
import Button from "../../_components/Button";
import NotificationBar from "../../_components/NotificationBar";
import { 
  mdiCurrencyEur,
  mdiFileDocument,
  mdiCheckCircle,
  mdiClockOutline,
  mdiCloseCircle,
  mdiAlertCircle,
  mdiPlus,
  mdiFilter,
  mdiDownload,
  mdiEye,
  mdiPencil,
  mdiDelete,
  mdiReceipt,
  mdiCar,
  mdiTrain,
  mdiFood,
  mdiCellphone,
  mdiLaptop
} from "@mdi/js";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import PillTag from "../../_components/PillTag";
import { ColorKey } from "../../_interfaces";
import Icon from "../../_components/Icon";
import { useAuth } from "@/lib/auth";

// Tipi per la gestione delle spese
type ExpenseStatus = "pending" | "approved" | "rejected";
type ExpenseType = "meals" | "transport" | "accommodation" | "supplies" | "communication" | "other";

interface Expense {
  id: string;
  type: ExpenseType;
  description: string;
  amount: number;
  date: string;
  status: ExpenseStatus;
  receipt?: string;
  project?: string;
  client?: string;
  notes?: string;
  submittedDate: string;
  approvedDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

interface ExpenseSummary {
  totalAmount: number;
  pendingAmount: number;
  approvedAmount: number;
  rejectedAmount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
}

// Dati mock per le spese personali
const mockExpenseSummary: ExpenseSummary = {
  totalAmount: 1250.50,
  pendingAmount: 320.00,
  approvedAmount: 930.50,
  rejectedAmount: 0.00,
  pendingCount: 3,
  approvedCount: 8,
  rejectedCount: 0,
};

const mockPersonalExpenses: Expense[] = [
  {
    id: "1",
    type: "meals",
    description: "Pranzo con cliente",
    amount: 45.00,
    date: "2025-06-15",
    status: "approved",
    submittedDate: "2025-06-16",
    approvedDate: "2025-06-18",
    approvedBy: "Manager",
    project: "Progetto Alpha",
    notes: "Meeting con cliente importante"
  },
  {
    id: "2",
    type: "transport",
    description: "Treno Milano - Roma",
    amount: 89.00,
    date: "2025-06-10",
    status: "approved",
    submittedDate: "2025-06-11",
    approvedDate: "2025-06-13",
    approvedBy: "Manager",
    project: "Progetto Beta",
    notes: "Viaggio per riunione"
  },
  {
    id: "3",
    type: "supplies",
    description: "Materiale ufficio",
    amount: 125.50,
    date: "2025-06-20",
    status: "pending",
    submittedDate: "2025-06-21",
    project: "Progetto Alpha",
    notes: "Carta, penne, accessori"
  },
  {
    id: "4",
    type: "communication",
    description: "Ricarica telefonica",
    amount: 25.00,
    date: "2025-06-25",
    status: "approved",
    submittedDate: "2025-06-26",
    approvedDate: "2025-06-28",
    approvedBy: "Manager",
    project: "Generale",
    notes: "Uso lavorativo"
  },
  {
    id: "5",
    type: "meals",
    description: "Cena trasferta",
    amount: 35.00,
    date: "2025-06-30",
    status: "pending",
    submittedDate: "2025-07-01",
    project: "Progetto Beta",
    notes: "Trasferta a Firenze"
  },
  {
    id: "6",
    type: "accommodation",
    description: "Hotel Firenze",
    amount: 120.00,
    date: "2025-06-30",
    status: "pending",
    submittedDate: "2025-07-01",
    project: "Progetto Beta",
    notes: "1 notte"
  }
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

const getTypeIcon = (type: ExpenseType): string => {
  switch (type) {
    case "meals":
      return mdiFood;
    case "transport":
      return mdiTrain;
    case "accommodation":
      return mdiReceipt;
    case "supplies":
      return mdiLaptop;
    case "communication":
      return mdiCellphone;
    case "other":
      return mdiReceipt;
    default:
      return mdiReceipt;
  }
};

const getTypeLabel = (type: ExpenseType): string => {
  switch (type) {
    case "meals":
      return "Pasti";
    case "transport":
      return "Trasporti";
    case "accommodation":
      return "Alloggio";
    case "supplies":
      return "Forniture";
    case "communication":
      return "Comunicazione";
    case "other":
      return "Altro";
    default:
      return "Altro";
  }
};

export default function LeMieSpesePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>(mockPersonalExpenses);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary>(mockExpenseSummary);
  const [filterStatus, setFilterStatus] = useState<ExpenseStatus | "all">("all");
  const [filterType, setFilterType] = useState<ExpenseType | "all">("all");
  const [filterMonth, setFilterMonth] = useState<string>(format(new Date(), "yyyy-MM"));
  const [notification, setNotification] = useState<{
    message: string;
    color: ColorKey;
  } | null>(null);

  // Filtro per mese corrente
  const currentMonthExpenses = expenses.filter(expense => {
    return expense.date.startsWith(filterMonth);
  });

  // Filtro per stato e tipo
  const filteredExpenses = currentMonthExpenses.filter(expense => {
    const statusMatch = filterStatus === "all" || expense.status === filterStatus;
    const typeMatch = filterType === "all" || expense.type === filterType;
    return statusMatch && typeMatch;
  });

  const handleNewExpense = () => {
    // Simula apertura modale per nuova spesa
    setNotification({ message: "Funzione di nuova spesa in arrivo", color: "info" });
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (window.confirm("Sei sicuro di voler eliminare questa spesa?")) {
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
      setNotification({ message: "Spesa eliminata con successo", color: "success" });
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Tipo", "Descrizione", "Importo", "Data", "Stato", "Progetto", "Note"],
      ...filteredExpenses.map(expense => [
        getTypeLabel(expense.type),
        expense.description,
        expense.amount.toFixed(2),
        format(new Date(expense.date), "dd/MM/yyyy"),
        getStatusLabel(expense.status),
        expense.project || "",
        expense.notes || ""
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mie_spese_${filterMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SectionTitleLineWithButton
        icon={mdiReceipt}
        title="Le Mie Spese"
        main
      >
        <Button
          icon={mdiDownload}
          label="Export CSV"
          color="info"
          onClick={handleExport}
          className="mt-4 sm:mr-4"
        />
        <Button
          icon={mdiPlus}
          label="Nuova Spesa"
          color="success"
          onClick={handleNewExpense}
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
            label="Totale Spese"
            number={expenseSummary.totalAmount}
            numberPrefix="€"
            icon={mdiCurrencyEur}
            iconColor="info"
          />
          <CardBoxWidget
            label="In Attesa"
            number={expenseSummary.pendingAmount}
            numberPrefix="€"
            icon={mdiClockOutline}
            iconColor="warning"
          />
          <CardBoxWidget
            label="Approvate"
            number={expenseSummary.approvedAmount}
            numberPrefix="€"
            icon={mdiCheckCircle}
            iconColor="success"
          />
          <CardBoxWidget
            label="Rifiutate"
            number={expenseSummary.rejectedAmount}
            numberPrefix="€"
            icon={mdiCloseCircle}
            iconColor="danger"
          />
        </div>

        {/* Filtri */}
        <CardBox className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mese</label>
              <input
                type="month"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                <option value="meals">Pasti</option>
                <option value="transport">Trasporti</option>
                <option value="accommodation">Alloggio</option>
                <option value="supplies">Forniture</option>
                <option value="communication">Comunicazione</option>
                <option value="other">Altro</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                icon={mdiFilter}
                label="Reset"
                color="white"
                onClick={() => {
                  setFilterStatus("all");
                  setFilterType("all");
                  setFilterMonth(format(new Date(), "yyyy-MM"));
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Descrizione</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Importo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Data</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Progetto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Stato</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon path={getTypeIcon(expense.type)} size="20" />
                        <span className="text-sm">{getTypeLabel(expense.type)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{expense.description}</div>
                      {expense.notes && (
                        <div className="text-sm text-gray-500">{expense.notes}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">€{expense.amount.toFixed(2)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {format(new Date(expense.date), "dd MMM yyyy", { locale: it })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">{expense.project || "-"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <PillTag color={getStatusColor(expense.status)} label={getStatusLabel(expense.status)} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {expense.status === "pending" && (
                          <>
                            <Button
                              icon={mdiPencil}
                              color="warning"
                              className="px-2 py-1"
                            />
                            <Button
                              icon={mdiDelete}
                              color="danger"
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="px-2 py-1"
                            />
                          </>
                        )}
                        <Button
                          icon={mdiEye}
                          color="info"
                          className="px-2 py-1"
                        />
                      </div>
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