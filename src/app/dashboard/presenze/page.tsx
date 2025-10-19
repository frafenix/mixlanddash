"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SectionMain from "../../_components/Section/Main";
import CardBox from "../../_components/CardBox";
import Button from "../../_components/Button";
import NotificationBar from "../../_components/NotificationBar";
import { 
  mdiCalendarMonth, 
  mdiCheckCircle, 
  mdiAlertCircle, 
  mdiInformation, 
  mdiOfficeBuilding, 
  mdiHome, 
  mdiClockOutline, 
  mdiFlash, 
  mdiContentSave,
  mdiFilterVariant,
  mdiMagnify,
  mdiAccountMultiple,
  mdiCloseCircle,
  mdiCommentText,
  mdiEye,
  mdiDownload,
  mdiRefresh
} from "@mdi/js";
// Simuliamo il contesto utente poiché non esiste il componente UserContext
const useUserContext = () => ({ user: { role: "ADMIN", name: "Admin User" } });
import { format, isWeekend } from "date-fns";
import { it } from "date-fns/locale";
import DailyAttendance from "./_components/DailyAttendance";
import ApprovalActions from "./_components/ApprovalActions";
import QuickSubmitModal from "./_components/QuickSubmitModal";
import PillTag from "../../_components/PillTag";
import { ColorKey } from "../../_interfaces";
import Icon from "../../_components/Icon";
import { RoleBasedAccess } from "@/components/RoleBasedAccess";
// Tipi per la gestione delle presenze
type AttendanceStatus = "pending" | "submitted" | "approved" | "rejected";

interface AttendanceDay {
  date: Date;
  hours: number;
  mealVoucher: boolean;
  workLocation?: 'office' | 'remote';
}

interface MonthlyAttendance {
  month: Date;
  days: AttendanceDay[];
  status: AttendanceStatus;
  submittedBy?: string;
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  userId?: string;
  userName?: string;
  userTeam?: string;
}

// Mock data per la vista Admin
const mockAttendanceRecords: MonthlyAttendance[] = [
  {
    month: new Date(2024, 0, 1), // Gennaio 2024
    days: [],
    status: "submitted",
    submittedBy: "Mario Rossi",
    submittedAt: new Date(2024, 0, 31),
    userId: "1",
    userName: "Mario Rossi",
    userTeam: "Sviluppo Frontend",
  },
  {
    month: new Date(2024, 0, 1),
    days: [],
    status: "approved",
    submittedBy: "Laura Bianchi",
    submittedAt: new Date(2024, 0, 30),
    approvedBy: "Admin User",
    approvedAt: new Date(2024, 1, 2),
    userId: "2",
    userName: "Laura Bianchi",
    userTeam: "Backend & API",
  },
  {
    month: new Date(2024, 0, 1),
    days: [],
    status: "rejected",
    submittedBy: "Giuseppe Verdi",
    submittedAt: new Date(2024, 0, 29),
    rejectedBy: "Admin User",
    rejectedAt: new Date(2024, 1, 1),
    rejectionReason: "Ore non conformi alle policy aziendali",
    userId: "3",
    userName: "Giuseppe Verdi",
    userTeam: "DevOps",
  },
  {
    month: new Date(2024, 0, 1),
    days: [],
    status: "pending",
    userId: "4",
    userName: "Anna Neri",
    userTeam: "Sviluppo Frontend",
  },
];

export default function PresenzePage() {
  const { user } = useUserContext();
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<MonthlyAttendance | null>(null);
  const [notification, setNotification] = useState<{
    type: "info" | "success" | "danger";
    message: string;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isQuickSubmitModalActive, setIsQuickSubmitModalActive] = useState(false);

  // Stati per la vista Admin
  const [attendanceRecords, setAttendanceRecords] = useState<MonthlyAttendance[]>(mockAttendanceRecords);
  const [filteredRecords, setFilteredRecords] = useState<MonthlyAttendance[]>(mockAttendanceRecords);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "all">("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [selectedRecord, setSelectedRecord] = useState<MonthlyAttendance | null>(null);
  const [commentModalActive, setCommentModalActive] = useState(false);
  const [rejectionComment, setRejectionComment] = useState("");

  // Filtri per la vista Admin
  useEffect(() => {
    let filtered = attendanceRecords;

    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.userTeam?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    if (teamFilter !== "all") {
      filtered = filtered.filter(record => record.userTeam === teamFilter);
    }

    setFilteredRecords(filtered);
  }, [attendanceRecords, searchTerm, statusFilter, teamFilter]);

  // Simula il caricamento dei dati dal backend
  useEffect(() => {
    // Controlla se esiste una bozza salvata per il mese corrente
    const draftKey = `attendance_draft_${format(currentMonth, 'yyyy-MM')}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        // Ricostruisce le date dagli oggetti JSON
        const draftWithDates = {
          ...parsedDraft,
          month: new Date(parsedDraft.month),
          days: parsedDraft.days.map((day: any) => ({
            ...day,
            date: new Date(day.date)
          }))
        };
        setAttendance(draftWithDates);
        setNotification({
          type: "info",
          message: "Bozza caricata. Puoi continuare a modificare le presenze.",
        });
        return;
      } catch (error) {
        console.error('Errore nel caricamento della bozza:', error);
      }
    }
    
    // In un'implementazione reale, qui ci sarebbe una chiamata API
    const mockAttendance: MonthlyAttendance = {
      month: currentMonth,
      days: Array.from({ length: 30 }, (_, i) => {
        const date = new Date(currentMonth);
        date.setDate(i + 1);
        return {
          date,
          hours: 0,
          mealVoucher: false,
          workLocation: undefined,
        };
      }),
      status: "pending",
    };
    
    setAttendance(mockAttendance);
  }, [currentMonth]);

  // Gestisce la modifica delle ore per un giorno specifico
  const handleHoursChange = (index: number, hours: number) => {
    if (!attendance) return;
    
    const updatedDays = [...attendance.days];
    updatedDays[index] = {
      ...updatedDays[index],
      hours: Math.min(Math.max(0, hours), 24), // Limita le ore tra 0 e 24
    };
    
    setAttendance({
      ...attendance,
      days: updatedDays,
    });
  };

  // Gestisce la modifica del buono pasto per un giorno specifico
  const handleMealVoucherChange = (index: number, mealVoucher: boolean) => {
    if (!attendance) return;
    
    const updatedDays = [...attendance.days];
    updatedDays[index] = {
      ...updatedDays[index],
      mealVoucher,
    };
    
    setAttendance({
      ...attendance,
      days: updatedDays,
    });
  };

  // Gestisce la modifica della location di lavoro per un giorno specifico
  const handleWorkLocationChange = (index: number, workLocation: 'office' | 'remote' | undefined) => {
    if (!attendance) return;
    
    const updatedDays = [...attendance.days];
    updatedDays[index] = {
      ...updatedDays[index],
      workLocation,
    };
    
    setAttendance({
      ...attendance,
      days: updatedDays,
    });
  };

  // Invia il foglio presenze per approvazione
  const handleSubmit = () => {
    if (!attendance) return;
    
    // Simula l'invio al backend
    setTimeout(() => {
      setAttendance({
        ...attendance,
        status: "submitted",
        submittedBy: user?.name,
        submittedAt: new Date(),
      });
      
      setNotification({
        type: "success",
        message: "Foglio presenze inviato con successo per approvazione",
      });
      
      setIsEditing(false);
    }, 1000);
  };

  // Approva un foglio presenze (solo per Admin e Manager)
  const handleApprove = () => {
    if (!attendance || !["ADMIN", "MANAGER"].includes(user?.role || "")) return;
    
    // Simula l'approvazione
    setTimeout(() => {
      setAttendance({
        ...attendance,
        status: "approved",
        approvedBy: user?.name,
        approvedAt: new Date(),
      });
      
      setNotification({
        type: "success",
        message: "Foglio presenze approvato con successo",
      });
    }, 1000);
  };

  // Rifiuta un foglio presenze (solo per Admin e Manager)
  const handleReject = (reason: string) => {
    if (!attendance || !["ADMIN", "MANAGER"].includes(user?.role || "")) return;
    
    // Simula il rifiuto
    setTimeout(() => {
      setAttendance({
        ...attendance,
        status: "rejected",
        rejectedBy: user?.name,
        rejectedAt: new Date(),
        rejectionReason: reason,
      });
      
      setNotification({
        type: "danger",
        message: "Foglio presenze rifiutato",
      });
    }, 1000);
  };

  // Salva come bozza
  const handleSaveDraft = () => {
    if (!attendance) return;
    
    // Simula il salvataggio come bozza nel localStorage
    const draftKey = `attendance_draft_${format(currentMonth, 'yyyy-MM')}`;
    localStorage.setItem(draftKey, JSON.stringify(attendance));
    
    setNotification({
      type: "info",
      message: "Bozza salvata con successo. Puoi completarla in un secondo momento.",
    });
  };

  // Cambia il mese corrente
  const changeMonth = (increment: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
  };

  if (!attendance) {
    return (
      <SectionMain>
        <CardBox>
          <div className="flex justify-center items-center h-64">
            <p>Caricamento...</p>
          </div>
        </CardBox>
      </SectionMain>
    );
  }

  return (
    <SectionMain>
      {notification && (
        <NotificationBar
          color={notification.type}
          icon={
            notification.type === "success"
              ? mdiCheckCircle
              : notification.type === "danger"
              ? mdiAlertCircle
              : mdiInformation
          }
          button={
            <Button
              color="white"
              small
              onClick={() => setNotification(null)}
              label="Chiudi"
            />
          }
        >
          {notification.message}
        </NotificationBar>
      )}

      {/* Sezione principale per utenti normali - nascosta per Admin */}
      {user?.role !== "ADMIN" && (
        <CardBox className="mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <span className="text-xl font-bold">
                Gestione Presenze - {format(currentMonth, "MMMM yyyy", { locale: it })}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                color="info"
                icon={mdiCalendarMonth}
                small
                onClick={() => changeMonth(-1)}
                label="Mese Precedente"
              />
              <Button
                color="info"
                icon={mdiCalendarMonth}
                small
                onClick={() => changeMonth(1)}
                label="Mese Successivo"
              />
            </div>
          </div>
          
          {/* Sezione per l'invio bulk */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Compilazione Rapida</h2>
              <Button
                icon={mdiFlash}
                color="success"
                small
                label="Invio Rapido"
                onClick={() => setIsQuickSubmitModalActive(true)}
              />
            </div>
            
          </div>

        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="font-semibold">Stato:</span>
            {/* Stato come PillTag */}
            {(() => {
              const statusLabel =
                attendance.status === "pending"
                  ? "In Compilazione"
                  : attendance.status === "submitted"
                  ? "Inviato"
                  : attendance.status === "approved"
                  ? "Approvato"
                  : "Rifiutato";
              const statusColor: ColorKey =
                attendance.status === "pending"
                  ? "warning"
                  : attendance.status === "submitted"
                  ? "info"
                  : attendance.status === "approved"
                  ? "success"
                  : "danger";
              return <PillTag label={statusLabel} color={statusColor} small />;
            })()}
          </div>
          
          {attendance.submittedAt && (
            <p className="text-sm text-gray-600">
              Inviato da {attendance.submittedBy} il {format(attendance.submittedAt, "dd/MM/yyyy HH:mm")}
            </p>
          )}
          
          {attendance.approvedAt && (
            <p className="text-sm text-gray-600">
              Approvato da {attendance.approvedBy} il {format(attendance.approvedAt, "dd/MM/yyyy HH:mm")}
            </p>
          )}
          
          {attendance.rejectedAt && (
            <div>
              <p className="text-sm text-gray-600">
                Rifiutato da {attendance.rejectedBy} il {format(attendance.rejectedAt, "dd/MM/yyyy HH:mm")}
              </p>
              <p className="text-sm text-red-600">
                Motivo: {attendance.rejectionReason}
              </p>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-slate-800">
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Giorno</th>
                <th className="px-4 py-3 text-left">Ore</th>
                <th className="px-4 py-3 text-left">Buono Pasto</th>
                <th className="px-4 py-3 text-left">Modalità</th>
              </tr>
            </thead>
            <tbody>
              {attendance.days.map((day, index) => {
                const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6;
                const isCurrentMonth = day.date.getMonth() === currentMonth.getMonth();
                
                if (!isCurrentMonth) return null;
                
                return (
                  <tr 
                    key={index}
                    className={`border-b dark:border-slate-700 ${isWeekend ? 'bg-gray-50 dark:bg-slate-900/50' : ''}`}
                  >
                    <td className="px-4 py-3">{format(day.date, "dd/MM/yyyy")}</td>
                    <td className="px-4 py-3">{format(day.date, "EEEE", { locale: it })}</td>
                    <td className="px-4 py-3">
                      {isEditing || attendance.status === "pending" ? (
                        <input
                          type="number"
                          min="0"
                          max="24"
                          value={day.hours}
                          onChange={(e) => handleHoursChange(index, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 border rounded dark:bg-slate-800 dark:border-slate-700"
                        />
                      ) : (
                        day.hours
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing || attendance.status === "pending" ? (
                        <Button
                          color={day.mealVoucher ? 'success' : 'white'}
                          small
                          icon={day.mealVoucher ? mdiCheckCircle : mdiAlertCircle}
                          label={day.mealVoucher ? 'Sì' : 'No'}
                          onClick={() => handleMealVoucherChange(index, !day.mealVoucher)}
                        />
                      ) : (
                        day.mealVoucher ? 'Sì' : 'No'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing || attendance.status === "pending" ? (
                        <div className="flex space-x-1">
                          <Button
                            color={day.workLocation === 'office' ? 'info' : 'white'}
                            small
                            icon={mdiOfficeBuilding}
                            label="Ufficio"
                            onClick={() => handleWorkLocationChange(index, 'office')}
                          />
                          <Button
                            color={day.workLocation === 'remote' ? 'success' : 'white'}
                            small
                            icon={mdiHome}
                            label="Remoto"
                            onClick={() => handleWorkLocationChange(index, 'remote')}
                          />
                        </div>
                      ) : (
                        day.workLocation === 'office' ? 'Ufficio' : 
                        day.workLocation === 'remote' ? 'Remoto' : '-'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

          <div className="mt-6 flex justify-end space-x-2">
            {attendance.status === "pending" && (
              <>
                <Button
                  icon={mdiContentSave}
                  color="info"
                  onClick={handleSaveDraft}
                  label="Salva come Bozza"
                  outline
                />
                <Button
                  color="success"
                  onClick={handleSubmit}
                  label="Invia per Approvazione"
                />
              </>
            )}
            
            {attendance.status === "submitted" && ["ADMIN", "MANAGER"].includes(user?.role || "") && (
              <>
                <Button
                  color="danger"
                  onClick={() => handleReject("Dati incompleti")}
                  label="Rifiuta"
                />
                <Button
                  color="success"
                  onClick={handleApprove}
                  label="Approva"
                />
              </>
            )}
            
            {attendance.status === "rejected" && (
              <Button
                color="info"
                onClick={() => {
                  setIsEditing(true);
                  setAttendance({
                    ...attendance,
                    status: "pending",
                  });
                }}
                label="Modifica e Reinvia"
              />
            )}
          </div>
        </CardBox>
      )}

      {/* Funzioni Admin per gestione presenze multiple */}
      {user?.role === "ADMIN" && (
        <>
          {/* Header Admin */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold flex items-center">
              <Icon path={mdiAccountMultiple} size={1.2} className="mr-2" />
              Gestione Presenze - Vista Amministratore
            </h1>
            <p className="text-gray-600 mt-2">
              Visualizza e gestisci le presenze di tutti i dipendenti
            </p>
          </div>

          {/* Statistiche rapide */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <CardBox className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Totale Presenze</p>
                  <p className="text-2xl font-bold">{attendanceRecords.length}</p>
                </div>
                <Icon path={mdiAccountMultiple} size={2} className="text-blue-200" />
              </div>
            </CardBox>
            
            <CardBox className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Approvate</p>
                  <p className="text-2xl font-bold">
                    {attendanceRecords.filter(r => r.status === "approved").length}
                  </p>
                </div>
                <Icon path={mdiCheckCircle} size={2} className="text-green-200" />
              </div>
            </CardBox>
            
            <CardBox className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">In Attesa</p>
                  <p className="text-2xl font-bold">
                    {attendanceRecords.filter(r => r.status === "submitted").length}
                  </p>
                </div>
                <Icon path={mdiClockOutline} size={2} className="text-yellow-200" />
              </div>
            </CardBox>
            
            <CardBox className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Rifiutate</p>
                  <p className="text-2xl font-bold">
                    {attendanceRecords.filter(r => r.status === "rejected").length}
                  </p>
                </div>
                <Icon path={mdiCloseCircle} size={2} className="text-red-200" />
              </div>
            </CardBox>
          </div>

          {/* Filtri e ricerca */}
          <CardBox className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                {/* Ricerca */}
                <div className="relative flex-1 max-w-md">
                  <Icon 
                    path={mdiMagnify} 
                    size={1} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                  <input
                    type="text"
                    placeholder="Cerca per nome o team..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filtro stato */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AttendanceStatus | "all")}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tutti gli stati</option>
                  <option value="pending">Non inviato</option>
                  <option value="submitted">Inviato</option>
                  <option value="approved">Approvato</option>
                  <option value="rejected">Rifiutato</option>
                </select>

                {/* Filtro team */}
                <select
                  value={teamFilter}
                  onChange={(e) => setTeamFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tutti i team</option>
                  <option value="Sviluppo Frontend">Sviluppo Frontend</option>
                  <option value="Backend & API">Backend & API</option>
                  <option value="DevOps">DevOps</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  icon={mdiRefresh}
                  color="info"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setTeamFilter("all");
                  }}
                  label="Reset Filtri"
                  outline
                />
                <Button
                  icon={mdiDownload}
                  color="success"
                  onClick={() => {
                    // Logica per esportazione
                    setNotification({
                      type: "success",
                      message: "Esportazione avviata. Il file sarà disponibile a breve."
                    });
                  }}
                  label="Esporta"
                />
              </div>
            </div>
          </CardBox>

          {/* Tabella presenze Admin */}
          <CardBox>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Gestione Presenze Team ({filteredRecords.length})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Periodo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inviato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record, index) => (
                    <tr key={`${record.userId}-${record.month.getTime()}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {record.userName?.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {record.userName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.userTeam}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(record.month, 'MMMM yyyy', { locale: it })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <PillTag
                          color={
                            record.status === "approved" ? "success" :
                            record.status === "submitted" ? "warning" :
                            record.status === "rejected" ? "danger" : "info"
                          }
                          label={
                            record.status === "approved" ? "Approvato" :
                            record.status === "submitted" ? "In Attesa" :
                            record.status === "rejected" ? "Rifiutato" : "Non Inviato"
                          }
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.submittedAt ? format(record.submittedAt, 'dd/MM/yyyy') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            icon={mdiEye}
                            color="info"
                            small
                            onClick={() => setSelectedRecord(record)}
                            label="Visualizza"
                            outline
                          />
                          {record.status === "submitted" && (
                            <>
                              <Button
                                icon={mdiCheckCircle}
                                color="success"
                                small
                                onClick={() => handleAdminApprove(record)}
                                label="Approva"
                              />
                              <Button
                                icon={mdiCommentText}
                                color="danger"
                                small
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setCommentModalActive(true);
                                }}
                                label="Rifiuta"
                                outline
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRecords.length === 0 && (
              <div className="text-center py-8">
                <Icon path={mdiInformation} size={2} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Nessuna presenza trovata con i filtri selezionati.</p>
              </div>
            )}
          </CardBox>
        </>
      )}

      {/* Modal per commenti di rifiuto */}
      {commentModalActive && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Rifiuta Presenze - {selectedRecord.userName}
            </h3>
            <textarea
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
              placeholder="Inserisci il motivo del rifiuto..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                color="white"
                onClick={() => {
                  setCommentModalActive(false);
                  setRejectionComment("");
                  setSelectedRecord(null);
                }}
                label="Annulla"
              />
              <Button
                color="danger"
                onClick={() => handleAdminReject(selectedRecord, rejectionComment)}
                label="Rifiuta"
                disabled={!rejectionComment.trim()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal dettagli presenze */}
      {selectedRecord && !commentModalActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Dettagli Presenze - {selectedRecord.userName}
              </h3>
              <Button
                icon={mdiCloseCircle}
                color="white"
                onClick={() => setSelectedRecord(null)}
                small
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Team</p>
                <p className="font-medium">{selectedRecord.userTeam}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Periodo</p>
                <p className="font-medium">
                  {format(selectedRecord.month, 'MMMM yyyy', { locale: it })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Stato</p>
                <PillTag
                  color={
                    selectedRecord.status === "approved" ? "success" :
                    selectedRecord.status === "submitted" ? "warning" :
                    selectedRecord.status === "rejected" ? "danger" : "info"
                  }
                  label={
                    selectedRecord.status === "approved" ? "Approvato" :
                    selectedRecord.status === "submitted" ? "In Attesa" :
                    selectedRecord.status === "rejected" ? "Rifiutato" : "Non Inviato"
                  }
                />
              </div>
              <div>
                <p className="text-sm text-gray-600">Data Invio</p>
                <p className="font-medium">
                  {selectedRecord.submittedAt ? format(selectedRecord.submittedAt, 'dd/MM/yyyy HH:mm') : '-'}
                </p>
              </div>
            </div>

            {selectedRecord.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-600 font-medium">Motivo del rifiuto:</p>
                <p className="text-red-700">{selectedRecord.rejectionReason}</p>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              {selectedRecord.status === "submitted" && (
                <>
                  <Button
                    icon={mdiCommentText}
                    color="danger"
                    onClick={() => {
                      setCommentModalActive(true);
                    }}
                    label="Rifiuta"
                    outline
                  />
                  <Button
                    icon={mdiCheckCircle}
                    color="success"
                    onClick={() => {
                      handleAdminApprove(selectedRecord);
                      setSelectedRecord(null);
                    }}
                    label="Approva"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Modale Invio Rapido */}
      <QuickSubmitModal
        isActive={isQuickSubmitModalActive}
        onClose={() => setIsQuickSubmitModalActive(false)}
        onSubmit={(data) => {
          // Applica i dati a tutti i giorni lavorativi del mese
          const updatedDays = attendance.days.map(day => {
            if (!isWeekend(day.date)) {
              return {
                ...day,
                hours: data.hours,
                mealVoucher: data.mealVoucher,
                workLocation: data.workLocation
              };
            }
            return day;
          });
          
          setAttendance({
            ...attendance,
            days: updatedDays
          });
          
          setIsQuickSubmitModalActive(false);
        }}
      />
    </SectionMain>
  );

  // Funzioni Admin per approvazione e rifiuto
  function handleAdminApprove(record: MonthlyAttendance) {
    const updatedRecords = attendanceRecords.map(r => 
      r.userId === record.userId && r.month.getTime() === record.month.getTime()
        ? {
            ...r,
            status: "approved" as AttendanceStatus,
            approvedBy: user?.name,
            approvedAt: new Date()
          }
        : r
    );
    setAttendanceRecords(updatedRecords);
    setNotification({
      type: "success",
      message: `Presenze di ${record.userName} approvate con successo.`
    });
  }

  function handleAdminReject(record: MonthlyAttendance, reason: string) {
    const updatedRecords = attendanceRecords.map(r => 
      r.userId === record.userId && r.month.getTime() === record.month.getTime()
        ? {
            ...r,
            status: "rejected" as AttendanceStatus,
            rejectedBy: user?.name,
            rejectedAt: new Date(),
            rejectionReason: reason
          }
        : r
    );
    setAttendanceRecords(updatedRecords);
    setCommentModalActive(false);
    setRejectionComment("");
    setSelectedRecord(null);
    setNotification({
      type: "success",
      message: `Presenze di ${record.userName} rifiutate.`
    });
  }
}