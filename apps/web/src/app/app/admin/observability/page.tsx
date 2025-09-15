"use client"
import { useEffect, useState } from 'react'

type JobsStatus = Record<string, { lastRun: string; outcome: 'success' | 'error' }>

export default function ObservabilityPage() {
  const [metrics, setMetrics] = useState<Record<string, number>>({})
  const [jobs, setJobs] = useState<JobsStatus>({})
  const role = process.env.NEXT_PUBLIC_ROLE || 'superadmin'
  useEffect(() => {
    fetch('/api/metrics').then(r=>r.json()).then(j=> setMetrics(j?.data || {})).catch(()=>{})
    fetch('/api/jobs/status').then(r=>r.json()).then(j=> setJobs(j?.data || {})).catch(()=>{})
  }, [])
  if (role !== 'superadmin') return <div style={{ padding:16 }}><h1>Access denied</h1></div>
  return (
    <main role="main" style={{ padding: 16 }}>
      <h1>Observability</h1>
      <section style={{ marginTop: 12 }}>
        <h2>Metrics</h2>
        <ul>
          {Object.entries(metrics).map(([k,v])=> (<li key={k}>{k}: {v}</li>))}
        </ul>
      </section>
      <section style={{ marginTop: 12 }}>
        <h2>Jobs last-run</h2>
        <ul>
          {Object.entries(jobs).map(([k,v])=> (<li key={k}>{k}: {v.outcome} at {v.lastRun}</li>))}
        </ul>
      </section>
    </main>
  )
}


