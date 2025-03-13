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
