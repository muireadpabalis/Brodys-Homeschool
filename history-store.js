/* History bridge records are additive and separate from locked diagnostics. */
(() => {
 'use strict';
 const C=window.HISTORY_COURSE, prefix='brodyHistoryBridge2026_', parentKey='brodyHistoryParent2026', recordKey='brodyHomeschoolRecordV1';
 const lessons=()=>C.weeks.flatMap(w=>w.sessions.map(s=>({...s,week:w.number,standards:w.standards})));
 const read=(key,fallback=null)=>{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw);};
 const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fields=['video','watchNotes','discuss','locate','connect','analyze','demonstrate','artifact','responseMode','assistance'];
 const blank=()=>({schemaVersion:1,fields:{},snapshots:[],complete:false,updatedAt:null});
 function validateWork(v){
  const date=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
  const validFields=value=>value&&typeof value==='object'&&!Array.isArray(value)&&Object.entries(value).every(([k,x])=>fields.includes(k)&&typeof x==='string');
  if(!v||v.schemaVersion!==1||!validFields(v.fields)||!Array.isArray(v.snapshots)||typeof v.complete!=='boolean'||(v.updatedAt!==null&&!date(v.updatedAt))||(v.complete&&(!date(v.updatedAt)||!v.snapshots.length)))throw Error('History work has an unsupported format. Existing data was preserved.');
  const ids=new Set();for(const s of v.snapshots){if(!s||typeof s.id!=='string'||!s.id||ids.has(s.id)||!date(s.at)||!validFields(s.fields))throw Error('Invalid history checkpoint.');ids.add(s.id);}
  v.snapshots.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));return v;
 }
 function work(id){if(!lessons().some(x=>x.id===id))throw Error('Unknown History lesson.');return validateWork(read(prefix+id,blank()));}
 function save(id,update){const v=work(id);update(v);v.updatedAt=new Date().toISOString();validateWork(v);write(prefix+id,v);return v;}
 const evidence=()=>Object.fromEntries(lessons().map(s=>[s.id,read(prefix+s.id)]).filter(([,v])=>v).map(([id,v])=>[id,validateWork(v)]));
 function parent(){const p=read(parentKey,{schemaVersion:1,lessons:{},weeks:{},summary:{}});if(!p||p.schemaVersion!==1||!p.lessons||!p.weeks||!p.summary)throw Error('History parent records need recovery; nothing was overwritten.');return p;}
 const download=(name,value,type='application/json')=>{const blob=new Blob([typeof value==='string'?value:JSON.stringify(value,null,2)],{type});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 function backup(includeParent=false){return {schemaVersion:1,courseVersion:C.version,lessonRecords:evidence(),...(includeParent?{parentReview:parent()}: {})};}
 function restorePlan(incoming){
  if(!incoming)return [];
  if(incoming.schemaVersion!==1||incoming.courseVersion!==C.version||!incoming.lessonRecords||Array.isArray(incoming.lessonRecords))throw Error('Choose a supported History bridge export.');
  const valid=new Set(lessons().map(x=>x.id)),plans=[];
  for(const [id,v] of Object.entries(incoming.lessonRecords)){
   if(!valid.has(id))throw Error('Unknown History lesson in backup.');validateWork(v);
   const current=read(prefix+id);if(!current){plans.push([prefix+id,v]);continue;}validateWork(current);
   const ids=new Set(current.snapshots.map(s=>s.id)),snapshots=current.snapshots.slice();for(const s of v.snapshots)if(!ids.has(s.id)){snapshots.push(s);ids.add(s.id);}
   snapshots.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));plans.push([prefix+id,{...v,...current,fields:{...v.fields,...current.fields},snapshots}]);
  }
  if(incoming.parentReview){
   const p=incoming.parentReview,object=x=>x&&typeof x==='object'&&!Array.isArray(x);
   if(p.schemaVersion!==1||!object(p.lessons)||!object(p.weeks)||!object(p.summary)||(p.drafts&&!object(p.drafts)))throw Error('Invalid History parent review.');
   for(const [id,r]of Object.entries(p.lessons)){if(!valid.has(id)||!object(r))throw Error('Invalid History lesson review.');if(r.observations&&!Array.isArray(r.observations))throw Error('Invalid teaching observations.');for(const o of r.observations||[])if(!o||typeof o.id!=='string'||typeof o.at!=='string'||!Number.isFinite(Date.parse(o.at)))throw Error('Invalid dated teaching observation.');}
   for(const [id,r]of Object.entries(p.weeks))if(!/^w[1-7]-c\d+$/.test(id)||!object(r))throw Error('Invalid History weekly review.');
   for(const [id,value]of Object.entries(p.summary))if(!/^section([1-9]|10)$/.test(id)||typeof value!=='string')throw Error('Invalid History summary note.');
   const current=parent();
   const mergeRecords=(incoming,current)=>Object.fromEntries([...new Set([...Object.keys(incoming),...Object.keys(current)])].map(id=>{const merged={...incoming[id],...current[id]};if(incoming[id]?.observations||current[id]?.observations){const observations=new Map((incoming[id]?.observations||[]).map(x=>[x.id,x]));for(const x of current[id]?.observations||[])observations.set(x.id,x);merged.observations=[...observations.values()].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));}return [id,merged];}));
   plans.push([parentKey,{...p,...current,lessons:mergeRecords(p.lessons,current.lessons),weeks:mergeRecords(p.weeks,current.weeks),summary:{...p.summary,...current.summary},drafts:mergeRecords(p.drafts||{},current.drafts||{})}]);
  }
  return plans;
 }
 function restore(incoming){const plans=restorePlan(incoming),before=plans.map(([k])=>[k,localStorage.getItem(k)]);try{plans.forEach(([k,v])=>write(k,v));}catch(error){for(const [k,v]of before){try{v===null?localStorage.removeItem(k):localStorage.setItem(k,v);}catch(e){}}throw error;}}
 function syncPortal(){
  const record=read(recordKey);if(!record)return;
  if(!['assignments','assessments','logs','portfolio'].every(k=>Array.isArray(record[k])))throw Error('The school record needs recovery. History work was kept separate.');
  const works=evidence();let changed=false;
  for(const s of lessons()){
   const v=works[s.id];if(!v?.complete)continue;
   const task=record.assignments.find(x=>x.id===s.id);if(task&&!task.complete){task.complete=true;task.completedDate=v.updatedAt.slice(0,10);changed=true;}
   if(!record.portfolio.some(x=>x.id===s.id)){record.portfolio.push({id:s.id,title:'History Week '+s.week+' · '+s.title,subject:'History–Social Science',date:v.updatedAt.slice(0,10),description:'Saved learning demonstration and dated checkpoints; completion is not a mastery grade. Standards: '+s.standards.map(x=>x.code).join(', '),link:'history-bridge.html?id='+s.id});changed=true;}
  }
  if(changed)write(recordKey,record);
 }
 window.HistoryStore={C,prefix,parentKey,recordKey,fields,lessons,read,write,esc,work,save,evidence,parent,download,backup,restorePlan,restore,syncPortal};
})();
