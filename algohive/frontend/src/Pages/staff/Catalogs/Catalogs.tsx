import { useEffect, useState } from "react";
import { Catalog } from "../../../models/Catalogs";
import { fetchCatalogs } from "../../../services/catalogsService";

import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

import "./Catalogs.css";
import { t } from "i18next";
import { CatalogsList } from "./components/CatalogsList";
import { CatalogDetails } from "./components/CatalogDetails";

// Component for displaying catalog details with themes and puzzles

// Main component
export default function CatalogsPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);

  useEffect(() => {
    const getCatalogs = async () => {
      try {
        setLoading(true);
        const data = await fetchCatalogs();
        setCatalogs(data);
      } catch (err) {
        setError(t("staff.catalogs.errorFetchingCatalogs"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getCatalogs();
  }, []);

  const handleViewDetails = (catalog: Catalog) => {
    setSelectedCatalog(catalog);
  };

  const handleBack = () => {
    setSelectedCatalog(null);
  };

  return (
    <div className="p-4 min-h-screen mb-28">
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

      {!loading && !error && catalogs.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 rounded-lg shadow">
          <i className="pi pi-inbox text-5xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 text-xl">
            {t("staff.catalogs.noCatalogs")}
          </p>
        </div>
      )}

      {!loading && !error && catalogs.length > 0 && (
        <>
          {selectedCatalog ? (
            <CatalogDetails catalog={selectedCatalog} onBack={handleBack} />
          ) : (
            <CatalogsList
              catalogs={catalogs}
              onViewDetails={handleViewDetails}
            />
          )}
        </>
      )}
    </div>
  );
}
