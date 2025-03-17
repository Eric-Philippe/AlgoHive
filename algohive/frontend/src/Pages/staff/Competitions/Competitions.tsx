import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { ConfirmDialog } from "primereact/confirmdialog";

import { fetchCompetitions } from "../../../services/competitionsService";
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

  // Dialog visibility states - refactored to match Roles.tsx pattern
  const [editDialogVisible, setEditDialogVisible] = useState<boolean>(false);
  const [createDialogVisible, setCreateDialogVisible] =
    useState<boolean>(false);
  const [detailsDialogVisible, setDetailsDialogVisible] =
    useState<boolean>(false);

  const fetchCompetitionsData = async () => {
    try {
      setLoading(true);
      const fetchedCompetitions = await fetchCompetitions();
      setCompetitions(fetchedCompetitions);
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("error", t("common.states.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitionsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Open dialog handlers - refactored to match Roles.tsx pattern
  const openCreateDialog = () => {
    setSelectedCompetition(null);
    setCreateDialogVisible(true);
  };

  const openEditDialog = (competition: Competition) => {
    setSelectedCompetition(competition);
    setEditDialogVisible(true);
  };

  const openDetailsDialog = (competition: Competition) => {
    setSelectedCompetition(competition);
    setDetailsDialogVisible(true);
  };

  const handleFormSubmitSuccess = () => {
    // Close all dialog forms
    setCreateDialogVisible(false);
    setEditDialogVisible(false);
    fetchCompetitionsData();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-6">
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          <p className="mt-4 text-gray-600">
            {t("staffTabs.competitions.loading")}
          </p>
        </div>
      );
    }

    if (competitions.length === 0) {
      return (
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
      );
    }

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">
            {t("navigation.staff.competitions")}
          </h1>
          <Button
            label={t("staffTabs.competitions.create")}
            icon="pi pi-plus"
            className="p-button-outlined"
            onClick={openCreateDialog}
          />
        </div>
        <CompetitionsList
          competitions={competitions}
          onEdit={openEditDialog}
          onViewDetails={openDetailsDialog}
        />
      </>
    );
  };

  return (
    <div className="p-4 min-h-screen mb-28">
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Main content */}
      {renderContent()}

      {/* Competition Create Form Dialog */}
      {createDialogVisible && (
        <CompetitionForm
          visible={createDialogVisible}
          mode="create"
          competition={null}
          onSuccess={handleFormSubmitSuccess}
          onCancel={() => setCreateDialogVisible(false)}
        />
      )}

      {/* Competition Edit Form Dialog */}
      {editDialogVisible && selectedCompetition && (
        <CompetitionForm
          visible={editDialogVisible}
          mode="edit"
          competition={selectedCompetition}
          onSuccess={handleFormSubmitSuccess}
          onCancel={() => setEditDialogVisible(false)}
        />
      )}

      {/* Competition Details Dialog */}
      {detailsDialogVisible && selectedCompetition && (
        <CompetitionDetails
          visible={detailsDialogVisible}
          competition={selectedCompetition}
          onClose={() => setDetailsDialogVisible(false)}
          onEdit={() => {
            setDetailsDialogVisible(false);
            openEditDialog(selectedCompetition);
          }}
          onDeleted={() => {
            setDetailsDialogVisible(false);
            fetchCompetitionsData();
          }}
        />
      )}
    </div>
  );
}
