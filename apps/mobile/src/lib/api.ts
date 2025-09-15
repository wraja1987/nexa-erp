import axios from "axios";
import Constants from "expo-constants";
const extra = (Constants?.expoConfig?.extra as any) || {};
export const SIMULATE = (extra?.SIMULATE === "1");
const baseURL = extra?.API_BASE_URL || "https://api.nexaai.co.uk";
export const api = axios.create({ baseURL, timeout: 20000 });
if (extra?.API_TOKEN) { api.defaults.headers.common["Authorization"] = `Bearer ${extra.API_TOKEN}`; }
