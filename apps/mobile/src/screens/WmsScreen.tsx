import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000'

export default function WmsScreen() {
  const [sku, setSku] = useState('SKU-ABC')
  const [qty, setQty] = useState('5')
  const [labelsQty, setLabelsQty] = useState('2')

  const headers: Record<string,string> = { 'content-type': 'application/json', 'x-role': 'admin' }

  const putaway = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/wms/putaway`, { method: 'POST', headers, body: JSON.stringify({ sku, qty: Number(qty) }) })
      const json = await res.json()
      if (json.ok) Alert.alert('Putaway', 'Success')
      else Alert.alert('Error', json.message || 'Failed')
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed')
    }
  }

  const labels = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/wms/labels`, { method: 'POST', headers, body: JSON.stringify({ sku, qty: Number(labelsQty) }) })
      const json = await res.json()
      if (json.ok) Alert.alert('Labels', `${json.labels?.length || 0} labels generated`)
      else Alert.alert('Error', json.message || 'Failed')
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed')
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text accessibilityRole="header" style={{ fontSize: 20, marginBottom: 12 }}>WMS</Text>
      <Text>SKU</Text>
      <TextInput accessibilityLabel="sku" value={sku} onChangeText={setSku} style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <Text>Qty</Text>
      <TextInput accessibilityLabel="qty" value={qty} onChangeText={setQty} keyboardType="numeric" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <Button title="Putaway" onPress={putaway} />
      <View style={{ height: 12 }} />
      <Text>Labels Qty</Text>
      <TextInput accessibilityLabel="labelsQty" value={labelsQty} onChangeText={setLabelsQty} keyboardType="numeric" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <Button title="Generate Labels" onPress={labels} />
    </View>
  )
}


