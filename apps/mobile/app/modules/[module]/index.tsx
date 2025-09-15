import { useLocalSearchParams, Link } from "expo-router";
import { View, Text } from "react-native";
import { nexa } from "../../../src/theme/nexa";
import Header from "../../../src/components/Header";
import { modules } from "../../../src/config/modules";
export default function ModulePage(){
  const { module } = useLocalSearchParams<{module:string}>();
  const M = modules.find(m=>m.slug===module);
  if(!M) return null;
  return (
    <View style={{ flex:1, backgroundColor:nexa.colours.bg }}>
      <Header title={M.label} />
      <View style={{ flex:1, padding:16 }}>
        {M.sub.length===0 ? <Text>No sub-modules.</Text> : M.sub.map(s=>(
          <Link key={s.slug} href={`/modules/${M.slug}/${s.slug}`} asChild>
            <View style={{ backgroundColor:"#fff", borderRadius:16, padding:16, marginBottom:12, borderWidth:1, borderColor:"#e5e7eb" }}>
              <Text style={{ fontWeight:"700", color:nexa.colours.text }}>{s.label}</Text>
            </View>
          </Link>
        ))}
      </View>
    </View>
  );
}
