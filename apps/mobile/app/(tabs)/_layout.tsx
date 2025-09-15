import { Tabs } from "expo-router";
import { nexa } from "../../src/theme/nexa";
export default function TabsLayout(){
  return (
    <Tabs screenOptions={{ headerShown:false, tabBarActiveTintColor:nexa.colours.blue }}>
      <Tabs.Screen name="dashboard" options={{ title:"Home" }} />
      <Tabs.Screen name="finance" options={{ title:"Finance" }} />
      <Tabs.Screen name="modules" options={{ title:"Modules" }} />
      <Tabs.Screen name="pos" options={{ title:"POS" }} />
      <Tabs.Screen name="settings" options={{ title:"Settings" }} />
    </Tabs>
  );
}
