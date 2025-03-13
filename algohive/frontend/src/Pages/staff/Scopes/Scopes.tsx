import { useEffect, useState } from "react";
import { Scope } from "../../../models/Scope";
import "./Scopes.css";
import { fetchScopes, createScope } from "../../../services/scopeService";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import { fetchCatalogs } from "../../../services/catalogService";
import { t } from "i18next";

export default function ScopesPage() {
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newScopeName, setNewScopeName] = useState<string>("");
  const [newScopeDescription, setNewScopeDescription] = useState<string>("");
  const [selectedApiIds, setSelectedApiIds] = useState<string[]>([]);
  const [creatingScope, setCreatingScope] = useState<boolean>(false);
  const toast = useRef<Toast>(null);

  const apiOptions = useRef<{ label: string; value: string }[]>([]);

  useEffect(() => {
    const getScopes = async () => {
      try {
        setLoading(true);
        const data = await fetchScopes();
        setScopes(data);
        const catalogs = await fetchCatalogs();
        apiOptions.current = catalogs.map((catalog) => ({
          label: catalog.name,
          value: catalog.id,
        }));
      } catch (err) {
        setError(t("staff.scopes.errorFetchingScopes"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getScopes();
  }, []);

  const handleCreateScope = async () => {
    if (!newScopeName.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: t("staff.scopes.errorNameRequired"),
        life: 3000,
      });
      return;
    }

    try {
      setCreatingScope(true);
      await createScope(newScopeName, newScopeDescription, selectedApiIds);

      // Refresh scopes list
      const updatedScopes = await fetchScopes();
      setScopes(updatedScopes);

      // Reset form
      setNewScopeName("");
      setNewScopeDescription("");
      setSelectedApiIds([]);

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: t("staff.scopes.scopeCreated"),
        life: 3000,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: t("staff.scopes.errorCreatingScope"),
        life: 3000,
      });
      console.error(err);
    } finally {
      setCreatingScope(false);
    }
  };

  return (
    <div className="p-4 min-h-screen mb-28">
      <Toast ref={toast} />

      {loading && (
        <div className="flex flex-col items-center justify-center p-6">
          <ProgressSpinner style={{ width: "50px", height: "50px" }} />
          <p className="mt-4 text-gray-600">{t("t.scopes.loading")}</p>
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

      {!loading && !error && scopes.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow">
          <i className="pi pi-inbox text-5xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 text-xl">{t("staff.scopes.noScopes")}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="container mx-auto px-2">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
            {scopes.map((scope) => (
              <div
                key={scope.id}
                className="p-4 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-amber-500">
                    {scope.name}
                  </h2>
                  <i className="pi pi-building text-4xl text-amber-500"></i>
                </div>
                <p className="text-whit mt-2">{scope.description}</p>
                <p className="text-white mt-2">
                  {scope.catalogs ? (
                    <>
                      <span className="font-semibold">
                        {t("staff.scopes.catalogs")}:
                      </span>{" "}
                      {scope.catalogs.map((catalog) => (
                        <span key={catalog.id} className="text-gray-400">
                          {catalog.name}
                        </span>
                      ))}
                    </>
                  ) : (
                    <></>
                  )}
                </p>
                <div className="flex justify-end mt-4 space-x-2">
                  <Button
                    label={t("staff.scopes.viewDetails")}
                    className="p-button-primary ml-2"
                  />
                </div>
              </div>
            ))}

            {/* Create new scope card */}
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-amber-500">
                  {t("staff.scopes.new")}
                </h2>
                <i className="pi pi-plus-circle text-4xl text-amber-500"></i>
              </div>

              <div className="mb-3">
                <label
                  htmlFor="scopeName"
                  className="block text-sm font-medium text-white mb-1"
                >
                  {t("staff.scopes.name")}
                </label>
                <InputText
                  id="scopeName"
                  value={newScopeName}
                  onChange={(e) => setNewScopeName(e.target.value)}
                  className="w-full"
                  placeholder={t("staff.scopes.scopeName")}
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="scopeDescription"
                  className="block text-sm font-medium text-white mb-1"
                >
                  {t("staff.scopes.description")}
                </label>
                <InputTextarea
                  id="scopeDescription"
                  value={newScopeDescription}
                  onChange={(e) => setNewScopeDescription(e.target.value)}
                  rows={2}
                  className="w-full"
                  placeholder={t("staff.scopes.scopeDescription")}
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="apiIds"
                  className="block text-sm font-medium text-white mb-1"
                >
                  {t("staff.scopes.catalogs")}
                </label>
                <MultiSelect
                  id="apiIds"
                  value={selectedApiIds}
                  options={apiOptions.current}
                  onChange={(e) => setSelectedApiIds(e.value)}
                  placeholder={t("staff.scopes.selectCatalogs")}
                  className="w-full"
                  display="chip"
                />
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  label={t("staff.scopes.create")}
                  icon="pi pi-plus"
                  className="p-button-primary"
                  onClick={handleCreateScope}
                  loading={creatingScope}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
