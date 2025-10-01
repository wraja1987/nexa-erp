import { spawn } from 'node:child_process';
import http from 'node:http';
import process from 'node:process';

const basePort = Number(process.env.LHCI_PORT || 3010);
const urls = [`http://127.0.0.1:${basePort}/`, `http://127.0.0.1:${basePort}/login`, `http://127.0.0.1:${basePort}/dashboard`];

async function waitFor(url, timeoutMs=90000) {
  const deadline = Date.now()+timeoutMs;
  while (Date.now() < deadline) {
    try {
      await new Promise((res,rej)=>{
        const req = http.get(url, r => { r.resume(); (r.statusCode && r.statusCode<500) ? res(1) : rej(new Error('bad code')) });
        req.on('error', rej);
      });
      return true;
    } catch { await new Promise(r=>setTimeout(r, 1000)); }
  }
  throw new Error('Timeout waiting for server: '+url);
}

function startStandalone(port) {
  const env = { ...process.env, PORT: String(port), HOST: '127.0.0.1', NODE_ENV: 'production' };
  // Next standalone server
  return spawn('node', ['.next/standalone/server.js'], { stdio: 'inherit', env });
}

async function run() {
  const srv = startStandalone(basePort);
  try {
    await waitFor(urls[0], 120000);
    const run = (cmd,args,cwd=process.cwd())=>new Promise((res,rej)=>{
      const p = spawn(cmd,args,{stdio:'inherit',cwd,shell:true});
      p.on('exit', c=> c===0?res():rej(new Error(cmd+' failed')));
    });

    // Collect + Assert explicitly to avoid startServerCommand races
    await run('lhci', ['collect', '--url', ...urls, '--numberOfRuns=1', '--settings.preset=desktop', '--settings.disableStorageReset=true']);
    await run('lhci', ['assert',  '--assertions.categories:performance=error:0.85', '--assertions.categories:accessibility=error:0.90', '--assertions.uses-responsive-images=warn', '--assertions.uses-webp-images=warn', '--assertions.font-display=warn']);
    await run('lhci', ['upload', '--target=temporary-public-storage']);
  } finally {
    try { srv.kill('SIGINT'); } catch {}
  }
}

run().catch(e=>{ console.error(e); process.exit(1); });
