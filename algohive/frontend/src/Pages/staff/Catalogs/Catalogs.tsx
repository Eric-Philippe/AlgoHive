import { useEffect, useState } from "react";
import { Catalog } from "../../../models/Catalogs";
import { fetchCatalogs } from "../../../services/catalogService";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";

import "./Catalogs.css";
import { t } from "i18next";

export default function CatalogsPage() {
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getCatalogs = async () => {
      try {
        setLoading(true);
        const data = await fetchCatalogs();
        setCatalogs(data);
      } catch (err) {
        setError(
          "Une erreur est survenue lors de la récupération des catalogues"
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getCatalogs();
  }, []);

  const handleViewDetails = (catalog: Catalog) => {
    // Will implement navigation or modal later
    console.log("View details for catalog:", catalog);
  };

  const renderCatalogItem = (catalog: Catalog) => {
    return (
      <div className="p-col-12 p-md-6 p-lg-4 p-xl-3">
        <Card
          className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white mx-auto"
          header={
            <div className="relative overflow-hidden h-12 rounded">
              <div className="absolute inset-0 bg-amber-500">
                <div className="flex items-center justify-center h-full">
                  <i className="pi pi-book text-4xl text-white"></i>
                  <h2 className="text-white text-lg font-semibold px-4 py-2">
                    {catalog.name}
                  </h2>
                </div>
              </div>
            </div>
          }
        >
          <div className="flex flex-col h-46">
            <div className="flex items-center mb-2 text-sm text-gray-600">
              <i className="pi pi-map-marker mr-2"></i>
              <span className="truncate">{catalog.address}</span>
            </div>

            <p className="line-clamp-3 text-gray-700 flex-grow mb-3 overflow-hidden text-ellipsis">
              {catalog.description}
            </p>

            <div className="mt-auto">
              <Button
                label={t("staff.catalogs.viewDetails")}
                icon="pi pi-arrow-right"
                iconPos="right"
                className="p-button-rounded p-button-outlined w-full"
                onClick={() => handleViewDetails(catalog)}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="p-4 min-h-screen mb-28">
      {loading && (
        <div className="flex flex-col items-center justify-center p-6">
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          <p className="mt-4 text-gray-600">Chargement des catalogues...</p>
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
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow">
          <i className="pi pi-inbox text-5xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 text-xl">Aucun catalogue trouvé</p>
        </div>
      )}

      {!loading && !error && catalogs.length > 0 && (
        <div className="container mx-auto px-2">
          {catalogs && (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {catalogs.map((catalog) => renderCatalogItem(catalog))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
