'use strict';
// Same check pipeline, without the Windows command-line length limit.
const {spawnSync}=require('node:child_process');
const commands=require('../package.json').scripts.check.split(' && ');
for(const command of commands){
 const result=spawnSync(command,{shell:true,stdio:'inherit'});
 if(result.error){console.error(result.error.message);process.exit(1);}
 if(result.status!==0){console.error('FAIL: '+command);process.exit(result.status||1);}
}
console.log('CHECK PASS: '+commands.length+' comandos do npm run check.');
