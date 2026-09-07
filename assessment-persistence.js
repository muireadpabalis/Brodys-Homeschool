/* Non-destructive assessment persistence and recovery for this homeschool portal. */
(() => {
 'use strict';
 const cfg=window.PORTAL||{student:'Rory'},prefix=cfg.student.toLowerCase();
 const recoveryKey=prefix+'AssessmentRecovery2026V1';
 const legacyKey=prefix==='rory'?'roryHomeschoolCompleteV2':prefix+'HomeschoolCompleteV2';
 const currentKeys=[...['reading','writing','science','history'].map(s=>prefix+'Baseline2026_'+s),prefix==='rory'?'rory_math_baseline_v1':prefix+'MathDiagnosticV1'];
 const currentSet=new Set(currentKeys),issues=[],MAX_CURRENT_HISTORY=12;
 const legacyLabels={math:'Math Baseline',reading:'Reading Baseline',language:'Language & Grammar Baseline',science:'Science Baseline',social:'Social Studies Baseline',studytech:'Study Skills & Technology',writing:'Writing Baseline',oral:'Speaking & Listening Check'};
 const object=v=>v&&typeof v==='object'&&!Array.isArray(v);
 const clone=v=>structuredClone(v);
 const empty=()=>({schemaVersion:1,student:cfg.student,updatedAt:null,currentAttempts:{},currentHistory:{},importedCurrent:{},legacyContainers:{},legacyImports:{},malformed:{}});
 const validVault=v=>object(v)&&v.schemaVersion===1&&v.student===cfg.student&&object(v.currentAttempts)&&object(v.legacyContainers)&&object(v.legacyImports)&&object(v.malformed);
 const parseObject=raw=>{const value=JSON.parse(raw);if(!object(value))throw Error('not an object');return value;};
 const count=v=>object(v?.answers)?Object.keys(v.answers).length:object(v?.responses)?Object.keys(v.responses).length:0;
 const hash=text=>{let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16).padStart(8,'0')+'-'+text.length;};
 let vault=empty(),vaultWritable=true,corruptRecoveryRaw=null,lastStatus={primarySaved:false,recoverySaved:false,protected:false,recoveredView:false};

 try{
  const raw=localStorage.getItem(recoveryKey);
  if(raw!==null){const parsed=JSON.parse(raw);if(!validVault(parsed))throw Error('unsupported recovery format');vault={...empty(),...parsed,currentHistory:object(parsed.currentHistory)?parsed.currentHistory:{},importedCurrent:object(parsed.importedCurrent)?parsed.importedCurrent:{}};}
 }catch(error){corruptRecoveryRaw=localStorage.getItem(recoveryKey);vaultWritable=false;issues.push('The assessment recovery archive needs parent attention. Current assessment keys were left untouched.');}

 function attemptRank(entry){const value=entry?.value||{};return [submitted(value)?1:0,Number(value._revision||0),Date.parse(value.updatedAt||entry?.capturedAt||value.submittedAt||value.startedAt||0)||0];}
 function chooseAttempt(a,b){if(!object(a))return object(b)?clone(b):null;if(!object(b))return clone(a);const ar=attemptRank(a),br=attemptRank(b);for(let i=0;i<ar.length;i++){if(ar[i]!==br[i])return clone(ar[i]>br[i]?a:b);}return clone(b);}
 function mergeNested(a,b){const result={};for(const key of new Set([...Object.keys(object(a)?a:{}),...Object.keys(object(b)?b:{})]))result[key]={...(object(a?.[key])?a[key]:{}),...(object(b?.[key])?b[key]:{})};return result;}
 function mergeVaults(disk,local){
  const merged={...empty(),...disk,...local};
  merged.currentAttempts={};for(const key of new Set([...Object.keys(disk.currentAttempts||{}),...Object.keys(local.currentAttempts||{})])){const selected=chooseAttempt(disk.currentAttempts?.[key],local.currentAttempts?.[key]);if(selected)merged.currentAttempts[key]=selected;}
  merged.currentHistory=mergeNested(disk.currentHistory,local.currentHistory);merged.importedCurrent=mergeNested(disk.importedCurrent,local.importedCurrent);
  merged.legacyContainers={...(disk.legacyContainers||{}),...(local.legacyContainers||{})};merged.legacyImports={...(disk.legacyImports||{}),...(local.legacyImports||{})};merged.malformed=mergeNested(disk.malformed,local.malformed);
  return merged;
 }
 function trimHistory(key){const list=vault.currentHistory?.[key];if(!object(list))return false;const entries=Object.entries(list);if(entries.length<=MAX_CURRENT_HISTORY)return false;entries.sort(([,a],[,b])=>(Date.parse(a?.capturedAt||0)||0)-(Date.parse(b?.capturedAt||0)||0));for(const [id] of entries.slice(0,entries.length-MAX_CURRENT_HISTORY))delete list[id];return true;}
 function trimAllHistory(){let changed=false;for(const key of Object.keys(vault.currentHistory||{}))changed=trimHistory(key)||changed;return changed;}
 function saveVault(){
  if(!vaultWritable)return false;
  try{const diskRaw=localStorage.getItem(recoveryKey);if(diskRaw!==null){const disk=JSON.parse(diskRaw);if(!validVault(disk))throw Error('unsupported recovery format');vault=mergeVaults({...empty(),...disk},vault);}trimAllHistory();vault.updatedAt=new Date().toISOString();const raw=JSON.stringify(vault);localStorage.setItem(recoveryKey,raw);if(localStorage.getItem(recoveryKey)!==raw)throw Error('verification failed');return true;}
  catch(error){vaultWritable=false;issues.push('A recovery copy could not be saved. Export the complete record from the parent area.');return false;}
 }
 function addRaw(group,key,raw,source){
  if(!vaultWritable||typeof raw!=='string')return false;
  const id=hash(raw);vault[group][key]??={};
  if(vault[group][key][id])return false;
  vault[group][key][id]={id,raw,source,capturedAt:new Date().toISOString()};return true;
 }
 function rememberMalformed(key,raw){return addRaw('malformed',key,raw,'Malformed primary value');}
 function archivedValue(key){
  const entry=vault.currentAttempts[key];
  if(object(entry?.value))return entry.value;
  if(typeof entry?.raw==='string'){try{return parseObject(entry.raw);}catch(error){return null;}}
  return null;
 }
 function captureCurrent(key,value,source='Current assessment key'){
  if(!currentSet.has(key)||!object(value)||!vaultWritable)return false;
  const raw=JSON.stringify(value),changed=addRaw('currentHistory',key,raw,source);trimHistory(key);
  vault.currentAttempts[key]={value:clone(value),capturedAt:new Date().toISOString(),source};return changed||true;
 }
 function readPrimary(key){
  const raw=localStorage.getItem(key);if(raw===null)return {raw:null,value:null,malformed:false};
  try{return {raw,value:parseObject(raw),malformed:false};}
  catch(error){const changed=rememberMalformed(key,raw);if(changed)saveVault();issues.push('A saved assessment record needs parent recovery. Its original text was preserved when storage allowed.');return {raw,value:null,malformed:true};}
 }
 function read(key){
  if(!currentSet.has(key))throw Error('Unknown assessment storage key.');
  const primary=readPrimary(key);lastStatus={primarySaved:false,recoverySaved:false,protected:false,recoveredView:false};
  if(primary.value){captureCurrent(key,primary.value);lastStatus.recoverySaved=saveVault();return clone(primary.value);}
  if(primary.malformed){const archived=archivedValue(key);if(archived){lastStatus.recoveredView=true;return clone(archived);}throw Error('The primary assessment record is malformed and has not been overwritten.');}
  const archived=archivedValue(key);if(archived){lastStatus.recoveredView=true;issues.push('A recovery copy is available because the main assessment key is missing. It will not replace the main key until a validated save.');return clone(archived);}
  return null;
 }
 function sameIdentity(a,b){
  if(!object(a)||!object(b))return false;
  for(const field of ['student','subject','version','itemVersion'])if(a[field]!=null&&b[field]!=null&&a[field]!==b[field])return false;
  return true;
 }
 function submitted(v){return !!(v?.submittedAt||v?.submitted);}
 function write(key,value){
  if(!currentSet.has(key)||!object(value))throw Error('Unsupported assessment record.');
  const primary=readPrimary(key);lastStatus={primarySaved:false,recoverySaved:false,protected:false,recoveredView:false};
  if(primary.malformed){if(!vaultWritable||!saveVault())throw Error('The existing assessment text could not be archived, so it was not overwritten.');throw Error('The existing assessment record needs parent recovery and was not overwritten.');}
  if(primary.value&&!sameIdentity(primary.value,value))throw Error('The saved assessment belongs to a different student, subject, or version and was not overwritten.');
  if(primary.value&&submitted(primary.value)){
   if(JSON.stringify(primary.value)!==JSON.stringify(value))issues.push('A submitted assessment was protected from an older or edited open copy.');
   captureCurrent(key,primary.value);lastStatus.recoverySaved=saveVault();lastStatus.protected=true;return clone(primary.value);
  }
  const currentRevision=Number(primary.value?._revision||0),incomingRevision=Number(value._revision||0);
  if(primary.value&&currentRevision>incomingRevision){issues.push('Newer assessment work in another tab was protected. Reload before continuing.');captureCurrent(key,primary.value);lastStatus.recoverySaved=saveVault();lastStatus.protected=true;return clone(primary.value);}
  const next=clone(value);next._revision=Math.max(currentRevision,incomingRevision)+1;next.updatedAt=new Date().toISOString();
  if(primary.raw!==null)captureCurrent(key,primary.value,'Previous current value');
  captureCurrent(key,next,'Saved current value');lastStatus.recoverySaved=saveVault();
  const raw=JSON.stringify(next);localStorage.setItem(key,raw);if(localStorage.getItem(key)!==raw)throw Error('The assessment save could not be verified.');lastStatus.primarySaved=true;
  return clone(next);
 }
 function inspect(key){
  if(!currentSet.has(key))throw Error('Unknown assessment storage key.');
  const primary=readPrimary(key),archived=archivedValue(key);
  return {exists:primary.raw!==null,value:primary.value||archived||null,recovered:!primary.value&&!!archived,malformed:primary.malformed,primaryValue:primary.value,archivedValue:archived};
 }
 function captureLegacyRaw(raw,source=legacyKey){
  if(typeof raw!=='string'||!vaultWritable)return false;
  const id=hash(raw);if(vault.legacyContainers[id])return false;
  vault.legacyContainers[id]={id,raw,source,capturedAt:new Date().toISOString()};return saveVault();
 }
 function importLegacy(payload,source='Imported earlier portal backup'){
  if(!object(payload))throw Error('Earlier portal backup is not an object.');
  const state=object(payload.state)?payload.state:payload;if(!object(state.assessmentAttempts))throw Error('This file does not contain earlier assessment attempts.');
  if(!vaultWritable)throw Error('The recovery archive must be repaired before importing an earlier backup.');
  const raw=JSON.stringify(payload),id=hash(raw);if(!vault.legacyImports[id])vault.legacyImports[id]={source,capturedAt:new Date().toISOString(),payload:clone(payload)};
  if(!saveVault())throw Error('The earlier attempts could not be archived. No success was recorded.');return id;
 }
 function legacySources(){
  const result=[];
  for(const [key,entry] of Object.entries(vault.legacyContainers||{})){
   if(typeof entry?.raw!=='string')continue;try{result.push({source:entry.source||key,payload:JSON.parse(entry.raw)});}catch(error){}
  }
  for(const entry of Object.values(vault.legacyImports||{}))if(object(entry?.payload))result.push({source:entry.source,payload:entry.payload});return result;
 }
 function legacySummaries(){
  const seen=new Set(),rows=[];
  for(const source of legacySources()){const state=object(source.payload?.state)?source.payload.state:source.payload,attempts=state?.assessmentAttempts;if(!object(attempts))continue;
   for(const [id,attempt] of Object.entries(attempts)){if(!object(attempt))continue;const fingerprint=[id,attempt.startedAt||'',attempt.submittedAt||'',count(attempt)].join('|');if(seen.has(fingerprint))continue;seen.add(fingerprint);rows.push({id,title:legacyLabels[id]||id,startedAt:attempt.startedAt||null,submittedAt:attempt.submittedAt||null,responseCount:count(attempt),source:source.source});}
  }
  return rows.sort((a,b)=>String(a.title).localeCompare(String(b.title)));
 }
 function validateRecovery(source){
  if(!validVault(source))throw Error('Unsupported assessment recovery archive.');
  for(const group of ['currentAttempts','legacyContainers','legacyImports','malformed'])if(!object(source[group]||{}))throw Error('Assessment recovery archive is incomplete.');
 }
 function addImportedCandidate(key,value,source){
  if(!currentSet.has(key)||!object(value)||!vaultWritable)return;
  addRaw('importedCurrent',key,JSON.stringify(value),source);
 }
 function mergeRecovery(incoming){
  if(!incoming)return;const source=incoming.recovery||incoming;validateRecovery(source);
  if(!vaultWritable)throw Error('The local recovery archive needs attention before it can be merged.');
  const before=clone(vault);
  try{
   for(const key of currentKeys){const entry=source.currentAttempts?.[key];if(object(entry?.value))addImportedCandidate(key,entry.value,'Imported recovery candidate');else if(typeof entry?.raw==='string'){try{addImportedCandidate(key,parseObject(entry.raw),'Imported recovery candidate');}catch(error){}}
    const history=source.currentHistory?.[key];if(object(history))for(const item of Object.values(history))if(typeof item?.raw==='string'){try{addImportedCandidate(key,parseObject(item.raw),'Imported recovery history');}catch(error){}}
    const imported=source.importedCurrent?.[key];if(object(imported))for(const item of Object.values(imported))if(typeof item?.raw==='string'){try{addImportedCandidate(key,parseObject(item.raw),'Re-imported recovery candidate');}catch(error){}}
   }
   for(const [key,entry] of Object.entries(source.legacyContainers||{}))if(typeof entry?.raw==='string'){const id=hash(entry.raw);if(!vault.legacyContainers[id])vault.legacyContainers[id]={id,raw:entry.raw,source:entry.source||key,capturedAt:entry.capturedAt||new Date().toISOString()};}
   for(const [id,entry] of Object.entries(source.legacyImports||{}))if(object(entry?.payload)&&!vault.legacyImports[id])vault.legacyImports[id]=clone(entry);
   for(const [key,list] of Object.entries(source.malformed||{})){const items=Array.isArray(list)?list:Object.values(object(list)?list:{});for(const item of items)if(typeof item?.raw==='string')addRaw('malformed',key,item.raw,item.source||'Imported malformed value');}
   if(!saveVault())throw Error('The recovery archive merge could not be verified.');
  }catch(error){vault=before;saveVault();throw error;}
 }
 function archiveImportedAttempt(key,value,source='Imported complete-record backup'){
  if(!currentSet.has(key)||!object(value))throw Error('Unsupported imported assessment candidate.');
  if(!vaultWritable)throw Error('The recovery archive needs attention before importing assessment data.');
  addImportedCandidate(key,value,source);if(!saveVault())throw Error('The imported assessment candidate could not be archived.');
 }
 function exportArchive(){return {recovery:clone(vault),legacyPortalRaw:localStorage.getItem(legacyKey),corruptRecoveryRaw};}
 function status(){return {...lastStatus};}

 if(trimAllHistory())saveVault();
 if(typeof window.addEventListener==='function')window.addEventListener('storage',event=>{if(event.key!==recoveryKey||typeof event.newValue!=='string')return;try{const incoming=JSON.parse(event.newValue);if(validVault(incoming))vault=mergeVaults(incoming,vault);}catch(error){issues.push('A newer recovery archive could not be read. This tab will not overwrite it.');vaultWritable=false;}});
 const legacyRaw=localStorage.getItem(legacyKey);if(legacyRaw!==null)captureLegacyRaw(legacyRaw);
 for(const key of currentKeys){const primary=readPrimary(key);if(primary.value){captureCurrent(key,primary.value);saveVault();}}
 window.AssessmentPersistence={recoveryKey,legacyKey,currentKeys,read,write,inspect,importLegacy,mergeRecovery,archiveImportedAttempt,legacySummaries,exportArchive,status,issues:()=>[...new Set(issues)]};
})();
