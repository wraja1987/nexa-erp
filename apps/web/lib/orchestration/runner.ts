export type TaskContext = { userId?: string; tenantId?: string; now?: string; meta?: Record<string,unknown> };
export type TaskResult = { ok: boolean; message?: string; data?: unknown };
export type TaskHandler = (ctx: TaskContext) => Promise<TaskResult>;
export async function runTask(name:string, handler:TaskHandler, ctx:TaskContext={}): Promise<TaskResult> {
  try { const t=Date.now(); const r=await handler({now:new Date().toISOString(), ...ctx}); return { ok:true, ...r, data:{...(r?.data as object||{}), task:name, ms:Date.now()-t} }; }
  catch(e:any){ console.error("[orchestration]", name, e?.message||e); return { ok:false, message:e?.message||String(e) }; }
}
export default { runTask };
export const getQueueLength = async (): Promise<number> => 0;
export const getRuns = async (): Promise<any[]> => [];
export const completeRun = async (_:unknown): Promise<boolean> => true;
export const enqueueOrchestration = async (_:unknown): Promise<{ id:string }> => ({ id: 'stub' });
