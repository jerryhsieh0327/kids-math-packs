// Shared kid-page template. Expects window.QUIZ = {date, child, topic, questions:[{title,q,challenge}]}
(function(){
const Q=window.QUIZ, DATE=Q.date, KEY='kmp-'+DATE+'-v2-', REPORT_HEADER='【Math 成績回報 → 數學家教】';
const $=id=>document.getElementById(id);
let ovReady=false;
function showErr(t){try{ov(true);$('spin').style.display='none';const e=document.createElement('div');e.className='err';e.textContent='⚠️ Error: '+t+'\n請截圖 (take a screenshot) 傳給爸爸。';$('ovbody').appendChild(e)}catch(_){alert('Error: '+t)}}
window.onerror=function(m,s,l,c,e){showErr((e&&e.stack)||m+' @'+l+':'+c);return false};
window.addEventListener('unhandledrejection',e=>showErr(String(e.reason&&e.reason.message||e.reason)));
function ov(on){$('ov').style.display=on?'block':'none';document.body.style.overflow=on?'hidden':''}
document.title=Q.child+' Math Quiz '+DATE;
document.body.innerHTML='<header>'+Q.child+' Math Quiz '+DATE+'<small>'+(Q.topic||'')+' · Write your working with Apple Pencil in each box, then tap “Done ✅” at the bottom.</small></header><main id="m"></main><button id="done">Done ✅ 完成</button>'+
 '<div id="ov"><div id="spin">圖片製作中… Making your picture…</div><div id="ovbody"></div></div>';
const pads=[];
function drawStroke(ctx,s){ctx.strokeStyle='#1e3799';ctx.fillStyle='#1e3799';ctx.lineCap='round';ctx.lineJoin='round';
  if(s.length==1){ctx.beginPath();ctx.arc(s[0][0],s[0][1],2,0,7);ctx.fill();return}
  for(let k=1;k<s.length;k++){const a=s[k-1],b=s[k];ctx.lineWidth=1.5+3.5*(b[2]||0.5);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke()}}
function Pad(cv,i){
  const ctx=cv.getContext('2d');let strokes=[],cur=null,penSeen=false;
  try{strokes=JSON.parse(localStorage.getItem(KEY+i)||'[]')}catch(e){}
  function redraw(){ctx.clearRect(0,0,cv.width,cv.height);strokes.forEach(s=>drawStroke(ctx,s))}
  function size(){const r=cv.getBoundingClientRect(),d=Math.min(window.devicePixelRatio||1,2);cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);ctx.setTransform(d,0,0,d,0,0);redraw()}
  function pt(e){const r=cv.getBoundingClientRect();return [Math.round(e.clientX-r.left),Math.round(e.clientY-r.top),e.pointerType=='pen'?(e.pressure||0.5):0.5]}
  function ok(e){if(e.pointerType=='pen'){penSeen=true;return true}return !penSeen}
  cv.addEventListener('pointerdown',e=>{if(!ok(e))return;e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}cur={id:e.pointerId,p:[pt(e)]};strokes.push(cur.p);redraw()});
  cv.addEventListener('pointermove',e=>{if(!cur||e.pointerId!==cur.id)return;e.preventDefault();(e.getCoalescedEvents?e.getCoalescedEvents():[e]).forEach(x=>cur.p.push(pt(x)));redraw()});
  const end=e=>{if(cur&&e.pointerId===cur.id){cur=null;save()}};
  cv.addEventListener('pointerup',end);cv.addEventListener('pointercancel',end);
  ['touchstart','touchmove'].forEach(t=>cv.addEventListener(t,e=>e.preventDefault(),{passive:false}));
  function save(){try{localStorage.setItem(KEY+i,JSON.stringify(strokes))}catch(e){}}
  this.clear=()=>{if(strokes.length&&!confirm('Clear this box? 確定清除？'))return;strokes=[];save();redraw()};
  this.undo=()=>{strokes.pop();save();redraw()};
  this.data=()=>{const r=cv.getBoundingClientRect();return {w:r.width||1,h:r.height||420,strokes}};
  this.addStroke=s=>{strokes.push(s);save();redraw()};
  this.size=size;
}
const m=$('m');
Q.questions.forEach((o,i)=>{const d=document.createElement('section');d.className='q';
 d.innerHTML='<h2>'+(o.title||('Question '+(i+1)))+(o.challenge?'<span class="tag">Challenge ⭐ 挑戰題</span>':'')+'</h2><p></p><canvas></canvas><div class="btns" style="justify-content:flex-start"><button>↩︎ Undo 復原</button><button>🧽 Clear 清除</button></div>';
 d.querySelector('p').textContent=o.q;m.appendChild(d);const p=new Pad(d.querySelector('canvas'),i);pads.push(p);
 const b=d.querySelectorAll('button');b[0].onclick=p.undo;b[1].onclick=p.clear;});
function resizeAll(){pads.forEach(p=>p.size())}
window.addEventListener('resize',()=>setTimeout(resizeAll,100));resizeAll();
window.__pads=pads;
function wrap(ctx,text,maxW){const out=[];String(text).split('\n').forEach(par=>{const words=par.split(/(\s+)/);let line='';
  words.forEach(w=>{if(ctx.measureText(line+w).width>maxW&&line.trim()){out.push(line.trim());line=w.trimStart()}else line+=w;
    while(ctx.measureText(line).width>maxW){let k=line.length;while(k>1&&ctx.measureText(line.slice(0,k)).width>maxW)k--;out.push(line.slice(0,k));line=line.slice(k)}});out.push(line.trim())});return out}
// Export at scale 1, width 900; drawings scaled down; keep height <= 7800 and pixels < 16M (iOS limits)
function compose(){
  const W=900,pad=24,MAXH=7800;const c=document.createElement('canvas');let ctx=c.getContext('2d');
  ctx.font='22px sans-serif';
  let blocks=Q.questions.map((o,i)=>{const d=pads[i].data();const sc=(W-2*pad)/d.w;const lines=wrap(ctx,o.q,W-2*pad);return {o,d,sc,lines}});
  const fixed=b=>48+b.lines.length*30+20;
  let H=90+blocks.reduce((a,b)=>a+fixed(b)+b.d.h*b.sc,0);
  if(H>MAXH){const room=MAXH-90-blocks.reduce((a,b)=>a+fixed(b),0);const tot=blocks.reduce((a,b)=>a+b.d.h*b.sc,0);const f=Math.max(.2,room/tot);blocks.forEach(b=>b.sc*=f);H=MAXH}
  c.width=W;c.height=Math.ceil(H);ctx=c.getContext('2d');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#ff9f43';ctx.fillRect(0,0,W,70);
  ctx.fillStyle='#fff';ctx.font='bold 32px sans-serif';ctx.fillText(Q.child+' Math Quiz '+DATE,pad,46);
  let y=90;
  blocks.forEach(b=>{ctx.fillStyle='#333';ctx.font='bold 24px sans-serif';ctx.fillText((b.o.title||'')+(b.o.challenge?' [Challenge]':''),pad,y+24);
    ctx.font='22px sans-serif';b.lines.forEach((l,k)=>ctx.fillText(l,pad,y+56+k*30));
    const top=y+48+b.lines.length*30;const dw=b.d.w*b.sc,dh=b.d.h*b.sc;
    ctx.strokeStyle='#ccc';ctx.lineWidth=2;ctx.strokeRect(pad,top,dw,dh);
    ctx.save();ctx.beginPath();ctx.rect(pad,top,dw,dh);ctx.clip();ctx.translate(pad,top);ctx.scale(b.sc,b.sc);b.d.strokes.forEach(s=>drawStroke(ctx,s));ctx.restore();
    y=top+dh+20});
  return c;
}
function dataURLtoFile(url,name){const [h,b64]=url.split(',');const bin=atob(b64);const u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
  const blob=new Blob([u],{type:'image/png'});try{return new File([blob],name,{type:'image/png'})}catch(e){blob.name=name;return blob}}
function reportText(){const done=pads.filter(p=>p.data().strokes.length).length;
  return REPORT_HEADER+'\n'+Q.child+' · '+DATE+' · '+(Q.topic||'')+'\nAnswered '+done+'/'+pads.length+' boxes. Working image attached 附手寫步驟圖。'}
$('done').onclick=function(){
  const body=$('ovbody');body.innerHTML='';$('spin').style.display='block';ov(true); // synchronous feedback
  setTimeout(function(){
    try{
      const c=compose();const url=c.toDataURL('image/png');
      if(!url||url.length<100)throw new Error('Image is empty (canvas '+c.width+'x'+c.height+')');
      const name=Q.child+'-math-'+DATE+'.png';let file=null;try{file=dataURLtoFile(url,name)}catch(e){}
      $('spin').style.display='none';
      body.innerHTML='<p class="msg"><b>長按圖片 → 儲存到「照片」或「加入照片」，再到微信傳給爸爸</b><br>(Long-press the picture → Save to Photos, then send it to Dad on WeChat)</p>'+
        '<div class="btns"><button id="sh">📤 分享 Share</button><a class="btn" id="dl">⬇️ 下載 Download</a><button id="cp">📋 Copy report</button><button id="cl">✖️ 關閉 Close</button></div><p class="msg" id="note"></p><img id="img" alt="quiz working">';
      $('img').src=url;const dl=$('dl');dl.href=url;dl.download=name;
      $('cl').onclick=()=>ov(false);
      $('cp').onclick=()=>{const t=reportText();(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject(new Error('no clipboard'))).then(()=>{$('note').textContent='Copied 已複製'},()=>{$('note').textContent=t})};
      $('sh').onclick=function(){const note=$('note');
        try{if(!file||!navigator.share||(navigator.canShare&&!navigator.canShare({files:[file]}))){note.className='msg err';note.textContent='分享無法使用，請用長按儲存 (Share not available — long-press the picture to save)';return}
          navigator.share({files:[file],title:Q.child+' Math Quiz '+DATE}).catch(e=>{if(e&&e.name==='AbortError')return;note.className='msg err';note.textContent='分享無法使用，請用長按儲存 ('+(e&&e.name)+': '+(e&&e.message)+')'})
        }catch(e){note.className='msg err';note.textContent='分享無法使用，請用長按儲存 ('+e.message+')'}};
    }catch(e){showErr((e&&e.message)||String(e))}
  },30);
};
})();
