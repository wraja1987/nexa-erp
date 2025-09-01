type OrchestrationJob = { id: string; input: unknown; enqueuedAt: string }

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


