set -euo pipefail

REPO_ROOT="/Users/waheedraja/Desktop/Business Opportunities/Nexa ERP"
APP_DIR="$REPO_ROOT/apps/web"
DOMAIN="${DOMAIN:-www.nexaai.co.uk}"

cd "$REPO_ROOT"
chmod +x ops/headers-audit.sh || true

echo "== Tooling =="
# Ensure Corepack/Yarn and Vercel CLI are usable
corepack enable >/dev/null 2>&1 || true
corepack prepare yarn@1.22.22 --activate
command -v vercel >/dev/null 2>&1 || npm i -g vercel@latest
vercel whoami >/dev/null 2>&1 || vercel login

echo "== Ensure deps (zod + stub @nexa/registry) =="
mkdir -p ops/tmp
cat > ops/tmp/ensure-deps.js <<'JS'
const fs=require('fs'), path=require('path');
const app=process.argv[2];
const pkgPath=path.join(app,'package.json');
const pkg=JSON.parse(fs.readFileSync(pkgPath,'utf8'));
pkg.dependencies ||= {};
pkg.devDependencies ||= {};

// zod required by API routes
if(!pkg.dependencies.zod) pkg.dependencies.zod='^3.23.8';

// Remove bad placeholder for @nexa/registry; provide a stub in devDeps
if(pkg.dependencies['@nexa/registry'] && !/^\d|^\^|^~|^\*|^https?:/.test(pkg.dependencies['@nexa/registry'])){
  delete pkg.dependencies['@nexa/registry'];
}
if(!pkg.devDependencies['@nexa/registry']) pkg.devDependencies['@nexa/registry']='0.0.0-stub';

// Postinstall hook to create the stub package
pkg.scripts ||= {};
const hook='node scripts/create-nexa-registry-stub.js';
pkg.scripts.postinstall = pkg.scripts.postinstall
  ? (pkg.scripts.postinstall.includes(hook) ? pkg.scripts.postinstall : `${pkg.scripts.postinstall} && ${hook}`)
  : hook;

pkg.scripts.build = pkg.scripts.build || 'next build';

fs.writeFileSync(pkgPath, JSON.stringify(pkg,null,2));

const scriptsDir=path.join(app,'scripts');
fs.mkdirSync(scriptsDir,{recursive:true});
fs.writeFileSync(path.join(scriptsDir,'create-nexa-registry-stub.js'), `
const fs=require('fs'), path=require('path');
const dir=path.join(process.cwd(),'node_modules','@nexa','registry');
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'package.json'),JSON.stringify({name:'@nexa/registry',version:'0.0.0-stub',main:'index.js',typings:'index.d.ts'},null,2));
fs.writeFileSync(path.join(dir,'index.js'),"module.exports={components:{},themes:{},tokens:{}};");
fs.writeFileSync(path.join(dir,'index.d.ts'),"declare const v:{components:any;themes:any;tokens:any}; export = v;");
console.log('Stubbed @nexa/registry');
`);
console.log('✅ ensured: zod + @nexa/registry stubbed if needed');
JS

node ops/tmp/ensure-deps.js "$APP_DIR"

# Yarn-friendly npm settings for this app (harmless if already present)
cat > "$APP_DIR/.npmrc" <<'NPM'
fund=false
audit=false
legacy-peer-deps=true
NPM

echo "== Yarn install & build locally =="
rm -rf "$APP_DIR/node_modules" "$APP_DIR/package-lock.json" "$APP_DIR/yarn.lock"
( cd "$APP_DIR" && yarn install --ignore-engines --silent )
( cd "$APP_DIR" && yarn build )

echo "== Vercel: link, pull env, prebuild, deploy --prebuilt =="
( cd "$APP_DIR" && vercel link --yes || true )
( cd "$APP_DIR" && vercel pull --yes --environment=production )
( cd "$APP_DIR" && vercel build )
DEPLOY_URL="$(cd "$APP_DIR" && vercel deploy --prebuilt --prod --yes | tail -n1 | sed 's#^https\?://##')"
echo "🔗 Deployed: https://$DEPLOY_URL"

echo "== Alias to custom domain =="
vercel domains add "$DOMAIN" || true
vercel alias set "$DEPLOY_URL" "$DOMAIN" || true

echo "== Headers audit: deployment URL =="
STATIC_URL="https://$DEPLOY_URL/favicon.ico" \
API_URL="https://$DEPLOY_URL/api/public/status" \
HTML_URL="https://$DEPLOY_URL/" \
bash ops/headers-audit.sh

echo "== Headers audit: custom domain =="
STATIC_URL="https://$DOMAIN/favicon.ico" \
API_URL="https://$DOMAIN/api/public/status" \
HTML_URL="https://$DOMAIN/" \
bash ops/headers-audit.sh

echo "== Expected =="
echo "static|200|public, max-age=31536000, immutable|(none)"
echo "api|200|no-store|https://$DOMAIN"
echo "html|200|s-maxage=60, stale-while-revalidate=300|(none)"
