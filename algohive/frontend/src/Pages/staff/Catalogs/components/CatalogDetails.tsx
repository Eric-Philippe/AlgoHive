import { t } from "i18next";
import { Accordion, AccordionTab } from "primereact/accordion";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Divider } from "primereact/divider";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { useState, useEffect } from "react";
import { Catalog, Theme, Puzzle } from "../../../../models/Catalogs";
import { fetchCatalogThemes } from "../../../../services/catalogsService";
import { PuzzleDetails } from "./PuzzleDetails";

export const CatalogDetails = ({
  catalog,
  onBack,
}: {
  catalog: Catalog;
  onBack: () => void;
}) => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);

  useEffect(() => {
    const getThemes = async () => {
      try {
        setLoading(true);
        const data = await fetchCatalogThemes(catalog.id);
        setThemes(data);
      } catch (err) {
        setError(t("staff.catalogs.errorFetchingCatalogs"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getThemes();
  }, [catalog.id]);

  const difficultyTemplate = (puzzle: Puzzle) => {
    const getSeverity = (difficulty: string) => {
      switch (difficulty) {
        case "EASY":
          return "success";
        case "MEDIUM":
          return "warning";
        case "HARD":
          return "danger";
        default:
          return "info";
      }
    };

    return (
      <Tag severity={getSeverity(puzzle.difficulty)}>{puzzle.difficulty}</Tag>
    );
  };

  const actionTemplate = (puzzle: Puzzle) => {
    return (
      <Button
        icon="pi pi-eye"
        className="p-button-rounded p-button-outlined p-button-sm"
        onClick={() => setSelectedPuzzle(puzzle)}
        tooltip={t("staff.catalogs.viewPuzzle")}
      />
    );
  };

  const dateTemplate = (rowData: Puzzle, field: string) => {
    return new Date(rowData[field as keyof Puzzle] as string).toLocaleString();
  };

  if (selectedPuzzle) {
    return (
      <PuzzleDetails
        puzzle={selectedPuzzle}
        onBack={() => setSelectedPuzzle(null)}
      />
    );
  }

  return (
    <Card className="p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white-800">{catalog.name}</h2>
          <p className="text-gray-500">{catalog.address}</p>
        </div>
        <Button
          icon="pi pi-arrow-left"
          label={t("staff.catalogs.back")}
          className="p-button-primary"
          onClick={onBack}
        />
      </div>

      <p className="text-white-700 mb-4">{catalog.description}</p>

      <Divider />

      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {t("staff.catalogs.themes")}
      </h3>

      {loading && (
        <div className="flex flex-col items-center justify-center p-6">
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          <p className="mt-4 text-gray-600">{t("staff.catalogs.loading")}</p>
        </div>
      )}

      {error && (
        <Message
          severity="error"
          text={error}
          className="w-full mb-4"
          style={{ borderRadius: "8px" }}
        />
      )}

      {!loading && !error && themes.length === 0 && (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded">
          <i className="pi pi-folder-open text-5xl text-gray-400 mb-4"></i>
          <p className="text-gray-600">{t("staff.catalogs.noThemes")}</p>
        </div>
      )}

      {!loading && !error && themes.length > 0 && (
        <Accordion className="w-full">
          {themes.map((theme) => (
            <AccordionTab
              key={theme.name}
              header={
                <div className="flex justify-between items-center w-full">
                  <span>{theme.name}</span>
                  <Tag
                    value={`${theme.enigmes_count} ${t(
                      "staff.catalogs.puzzlesCount"
                    )}`}
                    className="ml-2"
                  />
                </div>
              }
            >
              <DataTable
                value={theme.puzzles}
                paginator
                rows={5}
                rowsPerPageOptions={[5, 10, 25]}
                tableStyle={{ minWidth: "50rem" }}
                emptyMessage={t("staff.catalogs.notFound")}
              >
                <Column
                  field="name"
                  header={t("common.fields.name")}
                  sortable
                />
                <Column
                  field="author"
                  header={t("staff.catalogs.author")}
                  sortable
                />
                <Column
                  field="difficulty"
                  header={t("staff.catalogs.difficulty")}
                  body={difficultyTemplate}
                  sortable
                />
                <Column
                  field="language"
                  header={t("staff.catalogs.language")}
                  sortable
                />
                <Column
                  field="createdAt"
                  header={t("staff.catalogs.createdAt")}
                  body={(rowData) => dateTemplate(rowData, "createdAt")}
                  sortable
                />
                <Column body={actionTemplate} />
              </DataTable>
            </AccordionTab>
          ))}
        </Accordion>
      )}
    </Card>
  );
};
