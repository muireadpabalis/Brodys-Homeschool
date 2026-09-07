/* Reading-course records are additive and never read or write diagnostic storage. */
(() => {
 'use strict';

 const C=window.READING_COURSE;
 const prefix='brodyReadingCourse2026_';
 const parentKey='brodyReadingParent2026';
 const recordKey='brodyHomeschoolRecordV1';
 const assistanceValues=['Independent','Quick clarification','Discussed with a parent'];
 const reviewStatuses=['','Reasonable evidence-supported response','Revisit together'];
 const reviewAssistance=['','Independent','Minimal reminder','Discussed together','Substantial guidance'];
 const read=(key,fallback=null)=>{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw);};
 const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
 const isoDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)&&new Date(value).toISOString()===value;
 const calendarDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value+'T00:00:00.000Z').toISOString().slice(0,10)===value;
 const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
 const weeks=()=>C.weeks;
 const week=id=>weeks().find(item=>item.id===id);
 const sameArray=(a,b)=>Array.isArray(a)&&a.length===b.length&&a.every((value,index)=>value===b[index]);

 function topic(w,id){return w.choices.find(choice=>choice.id===id);}
 function questionIndex(w){
  const result=new Map();
  for(const choice of w.choices)for(const question of choice.objectives)result.set(question.id,{choice,question});
  return result;
 }
 function responseIndex(w){
  const result=new Map();
  for(const choice of w.choices)for(const response of choice.responses)result.set(response.id,{choice,response});
  return result;
 }
 function answerComplete(question,value){
  if(question.type==='single')return typeof value==='string'&&value!=='';
  if(!Array.isArray(value)||value.length===0)return false;
  if(question.type==='order')return value.length===question.correct.length&&value.every(Boolean)&&new Set(value).size===value.length;
  return question.selectionCount?value.length===question.selectionCount:true;
 }
 function answerMatches(question,value){
  if(question.type==='single')return value===question.correct;
  if(!Array.isArray(value))return false;
  if(question.type==='order')return sameArray(value,question.correct);
  const actual=[...value].sort(),expected=[...question.correct].sort();
  return sameArray(actual,expected);
 }
 function validAnswer(question,value,complete=false){
  const optionIds=new Set(question.options.map(option=>option[0]));
  if(question.type==='single')return typeof value==='string'&&optionIds.has(value);
  if(!Array.isArray(value)||!value.every(item=>typeof item==='string'))return false;
  if(question.type==='order'){
   if(value.length!==question.correct.length||!value.every(item=>item===''||optionIds.has(item)))return false;
   return !complete||answerComplete(question,value);
  }
  if(!value.every(item=>optionIds.has(item))||new Set(value).size!==value.length)return false;
  return !complete||answerComplete(question,value);
 }
 function score(choice,responses){return {correct:choice.objectives.filter(question=>answerMatches(question,responses[question.id])).length,total:choice.objectives.length};}
 function exactKeys(value,ids){const keys=Object.keys(value);return keys.length===ids.length&&keys.every(key=>ids.includes(key));}
 function validateObjectiveResponses(value,w,choice=null,complete=false){
  if(!object(value))return false;
  const index=questionIndex(w);
  if(choice){
   const ids=choice.objectives.map(question=>question.id);
   if(!exactKeys(value,ids))return false;
  }
  return Object.entries(value).every(([id,response])=>index.has(id)&&(!choice||index.get(id).choice.id===choice.id)&&validAnswer(index.get(id).question,response,complete));
 }
 function validateWrittenResponses(value,w,choice=null,complete=false){
  if(!object(value))return false;
  const index=responseIndex(w);
  if(choice){
   const ids=choice.responses.map(response=>response.id);
   if(!exactKeys(value,ids))return false;
  }
  return Object.entries(value).every(([id,response])=>index.has(id)&&(!choice||index.get(id).choice.id===choice.id)&&typeof response==='string'&&(!complete||response.trim()!==''));
 }
 function validateResult(result,choice,responses){
  const expected=score(choice,responses);
  return object(result)&&Number.isInteger(result.correct)&&Number.isInteger(result.total)&&result.correct===expected.correct&&result.total===expected.total;
 }
 function validateCheck(check,w,responses,activeTopicId){
  if(check===null)return true;
  const choice=topic(w,check?.topicId);
  return !!choice&&check.topicId===activeTopicId&&isoDate(check.checkedAt)&&choice.objectives.every(question=>answerComplete(question,responses[question.id]))&&validateResult(check,choice,responses);
 }
 function latestSnapshot(value){
  if(!value||!Array.isArray(value.snapshots))return null;
  const matching=value.topicId?value.snapshots.filter(snapshot=>snapshot.topicId===value.topicId):value.snapshots;
  return matching.length?matching[matching.length-1]:null;
 }

 function blank(id){return {schemaVersion:1,courseVersion:C.version,moduleId:id,topicId:null,objectiveResponses:{},writtenResponses:{},objectiveCheck:null,assistance:'Independent',snapshots:[],complete:false,startedAt:null,updatedAt:null,completedAt:null};}
 function validateWork(value,id){
  const w=week(id);
  if(!w)throw Error('Unknown Reading module.');
  const topicIds=new Set(w.choices.map(choice=>choice.id));
  if(!object(value)||value.schemaVersion!==1||value.courseVersion!==C.version||value.moduleId!==id||
    (value.topicId!==null&&!topicIds.has(value.topicId))||!validateObjectiveResponses(value.objectiveResponses,w)||
    !validateWrittenResponses(value.writtenResponses,w)||!assistanceValues.includes(value.assistance)||
    !Array.isArray(value.snapshots)||typeof value.complete!=='boolean'||
    (value.startedAt!==null&&!isoDate(value.startedAt))||(value.updatedAt!==null&&!isoDate(value.updatedAt))||
    (value.completedAt!==null&&!isoDate(value.completedAt))||
    ((!value.topicId)&&(Object.keys(value.objectiveResponses).length||Object.keys(value.writtenResponses).length||value.objectiveCheck!==null||value.snapshots.length||value.complete))||
    (value.complete!==!!value.snapshots.length)||(value.complete!==!!value.completedAt)||
    !validateCheck(value.objectiveCheck,w,value.objectiveResponses,value.topicId)){
   throw Error('Reading work has an unsupported format. Existing data was preserved.');
  }

  const snapshotIds=new Set();
  let priorTime=-Infinity;
  for(const snapshot of value.snapshots){
   const choice=topic(w,snapshot?.topicId),at=isoDate(snapshot?.at)?Date.parse(snapshot.at):NaN;
   if(!object(snapshot)||typeof snapshot.id!=='string'||!snapshot.id||snapshotIds.has(snapshot.id)||!Number.isFinite(at)||at<priorTime||!choice||
     snapshot.topicId!==value.topicId||!validateObjectiveResponses(snapshot.objectiveResponses,w,choice,true)||!validateWrittenResponses(snapshot.writtenResponses,w,choice,true)||
     !sameArray(snapshot.skills,w.skills)||!validateResult(snapshot.objectiveResult,choice,snapshot.objectiveResponses)||
     !assistanceValues.includes(snapshot.assistance))throw Error('Invalid Reading checkpoint. Existing data was preserved.');
   snapshotIds.add(snapshot.id);priorTime=at;
  }
  if(value.complete&&!latestSnapshot(value))throw Error('Completed Reading work must retain a checkpoint for its selected topic.');
  return value;
 }
 function work(id){return validateWork(read(prefix+id,blank(id)),id);}
 function save(id,update){
  const value=work(id),before=JSON.stringify(value.snapshots);
  update(value);
  if(value.snapshots.length<JSON.parse(before).length||JSON.stringify(value.snapshots.slice(0,JSON.parse(before).length))!==before)throw Error('Saved Reading checkpoints are immutable.');
  const now=new Date().toISOString();value.startedAt??=now;value.updatedAt=now;validateWork(value,id);write(prefix+id,value);return value;
 }
 function evidence(){
  const result={};
  for(const w of weeks()){const value=read(prefix+w.id);if(value!==null)result[w.id]=validateWork(value,w.id);}
  return result;
 }

 function validateParent(value){
  if(!object(value)||value.schemaVersion!==1||value.courseVersion!==C.version||!object(value.reviews))throw Error('Reading parent records need recovery; nothing was overwritten.');
  const ids=new Set(weeks().map(w=>w.id)),rubricIds=C.rubric.map(item=>item.id);
  for(const [id,review] of Object.entries(value.reviews)){
   if(!ids.has(id)||!object(review)||typeof review.snapshotId!=='string'||!review.snapshotId||!object(review.rubric)||
     !exactKeys(review.rubric,rubricIds)||!Object.values(review.rubric).every(value=>['','0','1','2'].includes(String(value)))||
     !reviewStatuses.includes(review.status)||!reviewAssistance.includes(review.assistance)||typeof review.comments!=='string'||
     !(review.date===''||calendarDate(review.date))||!isoDate(review.updatedAt))throw Error('Invalid Reading parent review. Existing data was preserved.');
  }
  return value;
 }
 function validateParentReferences(value,works){
  for(const [id,review] of Object.entries(value.reviews)){
   const record=works[id];
   if(!record||!record.snapshots.some(snapshot=>snapshot.id===review.snapshotId))throw Error('A Reading parent review does not match a retained evidence checkpoint. Existing data was preserved.');
  }
  return value;
 }
 const parent=()=>validateParent(read(parentKey,{schemaVersion:1,courseVersion:C.version,reviews:{}}));
 function saveParent(id,review){
  const record=work(id),latest=latestSnapshot(record);
  if(!latest)throw Error('Brody needs to save an evidence checkpoint before parent review.');
  if(review.snapshotId!==latest.id)throw Error('A newer checkpoint is available for this Reading week. Refresh before saving this review.');
  const value=parent();
  value.reviews[id]={...review,updatedAt:new Date().toISOString()};
  validateParentReferences(validateParent(value),{...evidence(),[id]:record});
  write(parentKey,value);return value;
 }
 const download=(name,value,type='application/json')=>{const body=typeof value==='string'?value:JSON.stringify(value,null,2),url=URL.createObjectURL(new Blob([body],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 function backup(includeParent=false){
  const moduleRecords=evidence(),result={schemaVersion:1,student:C.student,courseVersion:C.version,moduleRecords};
  if(includeParent)result.parentReview=validateParentReferences(parent(),moduleRecords);
  return result;
 }

 function mergeWork(incoming,current,id){
  if(!current)return incoming;
  if(incoming.complete&&current.complete&&incoming.topicId!==current.topicId)throw Error('Completed Reading records use different topic choices. Existing data was preserved.');
  const snapshots=current.snapshots.slice(),known=new Map(snapshots.map(snapshot=>[snapshot.id,snapshot]));
  for(const snapshot of incoming.snapshots){
   if(known.has(snapshot.id)){
    if(JSON.stringify(known.get(snapshot.id))!==JSON.stringify(snapshot))throw Error('Conflicting Reading checkpoint IDs were found. Existing data was preserved.');
   }else{snapshots.push(snapshot);known.set(snapshot.id,snapshot);}
  }
  snapshots.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
  const objectiveResponses={...incoming.objectiveResponses,...current.objectiveResponses};
  const writtenResponses={...incoming.writtenResponses,...current.writtenResponses};
  const completedSource=current.complete?current:incoming.complete?incoming:null;
  const activeSource=completedSource||(current.topicId?current:incoming);
  const topicId=activeSource?.topicId||null;
  const activeChoice=topicId?topic(week(id),topicId):null;
  const currentTouchesTopic=!!activeChoice&&(current.topicId===topicId||activeChoice.objectives.some(question=>own(current.objectiveResponses,question.id))||activeChoice.responses.some(response=>own(current.writtenResponses,response.id)));
  let objectiveCheck=currentTouchesTopic?current.objectiveCheck:incoming.objectiveCheck;
  if(objectiveCheck&&!validateCheck(objectiveCheck,week(id),objectiveResponses,topicId))objectiveCheck=null;
  return validateWork({...incoming,...current,topicId,objectiveResponses,writtenResponses,objectiveCheck,snapshots,complete:!!completedSource,completedAt:completedSource?.completedAt||null,startedAt:current.startedAt||incoming.startedAt,updatedAt:current.updatedAt||incoming.updatedAt},id);
 }
 function restorePlan(incoming){
  if(!incoming)return [];
  if(!object(incoming)||incoming.schemaVersion!==1||incoming.student!==C.student||incoming.courseVersion!==C.version||!object(incoming.moduleRecords))throw Error('Choose a supported Brody Reading course export.');
  const ids=new Set(weeks().map(w=>w.id)),plans=[],resolved={};
  for(const [id,value] of Object.entries(incoming.moduleRecords)){
   if(!ids.has(id))throw Error('Unknown Reading module in backup.');
   validateWork(value,id);
   const current=read(prefix+id),merged=mergeWork(value,current===null?null:validateWork(current,id),id);
   resolved[id]=merged;plans.push([prefix+id,merged]);
  }
  if(incoming.parentReview){
   const imported=validateParent(incoming.parentReview),current=parent(),reviews={...imported.reviews};
   for(const [id,value] of Object.entries(current.reviews)){
    const importedReview=reviews[id],finalWork=resolved[id]||(resolved[id]=work(id)),latest=latestSnapshot(finalWork);
    if(!importedReview||value.snapshotId===latest?.id||importedReview.snapshotId!==latest?.id)reviews[id]=value;
   }
   const mergedParent=validateParent({...imported,...current,reviews});
   for(const id of Object.keys(mergedParent.reviews))if(!resolved[id])resolved[id]=work(id);
   validateParentReferences(mergedParent,resolved);plans.push([parentKey,mergedParent]);
  }
  return plans;
 }
 function restore(incoming){
  const plans=restorePlan(incoming),before=plans.map(([key])=>[key,localStorage.getItem(key)]);
  try{for(const [key,value] of plans)write(key,value);}catch(error){for(const [key,value] of before){try{value===null?localStorage.removeItem(key):localStorage.setItem(key,value);}catch(rollbackError){}}throw error;}
 }
 function syncPortal(){
  const record=read(recordKey);if(!record)return;
  if(!['assignments','assessments','logs','portfolio'].every(key=>Array.isArray(record[key])))throw Error('The school record needs recovery. Reading work was kept separately.');
  const works=evidence();let changed=false;
  for(const w of weeks()){
   const value=works[w.id];if(!value?.complete)continue;
   const task=record.assignments.find(item=>item.id===w.id);
   if(task&&!task.complete){task.complete=true;task.completedDate=value.completedAt.slice(0,10);changed=true;}
   if(w.portfolio&&!record.portfolio.some(item=>item.id===w.id)){
    record.portfolio.push({id:w.id,title:'Reading Week '+w.number+' · '+w.title,subject:'English Language Arts',date:value.completedAt.slice(0,10),description:'Portfolio-ready Reading Evidence Lab checkpoint. Skills: '+w.skills.join(', ')+'. Completion records submitted work, not a grade.',link:'reading.html?id='+w.id});changed=true;
   }
  }
  if(changed)write(recordKey,record);
 }

 window.ReadingStore={C,prefix,parentKey,recordKey,assistanceValues,read,write,esc,weeks,week,blank,validateWork,work,save,evidence,parent,saveParent,latestSnapshot,download,backup,restorePlan,restore,syncPortal};
})();
