const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const name=process.env.GN;const D=JSON.parse(fs.readFileSync(__dirname+`/g-${name}.json`));
const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});
await pg.addInitScript(d=>{window.G=d.G;window.TL=d.TL},D);
await pg.goto('file://'+__dirname+'/guide.html');await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(800);
const mode=process.argv[2];
if(mode==='test'){for(const t of process.argv.slice(3).map(Number)){await pg.evaluate(t=>setT(t),t);await pg.waitForTimeout(120);await pg.screenshot({path:`gt_${name}_${t}.jpg`,quality:80,type:'jpeg'});}}
else if(mode==='tail'){const FR=`gtail-${name}`;fs.mkdirSync(FR,{recursive:true});const N=Math.ceil(D.TL.end*30);const M=+process.argv[3];
for(let i=M;i<N;i++){await pg.evaluate(t=>setT(t),i/30);await pg.screenshot({path:`${FR}/${String(i-M).padStart(4,'0')}.jpg`,quality:90,type:'jpeg'});}}
else{const FR=`gfr-${name}`;fs.mkdirSync(FR,{recursive:true});const N=Math.ceil(D.TL.end*30);const K=+(process.env.K||1),J=+(process.env.J||0);
for(let i=J;i<N;i+=K){await pg.evaluate(t=>setT(t),i/30);await pg.screenshot({path:`${FR}/${String(i).padStart(4,'0')}.jpg`,quality:90,type:'jpeg'});}}
await b.close();})();
