import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import Header from "../../src/components/Header";
import { nexa } from "../../src/theme/nexa";
import * as POS from "../../src/data/pos";
export default function POSScreen(){
  const [busy,setBusy] = useState(false);
  const [pi,setPi] = useState<any>(null);
  const [msg,setMsg] = useState<string>("");
  async function handleCreate(){ setBusy(true); setMsg(""); try{ const p = await POS.createPI(55000,"gbp"); setPi(p); setMsg("PaymentIntent created"); }catch{ setMsg("Failed to create"); } finally{ setBusy(false); } }
  async function handleCapture(){ if(!pi?.id) return; setBusy(true); setMsg(""); try{ await POS.capturePI(pi.id); setMsg("Captured"); }catch{ setMsg("Failed to capture"); } finally{ setBusy(false); } }
  async function handleRefund(){ if(!pi?.id) return; setBusy(true); setMsg(""); try{ await POS.refundPI(pi.id, 55000); setMsg("Refunded"); }catch{ setMsg("Failed to refund"); } finally{ setBusy(false); } }
  return (
    <View style={{ flex:1, backgroundColor:nexa.colours.bg }}>
      <Header title="Point of Sale" />
      <View style={{ padding:16 }}>
        {busy && <ActivityIndicator/>}
        <View style={{ flexDirection:"row", gap:12, marginBottom:12 }}>
          <Btn label="Create" onPress={handleCreate}/>
          <Btn label="Capture" onPress={handleCapture} disabled={!pi}/>
          <Btn label="Refund" onPress={handleRefund} disabled={!pi}/>
        </View>
        {msg ? <Text style={{ color: msg.startsWith("Failed")? "tomato":"#2E6BFF" }}>{msg}</Text> : null}
        <View style={{ marginTop:16 }}>
          <Text style={{ color:"#6b7280" }}>PI: {pi?.id ?? "—"}</Text>
        </View>
      </View>
    </View>
  );
}
function Btn({label,onPress,disabled}:{label:string;onPress:()=>void;disabled?:boolean}){
  return (
    <Pressable onPress={onPress} disabled={disabled}
      style={{ backgroundColor: disabled? "#e5e7eb":"#2E6BFF", padding:14, borderRadius:12, marginRight:12 }}>
      <Text style={{ color: disabled? "#9ca3af":"#fff", fontWeight:"700" }}>{label}</Text>
    </Pressable>
  );
}
