import React from "react";
import { Group } from "../../../../models/Group";
import { Button } from "primereact/button";
import { t } from "i18next";

interface GroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
  onViewDetails: (group: Group) => void;
}

/**
 * Component for displaying a group card with actions
 */
const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  return (
    <div className="p-4 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-amber-500">{group.name}</h2>
        <i className="pi pi-users text-4xl text-amber-500"></i>
      </div>

      <p className="text-white mt-2">{group.description}</p>

      <p className="text-white mt-2">
        <span className="font-semibold">{t("staffTabs.groups.students")}:</span>{" "}
        <span className="text-gray-300">{group.users?.length || 0}</span>
      </p>

      <div className="flex justify mt-12 gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-outlined p-button-sm"
          tooltip={t("common.actions.edit")}
          onClick={() => onEdit(group)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-outlined p-button-danger p-button-sm"
          tooltip={t("common.actions.delete")}
          onClick={() => onDelete(group)}
        />
        <Button
          label={t("staffTabs.groups.viewDetails")}
          icon="pi pi-eye"
          className="p-button-primary"
          onClick={() => onViewDetails(group)}
        />
      </div>
    </div>
  );
};

export default GroupCard;
