import "react-native-gesture-handler";
import React from "react";
import { SafeAreaView, View, Text } from "react-native";
const nexa = { bg:"#F7F9FC", text:"#0B1424" };
export default function IndexWeb(){
  return (
    <SafeAreaView style={{ flex:1, backgroundColor:nexa.bg }}>
      <View style={{ padding:16 }}>
        <Text style={{ fontSize:22, fontWeight:"800", color:nexa.text }}>Nexa — Web Smoke Test</Text>
        <Text style={{ marginTop:8, color:"#6b7280" }}>
          If you can see this, rendering works. Router/screens can be the culprit.
        </Text>
      </View>
    </SafeAreaView>
  );
}
