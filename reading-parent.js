// Parent review is tied to immutable Reading evidence checkpoints.
(() => {
 'use strict';

 const S=window.ReadingStore,C=S.C,e=S.esc,$=id=>document.getElementById(id);
 const rubricLevels=[['','Not reviewed'],['2','Reasonable evidence-supported response'],['1','Discuss or revise together'],['0','Insufficient evidence in this response']];
 const assistance=['','Independent','Minimal reminder','Discussed together','Substantial guidance'];
 const option=(values,current)=>values.map(([value,label])=>`<option value="${e(value)}" ${String(current??'')===String(value)?'selected':''}>${e(label)}</option>`).join('');
 const topicFor=(w,value)=>w.choices.find(topic=>topic.id===value?.topicId)||(w.choices.length===1?w.choices[0]:null);
 const equal=(question,value)=>{
  if(question.type==='single')return value===question.correct;
  if(!Array.isArray(value))return false;
  if(question.type==='order')return question.correct.length===value.length&&question.correct.every((item,index)=>value[index]===item);
  const actual=[...value].sort(),expected=[...question.correct].sort();
  return actual.length===expected.length&&actual.every((item,index)=>item===expected[index]);
 };
 const answerText=(question,value)=>Array.isArray(value)?value.map(item=>question.options.find(option=>option[0]===item)?.[1]||item).join(' → '):question.options.find(option=>option[0]===value)?.[1]||'(no response)';
 const currentReview=(review,latest)=>latest&&review?.snapshotId===latest.id?review:null;

 function projectedDraft(topic,value){
  if(!topic||!value)return null;
  return {
   objectiveResponses:Object.fromEntries(topic.objectives.map(question=>[question.id,value.objectiveResponses?.[question.id]])),
   writtenResponses:Object.fromEntries(topic.responses.map(response=>[response.id,value.writtenResponses?.[response.id]??''])),
   assistance:value.assistance
  };
 }
 function draftChanged(topic,value,latest){
  if(!topic||!value||!latest)return false;
  return JSON.stringify(projectedDraft(topic,value))!==JSON.stringify({objectiveResponses:latest.objectiveResponses,writtenResponses:latest.writtenResponses,assistance:latest.assistance});
 }
 function summary(){
  const works=S.evidence(),reviews=S.parent().reviews;
  const rows=C.weeks.map(w=>{
   const value=works[w.id],latest=S.latestSnapshot(value),topic=topicFor(w,latest||value),review=currentReview(reviews[w.id],latest);
   return {
    id:w.id,week:w.number,title:w.title,skills:w.skills,topic:topic?.title||null,
    completedAt:value?.completedAt||null,checkpointId:latest?.id||null,
    objectiveResult:latest?.objectiveResult||null,parentReview:review?.status||'Not reviewed',
    assistance:review?.assistance||null,studentAssistance:latest?.assistance||null,comments:review?.comments||null
   };
  });
  return {
   schemaVersion:1,student:C.student,schoolYear:C.schoolYear,courseVersion:C.version,generatedAt:new Date().toISOString(),
   scope:'Seven weeks of subsequent Reading instruction; no diagnostic percentage, letter grade, or placement determination.',
   completedModules:rows.filter(row=>row.completedAt).length,
   reviewedModules:rows.filter(row=>row.parentReview!=='Not reviewed').length,
   portfolioReady:C.weeks.filter(w=>w.portfolio&&works[w.id]?.complete).length,weeks:rows
  };
 }
 function objectiveEvidence(topic,snapshot){
  if(!topic||!snapshot)return '<p>No evidence checkpoint has been submitted yet.</p>';
  return topic.objectives.map(question=>{
   const answer=snapshot.objectiveResponses[question.id];
   return `<article class="reading-objective"><h4>${e(question.prompt)}</h4><p><strong>Checkpoint response:</strong> ${e(answerText(question,answer))}</p><p><strong>Instructional key:</strong> ${e(answerText(question,question.correct))}</p><p><strong>${equal(question,answer)?'Matched the objective check':'Revisit this item'}.</strong> ${e(question.rationale)}</p></article>`;
  }).join('');
 }
 function writtenEvidence(topic,snapshot){
  if(!topic||!snapshot)return '<p>No evidence checkpoint has been submitted yet.</p>';
  return topic.responses.map(response=>`<article><h4>${e(response.label)}</h4><p>${e(response.prompt)}</p><div class="reading-checkpoint">${e(snapshot.writtenResponses[response.id])}</div></article>`).join('');
 }
 function reviewForm(w,review,latest){
  return `<form data-reading-review="${w.id}" data-reading-snapshot="${e(latest.id)}" class="no-print"><p class="meta">This review will be attached to the evidence checkpoint saved ${e(new Date(latest.at).toLocaleString())}.</p><div class="reading-rubric-grid">${C.rubric.map(item=>`<label>${e(item.label)}<select name="rubric-${item.id}" data-reading-rubric="${item.id}">${option(rubricLevels,review?.rubric?.[item.id])}</select></label>`).join('')}</div><div class="reading-rubric-grid"><label>Review status<select name="status">${option([['','Not reviewed'],['Reasonable evidence-supported response','Reasonable evidence-supported response'],['Revisit together','Revisit together']],review?.status)}</select></label><label>Assistance observed<select name="assistance">${option(assistance.map(value=>[value,value||'Not recorded']),review?.assistance)}</select></label><label>Review date<input type="date" name="date" value="${e(review?.date||'')}"></label></div><label>Parent note — accept reasonable wording; record the evidence and next step<textarea name="comments" rows="4">${e(review?.comments||'')}</textarea></label><button class="button" type="submit">Save Reading review</button><p class="reading-status" role="status"></p></form>`;
 }
 function render(){
  const host=$('reading-parent');if(!host)return;host.classList.add('reading-parent');
  try{
   const works=S.evidence(),parent=S.parent(),report=summary();
   host.innerHTML=`<h2>Reading Evidence Lab · Seven-week instruction</h2><p><strong>CLOSE READING → INTERPRETATION → EVIDENCE → EVALUATING EVIDENCE → LIMITING CLAIMS → MISSING EVIDENCE → INDEPENDENT INVESTIGATION</strong></p><p>The completed Reading / ELA Baseline remains a separate historical assessment. These records document subsequent Grade 7 instruction and do not rescore, correct, or alter that attempt. Objective checks are practice; parent review evaluates reasoning without requiring exact wording.</p><div class="reading-parent-summary"><div><strong>${report.completedModules}/7</strong>modules complete</div><div><strong>${report.reviewedModules}/7</strong>current checkpoints reviewed</div><div><strong>${report.portfolioReady}</strong>portfolio-ready checkpoints</div></div><div class="actions no-print"><a href="reading.html">Open student course</a><button id="reading-parent-export">Export Reading work and reviews (.json)</button></div><p id="reading-parent-status" class="reading-status" role="status"></p>
   ${C.weeks.map(w=>{
    const value=works[w.id],latest=S.latestSnapshot(value),topic=topicFor(w,latest||value),savedReview=parent.reviews[w.id]||null,review=currentReview(savedReview,latest);
    const reviewLabel=review?.status||(savedReview?'Review needed for latest checkpoint':'Not reviewed');
    return `<details class="reading-panel" data-reading-parent-week="${w.id}"><summary><strong>Week ${w.number} · ${e(w.title)}</strong> · ${value?.complete?'Completed '+e(value.completedAt.slice(0,10)):'Not complete'} · ${e(reviewLabel)}</summary><div class="reading-badges"><span class="reading-badge">${e(w.skills.join(' · '))}</span>${w.portfolio?'<span class="reading-badge portfolio">Portfolio-ready</span>':''}</div><p><strong>California Grade 7:</strong> ${e(w.standards.join(', '))}</p><p><strong>${latest?'Checkpoint topic':'Current topic'}:</strong> ${e(topic?.title||'Not selected')}</p><p><strong>Latest objective check:</strong> ${latest?`${latest.objectiveResult.correct} of ${latest.objectiveResult.total} matched`:'No completed checkpoint'} · completion is not a grade.</p>${latest?`<p><strong>Student-reported help:</strong> ${e(latest.assistance)}</p><details><summary>Objective responses and instructional feedback</summary>${objectiveEvidence(topic,latest)}</details><details open><summary>Constructed responses for parent review</summary>${writtenEvidence(topic,latest)}</details>${draftChanged(topic,value,latest)?'<p class="reading-note"><strong>Later draft changes are saved.</strong> They are not part of this checkpoint or parent review until Brody saves a new evidence checkpoint.</p>':''}${reviewForm(w,review,latest)}`:'<p class="reading-note">Parent review opens after Brody saves the week’s evidence checkpoint.</p>'}${review?.updatedAt?`<div class="reading-note"><strong>Review saved ${e(review.updatedAt.slice(0,10))} for this checkpoint:</strong> ${e(review.status||'No overall status')} · assistance: ${e(review.assistance||'not recorded')}<br>${e(review.comments||'No note recorded.')}</div>`:''}${savedReview&&!review?`<div class="reading-note"><strong>A prior checkpoint has a parent review.</strong> Review the latest checkpoint above before it will count in the current summary.</div>`:''}</details>`;
   }).join('')}`;

   host.querySelectorAll('form[data-reading-review]').forEach(form=>form.onsubmit=event=>{
    event.preventDefault();const status=form.querySelector('[role="status"]');
    try{
     const raw=Object.fromEntries(new FormData(form));
     const rubric=Object.fromEntries(C.rubric.map(item=>[item.id,raw['rubric-'+item.id]||'']));
     const review={snapshotId:form.dataset.readingSnapshot,rubric,status:raw.status||'',assistance:raw.assistance||'',date:raw.date||'',comments:raw.comments||''};
     if(review.status&&!review.date)review.date=new Date().toISOString().slice(0,10);
     S.saveParent(form.dataset.readingReview,review);render();$('reading-parent-status').textContent='Reading review saved for the displayed checkpoint.';
    }catch(error){status.textContent='NOT SAVED: '+error.message;}
   });
   $('reading-parent-export').onclick=()=>{try{S.download('brody-reading-evidence-and-parent-review.json',{kind:'reading-course',schemaVersion:1,student:C.student,exportedAt:new Date().toISOString(),readingCourse:S.backup(true),readingSummary:summary()});}catch(error){$('reading-parent-status').textContent=error.message;}};
  }catch(error){host.innerHTML='<h2>Reading course records need attention</h2><p>'+e(error.message)+'</p><p>Existing data was not changed.</p>';}
 }
 function backup(){
  try{return {readingCourse:S.backup(true),readingSummary:summary()};}
  catch(error){
   const raw={};for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key.startsWith(S.prefix)||key===S.parentKey)raw[key]=localStorage.getItem(key);}
   return {readingCourseRecovery:raw,readingCourseRecoveryNote:error.message+' These raw values are an archival safety copy and require manual recovery; automatic restore will not overwrite malformed records.'};
  }
 }
 function validateImport(imported){if(imported.readingCourse)S.restorePlan(imported.readingCourse);}
 function restore(imported){if(imported.readingCourse){S.restore(imported.readingCourse);S.syncPortal();}}
 window.ReadingParent={render,summary,backup,validateImport,restore};
})();
