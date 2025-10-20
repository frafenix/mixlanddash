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
  mdiBeach, 
  mdiAccountMultiple,
  mdiCalendarMonth,
  mdiFilter,
  mdiCheckCircle,
  mdiCloseCircle,
  mdiClockOutline,
  mdiEye,
  mdiDownload,
  mdiCalendarClock,
  mdiAlertCircle
} from "@mdi/js";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import PillTag from "../../../_components/PillTag";
import { ColorKey } from "../../../_interfaces";
import Icon from "../../../_components/Icon";

// Simuliamo il contesto utente
const useUserContext = () => ({ user: { role: "ADMIN", name: "Admin User" } });

// Tipi per la gestione delle ferie
type LeaveRequestStatus = "pending" | "approved" | "rejected";
type LeaveRequestType = "ferie" | "permesso" | "smart_working";

interface TeamMember {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  avatar?: string;
}

interface LeaveRequest {
  id: string;
  employee: TeamMember;
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
  attachments?: string[];
}

// Dati mock team
const mockTeamMembers: TeamMember[] = [
  { id: "1", name: "Mario", surname: "Rossi", email: "mario.rossi@company.com", role: "Senior Developer" },
  { id: "2", name: "Luca", surname: "Bianchi", email: "luca.bianchi@company.com", role: "Project Manager" },
  { id: "3", name: "Giulia", surname: "Verdi", email: "giulia.verdi@company.com", role: "UX Designer" },
  { id: "4", name: "Andrea", surname: "Neri", email: "andrea.neri@company.com", role: "Backend Developer" },
  { id: "5", name: "Sara", surname: "Gialli", email: "sara.gialli@company.com", role: "QA Engineer" },
];

// Dati mock per le richieste team
const mockTeamLeaveRequests: LeaveRequest[] = [
  {
    id: "1",
    employee: mockTeamMembers[0],
    type: "ferie",
    startDate: "2025-02-10",
    endDate: "2025-02-14",
    days: 5,
    reason: "Vacanza invernale",
    status: "pending",
    requestDate: "2025-01-15",
  },
  {
    id: "2",
    employee: mockTeamMembers[1],
    type: "permesso",
    startDate: "2025-01-20",
    endDate: "2025-01-20",
    days: 1,
    reason: "Visita medica",
    status: "approved",
    requestDate: "2025-01-18",
    approvalDate: "2025-01-19",
    approvedBy: "Admin User",
  },
  {
    id: "3",
    employee: mockTeamMembers[2],
    type: "ferie",
    startDate: "2025-03-15",
    endDate: "2025-03-22",
    days: 6,
    reason: "Vacanza di primavera",
    status: "rejected",
    requestDate: "2025-01-10",
    approvalDate: "2025-01-12",
    approvedBy: "Admin User",
    rejectionReason: "Periodo già coperto da altri colleghi",
  },
  {
    id: "4",
    employee: mockTeamMembers[3],
    type: "smart_working",
    startDate: "2025-02-05",
    endDate: "2025-02-05",
    days: 1,
    reason: "Lavoro da remoto",
    status: "approved",
    requestDate: "2025-02-01",
    approvalDate: "2025-02-02",
    approvedBy: "Admin User",
  },
  {
    id: "5",
    employee: mockTeamMembers[4],
    type: "ferie",
    startDate: "2025-04-01",
    endDate: "2025-04-05",
    days: 5,
    reason: "Vacanza pasquale",
    status: "pending",
    requestDate: "2025-03-01",
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

const getTypeLabel = (type: LeaveRequestType): string => {
  switch (type) {
    case "ferie":
      return "Ferie";
    case "permesso":
      return "Permesso";
    case "smart_working":
      return "Smart Working";
    default:
      return "Altro";
  }
};

const getTypeColor = (type: LeaveRequestType): ColorKey => {
  switch (type) {
    case "ferie":
      return "success";
    case "permesso":
      return "info";
    case "smart_working":
      return "warning";
    default:
      return "light";
  }
};

export default function FerieTeamPage() {
  const { user } = useUserContext();
  const router = useRouter();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockTeamLeaveRequests);
  const [filterStatus, setFilterStatus] = useState<LeaveRequestStatus | "all">("all");
  const [filterEmployee, setFilterEmployee] = useState<string>("all");
  const [filterType, setFilterType] = useState<LeaveRequestType | "all">("all");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [notification, setNotification] = useState<{
    message: string;
    color: ColorKey;
  } | null>(null);

  // Filtro delle richieste
  const filteredRequests = leaveRequests.filter(request => {
    const statusMatch = filterStatus === "all" || request.status === filterStatus;
    const employeeMatch = filterEmployee === "all" || request.employee.id === filterEmployee;
    const typeMatch = filterType === "all" || request.type === filterType;
    return statusMatch && employeeMatch && typeMatch;
  });

  // Statistiche
  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter(r => r.status === "pending").length,
    approved: leaveRequests.filter(r => r.status === "approved").length,
    rejected: leaveRequests.filter(r => r.status === "rejected").length,
  };

  // Calendario
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getRequestsForDate = (date: Date) => {
    return leaveRequests.filter(request => {
      const startDate = parseISO(request.startDate);
      const endDate = parseISO(request.endDate);
      return date >= startDate && date <= endDate;
    });
  };

  const handleApprove = (requestId: string) => {
    setLeaveRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { ...request, status: "approved", approvalDate: new Date().toISOString(), approvedBy: user.name }
        : request
    ));
    setNotification({ message: "Richiesta approvata con successo", color: "success" });
  };

  const handleReject = (requestId: string) => {
    setLeaveRequests(prev => prev.map(request => 
      request.id === requestId 
        ? { ...request, status: "rejected", approvalDate: new Date().toISOString(), approvedBy: user.name }
        : request
    ));
    setNotification({ message: "Richiesta rifiutata", color: "danger" });
  };

  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + direction, 1));
  };

  return (
    <>
      <SectionTitleLineWithButton
        icon={mdiAccountMultiple}
        title="Ferie e Permessi - Team"
        main
      >
        <Button
          icon={viewMode === "list" ? mdiCalendarMonth : mdiFilter}
          label={viewMode === "list" ? "Vista Calendario" : "Vista Lista"}
          color="info"
          onClick={() => setViewMode(prev => prev === "list" ? "calendar" : "list")}
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
            icon={mdiFilter}
            iconColor="info"
            number={stats.total}
            label="Richieste Totali"
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
            icon={mdiCloseCircle}
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
                <option value="smart_working">Smart Working</option>
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

        {/* Vista Lista */}
        {viewMode === "list" && (
          <CardBox>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Dipendente</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Periodo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Giorni</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Motivo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Stato</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {request.employee.name} {request.employee.surname}
                          </div>
                          <div className="text-sm text-gray-500">{request.employee.role}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <PillTag color={getTypeColor(request.type)} label={getTypeLabel(request.type)} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm">
                          <div>{format(parseISO(request.startDate), "dd MMM yyyy", { locale: it })}</div>
                          <div>{format(parseISO(request.endDate), "dd MMM yyyy", { locale: it })}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold">{request.days}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-gray-600">{request.reason}</div>
                      </td>
                      <td className="py-3 px-4">
                        <PillTag color={getStatusColor(request.status)} label={getStatusLabel(request.status)} />
                      </td>
                      <td className="py-3 px-4">
                        {request.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button
                              icon={mdiCheckCircle}
                              color="success"
                              onClick={() => handleApprove(request.id)}
                              className="px-2 py-1"
                            />
                            <Button
                              icon={mdiCloseCircle}
                              color="danger"
                              onClick={() => handleReject(request.id)}
                              className="px-2 py-1"
                            />
                          </div>
                        ) : (
                          <Button
                            icon={mdiEye}
                            color="info"
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
        )}

        {/* Vista Calendario */}
        {viewMode === "calendar" && (
          <CardBox>
            <div className="mb-4 flex items-center justify-between">
              <Button
                icon={mdiCalendarClock}
                label={format(currentMonth, "MMMM yyyy", { locale: it })}
                color="white"
                onClick={() => setCurrentMonth(new Date())}
              />
              <div className="flex gap-2">
                <Button
                  icon={mdiCalendarClock}
                  label="Prec"
                  color="white"
                  onClick={() => navigateMonth(-1)}
                />
                <Button
                  icon={mdiCalendarClock}
                  label="Succ"
                  color="white"
                  onClick={() => navigateMonth(1)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"].map(day => (
                <div key={day} className="text-center font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(day => {
                const dayRequests = getRequestsForDate(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      min-h-24 p-2 border border-gray-200 rounded-lg
                      ${!isSameMonth(day, currentMonth) ? "bg-gray-50 text-gray-400" : "bg-white"}
                      ${isToday ? "ring-2 ring-blue-500 bg-blue-50" : ""}
                    `}
                  >
                    <div className={`text-sm font-semibold mb-1 ${isToday ? "text-blue-600" : ""}`}>
                      {format(day, "d")}
                    </div>
                    <div className="space-y-1">
                      {dayRequests.slice(0, 2).map(request => (
                        <div
                          key={request.id}
                          className={`
                            text-xs px-1 py-0.5 rounded truncate
                            ${request.type === "ferie" ? "bg-green-100 text-green-800" : ""}
                            ${request.type === "permesso" ? "bg-blue-100 text-blue-800" : ""}
                            ${request.type === "smart_working" ? "bg-yellow-100 text-yellow-800" : ""}
                          `}
                        >
                          {request.employee.name} - {getTypeLabel(request.type)}
                        </div>
                      ))}
                      {dayRequests.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{dayRequests.length - 2} altri
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBox>
        )}
      </SectionMain>
    </>
  );
}