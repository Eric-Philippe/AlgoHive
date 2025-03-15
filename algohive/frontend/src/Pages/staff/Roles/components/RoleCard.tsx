import React from "react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Badge } from "primereact/badge";
import { Role } from "../../../../models/Role";
import { t } from "i18next";
import { hasPermission, permissionsList } from "../../../../utils/permissions";

interface RoleCardProps {
  role: Role;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
  isOwnerRole: boolean;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  onEdit,
  onDelete,
  onViewDetails,
  isOwnerRole,
}) => {
  return (
    <Card
      className="h-full border border-white/30 hover:shadow-xl transition-all duration-300 bg-white/10 backdrop-blur-md"
      pt={{
        content: { className: "p-0" },
        body: { className: "p-0" },
      }}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-amber-500 truncate">
            {role.name}
            {isOwnerRole && (
              <Badge value="Owner" severity="danger" className="ml-2" />
            )}
          </h2>
          <i className="pi pi-shield text-3xl text-amber-500"></i>
        </div>

        <div className="mb-3">
          <h3 className="text-sm font-medium text-white/90 mb-2">
            {t("staffTabs.roles.permissions")}:
          </h3>
          <div className="flex flex-wrap gap-1 mb-2">
            {permissionsList
              .filter((perm) => hasPermission(role.permissions, perm.value))
              .map((perm) => (
                <Badge
                  key={perm.name}
                  value={perm.label}
                  severity="success"
                  className="mr-1 mb-1"
                />
              ))}
            {!permissionsList.some((perm) =>
              hasPermission(role.permissions, perm.value)
            ) && (
              <span className="text-gray-400 text-sm italic">
                {t("staffTabs.roles.noPermissions")}
              </span>
            )}
          </div>
        </div>

        <div className="mb-3">
          <h3 className="text-sm font-medium text-white/90 mb-1">
            {t("staffTabs.roles.scopes")}:
          </h3>
          <div className="flex flex-wrap gap-1">
            {role.scopes && role.scopes.length > 0 ? (
              role.scopes.map((scope) => (
                <Badge
                  key={scope.id}
                  value={scope.name}
                  severity="info"
                  className="mr-1 mb-1"
                />
              ))
            ) : (
              <span className="text-gray-400 text-sm italic">
                {t("staffTabs.roles.noScopes")}
              </span>
            )}
          </div>
        </div>

        <div className="mb-3">
          <h3 className="text-sm font-medium text-white/90 mb-1">
            {t("staffTabs.roles.users")}:
          </h3>
          <span className="text-white/80">
            {role.users && role.users.length > 0 ? role.users.length : "0"}{" "}
            {t("staffTabs.roles.usersCount")}
          </span>
        </div>

        <div className="flex justify-end mt-auto gap-2">
          <Button
            icon="pi pi-eye"
            tooltip={t("staffTabs.roles.details")}
            onClick={onViewDetails}
            className="p-button p-button-info"
            size="small"
          />
          <Button
            icon="pi pi-pencil"
            tooltip={t("common.actions.edit")}
            onClick={onEdit}
            className="p-button p-button-warning"
            size="small"
            disabled={isOwnerRole}
          />
          <Button
            icon="pi pi-trash"
            tooltip={t("common.actions.delete")}
            onClick={onDelete}
            className="p-button p-button-danger"
            size="small"
            disabled={isOwnerRole}
          />
        </div>
      </div>
    </Card>
  );
};

export default RoleCard;
