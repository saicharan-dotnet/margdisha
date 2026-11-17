const {chromium}=require('playwright');
const T=[['sainik','g-sainik','Sainik School<br><em>admission</em>',['Class 6','Class 9','AISSEE'],'STEP BY STEP'],
 ['kv','g-kv','Kendriya Vidyalaya<br><em>admission</em>',['Class 1','Class 2 to 11','Priority'],'FULL GUIDE'],
 ['scholarships','g-scholar','Scholarships<br><em>school to PhD</em>',['Central','TS · AP','Private','Abroad'],'100% FREE'],
 ['career10','g-career','After 10th<br><em>what next?</em>',['MPC','BiPC','Commerce','Polytechnic','ITI'],'ALL OPTIONS']];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
for(const [n,img,h,chips,badge] of T){
require('fs').writeFileSync(__dirname+'/_t.html',`<html><head><style>
*{margin:0;padding:0;box-sizing:border-box}body{width:1280px;height:720px;overflow:hidden;background:#071a18;font-family:'Inter Display','Inter',sans-serif;color:#fff}
#bg{position:absolute;left:${{sainik:90,kv:0,scholarships:220,career10:0}[n]}px;top:0;width:1280px;height:720px;background:url(file://${__dirname}/${img}.png) 50% 40%/cover}
#sh{position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,20,18,1) 0%,rgba(5,20,18,.92) 40%,rgba(5,20,18,.2) 62%,rgba(5,20,18,0) 75%)}
.t{position:absolute;left:56px;top:60px;width:760px}.k{display:flex;align-items:center;gap:16px;font-weight:900;font-size:44px}.k img{width:68px;height:68px;border-radius:17px}
h1{margin-top:26px;font-weight:900;font-size:${n==='kv'?86:100}px;line-height:1;letter-spacing:-3px;text-shadow:0 4px 20px rgba(0,0,0,.6)}h1 em{font-style:normal;color:#ffd567}
.chips{margin-top:30px;display:flex;flex-wrap:wrap;gap:12px;width:660px}.chips span{font-weight:800;font-size:32px;padding:8px 20px;border-radius:999px;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.4)}
.free{position:absolute;right:40px;bottom:40px;font-weight:900;font-size:48px;color:#3a2300;background:linear-gradient(160deg,#fff1b8,#ffd567 40%,#f0a830);padding:10px 34px;border-radius:999px;box-shadow:0 0 40px rgba(255,190,60,.7);transform:rotate(-4deg)}
</style></head><body><div id="bg"></div><div id="sh"></div><div class="t"><div class="k"><img src="file://${__dirname}/logo.png">MargDisha</div><h1>${h}</h1>
<div class="chips">${chips.map(c=>`<span>${c}</span>`).join('')}</div></div><div class="free">${badge}</div></body></html>`);await p.goto('file://'+__dirname+'/_t.html');
await p.waitForTimeout(500);await p.screenshot({path:`thumb-${n}.jpg`,type:'jpeg',quality:92});}
await b.close();})();
