const http = require("http");
const targets = ["/login","/help","/alerts","/profile","/api/kpi/dashboard","/dashboard"];
let ok = 0;
function check(path){
  return new Promise(resolve=>{
    const req = http.request({ hostname:"localhost", port:3000, path, method:"GET" }, res => {
      const code = res.statusCode || 0; const good = code < 400; console.log(path, code); if (good) ok++; resolve();
    });
    req.on("error", ()=>{ console.log(path, "ERR"); resolve(); }); req.end();
  });
}
(async()=>{ for (const t of targets) await check(t); console.log("PASSED", ok, "of", targets.length); process.exit(ok===targets.length?0:1); })();
