// 4K render: worker renders a contiguous frame range at 2x and pipes JPEGs straight into ffmpeg (no frame files on disk).
const {chromium}=require('playwright');const fs=require('fs');const {spawn}=require('child_process');
(async()=>{const name=process.env.GN;const D=JSON.parse(fs.readFileSync(__dirname+`/g-${name}.json`));
const N=Math.ceil(D.TL.end*30),W=+process.env.W,J=+process.env.J;const a=Math.floor(N*J/W),b=Math.floor(N*(J+1)/W);
const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','-r','30',`seg4k-${name}-${J}.mp4`],{stdio:['pipe','inherit','inherit']});
const br=await chromium.launch();const pg=await br.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:2});
await pg.addInitScript(d=>{window.G=d.G;window.TL=d.TL},D);await pg.goto('file://'+__dirname+'/guide.html');await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(800);
for(let i=a;i<b;i++){await pg.evaluate(t=>setT(t),i/30);const buf=await pg.screenshot({type:'jpeg',quality:95});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if(i%300==0)console.log(J,i,b);}
ff.stdin.end();await new Promise(r=>ff.on('close',r));await br.close();console.log('done',J);})();
