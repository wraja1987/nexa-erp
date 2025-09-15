import { View, Text, ActivityIndicator } from "react-native";
import Header from "../../src/components/Header";
import { nexa } from "../../src/theme/nexa";
import { useFinanceGL } from "../../src/hooks/useFinanceGL";
export default function Finance(){
  const { data, isLoading, error } = useFinanceGL();
  return (
    <View style={{ flex:1, backgroundColor:nexa.colours.bg }}>
      <Header title="Finance" />
      <View style={{ padding:16 }}>
        {isLoading && <ActivityIndicator/>}
        {error && <Text style={{ color:"tomato" }}>Failed to load General Ledger</Text>}
        {!!data && data.map(row=>(
          <View key={row.id} style={{ backgroundColor:"#fff", borderRadius:16, padding:16, marginBottom:12, borderWidth:1, borderColor:"#e5e7eb" }}>
            <Text style={{ fontWeight:"700", color:nexa.colours.text }}>{row.account}</Text>
            <Text style={{ color:"#6b7280" }}>{row.date} · Debit £{row.debit} · Credit £{row.credit}</Text>
            {row.memo ? <Text style={{ color:"#6b7280" }}>{row.memo}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}
