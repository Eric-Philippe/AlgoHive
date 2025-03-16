import { useState, useRef } from "react";
import { User } from "../models/User";
import { Toast } from "primereact/toast";
import { t } from "i18next";
import { confirmDialog } from "primereact/confirmdialog";
import { UserFormFields } from "../components/ui/UsersTable/shared/UserForm";

/**
 * Custom hook for managing user operations (create, update, delete, block/unblock)
 */
export const useUserManagement = (refreshDataCallback: () => Promise<void>) => {
  // Form state
  const [userDialog, setUserDialog] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formFields, setFormFields] = useState<UserFormFields>({
    firstName: "",
    lastName: "",
    email: "",
    selectedRoles: [],
    selectedGroup: null,
  });

  // Reference to toast component
  const toast = useRef<Toast>(null);

  /**
   * Updates a single form field value
   */
  const updateFormField = (
    field: string,
    value: string | number | string[] | null
  ) => {
    setFormFields((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Resets form to initial state
   */
  const resetForm = () => {
    setFormFields({
      firstName: "",
      lastName: "",
      email: "",
      selectedRoles: [],
      selectedGroup: null,
    });
    setSelectedUser(null);
    setEditMode(false);
  };

  /**
   * Opens dialog for creating a new user
   */
  const openNewUserDialog = () => {
    resetForm();
    setUserDialog(true);
  };

  /**
   * Opens dialog for editing an existing user
   */
  const openEditUserDialog = (user: User) => {
    setSelectedUser(user);
    setFormFields({
      firstName: user.firstname || "",
      lastName: user.lastname || "",
      email: user.email,
      selectedRoles: user.roles?.map((role) => role.id) || [],
      selectedGroup: user.groups?.[0]?.id || null,
    });
    setEditMode(true);
    setUserDialog(true);
  };

  /**
   * Validates form fields
   */
  const validateForm = (requireRole: boolean = false): boolean => {
    const { firstName, lastName, email, selectedRoles } = formFields;

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

    if (requireRole && selectedRoles?.length === 0) {
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

  /**
   * Confirms and handles user deletion
   */
  const confirmDeleteUser = (
    user: User,
    deleteUserFn: (id: string) => Promise<void>
  ) => {
    confirmDialog({
      message: t("staffTabs.users.messages.confirmDeleteUser"),
      header: t("staffTabs.users.messages.confirmDeleteHeader"),
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteUserFn(user.id);
          await refreshDataCallback();

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

  /**
   * Handles password reset confirmation
   */
  const confirmResetPassword = (
    user: User,
    resetPasswordFn?: (id: string) => Promise<void>
  ) => {
    confirmDialog({
      message: t("staffTabs.users.messages.confirmResetPass"),
      header: t("staffTabs.users.messages.confirmResetPassHeader"),
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          if (resetPasswordFn) {
            await resetPasswordFn(user.id);
          } else {
            console.log("Mock reset password for:", user.email);
          }

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

  return {
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
  };
};
