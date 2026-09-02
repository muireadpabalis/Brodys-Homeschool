const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=process.env.HOMESCHOOL_QA_ROOT||path.resolve(__dirname,'../..'), results=[];
const record=(name)=>{results.push(name);console.log('PASS '+name)};
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
for(const student of ['Brody','Rory']){
 const ctx=await browser.newContext({acceptDownloads:true}),page=await ctx.newPage(),base=(process.env.HOMESCHOOL_QA_URL||'http://127.0.0.1:8765/')+student+'s-Homeschool/';
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(base);await page.waitForSelector('#overallPercent');
 const key=student==='Brody'?'brodyHomeschoolRecordV1':'roryHomeschoolRecordV2';
 await page.evaluate(key=>{let d=JSON.parse(localStorage.getItem(key));d.logs.push({id:'qa-log',date:'2026-09-02',subject:'Science',minutes:37,activity:'Existing record',notes:'Preserve me'});localStorage.setItem(key,JSON.stringify(d))},key);await page.reload();
 assert.equal(await page.locator('#minutesCount').innerText(),'37');
 await page.getByRole('button',{name:'Subjects',exact:true}).click();await page.locator('.subject-card').first().click();await page.locator('.topic-link').first().click();assert(await page.locator('#assignments').isVisible());
 await page.getByRole('button',{name:'Assessments',exact:true}).click();assert.equal(await page.locator('#assessmentList article').count(),5);record(student+' canonical navigation, legacy records and five integrated assessments');
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(root,student+'-portal-mobile.png'),fullPage:true});
 for(const subject of ['reading','writing','science','history']){
  const bank=JSON.parse(fs.readFileSync(path.join(root,student+'s-Homeschool/assessments/'+subject+'.parent.json'),'utf8'));
  assert(bank.questions.length<=45);assert(new Set(bank.questions.map(q=>q.id)).size===bank.questions.length);
  for(const q of bank.questions){assert(q.ma&&q.ca&&q.band&&q.skill);if(q.type==='choice'){assert.equal(q.options.length,5);assert(q.options[4].startsWith("I don't know"));assert(q.correct>=0&&q.correct<4);assert.equal(new Set(q.options.slice(0,4)).size,4);}}
  const payload=JSON.parse(fs.readFileSync(path.join(root,student+'s-Homeschool/assessments/'+subject+'.json'),'utf8'));
  assert(payload.questions.every(q=>!('correct'in q)&&!('ma'in q)&&!('band'in q)));
  await page.goto(base+'diagnostic.html?subject='+subject);await page.waitForSelector('#finish');
  await page.locator('#finish').click();assert((await page.locator('#validation').innerText()).includes('Please answer all'));
  await page.locator('input[name=answer][value="1"]').check();await page.locator('#next').click();await page.locator('#prev').click();assert(await page.locator('input[name=answer][value="1"]').isChecked());
  await page.locator('input[name=answer][value="2"]').check();await page.reload();await page.waitForSelector('#finish');assert(await page.locator('input[name=answer][value="2"]').isChecked());
  for(let i=0;i<bank.questions.length;i++){
   const q=bank.questions[i];
   if(q.type==='choice')await page.locator('input[name=answer][value="'+(q.knownExposure?4:q.correct)+'"]').check();
   else await page.locator('#writing-response').fill('Independent QA sample. <script> This text must remain literal. I solved the problem by planning carefully.');
   if(i<bank.questions.length-1)await page.locator('#next').click();
  }
  await page.locator('#review').click();assert.equal(await page.locator('.review-grid button').count(),bank.questions.length);
  if(subject==='reading'){assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(root,student+'-reading-mobile.png'),fullPage:true});}
  await page.locator('#finish').click();await page.getByRole('heading',{name:'Assessment submitted'}).waitFor();assert.equal(await page.locator('input').count(),0);
  await page.reload();await page.getByRole('heading',{name:'Assessment submitted'}).waitFor();
  record(student+' '+subject+': '+bank.questions.length+' items, A–E, required responses, navigation, edits, resume and lock');
 }
 await page.goto(base+'math-assessment.html');
 if(student==='Brody'){
  await page.locator('#submitAssessmentBtn').click();assert(await page.locator('#submitPanel').isVisible());assert.equal(await page.locator('input[type=radio]').count(),68*5);
  await page.locator('input[name=q1][value="4"]').check();await page.reload();assert(await page.locator('input[name=q1][value="4"]').isChecked());
  await page.evaluate(()=>{let s=JSON.parse(localStorage.getItem('brodyMathDiagnosticV1'));for(let i=1;i<=68;i++)s.answers['q'+i]=4;localStorage.setItem('brodyMathDiagnosticV1',JSON.stringify(s));});await page.reload();await page.locator('#submitAssessmentBtn').click();assert(await page.locator('#donePanel').isVisible());assert(!(await page.locator('#assessmentRoot').isVisible()));
 }else{
  assert(!(await page.locator('#submit').isVisible()));assert(!(await page.locator('#done').isVisible()));
  await page.locator('input[value="E"]').check();await page.locator('#next').click();await page.reload();assert((await page.locator('#progress').innerText()).includes('Question 2'));
  await page.evaluate(()=>{let s=JSON.parse(localStorage.getItem('rory_math_baseline_v1'));s.index=44;localStorage.setItem('rory_math_baseline_v1',JSON.stringify(s));});await page.reload();await page.locator('#submit').click();assert(await page.locator('#missing').isVisible());
  await page.evaluate(()=>{let s=JSON.parse(localStorage.getItem('rory_math_baseline_v1'));for(let i=1;i<=45;i++)s.answers[i]='E';localStorage.setItem('rory_math_baseline_v1',JSON.stringify(s));});await page.reload();await page.locator('#submit').click();assert(await page.locator('#done').isVisible());assert(!(await page.locator('#question').isVisible()));
 }
 record(student+' math required responses, E, saved progress and hidden locked attempt');
 await page.goto(base+'parent.html');assert(await page.locator('#gate').isVisible());assert(!(await page.locator('#parent-content').isVisible()));
 await page.locator('#parent-pass').fill('QA-parent-passphrase');await page.locator('#confirm-pass').fill('QA-parent-passphrase');await page.locator('#unlock button').click();await page.locator('#domains .parent-domain').first().waitFor();
 const [dl]=await Promise.all([page.waitForEvent('download'),page.locator('#export-all').click()]);const backup=JSON.parse(fs.readFileSync(await dl.path(),'utf8'));
 assert.equal(backup.student,student);assert.equal(backup.record.logs.find(x=>x.id==='qa-log').minutes,37);assert.equal(Object.keys(backup.attempts).length,5);
 const rows=backup.diagnosticReport.assessments.flatMap(b=>b.responses);assert(rows.length>170);assert(rows.some(r=>r.rubric&&r.responseText.includes('<script>')));assert(rows.every(r=>r.maExpectation&&r.californiaStandardOrDomain));
 if(student==='Brody'){assert(backup.diagnosticReport.domains.some(g=>g.domain==='Ancient Rome'&&g.status.includes('instructional transition gap')));assert(backup.diagnosticReport.instructionalBridge.recommendedSequence.includes('Roman Republic and institutions'));}
 await page.locator('[data-rubric]').first().selectOption('2');await page.locator('#context').fill('Parent verified local record history.');await page.locator('#context').blur();
 const [csv]=await Promise.all([page.waitForEvent('download'),page.locator('#export-items').click()]);assert(fs.readFileSync(await csv.path(),'utf8').includes('diagnosticBand'));
 await page.setViewportSize({width:1280,height:900});await page.screenshot({path:path.join(root,student+'-parent-desktop.png'),fullPage:true});
 await page.emulateMedia({media:'print'});await page.pdf({path:path.join(root,student+'-report-qa.pdf'),format:'A4'});await page.emulateMedia({media:'screen'});
 await page.reload();assert(await page.locator('#gate').isVisible());await page.locator('#parent-pass').fill('QA-parent-passphrase');await page.locator('#unlock button').click();await page.locator('#domains .parent-domain').first().waitFor();assert.equal(await page.locator('[data-rubric]').first().inputValue(),'2');
 assert.deepEqual(errors,[]);record(student+' parent gate, JSON/CSV exports, complete backup, rubric persistence, print and no runtime errors');
 await ctx.close();
}
await browser.close();fs.writeFileSync(path.join(root,'qa-results.json'),JSON.stringify({passed:results.length,results},null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
