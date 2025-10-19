"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  mdiAccountGroup, mdiPlus, mdiPencil, mdiTrashCan, mdiEye, mdiDomain, 
  mdiAccountHardHat, mdiShieldAccount, mdiAccountSupervisor, mdiAccount,
  mdiCheckCircle, mdiClockOutline, mdiAlertCircle, mdiInformation
} from "@mdi/js";

import SectionMain from "../../_components/Section/Main";
import SectionTitleLineWithButton from "../../_components/Section/TitleLineWithButton";
import CardBox from "../../_components/CardBox";
import CardBoxModal from "../../_components/CardBox/Modal";
import Button from "../../_components/Button";
import FormField from "../../_components/FormField";
import Icon from "../../_components/Icon";
import PillTag from "../../_components/PillTag";
import { toast } from "sonner";
import NotificationBar from "../../_components/NotificationBar";
import type { ColorKey } from "../../_interfaces";
import { RoleBasedAccess } from "@/components/RoleBasedAccess";
import ManagerTeamView from "./_components/ManagerTeamView";

// Definizione degli schemi per i form
const inviteFormSchema = z.object({
  email: z.string().email({
    message: "Inserisci un indirizzo email valido.",
  }),
  role: z.enum(["MANAGER", "USER"], {
    message: "Seleziona un ruolo valido.",
  }),
  teamId: z.string().optional(),
});

const createTeamFormSchema = z.object({
  name: z.string().min(1, {
    message: "Il nome del team è richiesto.",
  }),
  description: z.string().optional(),
});

// Tipo per i membri del team
type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "USER";
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  teamId: string;
  teamName: string;
};

// Tipo per i team
type Team = {
  id: string;
  name: string;
  description?: string;
};

export default function TeamPage() {
  return (
    <>
      {/* Admin Team Management */}
      <RoleBasedAccess allowedRoles={['admin']}>
        <AdminTeamManagement />
      </RoleBasedAccess>

      {/* Manager Team View */}
      <RoleBasedAccess allowedRoles={['manager']}>
        <ManagerTeamView />
      </RoleBasedAccess>
    </>
  );
}

// Admin Team Management Component
function AdminTeamManagement() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteModalActive, setIsInviteModalActive] = useState(false);
  const [isCreateTeamModalActive, setIsCreateTeamModalActive] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userRole, setUserRole] = useState<string>("ADMIN");
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [notification, setNotification] = useState<{type: "success" | "danger" | "warning" | null, message: string | null}>({
    type: null,
    message: null
  });

  // Form per l'invito
  const inviteForm = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "USER",
      teamId: "",
    },
  });

  // Form per la creazione del team
  const createTeamForm = useForm<z.infer<typeof createTeamFormSchema>>({
    resolver: zodResolver(createTeamFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Carica i membri del team e i team all'avvio
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Simuliamo il caricamento dei dati
        setTimeout(() => {
          const mockTeams = [
            {
              id: "team1",
              name: "Marketing Team",
              description: "Team dedicato al marketing"
            },
            {
              id: "team2",
              name: "Development Team",
              description: "Team di sviluppo software"
            },
            {
              id: "team3",
              name: "Sales Team",
              description: "Team commerciale"
            }
          ];
          
          setTeams(mockTeams);
          setUserTeams(mockTeams);
          
          setTeamMembers([
            {
              id: "1",
              name: "Mario Rossi",
              email: "mario.rossi@example.com",
              role: "ADMIN",
              status: "ACTIVE",
              teamId: "team1",
              teamName: "Marketing Team"
            },
            {
              id: "2",
              name: "Giulia Bianchi",
              email: "giulia.bianchi@example.com",
              role: "MANAGER",
              status: "ACTIVE",
              teamId: "team2",
              teamName: "Development Team"
            },
            {
              id: "3",
              name: "Luca Verdi",
              email: "luca.verdi@example.com",
              role: "USER",
              status: "PENDING",
              teamId: "team1",
              teamName: "Marketing Team"
            }
          ]);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Errore nel caricamento dei dati:", error);
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const onInviteSubmit = async (data: z.infer<typeof inviteFormSchema>) => {
    try {
      console.log("Inviting member:", data);
      toast.success("Invito inviato con successo!");
      setIsInviteModalActive(false);
      inviteForm.reset();
    } catch (error) {
      console.error("Errore nell'invio dell'invito:", error);
      toast.error("Errore nell'invio dell'invito");
    }
  };

  const onCreateTeamSubmit = async (data: z.infer<typeof createTeamFormSchema>) => {
    try {
      console.log("Creating team:", data);
      toast.success("Team creato con successo!");
      setIsCreateTeamModalActive(false);
      createTeamForm.reset();
    } catch (error) {
      console.error("Errore nella creazione del team:", error);
      toast.error("Errore nella creazione del team");
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
      toast.success("Membro rimosso con successo!");
    } catch (error) {
      console.error("Errore nella rimozione del membro:", error);
      toast.error("Errore nella rimozione del membro");
    }
  };

  const handleRoleChange = async (memberId: string, newRole: "ADMIN" | "MANAGER" | "USER") => {
    try {
      setTeamMembers(prev => 
        prev.map(member => 
          member.id === memberId 
            ? { ...member, role: newRole }
            : member
        )
      );
      toast.success("Ruolo aggiornato con successo!");
    } catch (error) {
      console.error("Errore nell'aggiornamento del ruolo:", error);
      toast.error("Errore nell'aggiornamento del ruolo");
    }
  };

  return (
    <SectionMain>
      {/* Header */}
      <SectionTitleLineWithButton
        icon={mdiAccountGroup}
        title="Team Management"
        main
      >
        <div className="flex space-x-2">
          <Button
            icon={mdiDomain}
            color="info"
            label="Create Team"
            onClick={() => setIsCreateTeamModalActive(true)}
            small
          />
          <Button
            icon={mdiPlus}
            color="success"
            label="Invite Member"
            onClick={() => setIsInviteModalActive(true)}
            small
          />
        </div>
      </SectionTitleLineWithButton>

      {/* Notification */}
      {notification.type && (
        <NotificationBar 
          color={notification.type} 
          icon={notification.type === "success" ? mdiCheckCircle : mdiAlertCircle}
        >
          {notification.message}
        </NotificationBar>
      )}

      {/* Teams Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {userTeams.map((team) => (
          <CardBox key={team.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Icon path={mdiDomain} size="24" className="text-blue-500 mr-3" />
                <div>
                  <h3 className="font-semibold text-lg">{team.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{team.description}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {teamMembers.filter(member => member.teamId === team.id).length} membri
              </span>
              <div className="flex space-x-1">
                {teamMembers
                  .filter(member => member.teamId === team.id)
                  .slice(0, 3)
                  .map((member, index) => (
                    <div
                      key={member.id}
                      className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium"
                      style={{ marginLeft: index > 0 ? '-8px' : '0', zIndex: 3 - index }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                {teamMembers.filter(member => member.teamId === team.id).length > 3 && (
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-medium ml-[-8px]">
                    +{teamMembers.filter(member => member.teamId === team.id).length - 3}
                  </div>
                )}
              </div>
            </div>
          </CardBox>
        ))}
      </div>

      {/* Team Members Table */}
      <CardBox className="mb-6" hasTable>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">Team Members</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="text-left p-4 font-medium">Member</th>
              <th className="text-left p-4 font-medium">Role</th>
              <th className="text-left p-4 font-medium">Team</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center p-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : teamMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-500 dark:text-gray-400">
                  No team members found
                </td>
              </tr>
            ) : (
              teamMembers.map((member) => (
                <tr key={member.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="p-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <PillTag
                      color={
                        member.role === "ADMIN" ? "danger" :
                        member.role === "MANAGER" ? "warning" : "info"
                      }
                      label={member.role}
                      icon={
                        member.role === "ADMIN" ? mdiShieldAccount :
                        member.role === "MANAGER" ? mdiAccountSupervisor : mdiAccount
                      }
                    />
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium">{member.teamName}</span>
                  </td>
                  <td className="p-4">
                    <PillTag
                      color={
                        member.status === "ACTIVE" ? "success" :
                        member.status === "PENDING" ? "warning" : "danger"
                      }
                      label={member.status}
                      icon={
                        member.status === "ACTIVE" ? mdiCheckCircle :
                        member.status === "PENDING" ? mdiClockOutline : mdiAlertCircle
                      }
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleDeleteMember(member.id)}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Remove member"
                      >
                        <Icon path={mdiTrashCan} size="18" />
                      </button>
                      <button 
                        onClick={() => setSelectedMember(member)}
                        className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-transform hover:scale-110"
                        title="View details"
                      >
                        <Icon path={mdiEye} size="18" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </CardBox>

      {/* Invite Modal */}
      <CardBoxModal
        title="Invita un nuovo membro"
        buttonColor="success"
        buttonLabel="Invia Invito"
        isActive={isInviteModalActive}
        onConfirm={inviteForm.handleSubmit(onInviteSubmit)}
        onCancel={() => setIsInviteModalActive(false)}
      >
        <form className="space-y-6">
          <FormField
            label="Email"
            help="Inserisci l'email della persona da invitare."
          >
            {(fieldData) => (
              <>
                <input
                  {...inviteForm.register("email")}
                  className={fieldData.className}
                  placeholder="email@example.com"
                  type="email"
                />
                {inviteForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {inviteForm.formState.errors.email.message}
                  </p>
                )}
              </>
            )}
          </FormField>

          <FormField
            label="Ruolo"
            help="Seleziona il ruolo da assegnare."
          >
            {(fieldData) => (
              <>
                <select
                  {...inviteForm.register("role")}
                  className={fieldData.className}
                >
                  <option value="MANAGER">Manager</option>
                  <option value="USER">User</option>
                </select>
                {inviteForm.formState.errors.role && (
                  <p className="text-red-500 text-sm mt-1">
                    {inviteForm.formState.errors.role.message}
                  </p>
                )}
              </>
            )}
          </FormField>

          {teams.length > 1 && (
            <FormField
              label="Team"
              help="Seleziona il team a cui aggiungere il membro."
            >
              {(fieldData) => (
                <>
                  <select
                    {...inviteForm.register("teamId")}
                    className={fieldData.className}
                  >
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                  {inviteForm.formState.errors.teamId && (
                    <p className="text-red-500 text-sm mt-1">
                      {inviteForm.formState.errors.teamId.message}
                    </p>
                  )}
                </>
              )}
            </FormField>
          )}
        </form>
      </CardBoxModal>

      {/* Create Team Modal */}
      <CardBoxModal
        title="Crea un nuovo team"
        buttonColor="info"
        buttonLabel="Crea Team"
        isActive={isCreateTeamModalActive}
        onConfirm={createTeamForm.handleSubmit(onCreateTeamSubmit)}
        onCancel={() => setIsCreateTeamModalActive(false)}
      >
        <form className="space-y-6">
          <FormField
            label="Nome Team"
            help="Inserisci il nome del nuovo team."
          >
            {(fieldData) => (
              <>
                <input
                  {...createTeamForm.register("name")}
                  className={fieldData.className}
                  placeholder="Nome del team"
                />
                {createTeamForm.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {createTeamForm.formState.errors.name.message}
                  </p>
                )}
              </>
            )}
          </FormField>

          <FormField
            label="Descrizione"
            help="Inserisci una breve descrizione del team (opzionale)."
            hasTextareaHeight
          >
            {(fieldData) => (
              <>
                <textarea
                  {...createTeamForm.register("description")}
                  className={fieldData.className}
                  placeholder="Descrizione del team"
                />
                {createTeamForm.formState.errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {createTeamForm.formState.errors.description.message}
                  </p>
                )}
              </>
            )}
          </FormField>
        </form>
      </CardBoxModal>
    </SectionMain>
  );
}