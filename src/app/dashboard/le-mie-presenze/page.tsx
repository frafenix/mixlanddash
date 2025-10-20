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
  mdiClockOutline, 
  mdiCheckCircle, 
  mdiCalendar,
  mdiCalendarCheck,
  mdiCalendarClock,
  mdiAlertCircle,
  mdiPlus,
  mdiFilter,
  mdiDownload,
  mdiEye,
  mdiPencil,
  mdiDelete
} from "@mdi/js";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import PillTag from "../../_components/PillTag";
import { ColorKey } from "../../_interfaces";
import Icon from "../../_components/Icon";
import { useAuth } from "@/lib/auth";

// Tipi per la gestione delle presenze
type AttendanceStatus = "presente" | "assente" | "ferie" | "permesso" | "malattia" | "smart_working";

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
  notes?: string;
  hoursWorked: number;
  approved: boolean;
  approvedBy?: string;
  approvalDate?: string;
}

interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  vacationDays: number;
  permissionDays: number;
  sickDays: number;
  smartWorkingDays: number;
  totalHours: number;
}

// Dati mock per le presenze personali
const mockPersonalAttendance: AttendanceRecord[] = [
  {
    id: "1",
    date: "2025-10-15",
    checkIn: "09:00",
    checkOut: "18:00",
    status: "presente",
    hoursWorked: 8,
    approved: true,
    approvedBy: "Manager",
    approvalDate: "2025-10-16",
  },
  {
    id: "2",
    date: "2025-10-16",
    checkIn: "09:15",
    checkOut: "18:00",
    status: "presente",
    hoursWorked: 7.75,
    approved: true,
    approvedBy: "Manager",
    approvalDate: "2025-10-17",
  },
  {
    id: "3",
    date: "2025-10-17",
    checkIn: "09:00",
    checkOut: "17:30",
    status: "smart_working",
    hoursWorked: 7.5,
    approved: true,
    approvedBy: "Manager",
    approvalDate: "2025-10-18",
  },
  {
    id: "4",
    date: "2025-10-20",
    checkIn: "",
    checkOut: "",
    status: "ferie",
    hoursWorked: 0,
    approved: true,
    approvedBy: "Manager",
    approvalDate: "2025-10-15",
  },
  {
    id: "5",
    date: "2025-10-21",
    checkIn: "09:00",
    checkOut: "18:00",
    status: "presente",
    hoursWorked: 8,
    approved: false,
  },
  {
    id: "6",
    date: "2025-10-22",
    checkIn: "",
    checkOut: "",
    status: "malattia",
    hoursWorked: 0,
    approved: true,
    approvedBy: "Manager",
    approvalDate: "2025-10-22",
  },
];

const getStatusColor = (status: AttendanceStatus): ColorKey => {
  switch (status) {
    case "presente":
      return "success";
    case "assente":
      return "danger";
    case "ferie":
      return "info";
    case "permesso":
      return "warning";
    case "malattia":
      return "danger";
    case "smart_working":
      return "contrast";
    default:
      return "info";
  }
};

const getStatusLabel = (status: AttendanceStatus): string => {
  switch (status) {
    case "presente":
      return "Presente";
    case "assente":
      return "Assente";
    case "ferie":
      return "Ferie";
    case "permesso":
      return "Permesso";
    case "malattia":
      return "Malattia";
    case "smart_working":
      return "Smart Working";
    default:
      return "Sconosciuto";
  }
};

export default function LeMiePresenzePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(mockPersonalAttendance);
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | "all">("all");
  const [filterMonth, setFilterMonth] = useState<string>(format(new Date(), "yyyy-MM"));
  const [notification, setNotification] = useState<{
    message: string;
    color: ColorKey;
  } | null>(null);

  // Calcolo statistiche
  const stats = attendanceRecords.reduce((acc, record) => {
    acc.totalDays++;
    acc.totalHours += record.hoursWorked;
    
    switch (record.status) {
      case "presente":
        acc.presentDays++;
        break;
      case "assente":
        acc.absentDays++;
        break;
      case "ferie":
        acc.vacationDays++;
        break;
      case "permesso":
        acc.permissionDays++;
        break;
      case "malattia":
        acc.sickDays++;
        break;
      case "smart_working":
        acc.smartWorkingDays++;
        break;
    }
    
    return acc;
  }, {
    totalDays: 0,
    presentDays: 0,
    absentDays: 0,
    vacationDays: 0,
    permissionDays: 0,
    sickDays: 0,
    smartWorkingDays: 0,
    totalHours: 0,
  } as AttendanceSummary);

  // Filtro per mese corrente
  const currentMonthRecords = attendanceRecords.filter(record => {
    const recordDate = parseISO(record.date);
    const monthStart = startOfMonth(new Date(filterMonth));
    const monthEnd = endOfMonth(new Date(filterMonth));
    
    return isWithinInterval(recordDate, { start: monthStart, end: monthEnd });
  });

  // Filtro per stato
  const filteredRecords = filterStatus === "all" 
    ? currentMonthRecords 
    : currentMonthRecords.filter(record => record.status === filterStatus);

  const handleNewCheckIn = () => {
    const now = new Date();
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      date: format(now, "yyyy-MM-dd"),
      checkIn: format(now, "HH:mm"),
      checkOut: "",
      status: "presente",
      hoursWorked: 0,
      approved: false,
    };
    
    setAttendanceRecords(prev => [newRecord, ...prev]);
    setNotification({ message: "Check-in effettuato con successo", color: "success" });
  };

  const handleCheckOut = (recordId: string) => {
    const now = new Date();
    const checkOutTime = format(now, "HH:mm");
    
    setAttendanceRecords(prev => prev.map(record => {
      if (record.id === recordId && !record.checkOut) {
        const checkInDate = new Date(`${record.date} ${record.checkIn}`);
        const checkOutDate = new Date(`${record.date} ${checkOutTime}`);
        const hoursWorked = Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60) * 100) / 100;
        
        return {
          ...record,
          checkOut: checkOutTime,
          hoursWorked: hoursWorked,
        };
      }
      return record;
    }));
    
    setNotification({ message: "Check-out effettuato con successo", color: "success" });
  };

  const handleExport = () => {
    const csvContent = [
      ["Data", "Stato", "Check-in", "Check-out", "Ore Lavorate", "Approvato"],
      ...filteredRecords.map(record => [
        format(new Date(record.date), "dd/MM/yyyy"),
        getStatusLabel(record.status),
        record.checkIn || "",
        record.checkOut || "",
        record.hoursWorked.toString(),
        record.approved ? "Sì" : "No"
      ])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mie_presenze_${filterMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubmitForApproval = (recordId: string) => {
    // In a real app, this would make an API call to submit the timesheet for approval
    // For now, we'll just show a notification and mark it as "submitted" (still not approved)
    setNotification({ 
      message: "Foglio presenze inviato per approvazione al manager", 
      color: "info" 
    });
    
    // In a real system, you might add a "submitted" status or similar
    // For this demo, we'll just show the notification
  };

  return (
    <>
      <SectionTitleLineWithButton
        icon={mdiCalendarCheck}
        title="Le Mie Presenze"
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
          label="Nuovo Check-in"
          color="success"
          onClick={handleNewCheckIn}
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
            label="Giorni Presente"
            number={stats.presentDays}
            icon={mdiCalendarCheck}
            iconColor="success"
          />
          <CardBoxWidget
            label="Giorni Ferie"
            number={stats.vacationDays}
            icon={mdiCalendar}
            iconColor="info"
          />
          <CardBoxWidget
            label="Smart Working"
            number={stats.smartWorkingDays}
            icon={mdiCalendarClock}
            iconColor="contrast"
          />
          <CardBoxWidget
            label="Ore Totali"
            number={stats.totalHours}
            icon={mdiClockOutline}
            iconColor="warning"
          />
        </div>

        {/* Filtri */}
        <CardBox className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                onChange={(e) => setFilterStatus(e.target.value as AttendanceStatus | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tutti gli stati</option>
                <option value="presente">Presente</option>
                <option value="assente">Assente</option>
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
                  setFilterMonth(format(new Date(), "yyyy-MM"));
                }}
              />
            </div>
          </div>
        </CardBox>

        {/* Tabella Presenze */}
        <CardBox>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Data</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Stato</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-in</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Check-out</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ore Lavorate</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Approvato</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">
                        {format(new Date(record.date), "dd MMM yyyy", { locale: it })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(record.date), "EEEE", { locale: it })}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <PillTag color={getStatusColor(record.status)} label={getStatusLabel(record.status)} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900">{record.checkIn || "-"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900">{record.checkOut || "-"}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">
                        {record.hoursWorked > 0 ? `${record.hoursWorked}h` : "-"}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <PillTag 
                        color={record.approved ? "success" : "warning"} 
                        label={record.approved ? "Sì" : "No"} 
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {!record.checkOut && record.checkIn && (
                          <Button
                            icon={mdiClockOutline}
                            color="warning"
                            onClick={() => handleCheckOut(record.id)}
                            className="px-2 py-1"
                          />
                        )}
                        {!record.approved && record.checkOut && (
                          <Button
                            icon={mdiCheckCircle}
                            color="success"
                            onClick={() => handleSubmitForApproval(record.id)}
                            className="px-2 py-1"
                            label="Invia per Approvazione"
                          />
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