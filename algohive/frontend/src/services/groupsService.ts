import { ApiClient } from "../config/ApiClient";
import { Group } from "../models/Group";

export async function fetchGroupsFromScope(scopeId: string): Promise<Group[]> {
  try {
    const response = await ApiClient.get(`/groups/scope/${scopeId}`);

    if (response.status !== 200) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching groups:", error);
    throw error;
  }
}

export async function createGroup(
  scopeId: string,
  name: string,
  description: string
): Promise<void> {
  try {
    const response = await ApiClient.post("/groups/", {
      scope_id: scopeId,
      name,
      description,
    });

    if (response.status !== 201) {
      throw new Error(`Error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error creating group:", error);
    throw error;
  }
}
