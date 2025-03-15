import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Group } from "../../../../models/Group";
import { t } from "i18next";

interface EditGroupDialogProps {
  visible: boolean;
  group: Group | null;
  onHide: () => void;
  onSave: (id: string, name: string, description: string) => void;
  loading: boolean;
}

/**
 * Dialog component for editing a group
 */
const EditGroupDialog: React.FC<EditGroupDialogProps> = ({
  visible,
  group,
  onHide,
  onSave,
  loading,
}) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Reset form when group changes or dialog opens
  useEffect(() => {
    if (group) {
      setName(group.name);
      setDescription(group.description || "");
    }
  }, [group, visible]);

  const handleSave = () => {
    if (group) {
      onSave(group.id, name, description);
    }
  };

  const renderFooter = () => {
    return (
      <div>
        <Button
          label={t("common.actions.cancel")}
          icon="pi pi-times"
          className="p-button-text"
          onClick={onHide}
          disabled={loading}
        />
        <Button
          label={t("common.actions.save")}
          icon="pi pi-check"
          className="p-button-primary"
          onClick={handleSave}
          loading={loading}
        />
      </div>
    );
  };

  return (
    <Dialog
      header={t("staffTabs.groups.editGroup")}
      visible={visible}
      onHide={onHide}
      style={{ width: "50vw" }}
      breakpoints={{ "960px": "75vw", "641px": "100vw" }}
      footer={renderFooter()}
      dismissableMask
    >
      {group && (
        <div className="p-fluid">
          <div className="field mb-4">
            <label htmlFor="edit-name" className="font-bold mb-2 block">
              {t("staffTabs.groups.name")}
            </label>
            <InputText
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="edit-description" className="font-bold mb-2 block">
              {t("staffTabs.groups.description")}
            </label>
            <InputTextarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default EditGroupDialog;
