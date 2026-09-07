const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('assert');
const root=path.resolve(__dirname,'..'),results=[];
const pass=name=>{results.push(name);console.log('PASS '+name);};
class MemoryStorage{
 constructor(seed={}){this.map=new Map(Object.entries(seed));this.writes=[];this.failAt=0;this.writeCount=0;}
 get length(){return this.map.size;} key(i){return [...this.map.keys()][i]??null;}
 getItem(k){return this.map.has(k)?this.map.get(k):null;}
 setItem(k,v){this.writeCount++;if(this.failAt&&this.writeCount===this.failAt)throw Error('simulated quota failure');this.writes.push(['set',k]);this.map.set(k,String(v));}
 removeItem(k){this.writes.push(['remove',k]);this.map.delete(k);}
}
function runtime(seed={}){
 const localStorage=new MemoryStorage(seed),window={},document={getElementById:()=>null};
 const context=vm.createContext({window,localStorage,structuredClone,Blob,URL,Date,console,setTimeout,clearTimeout,document});
 for(const file of ['reading-course.js','reading-store.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 return {window,localStorage,C:window.READING_COURSE,S:window.ReadingStore,context};
}
function sha(file){return crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex').toUpperCase();}
function fillComplete(S,w,topic=w.choices[0],snapshotId='snap-'+w.id){
 const objectiveResponses=Object.fromEntries(topic.objectives.map(q=>[q.id,Array.isArray(q.correct)?[...q.correct]:q.correct])),writtenResponses=Object.fromEntries(topic.responses.map(r=>[r.id,'QA evidence response for '+r.id]));
 const now=new Date().toISOString(),objectiveResult={correct:topic.objectives.length,total:topic.objectives.length};
 return S.save(w.id,value=>{value.topicId=topic.id;value.objectiveResponses=objectiveResponses;value.writtenResponses=writtenResponses;value.objectiveCheck={topicId:topic.id,...objectiveResult,checkedAt:now};value.snapshots.push({id:snapshotId,at:now,topicId:topic.id,skills:[...w.skills],objectiveResponses:structuredClone(objectiveResponses),writtenResponses:structuredClone(writtenResponses),objectiveResult,assistance:'Independent'});value.complete=true;value.completedAt=now;});
}
(async()=>{
 const {C,S,localStorage}=runtime();
 assert.equal(C.weeks.length,7);assert.deepEqual(C.weeks.map(w=>w.id),['reading7-w1','reading7-w2','reading7-w3','reading7-w4','reading7-w5','reading7-w6','reading7-w7']);
 assert.equal(new Set(C.weeks.map(w=>w.id)).size,7);
 const expectedTitles=['Close Reading, Sequence & Context','Dialogue, Character & Author Choices','Claims & Evidence','Strongest Evidence','How Far Can the Evidence Go?','What Evidence Are We Missing?','Reading Investigation'];
 assert.deepEqual(C.weeks.map(w=>w.title),expectedTitles);
 for(const w of C.weeks){assert(w.skills.length>=4);assert(w.lesson.length>=2);assert(w.vocabulary.length>=4);assert(w.choices.length>=1);const objectiveIds=new Set(),responseIds=new Set();for(const t of w.choices){assert(t.sections.length>=1);assert(t.objectives.length>=2);assert(t.responses.length>=1);for(const q of t.objectives){assert(!objectiveIds.has(q.id));objectiveIds.add(q.id);const ids=q.options.map(x=>x[0]);for(const key of (Array.isArray(q.correct)?q.correct:[q.correct]))assert(ids.includes(key));if(q.selectionCount)assert.equal(q.correct.length,q.selectionCount);}for(const response of t.responses){assert(!responseIds.has(response.id));responseIds.add(response.id);}}}
 assert(C.weeks[0].choices.length>=2&&C.weeks[1].choices.length>=2&&C.weeks[3].choices.length>=2&&C.weeks[4].choices.length>=2&&C.weeks[6].choices.length>=2);
 assert(JSON.stringify(C.weeks[2]).includes('interdimensional portal'));assert.equal(C.weeks[5].choices[0].sections.length,3);assert(C.weeks[6].choices.every(t=>t.sources.length>=2&&t.responses.length===7));
 assert(!/\bremediation\b|missed diagnostic items|Brody is behind|placement determination/i.test(JSON.stringify(C.weeks)));
 pass('Seven-week curriculum contract, progression, choices, objective keys, and culminating source packets are complete');

 assert.equal(sha('assessments/reading.json'),'84348C0CFB586601D42C0DAA0EA3FBEF7A717F2DD82ABA6FC617E32C5E85959B');
 assert.equal(sha('assessments/reading.parent.json'),'C473573C64C8EF2A6E9EC2BF077EF7070CCC9540C617EA60EA6F553704B09F41');
 pass('Frozen Reading baseline student and parent definitions retain their verified hashes');

 const baselineRaw=' {"version":"2026.1","student":"Brody","subject":"reading","answers":{"reading-1":{"choice":4,"exposure":"unsure"}},"index":34,"startedAt":"2026-09-01T10:00:00.000Z","submittedAt":"2026-09-01T11:11:11.000Z","sentinel":"KEEP EXACT BYTES"} ';
 const elaAssignments=Array.from({length:39},(_,i)=>({id:'ela7-test-'+i,subject:'English Language Arts',complete:false}));
 const historyAssignments=Array.from({length:26},(_,i)=>({id:'history-test-'+i,subject:'History–Social Science',complete:false}));
 const readingAssignments=C.weeks.map(w=>({id:w.id,title:w.title,subject:'English Language Arts',complete:false,completedDate:'',readingWeek:w.number}));
 const diagnosticTask={id:'baseline2026-reading',diagnosticId:'reading',subject:'English Language Arts',complete:true,completedDate:'2026-09-01'};
 const assessment={id:'ela',title:'ELA / Reading Baseline',subject:'English Language Arts',status:'Complete',score:'Parent report available',notes:'historical baseline note'};
 const record={assignments:[diagnosticTask,...elaAssignments,...historyAssignments,...readingAssignments],assessments:[assessment,{id:'math'}],logs:[{id:'custom-log',notes:'keep'}],portfolio:[{id:'custom-sample',description:'keep'}]};
 localStorage.map.set('brodyBaseline2026_reading',baselineRaw);localStorage.map.set('brodyHomeschoolRecordV1',JSON.stringify(record));
 const diagnosticBefore=JSON.stringify(diagnosticTask),assessmentBefore=JSON.stringify(assessment);
 for(const w of C.weeks){fillComplete(S,w);S.syncPortal();assert.equal(localStorage.getItem('brodyBaseline2026_reading'),baselineRaw);}
 S.syncPortal();S.syncPortal();
 const after=JSON.parse(localStorage.getItem('brodyHomeschoolRecordV1'));
 assert.equal(after.assignments.filter(x=>x.id.startsWith('ela7-test-')).length,39);assert.equal(after.assignments.filter(x=>x.id.startsWith('history-test-')).length,26);assert.equal(after.assignments.filter(x=>x.id.startsWith('reading7-w')).length,7);
 assert.equal(after.assignments.filter(x=>x.id.startsWith('reading7-w')&&x.complete).length,7);assert.equal(after.portfolio.filter(x=>x.id.startsWith('reading7-w')).length,7);
 assert.equal(JSON.stringify(after.assignments.find(x=>x.diagnosticId==='reading')),diagnosticBefore);assert.equal(JSON.stringify(after.assessments.find(x=>x.id==='ela')),assessmentBefore);assert.equal(after.logs[0].notes,'keep');assert.equal(after.portfolio.find(x=>x.id==='custom-sample').description,'keep');
 assert(!localStorage.writes.some(([,key])=>key==='brodyBaseline2026_reading'));
 pass('All seven saves and repeated portal sync preserve the submitted baseline byte-for-byte and touch only Reading-owned records');

 const latestW1=S.latestSnapshot(S.work('reading7-w1'));
 S.saveParent('reading7-w1',{snapshotId:latestW1.id,rubric:{question:'2',evidence:'2',connection:'1',limits:'2'},status:'Reasonable evidence-supported response',assistance:'Minimal reminder',date:'2026-09-06',comments:'Specific parent observation'});
 const studentExport={kind:'reading-course',schemaVersion:1,student:C.student,readingCourse:S.backup(false)};
 assert(!JSON.stringify(studentExport).includes('KEEP EXACT BYTES'));assert(!('parentReview' in studentExport.readingCourse));
 const parentBackup=S.backup(true);assert.equal(parentBackup.parentReview.reviews['reading7-w1'].comments,'Specific parent observation');assert.equal(Object.keys(parentBackup.moduleRecords).length,7);
 pass('Student export excludes the baseline and parent review; parent backup includes seven module records and the saved rubric');

 const survivor='{"submittedAt":"2030-01-01T00:00:00Z","sentinel":"different surviving baseline"}';const fresh=runtime({brodyBaseline2026_reading:survivor});
 fresh.S.restore(parentBackup);assert.equal(fresh.localStorage.getItem('brodyBaseline2026_reading'),survivor);assert.equal(Object.keys(fresh.S.evidence()).length,7);assert.equal(fresh.S.parent().reviews['reading7-w1'].comments,'Specific parent observation');
 const local=fresh.S.work('reading7-w1');fresh.S.save('reading7-w1',v=>{v.writtenResponses[Object.keys(v.writtenResponses)[0]]='Current local response wins';});fresh.S.restore(parentBackup);assert.equal(Object.values(fresh.S.work('reading7-w1').writtenResponses)[0],'Current local response wins');assert.equal(fresh.S.work('reading7-w1').snapshots.length,1);
 pass('Validated restore recreates missing Reading work, keeps the surviving baseline untouched, and gives current local responses priority');

 const importedTopic=runtime(),topicWeek=importedTopic.C.weeks[0],secondTopic=topicWeek.choices[1];fillComplete(importedTopic.S,topicWeek,secondTopic,'second-topic-snapshot');const localTopic=runtime();localTopic.S.save(topicWeek.id,v=>{v.topicId=topicWeek.choices[0].id;v.objectiveResponses[topicWeek.choices[0].objectives[0].id]=Array(topicWeek.choices[0].objectives[0].correct.length).fill('');});localTopic.S.restore(importedTopic.S.backup(false));const coherent=localTopic.S.work(topicWeek.id);assert.equal(coherent.complete,true);assert.equal(coherent.topicId,secondTopic.id);assert.equal(coherent.objectiveCheck.topicId,secondTopic.id);assert.equal(coherent.snapshots.at(-1).topicId,secondTopic.id);
 pass('Restore keeps topic, completion, objective result, and latest completed checkpoint coherent');

 const reviewRuntime=runtime();assert.throws(()=>reviewRuntime.S.saveParent('reading7-w3',{snapshotId:'none',rubric:{question:'2',evidence:'2',connection:'2',limits:'2'},status:'Reasonable evidence-supported response',assistance:'Independent',date:'2026-09-06',comments:'No checkpoint yet'}),/checkpoint/);assert.equal(reviewRuntime.localStorage.getItem(reviewRuntime.S.parentKey),null);
 fillComplete(reviewRuntime.S,reviewRuntime.C.weeks[0],reviewRuntime.C.weeks[0].choices[0],'review-checkpoint-1');const firstCheckpoint=reviewRuntime.S.latestSnapshot(reviewRuntime.S.work('reading7-w1'));
 reviewRuntime.S.saveParent('reading7-w1',{snapshotId:firstCheckpoint.id,rubric:{question:'2',evidence:'2',connection:'2',limits:'2'},status:'Reasonable evidence-supported response',assistance:'Independent',date:'2026-09-06',comments:'Reviewed first checkpoint'});
 vm.runInContext(fs.readFileSync(path.join(root,'reading-parent.js'),'utf8'),reviewRuntime.context,{filename:'reading-parent.js'});const parentReport1=reviewRuntime.window.ReadingParent.summary();assert.equal(parentReport1.reviewedModules,1);assert.equal(parentReport1.weeks[0].checkpointId,firstCheckpoint.id);assert.equal(parentReport1.weeks[0].parentReview,'Reasonable evidence-supported response');
 const firstCheckpointRaw=JSON.stringify(firstCheckpoint);reviewRuntime.S.save('reading7-w1',value=>{value.writtenResponses['w1-mco-explain']='A later draft is saved separately.';});assert.equal(JSON.stringify(reviewRuntime.S.latestSnapshot(reviewRuntime.S.work('reading7-w1'))),firstCheckpointRaw);
 const secondNow=new Date(Date.now()+1000).toISOString();reviewRuntime.S.save('reading7-w1',value=>{const choice=reviewRuntime.C.weeks[0].choices[0],responses=Object.fromEntries(choice.responses.map(r=>[r.id,value.writtenResponses[r.id]]));value.objectiveResponses=Object.fromEntries(choice.objectives.map(q=>[q.id,Array.isArray(q.correct)?[...q.correct]:q.correct]));value.writtenResponses=responses;value.objectiveCheck={topicId:choice.id,correct:choice.objectives.length,total:choice.objectives.length,checkedAt:secondNow};value.snapshots.push({id:'review-checkpoint-2',at:secondNow,topicId:choice.id,skills:[...reviewRuntime.C.weeks[0].skills],objectiveResponses:Object.fromEntries(choice.objectives.map(q=>[q.id,Array.isArray(q.correct)?[...q.correct]:q.correct])),writtenResponses:responses,objectiveResult:{correct:choice.objectives.length,total:choice.objectives.length},assistance:value.assistance});value.complete=true;value.completedAt=value.completedAt||secondNow;});assert.equal(reviewRuntime.S.latestSnapshot(reviewRuntime.S.work('reading7-w1')).id,'review-checkpoint-2');const parentReport2=reviewRuntime.window.ReadingParent.summary();assert.equal(parentReport2.reviewedModules,0);assert.equal(parentReport2.weeks[0].parentReview,'Not reviewed');assert.throws(()=>reviewRuntime.S.saveParent('reading7-w1',{snapshotId:firstCheckpoint.id,rubric:{question:'2',evidence:'2',connection:'2',limits:'2'},status:'Reasonable evidence-supported response',assistance:'Independent',date:'2026-09-06',comments:'Stale form'}),/newer checkpoint/);assert.equal(reviewRuntime.S.parent().reviews['reading7-w1'].snapshotId,firstCheckpoint.id);
 pass('Parent reviews require a completed checkpoint, retain immutable evidence, and reject stale forms after a newer checkpoint');

 const strictBase=structuredClone(parentBackup.moduleRecords['reading7-w1']);
 const invalidWork=mutator=>{const value=structuredClone(strictBase);mutator(value);assert.throws(()=>S.validateWork(value,'reading7-w1'),/unsupported format|Invalid Reading checkpoint/);};
 invalidWork(value=>{const q=C.weeks[0].choices[0].objectives.find(q=>q.type==='single');value.objectiveResponses[q.id]=[q.correct];});
 invalidWork(value=>{const q=C.weeks[0].choices[0].objectives.find(q=>q.type==='single');value.objectiveResponses[q.id]='unknown-option';});
 invalidWork(value=>{const q=C.weeks[0].choices[0].objectives.find(q=>q.type==='order');value.objectiveResponses[q.id]=q.correct.slice(0,-1).concat('');});
 invalidWork(value=>{const q=C.weeks[0].choices[0].objectives.find(q=>q.type==='order');value.snapshots[0].objectiveResponses[q.id]=q.correct.slice(0,-1);});
 invalidWork(value=>{const other=C.weeks[0].choices[1].objectives[0];value.snapshots[0].objectiveResponses[other.id]=other.correct;});
 invalidWork(value=>{delete value.snapshots[0].writtenResponses[C.weeks[0].choices[0].responses[0].id];});
 invalidWork(value=>{value.snapshots[0].writtenResponses[C.weeks[0].choices[0].responses[0].id]='   ';});
 invalidWork(value=>{value.snapshots[0].objectiveResult.total++;});
 invalidWork(value=>{value.snapshots[0].objectiveResult.correct=0;});
 invalidWork(value=>{value.snapshots[0].skills[0]='not the recorded skill';});
 invalidWork(value=>{value.snapshots[0].assistance='Unsupported help';});
 invalidWork(value=>{value.objectiveCheck.total++;});
 pass('Imported Reading work rejects wrong response types, unknown options, incomplete or cross-topic checkpoints, bad results, skills, assistance, and checks');

 const immutable=runtime();fillComplete(immutable.S,immutable.C.weeks[0],immutable.C.weeks[0].choices[0],'immutable-snapshot');const immutableBefore=immutable.localStorage.getItem(immutable.S.prefix+'reading7-w1');assert.throws(()=>immutable.S.save('reading7-w1',value=>{value.snapshots[0].writtenResponses['w1-mco-explain']='tampered';}),/immutable/);assert.equal(immutable.localStorage.getItem(immutable.S.prefix+'reading7-w1'),immutableBefore);
 const completedA=runtime();fillComplete(completedA.S,completedA.C.weeks[0],completedA.C.weeks[0].choices[0],'topic-a');const completedB=runtime();fillComplete(completedB.S,completedB.C.weeks[0],completedB.C.weeks[0].choices[1],'topic-b');const completedARaw=completedA.localStorage.getItem(completedA.S.prefix+'reading7-w1');assert.throws(()=>completedA.S.restore(completedB.S.backup(false)),/different topic/);assert.equal(completedA.localStorage.getItem(completedA.S.prefix+'reading7-w1'),completedARaw);
 const badReviewImport=structuredClone(parentBackup);badReviewImport.parentReview.reviews['reading7-w1'].snapshotId='missing-checkpoint';const badReviewTarget=runtime({brodyBaseline2026_reading:survivor}),reviewBefore=JSON.stringify([...badReviewTarget.localStorage.map]);assert.throws(()=>badReviewTarget.S.restore(badReviewImport),/does not match/);assert.equal(JSON.stringify([...badReviewTarget.localStorage.map]),reviewBefore);
 pass('Checkpoint mutation, conflicting completed topics, and reviews pointing to missing checkpoints reject atomically');

 const beforeInvalid=JSON.stringify([...fresh.localStorage.map]);const invalid=structuredClone(parentBackup);invalid.moduleRecords['reading7-w99']=invalid.moduleRecords['reading7-w1'];assert.throws(()=>fresh.S.restore(invalid),/Unknown Reading module/);assert.equal(JSON.stringify([...fresh.localStorage.map]),beforeInvalid);
 const rollback=runtime();const two={schemaVersion:1,student:C.student,courseVersion:C.version,moduleRecords:{'reading7-w1':parentBackup.moduleRecords['reading7-w1'],'reading7-w2':parentBackup.moduleRecords['reading7-w2']}};rollback.localStorage.failAt=2;assert.throws(()=>rollback.S.restore(two),/simulated quota failure/);assert.equal(rollback.localStorage.getItem('brodyReadingCourse2026_reading7-w1'),null);assert.equal(rollback.localStorage.getItem('brodyReadingCourse2026_reading7-w2'),null);
 pass('Unknown modules reject before mutation and a failed multi-key restore rolls back earlier writes');

 const malformed='{"schemaVersion":99,"doNotReplace":true}';const broken=runtime({'brodyReadingCourse2026_reading7-w1':malformed});assert.throws(()=>broken.S.work('reading7-w1'),/unsupported format/);assert.equal(broken.localStorage.getItem('brodyReadingCourse2026_reading7-w1'),malformed);
 pass('Malformed Reading work stops safely without overwriting its raw recovery record');

 const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),ela=fs.readFileSync(path.join(root,'ela-portal.js'),'utf8'),history=fs.readFileSync(path.join(root,'history-portal.js'),'utf8'),portal=fs.readFileSync(path.join(root,'reading-portal.js'),'utf8'),student=fs.readFileSync(path.join(root,'reading-student.js'),'utf8'),parentScript=fs.readFileSync(path.join(root,'reading-parent.js'),'utf8'),index=fs.readFileSync(path.join(root,'index.html'),'utf8'),parent=fs.readFileSync(path.join(root,'parent.html'),'utf8');
 assert(app.includes('data-assignment-id=')&&app.includes('reading.html'));assert(ela.includes('card.dataset.assignmentId'));assert(history.includes('card.dataset.assignmentId'));assert(portal.includes('card.dataset.assignmentId'));assert(portal.includes("subjectFilter.value='English Language Arts'"));assert(student.includes('module.choices.length===1?module.choices[0].id:null')&&student.includes('if(persist(v=>'));assert(parentScript.includes('S.latestSnapshot(value)')&&parentScript.includes('data-reading-snapshot')&&parentScript.includes('currentReview')&&parentScript.includes("question.type==='order'")&&!parentScript.includes('objectiveEvidence(topic,value)'));assert(index.includes('reading-portal.js'));assert(parent.includes('id="reading-parent"')&&parent.includes('reading-parent.js'));
 pass('Portal decorators use stable assignment IDs and both student and parent Reading integrations are loaded');

 for(const file of ['reading-course.js','reading-store.js','reading-student.js','reading-parent.js','reading-portal.js'])require('child_process').execFileSync(process.execPath,['--check',path.join(root,file)]);
 pass('All Reading JavaScript parses successfully');
 fs.writeFileSync(path.join(__dirname,'reading-qa-results.json'),JSON.stringify({testedAt:new Date().toISOString(),modules:7,baselineHashes:{student:sha('assessments/reading.json'),parent:sha('assessments/reading.parent.json')},results},null,2));
})().catch(error=>{console.error(error);process.exit(1);});
