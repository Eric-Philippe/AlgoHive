import { ApiClient } from "../config/ApiClient";
import { Scope } from "../models/Scope";

export async function fetchScopes(): Promise<Scope[]> {
  try {
    const response = await ApiClient.get("/scopes/user");

    if (response.status !== 200) {
      throw new Error(`Erreur: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des scopes:", error);
    throw error;
  }
}

export async function createScope(
  name: string,
  description: string,
  api_ids: string[]
): Promise<Scope> {
  try {
    const response = await ApiClient.post("/scopes/", {
      name,
      description,
      api_ids,
    });

    if (response.status !== 201) {
      throw new Error(`Erreur: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création du scope:", error);
    throw error;
  }
}
