import {
  mdiAccountCircle,
  mdiMonitor,
  mdiAccountGroup,
  mdiCalendarMonth,
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
    href: "/dashboard/profile",
    label: "Profilo",
    icon: mdiAccountCircle,
  },
];

export default menuAside;
