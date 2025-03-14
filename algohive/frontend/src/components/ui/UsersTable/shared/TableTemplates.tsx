import { t } from "i18next";
import { User } from "../../../../models/User";
import { Group } from "../../../../models/Group";
import { Role } from "../../../../models/Role";

/**
 * Displays user status (active/blocked) with color coding
 */
export const StatusTemplate = (user: User) => {
  return (
    <span
      className={`px-2 py-1 rounded text-xs ${
        user.blocked ? "bg-red-200 text-red-800" : "bg-green-200 text-green-800"
      }`}
    >
      {user.blocked
        ? t("staffTabs.users.blocked")
        : t("staffTabs.users.active")}
    </span>
  );
};

/**
 * Formats and displays user's last connection time
 */
export const LastConnectionTemplate = (user: User) => {
  return (
    <span className="text-sm">
      {user.last_connected
        ? new Date(user.last_connected).toLocaleString()
        : t("staffTabs.users.neverConnected")}
    </span>
  );
};

/**
 * Displays user's group affiliations as tags
 */
export const GroupsTemplate = (user: User) => {
  return (
    <div className="flex flex-wrap gap-1">
      {user.groups?.map((group: Group) => (
        <span
          key={group.id}
          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
        >
          {group.name}
        </span>
      ))}
    </div>
  );
};

/**
 * Displays user's roles as tags
 */
export const RolesTemplate = (user: User) => {
  return (
    <div className="flex flex-wrap gap-1">
      {user.roles?.map((role: Role) => (
        <span
          key={role.id}
          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
        >
          {role.name}
        </span>
      ))}
    </div>
  );
};
