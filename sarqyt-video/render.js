const {chromium}=require('playwright');const fs=require('fs');
const FPS=30,N=+process.argv[2]||4,OUT=__dirname+'/frames';
(async()=>{fs.mkdirSync(OUT,{recursive:true});const b=await chromium.launch({args:['--allow-file-access-from-files']});
 const pg=await b.newPage({viewport:{width:1920,height:1080}});await pg.goto('file://'+__dirname+'/index.html');const total=await pg.evaluate(()=>TL.total);await pg.close();
 const nf=Math.ceil(total*FPS);console.log('frames',nf);let done=0;const t0=Date.now();
 await Promise.all([...Array(N)].map(async(_,k)=>{const p=await b.newPage({viewport:{width:1920,height:1080}});await p.goto('file://'+__dirname+'/index.html');await p.waitForTimeout(300);
  for(let i=k;i<nf;i+=N){await p.evaluate(t=>render(t),i/FPS);await p.screenshot({path:`${OUT}/${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:92});
   if(++done%600===0)console.log(done,'/',nf,((Date.now()-t0)/1000).toFixed(0)+'s');}}));
 await b.close();console.log('done',((Date.now()-t0)/1000).toFixed(0)+'s');})();
