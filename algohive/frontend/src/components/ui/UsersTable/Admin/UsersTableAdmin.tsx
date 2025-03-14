import { useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { ConfirmDialog } from "primereact/confirmdialog";
import { t } from "i18next";
import { User } from "../../../../models/User";
import { Role } from "../../../../models/Role";
import {
  createStaffUser,
  deleteUser,
  fetchUsers,
  toggleBlockUser,
} from "../../../../services/usersService";
import { fetchRoles } from "../../../../services/rolesService";
import { isStaff, roleIsOwner } from "../../../../utils/permissions";

// Importation des composants partagés
import UserForm from "../shared/UserForm";
import UserActions from "../shared/UserActions";
import {
  StatusTemplate,
  LastConnectionTemplate,
  RolesTemplate,
} from "../shared/TableTemplates";
import { useUserManagement } from "../../../../hooks/useUserManagement";

/**
 * Component that displays and manages staff users with administrative privileges.
 * Provides CRUD operations for staff users and their roles.
 */
export default function UsersTableAdmin() {
  // State variables
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data function for refreshing users
  const fetchData = async () => {
    try {
      setLoading(true);
      // Load users and roles in parallel
      const [usersData, rolesData] = await Promise.all([
        fetchUsers(),
        fetchRoles(),
      ]);

      // Filter out non-staff users and owner roles
      setUsers(usersData.filter((user) => isStaff(user)));
      setRoles(rolesData.filter((role) => !roleIsOwner(role)));
      setLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(t("common.states.errorMessage"));
      setLoading(false);
    }
  };

  // Use custom hook for user management
  const {
    userDialog,
    setUserDialog,
    editMode,
    selectedUser,
    formFields,
    toast,
    updateFormField,
    resetForm,
    openNewUserDialog,
    openEditUserDialog,
    validateForm,
    confirmDeleteUser,
    confirmResetPassword,
  } = useUserManagement(fetchData);

  // Load users and roles on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Save user (create or update)
  const saveUser = async () => {
    // Validate form with requirement for roles
    if (!validateForm(true)) return;

    try {
      if (editMode && selectedUser) {
        // Update existing user logic would go here
        // await updateUser(selectedUser.id, {
        //   firstname: formFields.firstName,
        //   lastname: formFields.lastName,
        //   email: formFields.email,
        // });

        // Update roles if changed
        // await updateUserRoles(selectedUser.id, formFields.selectedRoles || []);

        toast.current?.show({
          severity: "success",
          summary: t("common.states.success"),
          detail: t("staffTabs.users.asAdmin.messages.userUpdated"),
          life: 3000,
        });
      } else {
        // Create new staff user
        await createStaffUser(
          formFields.firstName,
          formFields.lastName,
          formFields.email,
          formFields.selectedRoles || []
        );

        toast.current?.show({
          severity: "success",
          summary: t("common.states.success"),
          detail: t("staffTabs.users.asAdmin.messages.userCreated"),
          life: 3000,
        });
      }

      // Reload users list
      await fetchData();

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
      await toggleBlockUser(user.id);
      await fetchData();

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

  // Role options for MultiSelect
  const roleOptions = roles.map((role) => ({
    label: role.name,
    value: role.id,
  }));

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

      {/* Staff Users DataTable */}
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
          body={StatusTemplate}
          style={{ width: "10%" }}
          sortable
          sortField="blocked"
        />
        <Column
          field="last_connected"
          header={t("common.fields.lastConnection")}
          body={LastConnectionTemplate}
          style={{ width: "20%" }}
        />
        <Column
          field="roles"
          header={t("common.fields.roles")}
          body={RolesTemplate}
          style={{ width: "20%" }}
        />
        <Column
          body={(rowData) => (
            <UserActions
              user={rowData}
              onEdit={openEditUserDialog}
              onToggleBlock={handleToggleBlockUser}
              onResetPassword={(user) => confirmResetPassword(user)}
              onDelete={(user) => confirmDeleteUser(user, deleteUser)}
            />
          )}
          header={t("common.fields.actions")}
          style={{ width: "15%" }}
          exportable={false}
        />
      </DataTable>

      {/* User Dialog (Create/Edit) */}
      <UserForm
        visible={userDialog}
        onHide={() => setUserDialog(false)}
        onSave={saveUser}
        editMode={editMode}
        fields={formFields}
        onFieldChange={updateFormField}
        headerPrefix="staffTabs.users.asAdmin"
        roleOptions={roleOptions}
        showRoles={true}
        isAdmin={true}
      />
    </div>
  );
}
