(() => {
 'use strict';
 const S=window.ELAStore,C=window.ELA_CURRICULUM,$=id=>document.getElementById(id),e=S.esc;
 const a=C.assignments.find(x=>x.id===new URLSearchParams(location.search).get('id'));
 if(!a){$('ela-app').innerHTML='<h1>Choose an ELA assignment</h1><p>Return to Assignments / English Language Arts to choose a lesson.</p>';return;}
 let state;try{state=S.work(a.id);}catch(error){$('ela-app').innerHTML='<h1>Saved work needs recovery</h1><p>Your saved work has not been changed. Ask a parent to recover the browser record.</p>';return;}
 document.title=a.title+' · Brody';
 function status(msg){$('ela-status').textContent=msg;}
 function persist(fn){try{state=S.save(a.id,fn);status('Saved in this browser · '+new Date(state.updatedAt).toLocaleTimeString());return true;}catch(error){status('NOT SAVED: '+error.message+'. Download your work before closing this page.');return false;}}
 const sourceHTML=()=>C.assignments.filter(x=>x.week===a.week&&x.sequence<a.sequence&&!x.independent).map(x=>{
  const w=S.work(x.id);return `<details><summary>${e(x.title)}</summary>${x.fields.map(f=>`<h4>${e(f.label)}</h4><div class="ela-response">${e(w.fields[f.id]||'(No saved response yet.)')}</div>`).join('')}</details>`;
 }).join('');
 function render(){
  let release=S.read(S.prefix+'release');
  $('ela-app').innerHTML=`<p class="eyebrow" style="margin-top:28px">Week ${a.week} · Assignment ${a.sequence} · English Language Arts</p><h1>${e(a.title)}</h1><p>${e(a.objective)}</p><div class="ela-meta"><span class="badge">${e(a.effort)} effort</span><span class="badge">${e(a.kind)}</span><span class="badge">California: ${e(a.standards.join(', '))}</span></div><div id="ela-body"></div><p id="ela-status" class="ela-status" role="status" aria-live="polite"></p>`;
  if(a.independent&&!release?.prompt){$('ela-body').innerHTML='<section class="panel"><h2>Ready for a new prompt</h2><p>A parent will release this task when you are ready. Your prompt will appear here.</p><button class="button" id="check-release">Check for prompt</button></section>';$('check-release').onclick=()=>location.reload();return;}
  if(a.requires&&!S.work(a.requires).snapshots.length){$('ela-body').innerHTML=`<section class="panel"><h2>Save the earlier stage first</h2><p>Finish and save a checkpoint for <a href="ela.html?id=${a.requires}">${e(C.assignments.find(x=>x.id===a.requires).title)}</a>, then return here.</p></section>`;return;}
  let html=a.independent?`<section class="panel"><h2>Your prompt</h2><p class="ela-response">${e(release.prompt)}</p><p>Work independently. Blank planning paper or the blank spaces below may be used. Save each stage before moving to the next. Breaks are welcome.</p></section>`:`<section class="panel"><h2>Learn</h2><p>${e(a.lesson)}</p><h2>Your task</h2><ol>${a.directions.map(d=>`<li>${e(d)}</li>`).join('')}</ol></section>`;
  const activeStage=a.independent?(state.stage||0):null;
  if(a.independent&&activeStage>=4){html+='<section class="panel"><h2>Final task saved</h2><p>Your planning, draft, and final copy have been preserved. You can download or review them below.</p></section>';}
  else{
   html+='<section class="panel"><h2>'+ (a.independent?e(a.fields[activeStage].label):'Your work')+'</h2>';
   const fields=a.independent?[a.fields[activeStage]]:a.fields;
   html+=fields.map(f=>`<label for="${f.id}">${e(f.label)}<textarea id="${f.id}" data-field="${f.id}" rows="${a.independent?12:f.rows}" spellcheck="true">${e(state.fields[f.id]||'')}</textarea></label>`).join('');
   html+=(a.checklist||[]).map((label,i)=>`<label class="ela-check"><input type="checkbox" data-check="c${i}" ${state.checks['c'+i]?'checked':''}>${e(label)}</label>`).join('');
   html+=`<div class="ela-toolbar no-print"><button id="save-work" class="button secondary">Save & continue later</button><button id="checkpoint" class="button">${a.independent?'Save this stage':'Save checkpoint & mark complete'}</button></div><p class="privacy-note">Work saves as you type in this browser. A checkpoint preserves a separate dated copy. Export regularly to keep a backup.</p></section>`;
  }
  if(a.independent&&activeStage>0){html+='<section class="panel"><h2>Your saved stages</h2>'+a.fields.slice(0,activeStage).map(f=>`<details><summary>${e(f.label)}</summary><div class="ela-response">${e(state.fields[f.id])}</div></details>`).join('')+'</section>';}
  if(!a.independent){
   html+=`<section class="panel"><details><summary>Your earlier work this week</summary>${sourceHTML()||'<p>This is the first assignment this week.</p>'}</details>`;
   if(a.week===3||a.week===7)html+='<details><summary>Your earlier compositions</summary>'+C.assignments.filter(x=>x.week<a.week&&x.kind.includes('assessment/work sample')).map(x=>`<details><summary>Week ${x.week}: ${e(x.title)}</summary><div class="ela-response">${e(S.work(x.id).fields.f1||'(No saved copy yet.)')}</div></details>`).join('')+'</details>';
   html+='</section>';
  }
  html+='<div class="ela-toolbar no-print"><button id="export-work" class="button secondary">Download my ELA work</button><a href="index.html#ela">Back to ELA assignments</a></div><details id="history"><summary>Saved checkpoints</summary>'+state.snapshots.map(s=>`<details><summary>${e(s.label)} · ${e(new Date(s.at).toLocaleString())}</summary>${Object.entries(s.fields).map(([id,v])=>`<h4>${e(a.fields.find(f=>f.id===id)?.label||id)}</h4><div class="ela-response">${e(v)}</div>`).join('')}</details>`).join('')+'</details>';
  $('ela-body').innerHTML=html;
  document.querySelectorAll('[data-field]').forEach(el=>el.oninput=()=>{state.fields[el.dataset.field]=el.value;persist(w=>{w.fields[el.dataset.field]=el.value;});});
  document.querySelectorAll('[data-check]').forEach(el=>el.onchange=()=>persist(w=>{w.checks[el.dataset.check]=el.checked;}));
  if($('save-work'))$('save-work').onclick=()=>flush();
  if($('checkpoint'))$('checkpoint').onclick=checkpoint;
  $('export-work').onclick=()=>{const all=S.evidence();all[a.id]=state;S.download('brody-ela-work.json',{schemaVersion:1,student:'Brody',schoolYear:C.schoolYear,exportedAt:new Date().toISOString(),curriculum:C,elaEvidence:all,elaRelease:S.read(S.prefix+'release')});};
  status(state.updatedAt?'Saved work restored · '+new Date(state.updatedAt).toLocaleString():'Ready — responses save as you type.');
 }
 function flush(){const fields=Object.fromEntries([...document.querySelectorAll('[data-field]')].map(el=>[el.dataset.field,el.value]));return persist(w=>{Object.assign(w.fields,fields);});}
 function checkpoint(){
  if(!flush())return;
  const required=a.independent?[a.fields[state.stage||0]]:a.fields;
  if(required.every(f=>!state.fields[f.id]?.trim())){status('Write a response before saving a checkpoint.');return;}
  const stage=state.stage||0;
  if(!persist(w=>{w.snapshots.push({id:crypto.randomUUID(),at:new Date().toISOString(),label:a.independent?a.fields[stage].label:'Work checkpoint',fields:structuredClone(w.fields),checks:structuredClone(w.checks)});if(a.independent)w.stage=stage+1;w.complete=!a.independent||w.stage===4;}))return;
  if(state.complete){try{const rec=S.read(window.PORTAL.recordKey);if(rec){const task=rec.assignments.find(x=>x.id===a.id);if(task){task.complete=true;task.completedDate=new Date().toISOString().slice(0,10);}if(!rec.portfolio.some(x=>x.id===a.id))rec.portfolio.push({id:a.id,title:'Week '+a.week+' · '+a.title,subject:'English Language Arts',date:new Date().toISOString().slice(0,10),description:'Saved writing-process evidence and dated checkpoints. California: '+a.standards.join(', '),link:'ela.html?id='+a.id});S.write(window.PORTAL.recordKey,rec);}}catch(error){status('Work checkpoint saved. Portal summary could not update: '+error.message);return;}}
  render();status(a.independent?(state.stage===4?'All four stages preserved.':'Stage preserved. Continue when ready.'):'Checkpoint preserved; assignment marked complete.');
 }
 window.addEventListener('storage',event=>{if(event.key===S.prefix+a.id){status('This assignment changed in another tab. Download your work and reload before continuing.');document.querySelectorAll('textarea,button,input').forEach(el=>{if(el.id!=='export-work')el.disabled=true;});}});
 render();
})();
