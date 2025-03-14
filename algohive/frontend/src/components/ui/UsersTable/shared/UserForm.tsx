import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { t } from "i18next";

export interface UserFormFields {
  firstName: string;
  lastName: string;
  email: string;
  selectedRoles?: string[];
  selectedGroup?: string | null;
}

interface SelectOption {
  label: string;
  value: string;
}

interface UserFormProps {
  visible: boolean;
  onHide: () => void;
  onSave: () => void;
  editMode: boolean;
  fields: UserFormFields;
  onFieldChange: (field: string, value: string | string[] | null) => void;
  headerPrefix: string;
  roleOptions?: SelectOption[];
  showRoles?: boolean;
  isAdmin?: boolean;
}

/**
 * Reusable form component for creating/editing users
 */
const UserForm: React.FC<UserFormProps> = ({
  visible,
  onHide,
  onSave,
  editMode,
  fields,
  onFieldChange,
  headerPrefix,
  roleOptions = [],
  showRoles = false,
  isAdmin = false,
}) => {
  // Dialog footer with save/cancel buttons
  const userDialogFooter = (
    <div className="flex justify-end gap-2">
      <Button
        label={t("common.actions.cancel")}
        icon="pi pi-times"
        className="p-button-text"
        onClick={onHide}
      />
      <Button
        label={t("common.actions.save")}
        icon="pi pi-check"
        className="p-button-primary"
        onClick={onSave}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "450px" }}
      header={
        editMode
          ? t(`${headerPrefix}.editUser`)
          : t(`${headerPrefix}.${isAdmin ? "newStaff" : "newUser"}`)
      }
      modal
      className="p-fluid"
      footer={userDialogFooter}
      onHide={onHide}
    >
      <div className="field mt-4">
        <label htmlFor="firstname" className="font-bold">
          {t("common.fields.firstName")}
        </label>
        <InputText
          id="firstname"
          value={fields.firstName}
          onChange={(e) => onFieldChange("firstName", e.target.value)}
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
          value={fields.lastName}
          onChange={(e) => onFieldChange("lastName", e.target.value)}
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
          value={fields.email}
          onChange={(e) => onFieldChange("email", e.target.value)}
          required
          className="mt-1"
          type="email"
        />
      </div>

      {showRoles && (
        <div className="field mt-4">
          <label htmlFor="roles" className="font-bold">
            {t("common.fields.roles")}
          </label>
          <MultiSelect
            id="roles"
            value={fields.selectedRoles}
            options={roleOptions}
            onChange={(e) => onFieldChange("selectedRoles", e.value)}
            placeholder={t("common.selects.roles")}
            display="chip"
            className="w-full mt-1"
          />
        </div>
      )}
    </Dialog>
  );
};

export default UserForm;
