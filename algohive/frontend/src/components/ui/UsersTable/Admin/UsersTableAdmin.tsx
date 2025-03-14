import { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { t } from "i18next";
import { User } from "../../../../models/User";
import { Role } from "../../../../models/Role";
import {
  createStaffUser,
  deleteUser,
  fetchUsers,
  toggleBlockUser,
  // createUser,
  // updateUser,
  // blockUser,
  // unblockUser,
  // resetPassword,
  // updateUserRoles
} from "../../../../services/usersService";
import { fetchRoles } from "../../../../services/rolesService";
import { isStaff, roleIsOwner } from "../../../../utils/permissions";

export default function UsersTableAdmin() {
  // State variables
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // User form states
  const [userDialog, setUserDialog] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // New user form
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  // Refs
  const toast = useRef<Toast>(null);

  // Load users and roles on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load users and roles in parallel
        const [usersData, rolesData] = await Promise.all([
          fetchUsers(),
          fetchRoles(),
        ]);

        setUsers(usersData.filter((user) => isStaff(user)));
        setRoles(rolesData.filter((role) => !roleIsOwner(role)));
      } catch (err) {
        console.error("Error loading data:", err);
        setError(t("common.states.errorMessage"));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshUsers = async (users: User[]) => {
    setUsers(users.filter((user) => isStaff(user)));
  };

  // Reset form fields
  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setSelectedRoles([]);
    setSelectedUser(null);
    setEditMode(false);
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
    setSelectedRoles(
      user.roles
        ? user.roles.filter((role) => !roleIsOwner(role)).map((role) => role.id)
        : []
    );
    setEditMode(true);
    setUserDialog(true);
  };

  // Save user (create or update)
  const saveUser = async () => {
    if (!validateForm()) return;

    try {
      if (editMode && selectedUser) {
        // Update existing user
        // await updateUser(selectedUser.id, {
        //   firstname: firstName,
        //   lastname: lastName,
        //   email: email,
        // });

        // Update roles if changed
        // await updateUserRoles(selectedUser.id, selectedRoles);

        toast.current?.show({
          severity: "success",
          summary: t("common.states.success"),
          detail: t("staffTabs.users.asAdmin.messages.userUpdated"),
          life: 3000,
        });
      } else {
        // Create new user
        await createStaffUser(firstName, lastName, email, selectedRoles);

        toast.current?.show({
          severity: "success",
          summary: t("common.states.success"),
          detail: t("staffTabs.users.asAdmin.messages.userCreated"),
          life: 3000,
        });
      }

      // Reload users list
      const updatedUsers = await fetchUsers();
      refreshUsers(updatedUsers);

      // Close dialog and reset form
      setUserDialog(false);
      resetForm();
    } catch (err) {
      console.error("Error saving user:", err);
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: editMode
          ? t("staffTabs.users.asAdmin.messages.errorUpdating")
          : t("staffTabs.users.asAdmin.messages.errorCreating"),
        life: 3000,
      });
    }
  };

  // Handle block/unblock user
  const handleToggleBlockUser = async (user: User) => {
    try {
      // Call the block/unblock API
      await toggleBlockUser(user.id);

      // Update the user list
      const updatedUsers = await fetchUsers();
      refreshUsers(updatedUsers);

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

  // Handle password reset
  const handleResetPassword = (user: User) => {
    console.log("Reset password for user:", user);

    confirmDialog({
      message: t("staffTabs.users.messages.confirmResetPass"),
      header: t("staffTabs.users.messages.confirmResetPassHeader"),
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
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
      },
    });
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

          // Reload users list
          const updatedUsers = await fetchUsers();
          refreshUsers(updatedUsers);

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

    if (selectedRoles.length === 0) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.validationError"),
        detail: t("staffTabs.users.asAdmin.messages.roleRequired"),
        life: 3000,
      });
      return false;
    }

    return true;
  };

  // Custom cell templates for DataTable
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
        <Button
          icon="pi pi-key"
          className="p-button-rounded p-button-info p-button-sm"
          onClick={() => handleResetPassword(rowData)}
          tooltip={t("staffTabs.users.asAdmin.resetPassword")}
          tooltipOptions={{ position: "top" }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => handleDeleteUser(rowData)}
          tooltip={t("common.actions.delete")}
          tooltipOptions={{ position: "top" }}
        />
      </div>
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

  const lastConnectionTemplate = (rowData: User) => {
    return (
      <span className="text-sm">
        {rowData.last_connected
          ? new Date(rowData.last_connected).toLocaleString()
          : t("staffTabs.users.neverConnected")}
      </span>
    );
  };

  const rolesBodyTemplate = (rowData: User) => {
    return (
      <div className="flex flex-wrap gap-1">
        {rowData.roles?.map((role) => (
          <span
            key={role.id}
            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
          >
            {role.name}
          </span>
        ))}
      </div>
    );
  };

  // Role options for MultiSelect
  const roleOptions = roles.map((role) => ({
    label: role.name,
    value: role.id,
  }));

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

  // Render loading spinner if loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <ProgressSpinner style={{ width: "50px", height: "50px" }} />
        <p className="mt-4 text-gray-600">{t("staff.common.loading")}</p>
      </div>
    );
  }

  // Render error message if error occurred
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

  return (
    <div className="card p-4">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Header with title and add button */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">
          {t("staffTabs.users.asAdmin.title")}
        </h1>
        <Button
          label={t("staffTabs.users.asAdmin.new")}
          icon="pi pi-plus"
          className="p-button-primary"
          onClick={openNewUserDialog}
        />
      </div>

      {/* Users DataTable */}
      <DataTable
        value={users}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        tableStyle={{ minWidth: "50rem" }}
        emptyMessage={t("staff.users.noUsers")}
        className="p-datatable-sm p-datatable-gridlines"
        sortField="lastname"
        sortOrder={1}
        removableSort
      >
        <Column
          field="firstname"
          header={t("common.fields.firstName")}
          sortable
        />
        <Column
          field="lastname"
          header={t("common.fields.lastName")}
          sortable
        />
        <Column field="email" header={t("common.fields.email")} sortable />
        <Column
          field="status"
          header={t("common.fields.status")}
          body={statusBodyTemplate}
          style={{ width: "10%" }}
          sortable
          sortField="blocked"
        />
        <Column
          field="last_connected"
          header={t("common.fields.lastConnection")}
          body={lastConnectionTemplate}
          style={{ width: "20%" }}
        />
        <Column
          field="roles"
          header={t("common.fields.roles")}
          body={rolesBodyTemplate}
          style={{ width: "20%" }}
        />
        <Column
          body={actionBodyTemplate}
          header={t("common.fields.actions")}
          style={{ width: "15%" }}
          exportable={false}
        />
      </DataTable>

      {/* User Dialog (Create/Edit) */}
      <Dialog
        visible={userDialog}
        style={{ width: "450px" }}
        header={
          editMode
            ? t("staffTabs.users.asAdmin.editUser")
            : t("staffTabs.users.asAdmin.newStaff")
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

        <div className="field mt-4">
          <label htmlFor="roles" className="font-bold">
            {t("common.fields.roles")}
          </label>
          <MultiSelect
            id="roles"
            value={selectedRoles}
            options={roleOptions}
            onChange={(e) => setSelectedRoles(e.value)}
            placeholder={t("common.selects.roles")}
            display="chip"
            className="w-full mt-1"
          />
        </div>
      </Dialog>
    </div>
  );
}
