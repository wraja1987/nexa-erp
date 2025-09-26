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
