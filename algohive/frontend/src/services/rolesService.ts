import { ApiClient } from "../config/ApiClient";
import { Role } from "../models/Role";

export async function fetchRoles(): Promise<Role[]> {
  try {
    const response = await ApiClient.get("/roles/");

    if (response.status !== 200) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    throw error;
  }
}

export async function getRoleById(id: string): Promise<Role> {
  try {
    const response = await ApiClient.get(`/roles/${id}`);

    if (response.status !== 200) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching role with id ${id}:`, error);
    throw error;
  }
}

export async function createRole(
  name: string,
  permissions: number,
  scopes_ids: string[]
): Promise<Role> {
  if (permissions > 31) permissions = 0;

  const body = {
    name: name,
    permission: permissions,
    scopes_ids: scopes_ids,
  };

  try {
    const response = await ApiClient.post("/roles/", body);

    if (response.status !== 201) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error creating role:", error);
    throw error;
  }
}

export async function updateRole(
  id: string,
  name: string,
  permissions: number,
  scopes_ids: string[]
): Promise<Role> {
  if (permissions > 31)
    throw new Error("Permissions must be a number between 0 and 31");

  const body = {
    name: name,
    permission: permissions,
    scopes_ids: scopes_ids,
  };

  try {
    const response = await ApiClient.put(`/roles/${id}`, body);

    if (response.status !== 200) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error updating role:", error);
    throw error;
  }
}

export async function deleteRole(roleId: string): Promise<void> {
  try {
    const response = await ApiClient.delete(`/roles/${roleId}`);

    if (response.status !== 200 && response.status !== 204) {
      throw new Error(`Error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
}
