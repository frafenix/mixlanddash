"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SectionMain from "@/app/_components/Section/Main";
import CardBox from "@/app/_components/CardBox";
import Button from "@/app/_components/Button";
import NotificationBar from "@/app/_components/NotificationBar";
import PillTag from "@/app/_components/PillTag";
import { ColorKey } from "@/app/_interfaces";
import { format, isWeekend } from "date-fns";
import { it } from "date-fns/locale";
import { 
  mdiCalendarMonth, 
  mdiCheckCircle, 
  mdiAlertCircle, 
  mdiInformation, 
  mdiAccountMultiple,
  mdiFilter,
  mdiRefresh,
  mdiFileDocument,
  mdiChevronLeft,
  mdiChevronRight,
  mdiEye,
  mdiThumbUp,
  mdiThumbDown,
  mdiDomain,
  mdiClockOutline
} from "@mdi/js";
import Icon from "@/app/_components/Icon";

// Tipi per la gestione delle presenze team
type AttendanceStatus = "pending" | "submitted" | "approved" | "rejected";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "USER";
  teamName: string;
};

type AttendanceRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  teamName: string;
  month: Date;
  totalHours: number;
  workingDays: number;
  mealVouchers: number;
  remoteDays: number;
  officeDays: number;
  status: AttendanceStatus;
  submittedAt?: Date;
  submittedBy?: string;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
};

export default function PresenzeTeamPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [notification, setNotification] = useState<{
    type: "info" | "success" | "danger";
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [filters, setFilters] = useState({
    status: "all",
    team: "all",
    employee: "all"
  });

  // Mock data - in produzione questi verrebbero da API
  const mockTeamMembers: TeamMember[] = [
    { id: "1", name: "Mario Rossi", email: "mario.rossi@company.com", role: "USER", teamName: "Sviluppo" },
    { id: "2", name: "Luca Bianchi", email: "luca.bianchi@company.com", role: "USER", teamName: "Sviluppo" },
    { id: "3", name: "Anna Verdi", email: "anna.verdi@company.com", role: "MANAGER", teamName: "Design" },
    { id: "4", name: "Giulia Neri", email: "giulia.neri@company.com", role: "USER", teamName: "Design" },
    { id: "5", name: "Marco Gialli", email: "marco.gialli@company.com", role: "USER", teamName: "Vendite" },
    { id: "6", name: "Paola Azzurri", email: "paola.azzurri@company.com", role: "ADMIN", teamName: "HR" },
  ];

  // Carica i dati delle presenze team
  useEffect(() => {
    setIsLoading(true);
    
    // Simula caricamento dati
    setTimeout(() => {
      const mockRecords: AttendanceRecord[] = mockTeamMembers.map(member => ({
        id: `att-${member.id}-${format(currentMonth, 'yyyy-MM')}`,
        employeeId: member.id,
        employeeName: member.name,
        employeeEmail: member.email,
        teamName: member.teamName,
        month: currentMonth,
        totalHours: Math.floor(Math.random() * 40) + 140, // 140-180 ore
        workingDays: Math.floor(Math.random() * 5) + 18, // 18-22 giorni
        mealVouchers: Math.floor(Math.random() * 10) + 15, // 15-25 buoni
        remoteDays: Math.floor(Math.random() * 8) + 2, // 2-10 giorni
        officeDays: Math.floor(Math.random() * 15) + 10, // 10-25 giorni
        status: ["pending", "submitted", "approved", "rejected"][Math.floor(Math.random() * 4)] as AttendanceStatus,
        submittedAt: new Date(),
        submittedBy: member.name,
        ...(Math.random() > 0.5 && { approvedAt: new Date(), approvedBy: "Admin User" }),
        ...(Math.random() < 0.2 && { rejectedAt: new Date(), rejectedBy: "Admin User", rejectionReason: "Dati incompleti" })
      }));
      
      setAttendanceRecords(mockRecords);
      setIsLoading(false);
    }, 1000);
  }, [currentMonth]);

  // Applica i filtri
  useEffect(() => {
    let filtered = [...attendanceRecords];
    
    if (filters.status !== "all") {
      filtered = filtered.filter(record => record.status === filters.status);
    }
    
    if (filters.team !== "all") {
      filtered = filtered.filter(record => record.teamName === filters.team);
    }
    
    if (filters.employee !== "all") {
      filtered = filtered.filter(record => record.employeeId === filters.employee);
    }
    
    setFilteredRecords(filtered);
  }, [attendanceRecords, filters]);

  // Gestisci approvazione
  const handleApprove = (recordId: string) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.id === recordId 
          ? { ...record, status: "approved", approvedAt: new Date(), approvedBy: "Current User" }
          : record
      )
    );
    
    setNotification({
      type: "success",
      message: "Presenze approvate con successo"
    });
  };

  // Gestisci rifiuto
  const handleReject = (recordId: string, reason: string) => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.id === recordId 
          ? { ...record, status: "rejected", rejectedAt: new Date(), rejectedBy: "Current User", rejectionReason: reason }
          : record
      )
    );
    
    setNotification({
      type: "danger",
      message: "Presenze rifiutate"
    });
  };

  // Cambia mese
  const changeMonth = (increment: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
  };

  // Ottieni statistiche
  const getStats = () => {
    const total = filteredRecords.length;
    const pending = filteredRecords.filter(r => r.status === "pending").length;
    const submitted = filteredRecords.filter(r => r.status === "submitted").length;
    const approved = filteredRecords.filter(r => r.status === "approved").length;
    const rejected = filteredRecords.filter(r => r.status === "rejected").length;
    
    return { total, pending, submitted, approved, rejected };
  };

  const stats = getStats();
  const teams = [...new Set(attendanceRecords.map(r => r.teamName))];

  if (isLoading) {
    return (
      <SectionMain>
        <CardBox className="p-8 text-center">
          <div className="flex items-center justify-center space-x-3">
            <Icon path={mdiClockOutline} size="24" className="text-blue-500 animate-pulse" />
            <span className="text-lg text-gray-600 dark:text-gray-400">Caricamento presenze team...</span>
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
          icon={notification.type === "success" ? mdiCheckCircle : mdiAlertCircle}
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

      {/* Header con titolo e controlli */}
      <CardBox className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Icon path={mdiAccountMultiple} size="24" className="text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Approvazione Presenze Team
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Controlli mese */}
            <div className="flex items-center space-x-2">
              <Button
                color="info"
                icon={mdiChevronLeft}
                small
                onClick={() => changeMonth(-1)}
                className="!p-2"
              />
              <span className="font-semibold px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {format(currentMonth, "MMMM yyyy", { locale: it })}
              </span>
              <Button
                color="info"
                icon={mdiChevronRight}
                small
                onClick={() => changeMonth(1)}
                className="!p-2"
              />
            </div>
            
            {/* Toggle vista */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                color={viewMode === "cards" ? "info" : "white"}
                small
                onClick={() => setViewMode("cards")}
                label="Card"
                className="!py-1"
              />
              <Button
                color={viewMode === "table" ? "info" : "white"}
                small
                onClick={() => setViewMode("table")}
                label="Tabella"
                className="!py-1"
              />
            </div>
            
            <Button
              color="info"
              icon={mdiRefresh}
              small
              onClick={() => {/* Ricarica dati */}}
              className="!p-2"
            />
          </div>
        </div>
      </CardBox>

      {/* Statistiche */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <CardBox className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Totali</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Icon path={mdiAccountMultiple} size="24" className="text-blue-200" />
          </div>
        </CardBox>
        
        <CardBox className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">In Attesa</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <Icon path={mdiClockOutline} size="24" className="text-yellow-200" />
          </div>
        </CardBox>
        
        <CardBox className="bg-gradient-to-br from-sky-500 to-sky-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sky-100 text-sm">Inviati</p>
              <p className="text-2xl font-bold">{stats.submitted}</p>
            </div>
            <Icon path={mdiFileDocument} size="24" className="text-sky-200" />
          </div>
        </CardBox>
        
        <CardBox className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div>
            <p className="text-green-100 text-sm">Approvati</p>
            <p className="text-2xl font-bold">{stats.approved}</p>
          </div>
          <Icon path={mdiCheckCircle} size="24" className="text-green-200" />
        </CardBox>
        
        <CardBox className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Rifiutati</p>
              <p className="text-2xl font-bold">{stats.rejected}</p>
            </div>
            <Icon path={mdiAlertCircle} size="24" className="text-red-200" />
          </div>
        </CardBox>
      </div>

      {/* Filtri */}
      <CardBox className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Icon path={mdiFilter} size="20" className="text-gray-600 dark:text-gray-400" />
            <span className="font-semibold">Filtri:</span>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="all">Tutti gli stati</option>
            <option value="pending">In attesa</option>
            <option value="submitted">Inviati</option>
            <option value="approved">Approvati</option>
            <option value="rejected">Rifiutati</option>
          </select>
          
          <select
            value={filters.team}
            onChange={(e) => setFilters(prev => ({ ...prev, team: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="all">Tutti i team</option>
            {teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
          
          <select
            value={filters.employee}
            onChange={(e) => setFilters(prev => ({ ...prev, employee: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="all">Tutti i dipendenti</option>
            {attendanceRecords.map(record => (
              <option key={record.employeeId} value={record.employeeId}>
                {record.employeeName}
              </option>
            ))}
          </select>
          
          <Button
            color="white"
            small
            onClick={() => setFilters({ status: "all", team: "all", employee: "all" })}
            label="Pulisci"
          />
        </div>
      </CardBox>

      {/* Contenuto principale */}
      {viewMode === "cards" ? (
        /* Vista Card */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <CardBox key={record.id} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                {/* Header con info dipendente */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-white">
                        {record.employeeName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">{record.employeeName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{record.employeeEmail}</p>
                    </div>
                  </div>
                  <PillTag
                    label={
                      record.status === "pending" ? "In Attesa" :
                      record.status === "submitted" ? "Inviato" :
                      record.status === "approved" ? "Approvato" : "Rifiutato"
                    }
                    color={
                      record.status === "pending" ? "warning" :
                      record.status === "submitted" ? "info" :
                      record.status === "approved" ? "success" : "danger"
                    }
                    small
                  />
                </div>

                {/* Info team */}
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center space-x-2">
                    <Icon path={mdiDomain} size="16" className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{record.teamName}</span>
                  </div>
                </div>

                {/* Statistiche presenze */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{record.totalHours}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Ore Totali</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{record.workingDays}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Giorni Lavorativi</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{record.mealVouchers}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Buoni Pasto</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{record.remoteDays}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Giorni Smart</p>
                  </div>
                </div>

                {/* Dettagli stato */}
                {record.submittedAt && (
                  <div className="mb-3 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      Inviato il {format(record.submittedAt, "dd/MM/yyyy HH:mm")}
                    </p>
                  </div>
                )}

                {/* Azioni */}
                <div className="flex space-x-2">
                  <Button
                    color="info"
                    icon={mdiEye}
                    small
                    onClick={() => setSelectedRecord(record)}
                    label="Dettagli"
                  />
                  {record.status === "submitted" && (
                    <>
                      <Button
                        color="success"
                        icon={mdiThumbUp}
                        small
                        onClick={() => handleApprove(record.id)}
                        label="Approva"
                      />
                      <Button
                        color="danger"
                        icon={mdiThumbDown}
                        small
                        onClick={() => {
                          const reason = prompt("Motivo del rifiuto:");
                          if (reason) handleReject(record.id, reason);
                        }}
                        label="Rifiuta"
                      />
                    </>
                  )}
                </div>
              </div>
            </CardBox>
          ))}
        </div>
      ) : (
        /* Vista Tabella */
        <CardBox>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-slate-800">
                  <th className="px-4 py-3 text-left">Dipendente</th>
                  <th className="px-4 py-3 text-left">Team</th>
                  <th className="px-4 py-3 text-center">Ore</th>
                  <th className="px-4 py-3 text-center">Giorni</th>
                  <th className="px-4 py-3 text-center">Buoni</th>
                  <th className="px-4 py-3 text-center">Smart</th>
                  <th className="px-4 py-3 text-center">Stato</th>
                  <th className="px-4 py-3 text-center">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-900/50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold">{record.employeeName}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{record.employeeEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs">
                        {record.teamName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-semibold">{record.totalHours}</td>
                    <td className="px-4 py-3 text-center">{record.workingDays}</td>
                    <td className="px-4 py-3 text-center">{record.mealVouchers}</td>
                    <td className="px-4 py-3 text-center">{record.remoteDays}</td>
                    <td className="px-4 py-3 text-center">
                      <PillTag
                        label={
                          record.status === "pending" ? "In Attesa" :
                          record.status === "submitted" ? "Inviato" :
                          record.status === "approved" ? "Approvato" : "Rifiutato"
                        }
                        color={
                          record.status === "pending" ? "warning" :
                          record.status === "submitted" ? "info" :
                          record.status === "approved" ? "success" : "danger"
                        }
                        small
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-1 justify-center">
                        <Button
                          color="info"
                          icon={mdiEye}
                          small
                          onClick={() => setSelectedRecord(record)}
                          className="!p-1"
                        />
                        {record.status === "submitted" && (
                          <>
                            <Button
                              color="success"
                              icon={mdiThumbUp}
                              small
                              onClick={() => handleApprove(record.id)}
                              className="!p-1"
                            />
                            <Button
                              color="danger"
                              icon={mdiThumbDown}
                              small
                              onClick={() => {
                                const reason = prompt("Motivo del rifiuto:");
                                if (reason) handleReject(record.id, reason);
                              }}
                              className="!p-1"
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
        </CardBox>
      )}

      {/* Modale dettagli */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <CardBox className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Dettagli Presenze</h2>
                <Button
                  color="white"
                  small
                  onClick={() => setSelectedRecord(null)}
                  label="Chiudi"
                />
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Dipendente</p>
                    <p className="font-semibold">{selectedRecord.employeeName}</p>
                    <p className="text-sm">{selectedRecord.employeeEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Team</p>
                    <p className="font-semibold">{selectedRecord.teamName}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <p className="text-lg font-bold">{selectedRecord.totalHours}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Ore Totali</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <p className="text-lg font-bold">{selectedRecord.workingDays}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Giorni Lavorativi</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <p className="text-lg font-bold">{selectedRecord.mealVouchers}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Buoni Pasto</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
                    <p className="text-lg font-bold">{selectedRecord.remoteDays}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Giorni Smart</p>
                  </div>
                </div>
                
                {selectedRecord.rejectionReason && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400 font-semibold">Motivo Rifiuto</p>
                    <p className="text-red-700 dark:text-red-300">{selectedRecord.rejectionReason}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-2">
                {selectedRecord.status === "submitted" && (
                  <>
                    <Button
                      color="danger"
                      onClick={() => {
                        const reason = prompt("Motivo del rifiuto:");
                        if (reason) {
                          handleReject(selectedRecord.id, reason);
                          setSelectedRecord(null);
                        }
                      }}
                      label="Rifiuta"
                    />
                    <Button
                      color="success"
                      onClick={() => {
                        handleApprove(selectedRecord.id);
                        setSelectedRecord(null);
                      }}
                      label="Approva"
                    />
                  </>
                )}
              </div>
            </div>
          </CardBox>
        </div>
      )}
    </SectionMain>
  );
}