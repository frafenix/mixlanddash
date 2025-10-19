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
  mdiBeach, 
  mdiPlus, 
  mdiCalendarClock, 
  mdiCurrencyEur, 
  mdiClockOutline,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiCancel,
  mdiEye,
  mdiDownload,
  mdiFilter
} from "@mdi/js";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import PillTag from "../../_components/PillTag";
import { ColorKey } from "../../_interfaces";
import Icon from "../../_components/Icon";
import LeaveRequestModal from "../presenze/_components/LeaveRequestModal";

// Simuliamo il contesto utente
const useUserContext = () => ({ user: { role: "ADMIN", name: "Admin User" } });

// Tipi per la gestione delle ferie
type LeaveRequestStatus = "pending" | "approved" | "rejected";
type LeaveRequestType = "ferie" | "permesso" | "smart_working";

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
  attachments?: string[];
}

interface LeaveBalance {
  ferieAvailable: number;
  ferieUsed: number;
  ferieTotal: number;
  permessiAvailable: number;
  permessiUsed: number;
  permessiTotal: number;
  rolloverDays: number;
}

// Dati mock per il saldo ferie
const mockLeaveBalance: LeaveBalance = {
  ferieAvailable: 18,
  ferieUsed: 7,
  ferieTotal: 25,
  permessiAvailable: 32,
  permessiUsed: 8,
  permessiTotal: 40,
  rolloverDays: 3,
};

// Dati mock per le richieste
const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "1",
    type: "ferie",
    startDate: "2025-02-10",
    endDate: "2025-02-14",
    days: 5,
    reason: "Vacanza invernale",
    status: "approved",
    requestDate: "2025-01-15",
    approvalDate: "2025-01-16",
    approvedBy: "Mario Rossi",
  },
  {
    id: "2",
    type: "permesso",
    startDate: "2025-01-20",
    endDate: "2025-01-20",
    days: 1,
    reason: "Visita medica",
    status: "pending",
    requestDate: "2025-01-18",
  },
  {
    id: "3",
    type: "ferie",
    startDate: "2025-03-15",
    endDate: "2025-03-22",
    days: 6,
    reason: "Vacanza di primavera",
    status: "rejected",
    requestDate: "2025-01-10",
    approvalDate: "2025-01-12",
    approvedBy: "Mario Rossi",
    rejectionReason: "Periodo già coperto da altri colleghi",
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

export default function FeriePage() {
  const { user } = useUserContext();
  const router = useRouter();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>(mockLeaveBalance);
  const [filterStatus, setFilterStatus] = useState<LeaveRequestStatus | "all">("all");
  const [isNewRequestModalActive, setIsNewRequestModalActive] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    color: ColorKey;
  } | null>(null);

  // Filtro delle richieste
  const filteredRequests = leaveRequests.filter(request => 
    filterStatus === "all" || request.status === filterStatus
  );

  const handleNewRequest = () => {
    setIsNewRequestModalActive(true);
  };

  const handleFilterChange = (status: LeaveRequestStatus | "all") => {
    setFilterStatus(status);
  };

  return (
    <>
      <SectionTitleLineWithButton
        icon={mdiBeach}
        title="Richiesta Ferie e Permessi"
        main
        className="mb-6"
      >
        <Button
          icon={mdiPlus}
          label="Nuova richiesta"
          color="success"
          onClick={handleNewRequest}
          className="mt-4 sm:mr-4"
        />
      </SectionTitleLineWithButton>

      <CardBox className="mb-6">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stato filtro
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as LeaveRequestStatus | "all")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tutti</option>
              <option value="pending">In attesa</option>
              <option value="approved">Approvate</option>
              <option value="rejected">Rifiutate</option>
            </select>
          </div>
        </div>
      </CardBox>

      {notification && (
        <NotificationBar
          color={notification.color}
          icon={notification.color === "success" ? mdiCheckCircle : mdiAlertCircle}
        >
          {notification.message}
        </NotificationBar>
      )}

      {isNewRequestModalActive && (
        <LeaveRequestModal
          isActive={isNewRequestModalActive}
          onClose={() => setIsNewRequestModalActive(false)}
          onSubmit={(data) => {
            console.log("Dati inviati:", data);
            setIsNewRequestModalActive(false);
          }}
        />
      )}

      <SectionMain>
        {notification && (
          <NotificationBar
            color={notification.color}
            icon={notification.color === "success" ? mdiCheckCircle : mdiAlertCircle}
          >
            {notification.message}
          </NotificationBar>
        )}

        {/* Saldo giorni disponibili */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Card Ferie */}
          <ColoredCardBox
            color="success"
            gradient
            className="animate-fade-in-up stagger-1"
            isHoverable
            onClick={() => console.log('Ferie clicked')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <Icon path={mdiBeach} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Ferie
                  </h3>
                  <p className="text-sm text-white/80">
                    Giorni disponibili
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Disponibili:</span>
                <span className="font-semibold text-white">
                  {leaveBalance.ferieAvailable} giorni
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Utilizzate:</span>
                <span className="font-semibold text-white">
                  {leaveBalance.ferieUsed} giorni
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Totali:</span>
                <span className="font-semibold text-white">
                  {leaveBalance.ferieTotal} giorni
                </span>
              </div>
              {leaveBalance.rolloverDays > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">Residui anno prec.:</span>
                  <span className="font-semibold text-white">
                    {leaveBalance.rolloverDays} giorni
                  </span>
                </div>
              )}
            </div>
          </ColoredCardBox>
          
          {/* Card Permessi */}
          <ColoredCardBox
            color="info"
            gradient
            className="animate-fade-in-up stagger-2"
            isHoverable
            onClick={() => console.log('Permessi clicked')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <Icon path={mdiCalendarClock} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Permessi
                  </h3>
                  <p className="text-sm text-white/80">
                    Ore disponibili
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Disponibili:</span>
                <span className="font-semibold text-white">
                  {leaveBalance.permessiAvailable} ore
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Utilizzate:</span>
                <span className="font-semibold text-white">
                  {leaveBalance.permessiUsed} ore
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Totali:</span>
                <span className="font-semibold text-white">
                  {leaveBalance.permessiTotal} ore
                </span>
              </div>
            </div>
          </ColoredCardBox>
          
          {/* Card Riepilogo */}
          <ColoredCardBox
            color="warning"
            gradient
            className="animate-fade-in-up stagger-3"
            isHoverable
            onClick={() => console.log('Riepilogo clicked')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                  <Icon path={mdiCalendarClock} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Riepilogo
                  </h3>
                  <p className="text-sm text-white/80">
                    Stato richieste
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">In attesa:</span>
                <span className="font-semibold text-white">
                  {leaveRequests.filter(r => r.status === "pending").length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Approvate:</span>
                <span className="font-semibold text-white">
                  {leaveRequests.filter(r => r.status === "approved").length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Rifiutate:</span>
                <span className="font-semibold text-white">
                  {leaveRequests.filter(r => r.status === "rejected").length}
                </span>
              </div>
            </div>
          </ColoredCardBox>
        </div>

        {/* Storico richieste */}
        <CardBox hasTable>
          <div className="flex items-center justify-between mb-4 px-6 pt-6">
            <h3 className="text-lg font-semibold">Storico Richieste</h3>
            <div className="flex gap-2">
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
                <th>Data Richiesta</th>
                <th>Tipo</th>
                <th>Periodo</th>
                <th>Giorni</th>
                <th>Stato</th>
                <th>Approvazione</th>
                <th>Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Nessuna richiesta trovata
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id}>
                    <td data-label="Data Richiesta">
                      {format(new Date(request.requestDate), "dd/MM/yyyy", { locale: it })}
                    </td>
                    <td data-label="Tipo">
                      <PillTag
                        label={getTypeLabel(request.type)}
                        color={getTypeColor(request.type)}
                        small
                      />
                    </td>
                    <td data-label="Periodo">
                      <div className="text-sm">
                        <div>
                          {format(new Date(request.startDate), "dd/MM/yyyy", { locale: it })}
                        </div>
                        {request.startDate !== request.endDate && (
                          <div className="text-gray-500">
                            - {format(new Date(request.endDate), "dd/MM/yyyy", { locale: it })}
                          </div>
                        )}
                      </div>
                    </td>
                    <td data-label="Giorni">
                      <span className="font-semibold">
                        {request.days} {request.type === "permesso" ? "ore" : "giorni"}
                      </span>
                    </td>
                    <td data-label="Stato">
                      <PillTag
                        label={getStatusLabel(request.status)}
                        color={getStatusColor(request.status)}
                        small
                      />
                    </td>
                    <td data-label="Approvazione">
                      {request.approvalDate ? (
                        <div className="text-sm">
                          <div>{format(new Date(request.approvalDate), "dd/MM/yyyy", { locale: it })}</div>
                          {request.approvedBy && (
                            <div className="text-gray-500">{request.approvedBy}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td data-label="Azioni">
                      <div className="flex gap-1">
                        <Button
                          icon={mdiEye}
                          color="info"
                          small
                          onClick={() => {
                            // TODO: Implementare visualizzazione dettagli
                          }}
                        />
                        {request.status === "pending" && (
                          <Button
                            icon={mdiCancel}
                            color="danger"
                            small
                            onClick={() => {
                              // TODO: Implementare cancellazione richiesta
                            }}
                          />
                        )}
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