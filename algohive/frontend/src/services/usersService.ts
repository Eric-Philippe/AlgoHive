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

export async function createStaffUser(
  firstname: string,
  lastname: string,
  email: string,
  roles: string[]
) {
  try {
    const response = await ApiClient.post("/user/roles", {
      firstname,
      lastname,
      email,
      roles,
    });

    if (response.status !== 201) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function deleteUser(userId: string) {
  try {
    const response = await ApiClient.delete(`/user/${userId}`);

    if (response.status !== 204) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
