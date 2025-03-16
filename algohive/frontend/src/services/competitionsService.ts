import { ApiClient } from "../config/ApiClient";
import { Competition } from "../models/Competition";
import { Group } from "../models/Group";
import { Try } from "../models/Try";

export interface CompetitionStatistics {
  competition_id: string;
  title: string;
  total_users: number;
  active_users: number;
  completion_rate: number;
  average_score: number;
  highest_score: number;
}

// Get all competitions
export const fetchCompetitions = async (): Promise<Competition[]> => {
  const response = await ApiClient.get("/competitions/");
  return response.data;
};

// Get competition details
export const fetchCompetitionDetails = async (
  id: string
): Promise<Competition> => {
  const response = await ApiClient.get(`/competitions/${id}`);
  return response.data;
};

// Create a new competition
export const createCompetition = async (
  competition: Partial<Competition>
): Promise<Competition> => {
  const response = await ApiClient.post("/competitions/", competition);
  return response.data;
};

// Update an existing competition
export const updateCompetition = async (
  id: string,
  competition: Partial<Competition>
): Promise<Competition> => {
  const response = await ApiClient.put(`/competitions/${id}`, competition);
  return response.data;
};

// Delete a competition
export const deleteCompetition = async (id: string): Promise<void> => {
  await ApiClient.delete(`/competitions/${id}`);
};

// Toggle competition visibility
export const toggleCompetitionVisibility = async (
  id: string,
  show: boolean
): Promise<Competition> => {
  const response = await ApiClient.put(`/competitions/${id}/visibility`, {
    show,
  });
  return response.data;
};

// Mark competition as finished
export const finishCompetition = async (id: string): Promise<Competition> => {
  const response = await ApiClient.put(`/competitions/${id}/finish`);
  return response.data;
};

// Get competition statistics
export const fetchCompetitionStatistics = async (
  id: string
): Promise<CompetitionStatistics> => {
  const response = await ApiClient.get(`/competitions/${id}/statistics`);
  return response.data;
};

// Get competition groups
export const fetchCompetitionGroups = async (id: string): Promise<Group[]> => {
  const response = await ApiClient.get(`/competitions/${id}/groups`);
  return response.data;
};

// Add group to competition
export const addGroupToCompetition = async (
  competitionId: string,
  groupId: string
): Promise<Competition> => {
  const response = await ApiClient.post(
    `/competitions/${competitionId}/groups/${groupId}`
  );
  return response.data;
};

// Remove group from competition
export const removeGroupFromCompetition = async (
  competitionId: string,
  groupId: string
): Promise<Competition> => {
  const response = await ApiClient.delete(
    `/competitions/${competitionId}/groups/${groupId}`
  );
  return response.data;
};

// Get competition tries
export const fetchCompetitionTries = async (id: string): Promise<Try[]> => {
  const response = await ApiClient.get(`/competitions/${id}/tries`);
  return response.data;
};

// Get user competition tries
export const fetchUserCompetitionTries = async (
  competitionId: string,
  userId: string
): Promise<Try[]> => {
  const response = await ApiClient.get(
    `/competitions/${competitionId}/users/${userId}/tries`
  );
  return response.data;
};
