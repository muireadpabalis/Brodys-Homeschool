const assert=require('assert');
const crypto=require('crypto');
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const {execFileSync}=require('child_process');

const root=path.resolve(__dirname,'..'),isBrody=path.basename(root)==='Brodys-Homeschool';
const config=isBrody?{
 student:'Brody',recordKey:'brodyHomeschoolRecordV1',courseFiles:['science-course.js','math-course.js'],courseIds:['brody-science-2026','brody-math-2026'],
 titles:[['Cells as Systems','Body Systems Work Together','Evidence for Change Over Time','Matter, Mass, Volume & Density','Waves','Light & Wave Interactions','Integrated Grade 7 Science Readiness'],['Number System Foundation','Ratios, Rates & Proportions','Percents','Expressions & Algebra Foundation','Equations & Inequalities','Geometry + Measurement','Data, Statistics & Grade 7 Readiness']],
 protectedKeys:['brodyBaseline2026_reading','brodyBaseline2026_writing','brodyBaseline2026_science','brodyBaseline2026_history','brodyMathDiagnosticV1','brodyParentReview2026','brodyELABridge2026_keep','brodyHistoryBridge2026_keep','brodyReadingCourse2026_keep'],
 hashes:{'assessments/science.json':'BC6D9282E19E2B3D89BDDD42887123306DA6E45973118DC0553CD13A4856231F','assessments/science.parent.json':'A150C356E833B1F3CB5C6203A7127D98D130762EBF599AFC95A2D6A845746040','assessments/reading.json':'84348C0CFB586601D42C0DAA0EA3FBEF7A717F2DD82ABA6FC617E32C5E85959B','assessments/reading.parent.json':'C473573C64C8EF2A6E9EC2BF077EF7070CCC9540C617EA60EA6F553704B09F41','parent-math.json':'2B23A65CABD5A1F04ADF31C670AA39B0EADE839B8FDEB17B7F9FA5329D46B269','Brody_Math_Assessment_v1_1.js':'6F51361C23E4A8B87FFE0B2BA3FC8241D6363A87B7BC4EB64AB9CF06FCC927B1','ela-curriculum.js':'B8C3A254872AB99811427A17012DCA3478404784421F114A6A8A319E07A49528','history-course.js':'84820DEF63DA963F641E526BE76B3060332853D1646B366D8E3DEA795CBC63A3','reading-course.js':'5FFBBB46736272ED1E7CEF50FFB491552EED2D491EB683718C56994ADC5E3AD4'},
 mathQuestionHash:'75AC17734B66DA2DB4F2E0867FC1505BF9CA405498384ECE158A7B2B51535371'
}:{
 student:'Rory',recordKey:'roryHomeschoolRecordV2',courseFiles:['math-course.js'],courseIds:['rory-math-2026'],
 titles:[['Addition & Subtraction Accuracy','Money + Real-World Problem Solving','Multiplication Concepts','Division + Multiplication/Division Word Problems','Fractions','Measurement, Rounding & Perimeter','Multi-Step Problem Solving & Grade 3 Readiness']],
 protectedKeys:['roryBaseline2026_reading','roryBaseline2026_writing','roryBaseline2026_science','roryBaseline2026_history','rory_math_baseline_v1','roryAssessmentRecovery2026V1','roryParentReview2026','roryELABridge2026_keep','roryScienceBridge2026_keep','roryHistoryBridge2026_keep'],
 hashes:{'math-assessment.js':'344D698DD4C9F12C39BF07F0F37A401D54F4B2EF540E2E4C616E11C3B4949D1B','math-assessment.html':'2923D2F0FBDBAF47E8F4CF1AE0969B9D44E6ED776FA9D3E9581156B08F8444DF','parent-math.json':'42164295427D63ECAA69516D86D34581431FB541C8D8F6B50CCA3B8DE4CAA789','assessment-persistence.js':'C52BD4D41E4AA9EC2EB0DB1314B42D5F55AE3A55955934BCBC5CD9AD03F9F88E','science-course.js':'924940482B5F7F235D735BA5804F30B9D841616E17842240C83190D33F230540','history-course.js':'6A0904683EFCF99B66EE49DCAD2FCE052CA0CA6EBF6654C16A92CC8E96FD842E'}
};
if(!isBrody)Object.assign(config.hashes,{'ela-curriculum.js':'1F12864D581E120CF8D095383CF4826117C4D2D1ED6E9AC0ECA336F33BFEAAEE','assessments/science.json':'299E9771354D043F023E2FFE56C70B4454C96236E31941E3F9699DE901EC15C5','assessments/science.parent.json':'5A84ECAC7A605B69D9A84E03FB34D831D4F4CDF3A8A66525596CE09711AFBDF6'});

const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex').toUpperCase();
for(const [file,expected] of Object.entries(config.hashes))assert.equal(sha(file),expected,'Frozen file changed: '+file);
if(isBrody){const source=fs.readFileSync(path.join(root,'math-assessment.js'),'utf8'),match=source.match(/const questions=(\[[\s\S]*?\]);\r?\nconst sectionOrder/);assert(match,'Math question bank was not found');assert.equal(crypto.createHash('sha256').update(match[1]).digest('hex').toUpperCase(),config.mathQuestionHash,'Brody Math questions changed');}

class MemoryStorage{
 constructor(map=new Map()){this.map=map;}
 get length(){return this.map.size;}
 key(index){return [...this.map.keys()][index]??null;}
 getItem(key){return this.map.has(String(key))?this.map.get(String(key)):null;}
 setItem(key,value){this.map.set(String(key),String(value));}
 removeItem(key){this.map.delete(String(key));}
 clear(){this.map.clear();}
}
function loadCourses(storage){
 const context={console,localStorage:storage,structuredClone,crypto:{randomUUID:crypto.randomUUID},Blob:global.Blob,URL:global.URL,setTimeout,clearTimeout};context.window=context;
 vm.createContext(context);
 for(const file of config.courseFiles)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
 vm.runInContext(fs.readFileSync(path.join(root,'instruction-core.js'),'utf8'),context,{filename:'instruction-core.js'});
 return context;
}
function allValues(store,week,label='Recorded instructional evidence'){
 const fields={};for(const definition of store.courseFields(week))fields[definition.id]=definition.type==='select'?definition.options[0]:label+' for '+definition.id;
 const checks={};for(const [id] of store.courseChecks(week))checks[id]=true;
 return {fields,checks};
}

const shared=new Map(),storage=new MemoryStorage(shared),sentinels={};
for(const [index,key] of config.protectedKeys.entries()){const raw=key.includes('AssessmentRecovery')?JSON.stringify({schemaVersion:1,student:config.student,updatedAt:null,currentAttempts:{},currentHistory:{},importedCurrent:{},legacyContainers:{},legacyImports:{},malformed:{}}):'PRESERVE::'+index+'::'+key;storage.setItem(key,raw);sentinels[key]=raw;}
storage.setItem(config.recordKey,JSON.stringify({assignments:[],assessments:[{id:'math',status:'Complete'},{id:'science',status:'Complete'}],logs:[{id:'old-log'}],portfolio:[{id:'old-portfolio'}]}));

let context=loadCourses(storage),stores=config.courseIds.map(id=>context.InstructionRegistry[id]);
assert.equal(stores.length,config.courseIds.length);
stores.forEach((store,courseIndex)=>{
 const C=store.course;
 assert.equal(C.weeks.length,7);assert.deepEqual(Array.from(C.weeks,x=>x.title),config.titles[courseIndex]);
 assert(!/placeholder|coming soon|lorem ipsum/i.test(JSON.stringify(C)),'Placeholder course content found');
 assert(!C.weeks.some(week=>/remediation|deficit|failed/i.test(week.scope+' '+week.courseNote)),'A week uses failure framing');
 C.weeks.forEach((week,index)=>{
  assert.equal(week.week,index+1);assert(week.objective&&week.lesson.length>=2&&week.skills.length>=4&&week.standards.length);
  assert(week.guided.fields.length&&week.independent.fields.length&&week.reasoning.fields.length&&week.checkpoint.length>=3);
  assert(week.parentPrep.materials.length&&week.parentPrep.note&&week.portfolio&&week.due);
  const values=allValues(store,week,'Week '+week.week);
  store.save(week.id,value=>{value.fields[Object.keys(values.fields)[0]]='Draft saved before checkpoint';});
  store.checkpoint(week.id,values.fields,values.checks);
  store.syncPortal();
  assert.equal(store.work(week.id).complete,true);assert.equal(store.work(week.id).snapshots.length,1);
 });
 const first=C.weeks[0],initial=store.work(first.id),snapshotId=initial.snapshots.at(-1).id;
 store.saveParent(first.id,snapshotId,'Demonstrated independently','Parent reviewed the saved evidence.');
 const second=allValues(store,first,'Revised evidence');store.checkpoint(first.id,second.fields,second.checks);
 assert.throws(()=>store.saveParent(first.id,snapshotId,'Demonstrated with support','Stale form'),/newer checkpoint/i);
 assert.throws(()=>store.save(first.id,value=>{value.snapshots[0].fields.assistance='Step-by-step support';}),/cannot be changed/i);
});

let portal=JSON.parse(storage.getItem(config.recordKey));
const ids=stores.flatMap(store=>store.course.weeks.map(week=>week.id));
ids.forEach(id=>{assert.equal(portal.assignments.filter(item=>item.id===id).length,1,'Stable assignment ID duplicated: '+id);assert.equal(portal.assignments.find(item=>item.id===id).complete,true);assert.equal(portal.portfolio.filter(item=>item.id===id).length,1,'Portfolio ID duplicated: '+id);});
assert(portal.logs.some(item=>item.id==='old-log')&&portal.portfolio.some(item=>item.id==='old-portfolio'),'Existing portal evidence was lost');
for(const [key,raw] of Object.entries(sentinels))assert.equal(storage.getItem(key),raw,'Protected key changed: '+key);

const backups=Object.fromEntries(stores.map(store=>[store.course.id,store.backup(true)]));
context=loadCourses(new MemoryStorage(shared));
for(const id of config.courseIds){const reopened=context.InstructionRegistry[id];assert.equal(reopened.work(reopened.course.weeks[0].id).snapshots.length,2,'Browser reopen lost checkpoints');assert.equal(reopened.work(reopened.course.weeks[6].id).complete,true,'Browser reopen lost completion');}

for(const store of stores){for(const week of store.course.weeks)storage.removeItem(store.key(week.id));storage.removeItem(store.course.parentKey);}
context=loadCourses(storage);
for(const id of config.courseIds){const store=context.InstructionRegistry[id];store.restore(backups[id]);assert.equal(store.work(store.course.weeks[0].id).snapshots.length,2);assert.equal(store.parent().weeks[store.course.weeks[0].id].status,'Demonstrated independently');}
for(const [key,raw] of Object.entries(sentinels))assert.equal(storage.getItem(key),raw,'Restore changed protected key: '+key);

const target=context.InstructionRegistry[config.courseIds[0]],bad=structuredClone(backups[config.courseIds[0]]),rawBefore=storage.getItem(target.key(target.course.weeks[0].id));bad.weekRecords[target.course.weeks[0].id].fields.notARealField='bad';assert.throws(()=>target.restore(bad),/responses need recovery/i);assert.equal(storage.getItem(target.key(target.course.weeks[0].id)),rawBefore,'Failed restore mutated work');

const corruptStorage=new MemoryStorage();
const corruptContext=loadCourses(corruptStorage),corruptStore=corruptContext.InstructionRegistry[config.courseIds[0]],corruptWeek=corruptStore.course.weeks[0],corruptKey=corruptStore.key(corruptWeek.id);
const corruptRaw=JSON.stringify({schemaVersion:1,fields:{sentinel:'preserve-valid-json'},taskChecks:{},snapshots:'not-an-array',complete:false,completedAt:null,updatedAt:null});
corruptStorage.setItem(corruptKey,corruptRaw);
assert.throws(()=>corruptStore.restore(backups[config.courseIds[0]]),/unsupported format|recovery/i,'A valid-JSON corrupt local course record should block restore');
assert.equal(corruptStorage.getItem(corruptKey),corruptRaw,'Failed restore overwrote a valid-JSON corrupt local course record');

function persistenceGuard(){
 const loadPersistence=mem=>{const value={console,localStorage:mem,structuredClone,PORTAL:{student:config.student,recordKey:config.recordKey}};value.window=value;vm.createContext(value);vm.runInContext(fs.readFileSync(path.join(root,'assessment-persistence.js'),'utf8'),value);return value;};
 const map=new Map(),mem=new MemoryStorage(map),mathKey=isBrody?'brodyMathDiagnosticV1':'rory_math_baseline_v1',submitted=JSON.stringify({student:config.student,subject:'math',itemVersion:2,answers:{q1:0,'1':'A'},submittedAt:'2026-09-01T12:00:00.000Z',submitted:true});
 mem.setItem(mathKey,submitted);const c=loadPersistence(mem);
 c.AssessmentPersistence.write(mathKey,{student:config.student,subject:'math',itemVersion:2,answers:{q1:4,'1':'E'},submittedAt:'2026-09-01T12:00:00.000Z',submitted:true});assert.equal(mem.getItem(mathKey),submitted,'Submitted assessment was overwritten');
 mem.removeItem(mathKey);const d=loadPersistence(mem);assert(d.AssessmentPersistence.read(mathKey),'Recovery vault did not retain submitted attempt');

 const boundedStorage=new MemoryStorage(),bounded=loadPersistence(boundedStorage),boundedKey=config.student.toLowerCase()+'Baseline2026_writing';
 let draft={version:'qa-bounded-history',student:config.student,subject:'writing',answers:{},index:0,startedAt:'2026-09-01T12:00:00.000Z',submittedAt:null};
 for(let i=0;i<80;i++){draft.answers['q'+i]={text:'Revision '+i};draft=bounded.AssessmentPersistence.write(boundedKey,draft);}
 const history=bounded.AssessmentPersistence.exportArchive().recovery.currentHistory[boundedKey]||{};
 assert(Object.keys(history).length<=12,'Assessment recovery history exceeded the 12-revision bound');

 const sharedStorage=new MemoryStorage(),firstContext=loadPersistence(sharedStorage),secondContext=loadPersistence(sharedStorage),prefix=config.student.toLowerCase()+'Baseline2026_';
 const firstKey=prefix+'reading',secondKey=prefix+'science';
 firstContext.AssessmentPersistence.write(firstKey,{version:'qa-stale-context',student:config.student,subject:'reading',answers:{q1:{choice:0}},index:0,startedAt:'2026-09-01T12:00:00.000Z',submittedAt:null});
 secondContext.AssessmentPersistence.write(secondKey,{version:'qa-stale-context',student:config.student,subject:'science',answers:{q2:{choice:1}},index:0,startedAt:'2026-09-01T12:00:00.000Z',submittedAt:null});
 const mergedVault=JSON.parse(sharedStorage.getItem(firstContext.AssessmentPersistence.recoveryKey));
 assert(mergedVault.currentAttempts[firstKey]&&mergedVault.currentAttempts[secondKey],'Stale persistence contexts did not merge distinct assessment attempts into recovery');
}
persistenceGuard();

const index=fs.readFileSync(path.join(root,'index.html'),'utf8'),parent=fs.readFileSync(path.join(root,'parent.html'),'utf8'),parentJs=fs.readFileSync(path.join(root,'parent.js'),'utf8'),portalJs=fs.readFileSync(path.join(root,'instruction-portal.js'),'utf8');
for(const file of config.courseFiles)assert(index.includes(file),'Portal does not load '+file);
assert(index.includes('instruction-core.js')&&index.includes('instruction-portal.js')&&parent.includes('instruction-parent.js'));
for(const id of config.courseIds)assert(parent.includes(`data-instruction-parent="${id}"`),'Parent section missing '+id);
assert(parentJs.includes('InstructionParent?.backup()')&&parentJs.includes('InstructionParent?.restore(imported)'),'Complete parent export/restore omits instruction courses');
assert(portalJs.includes("data.assignments.find(item => item.id === week.id)"),'Portal integration does not use stable exact IDs');

const jsFiles=fs.readdirSync(root).filter(file=>file.endsWith('.js'));
for(const file of jsFiles)execFileSync(process.execPath,['--check',path.join(root,file)],{stdio:'pipe'});

const result={passed:true,testedAt:new Date().toISOString(),student:config.student,courses:stores.map(store=>({title:store.course.title,weeks:store.course.weeks.length})),checks:['Frozen baseline and finalized-course files match verified hashes','All seven weeks per course contain complete lessons, guided work, independent application, reasoning, parent preparation, portfolio evidence, and Friday checkpoints','Course keys preserve every seeded assessment and finalized-subject sentinel byte-for-byte','Drafts, immutable checkpoints, parent reviews, stale-review rejection, and exact-ID portal sync work','Seven stable assignments and portfolio entries persist without duplication','Work survives a fresh runtime over the same persistent storage and restores from export','Invalid imported and valid-JSON corrupt local records reject without mutation','Submitted assessment protection and recovery archive retain the original attempt','Assessment history stays bounded to 12 revisions across repeated saves','Stale persistence contexts merge distinct attempts without losing either recovery entry','Parent complete export/restore hooks and student/parent page assets are present','All repository JavaScript parses successfully']};
fs.writeFileSync(path.join(__dirname,'final-instruction-qa-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
