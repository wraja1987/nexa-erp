type OrchestrationJob = { id: string; input: unknown; enqueuedAt: string; completedAt?: string }

const queue: OrchestrationJob[] = []

export function enqueueOrchestration(input: unknown): string {
  const id = 'orc_' + Math.random().toString(36).slice(2)
  const job: OrchestrationJob = { id, input, enqueuedAt: new Date().toISOString() }
  queue.push(job)
  return id
}

export function getQueueLength(): number {
  return queue.length
}

export function clearQueue(): void {
  queue.splice(0, queue.length)
}

export function getQueueSnapshot(): Array<Pick<OrchestrationJob, 'id' | 'enqueuedAt'>> {
  return queue.map((j) => ({ id: j.id, enqueuedAt: j.enqueuedAt }))
}

export function completeRun(id: string): boolean {
  const job = queue.find((j) => j.id === id)
  if (!job) return false
  job.completedAt = new Date().toISOString()
  return true
}

export function getRuns(): Array<{ id: string; enqueuedAt: string; status: 'queued' | 'completed' }> {
  return queue.map((j) => ({ id: j.id, enqueuedAt: j.enqueuedAt, status: j.completedAt ? 'completed' : 'queued' }))
}


