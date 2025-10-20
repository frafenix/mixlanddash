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
  mdiCalendar,
  mdiCalendarCheck,
  mdiCalendarClock,
  mdiCalendarRemove,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiPlus,
  mdiFilter,
  mdiDownload,
  mdiEye,
  mdiPencil,
  mdiDelete,
  mdiClockOutline
} from "@mdi/js";
import { format, differenceInDays, startOfYear, endOfYear, isWithinInterval, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import PillTag from "../../_components/PillTag";
import { ColorKey } from "../../_interfaces";
import Icon from "../../_components/Icon";
import { useAuth } from "@/lib/auth";

// Tipi per la gestione delle ferie
type LeaveRequestStatus = "pending" | "approved" | "rejected";
type LeaveRequestType = "ferie" | "permesso" | "malattia" | "smart_working";

interface LeaveRequest {
  id: string;
  type: LeaveRequestType;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveRequestStatus;
  requestDate: string;
  approvalDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  notes?: string;
}

interface LeaveBalance {
  totalDays: number;
  usedDays: number;
  remainingDays: number;
  pendingRequests: number;
  approvedRequests: number;
}

// Dati mock per le ferie personali
const mockLeaveBalance: LeaveBalance = {
  totalDays: 26,
  usedDays: 12,
  remainingDays: 14,
  pendingRequests: 2,
  approvedRequests: 10,
};

const mockPersonalLeaveRequests: LeaveRequest[] = [
  {
    id: "1",
    type: "ferie",
    startDate: "2025-07-01",
    endDate: "2025-07-05",
    days: 5,
    reason: "Vacanza estiva",
    status: "approved",
    requestDate: "2025-06-01",
    approvalDate: "2025-06-05",
    approvedBy: "Manager",
  },
  {
    id: "2",
    type: "permesso",
    startDate: "2025-06-15",
    endDate: "2025-06-15",
    days: 1,
    reason: "Appuntamento medico",
    status: "approved",
    requestDate: "2025-06-10",
    approvalDate: "2025-06-12",
    approvedBy: "Manager",
  },
  {
    id: "3",
    type: "ferie",
    startDate: "2025-08-20",
    endDate: "2025-08-25",
    days: 6,
    reason: "Vacanza con famiglia",
    status: "pending",
    requestDate: "2025-07-15",
  },
  {
    id: "4",
    type: "malattia",
    startDate: "2025-05-10",
    endDate: "2025-05-12",
    days: 3,
    reason: "Influenza",
    status: "approved",
    requestDate: "2025-05-10",
    approvalDate: "2025-05-10",
    approvedBy: "Manager",
  },
  {
    id: "5",
    type: "smart_working",
    startDate: "2025-06-20",
    endDate: "2025-06-20",
    days: 1,
    reason: "Lavoro da remoto",
    status: "pending",
    requestDate: "2025-06-18",
  },
];

const getStatusColor = (status: LeaveRequestStatus): ColorKey => {
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

const getStatusLabel = (status: LeaveRequestStatus): string => {
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

const getTypeColor = (type: LeaveRequestType): ColorKey => {
  switch (type) {
    case "ferie":
      return "info";
    case "permesso":
      return "warning";
    case "malattia":
      return "danger";
    case "smart_working":
      return "contrast";
    default:
      return "white";
  }
};

const getTypeLabel = (type: LeaveRequestType): string => {
  switch (type) {
    case "ferie":
      return "Ferie";
    case "permesso":
      return "Permesso";
    case "malattia":
      return "Malattia";
    case "smart_working":
      return "Smart Working";
    default:
      return "Altro";
  }
};

export default function LeMieFeriePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockPersonalLeaveRequests);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>(mockLeaveBalance);
  const [filterStatus, setFilterStatus] = useState<LeaveRequestStatus | "all">("all");
  const [filterType, setFilterType] = useState<LeaveRequestType | "all">("all");
  const [filterYear, setFilterYear] = useState<string>(format(new Date(), "yyyy"));
  const [notification, setNotification] = useState<{
    message: string;
    color: ColorKey;
  } | null>(null);

  // Filtro per anno corrente
  const currentYearRequests = leaveRequests.filter(request => {
    const requestDate = parseISO(request.startDate);
    const yearStart = startOfYear(new Date(parseInt(filterYear), 0, 1));
    const yearEnd = endOfYear(new Date(parseInt(filterYear), 0, 1));
    
    return isWithinInterval(requestDate, { start: yearStart, end: yearEnd });
  });

  // Filtro per stato e tipo
  const filteredRequests = currentYearRequests.filter(request => {
    const statusMatch = filterStatus === "all" || request.status === filterStatus;
    const typeMatch = filterType === "all" || request.type === filterType;
    return statusMatch && typeMatch;
  });

  const handleNewRequest = () => {
    // Simula apertura modale per nuova richiesta
    setNotification({ message: "Funzione di nuova richiesta in arrivo", color: "info" });
  };

  const handleCancelRequest = (requestId: string) => {
    if (window.confirm("Sei sicuro di voler cancellare questa richiesta?")) {
      setLeaveRequests(prev => prev.filter(request => request.id !== requestId));
      setNotification({ message: "Richiesta cancellata con successo", color: "success" });
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Tipo", "Data Inizio", "Data Fine", "Giorni", "Motivo", "Stato", "Data Richiesta"],
      ...filteredRequests.map(request => [
        getTypeLabel(request.type),
        format(new Date(request.startDate), "dd/MM/yyyy"),
        format(new Date(request.endDate), "dd/MM/yyyy"),
        request.days.toString(),
        request.reason,
        getStatusLabel(request.status),
        format(new Date(request.requestDate), "dd/MM/yyyy")
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mie_ferie_${filterYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SectionTitleLineWithButton
        icon={mdiCalendar}
        title="Le Mie Ferie e Permessi"
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
          label="Nuova Richiesta"
          color="success"
          onClick={handleNewRequest}
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
            label="Giorni Totali"
            number={leaveBalance.totalDays}
            icon={mdiCalendar}
            iconColor="info"
          />
          <CardBoxWidget
            label="Giorni Usati"
            number={leaveBalance.usedDays}
            icon={mdiCalendarClock}
            iconColor="warning"
          />
          <CardBoxWidget
            label="Giorni Residui"
            number={leaveBalance.remainingDays}
            icon={mdiCalendarCheck}
            iconColor="success"
          />
          <CardBoxWidget
            label="In Attesa"
            number={leaveBalance.pendingRequests}
            icon={mdiClockOutline}
            iconColor="contrast"
          />
        </div>

        {/* Filtri */}
        <CardBox className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Anno</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stato</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as LeaveRequestStatus | "all")}
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
                onChange={(e) => setFilterType(e.target.value as LeaveRequestType | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutti i tipi</option>
                <option value="ferie">Ferie</option>
                <option value="permesso">Permesso</option>
                <option value="malattia">Malattia</option>
                <option value="smart_working">Smart Working</option>
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
                  setFilterYear(format(new Date(), "yyyy"));
                }}
              />
            </div>
          </div>
        </CardBox>

        {/* Tabella Richieste */}
        <CardBox>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Periodo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Giorni</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Motivo</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Stato</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Data Richiesta</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <PillTag color={getTypeColor(request.type)} label={getTypeLabel(request.type)} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">
                        {format(new Date(request.startDate), "dd MMM yyyy", { locale: it })}
                      </div>
                      <div className="text-sm text-gray-500">
                        al {format(new Date(request.endDate), "dd MMM yyyy", { locale: it })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{request.days} giorni</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">{request.reason}</div>
                    </td>
                    <td className="py-3 px-4">
                      <PillTag color={getStatusColor(request.status)} label={getStatusLabel(request.status)} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        {format(new Date(request.requestDate), "dd MMM yyyy", { locale: it })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {request.status === "pending" && (
                          <Button
                            icon={mdiDelete}
                            color="danger"
                            onClick={() => handleCancelRequest(request.id)}
                            small
                          />
                        )}
                        <Button
                          icon={mdiEye}
                          color="info"
                          small
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