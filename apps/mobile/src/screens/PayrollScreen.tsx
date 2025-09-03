import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, Button, FlatList, Pressable, Alert } from 'react-native'

type Run = { id: string; periodStart: string; periodEnd: string; status: string }
type Payslip = { id: string; employeeId: string; gross?: number; net?: number; pdfUrl?: string }

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:3000'

export default function PayrollScreen() {
  const [runs, setRuns] = useState<Run[]>([])
  const [selectedRunId, setSelectedRunId] = useState<string>('')
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [periodStart, setPeriodStart] = useState('2025-09-01')
  const [periodEnd, setPeriodEnd] = useState('2025-09-30')
  const [scheduleId, setScheduleId] = useState('default')
  const [loading, setLoading] = useState(false)

  const headers: Record<string,string> = { 'content-type': 'application/json', 'x-role': 'admin' }

  const loadRuns = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/payroll/runs`, { headers })
      const json = await res.json()
      setRuns(json.items || json.data || [])
    } catch (err) {
      // no-op
    }
  }

  const loadPayslips = async (runId: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/payroll/payslips?runId=${encodeURIComponent(runId)}`, { headers })
      const json = await res.json()
      setPayslips(json.items || json.data || [])
    } catch (err) {
      // no-op
    }
  }

  useEffect(() => { loadRuns() }, [])
  useEffect(() => { if (selectedRunId) loadPayslips(selectedRunId) }, [selectedRunId])

  const runPayroll = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/payroll/run`, { method: 'POST', headers, body: JSON.stringify({ periodStart, periodEnd, scheduleId }) })
      const json = await res.json()
      if (json.ok) {
        Alert.alert('Payroll run started', `Run ID: ${json.runId || 'created'}`)
        await loadRuns()
      } else {
        Alert.alert('Error', json.message || 'Failed to run payroll')
      }
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to run payroll')
    } finally {
      setLoading(false)
    }
  }

  const exportBacs = async () => {
    if (!selectedRunId) return
    try {
      const url = `${API_BASE}/api/payroll/export/bacs?runId=${encodeURIComponent(selectedRunId)}`
      Alert.alert('BACS Export', `Download from: ${url}`)
    } catch {}
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text accessibilityRole="header" style={{ fontSize: 20, marginBottom: 12 }}>Payroll</Text>

      <View style={{ backgroundColor: '#f6f6f6', padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <Text style={{ fontWeight: '600', marginBottom: 8 }}>Run Payroll</Text>
        <Text>Period Start</Text>
        <TextInput accessibilityLabel="periodStart" value={periodStart} onChangeText={setPeriodStart} placeholder="YYYY-MM-DD" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
        <Text>Period End</Text>
        <TextInput accessibilityLabel="periodEnd" value={periodEnd} onChangeText={setPeriodEnd} placeholder="YYYY-MM-DD" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
        <Text>Schedule ID</Text>
        <TextInput accessibilityLabel="scheduleId" value={scheduleId} onChangeText={setScheduleId} placeholder="default" style={{ borderWidth: 1, padding: 8, marginBottom: 8 }} />
        <Button title={loading ? 'Running…' : 'Run Payroll'} onPress={runPayroll} disabled={loading} />
      </View>

      <Text style={{ fontWeight: '600', marginBottom: 8 }}>Runs</Text>
      <FlatList
        data={runs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelectedRunId(item.id)} style={{ padding: 8, borderWidth: 1, borderColor: selectedRunId === item.id ? '#333' : '#ddd', borderRadius: 6, marginBottom: 8 }}>
            <Text>{item.periodStart} → {item.periodEnd}</Text>
            <Text>Status: {item.status}</Text>
          </Pressable>
        )}
        style={{ marginBottom: 12 }}
      />

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
        <Button title="Export BACS" onPress={exportBacs} disabled={!selectedRunId} />
      </View>

      <Text style={{ fontWeight: '600', marginBottom: 8 }}>Payslips</Text>
      <FlatList
        data={payslips}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <View style={{ padding: 8, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginBottom: 8 }}>
            <Text>Employee: {item.employeeId}</Text>
            <Text>Net: £{item.net ?? 0}</Text>
            {item.pdfUrl ? <Text selectable>PDF: {item.pdfUrl}</Text> : null}
          </View>
        )}
      />
    </View>
  )
}


