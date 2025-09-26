import * as Runner from "../../lib/orchestration/runner";
export async function runPayrollJob(){ return Runner.runTask("payroll.run", async()=>({ ok:true, message:"Payroll job stub executed" }), {}); }
export default runPayrollJob;
