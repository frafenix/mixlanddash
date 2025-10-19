"use client";

import { useState, useEffect } from "react";
import { 
  mdiAccountGroup, 
  mdiAccount, 
  mdiCheckCircle, 
  mdiCloseCircle, 
  mdiEmail, 
  mdiAlert,
  mdiClockOutline,
  mdiAccountAlert,
  mdiAccountCheck,
  mdiEmailAlert,
  mdiCalendarPlus,
  mdiReceiptText,
  mdiFileDocumentOutline
} from "@mdi/js";
import CardBox from "../../../_components/CardBox";
import Button from "../../../_components/Button";
import Icon from "../../../_components/Icon";
import { useRouter } from "next/navigation";

// Dati mock per i membri del team del Manager
const mockTeamMembers = [
  {
    id: 1,
    name: "Mario Rossi",
    email: "mario.rossi@company.com",
    role: "user",
    status: "active",
    lastAttendance: "2024-12-15",
    attendanceStatus: "submitted",
    avatar: "MR"
  },
  {
    id: 2,
    name: "Laura Bianchi",
    email: "laura.bianchi@company.com",
    role: "user",
    status: "active",
    lastAttendance: "2024-12-14",
    attendanceStatus: "pending",
    avatar: "LB"
  },
  {
    id: 3,
    name: "Giuseppe Verdi",
    email: "giuseppe.verdi@company.com",
    role: "user",
    status: "active",
    lastAttendance: "2024-12-13",
    attendanceStatus: "late",
    avatar: "GV"
  },
  {
    id: 4,
    name: "Anna Neri",
    email: "anna.neri@company.com",
    role: "user",
    status: "inactive",
    lastAttendance: "2024-12-10",
    attendanceStatus: "missing",
    avatar: "AN"
  },
  {
    id: 5,
    name: "Francesco Blu",
    email: "francesco.blu@company.com",
    role: "user",
    status: "active",
    lastAttendance: "2024-12-15",
    attendanceStatus: "submitted",
    avatar: "FB"
  }
];

export default function ManagerTeamView() {
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return mdiCheckCircle;
      case 'inactive':
        return mdiCloseCircle;
      default:
        return mdiAccount;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAttendanceStatusIcon = (attendanceStatus: string) => {
    switch (attendanceStatus) {
      case 'submitted':
        return mdiAccountCheck;
      case 'pending':
        return mdiClockOutline;
      case 'late':
        return mdiAlert;
      case 'missing':
        return mdiAccountAlert;
      default:
        return mdiClockOutline;
    }
  };

  const getAttendanceStatusColor = (attendanceStatus: string) => {
    switch (attendanceStatus) {
      case 'submitted':
        return 'text-green-600';
      case 'pending':
        return 'text-orange-500';
      case 'late':
        return 'text-red-600';
      case 'missing':
        return 'text-red-700';
      default:
        return 'text-gray-600';
    }
  };

  const getAttendanceStatusLabel = (attendanceStatus: string) => {
    switch (attendanceStatus) {
      case 'submitted':
        return 'Inviato';
      case 'pending':
        return 'In Attesa';
      case 'late':
        return 'In Ritardo';
      case 'missing':
        return 'Mancante';
      default:
        return 'Sconosciuto';
    }
  };

  const handleRequestLeave = () => {
    // Logica per aprire modulo richiesta ferie/permessi
    alert('Apertura modulo richiesta ferie/permessi - Soggetto ad approvazione admin');
  };

  const handleSubmitExpenses = () => {
    // Logica per aprire modulo note spese
    alert('Apertura modulo note spese - Soggetto ad approvazione admin');
  };

  const handleSendReminder = (memberId: number) => {
    // Logica per inviare promemoria
    alert(`Promemoria inviato al membro ${memberId}`);
  };

  const handleReportAnomaly = (memberId: number) => {
    // Logica per segnalare anomalia all'admin
    alert(`Anomalia segnalata per il membro ${memberId}`);
  };

  const activeMembers = teamMembers.filter(member => member.status === 'active');
  const inactiveMembers = teamMembers.filter(member => member.status === 'inactive');
  const attentionRequired = teamMembers.filter(m => m.attendanceStatus === 'pending' || m.attendanceStatus === 'late').length;

  return (
    <div className="space-y-6">
      {/* Team Overview Card */}
      <CardBox>
        <div className="p-6">
          {/* Sezione superiore - Titolo e indicatori */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Team Overview</h2>
            
            {/* Indicatori visivi allineati orizzontalmente */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Membri Totali */}
              <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                  <Icon path={mdiAccountGroup} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{teamMembers.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Membri Totali</p>
                </div>
              </div>

              {/* Membri Attivi */}
              <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                  <Icon path={mdiAccountCheck} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{activeMembers.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Membri Attivi</p>
                </div>
              </div>

              {/* Richieste in sospeso */}
              <div className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mr-4">
                  <Icon path={mdiAlert} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-500">{attentionRequired}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Richieste in sospeso</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sezione centrale - Pulsanti azioni */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Azioni Manager</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pulsante Richiesta Ferie/Permessi */}
              <Button
                icon={mdiCalendarPlus}
                color="success"
                onClick={handleRequestLeave}
                className="w-full justify-center py-3"
              >
                <div className="flex items-center">
                  <Icon path={mdiCalendarPlus} className="w-5 h-5 mr-2" />
                  <span>Richiesta Ferie/Permessi</span>
                </div>
              </Button>

              {/* Pulsante Invia Note Spese */}
              <Button
                icon={mdiReceiptText}
                color="info"
                onClick={handleSubmitExpenses}
                className="w-full justify-center py-3"
              >
                <div className="flex items-center">
                  <Icon path={mdiReceiptText} className="w-5 h-5 mr-2" />
                  <span>Invia Note Spese</span>
                </div>
              </Button>
            </div>
            
            {/* Nota informativa */}
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center">
                <Icon path={mdiAlert} className="w-4 h-4 mr-2" />
                <strong>Nota:</strong> Tutte le richieste generate dal manager saranno soggette ad approvazione admin.
              </p>
            </div>
          </div>
        </div>
      </CardBox>

      {/* Lista membri attivi */}
      <CardBox>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Icon path={mdiAccountGroup} size={1} className="mr-2 text-green-600" />
            Membri Attivi ({activeMembers.length})
          </h3>
          
          <div className="space-y-4">
            {activeMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {member.avatar}
                  </div>
                  
                  {/* Info membro */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      Ultima presenza: {new Date(member.lastAttendance).toLocaleDateString('it-IT')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Status presenza */}
                  <div className="text-center">
                    <Icon 
                      path={getAttendanceStatusIcon(member.attendanceStatus)} 
                      size={1} 
                      className={getAttendanceStatusColor(member.attendanceStatus)} 
                    />
                    <p className={`text-xs mt-1 ${getAttendanceStatusColor(member.attendanceStatus)}`}>
                      {getAttendanceStatusLabel(member.attendanceStatus)}
                    </p>
                  </div>

                  {/* Azioni */}
                  <div className="flex space-x-2">
                    <Button
                      icon={mdiEmail}
                      color="info"
                      small
                      outline
                      onClick={() => handleSendReminder(member.id)}
                      title="Invia promemoria"
                    />
                    <Button
                      icon={mdiAlert}
                      color="warning"
                      small
                      outline
                      onClick={() => handleReportAnomaly(member.id)}
                      title="Segnala anomalia"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBox>

      {/* Lista membri inattivi (se presenti) */}
      {inactiveMembers.length > 0 && (
        <CardBox>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Icon path={mdiAccountAlert} size={1} className="mr-2 text-red-600" />
              Membri Inattivi ({inactiveMembers.length})
            </h3>
            
            <div className="space-y-4">
              {inactiveMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {member.avatar}
                    </div>
                    
                    {/* Info membro */}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{member.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                      <p className="text-xs text-red-600">
                        Ultima presenza: {new Date(member.lastAttendance).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Status */}
                    <div className="text-center">
                      <Icon path={mdiCloseCircle} size={1} className="text-red-600" />
                      <p className="text-xs mt-1 text-red-600">Inattivo</p>
                    </div>

                    {/* Azioni */}
                    <div className="flex space-x-2">
                      <Button
                        icon={mdiAlert}
                        color="danger"
                        small
                        outline
                        onClick={() => handleReportAnomaly(member.id)}
                        title="Segnala all'admin"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardBox>
      )}

      {/* Note informative */}
      <CardBox>
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center">
            <Icon path={mdiEmailAlert} size={1} className="mr-2" />
            Funzioni Manager
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Visualizzazione membri del team assegnati</li>
            <li>• Invio promemoria per presenze in ritardo</li>
            <li>• Segnalazione anomalie all'amministratore</li>
            <li>• Monitoraggio stato presenze in tempo reale</li>
          </ul>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
            <strong>Nota:</strong> Non è possibile creare o eliminare team. Per modifiche strutturali contattare l'amministratore.
          </p>
        </div>
      </CardBox>
    </div>
  );
}