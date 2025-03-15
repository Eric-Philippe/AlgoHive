import { Button } from "primereact/button";
import { Scope } from "../../../../models/Scope";
import { t } from "i18next";
import { Badge } from "primereact/badge";
import { Card } from "primereact/card";
import React from "react";

interface ScopeCardProps {
  scope: Scope;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
}

const ScopeCard: React.FC<ScopeCardProps> = ({
  scope,
  onEdit,
  onDelete,
  onViewDetails,
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
            {scope.name}
          </h2>
          <i className="pi pi-building text-3xl text-amber-500"></i>
        </div>

        <div className="text-white/80 mb-3 line-clamp-2 flex-grow">
          {scope.description || t("staffTabs.scopes.noDescription")}
        </div>

        <div className="mb-3">
          <h3 className="text-sm font-medium text-white/90 mb-1">
            {t("staffTabs.scopes.catalogs")}:
          </h3>
          <div className="flex flex-wrap gap-1">
            {scope.catalogs && scope.catalogs.length > 0 ? (
              scope.catalogs.map((catalog) => (
                <Badge
                  key={catalog.id}
                  value={catalog.name}
                  severity="info"
                  className="mr-1 mb-1"
                />
              ))
            ) : (
              <span className="text-gray-400 text-sm italic">
                {t("staffTabs.scopes.noCatalogs")}
              </span>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-auto gap-2">
          <Button
            icon="pi pi-eye"
            tooltip={t("staffTabs.scopes.details")}
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
          />
          <Button
            icon="pi pi-trash"
            tooltip={t("common.actions.delete")}
            onClick={onDelete}
            className="p-button p-button-danger"
            size="small"
          />
        </div>
      </div>
    </Card>
  );
};

export default ScopeCard;
