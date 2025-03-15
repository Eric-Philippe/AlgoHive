import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { t } from "i18next";
import { Role } from "../../../../models/Role";

interface DeleteRoleDialogProps {
  visible: boolean;
  role: Role | null;
  onHide: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

const DeleteRoleDialog: React.FC<DeleteRoleDialogProps> = ({
  visible,
  role,
  onHide,
  onConfirm,
  loading,
}) => {
  if (!role) {
    return null;
  }

  const footerContent = (
    <div className="flex justify-end gap-2">
      <Button
        label={t("common.actions.cancel")}
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label={t("common.actions.delete")}
        icon="pi pi-trash"
        onClick={onConfirm}
        className="p-button-danger"
        loading={loading}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={t("staffTabs.roles.deleteRole")}
      visible={visible}
      style={{ width: "450px" }}
      onHide={onHide}
      modal
      footer={footerContent}
      dismissableMask
    >
      <div className="align-items-center p-5 text-center">
        <i className="pi pi-exclamation-triangle text-5xl text-yellow-500 mb-4" />
        <h4 className="mb-2">{t("staffTabs.roles.confirmDelete")}</h4>
        <p className="mb-0">
          {t("staffTabs.roles.confirmDeleteMessage", { name: role.name })}
        </p>
        {role.users && role.users.length > 0 && (
          <div className="mt-3 p-3 border-1 border-yellow-500 bg-yellow-100 text-yellow-700 rounded">
            <i className="pi pi-exclamation-circle mr-2" />
            {t("staffTabs.roles.warningUsersAssigned", {
              count: role.users.length,
              users: role.users.length > 1 ? "users" : "user",
            })}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default DeleteRoleDialog;
