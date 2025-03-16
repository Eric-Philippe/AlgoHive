import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { t } from "i18next";
import { Role } from "../../../../models/Role";
import { Chip } from "primereact/chip";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";
import { hasPermission, permissionsList } from "../../../../utils/permissions";
import { Badge } from "primereact/badge";

interface RoleDetailsDialogProps {
  visible: boolean;
  role: Role | null;
  onHide: () => void;
  onEdit: () => void;
  isOwnerRole: boolean;
}

const RoleDetailsDialog: React.FC<RoleDetailsDialogProps> = ({
  visible,
  role,
  onHide,
  onEdit,
  isOwnerRole,
}) => {
  if (!role) {
    return null;
  }

  const footerContent = (
    <div className="flex justify-end gap-2">
      <Button
        label={t("common.actions.close")}
        icon="pi pi-times"
        onClick={onHide}
        className="p-button-text"
      />
      <Button
        label={t("common.actions.edit")}
        icon="pi pi-pencil"
        onClick={() => {
          onHide();
          onEdit();
        }}
        className="p-button-warning"
        disabled={isOwnerRole}
        autoFocus
      />
    </div>
  );

  return (
    <Dialog
      header={role.name}
      visible={visible}
      style={{ width: "600px" }}
      onHide={onHide}
      modal
      footer={footerContent}
      className="p-fluid"
      dismissableMask
    >
      <div className="mt-2">
        {isOwnerRole && (
          <Tag severity="danger" className="mb-3">
            {t("staffTabs.roles.ownerRole")}
          </Tag>
        )}

        <h3 className="text-lg font-semibold mb-2">
          {t("staffTabs.roles.information")}
        </h3>

        <div className="mb-4">
          <span className="font-medium">{t("staffTabs.roles.id")}: </span>
          <span className="text-gray-700">{role.id}</span>
        </div>

        <Divider />

        <h3 className="text-lg font-semibold mb-3">
          {t("staffTabs.roles.permissions")}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {permissionsList.map((perm) => (
            <Badge
              key={perm.name}
              value={perm.label}
              severity={
                hasPermission(role.permissions, perm.value)
                  ? "success"
                  : "secondary"
              }
            />
          ))}
        </div>

        <Divider />

        <h3 className="text-lg font-semibold mb-3">
          {t("staffTabs.roles.scopes")}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          {role.scopes && role.scopes.length > 0 ? (
            role.scopes.map((scope) => (
              <Chip
                key={scope.id}
                label={scope.name}
                className="bg-blue-700 text-white"
              />
            ))
          ) : (
            <p className="text-gray-500 italic">
              {t("staffTabs.roles.noScopes")}
            </p>
          )}
        </div>

        <Divider />

        <h3 className="text-lg font-semibold mb-3">
          {t("staffTabs.roles.users")}
        </h3>

        <div className="mb-4">
          <span className="font-medium">
            {t("staffTabs.roles.usersWithRole")}:{" "}
          </span>
          <span className="text-gray-700">
            {role.users && role.users.length > 0 ? role.users.length : "0"}{" "}
            {t("staffTabs.roles.usersCount")}
          </span>
        </div>

        {role.users && role.users.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {role.users.slice(0, 10).map((user) => (
              <Chip
                key={user.id}
                label={`${user.firstname} ${user.lastname}`}
                className="bg-purple-700 text-white"
              />
            ))}
            {role.users.length > 10 && (
              <Chip
                label={`+${role.users.length - 10} ${t(
                  "staffTabs.roles.more"
                )}`}
                className="bg-gray-500 text-white"
              />
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default RoleDetailsDialog;
