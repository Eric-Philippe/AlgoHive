import { useState, useEffect, useRef } from "react";
import { Role } from "../../../models/Role";
import "./Roles.css";
import {
  createRole,
  deleteRole,
  fetchRoles,
  getRoleById,
  updateRole,
} from "../../../services/rolesService";

import { t } from "i18next";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { fetchScopes } from "../../../services/scopesService";
import { InputText } from "primereact/inputtext";
import { hasPermission, Permission } from "../../../utils/permissions";
import RoleCard from "./components/RoleCard";
import CreateRoleForm from "./components/CreateRoleForm";
import EditRoleDialog from "./components/EditRoleDialog";
import RoleDetailsDialog from "./components/RoleDetailsDialog";
import DeleteRoleDialog from "./components/DeleteRoleDialog";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingRole, setCreatingRole] = useState<boolean>(false);
  const [updatingRole, setUpdatingRole] = useState<boolean>(false);
  const [deletingRole, setDeletingRole] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Dialog visibility states
  const [editDialogVisible, setEditDialogVisible] = useState<boolean>(false);
  const [detailsDialogVisible, setDetailsDialogVisible] =
    useState<boolean>(false);
  const [deleteDialogVisible, setDeleteDialogVisible] =
    useState<boolean>(false);

  const toast = useRef<Toast>(null);
  const scopeOptions = useRef<{ label: string; value: string }[]>([]);

  useEffect(() => {
    fetchRolesData();
  }, []);

  const fetchRolesData = async () => {
    try {
      setLoading(true);
      const [fetchedRoles, scopes] = await Promise.all([
        fetchRoles(),
        fetchScopes(),
      ]);

      setRoles(fetchedRoles);
      scopeOptions.current = scopes.map((scope) => ({
        label: scope.name,
        value: scope.id,
      }));
    } catch (err) {
      setError(t("staffTabs.roles.messages.fetchError"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (
    name: string,
    permissions: number,
    scopeIds: string[]
  ) => {
    console.log("Creating role with name:", name);
    console.log("Permissions:", permissions);

    if (!name.trim()) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.roles.messages.nameRequired"),
        life: 3000,
      });
      return;
    }

    try {
      setCreatingRole(true);
      await createRole(name, permissions, scopeIds);
      await fetchRolesData();

      toast.current?.show({
        severity: "success",
        summary: t("common.states.success"),
        detail: t("staffTabs.roles.messages.createSuccess"),
        life: 3000,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.roles.messages.createError"),
        life: 3000,
      });
      console.error(err);
    } finally {
      setCreatingRole(false);
    }
  };

  const handleUpdateRole = async (
    id: string,
    name: string,
    permissions: number,
    scopeIds: string[]
  ) => {
    if (!name.trim()) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.roles.messages.nameRequired"),
        life: 3000,
      });
      return;
    }

    try {
      setUpdatingRole(true);
      await updateRole(id, name, permissions, scopeIds);
      await fetchRolesData();

      toast.current?.show({
        severity: "success",
        summary: t("common.states.success"),
        detail: t("staffTabs.roles.messages.updateSuccess"),
        life: 3000,
      });
      setEditDialogVisible(false);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.roles.messages.updateError"),
        life: 3000,
      });
      console.error(err);
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      setDeletingRole(true);
      await deleteRole(selectedRole.id);
      await fetchRolesData();

      toast.current?.show({
        severity: "success",
        summary: t("common.states.success"),
        detail: t("staffTabs.roles.messages.deleteSuccess"),
        life: 3000,
      });
      setDeleteDialogVisible(false);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.roles.messages.deleteError"),
        life: 3000,
      });
      console.error(err);
    } finally {
      setDeletingRole(false);
    }
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setEditDialogVisible(true);
  };

  const openDetailsDialog = async (role: Role) => {
    try {
      // Fetch the latest role data to ensure we have all relationships
      const fetchedRole = await getRoleById(role.id);
      setSelectedRole(fetchedRole);
      setDetailsDialogVisible(true);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.roles.messages.fetchDetailError"),
        life: 3000,
      });
      console.error(err);
    }
  };

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogVisible(true);
  };

  // Check if role is owner role (has all permissions)
  const isOwnerRole = (role: Role) => {
    return hasPermission(role.permissions, Permission.OWNER);
  };

  // Filter roles based on search query
  const filteredRoles = searchQuery
    ? roles.filter((role) =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : roles;

  return (
    <div className="p-4 min-h-screen mb-28">
      <Toast ref={toast} />

      {/* Dialogs */}
      <EditRoleDialog
        visible={editDialogVisible}
        role={selectedRole}
        scopeOptions={scopeOptions.current}
        onHide={() => setEditDialogVisible(false)}
        onSave={handleUpdateRole}
        loading={updatingRole}
        isOwnerRole={selectedRole ? isOwnerRole(selectedRole) : false}
      />

      <RoleDetailsDialog
        visible={detailsDialogVisible}
        role={selectedRole}
        onHide={() => setDetailsDialogVisible(false)}
        onEdit={() => {
          setDetailsDialogVisible(false);
          setEditDialogVisible(true);
        }}
        isOwnerRole={selectedRole ? isOwnerRole(selectedRole) : false}
      />

      <DeleteRoleDialog
        visible={deleteDialogVisible}
        role={selectedRole}
        onHide={() => setDeleteDialogVisible(false)}
        onConfirm={handleDeleteRole}
        loading={deletingRole}
      />

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-6">
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          <p className="mt-4 text-gray-600">{t("common.states.loading")}</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <Message
          severity="error"
          text={error}
          className="w-full mb-4"
          style={{ borderRadius: "8px" }}
        />
      )}

      {/* Search bar and header */}
      {!loading && !error && (
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
            <h1 className="text-2xl font-bold text-white">
              {t("navigation.staff.roles")}
            </h1>
            <span className="p-input-icon-right w-full md:w-1/3">
              <i className="pi pi-search" style={{ right: "10px" }} />
              <InputText
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("staffTabs.roles.search") || "Search roles..."}
                className="w-full"
                style={{ paddingRight: "35px" }}
              />
            </span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && roles.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-white/10 backdrop-blur-md rounded-lg shadow">
          <i className="pi pi-inbox text-5xl text-gray-400 mb-4"></i>
          <p className="text-gray-300 text-xl">
            {t("staffTabs.roles.messages.notFound")}
          </p>
        </div>
      )}

      {/* Roles grid */}
      {!loading && !error && (
        <div className="container mx-auto px-2">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Create new role card */}
            <CreateRoleForm
              scopeOptions={scopeOptions.current}
              onCreateRole={handleCreateRole}
              isLoading={creatingRole}
            />

            {/* Roles list */}
            {filteredRoles.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onEdit={() => openEditDialog(role)}
                onDelete={() => openDeleteDialog(role)}
                onViewDetails={() => openDetailsDialog(role)}
                isOwnerRole={isOwnerRole(role)}
              />
            ))}
          </div>

          {/* No results from search */}
          {!loading && !error && filteredRoles.length === 0 && searchQuery && (
            <div className="flex flex-col items-center justify-center p-8 mt-6 bg-white/10 backdrop-blur-md rounded-lg shadow">
              <i className="pi pi-search text-4xl text-gray-400 mb-3"></i>
              <p className="text-gray-300 text-lg">
                {t("staffTabs.roles.noSearchResults") ||
                  "No roles found matching your search."}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
