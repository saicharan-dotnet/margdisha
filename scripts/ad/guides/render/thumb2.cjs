const {chromium}=require('playwright');const fs=require('fs');
const IMG={sainik:['g-sainik','62% 40%',1.25],kv:['g-kv','92% 60%',1.45],scholarships:['g-scholar','55% 40%',1.3],career10:['g-career','92% 45%',1.5]};
const TX={
 sainik:{en:[['SAINIK SCHOOL','ADMISSION'],['Class 6','Class 9','AISSEE'],'STEP BY STEP','IN ENGLISH'],
         te:[['సైనిక్ స్కూల్','అడ్మిషన్'],['6వ తరగతి','9వ తరగతి','AISSEE'],'పూర్తి గైడ్','తెలుగులో'],
         hi:[['सैनिक स्कूल','एडमिशन'],['कक्षा 6','कक्षा 9','AISSEE'],'पूरी जानकारी','हिंदी में']},
 kv:{en:[['KENDRIYA VIDYALAYA','ADMISSION'],['Class 1','Lottery','Priority'],'FULL GUIDE','IN ENGLISH'],
     te:[['కేంద్రీయ విద్యాలయ','అడ్మిషన్'],['1వ తరగతి','లాటరీ','ప్రాధాన్యత'],'పూర్తి గైడ్','తెలుగులో'],
     hi:[['केंद्रीय विद्यालय','एडमिशन'],['कक्षा 1','लॉटरी','प्राथमिकता'],'पूरी जानकारी','हिंदी में']},
 scholarships:{en:[['SCHOLARSHIPS','SCHOOL TO PhD'],['Central','TS · AP','Private','Abroad'],'100% FREE','IN ENGLISH'],
     te:[['స్కాలర్‌షిప్‌లు','స్కూల్ నుంచి PhD'],['కేంద్ర','TS · AP','ప్రైవేట్','విదేశాలు'],'ఉచితం','తెలుగులో'],
     hi:[['छात्रवृत्तियां','स्कूल से PhD तक'],['केंद्र','TS · AP','प्राइवेट','विदेश'],'मुफ़्त','हिंदी में']},
 career10:{en:[['AFTER 10th','WHAT NEXT?'],['MPC','BiPC','Commerce','Polytechnic','ITI'],'ALL OPTIONS','IN ENGLISH'],
     te:[['10వ తరగతి తర్వాత','ఏం చదవాలి?'],['MPC','BiPC','కామర్స్','పాలిటెక్నిక్','ITI'],'అన్ని ఆప్షన్లు','తెలుగులో'],
     hi:[['10वीं के बाद','क्या करें?'],['PCM','PCB','कॉमर्स','पॉलिटेक्निक','ITI'],'सारे विकल्प','हिंदी में']}};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
for(const g in TX)for(const L in TX[g]){const [[l1,l2],chips,stk,badge]=TX[g][L];const [img,pos,zoom]=IMG[g];
 const long=l1.length>14;
 fs.writeFileSync(__dirname+'/_t2.html',`<html><head><meta charset="utf-8"><style>
@font-face{font-family:'NTel';src:url('../fonts/NotoSansTelugu.ttf');font-weight:100 900}
@font-face{font-family:'NDev';src:url('../fonts/NotoSansDevanagari.ttf');font-weight:100 900}
*{margin:0;padding:0;box-sizing:border-box}body{width:1280px;height:720px;overflow:hidden;background:#0a1f1c;font-family:'Inter Display','Inter','NTel','NDev',sans-serif;color:#fff}
#bg{position:absolute;inset:0;background:url(${img}.png) ${pos}/${zoom*100}% auto no-repeat;filter:saturate(1.25) contrast(1.08)}
#sh{position:absolute;inset:0;background:linear-gradient(100deg,rgba(4,14,13,.96) 0%,rgba(4,14,13,.88) 36%,rgba(4,14,13,.25) 58%,rgba(4,14,13,0) 70%),radial-gradient(120% 90% at 80% 50%,transparent 55%,rgba(0,0,0,.5) 100%)}
#frame{position:absolute;inset:0;border:10px solid #ffd23f;border-radius:4px}
.logo{position:absolute;left:40px;top:36px;display:flex;align-items:center;gap:12px;font:900 34px 'Inter Display'}
.logo img{width:54px;height:54px;border-radius:14px;box-shadow:0 4px 14px rgba(0,0,0,.5)}
.badge{position:absolute;right:34px;top:34px;font:900 30px 'Inter Display','NTel','NDev';background:#e8212b;color:#fff;padding:8px 22px;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,.45);transform:rotate(2deg)}
.t{position:absolute;left:40px;top:${long?150:140}px;width:780px}
.l1{font-weight:900;font-size:${long?(L==='en'?78:72):(L==='en'?104:96)}px;line-height:1.08;letter-spacing:${L==='en'?-2:0}px;color:#fff;-webkit-text-stroke:3px #000;paint-order:stroke fill;text-shadow:0 6px 0 rgba(0,0,0,.55),0 10px 30px rgba(0,0,0,.6)}
.l2{display:inline-block;margin-top:16px;font-weight:900;font-size:${L==='en'?78:72}px;line-height:1.15;color:#1b1200;background:#ffd23f;padding:${L==='en'?'4px 22px':'2px 22px 10px'};border-radius:14px;transform:rotate(-2deg);box-shadow:0 10px 0 #c99700,0 18px 30px rgba(0,0,0,.5)}
.chips{margin-top:34px;display:flex;flex-wrap:wrap;gap:12px;width:720px}
.chips span{font:800 30px 'Inter Display','NTel','NDev';padding:6px 18px;border-radius:12px;background:rgba(255,255,255,.95);color:#0b2a26;box-shadow:0 4px 0 rgba(0,0,0,.35)}
.stk{position:absolute;right:46px;bottom:44px;font:900 ${stk.length>12?36:44}px 'Inter Display','NTel','NDev';color:#fff;background:linear-gradient(160deg,#ff5a3c,#e8212b);padding:12px 28px;border-radius:999px;border:4px solid #fff;transform:rotate(-6deg);box-shadow:0 10px 30px rgba(0,0,0,.5)}
</style></head><body><div id="bg"></div><div id="sh"></div>
<div class="logo"><img src="logo.png">MargDisha</div><div class="badge">${badge}</div>
<div class="t"><div class="l1">${l1}</div><div class="l2">${l2}</div><div class="chips">${chips.map(c=>`<span>${c}</span>`).join('')}</div></div>
<div class="stk">${stk}</div><div id="frame"></div></body></html>`);
 await p.goto('file://'+__dirname+'/_t2.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
 await p.screenshot({path:`th2-${g}-${L}.jpg`,type:'jpeg',quality:92});}
await b.close();})();
