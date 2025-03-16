import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";

import { fetchUserCompetitionTries } from "../../../../services/competitionsService";
import { User } from "../../../../models/User";

interface ParticipantTriesProps {
  visible: boolean;
  onHide: () => void;
  competitionId: string;
  participant: User | null;
}

export default function ParticipantTries({
  visible,
  onHide,
  competitionId,
  participant,
}: ParticipantTriesProps) {
  const { t } = useTranslation();
  const [tries, setTries] = useState<unknown[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (visible && competitionId && participant) {
      loadTries();
    }
  }, [visible, competitionId, participant]);

  const loadTries = async () => {
    try {
      setLoading(true);
      const data = await fetchUserCompetitionTries(
        competitionId,
        participant.id
      );
      setTries(data);
    } catch (error) {
      console.error("Error loading participant tries:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const scoreTemplate = (rowData: any) => {
    let severity: "success" | "warning" | "danger" | "info" = "info";

    if (rowData.score >= 80) {
      severity = "success";
    } else if (rowData.score >= 50) {
      severity = "warning";
    } else if (rowData.score > 0) {
      severity = "danger";
    }

    return <Tag value={rowData.score.toFixed(1)} severity={severity} />;
  };

  const attemptTemplate = (rowData: any) => {
    return <Tag value={rowData.attempts.toString()} />;
  };

  const statusTemplate = (rowData: any) => {
    if (rowData.end_time) {
      return <Tag severity="success" value="Completed" />;
    }
    return <Tag severity="info" value="In Progress" />;
  };

  return (
    <Dialog
      header={t("staffTabs.competitions.statistics.viewTriesFor", {
        name: `${participant.firstname} ${participant.lastname}`,
      })}
      visible={visible}
      onHide={onHide}
      style={{ width: "70vw", maxWidth: "1000px" }}
      className="participant-tries-dialog"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center p-6">
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          <p className="mt-4 text-gray-600">
            {t("staffTabs.competitions.tries.loading")}
          </p>
        </div>
      ) : tries.length === 0 ? (
        <Message
          severity="info"
          text={t("staffTabs.competitions.tries.noTries")}
        />
      ) : (
        <DataTable
          value={tries}
          stripedRows
          responsiveLayout="scroll"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
        >
          <Column
            field="puzzle_id"
            header={t("staffTabs.competitions.tries.puzzle")}
            sortable
          />
          <Column field="puzzle_lvl" header="Level" sortable />
          <Column
            field="status"
            header="Status"
            body={statusTemplate}
            sortable
          />
          <Column
            field="start_time"
            header={t("staffTabs.competitions.tries.startTime")}
            body={(rowData) => formatDate(rowData.start_time)}
            sortable
          />
          <Column
            field="end_time"
            header={t("staffTabs.competitions.tries.endTime")}
            body={(rowData) => formatDate(rowData.end_time)}
            sortable
          />
          <Column
            field="attempts"
            header={t("staffTabs.competitions.tries.attempts")}
            body={attemptTemplate}
            sortable
          />
          <Column
            field="score"
            header={t("staffTabs.competitions.tries.score")}
            body={scoreTemplate}
            sortable
          />
        </DataTable>
      )}
    </Dialog>
  );
}
