import axios from "axios";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;

export const ApiClient = axios.create({
  baseURL: API_ENDPOINT,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
