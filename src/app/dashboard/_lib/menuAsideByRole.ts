import {
  mdiAccountCircle,
  mdiMonitor,
  mdiAccountGroup,
  mdiCalendarMonth,
  mdiBeach,
  mdiCashMultiple,
  mdiChartLine,
  mdiAccountMultiple,
  mdiCogOutline,
} from "@mdi/js";
import { MenuAsideItem } from "../../_interfaces";

// Menu per il ruolo User
const menuAsideUser: MenuAsideItem[] = [
  {
    href: "/dashboard",
    icon: mdiMonitor,
    label: "Dashboard",
  },
  {
    href: "/dashboard/presenze",
    icon: mdiCalendarMonth,
    label: "Presenze",
  },
  {
    href: "/dashboard/ferie",
    icon: mdiBeach,
    label: "Ferie",
  },
  {
    href: "/dashboard/spese",
    icon: mdiCashMultiple,
    label: "Spese",
  },
  {
    href: "/dashboard/profile",
    label: "Profilo",
    icon: mdiAccountCircle,
  },
];

// Menu per il ruolo Manager
const menuAsideManager: MenuAsideItem[] = [
  {
    href: "/dashboard",
    icon: mdiMonitor,
    label: "Dashboard",
  },
  {
    href: "/dashboard/team",
    icon: mdiAccountGroup,
    label: "Team",
  },
  {
    href: "/dashboard/presenze",
    icon: mdiCalendarMonth,
    label: "Presenze",
  },
  {
    href: "/dashboard/ferie",
    icon: mdiBeach,
    label: "Ferie",
  },
  {
    href: "/dashboard/spese",
    icon: mdiCashMultiple,
    label: "Spese",
  },
  {
    href: "/dashboard/report",
    icon: mdiChartLine,
    label: "Report",
  },
  {
    href: "/dashboard/profile",
    label: "Profilo",
    icon: mdiAccountCircle,
  },
];

// Menu per il ruolo Admin (menu completo)
const menuAsideAdmin: MenuAsideItem[] = [
  {
    href: "/dashboard",
    icon: mdiMonitor,
    label: "Dashboard",
  },
  {
    href: "/dashboard/team-users",
    icon: mdiAccountMultiple,
    label: "Team & Utenti",
  },
  {
    href: "/dashboard/presenze",
    icon: mdiCalendarMonth,
    label: "Presenze",
  },
  {
    href: "/dashboard/report",
    icon: mdiChartLine,
    label: "Report & Analytics",
  },
  {
    href: "/dashboard/settings",
    icon: mdiCogOutline,
    label: "Impostazioni",
  },
  {
    href: "/dashboard/profile",
    label: "Profilo",
    icon: mdiAccountCircle,
  },
];

export function getMenuByRole(role: string): MenuAsideItem[] {
  switch (role) {
    case 'user':
      return menuAsideUser;
    case 'manager':
      return menuAsideManager;
    case 'admin':
      return menuAsideAdmin;
    default:
      return menuAsideUser; // Default al menu user per sicurezza
  }
}

export { menuAsideUser, menuAsideManager, menuAsideAdmin };