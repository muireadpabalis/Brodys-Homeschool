(() => {
  'use strict';
  const registry = window.InstructionRegistry || {};
  const stores = () => Object.values(registry);
  const e = value => window.InstructionCore.escape(value);

  function responseRows(store, week, snapshot) {
    const groups = [
      ['Guided practice', week.guided.fields],
      ['Independent application', week.independent.fields],
      ['Reasoning task', week.reasoning.fields],
      ['Friday checkpoint', week.checkpoint]
    ];
    return groups.map(([title, fields]) => `<details><summary>${e(title)}</summary>${fields.map(field => `<div class="instruction-parent-response"><strong>${e(field.label || field.prompt)}</strong><p>${e(snapshot.fields[field.id] || 'No response recorded.')}</p></div>`).join('')}</details>`).join('');
  }
  function report(store) {
    const C = store.course, works = store.evidence(), parent = store.parent();
    const weeks = C.weeks.map(week => {
      const work = works[week.id], latest = work?.snapshots?.at(-1) || null, savedReview = parent.weeks[week.id] || null;
      const review = latest && savedReview?.snapshotId === latest.id ? savedReview : null;
      return {week:week.week, id:week.id, title:week.title, objective:week.objective, skills:week.skills, standards:week.standards || [], complete:!!work?.complete, completedAt:work?.completedAt || null, checkpointId:latest?.id || null, assistance:latest?.fields?.assistance || null, parentStatus:review?.status || null, parentNotes:review?.notes || '', portfolio:week.portfolio};
    });
    return {schemaVersion:1, student:C.student, courseId:C.id, courseTitle:C.title, subject:C.subject, schoolYear:C.schoolYear, generatedAt:new Date().toISOString(), scope:'Seven weeks of instruction after the completed diagnostic baseline. Weekly checkpoints are instructional evidence, not percentage grades.', complete:weeks.filter(week => week.complete).length, reviewed:weeks.filter(week => week.parentStatus).length, weeks};
  }
  function renderCourse(store) {
    const C = store.course, container = document.querySelector(`[data-instruction-parent="${C.id}"]`);
    if (!container) return;
    try {
      const works = store.evidence(), parent = store.parent(), summary = report(store);
      container.innerHTML = `<h2>${e(C.title)} · Seven-week instruction</h2><p><strong>${e(C.routine.join(' → '))}</strong></p><p>${e(C.parentOverview)}</p><div class="instruction-parent-summary"><div><strong>${summary.complete}/7</strong>weeks complete</div><div><strong>${summary.reviewed}/7</strong>latest checkpoints reviewed</div></div><div class="actions no-print"><a href="${e(C.page)}">Open student course</a><button data-course-export="${e(C.id)}">Export ${e(C.subject)} work and reviews (.json)</button><button data-course-csv="${e(C.id)}">Export teaching record (.csv)</button></div><p class="instruction-status" data-course-status="${e(C.id)}" role="status"></p>${C.weeks.map(week => {
        const work = works[week.id], latest = work?.snapshots?.at(-1) || null, savedReview = parent.weeks[week.id] || null, currentReview = latest && savedReview?.snapshotId === latest.id ? savedReview : null;
        return `<details class="instruction-parent-week"><summary><strong>Week ${week.week} · ${e(week.title)}</strong> · ${work?.complete?'Completed '+e(work.completedAt.slice(0,10)):'Not complete'} · ${e(currentReview?.status || (latest?'Awaiting parent review':'No checkpoint'))}</summary><div class="instruction-skill-list">${week.skills.map(skill => '<span>'+e(skill)+'</span>').join('')}</div><p><strong>Instructional role:</strong> ${e(week.scope)}</p><p><strong>Objective:</strong> ${e(week.objective)}</p><p><strong>Standards:</strong> ${e((week.standards || []).join(' · '))}</p><p><strong>Assignment:</strong> ${e(week.independent.title)}; ${e(week.reasoning.title)}</p><p><strong>Portfolio evidence:</strong> ${e(week.portfolio)}</p>${latest?`<p><strong>Latest checkpoint:</strong> ${e(latest.id)} · ${e(new Date(latest.at).toLocaleString())}</p><p><strong>Student-reported assistance:</strong> ${e(latest.fields.assistance)}</p>${responseRows(store,week,latest)}<form class="instruction-review-form no-print" data-course-review="${e(C.id)}" data-week="${e(week.id)}" data-snapshot="${e(latest.id)}"><label>Friday checkpoint result<select name="status" required><option value="">Choose…</option>${store.reviewStatuses.map(status => `<option ${currentReview?.status===status?'selected':''}>${e(status)}</option>`).join('')}</select></label><label>Parent notes<textarea name="notes" rows="3" placeholder="What was independent? What prompt helped? What should happen next?">${e(currentReview?.notes || '')}</textarea></label><button class="button" type="submit">Save parent review</button></form>${savedReview&&!currentReview?'<p class="instruction-note"><strong>An earlier checkpoint has a review.</strong> Review the latest checkpoint for it to count in the summary.</p>':''}`:'<p class="instruction-note">Parent review opens after the student saves the Friday checkpoint.</p>'}</details>`;
      }).join('')}<label class="no-print">Course summary / next-step note<textarea data-course-summary="${e(C.id)}" rows="3">${e(parent.summary)}</textarea></label><p class="print-only"><strong>Course summary:</strong> ${e(parent.summary || 'No course summary recorded.')}</p>`;
      container.querySelector(`[data-course-export="${C.id}"]`).onclick = () => store.download(C.parentExportName,{kind:'instruction-course',schemaVersion:1,student:C.student,courseId:C.id,exportedAt:new Date().toISOString(),courseRecord:store.backup(true),teachingSummary:report(store)});
      container.querySelector(`[data-course-csv="${C.id}"]`).onclick = () => exportCsv(store);
      container.querySelectorAll(`[data-course-review="${C.id}"]`).forEach(form => form.onsubmit = event => {
        event.preventDefault();
        const status = form.elements.status.value, notes = form.elements.notes.value, message = container.querySelector(`[data-course-status="${C.id}"]`);
        try { store.saveParent(form.dataset.week, form.dataset.snapshot, status, notes); renderCourse(store); container.querySelector(`[data-course-status="${C.id}"]`).textContent = 'Parent review saved for the latest checkpoint.'; }
        catch (error) { message.textContent = 'NOT SAVED: '+error.message; }
      });
      const summaryField = container.querySelector(`[data-course-summary="${C.id}"]`);
      summaryField.onchange = () => {
        try { const value=store.parent(); value.summary=summaryField.value; store.write(C.parentKey,value); summaryField.closest('section').querySelector(`[data-course-status="${C.id}"]`).textContent='Course summary saved.'; }
        catch (error) { container.querySelector(`[data-course-status="${C.id}"]`).textContent='NOT SAVED: '+error.message; }
      };
    } catch (error) {
      container.innerHTML = '<h2>'+e(C.subject)+' course records need attention</h2><p>'+e(error.message)+'</p><p>Existing records were left untouched.</p>';
    }
  }
  function exportCsv(store) {
    const result = report(store), headers = ['week','title','objective','skills','standards','complete','completedAt','checkpointId','assistance','parentStatus','parentNotes','portfolio'];
    const quote = value => '"'+String(value ?? '').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';
    const rows = result.weeks.map(week => headers.map(header => Array.isArray(week[header]) ? week[header].join('; ') : week[header]));
    store.download(store.course.csvName,[headers,...rows].map(row => row.map(quote).join(',')).join('\r\n'),'text/csv');
  }
  function renderAll() { stores().forEach(renderCourse); }
  function recoveryCopy(store, error) {
    const rawWeekRecords = {};
    for (const week of store.course.weeks) {
      const raw = localStorage.getItem(store.key(week.id));
      if (raw !== null) rawWeekRecords[week.id] = raw;
    }
    return {schemaVersion:1, courseId:store.course.id, courseVersion:store.course.version, recoveryRequired:true, error:error.message, rawWeekRecords, rawParentReview:localStorage.getItem(store.course.parentKey)};
  }
  function backup() {
    const instructionCourses = {}, instructionSummaries = {}, instructionCourseRecovery = {};
    for (const store of stores()) {
      try { instructionCourses[store.course.id]=store.backup(true); instructionSummaries[store.course.id]=report(store); }
      catch (error) { instructionCourseRecovery[store.course.id]=recoveryCopy(store,error); }
    }
    return {instructionCourses,instructionSummaries,instructionCourseRecovery};
  }
  function candidates(imported) {
    if (imported?.kind === 'instruction-course' && imported.courseId && imported.courseRecord) return {[imported.courseId]:imported.courseRecord};
    return imported?.instructionCourses || {};
  }
  function validateImport(imported) {
    const items = candidates(imported);
    for (const [id, record] of Object.entries(items)) {
      const store = registry[id];
      if (!store || store.course.student !== imported.student) throw Error('This course export does not belong to this student portal.');
      store.restorePlan(record);
    }
    return items;
  }
  function restore(imported) {
    const items = validateImport(imported);
    const plans = Object.entries(items).flatMap(([id,record]) => registry[id].restorePlan(record).map(plan => [registry[id],...plan]));
    const touchedKeys = [...new Set([
      ...plans.map(([,key]) => key),
      ...Object.keys(items).map(id => registry[id].course.recordKey)
    ])];
    const before = touchedKeys.map(key => [key,localStorage.getItem(key)]);
    try {
      plans.forEach(([store,key,value]) => store.write(key,value));
      Object.keys(items).forEach(id => registry[id].syncPortal());
      renderAll();
    } catch (error) {
      for (const [key,raw] of before) try { raw===null?localStorage.removeItem(key):localStorage.setItem(key,raw); } catch (ignored) {}
      throw error;
    }
  }
  window.InstructionParent = {renderAll, renderCourse, report, backup, validateImport, restore};
})();
