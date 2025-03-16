import { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { User } from "../../../../models/User";
import {
  fetchUsersFromRoles,
  deleteUser,
  createUser,
  toggleBlockUser,
  resetPassword,
  updateTargetUserProfile,
} from "../../../../services/usersService";
import { t } from "i18next";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { fetchScopesFromRoles } from "../../../../services/scopesService";
import { Scope } from "../../../../models/Scope";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ConfirmDialog } from "primereact/confirmdialog";
import { useUserManagement } from "../../../../hooks/useUserManagement";
import UserForm from "../shared/UserForm";
import UserActions from "../shared/UserActions";
import {
  StatusTemplate,
  LastConnectionTemplate,
  GroupsTemplate,
} from "../shared/TableTemplates";

interface UsersTableStaffProps {
  rolesIds: string[];
  toast: RefObject<Toast | null>;
}

/**
 * Component that displays a filterable table of users based on their roles, scopes, and groups.
 * Users can be filtered by selecting a specific scope and then a group within that scope.
 * Provides CRUD operations for users within selected groups.
 */
export default function UsersTableStaff({
  rolesIds,
  toast,
}: UsersTableStaffProps) {
  // State for users, scopes, and UI control
  const [users, setUsers] = useState<User[]>([]);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [selectedScope, setSelectedScope] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch users and scopes in parallel for better performance
      const [userData, scopesData] = await Promise.all([
        fetchUsersFromRoles(rolesIds),
        fetchScopesFromRoles(rolesIds),
      ]);

      setUsers(userData);
      setScopes(scopesData);
    } catch (err) {
      setError(t("common.states.errorMessage"));
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [rolesIds]);

  // Use custom hook for user management
  const {
    userDialog,
    setUserDialog,
    editMode,
    selectedUser,
    formFields,
    updateFormField,
    resetForm,
    openNewUserDialog,
    openEditUserDialog,
    validateForm,
    confirmDeleteUser,
  } = useUserManagement(fetchData);

  // Fetch users and scopes on component mount or when rolesIds changes
  useEffect(() => {
    fetchData();
  }, [fetchData, rolesIds]);

  // Save user (create or update)
  const saveUser = async () => {
    if (!validateForm()) return;

    try {
      if (editMode && selectedUser) {
        // Update existing user logic
        await updateTargetUserProfile(
          selectedUser.id,
          formFields.firstName,
          formFields.lastName,
          formFields.email
        );

        toast?.current?.show({
          severity: "success",
          summary: t("common.states.success"),
          detail: t("staffTabs.users.asStaff.messages.userUpdated"),
          life: 3000,
        });
      } else {
        if (!selectedGroup) {
          toast?.current?.show({
            severity: "error",
            summary: t("common.states.validationError"),
            detail: t("staffTabs.users.asStaff.messages.groupRequired"),
            life: 3000,
          });
          return;
        }
        await createUser(
          formFields.firstName,
          formFields.lastName,
          formFields.email,
          selectedGroup
        );

        toast?.current?.show({
          severity: "success",
          summary: t("common.states.success"),
          detail: t("staffTabs.users.asStaff.messages.userCreated"),
          life: 3000,
        });
      }

      // Reload users list and close dialog
      await fetchData();
      setUserDialog(false);
      resetForm();
    } catch (err) {
      console.error("Error saving user:", err);
      toast?.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: editMode
          ? t("staffTabs.users.asStaff.messages.errorUpdating")
          : t("staffTabs.users.asStaff.messages.errorCreating"),
        life: 3000,
      });
    }
  };

  // Handle block/unblock user
  const handleToggleBlockUser = async (user: User) => {
    try {
      await toggleBlockUser(user.id);
      await fetchData();
      toast?.current?.show({
        severity: "success",
        summary: t("common.states.success"),
        detail: user.blocked
          ? t("staffTabs.users.messages.userUnblocked")
          : t("staffTabs.users.messages.userBlocked"),
        life: 3000,
      });
    } catch (err) {
      console.error("Error toggling user block status:", err);
      toast?.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.users.messages.errorBlocking"),
        life: 3000,
      });
    }
  };

  // Handle reset password for user
  const handleResetPassword = async (user: User) => {
    try {
      await resetPassword(user.id);
      toast?.current?.show({
        severity: "success",
        summary: t("common.states.success"),
        detail: t("staffTabs.users.messages.passwordReset"),
        life: 3000,
      });
    } catch (err) {
      console.error("Error resetting password:", err);
      toast?.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.users.messages.errorResettingPassword"),
        life: 3000,
      });
    }
  };

  // Memoize scope options to prevent unnecessary recalculations
  const scopeOptions = useMemo(() => {
    return scopes.map((scope) => ({
      label: scope.name,
      value: scope.id,
    }));
  }, [scopes]);

  // Get the available groups for the selected scope
  const groupOptions = useMemo(() => {
    if (!selectedScope) return [];

    const scope = scopes.find((scope) => scope.id === selectedScope);
    return (
      scope?.groups?.map((group) => ({
        label: group.name,
        value: group.id,
      })) || []
    );
  }, [selectedScope, scopes]);

  // Filter users based on selected scope and group
  const filteredUsers = useMemo(() => {
    if (!selectedScope || !selectedGroup || !users) return [];

    return users.filter((user) =>
      user.groups?.some((group) => group.id === selectedGroup)
    );
  }, [users, selectedScope, selectedGroup]);

  // Handle scope selection change
  const handleScopeChange = (value: string | null) => {
    setSelectedScope(value);
    setSelectedGroup(null); // Reset group selection when scope changes
  };

  // Auto-select scope if there is only one
  useEffect(() => {
    if (scopes.length === 1 && !selectedScope) {
      setSelectedScope(scopes[0].id);
    }
  }, [scopes, selectedScope]);

  // Auto-select group if there is only one in the selected scope
  useEffect(() => {
    if (groupOptions.length === 1 && !selectedGroup) {
      setSelectedGroup(groupOptions[0].value);
    }
  }, [groupOptions, selectedGroup]);

  // Define table columns
  const columns = [
    { field: "firstname", header: t("common.fields.firstName") },
    { field: "lastname", header: t("common.fields.lastName") },
    { field: "email", header: t("common.fields.email") },
    { field: "last_connected", header: t("common.fields.lastConnection") },
  ];

  // Render different UI states based on loading, error, and data availability
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <ProgressSpinner style={{ width: "50px", height: "50px" }} />
        <p className="mt-4 text-gray-600">{t("common.states.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Message
        severity="error"
        text={error}
        className="w-full mb-4"
        style={{ borderRadius: "8px" }}
      />
    );
  }

  if (users && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow">
        <i className="pi pi-inbox text-5xl text-gray-400 mb-4"></i>
        <p className="text-gray-600 text-xl">{t("common.states.empty")}</p>
      </div>
    );
  }

  return (
    <>
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Scope selection dropdown */}
      <div className="mb-4">
        <label
          htmlFor="scopes"
          className="block text-sm font-medium text-white mb-1"
        >
          {t("common.selects.scopes")}
        </label>
        <Dropdown
          id="scopes"
          value={selectedScope}
          options={scopeOptions}
          onChange={(e) => handleScopeChange(e.value)}
          placeholder={t("common.selects.scopes")}
          className="w-full"
        />
      </div>

      {/* Group selection dropdown (only shown when a scope is selected) */}
      {selectedScope && (
        <div className="mb-4">
          <label
            htmlFor="groups"
            className="block text-sm font-medium text-white mb-1"
          >
            {t("common.selects.groups")}
          </label>
          <Dropdown
            id="groups"
            value={selectedGroup}
            options={groupOptions}
            onChange={(e) => setSelectedGroup(e.value)}
            placeholder={t("common.selects.groups")}
            className="w-full"
          />
        </div>
      )}

      {/* Users table (only shown when both scope and group are selected) */}
      {selectedScope && selectedGroup && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">
              {t("staffTabs.users.asStaff.title")}
            </h2>
            <Button
              label={t("staffTabs.users.asStaff.new")}
              icon="pi pi-plus"
              className="p-button-primary"
              onClick={openNewUserDialog}
            />
          </div>

          <DataTable
            value={filteredUsers}
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            tableStyle={{ minWidth: "50rem" }}
            emptyMessage={t("staffTabs.users.asStaff.noUsersInGroup")}
            className="p-datatable-sm p-datatable-gridlines"
            sortField="lastname"
            sortOrder={1}
            removableSort
          >
            {columns.map((col, i) =>
              col.field === "last_connected" ? (
                <Column
                  key={i}
                  field={col.field}
                  header={col.header}
                  body={LastConnectionTemplate}
                />
              ) : (
                <Column
                  key={i}
                  field={col.field}
                  header={col.header}
                  sortable
                />
              )
            )}
            <Column
              field="status"
              header={t("common.fields.status")}
              body={StatusTemplate}
              style={{ width: "10%" }}
            />
            <Column
              field="groups"
              header={t("common.fields.groups")}
              body={GroupsTemplate}
              style={{ width: "10%" }}
            />
            <Column
              body={(rowData) => (
                <UserActions
                  user={rowData}
                  onEdit={openEditUserDialog}
                  onToggleBlock={handleToggleBlockUser}
                  onResetPassword={handleResetPassword}
                  onDelete={(user) => confirmDeleteUser(user, deleteUser)}
                />
              )}
              header={t("common.fields.actions")}
              style={{ width: "15%" }}
              exportable={false}
            />
          </DataTable>
        </>
      )}

      {/* User Form Dialog */}
      <UserForm
        visible={userDialog}
        onHide={() => setUserDialog(false)}
        onSave={saveUser}
        editMode={editMode}
        fields={formFields}
        onFieldChange={updateFormField}
        headerPrefix="staffTabs.users.asStaff"
      />
    </>
  );
}
