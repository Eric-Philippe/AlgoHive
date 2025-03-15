import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { t } from "i18next";
import { Card } from "primereact/card";

interface CreateScopeFormProps {
  apiOptions: { label: string; value: string }[];
  onCreateScope: (
    name: string,
    description: string,
    selectedApiIds: string[]
  ) => Promise<void>;
  isLoading: boolean;
}

const CreateScopeForm: React.FC<CreateScopeFormProps> = ({
  apiOptions,
  onCreateScope,
  isLoading,
}) => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedApiIds, setSelectedApiIds] = useState<string[]>([]);

  const handleSubmit = async () => {
    await onCreateScope(name, description, selectedApiIds);
    // Reset form after successful creation
    setName("");
    setDescription("");
    setSelectedApiIds([]);
  };

  return (
    <Card
      className="h-full border border-white/30 hover:shadow-xl transition-all duration-300 bg-white/10 backdrop-blur-md"
      pt={{
        content: { className: "p-0" },
        body: { className: "p-0" },
      }}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-amber-500">
            {t("staffTabs.scopes.new")}
          </h2>
          <i className="pi pi-plus-circle text-3xl text-amber-500"></i>
        </div>

        <div className="mb-3">
          <label
            htmlFor="scopeName"
            className="block text-sm font-medium text-white mb-1"
          >
            {t("staffTabs.scopes.name")}
          </label>
          <InputText
            id="scopeName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
            placeholder={t("common.fields.name")}
          />
        </div>

        <div className="mb-3">
          <label
            htmlFor="scopeDescription"
            className="block text-sm font-medium text-white mb-1"
          >
            {t("staffTabs.scopes.description")}
          </label>
          <InputTextarea
            id="scopeDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full"
            placeholder={t("common.fields.description")}
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="apiIds"
            className="block text-sm font-medium text-white mb-1"
          >
            {t("staffTabs.scopes.catalogs")}
          </label>
          <MultiSelect
            id="apiIds"
            value={selectedApiIds}
            options={apiOptions}
            onChange={(e) => setSelectedApiIds(e.value)}
            placeholder={t("common.selects.catalogs")}
            className="w-full"
            display="chip"
          />
        </div>

        <div className="flex justify-end mt-auto">
          <Button
            label={t("common.actions.create")}
            icon="pi pi-plus"
            className="p-button-primary"
            onClick={handleSubmit}
            loading={isLoading}
          />
        </div>
      </div>
    </Card>
  );
};

export default CreateScopeForm;
