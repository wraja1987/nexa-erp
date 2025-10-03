import fs from "fs"; import path from "path"; import { GetServerSideProps } from "next";
type Row = { ts: string; type: string; route?: string; status?: number; count?: number; max?: number; tenant?: string; key?: string; eventId?: string; eventType?: string; [k: string]: any };
export const getServerSideProps: GetServerSideProps = async () => {
  const ROOT = process.env.PROJECT_ROOT || process.cwd();
  const REPORTS = path.resolve(ROOT, "..", "..", "reports");
  const FILE = path.join(REPORTS, "audit.jsonl");
  let rows: Row[] = [];
  try {
    const raw = fs.readFileSync(FILE, "utf8").trim().split("\n");
    const last = raw.slice(-500);
    rows = last.map(l => { try { return JSON.parse(l); } catch { return null as any; } }).filter(Boolean);
  } catch {}
  return { props: { rows } };
};
export default function Page({ rows }: { rows: Row[] }) {
  const csv = "ts,type,route,status,count,max,tenant,key,eventId,eventType\n" + rows.map(r =>
    [r.ts,r.type,r.route||"",r.status||"",r.count||"",r.max||"",r.tenant||"",r.key||"",r.eventId||"",r.eventType||""]
      .map(x=>String(x).replaceAll(","," ")).join(",")
  ).join("\n");
  return (
    <main style={{padding:20,fontFamily:"ui-sans-serif,system-ui"}}>
      <h1 style={{marginBottom:10}}>Rate Limits & Idempotency — Recent Events</h1>
      <a href={"data:text/csv;charset=utf-8,"+encodeURIComponent(csv)} download="nexa_audit.csv">Download CSV</a>
      <div style={{marginTop:12, overflowX:"auto"}}>
        <table style={{borderCollapse:"collapse", width:"100%"}}>
          <thead><tr>{["ts","type","route","status","count","max","tenant","key","eventId","eventType"].map(h=>
            <th key={h} style={{border:"1px solid #ddd",padding:"6px",textAlign:"left",background:"#fafafa"}}>{h}</th>
          )}</tr></thead>
          <tbody>
            {rows.length===0 && <tr><td colSpan={10} style={{padding:"8px"}}>No audit rows found.</td></tr>}
            {rows.map((r,i)=>(
              <tr key={i}>
                <td style={{border:"1px solid \"#eee\"",padding:"6px"}}>{r.ts}</td>
                <td style={{border:"1px solid \"#eee\"",padding:"6px"}}>{r.type}</td>
                <td style={{border:"1px solid \"#eee\"",padding:"6px"}}>{r.route||""}</td>
                <td style={{border:"1px solid \"#eee\"",padding:"6px"}}>{r.status||""}</td>
                <td style={{border:"1px solid \"#eee\"",padding:"6px"}}>{r.count||""}</td>
                <td style={{border:"1px solid \"#eee\"",padding:"6px"}}>{r.max||""}</td>
                <td style={{border:"1px solid \"#eee\"",padding:"6px"}}>{r.tenant||""}</td>
                <td style={{border:"1px solid \"#eee\"",padding:"6px"}}>{r.key||""}</td>
                <td style={{border:"1px solid \"#eee\"",padding:"6px"}}>{r.eventId||""}</td>
                <td style={{border:"1px solid \"#eee\"",padding:"6px"}}>{r.eventType||""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
