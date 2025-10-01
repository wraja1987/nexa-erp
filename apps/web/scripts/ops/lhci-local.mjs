import { spawn } from 'node:child_process';
import http from 'node:http';
const PORT = Number(process.env.LHCI_PORT || 3010);
const HOST = 'localhost';
const urls = [`http://${HOST}:${PORT}/login`, `http://${HOST}:${PORT}/dashboard`];

const run = (cmd,args,opts={})=>new Promise((res,rej)=>{
  const p = spawn(cmd,args,{stdio:'inherit',shell:true,...opts});
  p.on('exit', c=> c===0?res():rej(new Error(cmd+' failed')));
});

async function waitFor(u,ms=120000){
  const end=Date.now()+ms;
  while(Date.now()<end){
    try{
      await new Promise((res,rej)=>{
        const r=http.get(u,x=>{x.resume(); (x.statusCode && x.statusCode<500)?res(1):rej(new Error('bad code '+x.statusCode));});
        r.on('error',rej);
      });
      return true;
    }catch{ await new Promise(r=>setTimeout(r,1000));}
  }
  throw new Error('Timeout '+u);
}

async function main(){
  try { await run('pkill',['-f','.next/standalone/server.js']); } catch {}
  try { await run('bash',['-lc',`PIDS=\"$(lsof -t -i :${PORT} -sTCP:LISTEN || true)\"; if [ -n \"$PIDS\" ]; then kill -9 $PIDS; fi`]); } catch {}

  const env = { ...process.env, HOST:'localhost', PORT:String(PORT), NODE_ENV:'production', LOCAL_LH:'1', NEXTAUTH_URL:`http://localhost:${PORT}` };
  const srv = spawn('pnpm',['start','-p',String(PORT)],{stdio:'inherit',shell:true,env});

  try{
    await waitFor(urls[0], 120000);
    const flags = [
      '--no-sandbox',
      '--ignore-certificate-errors',
      '--allow-insecure-localhost',
      '--disable-dev-shm-usage',
      '--headless=new',
      '--disable-features=BlockInsecurePrivateNetworkRequests',
      '--allow-running-insecure-content'
    ].join(' ');

    await run('pnpm',[ 'dlx','@lhci/cli@0.13.0','collect',
      '--url', urls[0],'--url',urls[1],
      '--numberOfRuns=1',
      '--settings.preset=desktop',
      '--settings.disableStorageReset=true',
      `--settings.chromeFlags="${flags}"`
    ]);

    await run('pnpm',[ 'dlx','@lhci/cli@0.13.0','assert',
      '--assertions.categories:performance=error:0.85',
      '--assertions.categories:accessibility=error:0.90',
      '--assertions.modern-image-formats=warn',
      '--assertions.font-display=warn'
    ]);

    await run('pnpm',[ 'dlx','@lhci/cli@0.13.0','upload','--target=temporary-public-storage' ]);
  } finally {
    try { srv.kill('SIGINT'); } catch {}
  }
}
main().catch(e=>{ console.error(e); process.exit(1); });

