import React, { useState } from 'react'
import { View, Text, TextInput, Button, Alert } from 'react-native'

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000'

export default function MfgScreen() {
  const [tenantId, setTenantId] = useState('t1')
  const [itemCode, setItemCode] = useState('SKU-ABC')
  const [qty, setQty] = useState('10')
  const [resourceCode, setResourceCode] = useState('RES-1')
  const [availableMins, setAvailableMins] = useState('420')
  const [workOrderNumber, setWorkOrderNumber] = useState('WO-123')
  const [durationMins, setDurationMins] = useState('90')

  const headers: Record<string,string> = { 'content-type': 'application/json', 'x-role': 'admin', 'x-tenant-id': tenantId }

  const runMrp = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mfg/mrp`, { method: 'POST', headers, body: JSON.stringify({ tenantId, itemCode, qty: Number(qty) }) })
      const json = await res.json()
      if (res.ok && json.ok) Alert.alert('MRP', 'Generated')
      else Alert.alert('Error', json.message || 'Failed')
    } catch (e: any) { Alert.alert('Error', e?.message || 'Failed') }
  }

  const updateCapacity = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mfg/capacity`, { method: 'POST', headers, body: JSON.stringify({ tenantId, resourceCode, date: new Date().toISOString(), availableMins: Number(availableMins) }) })
      const json = await res.json()
      if (res.ok && json.ok) Alert.alert('Capacity', 'Updated')
      else Alert.alert('Error', json.message || 'Failed')
    } catch (e: any) { Alert.alert('Error', e?.message || 'Failed') }
  }

  const scheduleAps = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mfg/aps`, { method: 'POST', headers, body: JSON.stringify({ tenantId, workOrderNumber, durationMins: Number(durationMins) }) })
      const json = await res.json()
      if (res.ok && json.ok) Alert.alert('APS', 'Planned')
      else Alert.alert('Error', json.message || 'Failed')
    } catch (e: any) { Alert.alert('Error', e?.message || 'Failed') }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text accessibilityRole="header" style={{ fontSize: 20, marginBottom: 12 }}>Manufacturing</Text>
      <Text>Tenant</Text>
      <TextInput accessibilityLabel="tenantId" value={tenantId} onChangeText={setTenantId} style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />

      <Text style={{ fontWeight: '600' }}>MRP</Text>
      <Text>Item</Text>
      <TextInput accessibilityLabel="itemCode" value={itemCode} onChangeText={setItemCode} style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <Text>Qty</Text>
      <TextInput accessibilityLabel="qty" value={qty} onChangeText={setQty} keyboardType="numeric" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <Button title="Run MRP" onPress={runMrp} />

      <View style={{ height: 16 }} />
      <Text style={{ fontWeight: '600' }}>Capacity</Text>
      <Text>Resource</Text>
      <TextInput accessibilityLabel="resourceCode" value={resourceCode} onChangeText={setResourceCode} style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <Text>Available Mins</Text>
      <TextInput accessibilityLabel="availableMins" value={availableMins} onChangeText={setAvailableMins} keyboardType="numeric" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <Button title="Update Capacity" onPress={updateCapacity} />

      <View style={{ height: 16 }} />
      <Text style={{ fontWeight: '600' }}>APS</Text>
      <Text>WO</Text>
      <TextInput accessibilityLabel="workOrderNumber" value={workOrderNumber} onChangeText={setWorkOrderNumber} style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <Text>Duration Mins</Text>
      <TextInput accessibilityLabel="durationMins" value={durationMins} onChangeText={setDurationMins} keyboardType="numeric" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
      <Button title="Schedule APS" onPress={scheduleAps} />
    </View>
  )
}


