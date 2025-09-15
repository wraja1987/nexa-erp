import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { nexa } from "../theme/nexa";
import { useBreakpoint, rf } from "../utils/responsive";
export default function Header({ title }: { title: string }){
  const { width } = useBreakpoint();
  return (
    <SafeAreaView style={{ backgroundColor: nexa.colours.bg }}>
      <View style={{ flexDirection:"row", alignItems:"center", paddingHorizontal:16, paddingVertical:12, borderBottomWidth:1, borderColor:"#e5e7eb" }}>
        <Image source={require("../../assets/nexa-logo.png")} style={{ width:32, height:32, marginRight:12 }} />
        <Text style={{ fontSize: rf(22,width), fontWeight:"800", color: nexa.colours.navy }}>{title}</Text>
      </View>
    </SafeAreaView>
  );
}
