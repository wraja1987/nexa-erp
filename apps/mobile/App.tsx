import "react-native-gesture-handler";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
const nexa = { bg:"#F7F9FC", text:"#0B1424", navy:"#0F2747", blue:"#2E6BFF" };
function Card({title,subtitle}:{title:string;subtitle:string}){
  return (<View style={{ backgroundColor:"#fff", borderRadius:16, padding:16, marginBottom:12, borderWidth:1, borderColor:"#e5e7eb" }}>
    <Text style={{ fontWeight:"700", color:nexa.text }}>{title}</Text>
    <Text style={{ color:"#6b7280", marginTop:6 }}>{subtitle}</Text>
  </View>);
}
export default function App(){
  const { width } = useWindowDimensions();
  const col = width < 640 ? "100%" : width < 1024 ? "48%" : "31%";
  const kpis = [
    {t:"GL balance", s:"£23,400"},
    {t:"Invoices",   s:"168"},
    {t:"Inventory",  s:"23,450"},
    {t:"AI Insight", s:"Consider a discount to clear excess stock."}
  ];
  return (
    <SafeAreaView style={{ flex:1, backgroundColor:nexa.bg }}>
      <View style={{ flexDirection:"row", alignItems:"center", padding:16, borderBottomWidth:1, borderColor:"#e5e7eb" }}>
        <View style={{ width:32, height:32, borderRadius:8, backgroundColor:nexa.blue, marginRight:12 }} />
        <Text style={{ fontSize:22, fontWeight:"800", color:nexa.navy }}>Nexa — Preview</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding:16 }}>
        <View style={{ flexDirection:"row", flexWrap:"wrap", gap:12 }}>
          {kpis.map((k,i)=>(
            <View key={i} style={{ width: col }}>
              <Card title={k.t} subtitle={k.s}/>
            </View>
          ))}
        </View>
        <View style={{ marginTop:12, flexDirection:"row", gap:12, flexWrap:"wrap" }}>
          {["Dashboard","Finance","Modules","POS","Settings"].map((label)=>(
            <Pressable key={label} style={{ backgroundColor:nexa.blue, paddingVertical:12, paddingHorizontal:14, borderRadius:12 }}>
              <Text style={{ color:"#fff", fontWeight:"700" }}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
