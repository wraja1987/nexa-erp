export function audit(...args: any[]): void { try{ console.log('[audit]', ...args); } catch{} }
export const getRecentAudits = async () => [] as any[];
export default function mask(v:any){ return v; }
