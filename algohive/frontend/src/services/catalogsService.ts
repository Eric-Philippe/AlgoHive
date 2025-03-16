import { Catalog, Theme } from "../models/Catalogs";
import { ApiClient } from "../config/ApiClient";

export async function fetchCatalogs(): Promise<Catalog[]> {
  try {
    const response = await ApiClient.get("/catalogs/");
    if (response.status !== 200) {
      throw new Error(`Erreur: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching catalogs:", error);
    throw error;
  }
}

export async function fetchCatalogById(id: string): Promise<Catalog> {
  try {
    const response = await ApiClient.get(`/catalogs`);

    if (response.status !== 200) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.data.find((catalog: Catalog) => catalog.id === id);
  } catch (error) {
    console.error("Error fetching catalog by id:", error);
    throw error;
  }
}

export async function fetchCatalogThemes(catalogId: string): Promise<Theme[]> {
  try {
    const response = await ApiClient.get(`/catalogs/${catalogId}/themes`);
    if (response.status !== 200) {
      throw new Error(`Error: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching catalog themes:", error);
    throw error;
  }
}
