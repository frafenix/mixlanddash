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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isInviteModalActive, setIsInviteModalActive] = useState(false);
  const [isCreateTeamModalActive, setIsCreateTeamModalActive] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [userRole, setUserRole] = useState<string>("USER"); // Default a USER, verrà aggiornato
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [notification, setNotification] = useState<{type: "success" | "danger" | "warning" | null, message: string | null}>({
    type: null,
    message: null
  });
  const [pendingRoleChange, setPendingRoleChange] = useState<{memberId: string, newRole: "ADMIN" | "MANAGER" | "USER"} | null>(null);

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

  // Aggiungi event listener per chiudere i menu quando si clicca fuori
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const menus = document.querySelectorAll('.role-menu:not(.hidden)');
      menus.forEach((menu) => {
        const triggerButton = (event.target as Element | null)?.closest('button');
        const isClickOnThisMenuToggle = triggerButton?.nextElementSibling === menu;

        if (!menu.contains(event.target as Node) && !isClickOnThisMenuToggle) {
          (menu as HTMLElement).classList.add('hidden');
        }
      });
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Carica i membri del team e i team all'avvio
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Simuliamo il caricamento dei dati (in produzione, sostituire con vere API call)
        setTimeout(() => {
          // Teams di esempio
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
          setUserTeams(mockTeams); // Per Admin, vede tutti i team
          
          // Membri di esempio
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
            },
            {
              id: "4",
              name: "Anna Neri",
              email: "anna.neri@example.com",
              role: "USER",
              status: "ACTIVE",
              teamId: "team3",
              teamName: "Sales Team"
            }
          ]);
          
          // Simuliamo che l'utente corrente sia un ADMIN
          setUserRole("ADMIN");
          setIsLoading(false);
        }, 500);
      } catch (error: any) {
        toast.error(error.message || "Errore nel caricamento dei dati");
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Gestione dell'invito
  async function onInviteSubmit(values: z.infer<typeof inviteFormSchema>) {
    setIsLoading(true);
    try {
      // In produzione, sostituire con una vera API call
      setTimeout(() => {
        const teamId = values.teamId || (teams.length > 0 ? teams[0].id : "");
        const teamName = teams.find(t => t.id === teamId)?.name || "Team sconosciuto";
        
        toast.success(`Invito inviato a ${values.email} con ruolo ${values.role} per il team ${teamName}`);
        inviteForm.reset();
        setIsInviteModalActive(false);
        
        // Aggiungiamo il nuovo membro alla lista (solo per demo)
        const newMember: TeamMember = {
          id: Date.now().toString(),
          name: values.email.split('@')[0], // Nome temporaneo basato sull'email
          email: values.email,
          role: values.role as "MANAGER" | "USER",
          status: "PENDING",
          teamId: teamId,
          teamName: teamName
        };
        
        setTeamMembers([...teamMembers, newMember]);
        setIsLoading(false);
      }, 500);
    } catch (error: any) {
      toast.error(error.message || "Errore nell'invio dell'invito");
      setIsLoading(false);
    }
  }

  // Gestione della creazione del team
  async function onCreateTeamSubmit(values: z.infer<typeof createTeamFormSchema>) {
    setIsLoading(true);
    try {
      // In produzione, sostituire con una vera API call
      setTimeout(() => {
        const newTeam: Team = {
          id: `team${Date.now()}`,
          name: values.name,
          description: values.description
        };
        
        setTeams([...teams, newTeam]);
        setUserTeams([...userTeams, newTeam]);
        
        toast.success(`Team "${values.name}" creato con successo!`);
        createTeamForm.reset();
        setIsCreateTeamModalActive(false);
        setIsLoading(false);
      }, 500);
    } catch (error: any) {
      toast.error(error.message || "Errore nella creazione del team");
      setIsLoading(false);
    }
  }

  const handleRoleChange = async (memberId: string, newRole: "ADMIN" | "MANAGER" | "USER") => {
    const memberToUpdate = teamMembers.find(member => member.id === memberId);

    if (memberToUpdate?.role === "ADMIN") {
      setNotification({
        type: "danger",
        message: "The role of an admin user cannot be changed."
      });
      return;
    }

    
    // Imposta il cambio di ruolo in attesa di conferma
    setPendingRoleChange({memberId, newRole});
  };

  // Funzione per confermare il cambio di ruolo
  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    
    try {
      setIsLoading(true);
      
      // In produzione, sostituire con una vera API call
      setTimeout(() => {
        setTeamMembers(members => 
          members.map(member => 
            member.id === pendingRoleChange.memberId ? {...member, role: pendingRoleChange.newRole} : member
          )
        );
        
        setNotification({
          type: "success",
          message: "Ruolo aggiornato con successo"
        });
        
        setPendingRoleChange(null);
        setIsLoading(false);
      }, 500);
    } catch (error: any) {
      setNotification({
        type: "danger",
        message: error.message || "Errore nell'aggiornamento del ruolo"
      });
      setIsLoading(false);
    }
  };

  // Funzione per annullare il cambio di ruolo
  const cancelRoleChange = () => {
    setPendingRoleChange(null);
  };

  // Funzione per rimuovere un membro (demo)
  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(members => members.filter(member => member.id !== memberId));
    setNotification({
      type: "success",
      message: "Membro rimosso con successo"
    });
  };

  // Chiudi i menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.role-menu') && !target.closest('button[title="Cambia ruolo"]')) {
        document.querySelectorAll('.role-menu:not(.hidden)').forEach(menu => {
          menu.classList.add('hidden');
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Funzione per ottenere l'icona e il colore del badge in base al ruolo
  const getRoleIconAndColor = (role: string): { icon: string; color: ColorKey } => {
    switch (role) {
      case "ADMIN": return { icon: mdiShieldAccount, color: "adminPill" } as const;
      case "MANAGER": return { icon: mdiAccountSupervisor, color: "info" } as const;
      case "USER": return { icon: mdiAccount, color: "userPill" } as const;
      default: return { icon: mdiAccount, color: "warning" } as const;
    }
  };

  // Funzione per ottenere l'icona e il colore del badge in base allo stato
  const getStatusIconAndColor = (status: string): { icon: string; color: ColorKey } => {
    switch (status) {
      case "ACTIVE": return { icon: mdiCheckCircle, color: "success" } as const;
      case "PENDING": return { icon: mdiClockOutline, color: "warning" } as const;
      case "SUSPENDED": return { icon: mdiAlertCircle, color: "danger" } as const;
      default: return { icon: mdiClockOutline, color: "warning" } as const;
    }
  };

  // Filtra i membri in base al ruolo dell'utente
  const getFilteredMembers = () => {
    if (userRole === "ADMIN") {
      return teamMembers; // Admin vede tutti
    } else if (userRole === "MANAGER") {
      // Manager vede solo i membri del suo team con ruolo USER
      return teamMembers.filter(member => 
        userTeams.some(team => team.id === member.teamId) && 
        (member.role === "USER" || member.id === "currentUserId") // Aggiungi l'ID dell'utente corrente in produzione
      );
    } else {
      // User vede solo i colleghi del suo team
      const userTeamIds = userTeams.map(team => team.id);
      return teamMembers.filter(member => 
        userTeamIds.includes(member.teamId)
      );
    }
  };

  // Funzione per ottenere le statistiche del team
  const getTeamStats = () => {
    const filteredMembers = getFilteredMembers();
    return {
      total: filteredMembers.length,
      active: filteredMembers.filter(m => m.status === 'ACTIVE').length,
      pending: filteredMembers.filter(m => m.status === 'PENDING').length,
      managers: filteredMembers.filter(m => m.role === 'MANAGER').length,
      users: filteredMembers.filter(m => m.role === 'USER').length,
    };
  };

  const teamStats = getTeamStats();

  return (
    <SectionMain>
      {/* Header */}
      <SectionTitleLineWithButton
        icon={mdiAccountGroup}
        title="Gestione Team"
        main
      >
        <div className="flex space-x-3">
          {userRole === "ADMIN" && (
            <Button
              icon={mdiDomain}
              color="info"
              label="Crea Team"
              onClick={() => setIsCreateTeamModalActive(true)}
              small
              className="rounded-lg"
            />
          )}
          {(userRole === "ADMIN" || userRole === "MANAGER") && (
            <Button
              icon={mdiPlus}
              color="success"
              label="Invita Membro"
              onClick={() => setIsInviteModalActive(true)}
              small
              className="rounded-lg"
            />
          )}
        </div>
      </SectionTitleLineWithButton>
      
      {/* Team Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <CardBox className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-100/20 rounded-lg">
                <Icon path={mdiAccountGroup} size="24" className="text-blue-200" />
              </div>
              <span className="text-3xl font-bold">{teamStats.total}</span>
            </div>
            <h3 className="text-sm font-medium text-blue-100">Totale Membri</h3>
          </div>
        </CardBox>

        <CardBox className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-100/20 rounded-lg">
                <Icon path={mdiCheckCircle} size="24" className="text-green-200" />
              </div>
              <span className="text-3xl font-bold">{teamStats.active}</span>
            </div>
            <h3 className="text-sm font-medium text-green-100">Attivi</h3>
          </div>
        </CardBox>

        <CardBox className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-yellow-100/20 rounded-lg">
                <Icon path={mdiClockOutline} size="24" className="text-yellow-200" />
              </div>
              <span className="text-3xl font-bold">{teamStats.pending}</span>
            </div>
            <h3 className="text-sm font-medium text-yellow-100">In Attesa</h3>
          </div>
        </CardBox>

        <CardBox className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-100/20 rounded-lg">
                <Icon path={mdiAccountSupervisor} size="24" className="text-purple-200" />
              </div>
              <span className="text-3xl font-bold">{teamStats.managers}</span>
            </div>
            <h3 className="text-sm font-medium text-purple-100">Manager</h3>
          </div>
        </CardBox>

        <CardBox className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-indigo-100/20 rounded-lg">
                <Icon path={mdiAccount} size="24" className="text-indigo-200" />
              </div>
              <span className="text-3xl font-bold">{teamStats.users}</span>
            </div>
            <h3 className="text-sm font-medium text-indigo-100">Utenti</h3>
          </div>
        </CardBox>
      </div>

      {notification.type && notification.message && (
        <NotificationBar 
          color={notification.type} 
          icon={notification.type === "success" ? mdiCheckCircle : notification.type === "danger" ? mdiAlertCircle : mdiInformation}
          button={
            <Button
              color={notification.type === "success" ? "success" : notification.type === "danger" ? "danger" : "warning"}
              label="Chiudi"
              roundedFull
              small
              onClick={() => setNotification({type: null, message: null})}
            />
          }
        >
          {notification.message}
        </NotificationBar>
      )}

      {pendingRoleChange && (
        <NotificationBar 
          color="confirmation" 
          icon={mdiInformation}
          button={
            <div className="flex space-x-2">
              <Button
                color="success"
                label="Conferma"
                roundedFull
                small
                onClick={confirmRoleChange}
                disabled={isLoading}
              />
              <Button
                color="danger"
                label="Annulla"
                roundedFull
                small
                onClick={cancelRoleChange}
                disabled={isLoading}
              />
            </div>
          }
        >
          Conferma il cambio di ruolo a <b>{pendingRoleChange.newRole}</b> per questo membro?
        </NotificationBar>
      )}

      {/* Modale di invito */}
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
          
          {userRole === "ADMIN" && teams.length > 1 && (
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

      {/* Modale di creazione team */}
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

      {/* Team Members Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <CardBox className="p-8 text-center">
            <div className="flex items-center justify-center space-x-3">
              <Icon path={mdiAccountGroup} size="24" className="text-blue-500 animate-pulse" />
              <span className="text-lg text-gray-600 dark:text-gray-400">Caricamento membri del team...</span>
            </div>
          </CardBox>
        ) : getFilteredMembers().length === 0 ? (
          <CardBox className="p-8 text-center bg-gray-50 dark:bg-gray-800/50">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Icon path={mdiAccountGroup} size="32" className="text-gray-400 dark:text-gray-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Nessun membro nel team</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Invita nuovi membri per iniziare a collaborare</p>
                {(userRole === "ADMIN" || userRole === "MANAGER") && (
                  <Button
                    icon={mdiPlus}
                    color="success"
                    label="Invita il primo membro"
                    onClick={() => setIsInviteModalActive(true)}
                    className="rounded-lg"
                  />
                )}
              </div>
            </div>
          </CardBox>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredMembers().map((member) => (
              <CardBox key={member.id} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                <div className="p-5">
                  {/* Member Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-white">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">{member.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <PillTag
                        label={member.role}
                        color={getRoleIconAndColor(member.role).color}
                        icon={getRoleIconAndColor(member.role).icon}
                        small
                      />
                      <PillTag
                        label={member.status === 'ACTIVE' ? 'Attivo' : member.status === 'PENDING' ? 'In Attesa' : 'Sospeso'}
                        color={getStatusIconAndColor(member.status).color}
                        icon={getStatusIconAndColor(member.status).icon}
                        small
                      />
                    </div>
                  </div>

                  {/* Team Info */}
                  {userRole === "ADMIN" && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center space-x-2">
                        <Icon path={mdiDomain} size="16" className="text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{member.teamName}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {member.status === 'PENDING' && (
                        <Button
                          color="success"
                          onClick={() => handleRoleChange(member.id, 'USER')}
                          small
                          label="Approva"
                        />
                      )}
                      <Button
                        color="info"
                        onClick={() => alert(`Dettagli di ${member.name}`)}
                        small
                        label="Dettagli"
                      />
                    </div>
                    <div className="flex space-x-2">
                      {userRole === "ADMIN" && (
                        <Button
                          color="warning"
                          onClick={() => handleRoleChange(member.id, member.role === 'USER' ? 'MANAGER' : 'USER')}
                          small
                          label={member.role === 'USER' ? 'Promuovi' : 'Degrada'}
                        />
                      )}
                      <Button
                        color="danger"
                        onClick={() => handleRemoveMember(member.id)}
                        small
                        label="Rimuovi"
                      />
                    </div>
                  </div>
                </div>
              </CardBox>
            ))}
          </div>
        )}
      </div>


    </SectionMain>
  );
}