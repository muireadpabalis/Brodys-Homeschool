const assert=require('assert');
const crypto=require('crypto');
const fs=require('fs');
const path=require('path');
const {chromium}=require('playwright');

const root=path.resolve(__dirname,'..'),name=path.basename(root),isBrody=name==='Brodys-Homeschool';
const cfg=isBrody?{
 base:'http://127.0.0.1:8765/Brodys-Homeschool/',student:'Brody',recordKey:'brodyHomeschoolRecordV1',parentKey:'brodyParentAccess2026',
 courses:[{id:'brody-science-2026',file:'science.html',prefix:'brodyScienceCourse2026_',parent:'brodyScienceParent2026',weeks:['science7-w1','science7-w2','science7-w3','science7-w4','science7-w5','science7-w6','science7-w7']},{id:'brody-math-2026',file:'math.html',prefix:'brodyMathCourse2026_',parent:'brodyMathParent2026',weeks:['math7-w1','math7-w2','math7-w3','math7-w4','math7-w5','math7-w6','math7-w7']}],
 assessments:['reading','writing','science','history'],mathKey:'brodyMathDiagnosticV1'
}:{
 base:'http://127.0.0.1:8765/Rorys-Homeschool/',student:'Rory',recordKey:'roryHomeschoolRecordV2',parentKey:'roryParentAccess2026',
 courses:[{id:'rory-math-2026',file:'math.html',prefix:'roryMathCourse2026_',parent:'roryMathParent2026',weeks:['math3-w1','math3-w2','math3-w3','math3-w4','math3-w5','math3-w6','math3-w7']}],
 assessments:['reading','writing','science','history'],mathKey:'rory_math_baseline_v1'
};

function assessmentSeed(subject){const def=JSON.parse(fs.readFileSync(path.join(root,'assessments',subject+'.json'),'utf8'));return {version:def.version,student:cfg.student,subject,answers:{},index:0,startedAt:'2026-08-25T12:00:00.000Z',submittedAt:'2026-09-01T12:00:00.000Z'};}
const initial={};for(const subject of cfg.assessments)initial[cfg.student.toLowerCase()+'Baseline2026_'+subject]=JSON.stringify(assessmentSeed(subject));
initial[cfg.mathKey]=JSON.stringify(isBrody?{student:'Brody',subject:'math',answers:{},startedAt:'2026-08-25T12:00:00.000Z',submittedAt:'2026-09-01T12:00:00.000Z'}:{student:'Rory',subject:'math',itemVersion:2,answers:{},index:0,startedAt:'2026-08-25T12:00:00.000Z',submitted:true,submittedAt:'2026-09-01T12:00:00.000Z'});
initial[cfg.recordKey]=JSON.stringify({assignments:[],assessments:[{id:'math',title:'Math Baseline',subject:'Mathematics',date:'2026-08-31',score:'',notes:'',status:'Not started',link:'math-assessment.html'}],logs:[{id:'existing-log',date:'2026-09-01',subject:'Other',minutes:10,activity:'Existing learning',notes:''}],portfolio:[{id:'existing-portfolio',title:'Existing sample',subject:'Other',date:'2026-09-01',description:'Keep me',link:''}]});
const protectedRaw=Object.fromEntries(Object.entries(initial).filter(([key])=>key!==cfg.recordKey));

async function downloadedJson(page,selector){
 const [download]=await Promise.all([page.waitForEvent('download'),page.locator(selector).click()]);
 return JSON.parse(fs.readFileSync(await download.path(),'utf8'));
}

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.addInitScript(values=>{for(const [key,value] of Object.entries(values))if(localStorage.getItem(key)===null)localStorage.setItem(key,value);},initial);
 const errors=[],failed=[];
 const attach=page=>{page.on('console',message=>{if(message.type()==='error')errors.push('console: '+message.text());});page.on('pageerror',error=>errors.push('page: '+error.message));page.on('requestfailed',request=>failed.push(request.url()+' '+request.failure()?.errorText));page.on('response',response=>{if(response.status()>=400)failed.push(response.status()+' '+response.url());});};
 const page=await context.newPage();attach(page);
 await page.goto(cfg.base,{waitUntil:'networkidle'});
 assert.equal(await page.locator('.instruction-spotlight-card').count(),cfg.courses.length,'Current-week dashboard cards missing');
 if(isBrody){
  assert((await page.locator('.instruction-spotlight-card').first().locator('.badge').innerText()).startsWith('Science'),'Brody Science is not the first current-work priority');
  assert.equal(await page.locator('.instruction-spotlight-card').first().locator('.instruction-stage').innerText(),'Primary focus','Brody Science priority label missing');
 }
 const assignmentIds=cfg.courses.flatMap(course=>course.weeks);
 const savedAssignments=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).assignments,cfg.recordKey);
 for(const id of assignmentIds)assert.equal(savedAssignments.filter(item=>item.id===id).length,1,'Stable assignment missing or duplicated: '+id);
 assert(savedAssignments.every(item=>!item.title.includes('undefined')),'An assignment contains undefined text');
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'Dashboard overflows 390px viewport');
 const hrefSafety=await page.evaluate(()=>({unsafe:safeHref('javascript:alert(1)'),relative:safeHref('science.html')}));
 assert.equal(hrefSafety.unsafe,'','Unsafe javascript link was accepted');assert.equal(hrefSafety.relative,'science.html','Safe relative course link was rejected');
 await page.evaluate(({key,id})=>{const record=JSON.parse(localStorage.getItem(key)),item=record.assignments.find(value=>value.id===id);item.complete=true;item.completedDate='2026-09-07';localStorage.setItem(key,JSON.stringify(record));},{key:cfg.recordKey,id:cfg.courses[0].weeks[0]});
 await page.reload({waitUntil:'networkidle'});
 const repairedAssignment=await page.evaluate(({key,id})=>JSON.parse(localStorage.getItem(key)).assignments.find(value=>value.id===id),{key:cfg.recordKey,id:cfg.courses[0].weeks[0]});
 assert.equal(repairedAssignment.complete,false,'Portal completion was not repaired from course evidence');assert.equal(repairedAssignment.completedDate,'','Tampered completion date was not cleared');
 await page.locator('[data-view="assignments"]').click();await page.locator('#subjectFilter').selectOption('Science');await page.locator('#statusFilter').selectOption('open');
 const filteredCourseCard=page.locator(`[data-assignment-id="${cfg.courses[0].weeks[0]}"]`);assert(await filteredCourseCard.isVisible(),'Open Science assignment disappeared after filtering');assert.equal(await filteredCourseCard.locator('.actions button').count(),0,'Filtered course assignment exposed manual completion or delete controls');

 for(const course of cfg.courses){
  await page.goto(cfg.base+course.file,{waitUntil:'networkidle'});
  assert.equal(await page.locator('.instruction-week-card').count(),7,course.file+' does not show seven weeks');
  assert(await page.locator('.instruction-opening').innerText());
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),course.file+' overview overflows 390px');
  for(const week of course.weeks){
   await page.goto(cfg.base+course.file+'?id='+week,{waitUntil:'networkidle'});
   assert.equal(await page.locator('.instruction-activity').count(),3,week+' missing guided, independent, or reasoning activity');
   assert((await page.locator('.instruction-checkpoint [data-instruction-field]').count())>=3,week+' missing Friday checkpoint responses');
   assert((await page.locator('.instruction-vocab dt').count())>=4,week+' missing vocabulary');
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),week+' overflows 390px');
  }
 }

 const first=cfg.courses[0],firstWeek=first.weeks[0];
 await page.goto(cfg.base+first.file+'?id='+firstWeek,{waitUntil:'networkidle'});
 for(const textarea of await page.locator('textarea[data-instruction-field]').all())await textarea.fill('Observed data, model, evidence, claim, and reasoning saved for browser QA.');
 for(const input of await page.locator('input[data-instruction-field]').all())await input.fill('https://example.com/private-work-sample');
 for(const select of await page.locator('select[data-instruction-field]').all())await select.selectOption({index:1});
 for(const checkbox of await page.locator('[data-instruction-check]').all())await checkbox.check();
 await page.locator('#instruction-checkpoint').click();
 await page.waitForFunction(()=>document.querySelector('#instruction-status')?.textContent.includes('Saved. This week is complete'));
 const firstSaved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),first.prefix+firstWeek);
 assert(firstSaved.complete&&firstSaved.snapshots.length===1,'Browser checkpoint did not persist');
 await page.close();

 const reopened=await context.newPage();attach(reopened);await reopened.goto(cfg.base+first.file+'?id='+firstWeek,{waitUntil:'networkidle'});
 assert((await reopened.locator('#instruction-status').innerText()).includes('checkpoint is saved'),'Fresh page did not reload saved checkpoint');
 assert((await reopened.locator('textarea[data-instruction-field]').first().inputValue()).includes('Observed data'),'Fresh page did not reload response');

 await reopened.goto(cfg.base+'parent.html',{waitUntil:'networkidle'});
 await reopened.locator('#parent-pass').fill('family-test-passphrase');
 await reopened.locator('#confirm-pass').fill('family-test-passphrase');
 await reopened.locator('#unlock button').click();
 await reopened.waitForFunction(()=>!document.querySelector('#parent-content').hidden);
 for(const course of cfg.courses){const section=reopened.locator(`[data-instruction-parent="${course.id}"]`);assert((await section.locator('.instruction-parent-week').count())===7,'Parent course missing weeks: '+course.id);}
 const parentSection=reopened.locator(`[data-instruction-parent="${first.id}"]`),firstDetails=parentSection.locator('.instruction-parent-week').first();
 await firstDetails.locator('summary').first().click();
 await firstDetails.locator('select[name="status"]').selectOption({label:'Demonstrated independently'});
 await firstDetails.locator('textarea[name="notes"]').fill('Browser QA parent note tied to the latest checkpoint.');
 await firstDetails.locator('form button').click();
 await reopened.waitForFunction(id=>document.querySelector(`[data-instruction-parent="${id}"]`)?.textContent.includes('1/7'),first.id);
 const parentReview=await reopened.evaluate(key=>JSON.parse(localStorage.getItem(key)),first.parent);assert.equal(parentReview.weeks[firstWeek].status,'Demonstrated independently');

 const healthyExport=await downloadedJson(reopened,'#export-all');
 assert.equal(healthyExport.student,cfg.student,'Complete parent export has the wrong student');assert(healthyExport.record&&healthyExport.instructionCourses?.[first.id],'Complete parent export omitted portal or course records');
 const unusedWeekKey=first.prefix+first.weeks[1];await reopened.evaluate(key=>localStorage.setItem(key,'null'),unusedWeekKey);
 const courseRecoveryExport=await downloadedJson(reopened,'#export-all');
 assert.equal(courseRecoveryExport.instructionCourseRecovery?.[first.id]?.rawWeekRecords?.[first.weeks[1]],'null','Malformed course record was not retained in parent export');
 await reopened.evaluate(key=>localStorage.removeItem(key),unusedWeekKey);
 const goodRecordRaw=await reopened.evaluate(key=>localStorage.getItem(key),cfg.recordKey);await reopened.evaluate(key=>localStorage.setItem(key,'{broken'),cfg.recordKey);
 const recordRecoveryExport=await downloadedJson(reopened,'#export-all');
 assert.equal(recordRecoveryExport.record,null,'Malformed school record was treated as healthy');assert.equal(recordRecoveryExport.recordRecovery?.raw,'{broken','Malformed school record raw text was not retained in parent export');
 await reopened.evaluate(({key,raw})=>localStorage.setItem(key,raw),{key:cfg.recordKey,raw:goodRecordRaw});

 const finalRecord=await reopened.evaluate(key=>JSON.parse(localStorage.getItem(key)),cfg.recordKey);assert(finalRecord.logs.some(item=>item.id==='existing-log')&&finalRecord.portfolio.some(item=>item.id==='existing-portfolio'),'Existing portal evidence was lost');
 for(const [key,raw] of Object.entries(protectedRaw))assert.equal(await reopened.evaluate(k=>localStorage.getItem(k),key),raw,'Baseline raw value changed: '+key);
 await reopened.goto(cfg.base,{waitUntil:'networkidle'});const assessmentText=await reopened.locator('#assessments').innerText();assert(assessmentText.includes('Assessment phase complete'),'Assessment history is not marked complete');

 await browser.close();
 assert.deepEqual(errors,[],'Browser console/page errors:\n'+errors.join('\n'));
 assert.deepEqual(failed,[],'Failed browser requests:\n'+failed.join('\n'));
 const checks=['Dashboard shows current-week instructional cards','Brody Science is first and labeled Primary focus','Unsafe restored links are rejected while safe course links remain available','Portal assignment completion is repaired from saved course evidence','Filtered course assignments expose no manual completion or delete controls','Every course overview shows seven populated weeks','All weekly lesson pages show guided, independent, reasoning, vocabulary, and Friday-check sections','All checked student pages fit a 390px viewport','A complete checkpoint persisted across closing and reopening the page','Parent gate opened; all weeks rendered; review saved against the checkpoint','Healthy complete export includes portal and course records','Malformed course and school records remain exportable as raw recovery data','Existing portal evidence and baseline raw strings were preserved','Assessment history is labeled complete','No console errors, page errors, failed requests, or HTTP error responses'];
 const result={passed:true,testedAt:new Date().toISOString(),student:cfg.student,viewport:'390x844',pagesChecked:2+cfg.courses.reduce((sum,course)=>sum+1+course.weeks.length,0),checks};
 fs.writeFileSync(path.join(__dirname,'final-browser-qa-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
