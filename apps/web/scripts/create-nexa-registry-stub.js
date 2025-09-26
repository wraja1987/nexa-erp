
const fs=require('fs'), path=require('path');
const dir=path.join(process.cwd(),'node_modules','@nexa','registry');
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'package.json'),JSON.stringify({name:'@nexa/registry',version:'0.0.0-stub',main:'index.js',typings:'index.d.ts'},null,2));
fs.writeFileSync(path.join(dir,'index.js'),"module.exports={components:{},themes:{},tokens:{}};");
fs.writeFileSync(path.join(dir,'index.d.ts'),"declare const v:{components:any;themes:any;tokens:any}; export = v;");
console.log('Stubbed @nexa/registry');
