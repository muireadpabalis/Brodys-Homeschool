/* Add the seven Reading modules without changing the completed Reading baseline. */
(() => {
 'use strict';
 const S=window.ReadingStore,C=S.C;let changed=false;
 try{
  for(const w of C.weeks){
   let task=data.assignments.find(a=>a.id===w.id);
   if(!task){task={id:w.id,title:'Reading Week '+w.number+' · '+w.title,subject:'English Language Arts',due:'',description:w.skills.join(' · '),link:'reading.html?id='+w.id,complete:false,completedDate:'',readingWeek:w.number};data.assignments.push(task);changed=true;}
   else{
    const expected={title:'Reading Week '+w.number+' · '+w.title,subject:'English Language Arts',description:w.skills.join(' · '),link:'reading.html?id='+w.id,readingWeek:w.number};
    for(const [key,value] of Object.entries(expected))if(task[key]!==value){task[key]=value;changed=true;}
   }
  }
  if(changed)saveData();S.syncPortal();data=JSON.parse(localStorage.getItem(S.recordKey));
  const row=document.querySelector('#assignments .filter-row'),filter=document.createElement('select');filter.id='readingWeekFilter';filter.setAttribute('aria-label','Reading week');filter.innerHTML='<option value="all">Reading: all weeks</option>'+C.weeks.map(w=>`<option value="${w.number}">Reading week ${w.number}: ${S.esc(w.title)}</option>`).join('');row.append(filter);
  const banner=document.createElement('section');banner.className='panel reading-assignment-banner';banner.innerHTML='<h3>Reading Evidence Lab · Seven-week instruction</h3><p>Choose an investigation and follow the evidence: close reading → interpretation → evidence → evaluating evidence → limiting claims → missing evidence → independent investigation.</p><div class="actions"><a href="reading.html">Open all seven Reading weeks</a><a href="parent.html#reading-parent">Parent review and progress</a></div>';row.before(banner);
  const previous=renderAssignments;
  renderAssignments=function(){
   const ela=document.getElementById('elaWeekFilter'),history=document.getElementById('historyWeekFilter');previous();
   const isELA=subjectFilter.value==='English Language Arts',showELA=subjectFilter.value==='all'||isELA;
   filter.hidden=!showELA;banner.hidden=!showELA||ela?.value!=='all';
   const elaBanner=document.querySelector('.ela-assignment-banner');if(elaBanner)elaBanner.hidden=!showELA||filter.value!=='all';
   if(ela?.value!=='all'||history?.value!=='all')return;
   [...assignmentList.querySelectorAll('[data-assignment-id]')].forEach(card=>{
    const task=data.assignments.find(a=>a.id===card.dataset.assignmentId);if(!task)return;
    const w=C.weeks.find(x=>x.id===task.id);if(filter.value!=='all'&&w?.number!==Number(filter.value)){card.remove();return;}if(!w)return;
    card.dataset.readingId=task.id;const meta=document.createElement('p');meta.className='meta';meta.textContent='Week '+w.number+' · '+w.time+' · '+w.skills.join(' · ')+' · reasoning response reviewed by a parent';card.querySelector('h3').after(meta);card.querySelectorAll('.actions button').forEach(button=>button.remove());const link=card.querySelector('.actions a');if(link){link.textContent='Open Reading investigation';link.removeAttribute('target');}
   });
   if(!assignmentList.children.length)assignmentList.innerHTML='<p class="empty">No assignments match these filters.</p>';
  };
  filter.onchange=()=>{if(filter.value!=='all'){subjectFilter.value='English Language Arts';const ela=document.getElementById('elaWeekFilter'),history=document.getElementById('historyWeekFilter');if(ela)ela.value='all';if(history)history.value='all';}renderAssignments();};
  const ela=document.getElementById('elaWeekFilter'),history=document.getElementById('historyWeekFilter');
  if(ela)ela.addEventListener('change',()=>{if(ela.value!=='all'){subjectFilter.value='English Language Arts';filter.value='all';if(history)history.value='all';renderAssignments();}});
  if(history)history.addEventListener('change',()=>{if(history.value!=='all'){filter.value='all';renderAssignments();}});
  subjectFilter.onchange=()=>{filter.value='all';if(ela)ela.value='all';if(history)history.value='all';renderAssignments();};statusFilter.onchange=renderAssignments;
  const report=document.createElement('article');report.className='panel';report.innerHTML='<h3>Reading Evidence Lab</h3><p>Seven separate Grade 7 instructional records with objective practice, written reasoning, parent review, and retained checkpoints.</p><a href="parent.html#reading-parent">Open Reading progress and reviews</a>';document.querySelector('#reports .report-grid').append(report);
  renderAll();if(location.hash==='#reading'){setView('assignments');subjectFilter.value='English Language Arts';filter.value='all';if(ela)ela.value='all';if(history)history.value='all';renderAssignments();}
 }catch(error){const message=document.createElement('p');message.className='reading-note';message.setAttribute('role','alert');message.textContent='Reading course needs attention: '+error.message;document.getElementById('assignments').prepend(message);}
})();
