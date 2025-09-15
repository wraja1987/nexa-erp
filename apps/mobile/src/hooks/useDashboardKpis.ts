import { useQuery } from "@tanstack/react-query";
import { fetchDashboardKpis } from "../data/dashboard";
export const useDashboardKpis = () =>
  useQuery({ queryKey:["kpis","dashboard"], queryFn: fetchDashboardKpis });
