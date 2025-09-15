import React from "react";
import { View, Text } from "react-native";
import Header from "../../src/components/Header";
import { nexa } from "../../src/theme/nexa";
export default function Dashboard(){
  return (
    <View style={{ flex:1, backgroundColor:nexa.colours.bg }}>
      <Header title="Dashboard" />
      <View style={{ padding:16 }}>
        <View style={{ backgroundColor:"#fff", borderRadius:16, padding:16, borderWidth:1, borderColor:"#e5e7eb" }}>
          <Text style={{ color:nexa.colours.text, fontWeight:"700" }}>Welcome to Nexa</Text>
          <Text style={{ color:"#6b7280", marginTop:6 }}>This is a smoke-check view. If you can see this, routing and UI are OK.</Text>
        </View>
      </View>
    </View>
  );
}
