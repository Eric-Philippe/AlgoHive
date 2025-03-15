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
  getGroupById,
  updateGroup,
  deleteGroup,
} from "../../../services/groupsService";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import CreateGroupForm from "./components/CreateGroupForm";
import GroupCard from "./components/GroupCard";
import EditGroupDialog from "./components/EditGroupDialog";
import GroupDetailsDialog from "./components/GroupDetailsDialog";
import DeleteGroupDialog from "./components/DeleteGroupDialog";

/**
 * Groups management page component
 * Provides full CRUD functionality for managing student groups
 */
export default function GroupsPage() {
  const { user } = useAuth();
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [selectedScope, setSelectedScope] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const toast = useRef<Toast>(null);

  // Selected group for operations
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Operation states
  const [creatingGroup, setCreatingGroup] = useState<boolean>(false);
  const [updatingGroup, setUpdatingGroup] = useState<boolean>(false);
  const [deletingGroup, setDeletingGroup] = useState<boolean>(false);

  // Dialog visibility states
  const [editDialogVisible, setEditDialogVisible] = useState<boolean>(false);
  const [detailsDialogVisible, setDetailsDialogVisible] =
    useState<boolean>(false);
  const [deleteDialogVisible, setDeleteDialogVisible] =
    useState<boolean>(false);

  /**
   * Fetch available scopes on component mount
   */
  useEffect(() => {
    const fetchScopes = async () => {
      try {
        setLoading(true);
        const rolesIds: string[] =
          user && user.roles ? user.roles.map((role: Role) => role.id) : [];

        let scopesData = await fetchScopesFromRoles(rolesIds);
        if (scopesData.length === null) scopesData = [];

        setScopes(scopesData);
      } catch (err) {
        setError(t("staffTabs.groups.errorFetchingScopes"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchScopes();
  }, [user]);

  /**
   * Filter groups based on search query
   */
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredGroups(groups);
    } else {
      const filtered = groups.filter(
        (group) =>
          group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (group.description &&
            group.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredGroups(filtered);
    }
  }, [searchQuery, groups]);

  /**
   * Handle scope selection change and load associated groups
   */
  const handleSelectedScopeChange = async (e: DropdownChangeEvent) => {
    setSelectedScope(e.value);
    setSearchQuery("");
    await loadGroups(e.value);
  };

  /**
   * Load groups based on selected scope
   */
  const loadGroups = async (scopeId: string) => {
    if (scopeId) {
      try {
        setLoading(true);
        const fetchedGroups = await fetchGroupsFromScope(scopeId);
        setGroups(fetchedGroups);
        setFilteredGroups(fetchedGroups);
      } catch (err) {
        toast.current?.show({
          severity: "error",
          summary: t("common.states.error"),
          detail: t("staffTabs.groups.errorFetchingGroups"),
          life: 3000,
        });
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setGroups([]);
      setFilteredGroups([]);
    }
  };

  /**
   * Handle group creation
   */
  const handleCreateGroup = async (name: string, description: string) => {
    if (!selectedScope) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.groups.selectScopeFirst"),
        life: 3000,
      });
      return;
    }

    if (!name.trim()) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.groups.nameRequired"),
        life: 3000,
      });
      return;
    }

    try {
      setCreatingGroup(true);
      await createGroup(selectedScope, name, description);

      // Refresh groups list
      await loadGroups(selectedScope);

      toast.current?.show({
        severity: "success",
        summary: t("common.states.success"),
        detail: t("staffTabs.groups.groupCreated"),
        life: 3000,
      });
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.groups.errorCreatingGroup"),
        life: 3000,
      });
      console.error(err);
    } finally {
      setCreatingGroup(false);
    }
  };

  /**
   * Handle group update
   */
  const handleUpdateGroup = async (
    id: string,
    name: string,
    description: string
  ) => {
    if (!name.trim()) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.groups.nameRequired"),
        life: 3000,
      });
      return;
    }

    try {
      setUpdatingGroup(true);
      await updateGroup(id, name, description);

      // Refresh groups list if scope is selected
      if (selectedScope) {
        await loadGroups(selectedScope);
      }

      toast.current?.show({
        severity: "success",
        summary: t("common.states.success"),
        detail: t("staffTabs.groups.groupUpdated"),
        life: 3000,
      });
      setEditDialogVisible(false);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.groups.errorUpdatingGroup"),
        life: 3000,
      });
      console.error(err);
    } finally {
      setUpdatingGroup(false);
    }
  };

  /**
   * Handle group deletion
   */
  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    try {
      setDeletingGroup(true);
      await deleteGroup(selectedGroup.id);

      // Refresh groups list if scope is selected
      if (selectedScope) {
        await loadGroups(selectedScope);
      }

      toast.current?.show({
        severity: "success",
        summary: t("common.states.success"),
        detail: t("staffTabs.groups.groupDeleted"),
        life: 3000,
      });
      setDeleteDialogVisible(false);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.groups.errorDeletingGroup"),
        life: 3000,
      });
      console.error(err);
    } finally {
      setDeletingGroup(false);
    }
  };

  /**
   * Open group details dialog
   */
  const openDetailsDialog = async (group: Group) => {
    try {
      // Fetch the latest group data to ensure we have all relationships
      const fetchedGroup = await getGroupById(group.id);
      setSelectedGroup(fetchedGroup);
      setDetailsDialogVisible(true);
    } catch (err) {
      toast.current?.show({
        severity: "error",
        summary: t("common.states.error"),
        detail: t("staffTabs.groups.errorFetchingGroupDetails"),
        life: 3000,
      });
      console.error(err);
    }
  };

  /**
   * Open edit group dialog
   */
  const openEditDialog = (group: Group) => {
    setSelectedGroup(group);
    setEditDialogVisible(true);
  };

  /**
   * Open delete group dialog
   */
  const openDeleteDialog = (group: Group) => {
    setSelectedGroup(group);
    setDeleteDialogVisible(true);
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
  if (loading && !selectedScope) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <ProgressSpinner style={{ width: "50px", height: "50px" }} />
        <p className="mt-4 text-gray-600">{t("common.states.loading")}</p>
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
      <div className="flex flex-col items-center justify-center p-12 bg-white/10 backdrop-blur-md rounded-lg shadow">
        <i className="pi pi-inbox text-5xl text-gray-400 mb-4"></i>
        <p className="text-gray-300 text-xl">
          {t("staffTabs.scopes.messages.notFound")}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen mb-28">
      <Toast ref={toast} />

      {/* Dialogs */}
      <EditGroupDialog
        visible={editDialogVisible}
        group={selectedGroup}
        onHide={() => setEditDialogVisible(false)}
        onSave={handleUpdateGroup}
        loading={updatingGroup}
      />

      <GroupDetailsDialog
        visible={detailsDialogVisible}
        group={selectedGroup}
        onHide={() => setDetailsDialogVisible(false)}
        onEdit={() => {
          setDetailsDialogVisible(false);
          setEditDialogVisible(true);
        }}
      />

      <DeleteGroupDialog
        visible={deleteDialogVisible}
        group={selectedGroup}
        onHide={() => setDeleteDialogVisible(false)}
        onConfirm={handleDeleteGroup}
        loading={deletingGroup}
      />

      {/* Header and scope selection */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <h1 className="text-2xl font-bold text-white">
            {t("navigation.staff.groups")}
          </h1>
        </div>
      </div>

      {/* Scope selection dropdown */}
      <div className="mb-4">
        <label
          htmlFor="scopes"
          className="block text-sm font-medium text-white mb-1"
        >
          {t("common.selects.scopes")}
        </label>
        <Dropdown
          id="scopes"
          value={selectedScope}
          options={scopeOptions}
          onChange={handleSelectedScopeChange}
          placeholder={t("common.selects.scopes")}
          className="w-full"
        />
      </div>

      {selectedScope && (
        <>
          {/* Search box */}
          {groups.length > 0 && (
            <div className="mb-4">
              <span className="p-input-icon-right w-full">
                <i className="pi pi-search" style={{ right: "10px" }} />
                <InputText
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("staffTabs.groups.searchGroups")}
                  className="w-full"
                  style={{ paddingRight: "35px" }}
                />
              </span>
            </div>
          )}

          <div className="container mx-auto px-2">
            {loading && (
              <div className="flex justify-center p-4">
                <ProgressSpinner style={{ width: "40px", height: "40px" }} />
              </div>
            )}

            {!loading && (
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                {/* Create new group card */}
                <CreateGroupForm
                  selectedScope={selectedScope}
                  onCreateGroup={handleCreateGroup}
                  isLoading={creatingGroup}
                />

                {/* Existing groups */}
                {filteredGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onEdit={() => openEditDialog(group)}
                    onDelete={() => openDeleteDialog(group)}
                    onViewDetails={() => openDetailsDialog(group)}
                  />
                ))}
              </div>
            )}

            {/* No groups found message */}
            {!loading && groups.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 bg-white/10 backdrop-blur-md rounded-lg shadow">
                <i className="pi pi-inbox text-5xl text-gray-400 mb-4"></i>
                <p className="text-gray-300 text-xl">
                  {t("staffTabs.groups.noGroups")}
                </p>
              </div>
            )}

            {/* No search results */}
            {!loading && groups.length > 0 && filteredGroups.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 mt-6 bg-white/10 backdrop-blur-md rounded-lg shadow">
                <i className="pi pi-search text-4xl text-gray-400 mb-3"></i>
                <p className="text-gray-300 text-lg">
                  {t("staffTabs.groups.noSearchResults")}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* No scope selected yet */}
      {!selectedScope && !loading && (
        <div className="flex flex-col items-center justify-center p-12 bg-white/10 backdrop-blur-md rounded-lg shadow">
          <i className="pi pi-arrow-up text-5xl text-amber-500 mb-4"></i>
          <p className="text-gray-300 text-xl">
            {t("staffTabs.groups.selectScopeToManageGroups")}
          </p>
        </div>
      )}
    </div>
  );
}
