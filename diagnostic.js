/* Student runtime: consumes only prompts, passages and choices, never scoring metadata. */
(() => {
 'use strict';
 const cfg=window.PORTAL,P=window.AssessmentPersistence,subject=new URLSearchParams(location.search).get('subject');
 const main=document.getElementById('diagnostic');
 const allowed=['reading','writing','science','history'];
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const key=cfg.student.toLowerCase()+'Baseline2026_'+subject;
 let assessment,state;
 function read(){return P?P.read(key):(()=>{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):null;})();}
 function complete(q){const a=state.answers[q.id];return q.type==='choice'?Number.isInteger(a?.choice)&&a.choice>=0&&a.choice<=4:!!(a?.text?.trim()||a?.unknown);}
 function persist(){
  try{const current=read();if(current?.submittedAt){state=current;render();return false;}
   state=P?P.write(key,state):(localStorage.setItem(key,JSON.stringify(state)),state);const recovery=P?.status?.();document.getElementById('save-status').textContent=recovery&&!recovery.recoverySaved?'Saved in this browser. Parent recovery copy needs attention.':'Saved in this browser with a recovery copy.';return true;
  }catch(error){document.getElementById('save-status').textContent='Not saved. Keep this page open and ask a parent to free browser storage.';return false;}
 }
 function shell(){main.innerHTML=`<p class="eyebrow">${escape(cfg.student)} · Baseline</p><h1>${escape(assessment.title)}</h1>
 <p class="notice">Work independently. There is no time limit. You may take breaks, go back, and change answers before submitting. Use E if you do not know or have not been taught something.</p>
 <p id="save-status" role="status">Your work saves in this browser.</p><p id="progress" aria-live="polite"></p><div id="item"></div>
 <div class="nav no-print"><button id="prev">Previous</button><button id="next">Next</button><button id="review">Review answers</button><a class="button secondary" href="index.html">Save & return</a></div>
 <div id="review-panel" class="card" hidden></div><p id="validation" role="alert"></p><button id="finish" class="button">Submit assessment</button>`;
 document.getElementById('prev').onclick=()=>move(-1);document.getElementById('next').onclick=()=>move(1);
 document.getElementById('review').onclick=review;document.getElementById('finish').onclick=submit;
 }
 function render(){
  if(state.submittedAt){main.innerHTML='<h1>Assessment submitted</h1><p>Your responses have been saved and locked. Please tell a parent you have finished.</p><a class="button" href="index.html">Return to Home School</a>';return;}
  const q=assessment.questions[state.index],a=state.answers[q.id]||{};
  document.getElementById('progress').textContent=`Question ${state.index+1} of ${assessment.questions.length} · ${assessment.questions.filter(complete).length} answered`;
  const item=document.getElementById('item');
  item.innerHTML=`<article class="question">${q.passage?`<div class="passage ${q.passage.includes("map —")||q.passage.includes("Town map")?"map-stimulus":""}">${escape(q.passage)}</div>`:''}<h2 tabindex="-1" id="question-title">${state.index+1}. ${escape(q.prompt)}</h2>${q.type==='choice'?`<fieldset><legend>Choose one response</legend>${q.options.map((o,i)=>`<label class="choice"><input name="answer" type="radio" value="${i}" ${a.choice===i?'checked':''}><span><strong>${'ABCDE'[i]}.</strong> ${escape(o)}</span></label>`).join('')}</fieldset>`:`<label for="writing-response">Your independent writing</label><textarea id="writing-response" spellcheck="false" autocorrect="off" autocomplete="off">${escape(a.text||'')}</textarea><label class="choice"><input id="writing-unknown" type="checkbox" ${a.unknown?'checked':''}>I don't know how to start / I haven't been taught this yet.</label>`}
  <div id="exposure" ${a.choice===4||a.unknown?'':'hidden'}><label for="exposure-select">Optional: which best describes this?</label><select id="exposure-select"><option value="unsure">Not sure / prefer not to say</option><option value="dont-know">I have learned this, but I don't know the answer</option><option value="not-taught">I haven't been taught this yet</option></select></div></article>`;
  document.getElementById('exposure-select').value=a.exposure||'unsure';
  item.querySelectorAll('input[name="answer"]').forEach(el=>el.onchange=()=>{if(state.submittedAt)return;state.answers[q.id]={...state.answers[q.id],choice:Number(el.value)};if(persist())render();});
  if(q.type==='writing'){
   document.getElementById('writing-response').oninput=e=>{if(state.submittedAt)return;state.answers[q.id]={...state.answers[q.id],text:e.target.value};persist();updateCount();};
   document.getElementById('writing-unknown').onchange=e=>{if(state.submittedAt)return;state.answers[q.id]={...state.answers[q.id],unknown:e.target.checked};if(persist())render();};
  }
  document.getElementById('exposure-select').onchange=e=>{if(state.submittedAt)return;state.answers[q.id]={...state.answers[q.id],exposure:e.target.value};persist();};
  document.getElementById('prev').disabled=state.index===0;document.getElementById('next').disabled=state.index===assessment.questions.length-1;
 }
 function updateCount(){document.getElementById('progress').textContent=`Question ${state.index+1} of ${assessment.questions.length} · ${assessment.questions.filter(complete).length} answered`;}
 function move(delta){if(state.submittedAt)return;state.index=Math.max(0,Math.min(assessment.questions.length-1,state.index+delta));if(persist()){render();document.getElementById('question-title').focus();}}
 function validState(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||value.version!==assessment.version||typeof value.answers!=='object'||!value.answers||Array.isArray(value.answers))return false;
  if(value.student&&value.student!==cfg.student)return false;if(value.subject&&value.subject!==subject)return false;
  if(!Number.isInteger(value.index)||value.index<0||value.index>=assessment.questions.length)return false;
  if(value.startedAt&&!Number.isFinite(Date.parse(value.startedAt)))return false;if(value.submittedAt&&!Number.isFinite(Date.parse(value.submittedAt)))return false;
  const ids=new Set(assessment.questions.map(q=>String(q.id)));for(const [id,a] of Object.entries(value.answers)){if(!ids.has(String(id))||!a||typeof a!=='object'||Array.isArray(a))return false;if(a.choice!==undefined&&(!Number.isInteger(a.choice)||a.choice<0||a.choice>4))return false;if(a.text!==undefined&&typeof a.text!=='string')return false;if(a.unknown!==undefined&&typeof a.unknown!=='boolean')return false;if(a.exposure!==undefined&&!['unsure','dont-know','not-taught'].includes(a.exposure))return false;}return true;
 }
 function review(){const panel=document.getElementById('review-panel');panel.hidden=false;panel.innerHTML='<h2>Review responses</h2><p>“Answered” means a response is saved. You can revisit any question.</p><div class="review-grid">'+assessment.questions.map((q,i)=>`<button data-index="${i}">${i+1}: ${complete(q)?'Answered':'Unanswered'}</button>`).join('')+'</div>';panel.querySelectorAll('button').forEach(b=>b.onclick=()=>{state.index=Number(b.dataset.index);persist();render();document.getElementById('question-title').focus();});}
 function submit(){
  if(state.submittedAt)return;
  const missing=assessment.questions.filter(q=>!complete(q));
  if(missing.length){document.getElementById('validation').textContent=`Please answer all questions before submitting. ${missing.length} still need a response. You may choose E or the writing “I don't know” response.`;review();return;}
  if(!confirm('Submit your assessment? You will not be able to change responses afterward.'))return;
  state.submittedAt=new Date().toISOString();
  if(!persist()){state.submittedAt=null;return;}
  try{const record=JSON.parse(localStorage.getItem(cfg.recordKey)||'null');if(record){const id=subject==='reading'?'ela':subject==='history'?'social':subject;const a=record.assessments.find(a=>a.id===id);if(a){a.status='Complete';a.score='Parent report available';}const task=record.assignments.find(a=>a.diagnosticId===subject);if(task){task.complete=true;task.completedDate=state.submittedAt.slice(0,10);}localStorage.setItem(cfg.recordKey,JSON.stringify(record));}}catch(error){/* attempt is independently saved */}
  render();window.scrollTo(0,0);
 }
 window.addEventListener('storage',e=>{if(e.key===key){try{const latest=read();if(latest){state=latest;shell();render();}}catch(error){}}});
 async function init(){try{
  if(!allowed.includes(subject))throw new Error('Choose an assessment from the dashboard.');
  const res=await fetch('assessments/'+subject+'.json');if(!res.ok)throw new Error('This assessment could not be loaded. Please retry.');assessment=await res.json();
  state=read()||{version:assessment.version,student:cfg.student,subject,answers:{},index:0,startedAt:new Date().toISOString(),submittedAt:null};
  if(!validState(state))throw new Error('Your saved attempt uses a different or unsupported format. A parent must export it before continuing; it has not been overwritten.');
  state.index=Math.max(0,Math.min(assessment.questions.length-1,state.index||0));shell();render();
 }catch(error){main.innerHTML='<h1>Assessment needs attention</h1><p>'+escape(error.message)+'</p><p>Saved responses have not been replaced.</p><a href="index.html">Return home</a>';}}
 init();
})();
