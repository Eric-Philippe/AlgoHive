import { t } from "i18next";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { TabView, TabPanel } from "primereact/tabview";
import { Tag } from "primereact/tag";
import { Puzzle } from "../../../../models/Catalogs";

export const PuzzleDetails = ({
  puzzle,
  onBack,
}: {
  puzzle: Puzzle;
  onBack: () => void;
}) => {
  // Function to put an uppercase letter at the beginning of a string
  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div className="p-4 rounded-lg shadow">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold text-white-800">
          {capitalizeFirstLetter(puzzle.name)}
        </h2>
        <Button
          icon="pi pi-arrow-left"
          label={t("staff.catalogs.backToCatalog")}
          className="p-button-primary p-button-sm"
          onClick={onBack}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-white-600 mb-1">
            {t("staff.catalogs.author")}:{" "}
            <span className="font-medium">{puzzle.author}</span>
          </p>
          <p className="text-sm text-white-600 mb-1">
            {t("staff.catalogs.difficulty")}:
            <Tag
              className="ml-2"
              severity={
                puzzle.difficulty === "EASY"
                  ? "success"
                  : puzzle.difficulty === "MEDIUM"
                  ? "warning"
                  : "danger"
              }
            >
              {puzzle.difficulty}
            </Tag>
          </p>
          <p className="mt-6 text-sm text-gray-600 mb-1">
            {t("staff.catalogs.language")}:{" "}
            <span className="font-medium">{puzzle.language}</span>
          </p>
          <p className="text-sm text-gray-600 mb-1">
            {t("staff.catalogs.createdAt")}:{" "}
            <span className="font-medium">
              {new Date(puzzle.createdAt).toLocaleString()}
            </span>
          </p>
          <p className="text-sm text-gray-600 mb-1">
            {t("staff.catalogs.updatedAt")}:{" "}
            <span className="font-medium">
              {new Date(puzzle.updatedAt).toLocaleString()}
            </span>
          </p>
        </div>
      </div>

      <Divider />

      <TabView>
        <TabPanel header="Cipher">
          <div
            className="puzzle-content p-4 rounded"
            dangerouslySetInnerHTML={{ __html: puzzle.cipher }}
          ></div>
        </TabPanel>
        <TabPanel header="Obscure">
          <div
            className="puzzle-content p-4 rounded"
            dangerouslySetInnerHTML={{ __html: puzzle.obscure }}
          ></div>
        </TabPanel>
      </TabView>
    </div>
  );
};
