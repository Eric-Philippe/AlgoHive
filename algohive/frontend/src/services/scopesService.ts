import { ApiClient } from "../config/ApiClient";
import { Scope } from "../models/Scope";

export async function fetchScopes(): Promise<Scope[]> {
  try {
    const response = await ApiClient.get("/scopes/user");

    if (response.status !== 200) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching scopes:", error);
    throw error;
  }
}

export async function getScopeById(id: string): Promise<Scope> {
  try {
    const response = await ApiClient.get(`/scopes/${id}`);

    if (response.status !== 200) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching scope with id ${id}:`, error);
    throw error;
  }
}

export async function createScope(
  name: string,
  description: string,
  catalogs_ids: string[]
): Promise<Scope> {
  try {
    const response = await ApiClient.post("/scopes/", {
      name,
      description,
      catalogs_ids,
    });

    if (response.status !== 201) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error creating scope:", error);
    throw error;
  }
}

export async function updateScope(
  id: string,
  name: string,
  description: string,
  catalogs_ids: string[]
): Promise<Scope> {
  try {
    const response = await ApiClient.put(`/scopes/${id}`, {
      name,
      description,
      catalogs_ids,
    });

    if (response.status !== 200) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error updating scope:", error);
    throw error;
  }
}

export async function deleteScope(id: string): Promise<void> {
  try {
    const response = await ApiClient.delete(`/scopes/${id}`);

    if (response.status !== 204) {
      throw new Error(`Error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error deleting scope:", error);
    throw error;
  }
}

export async function fetchScopesFromRoles(roles: string[]): Promise<Scope[]> {
  try {
    const response = await ApiClient.get(
      `/scopes/roles?roles=${roles.join(",")}`
    );

    if (response.status !== 200) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching scopes:", error);
    throw error;
  }
}
