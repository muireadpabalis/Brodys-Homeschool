
const STORAGE_KEY="brodyHomeschoolRecordV1";
const starterData={
assignments:[
{id:crypto.randomUUID(),title:"Massachusetts Grade 6 Math Exit Diagnostic",subject:"Mathematics",due:"2026-08-31",description:"Massachusetts-standards diagnostic to identify where Grade 6 mathematics instruction left off.",link:"math-assessment.html",complete:false,completedDate:""},
{id:crypto.randomUUID(),title:"Massachusetts Grade 6 ELA Exit Diagnostic",subject:"English Language Arts",due:"2026-09-01",description:"Massachusetts-standards diagnostic for Grade 6 reading, writing, vocabulary, grammar, and language.",link:"",complete:false,completedDate:""},
{id:crypto.randomUUID(),title:"Massachusetts Grade 6 Science Exit Diagnostic",subject:"Science",due:"2026-09-02",description:"Massachusetts-standards diagnostic to identify previously taught Grade 6 science knowledge and practices.",link:"",complete:false,completedDate:""},
{id:crypto.randomUUID(),title:"Massachusetts Grade 6 Social Studies Exit Diagnostic",subject:"Social Studies",due:"2026-09-03",description:"Massachusetts-standards diagnostic to identify where Grade 6 history, civics, geography, and map-skills instruction left off.",link:"",complete:false,completedDate:""}],
assessments:[
{id:"math",title:"Massachusetts Grade 6 Mathematics Exit Diagnostic",subject:"Mathematics",date:"2026-08-31",score:"",notes:"",status:"Not started",link:"math-assessment.html"},
{id:"ela",title:"Massachusetts Grade 6 ELA / Reading / Writing Exit Diagnostic",subject:"English Language Arts",date:"2026-09-01",score:"",notes:"",status:"Not started",link:""},
{id:"science",title:"Massachusetts Grade 6 Science Exit Diagnostic",subject:"Science",date:"2026-09-02",score:"",notes:"",status:"Not started",link:""},
{id:"social",title:"Massachusetts Grade 6 Social Studies / Geography Exit Diagnostic",subject:"Social Studies",date:"2026-09-03",score:"",notes:"",status:"Not started",link:""}],
logs:[],portfolio:[]};
let data=localStorage.getItem(STORAGE_KEY)?JSON.parse(localStorage.getItem(STORAGE_KEY)):structuredClone(starterData);

// Keep the one-time Math Diagnostic linked even for browsers that already saved older starter data.
const mathAssessment=data.assessments?.find(a=>a.id==="math"); if(mathAssessment && !mathAssessment.link) mathAssessment.link="math-assessment.html";
const mathAssignment=data.assignments?.find(a=>a.subject==="Mathematics"&&a.title.includes("Diagnostic")); if(mathAssignment && !mathAssignment.link) mathAssignment.link="math-assessment.html";
localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));renderAll()}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function niceDate(d){if(!d)return"No date";return new Date(d+"T12:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}
function setView(id){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.view===id));window.scrollTo({top:0,behavior:"smooth"})}
document.querySelectorAll(".tab").forEach(t=>t.onclick=()=>setView(t.dataset.view));document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>setView(b.dataset.go));
function renderDashboard(){const c=data.assignments.filter(a=>a.complete).length,t=data.assignments.length,p=t?Math.round(c/t*100):0;overallPercent.textContent=p+"%";dueCount.textContent=t-c;completedCount.textContent=c;minutesCount.textContent=data.logs.reduce((s,l)=>s+Number(l.minutes||0),0);portfolioCount.textContent=data.portfolio.length;todayText.textContent=new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric",year:"numeric"});const next=[...data.assignments].filter(a=>!a.complete).sort((a,b)=>(a.due||"9999").localeCompare(b.due||"9999")).slice(0,4);nextAssignments.innerHTML=next.length?next.map(a=>`<div class="mini-card"><span class="badge">${esc(a.subject)}</span><h3>${esc(a.title)}</h3><div class="meta">${a.due?"Due "+niceDate(a.due):"No due date"}</div></div>`).join(""):`<p class="empty">No open assignments.</p>`;const logs=[...data.logs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4);recentLogs.innerHTML=logs.length?logs.map(l=>`<div class="mini-card"><span class="badge">${esc(l.subject)}</span><h3>${esc(l.activity)}</h3><div class="meta">${niceDate(l.date)} · ${l.minutes} min</div></div>`).join(""):`<p class="empty">No learning logs yet.</p>`}
function renderAssignments(){const sf=subjectFilter.value,st=statusFilter.value;const f=data.assignments.filter(a=>(sf==="all"||a.subject===sf)&&(st==="all"||(st==="complete"&&a.complete)||(st==="open"&&!a.complete)));assignmentList.innerHTML=f.length?f.map(a=>`<article class="record-card"><span class="badge ${a.complete?"complete":""}">${a.complete?"Complete":esc(a.subject)}</span><h3>${esc(a.title)}</h3><div class="meta">${esc(a.subject)}${a.due?" · Due "+niceDate(a.due):""}${a.completedDate?" · Finished "+niceDate(a.completedDate):""}</div>${a.description?`<p>${esc(a.description)}</p>`:""}<div class="actions"><button onclick="toggleAssignment('${a.id}')">${a.complete?"Mark Open":"Mark Complete"}</button>${a.link?`<a href="${esc(a.link)}" target="_blank">Open Resource</a>`:""}<button onclick="deleteAssignment('${a.id}')">Delete</button></div></article>`).join(""):`<p class="empty">No assignments match these filters.</p>`}
window.toggleAssignment=id=>{const a=data.assignments.find(x=>x.id===id);a.complete=!a.complete;a.completedDate=a.complete?new Date().toISOString().slice(0,10):"";saveData()};window.deleteAssignment=id=>{if(confirm("Delete this assignment?")){data.assignments=data.assignments.filter(x=>x.id!==id);saveData()}};
function renderAssessments(){assessmentList.innerHTML=data.assessments.map(a=>`<article class="record-card"><span class="badge">${esc(a.subject)}</span><h3>${esc(a.title)}</h3><div class="meta">${niceDate(a.date)} · ${esc(a.status)}</div><div class="form-grid" style="margin-top:14px;margin-bottom:0"><label>Status<select onchange="updateAssessment('${a.id}','status',this.value)">${["Not started","In progress","Complete"].map(v=>`<option ${a.status===v?"selected":""}>${v}</option>`).join("")}</select></label><label>Score / result<input value="${esc(a.score)}" onchange="updateAssessment('${a.id}','score',this.value)"></label><label>Assessment link<input value="${esc(a.link)}" onchange="updateAssessment('${a.id}','link',this.value)" placeholder="https://..."></label><label class="full">Notes / skills to revisit<textarea rows="3" onchange="updateAssessment('${a.id}','notes',this.value)">${esc(a.notes)}</textarea></label></div>${a.link?`<div class="actions"><a href="${esc(a.link)}" target="_blank">Open Assessment</a></div>`:""}</article>`).join("")}
window.updateAssessment=(id,f,v)=>{data.assessments.find(a=>a.id===id)[f]=v;saveData()};
function renderLogs(){const logs=[...data.logs].sort((a,b)=>b.date.localeCompare(a.date));logList.innerHTML=logs.length?logs.map(l=>`<article class="record-card"><span class="badge">${esc(l.subject)}</span><h3>${esc(l.activity)}</h3><div class="meta">${niceDate(l.date)} · ${l.minutes} minutes</div>${l.notes?`<p>${esc(l.notes)}</p>`:""}<div class="actions"><button onclick="deleteLog('${l.id}')">Delete</button></div></article>`).join(""):`<p class="empty">No learning logs yet.</p>`}window.deleteLog=id=>{if(confirm("Delete this learning log?")){data.logs=data.logs.filter(x=>x.id!==id);saveData()}};
function renderPortfolio(){const items=[...data.portfolio].sort((a,b)=>b.date.localeCompare(a.date));portfolioList.innerHTML=items.length?items.map(p=>`<article class="record-card"><span class="badge">${esc(p.subject)}</span><h3>${esc(p.title)}</h3><div class="meta">${niceDate(p.date)}</div>${p.description?`<p>${esc(p.description)}</p>`:""}<div class="actions">${p.link?`<a href="${esc(p.link)}" target="_blank">Open Work Sample</a>`:""}<button onclick="deletePortfolio('${p.id}')">Delete</button></div></article>`).join(""):`<p class="empty">No portfolio work samples yet.</p>`}window.deletePortfolio=id=>{if(confirm("Delete this work sample?")){data.portfolio=data.portfolio.filter(x=>x.id!==id);saveData()}};
function renderReports(){const by={};data.logs.forEach(l=>{by[l.subject]??={minutes:0,sessions:0};by[l.subject].minutes+=Number(l.minutes||0);by[l.subject].sessions++});const rows=Object.entries(by).sort().map(([s,v])=>`<tr><td>${esc(s)}</td><td>${v.sessions}</td><td>${v.minutes}</td></tr>`).join("");reportSummary.innerHTML=`<p><strong>Assignments:</strong> ${data.assignments.filter(a=>a.complete).length} completed of ${data.assignments.length}</p><p><strong>Learning time logged:</strong> ${data.logs.reduce((s,l)=>s+Number(l.minutes||0),0)} minutes</p><p><strong>Portfolio work samples:</strong> ${data.portfolio.length}</p><p><strong>Assessments complete:</strong> ${data.assessments.filter(a=>a.status==="Complete").length} of ${data.assessments.length}</p>${rows?`<table class="report-table"><thead><tr><th>Subject</th><th>Sessions</th><th>Minutes</th></tr></thead><tbody>${rows}</tbody></table>`:"<p class='empty'>Subject totals will appear after learning logs are added.</p>"}`}

const californiaSubjects = [
  {
    id:"ela", name:"English Language Arts", status:"Core California Grade 7",
    summary:"Literature, informational reading, writing, language, speaking, listening, research, and evidence.",
    topics:["Reading: Literature","Reading: Informational Text","Argument Writing","Informative/Explanatory Writing","Narrative Writing","Research & Source Citation","Language & Grammar","Vocabulary","Speaking & Listening"]
  },
  {
    id:"math", name:"Mathematics", status:"Core California Grade 7",
    summary:"California Grade 7 mathematics standards and mathematical practices.",
    topics:["Ratios & Proportional Relationships","The Number System","Expressions & Equations","Geometry","Statistics & Probability","Mathematical Practices"]
  },
  {
    id:"science", name:"Science (CA NGSS)", status:"Core California Middle School",
    summary:"California Next Generation Science Standards using middle-school physical, life, Earth/space, and engineering practices.",
    topics:["Physical Science","Life Science","Earth & Space Science","Engineering Design","Science & Engineering Practices","Crosscutting Concepts"]
  },
  {
    id:"social", name:"History–Social Science", status:"Core California Grade 7",
    summary:"California Grade 7 history–social science with geography, civics, economics, and historical analysis.",
    topics:["World History & Geography","Medieval & Early Modern Civilizations","Historical Analysis","Geography","Civics & Government","Economics","Primary & Secondary Sources"]
  },
  {
    id:"worldlang", name:"World Language", status:"California course-of-study area",
    summary:"World-language study beginning no later than Grade 7, with communication across listening, speaking, reading, and writing.",
    topics:["Interpretive Communication","Interpersonal Communication","Presentational Communication","Cultures","Connections","Language Structures"]
  },
  {
    id:"pe", name:"Physical Education", status:"California course-of-study area",
    summary:"Fitness, movement skills, physical activity, and knowledge supporting health and vigor.",
    topics:["Physical Fitness","Movement Skills","Individual & Dual Activities","Team Activities","Fitness Planning","Physical Activity Log"]
  },
  {
    id:"arts", name:"Visual & Performing Arts", status:"California course-of-study area",
    summary:"Creative expression and aesthetic understanding across California's arts disciplines.",
    topics:["Visual Arts","Music","Theatre","Dance","Media Arts","Creating","Performing/Presenting","Responding","Connecting"]
  },
  {
    id:"applied", name:"Applied Arts", status:"California course-of-study area",
    summary:"Practical applied learning such as consumer skills, industrial arts, business, agriculture, and home/life applications.",
    topics:["Consumer Skills","Personal Finance Foundations","Design & Making","General Business","Agriculture & Environment","Home & Life Skills"]
  },
  {
    id:"cte", name:"Career Technical Education", status:"California course-of-study area",
    summary:"Career awareness and technical learning connected to interests, occupations, and real-world skills.",
    topics:["Career Exploration","Workplace Skills","Problem Solving","Technical Communication","Projects & Design","Career Pathway Awareness"]
  },
  {
    id:"health", name:"Health Education", status:"California standards / school readiness",
    summary:"Age-appropriate health knowledge and decision-making aligned to California health standards.",
    topics:["Personal & Community Health","Nutrition & Physical Activity","Mental, Emotional & Social Health","Injury Prevention & Safety","Alcohol, Tobacco & Other Drugs","Growth, Development & Sexual Health"]
  },
  {
    id:"cs", name:"Computer Science & Digital Literacy", status:"California standards / supplemental",
    summary:"Middle-school computing, data, algorithms, programming, networks, impacts of computing, and responsible digital work.",
    topics:["Computing Systems","Networks & Internet","Data & Analysis","Algorithms & Programming","Impacts of Computing","Digital Citizenship"]
  },
  {
    id:"driver", name:"Driver Education", status:"California Grades 7–12 course-of-study area",
    summary:"A statutory California course-of-study area for grades 7–12; not treated as a Grade 7 baseline test.",
    topics:["Traffic Laws","Personal Responsibility","Traffic Safety","Causes & Consequences of Collisions","Motorcycle Awareness","Safe Road Use"]
  }
];

function renderSubjects(){
  const grid=document.getElementById("subjectGrid");
  const detail=document.getElementById("subjectDetail");
  if(!grid||!detail) return;
  grid.innerHTML=californiaSubjects.map(s=>`
    <button class="subject-card" type="button" data-subject-id="${s.id}">
      <span class="badge">${esc(s.status)}</span>
      <h3>${esc(s.name)}</h3>
      <p>${esc(s.summary)}</p>
    </button>`).join("");
  grid.querySelectorAll(".subject-card").forEach(btn=>btn.addEventListener("click",()=>{
    const s=californiaSubjects.find(x=>x.id===btn.dataset.subjectId);
    detail.hidden=false;
    detail.innerHTML=`<p class="eyebrow">${esc(s.status)}</p><h2>${esc(s.name)}</h2><p>${esc(s.summary)}</p>
      <h3>Topic links</h3><ul class="topic-list">${s.topics.map(t=>`<li><a href="#assignments" class="topic-link" data-topic="${esc(t)}" data-subject="${esc(s.name)}">${esc(t)}</a></li>`).join("")}</ul>
      <p class="privacy-note">These topic links are the instructional structure. Brody's initial baseline assessments remain Massachusetts-standards diagnostics only.</p>`;
    detail.querySelectorAll(".topic-link").forEach(a=>a.addEventListener("click",e=>{
      e.preventDefault();
      setView("assignments");
      const sf=document.getElementById("subjectFilter");
      if([...sf.options].some(o=>o.value===s.name)) sf.value=s.name;
      renderAssignments();
    }));
    detail.scrollIntoView({behavior:"smooth",block:"start"});
  }));
}

function renderAll(){renderDashboard();renderSubjects();renderAssignments();renderAssessments();renderLogs();renderPortfolio();renderReports()}
subjectFilter.onchange=renderAssignments;statusFilter.onchange=renderAssignments;
const assignmentDialog=document.getElementById("assignmentDialog");addAssignmentBtn.onclick=()=>assignmentDialog.showModal();document.querySelectorAll(".close-dialog").forEach(b=>b.onclick=()=>b.closest("dialog").close());
assignmentForm.onsubmit=e=>{e.preventDefault();data.assignments.push({id:crypto.randomUUID(),title:assignmentTitle.value.trim(),subject:assignmentSubject.value,due:assignmentDue.value,description:assignmentDescription.value.trim(),link:assignmentLink.value.trim(),complete:false,completedDate:""});e.target.reset();assignmentDialog.close();saveData()};
const portfolioDialog=document.getElementById("portfolioDialog");addPortfolioBtn.onclick=()=>{portfolioDate.value=new Date().toISOString().slice(0,10);portfolioDialog.showModal()};
portfolioForm.onsubmit=e=>{e.preventDefault();data.portfolio.push({id:crypto.randomUUID(),title:portfolioTitle.value.trim(),subject:portfolioSubject.value,date:portfolioDate.value,description:portfolioDescription.value.trim(),link:portfolioLink.value.trim()});e.target.reset();portfolioDialog.close();saveData()};
logDate.value=new Date().toISOString().slice(0,10);logForm.onsubmit=e=>{e.preventDefault();data.logs.push({id:crypto.randomUUID(),date:logDate.value,subject:logSubject.value,minutes:Number(logMinutes.value),activity:logActivity.value.trim(),notes:logNotes.value.trim()});e.target.reset();logDate.value=new Date().toISOString().slice(0,10);saveData()};
function download(filename,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),500)}
exportJsonBtn.onclick=()=>download(`brody-homeschool-record-${new Date().toISOString().slice(0,10)}.json`,JSON.stringify(data,null,2),"application/json");
exportCsvBtn.onclick=()=>{const h=["date","subject","minutes","activity","notes"],q=v=>`"${String(v??"").replaceAll('"','""')}"`;download(`brody-learning-log-${new Date().toISOString().slice(0,10)}.csv`,[h.join(","),...data.logs.map(l=>h.map(k=>q(l[k])).join(","))].join("\n"),"text/csv")};
printReportBtn.onclick=()=>{setView("reports");setTimeout(()=>window.print(),100)};renderAll();
