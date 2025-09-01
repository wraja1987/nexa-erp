export type PushMessage = { id: string; title: string; body: string }

const inbox: PushMessage[] = []

export function simulatePush(title: string, body: string): PushMessage {
  const msg: PushMessage = { id: Math.random().toString(36).slice(2), title, body }
  inbox.push(msg)
  return msg
}

export function getInbox(): PushMessage[] {
  return [...inbox]
}


