import { useLocalSearchParams } from "expo-router";
import { View, Text } from "react-native";
import { nexa } from "../../../src/theme/nexa";
import Header from "../../../src/components/Header";
import { modules } from "../../../src/config/modules";
export default function SubModulePage(){
  const { module, sub } = useLocalSearchParams<{module:string;sub:string}>();
  const M = modules.find(m=>m.slug===module);
  const S = M?.sub.find(s=>s.slug===sub);
  if(!M||!S) return null;
  return (
    <View style={{ flex:1, backgroundColor:nexa.colours.bg }}>
      <Header title={`${M.label} — ${S.label}`} />
      <View style={{ flex:1, padding:16 }}>
        <View style={{ backgroundColor:"#fff", borderRadius:16, padding:16, borderWidth:1, borderColor:"#e5e7eb" }}>
          <Text style={{ color:nexa.colours.text }}>This page will render {S.label} KPIs, lists and actions with Nexa styling.</Text>
        </View>
      </View>
    </View>
  );
}
