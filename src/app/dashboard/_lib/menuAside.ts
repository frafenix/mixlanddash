import {
  mdiAccountCircle,
  mdiMonitor,
  mdiAccountGroup,
  mdiCalendarMonth,
  mdiBeach,
} from "@mdi/js";
import { MenuAsideItem } from "../../_interfaces";

const menuAside: MenuAsideItem[] = [
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
    href: "/dashboard/profile",
    label: "Profilo",
    icon: mdiAccountCircle,
  },
];

export default menuAside;
