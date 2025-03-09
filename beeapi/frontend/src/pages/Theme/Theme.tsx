import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { useEffect, useRef, useState } from "react";
import { Theme } from "../../types/Theme";
import { convertBytes } from "../../utils/utils";
import { Puzzle } from "../../types/Puzzle";
import FileUploadComponent from "../../components/FileUpload/FileUpload";
import { Toast } from "primereact/toast";

interface ThemeProps {
  selectedMenu: string;
}

export default function ThemePage({ selectedMenu }: ThemeProps) {
  const selectedTheme = selectedMenu.split("/")[1];
  const toast = useRef<Toast>(null);

  const [refreshTheme, setRefreshTheme] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>();

  useEffect(() => {
    fetch(`/theme?name=${selectedTheme}`)
      .then((res) => res.json())
      .then((data) => {
        data.puzzles.forEach((puzzle: Puzzle) => {
          puzzle.compressedSize = convertBytes(puzzle.compressedSize as number);
          puzzle.uncompressedSize = convertBytes(
            puzzle.uncompressedSize as number
          );
        });

        setTheme(data);
      });
  }, [selectedTheme, refreshTheme]);

  const handleDeletePuzzle = (puzzle: Puzzle) => {
    fetch(`/puzzle?theme=${selectedTheme}&puzzle=${puzzle.name}`, {
      method: "DELETE",
    }).then((res) => {
      if (res.ok) {
        setTheme((prevTheme) => {
          return {
            ...prevTheme!,
            puzzles: prevTheme!.puzzles.filter((p) => p.name !== puzzle.name),
          };
        });

        toast.current?.show({
          severity: "info",
          summary: "Success",
          detail: "Puzzle Deleted",
        });
      }
    });
  };

  const createAtTemplate = (rowData: Puzzle) => {
    return rowData.createdAt.slice(0, 16);
  };

  const updatedAtTemplate = (rowData: Puzzle) => {
    return rowData.updatedAt.slice(0, 16);
  };

  const deleteButtonTemplate = (rowData: Puzzle) => {
    return (
      <Button
        label="Delete"
        icon="pi pi-trash"
        className="p-button-danger"
        onClick={() => handleDeletePuzzle(rowData)}
      />
    );
  };

  const columns = [
    { field: "name", header: "Name" },
    { field: "difficulty", header: "Difficulty" },
    { field: "language", header: "Language" },
    { field: "compressedSize", header: "Zip Size" },
    { field: "uncompressedSize", header: "Unzip Size" },
    { field: "createdAt", header: "Created", body: createAtTemplate },
    { field: "updatedAt", header: "Updated", body: updatedAtTemplate },
    { field: "author", header: "Author" },
    { field: "delete", header: "Delete", body: deleteButtonTemplate },
  ];

  return (
    <div className="container" style={{ maxWidth: "90%" }}>
      <Toast ref={toast} />

      <h2 className="text-2xl mb-6">Selected theme: {selectedTheme}</h2>
      <h3 className="text-xl mb-4">Puzzles -</h3>

      <DataTable
        value={theme?.puzzles}
        editMode="cell"
        tableStyle={{ minWidth: "50rem" }}
      >
        {columns.map(({ field, header, body }) => {
          return (
            <Column key={field} field={field} header={header} body={body} />
          );
        })}
      </DataTable>

      <FileUploadComponent theme={selectedTheme} setRefresh={setRefreshTheme} />
    </div>
  );
}
