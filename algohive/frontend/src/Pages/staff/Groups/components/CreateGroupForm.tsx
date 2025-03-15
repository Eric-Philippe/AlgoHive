import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { t } from "i18next";

interface CreateGroupFormProps {
  selectedScope: string | null;
  onCreateGroup: (name: string, description: string) => void;
  isLoading: boolean;
}

/**
 * Component for creating a new group
 */
const CreateGroupForm: React.FC<CreateGroupFormProps> = ({
  selectedScope,
  onCreateGroup,
  isLoading,
}) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  const handleSubmit = () => {
    onCreateGroup(name, description);
    // Form will be reset after successful creation by the parent component
  };

  return (
    <div className="p-4 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-amber-500">
          {t("staffTabs.groups.new")}
        </h2>
        <i className="pi pi-plus-circle text-4xl text-amber-500"></i>
      </div>

      <div className="mb-3">
        <label
          htmlFor="groupName"
          className="block text-sm font-medium text-white mb-1"
        >
          {t("staffTabs.groups.name")}
        </label>
        <InputText
          id="groupName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full"
          placeholder={t("staffTabs.groups.groupName")}
          disabled={!selectedScope || isLoading}
        />
      </div>

      <div className="mb-3">
        <label
          htmlFor="groupDescription"
          className="block text-sm font-medium text-white mb-1"
        >
          {t("staffTabs.groups.description")}
        </label>
        <InputTextarea
          id="groupDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full"
          placeholder={t("staffTabs.groups.groupDescription")}
          disabled={!selectedScope || isLoading}
        />
      </div>

      <div className="flex justify-end mt-4">
        <Button
          label={t("staffTabs.groups.create")}
          icon="pi pi-plus"
          className="p-button-primary"
          onClick={handleSubmit}
          loading={isLoading}
          disabled={!selectedScope || isLoading}
        />
      </div>
    </div>
  );
};

export default CreateGroupForm;
