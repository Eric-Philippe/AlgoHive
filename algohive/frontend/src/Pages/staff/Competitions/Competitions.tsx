import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

import {
  fetchCompetitions,
  deleteCompetition,
} from "../../../services/competitionsService";
import CompetitionsList from "./components/CompetitionsList";
import CompetitionForm from "./components/CompetitionForm";
import CompetitionDetails from "./components/CompetitionDetails";

import "./Competitions.css";
import { Competition } from "../../../models/Competition";

export default function CompetitionsPage() {
  const { t } = useTranslation();
  const toast = useRef<Toast>(null);

  // State variables
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [formDialog, setFormDialog] = useState<boolean>(false);
  const [detailsDialog, setDetailsDialog] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // Fetch competitions on component mount
  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      setLoading(true);
      const data = await fetchCompetitions();
      setCompetitions(data);
    } catch (error) {
      console.error("Error loading competitions:", error);
      showToast("error", t("staffTabs.competitions.errorLoading"));
    } finally {
      setLoading(false);
    }
  };

  const showToast = (
    severity: "success" | "info" | "warn" | "error",
    detail: string
  ) => {
    toast.current?.show({
      severity,
      summary: t(`common.states.${severity}`),
      detail,
      life: 3000,
    });
  };

  const openCreateDialog = () => {
    setFormMode("create");
    setSelectedCompetition(null);
    setFormDialog(true);
  };

  const openEditDialog = (competition: Competition) => {
    setFormMode("edit");
    setSelectedCompetition(competition);
    setFormDialog(true);
  };

  const confirmDeleteCompetition = (competition: Competition) => {
    confirmDialog({
      message: t("staffTabs.competitions.confirmDelete"),
      header: t("staffTabs.competitions.confirmDeleteHeader"),
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => handleDeleteCompetition(competition.id),
    });
  };

  const handleDeleteCompetition = async (id: string) => {
    try {
      await deleteCompetition(id);
      showToast("success", t("staffTabs.competitions.messages.deleteSuccess"));
      loadCompetitions();
      if (detailsDialog && selectedCompetition?.id === id) {
        setDetailsDialog(false);
      }
    } catch (error) {
      console.error("Error deleting competition:", error);
      showToast("error", t("staffTabs.competitions.messages.deleteError"));
    }
  };

  const handleViewDetails = (competition: Competition) => {
    setSelectedCompetition(competition);
    setDetailsDialog(true);
  };

  const handleFormSubmitSuccess = () => {
    setFormDialog(false);
    loadCompetitions();
  };

  const handleFormCancel = () => {
    setFormDialog(false);
  };

  return (
    <div className="p-4 min-h-screen mb-28">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Header with title and create button */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <Button
          label={t("staffTabs.competitions.create")}
          icon="pi pi-plus"
          className="p-button-success"
          onClick={openCreateDialog}
        />
      </div>

      {/* Main content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-6">
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          <p className="mt-4 text-gray-600">
            {t("staffTabs.competitions.loading")}
          </p>
        </div>
      ) : competitions.length === 0 ? (
        <Card className="empty-state text-center p-6">
          <div className="flex flex-col items-center">
            <i className="pi pi-flag text-5xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600">
              {t("staffTabs.competitions.noCompetitions")}
            </h3>
            <p className="text-gray-500 mb-4">
              {t("staffTabs.competitions.create")} {t("common.states.empty")}
            </p>
            <Button
              label={t("staffTabs.competitions.create")}
              icon="pi pi-plus"
              className="p-button-outlined"
              onClick={openCreateDialog}
            />
          </div>
        </Card>
      ) : (
        <CompetitionsList
          competitions={competitions}
          onEdit={openEditDialog}
          onDelete={confirmDeleteCompetition}
          onViewDetails={handleViewDetails}
        />
      )}

      {/* Competition Form Dialog */}
      {formDialog && (
        <CompetitionForm
          visible={formDialog}
          mode={formMode}
          competition={selectedCompetition}
          onSuccess={handleFormSubmitSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* Competition Details Dialog */}
      {detailsDialog && selectedCompetition && (
        <CompetitionDetails
          visible={detailsDialog}
          competition={selectedCompetition}
          onClose={() => setDetailsDialog(false)}
          onEdit={() => {
            setDetailsDialog(false);
            openEditDialog(selectedCompetition);
          }}
          onDeleted={() => {
            setDetailsDialog(false);
            loadCompetitions();
          }}
        />
      )}
    </div>
  );
}
