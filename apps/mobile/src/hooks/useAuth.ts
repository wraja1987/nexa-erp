import { useState } from "react";
import { api } from "../lib/api";
export function useAuth(){
  const [token,setToken] = useState<string|undefined>(undefined);
  function login(t:string){ setToken(t); api.defaults.headers.common["Authorization"]=`Bearer ${t}`; }
  function logout(){ setToken(undefined); delete (api.defaults.headers.common as any)["Authorization"]; }
  return { token, isAuthed: !!token, login, logout };
}
