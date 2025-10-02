export type ConnectorKey = 'google'|'microsoft'|'twilio'|'stripe'|'open-banking'|'hmrc';
const state = new Map<ConnectorKey, boolean>();
export function isConnected(key: ConnectorKey): boolean { return state.get(key) === true; }
export async function connect(key: ConnectorKey): Promise<void> { state.set(key, true); }
export async function disconnect(key: ConnectorKey): Promise<void> { state.set(key, false); }












