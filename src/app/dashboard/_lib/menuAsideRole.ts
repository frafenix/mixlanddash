import {
  mdiAccountCircle,
  mdiMonitor,
  mdiAccountGroup,
  mdiCalendarMonth,
  mdiBeach,
  mdiCashMultiple,
  mdiAccountMultiple,
  mdiDomain,
  mdiEmail,
  mdiCog,
  mdiChartLine,
  mdiFileDocument,
  mdiTable,
  mdiAccountMultiplePlus,
} from "@mdi/js";
import { MenuAsideItem } from "../../_interfaces";

export const getRoleBasedMenu = (role: 'admin' | 'manager' | 'user'): MenuAsideItem[] => {
  const baseMenu: MenuAsideItem[] = [
    {
      href: "/dashboard",
      icon: mdiMonitor,
      label: "Dashboard",
    },
    {
      href: "/dashboard/profile",
      label: "Profilo",
      icon: mdiAccountCircle,
    },
  ];

  const userMenu: MenuAsideItem[] = [
    {
      href: "/dashboard/presenze",
      icon: mdiCalendarMonth,
      label: "Le Mie Presenze",
    },
    {
      href: "/dashboard/ferie",
      icon: mdiBeach,
      label: "Le Mie Ferie",
    },
    {
      href: "/dashboard/spese",
      icon: mdiCashMultiple,
      label: "Le Mie Spese",
    },
  ];

  const managerMenu: MenuAsideItem[] = [
    // TEAM MANAGEMENT SECTION
    {
      href: "/dashboard",
      icon: mdiChartLine,
      label: "📊 Dashboard Team",
    },
    {
      href: "/dashboard/team",
      icon: mdiAccountGroup,
      label: "👥 Team",
    },
    {
      href: "/dashboard/presenze",
      icon: mdiCalendarMonth,
      label: "🗓️ Presenze (Team)",
    },
    {
      href: "/dashboard/ferie",
      icon: mdiBeach,
      label: "🌴 Ferie e Permessi (Team)",
    },
    {
      href: "/dashboard/spese",
      icon: mdiCashMultiple,
      label: "💳 Note Spese (Team)",
    },
    // PERSONAL SECTION
    {
      isDivider: true,
    },
    {
      href: "/dashboard/mie-presenze",
      icon: mdiCalendarMonth,
      label: "🙋‍♂️ Le Mie Presenze",
    },
    {
      href: "/dashboard/mie-ferie",
      icon: mdiBeach,
      label: "🕓 Le Mie Ferie",
    },
    {
      href: "/dashboard/mie-spese",
      icon: mdiCashMultiple,
      label: "🧾 Le Mie Spese",
    },
  ];

  const adminMenu: MenuAsideItem[] = [
    {
      href: "/dashboard/users",
      icon: mdiAccountMultiple,
      label: "Gestione Utenti",
    },
    {
      href: "/dashboard/companies",
      icon: mdiDomain,
      label: "Gestione Aziende",
    },
    {
      href: "/dashboard/invitations",
      icon: mdiEmail,
      label: "Inviti",
    },
    {
      href: "/dashboard/system",
      icon: mdiCog,
      label: "Impostazioni Sistema",
    },
    {
      href: "/dashboard/analytics",
      icon: mdiChartLine,
      label: "Analytics",
    },
    {
      href: "/dashboard/reports",
      icon: mdiFileDocument,
      label: "Report Globali",
    },
  ];

  switch (role) {
    case 'admin':
      return [...baseMenu, ...adminMenu];
    case 'manager':
      return [...baseMenu, ...managerMenu];
    case 'user':
      return [...baseMenu, ...userMenu];
    default:
      return baseMenu;
  }
};

export default getRoleBasedMenu;