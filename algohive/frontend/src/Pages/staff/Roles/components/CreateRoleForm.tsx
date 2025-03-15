import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { t } from "i18next";
import { Card } from "primereact/card";
import { permissionsList } from "../../../../utils/permissions";

interface CreateRoleFormProps {
  scopeOptions: { label: string; value: string }[];
  onCreateRole: (
    name: string,
    permissions: number,
    selectedScopes: string[]
  ) => Promise<void>;
  isLoading: boolean;
}

const CreateRoleForm: React.FC<CreateRoleFormProps> = ({
  scopeOptions,
  onCreateRole,
  isLoading,
}) => {
  const [name, setName] = useState<string>("");
  const [permissions, setPermissions] = useState<number>(0);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);

  const togglePermission = (permission: number) => {
    setPermissions((prev) => prev ^ permission); // Toggle using XOR
  };

  const hasPermission = (permission: number) => {
    return (permissions & permission) !== 0;
  };

  const handleSubmit = async () => {
    await onCreateRole(name, permissions, selectedScopes);
    // Reset form after successful creation
    setName("");
    setPermissions(0);
    setSelectedScopes([]);
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
            {t("staffTabs.roles.new")}
          </h2>
          <i className="pi pi-plus-circle text-3xl text-amber-500"></i>
        </div>

        <div className="mb-3">
          <label
            htmlFor="roleName"
            className="block text-sm font-medium text-white mb-1"
          >
            {t("staffTabs.roles.name")}
          </label>
          <InputText
            id="roleName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
            placeholder={t("common.fields.name")}
          />
        </div>

        <div className="mb-3">
          <label
            htmlFor="rolePermissions"
            className="block text-sm font-medium text-white mb-1"
          >
            {t("staffTabs.roles.permissions")}
          </label>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {permissionsList.map((perm) => (
              <div key={perm.name} className="flex items-center">
                <Checkbox
                  inputId={`perm_${perm.name}`}
                  checked={hasPermission(perm.value)}
                  onChange={() => togglePermission(perm.value)}
                />
                <label
                  htmlFor={`perm_${perm.name}`}
                  className="ml-2 text-white cursor-pointer"
                >
                  {perm.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label
            htmlFor="scopeIds"
            className="block text-sm font-medium text-white mb-1"
          >
            {t("staffTabs.roles.scopes")}
          </label>
          <MultiSelect
            id="scopeIds"
            value={selectedScopes}
            options={scopeOptions}
            onChange={(e) => setSelectedScopes(e.value)}
            placeholder={t("common.selects.scopes")}
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

export default CreateRoleForm;
