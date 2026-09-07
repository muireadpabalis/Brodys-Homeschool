/* Adds finalized course assignments and a current-week dashboard view without changing baseline records. */
(() => {
  'use strict';
  const stores = Object.values(window.InstructionRegistry || {}).sort((a,b) => (a.course.priority || 100) - (b.course.priority || 100)), e = window.InstructionCore.escape;
  if (!stores.length) return;
  let changed = false;
  try {
    for (const store of stores) {
      const C = store.course;
      for (const week of C.weeks) {
        let task = data.assignments.find(item => item.id === week.id);
        if (!task) {
          data.assignments.push({id:week.id, title:C.subject+' Week '+week.week+' · '+week.title, subject:C.subject, due:week.due, description:week.subtitle+'. '+week.independent.title+'. Friday checkpoint included.', link:C.page+'?id='+week.id, complete:false, completedDate:'', instructionCourse:C.id, instructionWeek:week.week, instructionPriority:C.priority || 100});
          changed = true;
        } else {
          if (!task.instructionCourse) { task.instructionCourse=C.id; task.instructionWeek=week.week; changed=true; }
          if (!task.link) { task.link=C.page+'?id='+week.id; changed=true; }
          if (!task.due) { task.due=week.due; changed=true; }
          if (task.instructionPriority !== (C.priority || 100)) { task.instructionPriority=C.priority || 100; changed=true; }
        }
      }
    }
    if (changed) saveData();
    for (const store of stores) store.syncPortal();
    data = stores[0].read(stores[0].course.recordKey, data);

    const assignmentBanner = document.createElement('section');
    assignmentBanner.className = 'panel instruction-course-banner';
    assignmentBanner.innerHTML = `<h3>Final seven-week instruction · Begins September 7</h3><p>Open the weekly lessons, applications, reasoning tasks, and Friday checkpoints. Completed baselines remain in Records as historical starting evidence.</p><div class="instruction-course-links">${stores.map(store => `<a class="button" href="${e(store.course.page)}">${e(store.course.title)}</a>`).join('')}<a href="parent.html">Parent plans and reviews</a></div>`;
    document.querySelector('#assignments .filter-row').before(assignmentBanner);

    const start = new Date('2026-09-07T00:00:00'), today = new Date(), day = 86400000;
    const weekNumber = Math.max(1, Math.min(7, Math.floor((today-start)/(7*day))+1));
    const spotlight = document.createElement('section');
    spotlight.className = 'panel instruction-spotlight';
    spotlight.innerHTML = `<div class="panel-heading"><div><p class="eyebrow">Today’s work</p><h3>This week’s lessons</h3></div><button class="link-button" data-go="assignments">View assignments</button></div><div class="instruction-spotlight-grid">${stores.map(store => {const week=store.course.weeks[weekNumber-1],value=store.work(week.id);return `<article class="instruction-spotlight-card">${store.course.priorityLabel?`<span class="instruction-stage">${e(store.course.priorityLabel)}</span> `:''}<span class="badge">${e(store.course.subject)} · Week ${week.week}</span><h3>${e(week.title)}</h3><p>${e(week.objective)}</p><p class="meta">${value.complete?'Friday checkpoint saved':value.updatedAt?'Continue saved work':'Ready to begin'}</p><a href="${e(store.course.page)}?id=${e(week.id)}">${value.complete?'Review this week':'Open this week'}</a></article>`;}).join('')}</div>`;
    document.querySelector('#dashboard .hero-card').after(spotlight);
    spotlight.querySelector('[data-go]').onclick = () => setView('assignments');

    const previousRender = renderAssignments;
    renderAssignments = function() {
      previousRender();
      const shownSubjects = new Set(stores.map(store => store.course.subject));
      assignmentBanner.hidden = !(subjectFilter.value === 'all' || shownSubjects.has(subjectFilter.value));
      for (const card of assignmentList.querySelectorAll('[data-assignment-id]')) {
        const task = data.assignments.find(item => item.id === card.dataset.assignmentId);
        if (!task?.instructionCourse) continue;
        const store = window.InstructionRegistry[task.instructionCourse], week = store?.course.weeks.find(item => item.id === task.id);
        if (!week) continue;
        card.dataset.instructionId = task.id;
        const note = document.createElement('p'); note.className='meta'; note.textContent='Week '+week.week+' · '+week.scope+' · Friday evidence checkpoint and parent review'; card.querySelector('h3').after(note);
        card.querySelectorAll('.actions button').forEach(button => button.remove());
        const link = card.querySelector('.actions a'); if (link) { link.textContent='Open '+store.course.subject+' week'; link.removeAttribute('target'); }
      }
    };
    subjectFilter.addEventListener('change', () => renderAssignments());
    statusFilter.addEventListener('change', () => renderAssignments());
    document.querySelectorAll('[data-go="assignments"]').forEach(button => button.addEventListener('click', () => renderAssignments()));

    for (const store of stores) {
      const panel = document.createElement('article'); panel.className='panel'; panel.innerHTML=`<h3>${e(store.course.title)}</h3><p>Weekly objectives, assignments, saved checkpoints, assistance records, portfolio evidence, and parent review.</p><a href="parent.html#${e(store.course.parentAnchor)}">Open ${e(store.course.subject)} teaching records</a>`; document.querySelector('#reports .report-grid').append(panel);
    }
    renderAll();
    const target = stores.find(store => location.hash === '#'+store.course.subjectHash);
    if (target) { setView('assignments'); subjectFilter.value=target.course.subject; renderAssignments(); }
  } catch (error) {
    const message = document.createElement('p'); message.className='instruction-error'; message.setAttribute('role','alert'); message.textContent='Instructional courses need attention: '+error.message; document.getElementById('assignments').prepend(message);
  }
})();
