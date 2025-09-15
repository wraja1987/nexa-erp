import { View, Text } from "react-native";
import Header from "../../src/components/Header";
import { nexa } from "../../src/theme/nexa";
export default function Settings(){
  return (
    <View style={{ flex:1, backgroundColor:nexa.colours.bg }}>
      <Header title="Settings" />
      <View style={{ padding:16 }}>
        <View style={{ backgroundColor:"#fff", borderRadius:16, padding:16, borderWidth:1, borderColor:"#e5e7eb" }}>
          <Text style={{ color:nexa.colours.text }}>Profile, Tenants, Appearance, About.</Text>
        </View>
      </View>
    </View>
  );
}
