'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),F=require('../web/craque-formations-v382.js');
const web=path.resolve(__dirname,'../web'),hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const arg=k=>{const i=process.argv.indexOf(k);return i<0?null:process.argv[i+1]};
if(arg('--baseline')){
 const raw=fs.readFileSync(arg('--baseline')),d=JSON.parse(raw),unique=new Map();
 if(d.schema!=='craque-formation-geometry-baseline-v1'||d.deployment?.status!=='succeeded'||d.deployment?.type!=='publish'||d.git?.commit!==d.deployment.commit)throw Error('Baseline sem vínculo consistente com a versão publicada.');
 for(const plan of d.plans)for(const kind of ['original','rendered']){
  const slots=plan[kind].map((s,i)=>({id:'s'+i,position:s.role,x:s.x,y:s.y}));
  const key=JSON.stringify(slots.map(s=>[s.x,s.y]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]));
  if(!unique.has(key))unique.set(key,{slots,source:plan.source,kind});
 }
 const baseline={schema:'CRAQUE_FORMATION_BASELINE_V382',productionCommit:d.git.commit,
  deployment:d.deployment.deploymentId,site:d.deployment.url.replace(/\/?$/,'/'),
  inputSha256:hash(raw),planRecords:d.summary.planRecordCount,originalGeometries:d.summary.uniqueOriginalPureGeometries,
  originalGeometriesWithoutMirrors:d.summary.uniqueOriginalPureMirrorCanonicalGeometries,geometries:[...unique.values()]};
 fs.writeFileSync(path.join(web,'ct382-formation-baseline.json'),JSON.stringify(baseline)+'\n');
}
const baseline=JSON.parse(fs.readFileSync(path.join(web,'ct382-formation-baseline.json'),'utf8'));
const back4=[['le','LE',10,70],['zg1','ZG',30,70],['zg2','ZG',70,70],['ld','LD',90,70]],back3=[['zg1','ZG',20,70],['zg2','ZG',50,70],['zg3','ZG',80,70]],
 back5=[['le','LE',10,60],['zg1','ZG',30,70],['zg2','ZG',50,70],['zg3','ZG',70,70],['ld','LD',90,60]];
const templates=[
 ['4-3-1-2',back4,[['vol1','VOL',50,60],['mlg1','MLG',30,40],['mlg2','MLG',70,40],['mat','MAT',50,30],['ca1','CA',30,10],['ca2','CA',70,10]]],
 ['4-2-2-2',back4,[['vol1','VOL',30,60],['vol2','VOL',70,60],['mat1','MAT',30,30],['mat2','MAT',70,30],['ca1','CA',30,10],['ca2','CA',70,10]]],
 ['4-3-2-1',back4,[['vol1','VOL',50,60],['mlg1','MLG',30,50],['mlg2','MLG',70,50],['sa1','SA',30,30],['sa2','SA',70,30],['ca1','CA',50,10]]],
 ['4-2-3-1',back4,[['vol1','VOL',30,60],['vol2','VOL',70,60],['mlg1','MLG',30,40],['mlg2','MLG',70,40],['mat','MAT',50,30],['ca1','CA',50,10]]],
 ['4-3-3',back4,[['vol1','VOL',50,60],['mlg1','MLG',30,50],['mlg2','MLG',70,50],['sa1','SA',30,20],['ca1','CA',50,20],['sa2','SA',70,20]]],
 ['4-4-2',back4,[['vol1','VOL',50,60],['mlg1','MLG',30,50],['mlg2','MLG',70,50],['mat','MAT',50,40],['ca1','CA',30,10],['ca2','CA',70,10]]],
 ['3-5-2',back3,[['vol1','VOL',30,60],['vol2','VOL',70,60],['mlg1','MLG',20,40],['mlg2','MLG',80,40],['mat','MAT',50,30],['ca1','CA',30,10],['ca2','CA',70,10]]],
 ['5-3-2',back5,[['vol1','VOL',50,50],['mlg1','MLG',30,40],['mlg2','MLG',70,40],['ca1','CA',30,10],['ca2','CA',70,10]]],
 ['3-4-2-1',back3,[['le','LE',10,50],['vol1','VOL',30,60],['vol2','VOL',70,60],['ld','LD',90,50],['mat1','MAT',30,30],['mat2','MAT',70,30],['ca1','CA',50,10]]],
 ['5-2-1-2',back5,[['vol1','VOL',30,50],['vol2','VOL',70,50],['mat','MAT',50,30],['ca1','CA',30,10],['ca2','CA',70,10]]]
];
function* variants([family,back,front]){
 for(const depth of [70,80,60])for(const pivot of [60,50,70])for(const mid of [40,50,30,60])for(const creator of [30,20,40])for(const forward of [10,20,30])for(const fullback of [60,50,70])for(const narrow of [0,10])for(const stagger of [0,10]){
  if(depth<pivot+10||pivot<mid+10||(front.some(s=>s[1]==='MAT')&&mid<creator+10)||forward>=creator)continue;
  const slots=[['go','GO',50,90],...back,...front].map(([id,position,x,y])=>{
   if(position==='ZG')y=depth;else if(['LD','LE'].includes(position))y=fullback;
   else if(position==='VOL')y=pivot;else if(position==='MLG')y=mid;else if(position==='MAT')y=creator;
   else if(position==='SA')y=Math.max(forward,creator-10);else if(position==='CA')y=forward;
   if(position!=='GO'&&x!==50)x+=x<50?narrow:-narrow;
   if(['CA','SA'].includes(position)&&x>50)y+=stagger;
   return {id,position,x,y};
  });
  const offBallSlots=slots.map(s=>({...s,y:s.position==='GO'?90:Math.min(['ZG','LD','LE'].includes(s.position)?80:['VOL','MLG'].includes(s.position)?70:50,s.y+10)}));
  const block={60:'Bloco alto',70:'Bloco médio',80:'Bloco baixo'}[depth],support={30:'apoio adiantado',40:'apoio entrelinhas',50:'meio equilibrado',60:'proteção recuada'}[mid];
  const plan={id:'candidate',family,label:family+' · '+block+' · '+support+(stagger?' · ataque escalonado':''),slots,offBallSlots,
   roles:Object.fromEntries(slots.map(s=>[s.id,s.position==='GO'?'Proteger a área e iniciar a saída':s.position==='VOL'?'Proteger o centro e oferecer saída':s.position==='MAT'?'Conectar os atacantes pelo centro':
    ['ZG','LD','LE'].includes(s.position)?'Cobrir o setor e oferecer apoio com segurança':'Oferecer linha de passe e atacar o espaço da função'])),
   risks:[depth===80?'Defesa mais próxima da área: observar distância até a saída':'Defesa adiantada: vigiar profundidade',
    !slots.some(s=>['LD','LE'].includes(s.position))?'Sem laterais naturais: organizar cobertura dos meios pelos lados':'Coordenar avanço e cobertura dos laterais',
    stagger?'Ataque escalonado: conferir conexão e impedimento':'Frente alinhada: alternar apoio e profundidade'],
   rationale:block+' com '+support+' e '+(narrow?'apoios interiores':'maior separação entre os apoios')+'. '+(fullback===50?'Laterais mais adiantados. ':fullback===70?'Laterais mais resguardados. ':'Laterais em apoio intermediário. ')+(stagger?'Um atacante oferece apoio mais baixo para conectar o passe.':'A frente mantém referências em altura semelhante.'),
   status:'proposta_geometrica_nao_homologada',source:'Gerador local V382; grade e funções explícitas',gameplayValidated:false};
  if(!F.validate(plan).length)yield plan;
 }
}
function generate(){
 const generators=templates.map(t=>variants(t)),counts=templates.map(()=>0),done=new Set(),out=[],signatures=new Set();let checks=0;
 while(out.length<500&&done.size<generators.length){
  for(let i=0;i<generators.length&&out.length<500;i++){
   if(counts[i]>=50||done.has(i))continue;let accepted=false;
   while(!accepted){const next=generators[i].next();if(next.done){done.add(i);break;}checks++;const p=next.value,key=F.signature({slots:p.slots});
    if(signatures.has(key)||baseline.geometries.some(b=>F.equivalent({slots:p.slots},{slots:b.slots})))continue;
    p.id='ct382-'+String(out.length+1).padStart(3,'0');out.push(p);signatures.add(key);counts[i]++;accepted=true;
   }
  }
  if(counts.every(n=>n>=50))break;
 }
 if(out.length!==500)throw Error('Não há500desenhos distintos com estas restrições: '+JSON.stringify(counts));
 return {schema:'CRAQUE_FORMATIONS_V382',version:382,generatedBy:'scripts/build-formations-v382.cjs',gameplayValidated:false,
  baseline:{productionCommit:baseline.productionCommit,sourcePlans:303,sourceUniqueGeometriesWithoutMirrors:28,inputSha256:baseline.inputSha256},
  counts:{additionalGeometries:500,families:10,perFamily:50,acceptedCandidates:500,examinedCandidates:checks},rules:{grid:10,minDistance:10,equivalenceTolerance:5,mirrorCountsAsOne:true},formations:out};
}
const data=generate(),target=path.join(web,'ct382-formations.json'),text=JSON.stringify(data)+'\n';
if(process.argv.includes('--check')){if(!fs.existsSync(target)||fs.readFileSync(target,'utf8')!==text)throw Error('Catálogo V382 diverge do gerador.');}
else fs.writeFileSync(target,text);
console.log('V382 GENERATED:',JSON.stringify(data.counts));
