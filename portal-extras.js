/* Additive integrations. Existing school-record storage keys and record IDs stay intact. */
(() => {
 const cfg=window.PORTAL,prefix=cfg.student.toLowerCase();
 const specs=[['ela','reading','ELA / Reading','English Language Arts'],['writing','writing','Writing / Language','English Language Arts'],['science','science','Science','Science'],['social','history','History–Social Science / Geography',cfg.student==='Brody'?'Social Studies':'History–Social Science']];
 let changed=false;
 for(const [id,subject,title,course] of specs){
  const link='diagnostic.html?subject='+subject;
  let a=data.assessments.find(a=>a.id===id);
  if(!a){a={id,title:title+' Baseline',subject:course,date:'',score:'',notes:'',status:'Not started',link};data.assessments.push(a);changed=true;}
  if(!a.link){a.link=link;changed=true;}
  if(id==='ela'&&/Reading.*Writing|ELA Exit/.test(a.title)){a.title='ELA / Reading Baseline';changed=true;}
  let task=data.assignments.find(a=>a.diagnosticId===subject)||data.assignments.find(a=>a.subject===course&&/Diagnostic|Baseline/.test(a.title)&&!a.diagnosticId);
  if(subject==='writing'&&task?.diagnosticId!=='writing')task=null;
  if(!task){task={id:'baseline2026-'+subject,title:title+' Baseline',subject:course,due:'',description:'Diagnostic baseline with separate readiness probes. Breaks are welcome.',link,complete:false,completedDate:'',diagnosticId:subject};data.assignments.push(task);changed=true;}
  if(!task.link){task.link=link;changed=true;}
  if(!task.diagnosticId){task.diagnosticId=subject;changed=true;}
  try{const attempt=JSON.parse(localStorage.getItem(prefix+'Baseline2026_'+subject)||'null');if(attempt){const status=attempt.submittedAt?'Complete':'In progress';if(a.status!==status){a.status=status;changed=true;}if(attempt.submittedAt){a.score='Parent report available';task.complete=true;task.completedDate=attempt.submittedAt.slice(0,10);changed=true;}}}catch(e){}
 }
 try{const m=JSON.parse(localStorage.getItem(cfg.student==='Brody'?'brodyMathDiagnosticV1':'rory_math_baseline_v1')||'null');if(m){const a=data.assessments.find(a=>a.id==='math');if(a){const status=m.submittedAt||m.submitted?'Complete':'In progress';if(a.status!==status){a.status=status;changed=true;}}}}catch(e){}
 if(changed)saveData();else renderAll();
 const panel=document.createElement('article');panel.className='panel';panel.innerHTML='<h3>Parent diagnostics & instructional bridge</h3><p>Review domain findings, writing samples, prior-instruction evidence, and California transition priorities.</p><a class="button" href="parent.html">Open parent reports</a>';
 document.querySelector('#reports .report-grid').append(panel);
 const fullBackup=()=>{
  const attempts={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith(prefix+'Baseline2026_')||k===(cfg.student==='Brody'?'brodyMathDiagnosticV1':'rory_math_baseline_v1')){try{attempts[k]=JSON.parse(localStorage.getItem(k));}catch(e){attempts[k]={unparsedRaw:localStorage.getItem(k)};}}}
  let parentReview=null;try{parentReview=JSON.parse(localStorage.getItem(prefix+'ParentReview2026')||'null')}catch(e){}
  return {schemaVersion:2,student:cfg.student,exportedAt:new Date().toISOString(),record:data,attempts,parentReview};
 };
 exportJsonBtn.onclick=()=>download(prefix+'-complete-homeschool-record.json',JSON.stringify(fullBackup(),null,2),'application/json');
 window.addEventListener('storage',e=>{if(e.key===cfg.recordKey||e.key?.startsWith(prefix+'Baseline2026_'))location.reload();});
})();
