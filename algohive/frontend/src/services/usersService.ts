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

// /user/group/{group_id}
export async function createUser(
  firstname: string,
  lastname: string,
  email: string,
  groupeId: string
) {
  try {
    const response = await ApiClient.post(`/user/groups`, {
      firstname,
      lastname,
      email,
      groups: [groupeId],
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

export async function toggleBlockUser(userId: string) {
  try {
    const response = await ApiClient.put(`/user/block/${userId}`);

    if (response.status !== 200) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    console.error("Error toggling block user:", error);
    throw error;
  }
}
