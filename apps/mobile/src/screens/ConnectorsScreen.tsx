import React from 'react'
import { View, Text, Button, ScrollView } from 'react-native'
import { getModules } from '@nexa/registry'

export default function ConnectorsScreen() {
  const modules = getModules()
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text accessibilityRole="header" style={{ fontSize: 20, marginBottom: 12 }}>Connectors</Text>
      {modules.map(m => (
        <View key={m.key} style={{ padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, marginBottom: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>{m.name}</Text>
          <Text style={{ marginVertical: 4 }}>Status: {m.status === 'active' ? 'Configured' : 'Not configured'}</Text>
          <Button title="Test connection" onPress={()=>{}} accessibilityLabel={`Test ${m.name}`} />
        </View>
      ))}
    </ScrollView>
  )
}


