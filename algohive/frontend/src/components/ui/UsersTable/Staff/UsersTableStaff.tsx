import { useEffect, useMemo, useState } from "react";
import { User } from "../../../../models/User";
import { fetchUsersFromRoles } from "../../../../services/usersService";
import { t } from "i18next";
import { ProgressSpinner } from "primereact/progressspinner";
import { Message } from "primereact/message";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { fetchScopesFromRoles } from "../../../../services/scopesService";
import { Scope } from "../../../../models/Scope";
import { Group } from "../../../../models/Group";
import { Dropdown } from "primereact/dropdown";

interface UsersTableStaffProps {
  rolesIds: string[];
}

/**
 * Component that displays a filterable table of users based on their roles, scopes, and groups.
 * Users can be filtered by selecting a specific scope and then a group within that scope.
 */
export default function UsersTableStaff({ rolesIds }: UsersTableStaffProps) {
  // State for users, scopes, and UI control
  const [users, setUsers] = useState<User[]>([]);
  const [scopes, setScopes] = useState<Scope[]>([]);
  const [selectedScope, setSelectedScope] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Define table columns
  const columns = [
    { field: "firstname", header: t("common.fields.firstName") },
    { field: "lastname", header: t("common.fields.lastName") },
    { field: "email", header: t("common.fields.email") },
    { field: "last_connected", header: t("common.fields.lastConnection") },
  ];

  // Fetch users and scopes on component mount or when rolesIds changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch users and scopes in parallel for better performance
        const [userData, scopesData] = await Promise.all([
          fetchUsersFromRoles(rolesIds),
          fetchScopesFromRoles(rolesIds),
        ]);

        setUsers(userData);
        setScopes(scopesData);
      } catch (err) {
        setError(t("common.states.errorMessage"));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rolesIds]);

  // Memoize scope options to prevent unnecessary recalculations
  const scopeOptions = useMemo(() => {
    // Filter only from the selectedScope

    return scopes.map((scope) => ({
      label: scope.name,
      value: scope.id,
    }));
  }, [scopes]);

  // Get the available groups for the selected scope
  const groupOptions = useMemo(() => {
    if (!selectedScope) return [];

    const scope = scopes.find((scope) => scope.id === selectedScope);

    return (
      scope?.groups?.map((group: Group) => ({
        label: group.name,
        value: group.id,
      })) || []
    );
  }, [selectedScope, scopes]);

  // Filter users based on selected scope and group
  const filteredUsers = useMemo(() => {
    if (!selectedScope || !selectedGroup || !users) return [];

    return users.filter((user) =>
      user.groups?.some((group) => group.id === selectedGroup)
    );
  }, [users, selectedScope, selectedGroup]);

  // Handle scope selection change
  const handleScopeChange = (value: string | null) => {
    setSelectedScope(value);
    setSelectedGroup(null); // Reset group selection when scope changes
  };

  // Render different UI states based on loading, error, and data availability
  if (loading) {
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

  if (users && users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow">
        <i className="pi pi-inbox text-5xl text-gray-400 mb-4"></i>
        <p className="text-gray-600 text-xl">{t("common.states.empty")}</p>
      </div>
    );
  }

  return (
    <>
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
          onChange={(e) => handleScopeChange(e.value)}
          placeholder={t("common.selects.scopes")}
          className="w-full"
        />
      </div>

      {/* Group selection dropdown (only shown when a scope is selected) */}
      {selectedScope && (
        <div className="mb-4">
          <label
            htmlFor="groups"
            className="block text-sm font-medium text-white mb-1"
          >
            {t("common.selects.groups")}
          </label>
          <Dropdown
            id="groups"
            value={selectedGroup}
            options={groupOptions}
            onChange={(e) => setSelectedGroup(e.value)}
            placeholder={t("common.selects.groups")}
            className="w-full"
          />
        </div>
      )}

      {/* Users table (only shown when both scope and group are selected) */}
      {selectedScope && selectedGroup && (
        <DataTable value={filteredUsers}>
          {columns.map((col, i) => (
            <Column key={i} field={col.field} header={col.header} />
          ))}
        </DataTable>
      )}
    </>
  );
}
