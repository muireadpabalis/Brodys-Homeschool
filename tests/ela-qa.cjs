const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const base=process.env.ELA_QA_URL||'http://127.0.0.1:8766/Brodys-Homeschool/';
const out=process.env.ELA_QA_OUT||__dirname;
const results=[];const pass=s=>{results.push(s);console.log('PASS '+s)};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
 const context=await browser.newContext({acceptDownloads:true}),page=await context.newPage();
 const errors=[],requests=[];page.on('pageerror',err=>errors.push(err.message));page.on('request',r=>requests.push(r.url()));page.on('dialog',d=>d.accept());
 await page.goto(base);await page.waitForSelector('[data-ela-id]',{state:'attached'});
 const curriculum=await page.evaluate(()=>ELA_CURRICULUM);
 assert.equal(curriculum.assignments.length,39);assert.equal(new Set(curriculum.assignments.map(a=>a.id)).size,39);
 await page.evaluate(()=>{let d=JSON.parse(localStorage.getItem(PORTAL.recordKey));d.logs.push({id:'legacy-log',subject:'Science',date:'2026-09-02',activity:'Existing work',minutes:42,notes:'Keep original'});d.portfolio.push({id:'legacy-sample',subject:'English Language Arts',title:'Existing sample',date:'2026-09-02',description:'Keep original'});localStorage.setItem(PORTAL.recordKey,JSON.stringify(d));localStorage.setItem('brodyBaseline2026_writing',JSON.stringify({answers:{q1:{text:'original baseline response'}},submittedAt:'2026-09-02T12:00:00Z'}));});
 await page.reload();await page.reload();assert.equal(await page.locator('[data-ela-id]').count(),39);assert.equal(await page.locator('#minutesCount').innerText(),'42');
 for(let week=1;week<=7;week++){
  await page.locator('[data-view="assignments"]').click();await page.locator('#subjectFilter').selectOption('English Language Arts');await page.locator('#elaWeekFilter').selectOption(String(week));
  assert.equal(await page.locator('[data-ela-id]').count(),curriculum.assignments.filter(a=>a.week===week).length);
  assert((await page.locator('#assignmentList').innerText()).includes('Week '+week+'.'));
 }
 pass('39 stable assignments, correct week filters, repeated migration and legacy records preserved');
 await page.goto(base+'ela.html?id=ela7-w1-5');assert(await page.getByRole('heading',{name:'Save the earlier stage first'}).isVisible());
 await page.goto(base+'ela.html?id=ela7-w7-3');assert(await page.getByRole('heading',{name:'Ready for a new prompt'}).isVisible());assert.equal(await page.locator('textarea').count(),0);
 pass('Outline prerequisite and unreleased final task are enforced');
 for(const a of curriculum.assignments){
  if(a.independent||a.requires==='ela7-w7-3')continue;
  await page.goto(base+'ela.html?id='+a.id);assert(await page.getByRole('heading',{name:a.title,exact:true}).isVisible());
  for(const f of a.fields){await page.locator('#'+f.id).fill('QA '+a.id+' '+f.id+'\nOriginal learner response <not HTML>.');}
  if(a.checklist)await page.locator('[data-check]').first().check();
  await page.reload();
  for(const f of a.fields)assert((await page.locator('#'+f.id).inputValue()).includes('QA '+a.id+' '+f.id));
  if(a.checklist)assert(await page.locator('[data-check]').first().isChecked());
  await page.locator('#checkpoint').click();assert((await page.locator('#ela-status').innerText()).includes('Checkpoint preserved'));
  await page.locator('#f1').fill('QA revised '+a.id);await page.locator('#checkpoint').click();
  const state=await page.evaluate(id=>ELAStore.work(id),a.id);assert.equal(state.snapshots.length,2);assert(state.snapshots[0].fields.f1.startsWith('QA '+a.id));assert.equal(state.snapshots[1].fields.f1,'QA revised '+a.id);
 }
 pass('Every teaching assignment opens; all text fields, organizers, checklists and separate draft checkpoints survive reload');
 await page.goto(base+'parent.html');assert(await page.locator('#gate').isVisible());assert.equal(await page.locator('#ela-parent').innerText(),'');
 assert(!requests.some(url=>url.includes('.parent.json')));pass('No parent content rendered or answer-key payload requested before parent unlock');
 await page.locator('#parent-pass').fill('qa-parent-passphrase');await page.locator('#confirm-pass').fill('qa-parent-passphrase');await page.locator('#unlock button').click();await page.waitForSelector('#ela-release');
 await page.locator('#ela-release').click();assert((await page.locator('#ela-parent-status').innerText()).includes('confirm'));
 await page.locator('#ela-novel').check();await page.locator('#ela-release').click();
 const review=page.locator('[data-review="ela7-w1-6"]');await review.locator('summary').first().click();
 await review.locator('select[data-dimension="assistance"]').selectOption('3');await review.locator('select[data-dimension="Organization"]').selectOption('2');await review.locator('textarea').fill('PRIVATE parent observation');
 await page.reload();await page.locator('#parent-pass').fill('qa-parent-passphrase');await page.locator('#unlock button').click();await page.waitForSelector('#ela-export');
 assert.equal(await page.locator('[data-review="ela7-w1-6"] select[data-dimension="assistance"]').inputValue(),'3');assert.equal(await page.locator('[data-review="ela7-w1-6"] textarea').inputValue(),'PRIVATE parent observation');
 pass('Parent gate, new-prompt confirmation, separate quality rubric, assistance and comments persist');
 await page.goto(base+'ela.html?id=ela7-w7-3');assert.equal(await page.locator('textarea').count(),1);assert.equal(await page.locator('#ela-body').innerText().then(s=>s.includes('PRIVATE')),false);
 for(let stage=0;stage<4;stage++){
  assert.equal(await page.locator('textarea').count(),1);assert(await page.locator('#f'+(stage+1)).isVisible());
  assert.equal(await page.locator('textarea[placeholder]').count(),0);
  await page.locator('textarea').fill('Independent stage '+stage);await page.reload();assert.equal(await page.locator('textarea').inputValue(),'Independent stage '+stage);
  await page.locator('#checkpoint').click();
 }
 const final=await page.evaluate(()=>ELAStore.work('ela7-w7-3'));assert.equal(final.stage,4);assert.equal(final.snapshots.length,4);assert.equal(final.fields.f3,'Independent stage 2');assert.equal(await page.locator('textarea').count(),0);
 const downloadPromise=page.waitForEvent('download');await page.locator('#export-work').click();const dl=await downloadPromise;const studentExport=JSON.parse(fs.readFileSync(await dl.path(),'utf8'));assert(!JSON.stringify(studentExport).includes('PRIVATE'));assert(!('elaParent' in studentExport));
 pass('Final prompt has no supplied ideas or starters; four blank stages save independently; student export excludes parent metadata');
 await page.goto(base+'ela.html?id=ela7-w7-4');await page.locator('#f1').fill('I planned independently.');await page.locator('#checkpoint').click();
 await page.goto(base+'index.html#ela');assert.equal(await page.locator('[data-ela-id] .badge.complete').count(),39);const data=await page.evaluate(()=>JSON.parse(localStorage.getItem(PORTAL.recordKey)));assert.equal(data.portfolio.length,40);assert.equal(data.logs[0].notes,'Keep original');assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('brodyBaseline2026_writing')).answers.q1.text),'original baseline response');
 pass('All 39 assignments complete through saved evidence; portfolio and original baseline/log/sample preserved');
 await page.goto(base+'parent.html');await page.locator('#parent-pass').fill('qa-parent-passphrase');await page.locator('#unlock button').click();await page.waitForSelector('#ela-export');
 const dp=page.waitForEvent('download');await page.locator('#export-all').click();const backupDl=await dp;const backupPath=await backupDl.path(),backup=JSON.parse(fs.readFileSync(backupPath,'utf8'));assert.equal(Object.keys(backup.elaEvidence).length,39);assert.equal(backup.elaParent.reviews['ela7-w1-6'].assistance,'3');assert.equal(backup.elaEvidence['ela7-w7-3'].fields.f4,'Independent stage 3');
 const ctx2=await browser.newContext({acceptDownloads:true}),p2=await ctx2.newPage();let restored;const restoreDone=new Promise(resolve=>restored=resolve);p2.on('dialog',async d=>{const message=d.message();await d.accept();if(message.startsWith('Backup merged'))restored();});await p2.goto(base);await p2.goto(base+'parent.html');await p2.locator('#parent-pass').fill('qa-new-passphrase');await p2.locator('#confirm-pass').fill('qa-new-passphrase');await p2.locator('#unlock button').click();await p2.waitForSelector('#ela-export');await p2.locator('#restore-file').setInputFiles(backupPath);await restoreDone;
 assert.equal(await p2.evaluate(()=>ELAStore.read(ELAStore.reviewKey).reviews['ela7-w1-6'].comments),'PRIVATE parent observation');
 await p2.goto(base+'ela.html?id=ela7-w1-1');assert.equal(await p2.locator('#f1').inputValue(),'QA revised ela7-w1-1');
 pass('Complete backup exports and restores drafts, organizers, checkpoints, final prompt and private parent review to a fresh browser');
 await page.goto(base+'ela.html?id=ela7-w1-1');await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(out,'ela-mobile-qa.png'),fullPage:true});
 await page.setViewportSize({width:1365,height:1000});await page.screenshot({path:path.join(out,'ela-desktop-qa.png'),fullPage:true});
 // Inject storage failure only in this isolated test page; existing samples must not be overwritten.
 await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new Error('Simulated quota failure')};});await page.locator('#f1').fill('Unsaved QA recovery response');assert((await page.locator('#ela-status').innerText()).includes('NOT SAVED'));
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('brodyELABridge2026_ela7-w1-1')).fields.f1),'QA revised ela7-w1-1');
 pass('Mobile layout fits; storage failures are visible and preserve previously saved responses');
 assert.deepEqual(errors,[]);pass('No JavaScript errors during the complete workflow');
 fs.writeFileSync(path.join(out,'ela-qa-results.json'),JSON.stringify({testedAt:new Date().toISOString(),assignments:39,results},null,2));
 await browser.close();
})().catch(err=>{console.error(err);process.exit(1)});
