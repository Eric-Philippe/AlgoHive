import { ApiClient } from "../config/ApiClient";
import { User } from "../models/User";

export async function fetchUsers(): Promise<User[]> {
  try {
    const response = await ApiClient.get("/user/");

    if (response.status !== 200) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export async function fetchUsersFromRoles(roles: string[]): Promise<User[]> {
  try {
    const response = await ApiClient.get(
      `/user/roles?roles=${roles.join(",")}`
    );

    if (response.status !== 200) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}
