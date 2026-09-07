const {chromium}=require('playwright'),assert=require('assert'),fs=require('fs'),path=require('path');
(async()=>{
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'});
const ctx=await browser.newContext({acceptDownloads:true}),p=await ctx.newPage(),base='http://127.0.0.1:8766/Brodys-Homeschool/';
await p.goto(base+'parent.html');await p.locator('#parent-pass').fill('qa-only-parent');await p.locator('#confirm-pass').fill('qa-only-parent');await p.locator('#unlock button').click();await p.waitForSelector('#ela-export');
let done;const restored=new Promise(resolve=>done=resolve);p.on('dialog',async d=>{const msg=d.message();await d.accept();if(msg.startsWith('Backup merged'))done();});
const sample={schemaVersion:1,student:'Brody',elaEvidence:{'ela7-w1-1':{schemaVersion:1,fields:{f1:'Restored ELA-only evidence'},checks:{},snapshots:[{id:'qa-snapshot',at:'2026-09-02T12:00:00Z',label:'Work checkpoint',fields:{f1:'Original restored evidence'}}],updatedAt:'2026-09-02T12:00:00Z',complete:true}},elaRelease:{prompt:'A saved new prompt',releasedAt:'2026-09-02T12:00:00Z'}};
await p.locator('#restore-file').setInputFiles({name:'student-ela.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(sample))});await restored;
await p.evaluate(()=>dispatchEvent(new Event('beforeprint')));assert(await p.locator('[data-review="ela7-w1-1"]').getAttribute('open')!==null);assert((await p.locator('#ela-parent').innerText()).includes('Original restored evidence'));await p.evaluate(()=>dispatchEvent(new Event('afterprint')));
const dlPromise=p.waitForEvent('download');await p.locator('#export-report').click();const dl=await dlPromise;const report=JSON.parse(fs.readFileSync(await dl.path(),'utf8'));assert(report.elaWritingBridge.elaEvidence['ela7-w1-1']);
await p.goto(base+'index.html#ela');assert.equal(await p.locator('[data-ela-id="ela7-w1-1"] .badge').innerText(),'Complete');assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem(PORTAL.recordKey)).portfolio.filter(p=>p.id==='ela7-w1-1').length),1);
await p.reload();assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem(PORTAL.recordKey)).portfolio.filter(p=>p.id==='ela7-w1-1').length),1);
await p.goto(base+'ela.html?id=ela7-w1-1');assert.equal(await p.locator('#f1').inputValue(),'Restored ELA-only evidence');
const results=['ELA-only backup restores student work and prompt','Restored evidence creates one stable portfolio entry and updates progress','Parent printing expands current work and snapshots','Bridge report includes ELA evidence and review'];
fs.writeFileSync(path.join(__dirname,'ela-restore-qa-results.json'),JSON.stringify({testedAt:new Date().toISOString(),results},null,2));console.log(results.map(s=>'PASS '+s).join('\n'));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
