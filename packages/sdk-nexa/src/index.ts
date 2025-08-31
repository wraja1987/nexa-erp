export type SdkConfig = { baseUrl?: string; apiKey?: string }

export class NexaClient {
  private readonly baseUrl: string
  private readonly apiKey?: string

  constructor(cfg: SdkConfig = {}) {
    this.baseUrl = cfg.baseUrl ?? ''
    this.apiKey = cfg.apiKey
  }

  async assistant(query: { route: string; userContext?: any; lastError?: string; selection?: string }) {
    const res = await fetch(this.baseUrl + '/api/assistant', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify(query),
    })
    if (!res.ok) throw new Error(`assistant error: ${res.status}`)
    return res.json()
  }
}



