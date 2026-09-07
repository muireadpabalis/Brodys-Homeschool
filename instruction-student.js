(() => {
  'use strict';
  const courseId = document.body.dataset.course;
  const store = window.InstructionRegistry?.[courseId];
  const host = document.getElementById('instruction-app');
  const errorBox = document.getElementById('instruction-error');
  if (!store || !host) return;
  const C = store.course, e = store.escape, params = new URLSearchParams(location.search);
  let active = null, state = null, externalConflict = false;

  function fail(error) {
    errorBox.hidden = false;
    errorBox.textContent = error.message+' The completed baseline and other subject records were not changed.';
  }
  function routine() {
    return '<div class="instruction-routine" aria-label="Reasoning routine">'+C.routine.map(item => '<span>'+e(item)+'</span>').join('<b aria-hidden="true">→</b>')+'</div>';
  }
  function navigation() {
    return '<nav class="instruction-nav" aria-label="'+e(C.subject)+' weeks"><a href="'+e(C.page)+'">Course overview</a>'+C.weeks.map(week => `<a href="${e(C.page)}?id=${e(week.id)}" ${active?.id===week.id?'aria-current="page"':''}>Week ${week.week} · ${e(week.title)}<small>${e(week.subtitle)}</small></a>`).join('')+'</nav>';
  }
  function visual(week) {
    const visual = week.visual;
    if (!visual?.items?.length) return '';
    return `<figure class="instruction-visual"><figcaption>${e(visual.title)}</figcaption><div>${visual.items.map((item,index) => `<span>${e(item)}</span>${index<visual.items.length-1?'<b aria-hidden="true">→</b>':''}`).join('')}</div>${visual.note?`<p>${e(visual.note)}</p>`:''}</figure>`;
  }
  function field(definition, value) {
    const id = e(definition.id), label = e(definition.label || definition.prompt), wide = (definition.rows || 0) >= 3 ? ' wide' : '';
    if (definition.type === 'select') return `<label class="${wide}">${label}<select data-instruction-field="${id}"><option value="">Choose…</option>${definition.options.map(option => `<option ${value===option?'selected':''}>${e(option)}</option>`).join('')}</select></label><p class="print-only instruction-response">${label}: ${e(value || 'No response recorded.')}</p>`;
    return `<label class="${wide}">${label}<textarea data-instruction-field="${id}" rows="${definition.rows || 2}">${e(value || '')}</textarea></label><div class="print-only instruction-response">${e(value || 'No response recorded.')}</div>`;
  }
  function activity(block, stage) {
    return `<section class="panel instruction-activity"><span class="instruction-stage">${e(stage)}</span><h2>${e(block.title)}</h2>${block.prompt?`<p><strong>${e(block.prompt)}</strong></p>`:''}<ol>${(block.steps || block.directions || []).map(step => '<li>'+e(step)+'</li>').join('')}</ol>${(block.checks || []).map(([id,label]) => `<label class="instruction-task-check"><input type="checkbox" data-instruction-check="${e(id)}" ${state.taskChecks[id]?'checked':''}>${e(label)}</label>`).join('')}<div class="instruction-field-grid">${block.fields.map(item => field(item,state.fields[item.id])).join('')}</div></section>`;
  }
  function overview() {
    const records = store.evidence(), complete = C.weeks.filter(week => records[week.id]?.complete).length;
    host.innerHTML = `${routine()}<div class="instruction-layout">${navigation()}<div><section class="panel instruction-opening"><span class="instruction-stage">${e(C.gradeLabel)}</span><h2>${e(C.welcomeTitle)}</h2><p>${e(C.opening)}</p><p class="instruction-progress">${complete} of 7 Friday evidence checkpoints saved.</p><div class="actions"><button id="instruction-export">Download my ${e(C.subject)} work</button><a href="parent.html#${e(C.parentAnchor)}">Parent plan and review</a></div></section><div class="instruction-week-grid">${C.weeks.map(week => {const value=records[week.id];return `<article class="panel instruction-week-card"><span class="badge">Week ${week.week} · ${e(week.scope)}</span><h3>${e(week.title)}</h3><p>${e(week.subtitle)}</p><p><strong>Objective:</strong> ${e(week.objective)}</p><p class="instruction-progress">${value?.complete?'Checkpoint saved':value?.updatedAt?'Work in progress':'Ready to begin'}</p><div class="actions"><a href="${e(C.page)}?id=${e(week.id)}">${value?.complete?'Review saved work':value?.updatedAt?'Continue week':'Start week '+week.week}</a></div></article>`;}).join('')}</div><section class="panel instruction-note"><h3>Starting evidence stays in Records</h3><p>${e(C.baselineNote)}</p><p>Weekly checks cover only the lessons in that week. They are evidence for planning the next lesson, not diagnostic retests or percentage grades.</p></section></div></div>`;
    document.getElementById('instruction-export').onclick = exportWork;
  }
  function lesson() {
    active = C.weeks.find(week => week.id === params.get('id'));
    if (!active) throw Error('This '+C.subject+' week was not found.');
    state = store.work(active.id);
    document.title = 'Week '+active.week+': '+active.title+' · '+C.student+' '+C.subject;
    const parentLabel = active.parentPrep?.label || 'PARENT PREP';
    host.innerHTML = `${routine()}<div class="instruction-layout">${navigation()}<div><section class="panel instruction-opening"><span class="badge">Week ${active.week} · ${e(active.scope)}</span><h2>${e(active.title)}</h2><p>${e(active.subtitle)}</p><p><strong>This week’s objective:</strong> ${e(active.objective)}</p><div class="instruction-skill-list">${active.skills.map(skill => '<span>'+e(skill)+'</span>').join('')}</div><details><summary>Standards and course notes</summary><p>${(active.standards || []).map(e).join(' · ')}</p><p>${e(active.courseNote || 'This weekly sample supports instructional planning; it does not certify complete standards mastery.')}</p></details></section>${visual(active)}<section class="panel instruction-lesson"><span class="instruction-stage">LEARN</span><h2>${e(active.lessonTitle || 'Build the idea')}</h2>${active.lesson.map(paragraph => '<p>'+e(paragraph)+'</p>').join('')}${active.example?`<aside class="instruction-example"><h3>${e(active.example.title)}</h3>${active.example.lines.map(line => '<p>'+e(line)+'</p>').join('')}</aside>`:''}<h3>Words and tools for this week</h3><dl class="instruction-vocab">${(active.vocabulary || []).map(([term,definition]) => `<div><dt>${e(term)}</dt><dd>${e(definition)}</dd></div>`).join('')}</dl></section><section class="panel instruction-prep"><span class="instruction-stage parent">${e(parentLabel)}</span><h2>Get ready</h2><ul>${(active.parentPrep?.materials || []).map(item => '<li>'+e(item)+'</li>').join('')}</ul><p>${e(active.parentPrep?.note || 'A parent checks the directions and is available if help is requested.')}</p></section>${activity(active.guided,'GUIDED PRACTICE')}${activity(active.independent,'INDEPENDENT APPLICATION')}${activity(active.reasoning,'REASON & EXPLAIN')}<section class="panel instruction-checkpoint"><span class="instruction-stage friday">FRIDAY CHECKPOINT</span><h2>Show what this week taught you</h2><p>Answer these short questions using the lesson and your work. This checkpoint is saved for parent review.</p><div class="instruction-field-grid">${active.checkpoint.map(item => field(item,state.fields[item.id])).join('')}</div></section><section class="panel instruction-finish"><span class="instruction-stage parent">PARENT REVIEW</span> <span class="instruction-stage portfolio">PORTFOLIO-WORTHY</span><h2>Finish and save the week</h2><p>Show a parent your work. Record the help you used honestly; help is information for teaching, not a penalty.</p><label>Help used on this week<select data-instruction-field="assistance"><option value="">Choose honestly…</option>${store.assistanceLevels.map(level => `<option ${state.fields.assistance===level?'selected':''}>${e(level)}</option>`).join('')}</select></label><label>Optional private work-sample link<input type="url" data-instruction-field="artifact" value="${e(state.fields.artifact || '')}" placeholder="https://…"></label><label>What is included in my paper, photo, model, graph, or drawing?<textarea data-instruction-field="workSampleNote" rows="2">${e(state.fields.workSampleNote || '')}</textarea></label><p><strong>Keep for the portfolio:</strong> ${e(active.portfolio)}</p><p id="instruction-status" class="instruction-status" role="status" aria-live="polite">${state.updatedAt?(state.complete?'A checkpoint is saved. You may revise and save a later checkpoint.':'Work saved on this device.'):'Responses save on this device as you work.'}</p><div class="actions no-print"><button id="instruction-checkpoint" class="button">${state.complete?'Save a new Friday checkpoint':'Save Friday checkpoint & complete week'}</button><button id="instruction-export">Download my ${e(C.subject)} work</button><button id="instruction-print">Print this week</button></div><p class="instruction-help">Each checkpoint keeps a dated copy. Earlier checkpoints remain part of the record.</p></section>${state.snapshots.length?`<section class="panel instruction-summary"><h2>Saved checkpoints</h2>${state.snapshots.map(snapshot => `<details><summary>${e(new Date(snapshot.at).toLocaleString())} · ${e(snapshot.fields.assistance)}</summary>${active.reasoning.fields.concat(active.checkpoint).map(item => `<h3>${e(item.label || item.prompt)}</h3><div class="instruction-response">${e(snapshot.fields[item.id] || 'No response recorded.')}</div>`).join('')}</details>`).join('')}</section>`:''}<div class="actions"><a href="${e(C.page)}">All seven weeks</a><a href="index.html#${e(C.subjectHash)}">${e(C.subject)} assignments</a></div></div></div>`;
    document.querySelectorAll('[data-instruction-field]').forEach(element => {
      element.value = state.fields[element.dataset.instructionField] || '';
      element.addEventListener(element.tagName === 'TEXTAREA' || element.tagName === 'INPUT' ? 'input' : 'change', () => persist(value => { value.fields[element.dataset.instructionField] = element.value; }));
    });
    document.querySelectorAll('[data-instruction-check]').forEach(element => element.onchange = () => persist(value => { value.taskChecks[element.dataset.instructionCheck] = element.checked; }));
    document.getElementById('instruction-checkpoint').onclick = saveCheckpoint;
    document.getElementById('instruction-export').onclick = exportWork;
    document.getElementById('instruction-print').onclick = () => window.print();
  }
  function setStatus(message) {
    const element = document.getElementById('instruction-status');
    if (element) element.textContent = message;
  }
  function persist(update) {
    if (externalConflict) return false;
    try { state = store.save(active.id, update); setStatus('Saved on this device.'); return true; }
    catch (error) { setStatus('NOT SAVED: '+error.message); return false; }
  }
  function flush() {
    const fields = {...state.fields}, checks = {...state.taskChecks};
    document.querySelectorAll('[data-instruction-field]').forEach(element => { fields[element.dataset.instructionField] = element.value; });
    document.querySelectorAll('[data-instruction-check]').forEach(element => { checks[element.dataset.instructionCheck] = element.checked; });
    return {fields, checks};
  }
  function saveCheckpoint() {
    if (externalConflict) return;
    const values = flush();
    try {
      state = store.checkpoint(active.id, values.fields, values.checks);
      try { store.syncPortal(); } catch (ignored) {}
      lesson();
      setStatus('Saved. This week is complete and its work sample is ready for the portfolio.');
    } catch (error) {
      setStatus('Keep going: '+error.message);
      const required = store.courseFields(active).find(item => item.required && !String(values.fields[item.id] || '').trim());
      (document.querySelector(`[data-instruction-field="${required?.id}"]`) || document.querySelector('[data-instruction-check]:not(:checked)'))?.focus();
    }
  }
  function exportWork() {
    try {
      const courseRecord = store.backup(false);
      if (externalConflict && active && state) {
        const values=flush(), localCopy=structuredClone(state);
        localCopy.fields=values.fields; localCopy.taskChecks=values.checks;
        courseRecord.weekRecords[active.id]=localCopy;
        courseRecord.conflictCopy={weekId:active.id,exportedAt:new Date().toISOString(),note:'This file contains the responses visible in the tab that detected a newer saved copy.'};
      }
      store.download(C.exportName, {kind:'instruction-course', schemaVersion:1, student:C.student, courseId:C.id, exportedAt:new Date().toISOString(), courseRecord});
    }
    catch (error) { active ? setStatus('Export needs attention: '+error.message) : fail(error); }
  }
  window.addEventListener('storage', event => {
    if (active && event.key === store.key(active.id)) {
      externalConflict = true;
      setStatus('This week changed in another tab. Download this copy and reload before adding more work.');
      document.querySelectorAll('input,select,textarea,button').forEach(element => { if (element.id !== 'instruction-export') element.disabled = true; });
    }
  });
  try { params.get('id') ? lesson() : overview(); } catch (error) { fail(error); }
})();
