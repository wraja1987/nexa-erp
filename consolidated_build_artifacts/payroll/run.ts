import { runTask } from "@/lib/orchestration/runner";
export async function runPayrollJob(){ return runTask("payroll.run", async()=>({ ok:true, message:"Payroll job stub executed" }), {}); }
export default runPayrollJob;
