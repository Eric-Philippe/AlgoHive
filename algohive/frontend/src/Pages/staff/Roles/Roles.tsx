import { useState, useEffect, useRef } from "react";
import { Role } from "../../../models/Role";
import "./Roles.css";
import {
  createRole,
  deleteRole,
  fetchRoles,
} from "../../../services/rolesService";

import { t } from "i18next";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { fetchScopes } from "../../../services/scopesService";
import { MultiSelect } from "primereact/multiselect";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Permission } from "../../../utils/permissions";
import { Checkbox } from "primereact/checkbox";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState<string>("");
  const [newRolePermissions, setNewRolePermissions] = useState<number>(0);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [creatingRole, setCreatingRole] = useState<boolean>(false);
  const [deletingRole, setDeletingRole] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  const scopeOptions = useRef<{ label: string; value: string }[]>([]);

  // List of permissions for checkboxes (excluding OWNER)
  const permissionsList = [
    {
      name: "SCOPES",
      value: Permission.SCOPES,
      label: t("staffTabs.roles.permissionTypes.scopes"),
    },
    {
      name: "API_ENV",
      value: Permission.API_ENV,
      label: t("staffTabs.roles.permissionTypes.catalogs"),
    },
    {
      name: "GROUPS",
      value: Permission.GROUPS,
      label: t("staffTabs.roles.permissionTypes.groups"),
    },
    {
      name: "COMPETITIONS",
      value: Permission.COMPETITIONS,
      label: t("staffTabs.roles.permissionTypes.competitions"),
    },
    {
      name: "ROLES",
      value: Permission.ROLES,
      label: t("staffTabs.roles.permissionTypes.roles"),
    },
  ];

  const togglePermission = (permission: number) => {
    setNewRolePermissions((prev) => prev ^ permission); // Toggle using XOR
  };

  const hasPermission = (permission: number) => {
    return (newRolePermissions & permission) !== 0;
  };

  useEffect(() => {
    const getRoles = async () => {
      try {
        setLoading(true);
        const data = await fetchRoles();
        setRoles(data);
        const scopes = await fetchScopes();
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

    getRoles();
  }, []);

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: t("staffTabs.roles.messages.nameRequired"),
        life: 3000,
      });
      return;
    }

    try {
      setCreatingRole(true);
      await createRole(newRoleName, newRolePermissions, selectedScopes);
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: t("staffTabs.roles.messages.createSuccess"),
        life: 3000,
      });

      // Refresh roles list
      const updatedRoles = await fetchRoles();
      setRoles(updatedRoles);

      setNewRoleName("");
      setNewRolePermissions(0);
      setSelectedScopes([]);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: t("staffTabs.roles.messages.createError"),
        life: 3000,
      });
      console.error(err);
    } finally {
      setCreatingRole(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      setDeletingRole(true);
      // Delete role
      await deleteRole(roleId);

      // Refresh roles list
      const updatedRoles = roles.filter((role) => role.id !== roleId);
      setRoles(updatedRoles);

      // Show success message
      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: t("staffTabs.roles.messages.deleteSuccess"),
        life: 3000,
      });

      // Refresh roles list
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: t("staffTabs.roles.messages.deleteError"),
        life: 3000,
      });
      console.error(err);
    } finally {
      setDeletingRole(false);
    }
  };

  return (
    <div className="p-4 min-h-screen mb-28">
      <Toast ref={toast} />

      {loading && (
        <div className="flex flex-col items-center justify-center p-6">
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          <p className="mt-4 text-gray-600">{t("common.states.loading")}</p>
        </div>
      )}

      {error && (
        <Message
          severity="error"
          text={error}
          className="w-full mb-4"
          style={{ borderRadius: "8px" }}
        />
      )}

      {!loading && !error && roles.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow">
          <i className="pi pi-inbox text-5xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 text-xl">
            {t("staffTabs.roles.messages.notFound")}
          </p>
        </div>
      )}

      {!loading && !error && roles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {roles.map((role) => (
            <div key={role.id}>
              <div className="p-4 bg-white rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-800">{role.name}</h2>
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t("staffTabs.roles.permissions") + ":"}
                  </label>
                  {permissionsList.map((perm) => (
                    <div key={perm.name} className="flex items-center">
                      <Checkbox
                        checked={(role.permissions & perm.value) !== 0}
                        disabled
                      />
                      <label className="ml-2 text-gray-600 cursor-not-allowed">
                        {perm.label || perm.name}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t("staffTabs.roles.scopes") + ":"}
                  </label>
                  <div className="flex flex-wrap">
                    {role.scopes && role.scopes.length > 0 ? (
                      role.scopes.map((scope) => (
                        <span
                          key={scope.id}
                          className="bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm mr-2 mb-2"
                        >
                          {scope.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-800">{t("common.states.none")}</p>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {t("staffTabs.roles.userCount") + ":"}
                  </label>
                  <div className="flex flex-wrap">
                    <p className="text-gray-800">
                      {role.users && role.users.length
                        ? role.users.length
                        : "0"}
                    </p>
                  </div>
                </div>
                <div className="mt-8">
                  <Button
                    label={t("common.actions.delete")}
                    className="p-button-danger"
                    disabled={role.permissions == 63 ? true : false}
                    onClick={() => handleDeleteRole(role.id)}
                    loading={deletingRole}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Create new role card */}
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-amber-500">
                {t("staffTabs.roles.new")}
              </h2>
              <i className="pi pi-plus-circle text-4xl text-amber-500"></i>
            </div>

            <div className="mb-3">
              <label
                htmlFor="scopeName"
                className="block text-sm font-medium text-white mb-1"
              >
                {t("staffTabs.roles.name")}
              </label>
              <InputText
                id="scopeName"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                className="w-full"
                placeholder={t("common.fields.name")}
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="rolePermissions"
                className="block text-sm font-medium text-white mb-1"
              >
                {t("staffTabs.roles.permissions")}
              </label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {permissionsList.map((perm) => (
                  <div key={perm.name} className="flex items-center">
                    <Checkbox
                      inputId={`perm_${perm.name}`}
                      checked={hasPermission(perm.value)}
                      onChange={() => togglePermission(perm.value)}
                    />
                    <label
                      htmlFor={`perm_${perm.name}`}
                      className="ml-2 text-white cursor-pointer"
                    >
                      {perm.label || perm.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="apiIds"
                className="block text-sm font-medium text-white mb-1"
              >
                {t("staffTabs.roles.scopes")}
              </label>
              <MultiSelect
                id="apiIds"
                value={selectedScopes}
                options={scopeOptions.current}
                onChange={(e) => setSelectedScopes(e.value)}
                placeholder={t("common.selects.scopes")}
                className="w-full"
                display="chip"
              />
            </div>

            <div className="flex justify-end mt-4">
              <Button
                label={t("common.actions.create")}
                icon="pi pi-plus"
                className="p-button-primary"
                onClick={handleCreateRole}
                loading={creatingRole}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
