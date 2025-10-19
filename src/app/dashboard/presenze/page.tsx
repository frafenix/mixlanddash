"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SectionMain from "../../_components/Section/Main";
import CardBox from "../../_components/CardBox";
import Button from "../../_components/Button";
import NotificationBar from "../../_components/NotificationBar";
import Icon from "@mdi/react";
import { mdiCalendarMonth, mdiCheckCircle, mdiAlertCircle, mdiInformation, mdiOfficeBuilding, mdiHome, mdiClockOutline, mdiFlash, mdiContentSave, mdiChevronLeft, mdiChevronRight, mdiAccountGroup, mdiFileDocument, mdiFilter, mdiRefresh, mdiAccountMultiple } from "@mdi/js";
// Simuliamo il contesto utente poiché non esiste il componente UserContext
const useUserContext = () => ({ user: { role: "ADMIN", name: "Admin User" } });
import { format, isWeekend } from "date-fns";
import { it } from "date-fns/locale";
import DailyAttendance from "./_components/DailyAttendance";
import ApprovalActions from "./_components/ApprovalActions";
import QuickSubmitModal from "./_components/QuickSubmitModal";
import PillTag from "../../_components/PillTag";
import { ColorKey } from "../../_interfaces";
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
}

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
        <CardBox className="p-8 text-center">
          <div className="flex items-center justify-center space-x-3">
            <Icon path={mdiClockOutline} size="24" className="text-blue-500 animate-pulse" />
            <span className="text-lg text-gray-600 dark:text-gray-400">Caricamento presenze...</span>
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

      <CardBox className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <span className="text-xl font-bold">
              Gestione Presenze - {format(currentMonth, "MMMM yyyy", { locale: it })}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              color="contrast"
              icon={mdiFileDocument}
              small
              label="Le Mie Presenze"
              onClick={() => router.push("/dashboard/le-mie-presenze")}
            />
            <Button
              color="info"
              icon={mdiAccountMultiple}
              small
              label="Vista Team"
              onClick={() => router.push("/dashboard/presenze/team")}
            />
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
}