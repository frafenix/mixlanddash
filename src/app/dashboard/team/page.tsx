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

  return (
    <SectionMain>
      {/* Header */}
      <SectionTitleLineWithButton
        icon={mdiAccountGroup}
        title="Team Management"
        main
      >
        <div className="flex space-x-2">
          {userRole === "ADMIN" && (
            <Button
              icon={mdiDomain}
              color="info"
              label="Create Team"
              onClick={() => setIsCreateTeamModalActive(true)}
              small
            />
          )}
          {(userRole === "ADMIN" || userRole === "MANAGER") && (
            <Button
              icon={mdiPlus}
              color="success"
              label="Invite Member"
              onClick={() => setIsInviteModalActive(true)}
              small
            />
          )}
        </div>
      </SectionTitleLineWithButton>
      
      {/* Sottotitolo */}
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Gestisci i membri del tuo team, assegna ruoli e invia nuovi inviti.
      </p>

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

      {/* Tabella membri del team */}
      <CardBox className="mb-6 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="px-4 py-3 bg-gray-50 dark:bg-slate-800">Nome</th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-slate-800">Email</th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-slate-800">Ruolo</th>
                <th className="px-4 py-3 bg-gray-50 dark:bg-slate-800">Stato</th>
                {userRole === "ADMIN" && (
                  <th className="px-4 py-3 bg-gray-50 dark:bg-slate-800">Team</th>
                )}
                <th className="px-4 py-3 bg-gray-50 dark:bg-slate-800">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={userRole === "ADMIN" ? 6 : 5} className="px-4 py-8 text-center">
                    Caricamento membri del team...
                  </td>
                </tr>
              ) : getFilteredMembers().length === 0 ? (
                <tr>
                  <td colSpan={userRole === "ADMIN" ? 6 : 5} className="px-4 py-8 text-center">
                    Nessun membro nel team. Invita nuovi membri per iniziare.
                  </td>
                </tr>
              ) : (
                getFilteredMembers().map((member) => (
                  <tr key={member.id} className="border-b dark:border-slate-700">
                    <td className="px-4 py-3">{member.name}</td>
                    <td className="px-4 py-3">{member.email}</td>
                    <td className="px-4 py-3">
                      <PillTag
                        label={member.role}
                        color={getRoleIconAndColor(member.role).color}
                        icon={getRoleIconAndColor(member.role).icon}
                        small
                      />
                    </td>
                    <td className="px-4 py-3">
                      <PillTag
                        label={member.status}
                        color={getStatusIconAndColor(member.status).color}
                        icon={getStatusIconAndColor(member.status).icon}
                        small
                      />
                    </td>
                    {userRole === "ADMIN" && (
                      <td className="px-4 py-3">{member.teamName}</td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        {userRole === "ADMIN" && (
                          <>
                            <div className="relative">
                              <button 
                                onClick={(e) => {
                                  // Chiudi tutti gli altri menu aperti
                                  document.querySelectorAll('.role-menu:not(.hidden)').forEach(menu => {
                                    if (menu !== e.currentTarget.nextElementSibling) {
                                      menu.classList.add('hidden');
                                    }
                                  });
                                  // Apri/chiudi questo menu
                                  e.currentTarget.nextElementSibling?.classList.toggle('hidden');
                                }}
                                className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Cambia ruolo"
                              >
                                <Icon path={mdiPencil} size="18" />
                              </button>
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 hidden role-menu">
                                <div className="py-1">
                                  <button
                                    onClick={() => handleRoleChange(member.id, "ADMIN")}
                                    className={`block px-4 py-2 text-sm w-full text-left ${member.role === "ADMIN" ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                  >
                                    Admin
                                  </button>
                                  <button
                                    onClick={() => handleRoleChange(member.id, "MANAGER")}
                                    className={`block px-4 py-2 text-sm w-full text-left ${member.role === "MANAGER" ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                  >
                                    Manager
                                  </button>
                                  <button
                                    onClick={() => handleRoleChange(member.id, "USER")}
                                    className={`block px-4 py-2 text-sm w-full text-left ${member.role === "USER" ? "bg-blue-100 dark:bg-blue-900" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                                  >
                                    User
                                  </button>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title="Rimuovi utente"
                            >
                              <Icon path={mdiTrashCan} size="18" />
                            </button>
                          </>
                        )}
                        {userRole === "MANAGER" && member.role === "USER" && (
                          <button 
                            onClick={() => handleRoleChange(member.id, "USER")}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Modifica utente"
                          >
                            <Icon path={mdiPencil} size="18" />
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedMember(member)}
                          className="p-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 transition-transform hover:scale-110"
                          title="Visualizza dettagli"
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


    </SectionMain>
  );
}