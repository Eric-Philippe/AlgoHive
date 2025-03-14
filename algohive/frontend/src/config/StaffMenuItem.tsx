import { JSX, lazy } from "react";
import { TFunction } from "i18next";
import { User } from "../models/User";
import { Permission, rolesHavePermission } from "../utils/permissions";

// Lazy load components
const HomePage = lazy(() => import("../Pages/staff/Home/Home"));
const UsersPage = lazy(() => import("../Pages/staff/Users/Users"));
const RolesPage = lazy(() => import("../Pages/staff/Roles/Roles"));
const ScopesPage = lazy(() => import("../Pages/staff/Scopes/Scopes"));
const GroupsPage = lazy(() => import("../Pages/staff/Groups/Groups"));
const CompetitionsPage = lazy(
  () => import("../Pages/staff/Competitions/Competitions")
);
const CatalogsPage = lazy(() => import("../Pages/staff/Catalogs/Catalogs"));

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  Component: React.LazyExoticComponent<() => JSX.Element>;
  permissions?: string[];
  showInMenu?: (user: User) => boolean;
}

// Function that returns translated menu items
export const getStaffMenuItems = (t: TFunction): MenuItem[] => [
  {
    id: "home",
    label: t("navigation.staff.home"),
    icon: "pi pi-home",
    color: "#F1916D",
    Component: HomePage,
  },
  {
    id: "users",
    label: t("navigation.staff.users"),
    icon: "pi pi-users",
    color: "#A34054",
    Component: UsersPage,
  },
  {
    id: "roles",
    label: t("navigation.staff.roles"),
    icon: "pi pi-shield",
    color: "#662249",
    Component: RolesPage,
    showInMenu: (user: User) =>
      rolesHavePermission(user.roles, Permission.ROLES),
  },
  {
    id: "scopes",
    label: t("navigation.staff.scopes"),
    icon: "pi pi-building",
    color: "#44174E",
    Component: ScopesPage,
    showInMenu: (user: User) =>
      rolesHavePermission(user.roles, Permission.SCOPES),
  },
  {
    id: "groups",
    label: t("navigation.staff.groups"),
    icon: "pi pi-users",
    color: "#413B61",
    Component: GroupsPage,
  },
  {
    id: "competitions",
    label: t("navigation.staff.competitions"),
    icon: "pi pi-graduation-cap",
    color: "#54162B",
    Component: CompetitionsPage,
  },
  {
    id: "catalogs",
    label: t("navigation.staff.catalogs"),
    icon: "pi pi-server",
    color: "#03122F",
    Component: CatalogsPage,
  },
];
