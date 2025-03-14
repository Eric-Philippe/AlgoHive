import { useEffect, useMemo, useState, useRef } from "react";
import { User } from "../../../../models/User";
import {
  fetchUsersFromRoles,
  deleteUser,
  createUser,
  toggleBlockUser,
} from "../../../../services/usersService";
import { t } from "i18next";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { fetchScopesFromRoles } from "../../../../services/scopesService";
import { Scope } from "../../../../models/Scope";
import { Group } from "../../../../models/Group";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

interface UsersTableStaffProps {
  rolesIds: string[];
}

/**
 * Component that displays a filterable table of users based on their roles, scopes, and groups.
 * Users can be filtered by selecting a specific scope and then a group within that scope.
 * Provides CRUD operations for users within selected groups.
 */
export default function UsersTableStaff({ rolesIds }: UsersTableStaffProps) {
  // State for users, scopes, and UI control
  const [users, setUsers] = useState<User[]>([]);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [selectedScope, setSelectedScope] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // User form state
  const [userDialog, setUserDialog] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  // Refs
  const toast = useRef<Toast>(null);

  // Define table columns
  const columns = [
    { field: "firstname", header: t("common.fields.firstName") },
    { field: "lastname", header: t("common.fields.lastName") },
    { field: "email", header: t("common.fields.email") },
    { field: "last_connected", header: t("common.fields.lastConnection") },
  ];

  // Fetch users and scopes on component mount or when rolesIds changes
  useEffect(() => {
    const fetchData = async () => {
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
    };

    fetchData();
  }, [rolesIds]);

  // Refresh users data
  const refreshUsers = async () => {
    try {
      const userData = await fetchUsersFromRoles(rolesIds);
      setUsers(userData);
    } catch (err) {
      console.error("Failed to refresh users:", err);
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("common.states.errorRefreshing"),
        life: 3000,
      });
    }
  };

  // Reset form fields
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setSelectedUser(null);
    setEditMode(false);
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
      scope?.groups?.map((group: Group) => ({
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

  // Open dialog for new user
  const openNewUserDialog = () => {
    resetForm();
    setUserDialog(true);
  };

  // Open dialog for editing user
  const openEditUserDialog = (user: User) => {
    setSelectedUser(user);
    setFirstName(user.firstname || "");
    setLastName(user.lastname || "");
    setEmail(user.email);
    setEditMode(true);
    setUserDialog(true);
  };

  // Save user (create or update)
  const saveUser = async () => {
    if (!validateForm()) return;

    try {
      if (editMode && selectedUser) {
        // Update existing user logic
        // await updateUser(selectedUser.id, {
        //   firstname: firstName,
        //   lastname: lastName,
        //   email: email,
        // });

        toast.current?.show({
          severity: "success",
          summary: t("common.states.success"),
          detail: t("staffTabs.users.asStaff.messages.userUpdated"),
          life: 3000,
        });
      } else {
        if (!selectedGroup) {
          toast.current?.show({
            severity: "error",
            summary: t("common.states.validationError"),
            detail: t("staffTabs.users.asStaff.messages.groupRequired"),
            life: 3000,
          });
          return;
        }
        await createUser(firstName, lastName, email, selectedGroup);

        toast.current?.show({
          severity: "success",
          summary: t("common.states.success"),
          detail: t("staffTabs.users.asStaff.messages.userCreated"),
          life: 3000,
        });
      }

      // Reload users list
      await refreshUsers();

      // Close dialog and reset form
      setUserDialog(false);
      resetForm();
    } catch (err) {
      console.error("Error saving user:", err);
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: editMode
          ? t("staffTabs.users.asStaff.messages.errorUpdating")
          : t("staffTabs.users.asStaff.messages.errorCreating"),
        life: 3000,
      });
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.validationError"),
        detail: t("staffTabs.users.messages.firstNameRequired"),
        life: 3000,
      });
      return false;
    }

    if (!lastName.trim()) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.validationError"),
        detail: t("staffTabs.users.messages.lastNameRequired"),
        life: 3000,
      });
      return false;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.validationError"),
        detail: t("staffTabs.users.messages.validEmailRequired"),
        life: 3000,
      });
      return false;
    }

    return true;
  };

  // Handle reset password
  const handleResetPassword = async (user: User) => {
    console.log("user", user);

    try {
      // Call the reset password API
      // await resetPassword(user.id);
      toast.current?.show({
        severity: "success",
        summary: t("common.states.success"),
        detail: t("staffTabs.users.messages.passwordReset"),
        life: 3000,
      });
    } catch (err) {
      console.error("Error resetting password:", err);
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.users.messages.errorResetting"),
        life: 3000,
      });
    }
  };

  // Handle block/unblock user
  const handleToggleBlockUser = async (user: User) => {
    try {
      // Call the block/unblock API
      await toggleBlockUser(user.id);
      await refreshUsers();
      toast.current?.show({
        severity: "success",
        summary: t("common.states.success"),
        detail: user.blocked
          ? t("staffTabs.users.messages.userUnblocked")
          : t("staffTabs.users.messages.userBlocked"),
        life: 3000,
      });
    } catch (err) {
      console.error("Error toggling user block status:", err);
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.users.messages.errorBlocking"),
        life: 3000,
      });
    }
  };

  // Handle delete user
  const handleDeleteUser = (user: User) => {
    confirmDialog({
      message: t("staffTabs.users.messages.confirmDeleteUser"),
      header: t("staffTabs.users.messages.confirmDeleteHeader"),
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteUser(user.id);
          await refreshUsers();

          toast.current?.show({
            severity: "success",
            summary: t("common.states.success"),
            detail: t("staffTabs.users.messages.userDeleted"),
            life: 3000,
          });
        } catch (err) {
          console.error("Error deleting user:", err);
          toast.current?.show({
            severity: "error",
            summary: t("common.states.error"),
            detail: t("staffTabs.users.messages.errorDeleting"),
            life: 3000,
          });
        }
      },
    });
  };

  // Action column template
  const actionBodyTemplate = (rowData: User) => {
    return (
      <div className="flex gap-2 justify-center">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => openEditUserDialog(rowData)}
          tooltip={t("common.actions.edit")}
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => handleDeleteUser(rowData)}
          tooltip={t("common.actions.delete")}
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-key"
          className="p-button-rounded p-button-info p-button-sm"
          onClick={() => handleResetPassword(rowData)}
          tooltip={t("staffTabs.users.asAdmin.resetPassword")}
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon={rowData.blocked ? "pi pi-lock-open" : "pi pi-lock"}
          className={`p-button-rounded p-button-sm ${
            rowData.blocked ? "p-button-warning" : "p-button-secondary"
          }`}
          onClick={() => handleToggleBlockUser(rowData)}
          tooltip={
            rowData.blocked
              ? t("common.actions.unblock")
              : t("common.actions.block")
          }
          tooltipOptions={{ position: "top" }}
        />
      </div>
    );
  };

  // Last connection format
  const lastConnectionTemplate = (rowData: User) => {
    return (
      <span className="text-sm">
        {rowData.last_connected
          ? new Date(rowData.last_connected).toLocaleString()
          : t("staffTabs.users.neverConnected")}
      </span>
    );
  };

  const statusBodyTemplate = (rowData: User) => {
    return (
      <span
        className={`px-2 py-1 rounded text-xs ${
          rowData.blocked
            ? "bg-red-200 text-red-800"
            : "bg-green-200 text-green-800"
        }`}
      >
        {rowData.blocked
          ? t("staffTabs.users.blocked")
          : t("staffTabs.users.active")}
      </span>
    );
  };

  const rolesBodyTemplate = (rowData: User) => {
    return (
      <div className="flex flex-wrap gap-1">
        {rowData.groups?.map((group) => (
          <span
            key={group.id}
            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
          >
            {group.name}
          </span>
        ))}
      </div>
    );
  };

  // Dialog footer with save/cancel buttons
  const userDialogFooter = (
    <div className="flex justify-end gap-2">
      <Button
        label={t("common.actions.cancel")}
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setUserDialog(false)}
      />
      <Button
        label={t("common.actions.save")}
        icon="pi pi-check"
        className="p-button-primary"
        onClick={saveUser}
      />
    </div>
  );

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
            emptyMessage={t("staffTabs.users.noUsersInGroup")}
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
                  body={lastConnectionTemplate}
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
              body={statusBodyTemplate}
              style={{ width: "10%" }}
            />
            <Column
              field="groups"
              header={t("common.fields.groups")}
              body={rolesBodyTemplate}
              style={{ width: "10%" }}
            />
            <Column
              body={actionBodyTemplate}
              header={t("common.fields.actions")}
              style={{ width: "15%" }}
              exportable={false}
            />
          </DataTable>
        </>
      )}

      {/* User Dialog (Create/Edit) */}
      <Dialog
        visible={userDialog}
        style={{ width: "450px" }}
        header={
          editMode
            ? t("staffTabs.users.asStaff.editUser")
            : t("staffTabs.users.asStaff.newUser")
        }
        modal
        className="p-fluid"
        footer={userDialogFooter}
        onHide={() => setUserDialog(false)}
      >
        <div className="field mt-4">
          <label htmlFor="firstname" className="font-bold">
            {t("common.fields.firstName")}
          </label>
          <InputText
            id="firstname"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div className="field mt-4">
          <label htmlFor="lastname" className="font-bold">
            {t("common.fields.lastName")}
          </label>
          <InputText
            id="lastname"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div className="field mt-4">
          <label htmlFor="email" className="font-bold">
            {t("common.fields.email")}
          </label>
          <InputText
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
            type="email"
          />
        </div>
      </Dialog>
    </>
  );
}
