const {chromium}=require('playwright');const fs=require('fs');
const K=[['MPC','Engineer · NDA'],['BiPC','Doctor · Pharma'],['Commerce','CA · Banker'],['HEC','Lawyer · IAS'],['Polytechnic','JE · B.Tech'],['ITI','Railways · PSU']];
const top=372,h=44,g=9,rootY=top+(6*h+5*g)/2;
const paths=K.map((_,j)=>{const y=top+j*(h+g)+h/2;return `<path d="M222 ${rootY} C250 ${rootY},250 ${y},278 ${y}"/>`}).join('');
const rows=K.map(([a,b],j)=>`<div class="kid" style="top:${top+j*(h+g)}px"><span class="p ${j%2?'o':'b'}">${a}</span><span class="ar">→</span><span class="d">${b}</span></div>`).join('');
const html=`<html><head><style>
*{margin:0;padding:0;box-sizing:border-box}body{width:1280px;height:720px;overflow:hidden;font-family:'Inter Display','Inter',sans-serif;color:#10284a;
background:radial-gradient(700px 500px at 100% 0%,#ffe2c4 0%,rgba(255,226,196,0) 70%),radial-gradient(700px 600px at 0% 100%,#d6e6ff 0%,rgba(214,230,255,0) 70%),linear-gradient(150deg,#fbfdff,#eef4ff)}
#img{position:absolute;right:0;top:0;width:640px;height:720px;background:url(file://${__dirname}/g-career.png) 85% 40%/auto 104%;-webkit-mask-image:linear-gradient(90deg,transparent 0,#000 35%);border-radius:0}
#ring{position:absolute;right:40px;top:40px;width:560px;height:640px;border-radius:50%;background:radial-gradient(circle,rgba(255,160,70,.0) 55%,rgba(255,160,70,.0) 100%)}
.brand{position:absolute;left:48px;top:34px;display:flex;align-items:center;gap:12px;font-weight:900;font-size:34px}.brand img{width:54px;height:54px;border-radius:14px}
h1{position:absolute;left:46px;top:104px;font-weight:900;line-height:.95;letter-spacing:-3px}
h1 .a{display:block;font-size:92px;color:#10284a}h1 .b{display:block;font-size:118px;color:#f27a1a;text-shadow:0 6px 0 rgba(242,122,26,.15)}
.ul{position:absolute;left:52px;top:330px;width:420px;height:10px;border-radius:9px;background:linear-gradient(90deg,#1e5bd8,#4f8ef7)}
svg{position:absolute;left:0;top:0;width:1280px;height:720px}svg path{fill:none;stroke:#4f8ef7;stroke-width:4;stroke-linecap:round}
.root{position:absolute;left:46px;top:${rootY-40}px;width:176px;height:80px;border-radius:20px;background:linear-gradient(160deg,#ffb466,#f27a1a);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:36px;letter-spacing:-1px;box-shadow:0 10px 30px rgba(242,122,26,.4)}
.kid{position:absolute;left:278px;height:${h}px;display:flex;align-items:center;gap:10px}
.p{display:inline-flex;align-items:center;justify-content:center;width:176px;height:${h}px;border-radius:999px;font-weight:900;font-size:25px;color:#fff}
.p.b{background:#1e5bd8}.p.o{background:#ff8c2e}
.ar{font-weight:900;font-size:26px;color:#f27a1a}.d{font-weight:800;font-size:25px;color:#10284a;background:rgba(255,255,255,.85);padding:5px 14px;border-radius:12px;border:2px solid #d3e2f8}
.badge{position:absolute;right:34px;bottom:34px;font-weight:900;font-size:40px;color:#fff;background:linear-gradient(160deg,#4f8ef7,#1e5bd8);padding:12px 30px;border-radius:999px;box-shadow:0 10px 30px rgba(30,91,216,.45);transform:rotate(-4deg);border:4px solid #fff}
.badge b{color:#ffd08a}
.free{position:absolute;right:40px;top:36px;font-weight:900;font-size:30px;color:#fff;background:#f27a1a;padding:8px 22px;border-radius:999px;border:3px solid #fff;box-shadow:0 8px 24px rgba(242,122,26,.4)}
</style></head><body><div id="img"></div>
<div class="brand"><img src="file://${__dirname}/logo.png">MargDisha</div>
<h1><span class="a">After 10th</span><span class="b">ROUTE MAP</span></h1><div class="ul"></div>
<svg>${paths}</svg><div class="root">Class 10</div>${rows}
<div class="free">FREE</div><div class="badge">Exams <b>+</b> Jobs</div></body></html>`;
fs.writeFileSync(__dirname+'/_tl.html',html);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});await p.goto('file://'+__dirname+'/_tl.html');await p.waitForTimeout(500);await p.screenshot({path:'thumb-route10-light.jpg',type:'jpeg',quality:92});await b.close();})();
