import react-native-gesture-handler;
import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../src/lib/query";
export default function RootLayout(){
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown:false }}/>
    </QueryClientProvider>
  );
}
