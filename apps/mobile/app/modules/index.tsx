import { Link } from "expo-router";
import { View, Text } from "react-native";
import { nexa } from "../../src/theme/nexa";
import Header from "../../src/components/Header";
import { modules } from "../../src/config/modules";
export default function ModulesIndex(){
  return (
    <View style={{ flex:1, backgroundColor:nexa.colours.bg }}>
      <Header title="Modules" />
      <View style={{ flex:1, padding:16 }}>
        {modules.map(m=>(
          <Link key={m.slug} href={`/modules/${m.slug}`} asChild>
            <View style={{ backgroundColor:"#fff", borderRadius:16, padding:16, marginBottom:12, borderWidth:1, borderColor:"#e5e7eb" }}>
              <Text style={{ fontWeight:"700", color:nexa.colours.text }}>{m.label}</Text>
            </View>
          </Link>
        ))}
      </View>
    </View>
  );
}
