import { useQuery } from "@tanstack/react-query";
import { fetchGL } from "../data/finance";
export const useFinanceGL = () =>
  useQuery({ queryKey:["finance","gl"], queryFn: fetchGL });
