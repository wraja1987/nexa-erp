"use client"
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { audit } from '../log/mask'

export type AISuggestion = { id: string; text: string }
type AIContextType = {
  suggestions: AISuggestion[]
  loading: boolean
  explain: () => Promise<string>
  suggestNext: () => Promise<string>
  draftMessage: () => Promise<string>
}

const AIContext = createContext<AIContextType | null>(null)

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const route = typeof window !== 'undefined' ? window.location.pathname : '/'
    // Mocked suggestions for stubs; real calls are masked and audited server-side
    const base: AISuggestion[] = [
      { id: '1', text: 'Explain this screen' },
      { id: '2', text: 'Suggest the next step' },
      { id: '3', text: 'Draft email/message' },
    ]
    setSuggestions(base.map((s, i) => ({ ...s, id: `${route}-${i}` })))
  }, [])

  const explain = async () => {
    setLoading(true)
    try {
      audit({ route: '/ai/explain', session: 'ai', ip: '0.0.0.0' })
      return 'This page provides a safe preview using demonstration data only.'
    } finally {
      setLoading(false)
    }
  }
  const suggestNext = async () => {
    setLoading(true)
    try {
      audit({ route: '/ai/next', session: 'ai', ip: '0.0.0.0' })
      return 'Consider exporting the demo data and reviewing reconciliation rules.'
    } finally {
      setLoading(false)
    }
  }
  const draftMessage = async () => {
    setLoading(true)
    try {
      audit({ route: '/ai/draft', session: 'ai', ip: '0.0.0.0' })
      return 'Hi team, here is the draft summary from the Nexa preview environment.'
    } finally {
      setLoading(false)
    }
  }

  const value = useMemo<AIContextType>(() => ({ suggestions, loading, explain, suggestNext, draftMessage }), [suggestions, loading])

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>
}

export function useAIContext(): AIContextType {
  const ctx = useContext(AIContext)
  if (!ctx) throw new Error('useAIContext must be used within AIProvider')
  return ctx
}


