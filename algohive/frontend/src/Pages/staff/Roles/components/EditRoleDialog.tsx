import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { t } from "i18next";
import { Role } from "../../../../models/Role";
import { hasPermission, permissionsList } from "../../../../utils/permissions";

interface EditRoleDialogProps {
  visible: boolean;
  role: Role | null;
  scopeOptions: { label: string; value: string }[];
  onHide: () => void;
  onSave: (
    id: string,
    name: string,
    permissions: number,
    scopes: string[]
  ) => Promise<void>;
  loading: boolean;
  isOwnerRole: boolean;
}

const EditRoleDialog: React.FC<EditRoleDialogProps> = ({
  visible,
  role,
  scopeOptions,
  onHide,
  onSave,
  loading,
  isOwnerRole,
}) => {
  const [name, setName] = useState<string>("");
  const [permissions, setPermissions] = useState<number>(0);
  const [selectedScopeIds, setSelectedScopeIds] = useState<string[]>([]);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setPermissions(role.permissions);
      setSelectedScopeIds(
        role.scopes ? role.scopes.map((scope) => scope.id) : []
      );
    }
  }, [role]);

  const togglePermission = (permission: number) => {
    setPermissions((prev) => prev ^ permission); // Toggle using XOR
  };

  const handleSave = async () => {
    if (role) {
      await onSave(role.id, name, permissions, selectedScopeIds);
    }
  };

  const footerContent = (
    <div className="flex justify-end gap-2">
      <Button
        label={t("common.actions.cancel")}
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label={t("common.actions.save")}
        icon="pi pi-check"
        onClick={handleSave}
        loading={loading}
        disabled={isOwnerRole}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={t("staffTabs.roles.editRole")}
      visible={visible}
      style={{ width: "450px" }}
      onHide={onHide}
      modal
      footer={footerContent}
      className="p-fluid"
      dismissableMask
    >
      {isOwnerRole && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p>{t("staffTabs.roles.ownerRoleWarning")}</p>
        </div>
      )}

      <div className="field mt-4">
        <label htmlFor="edit-role-name" className="font-bold">
          {t("staffTabs.roles.name")}
        </label>
        <InputText
          id="edit-role-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          className="w-full"
          disabled={isOwnerRole}
        />
      </div>

      <div className="field mt-4">
        <label htmlFor="edit-role-permissions" className="font-bold">
          {t("staffTabs.roles.permissions")}
        </label>
        <div className="grid grid-cols-1 gap-2 mt-2">
          {permissionsList.map((perm) => (
            <div key={perm.name} className="flex items-center">
              <Checkbox
                inputId={`edit_perm_${perm.name}`}
                checked={hasPermission(permissions, perm.value)}
                onChange={() => togglePermission(perm.value)}
                disabled={isOwnerRole}
              />
              <label
                htmlFor={`edit_perm_${perm.name}`}
                className={`ml-2 ${
                  isOwnerRole ? "text-gray-500" : "cursor-pointer"
                }`}
              >
                {perm.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="field mt-4">
        <label htmlFor="edit-role-scopes" className="font-bold">
          {t("staffTabs.roles.scopes")}
        </label>
        <MultiSelect
          id="edit-role-scopes"
          value={selectedScopeIds}
          options={scopeOptions}
          onChange={(e) => setSelectedScopeIds(e.value)}
          display="chip"
          className="w-full"
          disabled={isOwnerRole}
        />
      </div>
    </Dialog>
  );
};

export default EditRoleDialog;
