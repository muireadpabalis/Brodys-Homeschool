/* Extend existing assignment rendering, including the ELA bridge. */
(() => {
 'use strict';
 const S=window.HistoryStore,C=S.C;let changed=false;
 try{
  for(const s of S.lessons())if(!data.assignments.some(a=>a.id===s.id)){data.assignments.push({id:s.id,title:'History '+s.week+'.'+s.id.split('-s')[1]+' · '+s.title,subject:'History–Social Science',due:'',description:C.weeks.find(w=>w.number===s.week).purpose,link:'history-bridge.html?id='+s.id,complete:false,completedDate:'',historyWeek:s.week});changed=true;}
  if(changed)saveData();S.syncPortal();data=JSON.parse(localStorage.getItem(S.recordKey));
  const filter=document.createElement('select');filter.id='historyWeekFilter';filter.setAttribute('aria-label','History week');filter.innerHTML='<option value="all">History: all weeks</option>'+C.weeks.map(w=>`<option value="${w.number}">History week ${w.number}: ${S.esc(w.title)}</option>`).join('');document.querySelector('#assignments .filter-row').append(filter);
  const banner=document.createElement('section');banner.className='panel history-assignment-banner';banner.innerHTML='<h3>History with Dad · Seven-week bridge</h3><p>Weeks 1–2: Massachusetts review and confirmation. Weeks 3–6: India, China, Greece, and new instruction in Rome. Week 7: the fall and transformation of the Roman world.</p><div class="actions"><a href="history-bridge.html">Open the History course</a><a href="parent.html#history-parent">Sean’s lesson guides and evidence records</a></div>';
  document.querySelector('#assignments .filter-row').before(banner);
  const previous=renderAssignments;
  renderAssignments=function(){
   const historySubject=['History–Social Science','Social Studies'].includes(subjectFilter.value),ela=document.getElementById('elaWeekFilter');
   if(historySubject&&ela)ela.value='all';
   if(subjectFilter.value==='English Language Arts')filter.value='all';
   previous();banner.hidden=!(subjectFilter.value==='all'||historySubject);filter.hidden=!banner.hidden?false:true;
   if(ela&&ela.value!=='all')return;
   const filtered=data.assignments.filter(a=>(subjectFilter.value==='all'||a.subject===subjectFilter.value)&&(statusFilter.value==='all'||(statusFilter.value==='complete'&&a.complete)||(statusFilter.value==='open'&&!a.complete)));
   [...assignmentList.children].forEach((card,i)=>{const a=filtered[i];if(!a)return;if(filter.value!=='all'&&a.historyWeek!==Number(filter.value)){card.remove();return;}if(!a.historyWeek)return;card.dataset.historyId=a.id;const s=S.lessons().find(x=>x.id===a.id),meta=document.createElement('p');meta.className='meta';meta.textContent='Week '+s.week+' · About '+s.minutes+' minutes · '+s.mode.replaceAll('-',' ')+' · Demonstration saved separately from parent evaluation';card.querySelector('h3').after(meta);card.querySelectorAll('.actions button').forEach(b=>b.remove());const link=card.querySelector('.actions a');if(link){link.textContent='Open History lesson';link.removeAttribute('target');}});
   if(!assignmentList.children.length)assignmentList.innerHTML='<p class="empty">No assignments match these filters.</p>';
  };
  filter.onchange=()=>{if(filter.value!=='all'){subjectFilter.value='History–Social Science';const ela=document.getElementById('elaWeekFilter');if(ela)ela.value='all';}renderAssignments();};
  const ela=document.getElementById('elaWeekFilter');if(ela)ela.addEventListener('change',()=>{if(ela.value!=='all')filter.value='all';renderAssignments();});
  subjectFilter.onchange=()=>{filter.value='all';renderAssignments();};statusFilter.onchange=renderAssignments;
  const report=document.createElement('article');report.className='panel';report.innerHTML='<h3>History bridge summary</h3><p>Sean’s instruction, Massachusetts review, California sequencing gaps, and independent demonstrations across seven weeks.</p><a href="parent.html#history-parent">Open History teaching records</a>';document.querySelector('#reports .report-grid').append(report);
  renderAll();if(location.hash==='#history'){setView('assignments');subjectFilter.value='History–Social Science';renderAssignments();}
 }catch(error){const message=document.createElement('p');message.className='history-alert';message.setAttribute('role','alert');message.textContent='History bridge needs attention: '+error.message;document.getElementById('assignments').prepend(message);}
})();
