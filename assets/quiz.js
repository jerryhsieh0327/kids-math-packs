// Shared multiple-choice kid page. Expects window.QUIZ (see build.py).
(function(){
var Q=window.QUIZ,DATE=Q.date,KEY='kmp-mc-'+DATE,HEAD='【Math 成績回報 → 數學家教】',L=['A','B','C','D'];
var $=function(id){return document.getElementById(id)};
var st={ans:{},submitted:false};try{var s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&s.ans)st=s}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}}
function esc(t){return String(t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
window.onerror=function(m){var e=$('msg');if(e){e.className='err';e.textContent='Error: '+m+'（請截圖）'}};
document.title=Q.child+' Math Quiz '+DATE;
var h='<header>'+esc(Q.child)+' Math Quiz '+DATE+'<small>'+esc(Q.topic)+' · Level '+Q.level+' · Tap one answer for each question, then tap 提交 Submit.</small></header><main><div id="score"></div>';
Q.questions.forEach(function(q,i){h+='<section class="q" id="q'+i+'"><h2>Question '+(i+1)+' · '+esc(q.title)+(q.challenge?'<span class="tag">Challenge 挑戰題</span>':'')+(q.isReview?'<span class="tag" style="background:#6c5ce7">Review</span>':'')+'</h2><p>'+esc(q.q)+'</p>';
  L.forEach(function(k){h+='<button class="opt" data-i="'+i+'" data-k="'+k+'"><b>'+k+'.</b>'+esc(q.options[k])+'</button>'});h+='<div class="fb" id="fb'+i+'" style="display:none"></div></section>'});
h+='<div id="msg"></div><div class="bar"><button class="big" id="sub">提交 Submit</button><button class="big alt" id="redo" style="display:none">重新作答 Try again</button><button class="big cp" id="cp" style="display:none">複製成績 Copy score</button></div><textarea id="cpbox" readonly></textarea></main>';
document.body.innerHTML=h;
function score(){var n=0;Q.questions.forEach(function(q,i){if(st.ans[i]===q.answer)n++});return n}
function render(){
  Q.questions.forEach(function(q,i){
    [].forEach.call(document.querySelectorAll('#q'+i+' .opt'),function(b){var k=b.getAttribute('data-k');b.className='opt'+(st.ans[i]===k?' sel':'');
      if(st.submitted){if(k===q.answer)b.className='opt right';else if(st.ans[i]===k)b.className='opt wrong'}});
    var fb=$('fb'+i);
    if(st.submitted){var a=st.ans[i],ok=a===q.answer;fb.style.display='block';
      fb.innerHTML=(ok?'<span class="ok">✔ Correct!</span>':'<span class="no">✘ You chose '+a+'. Correct answer: '+q.answer+'</span>')+'<br>'+esc(q.explanation)+(!ok&&q.wrong&&q.wrong[a]?'<br><b>Why '+a+' is wrong:</b> '+esc(q.wrong[a]):'');
    }else fb.style.display='none'});
  $('sub').style.display=st.submitted?'none':'';$('redo').style.display=$('cp').style.display=st.submitted?'':'none';
  $('score').textContent=st.submitted?'Score 得分: '+score()+' / '+Q.questions.length:'';
}
document.body.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.opt');if(!b||st.submitted)return;
  st.ans[+b.getAttribute('data-i')]=b.getAttribute('data-k');save();render()});
$('sub').onclick=function(){var miss=[];Q.questions.forEach(function(q,i){if(!st.ans[i])miss.push(i+1)});
  if(miss.length){$('msg').className='err';$('msg').textContent='還沒作答 Not answered yet: Question '+miss.join(', ');$('q'+(miss[0]-1)).scrollIntoView({behavior:'smooth'});return}
  st.submitted=true;save();$('msg').textContent='';render();window.scrollTo(0,0)};
$('redo').onclick=function(){st={ans:{},submitted:false};save();$('msg').textContent='';$('cpbox').style.display='none';render();window.scrollTo(0,0)};
function report(){var t=[HEAD,'孩子：'+Q.child,'日期：'+DATE,'主題：'+Q.topic,'難度：Level '+Q.level,'得分：'+score()+'/'+Q.questions.length];
  Q.questions.forEach(function(q,i){var a=st.ans[i]||'-';t.push('題'+(i+1)+' 作答 '+a+' '+(a===q.answer?'✔':'✘')+' 正確 '+q.answer)});return t.join('\n')}
window.__report=report;
$('cp').onclick=function(){var t=report(),m=$('msg');m.className='';
  function fallback(){var ta=$('cpbox');ta.value=t;ta.style.display='block';ta.focus();ta.select();try{ta.setSelectionRange(0,t.length)}catch(e){}
    var ok=false;try{ok=document.execCommand('copy')}catch(e){}
    m.textContent=ok?'已複製 Copied! 貼到微信 Paste into WeChat':'請長按下面文字 → 全選 → 複製 (Select the text below and copy)'}
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){m.textContent='已複製 Copied! 貼到微信 Paste into WeChat'},fallback)}else fallback()}catch(e){fallback()}};
render();
})();
