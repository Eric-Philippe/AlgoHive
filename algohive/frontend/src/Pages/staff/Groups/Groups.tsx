import { useEffect, useMemo, useState, useRef } from "react";
import "./Groups.css";
import { Scope } from "../../../models/Scope";
import { useAuth } from "../../../contexts/AuthContext";
import { fetchScopesFromRoles } from "../../../services/scopesService";
import { ProgressSpinner } from "primereact/progressspinner";
import { t } from "i18next";
import { Message } from "primereact/message";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { Role } from "../../../models/Role";
import { Group } from "../../../models/Group";
import {
  fetchGroupsFromScope,
  createGroup,
} from "../../../services/groupsService";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

export default function GroupsPage() {
  const { user } = useAuth();
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedScope, setSelectedScope] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useRef<Toast>(null);

  // New group form state
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [newGroupDescription, setNewGroupDescription] = useState<string>("");
  const [creatingGroup, setCreatingGroup] = useState<boolean>(false);

  useEffect(() => {
    const fetchScopes = async () => {
      try {
        setLoading(true);
        // Fetch scopes
        const rolesIds: string[] =
          user && user.roles ? user.roles.map((role: Role) => role.id) : [];

        let scopesData = await fetchScopesFromRoles(rolesIds);
        if (scopesData.length === null) scopesData = [];

        setScopes(scopesData);
      } catch (err) {
        setError("Error fetching scopes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchScopes();
  }, [user]);

  const handleSelectedScopeChange = async (e: DropdownChangeEvent) => {
    setSelectedScope(e.value);
    await loadGroups(e.value);
  };

  const loadGroups = async (scopeId: string) => {
    if (scopeId) {
      try {
        const groups = await fetchGroupsFromScope(scopeId);
        setGroups(groups);
      } catch (err) {
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: t("staff.groups.errorFetchingGroups"),
          life: 3000,
        });
        console.error(err);
      }
    } else {
      setGroups([]);
    }
  };

  const handleCreateGroup = async () => {
    if (!selectedScope) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: t("staff.groups.selectScopeFirst"),
        life: 3000,
      });
      return;
    }

    if (!newGroupName.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: t("staff.groups.nameRequired"),
        life: 3000,
      });
      return;
    }

    try {
      setCreatingGroup(true);
      await createGroup(selectedScope, newGroupName, newGroupDescription);

      // Refresh groups list
      await loadGroups(selectedScope);

      // Reset form
      setNewGroupName("");
      setNewGroupDescription("");

      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: t("staff.groups.groupCreated"),
        life: 3000,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: t("staff.groups.errorCreatingGroup"),
        life: 3000,
      });
      console.error(err);
    } finally {
      setCreatingGroup(false);
    }
  };

  // Memoize scope options to prevent unnecessary recalculations
  const scopeOptions = useMemo(
    () =>
      scopes.map((scope) => ({
        label: scope.name,
        value: scope.id,
      })),
    [scopes]
  );

  // Render different UI states based on loading, error, and data availability
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <ProgressSpinner style={{ width: "50px", height: "50px" }} />
        <p className="mt-4 text-gray-600">{t("t.scopes.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Message
        severity="error"
        text={error}
        className="w-full mb-4"
        style={{ borderRadius: "8px" }}
      />
    );
  }

  if (scopes && scopes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow">
        <i className="pi pi-inbox text-5xl text-gray-400 mb-4"></i>
        <p className="text-gray-600 text-xl">{t("staff.scopes.noScopes")}</p>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen mb-28">
      <Toast ref={toast} />

      {/* Scope selection dropdown */}
      <div className="mb-4">
        <label
          htmlFor="scopes"
          className="block text-sm font-medium text-white mb-1"
        >
          {t("staff.users.selectScope")}
        </label>
        <Dropdown
          id="scopes"
          value={selectedScope}
          options={scopeOptions}
          onChange={handleSelectedScopeChange}
          placeholder={t("staff.users.selectScope")}
          className="w-full"
        />
      </div>

      {selectedScope && (
        <div className="container mx-auto px-2">
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {/* Create new group card */}
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-amber-500">
                  {t("staff.groups.new")}
                </h2>
                <i className="pi pi-plus-circle text-4xl text-amber-500"></i>
              </div>

              <div className="mb-3">
                <label
                  htmlFor="groupName"
                  className="block text-sm font-medium text-white mb-1"
                >
                  {t("staff.groups.name")}
                </label>
                <InputText
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full"
                  placeholder={t("staff.groups.groupName")}
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="groupDescription"
                  className="block text-sm font-medium text-white mb-1"
                >
                  {t("staff.groups.description")}
                </label>
                <InputTextarea
                  id="groupDescription"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  rows={2}
                  className="w-full"
                  placeholder={t("staff.groups.groupDescription")}
                />
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  label={t("staff.groups.create")}
                  icon="pi pi-plus"
                  className="p-button-primary"
                  onClick={handleCreateGroup}
                  loading={creatingGroup}
                />
              </div>
            </div>

            {/* Existing groups */}
            {groups.map((group) => (
              <div
                key={group.id}
                className="p-4 bg-white/10 backdrop-blur-md rounded-lg shadow-lg border border-white/30 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-amber-500">
                    {group.name}
                  </h2>
                  <i className="pi pi-users text-4xl text-amber-500"></i>
                </div>
                <p className="text-white mt-2">{group.description}</p>
                <p className="text-white mt-2">
                  <span className="font-semibold">
                    {t("staff.groups.students")}:
                  </span>{" "}
                  <span className="text-gray-300">
                    {group.users?.length || 0}
                  </span>
                </p>
                <div className="flex justify-end mt-4 space-x-2">
                  <Button
                    label={t("staff.groups.viewDetails")}
                    className="p-button-primary ml-2"
                  />
                </div>
              </div>
            ))}
          </div>

          {groups.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 bg-white/10 backdrop-blur-md rounded-lg shadow">
              <i className="pi pi-inbox text-5xl text-gray-400 mb-4"></i>
              <p className="text-gray-300 text-xl">
                {t("staff.groups.noGroups")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
