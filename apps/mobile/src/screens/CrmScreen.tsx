import React, { useEffect, useState } from 'react'
import { View, Text, Button, Alert } from 'react-native'

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000'

export default function CrmScreen() {
  const [configured, setConfigured] = useState(false)
  const [lastSync, setLastSync] = useState('')
  const [counts, setCounts] = useState<{contacts:number; deals:number}>({ contacts: 0, deals: 0 })

  const headers: Record<string,string> = { 'content-type': 'application/json', 'x-role': 'user' }

  useEffect(() => {
    fetch(`${API_BASE}/api/crm/hubspot/status`, { headers })
      .then(r => r.json()).then(j => setConfigured(!!j.configured)).catch(()=>{})
  }, [])

  const sync = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/crm/hubspot/sync`, { method: 'POST', headers, body: JSON.stringify({ since: lastSync || undefined }) })
      const json = await res.json()
      if (res.ok && json.ok) {
        setLastSync(new Date().toISOString())
        setCounts({ contacts: json.contacts || 0, deals: json.deals || 0 })
        Alert.alert('Sync complete', `Contacts: ${json.contacts || 0}, Deals: ${json.deals || 0}`)
      } else {
        Alert.alert('Error', json.message || 'Failed')
      }
    } catch (e: any) { Alert.alert('Error', e?.message || 'Failed') }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text accessibilityRole="header" style={{ fontSize: 20, marginBottom: 12 }}>CRM Integrations</Text>
      <Text>HubSpot: {configured ? 'Configured' : 'Not configured'}</Text>
      <View style={{ height: 8 }} />
      <Button title="Sync" onPress={sync} />
      <View style={{ height: 8 }} />
      <Text>Last Sync: {lastSync || '—'}</Text>
      <Text>Contacts: {counts.contacts} Deals: {counts.deals}</Text>
    </View>
  )
}


