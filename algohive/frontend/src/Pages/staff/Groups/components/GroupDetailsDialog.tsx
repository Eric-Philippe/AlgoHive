import React from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Group } from "../../../../models/Group";
import { t } from "i18next";
import { User } from "../../../../models/User";

interface GroupDetailsDialogProps {
  visible: boolean;
  group: Group | null;
  onHide: () => void;
  onEdit: () => void;
}

/**
 * Dialog component for displaying detailed information about a group
 */
const GroupDetailsDialog: React.FC<GroupDetailsDialogProps> = ({
  visible,
  group,
  onHide,
  onEdit,
}) => {
  if (!group) return null;

  const renderFooter = () => {
    return (
      <div>
        <Button
          label={t("common.actions.close")}
          icon="pi pi-times"
          className="p-button-text"
          onClick={onHide}
        />
        <Button
          label={t("common.actions.edit")}
          icon="pi pi-pencil"
          className="p-button-primary"
          onClick={onEdit}
        />
      </div>
    );
  };

  return (
    <Dialog
      header={group.name}
      visible={visible}
      onHide={onHide}
      style={{ width: "50vw" }}
      breakpoints={{ "960px": "75vw", "641px": "100vw" }}
      footer={renderFooter()}
      dismissableMask
    >
      <div>
        <h3 className="text-xl font-semibold mb-2">
          {t("staffTabs.groups.information")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-medium">{t("staffTabs.groups.id")}</p>
            <p className="text-gray-500">{group.id}</p>
          </div>

          <div>
            <p className="font-medium">{t("staffTabs.groups.students")}</p>
            <p className="text-gray-500">{group.users?.length || 0}</p>
          </div>
        </div>

        <Divider />

        <div className="mb-4">
          <p className="font-medium mb-1">{t("staffTabs.groups.name")}</p>
          <p className="text-gray-700">{group.name}</p>
        </div>

        <div>
          <p className="font-medium mb-1">
            {t("staffTabs.groups.description")}
          </p>
          <p className="text-gray-700">
            {group.description || t("staffTabs.groups.noDescription")}
          </p>
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-semibold mb-3">
            {t("staffTabs.groups.students")}
          </h3>

          {group.users && group.users.length > 0 ? (
            <ul className="list-disc pl-5">
              {group.users.map((user: User) => (
                <li key={user.id} className="mb-1">
                  {user.firstname} {user.lastname}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">{t("staffTabs.groups.noStudents")}</p>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default GroupDetailsDialog;
