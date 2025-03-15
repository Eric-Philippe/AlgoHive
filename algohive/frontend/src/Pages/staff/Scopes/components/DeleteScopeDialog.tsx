import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { t } from "i18next";
import { Scope } from "../../../../models/Scope";

interface DeleteScopeDialogProps {
  visible: boolean;
  scope: Scope | null;
  onHide: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
}

const DeleteScopeDialog: React.FC<DeleteScopeDialogProps> = ({
  visible,
  scope,
  onHide,
  onConfirm,
  loading,
}) => {
  if (!scope) {
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
      header={t("staffTabs.scopes.deleteScope")}
      visible={visible}
      style={{ width: "450px" }}
      onHide={onHide}
      modal
      footer={footerContent}
      dismissableMask
    >
      <div className="flex flex-column align-items-center p-5 text-center">
        <i className="pi pi-exclamation-triangle text-5xl text-yellow-500 mb-4" />
        <h4 className="mb-2">{t("staffTabs.scopes.confirmDelete")}</h4>
        <p className="mb-0">
          {t("staffTabs.scopes.confirmDeleteMessage", { name: scope.name })}
        </p>
      </div>
    </Dialog>
  );
};

export default DeleteScopeDialog;
