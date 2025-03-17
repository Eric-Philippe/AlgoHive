import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { TabView, TabPanel } from "primereact/tabview";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { confirmDialog } from "primereact/confirmdialog";

import {
  CompetitionStatistics,
  fetchCompetitionStatistics,
  fetchCompetitionGroups,
  fetchCompetitionTries,
  toggleCompetitionVisibility,
  finishCompetition,
  deleteCompetition,
} from "../../../../services/competitionsService";
import { Competition } from "../../../../models/Competition";
import { Group } from "../../../../models/Group";
import { User } from "../../../../models/User";
import ParticipantTries from "./ParticipantTries";

interface CompetitionDetailsProps {
  visible: boolean;
  competition: Competition;
  onClose: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}

export default function CompetitionDetails({
  visible,
  competition,
  onClose,
  onEdit,
  onDeleted,
}: CompetitionDetailsProps) {
  const { t } = useTranslation();
  const toast = useRef<Toast>(null);

  const [statistics, setStatistics] = useState<CompetitionStatistics | null>(
    null
  );
  const [groups, setGroups] = useState<Group[]>([]);
  const [participants, setParticipants] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [triesDialogVisible, setTriesDialogVisible] = useState<boolean>(false);

  useEffect(() => {
    if (visible && competition) {
      loadCompetitionDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, competition]);

  const loadCompetitionDetails = async () => {
    try {
      setLoading(true);
      const [stats, groupsData, triesData] = await Promise.all([
        fetchCompetitionStatistics(competition.id),
        fetchCompetitionGroups(competition.id),
        fetchCompetitionTries(competition.id),
      ]);

      setStatistics(stats);
      setGroups(groupsData);

      // Extract unique users from tries
      const uniqueUsers = Array.from(
        new Map(
          triesData
            .filter((try_) => try_.user)
            .map((try_) => [try_.user.id, try_.user])
        ).values()
      );

      setParticipants(uniqueUsers);
    } catch (error) {
      console.error("Error loading competition details:", error);
      showToast("error", t("common.states.errorMessage"));
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

  const handleToggleVisibility = async () => {
    try {
      await toggleCompetitionVisibility(competition.id, !competition.show);
      showToast(
        "success",
        t("staffTabs.competitions.messages.toggleVisibilitySuccess")
      );
      // Update competition in parent component
      competition.show = !competition.show;
      // Reload competition details to refresh the view
      await loadCompetitionDetails();
    } catch (error) {
      console.error("Error toggling visibility:", error);
      showToast(
        "error",
        t("staffTabs.competitions.messages.toggleVisibilityError")
      );
    }
  };

  const handleFinishCompetition = async () => {
    try {
      await finishCompetition(competition.id);
      showToast("success", t("staffTabs.competitions.messages.finishSuccess"));
      // Update competition in parent component
      competition.finished = !competition.finished;
      // Reload competition details to refresh the view
      await loadCompetitionDetails();
    } catch (error) {
      console.error("Error finishing competition:", error);
      showToast("error", t("staffTabs.competitions.messages.finishError"));
    }
  };

  const confirmDeleteCompetition = () => {
    confirmDialog({
      message: t("staffTabs.competitions.confirmDelete"),
      header: t("staffTabs.competitions.confirmDeleteHeader"),
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteCompetition(competition.id);
          showToast(
            "success",
            t("staffTabs.competitions.messages.deleteSuccess")
          );
          onClose();
          onDeleted();
        } catch (error) {
          console.error("Error deleting competition:", error);
          showToast("error", t("staffTabs.competitions.messages.deleteError"));
        }
      },
    });
  };

  const viewParticipantTries = (user: User) => {
    setSelectedUser(user);
    setTriesDialogVisible(true);
  };

  return (
    <>
      <Toast ref={toast} />

      <Dialog
        header={t("staffTabs.competitions.details")}
        visible={visible}
        onHide={onClose}
        style={{ width: "70vw", maxWidth: "1200px" }}
        maximizable
        className="competition-details-dialog"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center p-6">
            <ProgressSpinner style={{ width: "50px", height: "50px" }} />
            <p className="mt-4 text-gray-600">{t("common.states.loading")}</p>
          </div>
        ) : (
          <>
            <div className="competition-header mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {competition.title}
                  </h2>
                  <div className="flex gap-2">
                    {competition.finished ? (
                      <Tag
                        severity="warning"
                        value={t("staffTabs.competitions.status.finished")}
                      />
                    ) : (
                      <Tag
                        severity="success"
                        value={t("staffTabs.competitions.status.active")}
                      />
                    )}

                    {competition.show ? (
                      <Tag
                        severity="info"
                        value={t("staffTabs.competitions.status.visible")}
                      />
                    ) : (
                      <Tag
                        severity="danger"
                        value={t("staffTabs.competitions.status.hidden")}
                      />
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    icon="pi pi-pencil"
                    label={t("common.actions.edit")}
                    className="p-button-outlined p-button-success"
                    onClick={onEdit}
                  />
                  <Button
                    icon="pi pi-flag-fill"
                    label={
                      competition.finished
                        ? t("staffTabs.competitions.actions.unfinish")
                        : t("staffTabs.competitions.actions.finish")
                    }
                    className="p-button-outlined p-button-warning"
                    onClick={handleFinishCompetition}
                  />

                  <Button
                    icon={competition.show ? "pi pi-eye-slash" : "pi pi-eye"}
                    label={
                      competition.show
                        ? t("staffTabs.competitions.actions.hide")
                        : t("staffTabs.competitions.actions.show")
                    }
                    className="p-button-outlined p-button-secondary"
                    onClick={handleToggleVisibility}
                  />
                  <Button
                    icon="pi pi-trash"
                    label={t("common.actions.delete")}
                    className="p-button-outlined p-button-danger"
                    onClick={confirmDeleteCompetition}
                  />
                </div>
              </div>
            </div>

            <div className="competition-description mb-4">
              <p className="text-gray-600">{competition.description}</p>
            </div>

            <Divider />

            {statistics && (
              <TabView>
                <TabPanel header={t("staffTabs.competitions.statistics.title")}>
                  <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                    <div className="stat-card bg-blue-50 rounded-lg p-4 shadow-sm">
                      <div className="text-lg font-semibold text-blue-800">
                        {t("staffTabs.competitions.statistics.totalUsers")}
                      </div>
                      <div className="text-3xl">{statistics.total_users}</div>
                    </div>
                    <div className="stat-card bg-green-50 rounded-lg p-4 shadow-sm">
                      <div className="text-lg font-semibold text-green-800">
                        {t("staffTabs.competitions.statistics.activeUsers")}
                      </div>
                      <div className="text-3xl">{statistics.active_users}</div>
                    </div>
                    <div className="stat-card bg-amber-50 rounded-lg p-4 shadow-sm">
                      <div className="text-lg font-semibold text-amber-800">
                        {t("staffTabs.competitions.statistics.completionRate")}
                      </div>
                      <div className="text-3xl">
                        {statistics.completion_rate.toFixed(1)}%
                      </div>
                    </div>
                    <div className="stat-card bg-purple-50 rounded-lg p-4 shadow-sm">
                      <div className="text-lg font-semibold text-purple-800">
                        {t("staffTabs.competitions.statistics.averageScore")}
                      </div>
                      <div className="text-3xl">
                        {statistics.average_score.toFixed(1)}
                      </div>
                    </div>
                    <div className="stat-card bg-red-50 rounded-lg p-4 shadow-sm">
                      <div className="text-lg font-semibold text-red-800">
                        {t("staffTabs.competitions.statistics.highestScore")}
                      </div>
                      <div className="text-3xl">
                        {statistics.highest_score.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </TabPanel>

                <TabPanel
                  header={t("staffTabs.competitions.statistics.participants")}
                >
                  {participants.length === 0 ? (
                    <Message
                      severity="info"
                      text={t(
                        "staffTabs.competitions.statistics.noParticipants"
                      )}
                    />
                  ) : (
                    <DataTable
                      value={participants}
                      paginator
                      rows={10}
                      rowsPerPageOptions={[5, 10, 25]}
                      tableStyle={{ minWidth: "50rem" }}
                    >
                      <Column field="id" header="ID" style={{ width: "20%" }} />
                      <Column
                        field="firstname"
                        header={t("common.fields.firstName")}
                        style={{ width: "25%" }}
                      />
                      <Column
                        field="lastname"
                        header={t("common.fields.lastName")}
                        style={{ width: "25%" }}
                      />
                      <Column
                        field="email"
                        header={t("common.fields.email")}
                        style={{ width: "25%" }}
                      />
                      <Column
                        body={(rowData) => (
                          <Button
                            icon="pi pi-list"
                            label={t("staffTabs.competitions.tries.viewTries")}
                            className="p-button-sm p-button-outlined"
                            onClick={() => viewParticipantTries(rowData)}
                          />
                        )}
                        style={{ width: "15%" }}
                      />
                    </DataTable>
                  )}
                </TabPanel>

                <TabPanel
                  header={t("staffTabs.competitions.statistics.groups")}
                >
                  {groups.length === 0 ? (
                    <Message
                      severity="info"
                      text={t("staffTabs.competitions.statistics.noGroups")}
                    />
                  ) : (
                    <DataTable
                      value={groups}
                      paginator
                      rows={10}
                      rowsPerPageOptions={[5, 10, 25]}
                      tableStyle={{ minWidth: "50rem" }}
                    >
                      <Column
                        field="name"
                        header={t("common.fields.name")}
                        style={{ width: "40%" }}
                      />
                      <Column
                        field="description"
                        header={t("common.fields.description")}
                        style={{ width: "40%" }}
                      />
                    </DataTable>
                  )}
                </TabPanel>
              </TabView>
            )}
          </>
        )}
      </Dialog>

      {selectedUser && (
        <ParticipantTries
          visible={triesDialogVisible}
          onHide={() => setTriesDialogVisible(false)}
          competitionId={competition.id}
          participant={selectedUser}
        />
      )}
    </>
  );
}
