import { t } from "i18next";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Catalog } from "../../../../models/Catalogs";

export const CatalogsList = ({
  catalogs,
  onViewDetails,
}: {
  catalogs: Catalog[];
  onViewDetails: (catalog: Catalog) => void;
}) => {
  const renderCatalogItem = (catalog: Catalog) => {
    return (
      <div className="p-col-12 p-md-6 p-lg-4 p-xl-3" key={catalog.id}>
        <Card
          className="shadow-lg hover:shadow-xl transition-shadow duration-300 mx-auto"
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
                label={t("staffTabs.catalogs.details")}
                icon="pi pi-arrow-right"
                iconPos="right"
                className="p-button-rounded p-button-outlined w-full"
                onClick={() => onViewDetails(catalog)}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-2">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {catalogs.map(renderCatalogItem)}
      </div>
    </div>
  );
};
