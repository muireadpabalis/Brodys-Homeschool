(() => {
 'use strict';
 const S=window.ReadingStore,C=S.C,$=id=>document.getElementById(id),e=S.esc;
 const host=$('reading-app');
 const requested=new URLSearchParams(location.search).get('id');
 let module=requested?S.week(requested):null,state=null,conflict=false;
 const clone=value=>structuredClone(value);
 const topicFor=(w,value)=>w.choices.find(t=>t.id===value.topicId)||(w.choices.length===1?w.choices[0]:null);
 const optionLabel=(q,id)=>q.options.find(x=>x[0]===id)?.[1]||id;
 function routineHTML(){return `<div class="reading-routine" aria-label="Evidence reasoning routine">${C.routine.map(x=>`<span>${e(x)}</span>`).join('')}</div>`;}
 function progress(){const works=S.evidence(),done=C.weeks.filter(w=>works[w.id]?.complete).length;return {works,done};}
 function overview(){
  const {works,done}=progress();document.title=C.title+' · Brody';
  host.innerHTML=`<section class="reading-hero"><p class="eyebrow">Brody · Grade 7 · Seven weeks</p><h1>${e(C.title)}</h1><p>${e(C.subtitle)} Each week uses an investigation, source, story, or data set to make close reading useful.</p></section>
  <section class="reading-panel"><h2>Your evidence routine</h2>${routineHTML()}<p class="reading-note"><strong>The completed Reading Baseline remains a separate historical record.</strong> This course saves new instructional work under separate module records. Objective checks are practice, not grades.</p></section>
  <section class="reading-panel"><div class="reading-progress"><strong>${done} of 7 modules complete</strong><div class="reading-meter" aria-label="${done} of 7 complete"><span style="width:${done/7*100}%"></span></div></div></section>
  <section class="reading-week-grid">${C.weeks.map(w=>{const v=works[w.id];return `<article class="reading-week-card" data-reading-week-card="${w.id}"><span class="reading-week-number">Week ${w.number}</span><h2>${e(w.title)}</h2><p>${e(w.skills.join(' · '))}</p><div class="reading-badges"><span class="reading-badge">${e(w.time)}</span>${w.portfolio?'<span class="reading-badge portfolio">Portfolio-ready</span>':''}${v?.complete?'<span class="reading-badge complete">Complete '+e(v.completedAt.slice(0,10))+'</span>':v?.updatedAt?'<span class="reading-badge">In progress</span>':''}</div><div class="actions"><a class="button" href="reading.html?id=${w.id}">${v?.complete?'Review module':v?.updatedAt?'Continue':'Start module'}</a></div></article>`;}).join('')}</section>
  <div class="reading-actions no-print"><button id="reading-export" class="button secondary">Download my Reading work</button><a href="index.html#reading">Back to assignments</a></div>`;
  $('reading-export').onclick=studentExport;
 }
 function textHTML(text){return String(text).split(/\n\s*\n/).map(p=>`<p>${e(p)}</p>`).join('');}
 function sourcesHTML(topic){if(!topic.sources.length)return `<p class="reading-note">${e(topic.sourceLabel)}</p>`;return `<details><summary>Sources and attribution</summary><p>${e(topic.sourceLabel)}</p><ul class="reading-source-list">${topic.sources.map(s=>`<li><a href="${e(s.url)}" target="_blank" rel="noopener">${e(s.title)}</a></li>`).join('')}</ul></details>`;}
 function tableHTML(table){if(!table)return '';return `<div class="reading-table-wrap"><table class="reading-data-table"><caption>${e(table.caption)}</caption><thead><tr>${table.headers.map(x=>`<th>${e(x)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row=>`<tr>${row.map(x=>`<td>${e(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}
 function choiceHTML(q){
  const value=state.objectiveResponses[q.id];
  if(q.type==='order')return `<fieldset><legend>${e(q.prompt)}</legend>${q.correct.map((_,i)=>`<label class="reading-order"><span>${i+1}</span><select data-reading-objective="${q.id}" data-order-position="${i}"><option value="">Choose an event</option>${q.options.map(([id,label])=>`<option value="${id}" ${Array.isArray(value)&&value[i]===id?'selected':''}>${e(label)}</option>`).join('')}</select></label>`).join('')}</fieldset>`;
  const inputType=q.type==='multi'?'checkbox':'radio';return `<fieldset><legend>${e(q.prompt)}</legend>${q.selectionCount?`<p class="meta">Choose exactly ${q.selectionCount}.</p>`:''}${q.options.map(([id,label])=>{const checked=Array.isArray(value)?value.includes(id):value===id;return `<label class="reading-option"><input type="${inputType}" name="${q.id}${inputType==='checkbox'?'-'+id:''}" value="${id}" data-reading-objective="${q.id}" ${checked?'checked':''}><span>${e(label)}</span></label>`;}).join('')}</fieldset>`;
 }
 function equalAnswer(q,value){if(q.type==='single')return value===q.correct;if(!Array.isArray(value))return false;if(q.type==='order')return q.correct.length===value.length&&q.correct.every((x,i)=>value[i]===x);const a=[...value].sort(),b=[...q.correct].sort();return a.length===b.length&&a.every((x,i)=>x===b[i]);}
 function answered(q,value){if(q.type==='single')return typeof value==='string'&&value!=='';if(!Array.isArray(value)||value.length===0)return false;if(q.type==='order')return value.length===q.correct.length&&value.every(Boolean)&&new Set(value).size===value.length;return q.selectionCount?value.length===q.selectionCount:true;}
 function objectiveFeedback(q){if(!state.objectiveCheck)return '';const correct=equalAnswer(q,state.objectiveResponses[q.id]);return `<div class="reading-feedback ${correct?'correct':''}"><strong>${correct?'Evidence check matched':'Revisit this one'}.</strong> ${e(q.rationale)}</div>`;}
 function checkpointHTML(topic){if(!state.snapshots.length)return '<p>No checkpoint saved yet.</p>';return state.snapshots.map(s=>`<details><summary>${e(new Date(s.at).toLocaleString())} · ${s.objectiveResult.correct} of ${s.objectiveResult.total} objective checks matched</summary><p><strong>Topic:</strong> ${e(module.choices.find(t=>t.id===s.topicId)?.title||s.topicId)}</p>${Object.entries(s.writtenResponses).filter(([,v])=>v.trim()).map(([id,v])=>`<h4>${e(module.choices.flatMap(t=>t.responses).find(r=>r.id===id)?.label||id)}</h4><div class="reading-checkpoint">${e(v)}</div>`).join('')}</details>`).join('');}
 function renderTopicChoice(){
  host.innerHTML=`<section class="reading-hero"><p class="eyebrow">Week ${module.number} · ${e(module.time)}</p><h1>${e(module.title)}</h1><p>Choose the topic that makes you most curious. Both choices practice the same Grade 7 reasoning.</p></section><section class="reading-panel"><div class="reading-choice-grid">${module.choices.map(t=>`<button class="reading-choice-card" data-topic="${t.id}"><span class="reading-badge">${e(t.label)}</span><strong>${e(t.title)}</strong><span>${e(t.sourceLabel)}</span></button>`).join('')}</div></section><p class="reading-status" id="reading-status" role="status"></p><a href="reading.html">← All seven weeks</a>`;
  host.querySelectorAll('[data-topic]').forEach(button=>button.onclick=()=>{if(persist(v=>{v.topicId=button.dataset.topic;v.objectiveCheck=null;}))renderModule();});
 }
 function renderModule(){
  const topic=topicFor(module,state);if(!topic){renderTopicChoice();return;}if(!state.topicId)state.topicId=topic.id;
  document.title='Week '+module.number+' · '+module.title+' · Brody';
  host.innerHTML=`<section class="reading-hero"><p class="eyebrow">Week ${module.number} · ${e(module.time)} · Grade 7 Reading</p><h1>${e(module.title)}</h1><p>${e(topic.title)}</p><div class="reading-badges"><span class="reading-badge">${e(topic.label)}</span>${module.portfolio?'<span class="reading-badge portfolio">Portfolio-ready work sample</span>':''}${state.complete?'<span class="reading-badge complete">Checkpoint complete</span>':''}</div></section>
  <div class="reading-module-grid"><div>
   <section class="reading-panel reading-lesson"><h2>Investigator briefing</h2>${module.lesson.map(textHTML).join('')}</section>
   ${module.choices.length>1?`<section class="reading-panel no-print"><label for="reading-topic"><strong>Topic choice</strong></label><select id="reading-topic" ${state.complete?'disabled':''}>${module.choices.map(t=>`<option value="${t.id}" ${t.id===topic.id?'selected':''}>${e(t.title)}</option>`).join('')}</select><p class="meta">${state.complete?'The completed checkpoint keeps this topic fixed.':'Switching topics keeps any work already saved for each choice.'}</p></section>`:''}
   <section class="reading-panel"><p class="eyebrow">Read</p>${topic.sections.map(s=>`<article class="reading-source"><h3>${e(s.heading)}</h3>${textHTML(s.text)}</article>`).join('')}${tableHTML(topic.table)}${sourcesHTML(topic)}</section>
   <section class="reading-panel"><p class="eyebrow">Embedded practice</p><h2>Test the evidence</h2><p>Complete every item, then check your reasoning. Correctness is not required for completion; use the feedback to reconsider your evidence.</p>${topic.objectives.map((q,i)=>`<article class="reading-objective" data-reading-question="${q.id}"><span class="reading-week-number">Check ${i+1}</span>${choiceHTML(q)}${objectiveFeedback(q)}</article>`).join('')}<button id="reading-check" class="button secondary no-print">Check objective answers</button><p id="reading-check-status" class="reading-status" role="status">${state.objectiveCheck?`${state.objectiveCheck.correct} of ${state.objectiveCheck.total} objective checks matched on the latest check. This is practice, not a grade.`:''}</p></section>
   <section class="reading-panel reading-response"><p class="eyebrow">Think and explain</p><h2>Your evidence response</h2>${topic.responses.map(r=>`<label for="${r.id}">${e(r.label)}<span>${e(r.prompt)}</span><textarea id="${r.id}" data-reading-field="${r.id}" rows="${r.rows||5}" spellcheck="true">${e(state.writtenResponses[r.id]||'')}</textarea></label>`).join('')}<p class="reading-note">A parent reviews reasoning for whether it answers the question, uses relevant evidence, explains the connection, and limits the claim. Reasonable evidence-supported wording earns credit.</p></section>
   <section class="reading-panel no-print"><label for="reading-assistance"><strong>Help used for this module</strong></label><select id="reading-assistance">${S.assistanceValues.map(x=>`<option ${state.assistance===x?'selected':''}>${e(x)}</option>`).join('')}</select><div class="reading-actions"><button id="reading-save" class="button secondary">Save & continue later</button><button id="reading-checkpoint" class="button">Save evidence checkpoint & complete</button></div><p id="reading-status" class="reading-status" role="status"></p></section>
   <section class="reading-panel"><details><summary>Saved evidence checkpoints (${state.snapshots.length})</summary>${checkpointHTML(topic)}</details></section>
  </div><aside class="reading-side"><section class="reading-panel"><h2>Evidence routine</h2>${routineHTML()}</section><section class="reading-panel"><h3>Vocabulary</h3><dl class="reading-vocab">${module.vocabulary.map(([term,definition])=>`<div><dt>${e(term)}</dt><dd>${e(definition)}</dd></div>`).join('')}</dl></section><section class="reading-panel"><h3>Skills recorded</h3><ul>${module.skills.map(x=>`<li>${e(x)}</li>`).join('')}</ul><p><strong>California Grade 7:</strong> ${e(module.standards.join(', '))}</p><p><a href="${e(C.standardsSource.url)}" target="_blank" rel="noopener">${e(C.standardsSource.title)}</a></p></section></aside></div>
  <div class="reading-actions no-print"><button id="reading-export" class="button secondary">Download my Reading work</button><a href="reading.html">All seven weeks</a><a href="index.html#reading">Reading assignments</a></div>`;
  bind(topic);setStatus(state.updatedAt?'Saved work restored · '+new Date(state.updatedAt).toLocaleString():'Ready — responses save in this browser.');
 }
 function setStatus(message){const status=$('reading-status');if(status)status.textContent=message;}
 function persist(update){if(conflict)return false;try{const activeTopic=state.topicId||(module.choices.length===1?module.choices[0].id:null);state=S.save(module.id,value=>{if(activeTopic&&!value.topicId)value.topicId=activeTopic;update(value);});setStatus('Saved in this browser · '+new Date(state.updatedAt).toLocaleTimeString());return true;}catch(error){setStatus('NOT SAVED: '+error.message+'. Download your work before closing this page.');return false;}}
 function bind(topic){
  const topicSelect=$('reading-topic');if(topicSelect)topicSelect.onchange=()=>{const requestedTopic=topicSelect.value;if(persist(v=>{v.topicId=requestedTopic;v.objectiveCheck=null;}))renderModule();else topicSelect.value=state.topicId;};
  host.querySelectorAll('input[data-reading-objective]').forEach(input=>input.onchange=()=>{
   const q=topic.objectives.find(x=>x.id===input.dataset.readingObjective);if(persist(v=>{if(q.type==='single')v.objectiveResponses[q.id]=input.value;else{const selected=[...host.querySelectorAll(`input[data-reading-objective="${q.id}"]:checked`)].map(x=>x.value);v.objectiveResponses[q.id]=selected;}v.objectiveCheck=null;}))renderModule();
  });
  host.querySelectorAll('select[data-reading-objective]').forEach(select=>select.onchange=()=>{const q=topic.objectives.find(x=>x.id===select.dataset.readingObjective),values=[...host.querySelectorAll(`select[data-reading-objective="${q.id}"]`)].map(x=>x.value);if(persist(v=>{v.objectiveResponses[q.id]=values;v.objectiveCheck=null;}))renderModule();});
  host.querySelectorAll('[data-reading-field]').forEach(area=>area.oninput=()=>persist(v=>{v.writtenResponses[area.dataset.readingField]=area.value;}));
  $('reading-assistance').onchange=()=>persist(v=>{v.assistance=$('reading-assistance').value;});
  $('reading-save').onclick=()=>{if(persist(()=>{}))setStatus('All current work is saved.');};
  $('reading-check').onclick=()=>checkObjectives(topic,true);
  $('reading-checkpoint').onclick=()=>checkpoint(topic);
  $('reading-export').onclick=studentExport;
 }
 function score(topic){return {correct:topic.objectives.filter(q=>equalAnswer(q,state.objectiveResponses[q.id])).length,total:topic.objectives.length};}
 function checkObjectives(topic,rerender){
  const missing=topic.objectives.filter(q=>!answered(q,state.objectiveResponses[q.id]));if(missing.length){$('reading-check-status').textContent=`Complete ${missing.length} objective ${missing.length===1?'item':'items'} before checking.`;return null;}
  const result=score(topic);if(!persist(v=>{v.objectiveCheck={topicId:topic.id,...result,checkedAt:new Date().toISOString()};}))return null;if(rerender)renderModule();return result;
 }
 function checkpoint(topic){
  const missingObjectives=topic.objectives.filter(q=>!answered(q,state.objectiveResponses[q.id]));const missingResponses=topic.responses.filter(r=>!state.writtenResponses[r.id]?.trim());
  if(missingObjectives.length||missingResponses.length){setStatus(`Checkpoint not saved yet: complete ${missingObjectives.length} objective ${missingObjectives.length===1?'item':'items'} and ${missingResponses.length} written ${missingResponses.length===1?'response':'responses'}.`);return;}
  const result=score(topic),now=new Date().toISOString();
  if(!persist(v=>{const objectiveResponses=Object.fromEntries(topic.objectives.map(q=>[q.id,clone(v.objectiveResponses[q.id])])),writtenResponses=Object.fromEntries(topic.responses.map(r=>[r.id,v.writtenResponses[r.id]]));v.topicId=topic.id;v.objectiveCheck={topicId:topic.id,...result,checkedAt:now};v.snapshots.push({id:crypto.randomUUID(),at:now,topicId:topic.id,skills:module.skills.slice(),objectiveResponses,writtenResponses,objectiveResult:result,assistance:v.assistance});v.complete=true;v.completedAt??=now;}))return;
  try{S.syncPortal();}catch(error){renderModule();setStatus('Evidence checkpoint saved. Portal summary needs attention: '+error.message);return;}renderModule();setStatus(`Evidence checkpoint preserved. ${result.correct} of ${result.total} objective checks matched; parent reasoning review is pending.`);
 }
 function studentExport(){try{S.download('brody-reading-evidence-lab-work.json',{kind:'reading-course',schemaVersion:1,student:C.student,schoolYear:C.schoolYear,exportedAt:new Date().toISOString(),readingCourse:S.backup(false)});}catch(error){setStatus('Export needs attention: '+error.message);}}
 function init(){
  if(requested&&!module){host.innerHTML='<h1>Choose a Reading module</h1><p>This module link is not part of the current course.</p><a href="reading.html">Open all seven weeks</a>';return;}
  if(!module){try{overview();}catch(error){host.innerHTML='<h1>Reading records need attention</h1><p>'+e(error.message)+'</p><p>Existing data was not changed.</p>';};return;}
  try{state=S.work(module.id);renderModule();}catch(error){host.innerHTML='<h1>Saved Reading work needs recovery</h1><p>'+e(error.message)+'</p><p>The existing browser record was not changed. Ask a parent to export or recover it.</p><a href="reading.html">Return to the course</a>';}
 }
 window.addEventListener('storage',event=>{if(module&&event.key===S.prefix+module.id){conflict=true;setStatus('This module changed in another tab. Your current page has been paused. Download work or reload before continuing.');host.querySelectorAll('textarea,input,select,button').forEach(el=>{if(el.id!=='reading-export')el.disabled=true;});}});
 init();
})();
