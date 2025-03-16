import React from "react";
import { Button } from "primereact/button";
import { t } from "i18next";
import { User } from "../../../../models/User";
import { isOwner, roleIsOwner } from "../../../../utils/permissions";

interface UserActionsProps {
  user: User;
  currentUser?: User | null;
  onEdit: (user: User) => void;
  onToggleBlock: (user: User) => void;
  onResetPassword: (user: User) => void;
  onDelete: (user: User) => void;
}

/**
 * Component that renders user action buttons
 */
const UserActions: React.FC<UserActionsProps> = ({
  user,
  currentUser,
  onEdit,
  onToggleBlock,
  onResetPassword,
  onDelete,
}) => {
  // Check if current user is owner
  const isCurrentUserOwner = currentUser ? isOwner(currentUser) : false;

  // Check if target user is owner
  const isUserOwner = roleIsOwner(user.roles?.find((role) => role));

  // Check if current user is the same as target user
  const isSameUser = currentUser && currentUser.id === user.id;

  // Determine if block button should be shown
  const showBlockButton =
    (isCurrentUserOwner || !isUserOwner) && !(isUserOwner && isSameUser);

  return (
    <div className="flex gap-2 justify-center">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-success p-button-sm"
        onClick={() => onEdit(user)}
        tooltip={t("common.actions.edit")}
        tooltipOptions={{ position: "top" }}
      />
      {showBlockButton && (
        <Button
          icon={user.blocked ? "pi pi-lock-open" : "pi pi-lock"}
          className={`p-button-rounded p-button-sm ${
            user.blocked ? "p-button-warning" : "p-button-secondary"
          }`}
          onClick={() => onToggleBlock(user)}
          tooltip={
            user.blocked
              ? t("common.actions.unblock")
              : t("common.actions.block")
          }
          tooltipOptions={{ position: "top" }}
        />
      )}
      <Button
        icon="pi pi-key"
        className="p-button-rounded p-button-info p-button-sm"
        onClick={() => onResetPassword(user)}
        tooltip={t("staffTabs.users.asAdmin.resetPassword")}
        tooltipOptions={{ position: "top" }}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-sm"
        onClick={() => onDelete(user)}
        disabled={isUserOwner && (isSameUser ? true : false)}
        tooltip={t("common.actions.delete")}
        tooltipOptions={{ position: "top" }}
      />
    </div>
  );
};

export default UserActions;
