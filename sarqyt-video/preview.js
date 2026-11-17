const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--allow-file-access-from-files']});const p=await b.newPage({viewport:{width:1920,height:1080}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+__dirname+'/index.html');await p.waitForTimeout(300);
const tl=await p.evaluate(()=>TL.scenes.map(s=>({id:s.id,start:s.start,dur:s.dur})));
const fr=process.argv[2]?process.argv[2].split(',').map(Number):[.7];
for(const s of tl){for(const f of fr){const t=s.start+s.dur*f;await p.evaluate(t=>render(t),t);await p.screenshot({path:`prev/${s.id}_${f}.jpg`,type:'jpeg',quality:70});}}
console.log(errs.join('\n')||'no errors');await b.close();})();
