/* Shared seven-week course records. Course keys are additive and never reuse baseline keys. */
(() => {
  'use strict';

  const registry = window.InstructionRegistry = window.InstructionRegistry || {};
  const assistanceLevels = [
    'Independent',
    'Parent read directions only',
    'Brief reminder or question',
    'Parent helped gather materials',
    'Guided practice or modeling',
    'Step-by-step support'
  ];
  const reviewStatuses = ['Demonstrated independently', 'Demonstrated with support', 'Needs more practice'];
  const object = value => value && typeof value === 'object' && !Array.isArray(value);
  const clone = value => structuredClone(value);
  const validDate = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const read = (key, fallback = null) => {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  };
  const write = (key, value) => {
    const raw = JSON.stringify(value);
    localStorage.setItem(key, raw);
    if (localStorage.getItem(key) !== raw) throw Error('The saved record could not be verified.');
  };
  const blank = () => ({schemaVersion:1, fields:{}, taskChecks:{}, snapshots:[], complete:false, completedAt:null, updatedAt:null});

  function courseFields(week) {
    const blocks = [week.guided, week.independent, week.reasoning, {fields:week.checkpoint}];
    return [...blocks.flatMap(block => block?.fields || []),
      {id:'assistance', label:'Help used', required:true, type:'select', options:assistanceLevels},
      {id:'artifact', label:'Optional work-sample link', required:false},
      {id:'workSampleNote', label:'Work-sample note', required:false}
    ];
  }
  function courseChecks(week) {
    return [week.guided, week.independent, week.reasoning].flatMap(block => block?.checks || []);
  }
  function validateCourse(course) {
    if (!object(course) || !course.id || !course.student || !course.subject || !course.storagePrefix || !course.parentKey || !course.recordKey || !course.page || !Array.isArray(course.weeks) || course.weeks.length !== 7) throw Error('A seven-week course definition is incomplete.');
    const weekIds = new Set();
    course.weeks.forEach((week, index) => {
      if (!object(week) || week.week !== index + 1 || !week.id || weekIds.has(week.id) || !week.title || !week.objective || !Array.isArray(week.skills) || !week.skills.length || !Array.isArray(week.lesson) || !week.lesson.length || !Array.isArray(week.checkpoint) || week.checkpoint.length < 3 || !week.guided?.fields?.length || !week.independent?.fields?.length || !week.reasoning?.fields?.length || !week.portfolio) throw Error('Week '+(index+1)+' is missing required instructional content.');
      weekIds.add(week.id);
      const ids = new Set();
      for (const field of courseFields(week)) {
        if (!field.id || ids.has(field.id)) throw Error('Week '+week.week+' has a duplicate or missing response ID.');
        ids.add(field.id);
      }
      const checkIds = new Set();
      for (const check of courseChecks(week)) {
        if (!Array.isArray(check) || !check[0] || !check[1] || checkIds.has(check[0])) throw Error('Week '+week.week+' has an invalid activity check.');
        checkIds.add(check[0]);
      }
    });
    return course;
  }
  function create(courseSource) {
    const course = validateCourse(courseSource);
    if (registry[course.id]) return registry[course.id];
    const fieldMap = week => new Map(courseFields(week).map(field => [field.id, field]));
    const checkMap = week => new Map(courseChecks(week).map(check => [check[0], check]));
    const key = id => course.storagePrefix + id;

    function validateFields(week, fields, requireComplete = false) {
      if (!object(fields)) throw Error(course.subject+' responses need recovery.');
      const definitions = fieldMap(week);
      for (const [id, value] of Object.entries(fields)) {
        const field = definitions.get(id);
        if (!field || typeof value !== 'string') throw Error(course.subject+' responses need recovery.');
        if (field.type === 'select' && value && !field.options.includes(value)) throw Error(course.subject+' contains an unsupported choice.');
      }
      if (requireComplete) {
        for (const field of definitions.values()) if (field.required && !String(fields[field.id] || '').trim()) throw Error('Complete every required response before saving the checkpoint.');
      }
    }
    function validateChecks(week, checks, requireComplete = false) {
      if (!object(checks)) throw Error(course.subject+' activity checks need recovery.');
      const definitions = checkMap(week);
      for (const [id, value] of Object.entries(checks)) if (!definitions.has(id) || typeof value !== 'boolean') throw Error(course.subject+' activity checks need recovery.');
      if (requireComplete) for (const id of definitions.keys()) if (checks[id] !== true) throw Error('Complete each activity check before saving the checkpoint.');
    }
    function validateSnapshot(week, snapshot) {
      if (!object(snapshot) || typeof snapshot.id !== 'string' || !snapshot.id || !validDate(snapshot.at)) throw Error('A '+course.subject+' checkpoint needs recovery.');
      validateFields(week, snapshot.fields, true);
      validateChecks(week, snapshot.taskChecks, true);
      if (!Array.isArray(snapshot.skills) || JSON.stringify(snapshot.skills) !== JSON.stringify(week.skills)) throw Error('A '+course.subject+' checkpoint has mismatched skills.');
      return snapshot;
    }
    function validateWork(id, value) {
      const week = course.weeks.find(item => item.id === id);
      if (!week) throw Error('Unknown '+course.subject+' week.');
      if (!object(value) || value.schemaVersion !== 1 || !Array.isArray(value.snapshots) || typeof value.complete !== 'boolean' || (value.updatedAt !== null && !validDate(value.updatedAt)) || (value.completedAt !== null && !validDate(value.completedAt))) throw Error(course.subject+' work has an unsupported format. Existing data was preserved.');
      validateFields(week, value.fields, false);
      validateChecks(week, value.taskChecks, false);
      const seen = new Set();
      for (const snapshot of value.snapshots) {
        validateSnapshot(week, snapshot);
        if (seen.has(snapshot.id)) throw Error('A duplicate '+course.subject+' checkpoint needs recovery.');
        seen.add(snapshot.id);
      }
      if (value.snapshots.length && !value.complete) throw Error(course.subject+' checkpoint completion is inconsistent.');
      if (value.complete && (!value.completedAt || !value.snapshots.length)) throw Error('Completed '+course.subject+' work is missing its checkpoint.');
      if (!value.complete && value.completedAt !== null) throw Error(course.subject+' completion date is inconsistent.');
      value.snapshots.sort((a,b) => Date.parse(a.at) - Date.parse(b.at));
      return value;
    }
    function work(id) {
      return validateWork(id, read(key(id), blank()));
    }
    function save(id, update) {
      const before = work(id), next = clone(before);
      update(next);
      if (JSON.stringify(next.snapshots.slice(0, before.snapshots.length)) !== JSON.stringify(before.snapshots)) throw Error('Saved checkpoints are permanent evidence and cannot be changed.');
      next.updatedAt = new Date().toISOString();
      validateWork(id, next);
      write(key(id), next);
      return next;
    }
    function checkpoint(id, fields, checks) {
      const week = course.weeks.find(item => item.id === id);
      if (!week) throw Error('Unknown '+course.subject+' week.');
      validateFields(week, fields, true);
      validateChecks(week, checks, true);
      const now = new Date().toISOString();
      return save(id, value => {
        value.fields = clone(fields);
        value.taskChecks = clone(checks);
        value.snapshots.push({id:crypto.randomUUID(), at:now, fields:clone(fields), taskChecks:clone(checks), skills:clone(week.skills)});
        value.complete = true;
        value.completedAt = value.completedAt || now;
      });
    }
    function evidence() {
      const records = [];
      for (const week of course.weeks) {
        if (localStorage.getItem(key(week.id)) === null) continue;
        records.push([week.id, validateWork(week.id, read(key(week.id)))]);
      }
      return Object.fromEntries(records);
    }
    function validateParent(value, workSource = id => work(id)) {
      if (!object(value) || value.schemaVersion !== 1 || !object(value.weeks) || typeof value.summary !== 'string') throw Error(course.subject+' parent records need recovery; nothing was overwritten.');
      for (const [id, review] of Object.entries(value.weeks)) {
        const week = course.weeks.find(item => item.id === id);
        if (!week || !object(review) || typeof review.snapshotId !== 'string' || !reviewStatuses.includes(review.status) || typeof review.notes !== 'string' || !validDate(review.updatedAt)) throw Error(course.subject+' parent review needs recovery.');
        if (!workSource(id).snapshots.some(snapshot => snapshot.id === review.snapshotId)) throw Error(course.subject+' parent review refers to a missing checkpoint.');
      }
      return value;
    }
    function parent() {
      return validateParent(read(course.parentKey, {schemaVersion:1, weeks:{}, summary:''}));
    }
    function saveParent(id, snapshotId, status, notes) {
      const value = parent(), latest = work(id).snapshots.at(-1);
      if (!latest || latest.id !== snapshotId) throw Error('A newer checkpoint is available. Refresh before saving this review.');
      if (!reviewStatuses.includes(status)) throw Error('Choose a checkpoint result.');
      value.weeks[id] = {snapshotId, status, notes:String(notes || ''), updatedAt:new Date().toISOString()};
      write(course.parentKey, value);
      return value;
    }
    function backup(includeParent = false) {
      return {schemaVersion:1, courseId:course.id, courseVersion:course.version, weekRecords:evidence(), ...(includeParent ? {parentReview:parent()} : {})};
    }
    function restorePlan(incoming) {
      if (!incoming || incoming.schemaVersion !== 1 || incoming.courseId !== course.id || incoming.courseVersion !== course.version || !object(incoming.weekRecords)) throw Error('Choose a supported '+course.subject+' course export.');
      const plans = [], plannedWork = new Map();
      for (const [id, importedSource] of Object.entries(incoming.weekRecords)) {
        if (!course.weeks.some(week => week.id === id)) throw Error('Unknown '+course.subject+' week in backup.');
        const imported = validateWork(id, clone(importedSource)), currentRaw = read(key(id));
        if (localStorage.getItem(key(id)) === null) { plans.push([key(id), imported]); plannedWork.set(id, imported); continue; }
        const current = validateWork(id, currentRaw), byId = new Map(current.snapshots.map(snapshot => [snapshot.id, snapshot]));
        for (const snapshot of imported.snapshots) {
          if (byId.has(snapshot.id) && JSON.stringify(byId.get(snapshot.id)) !== JSON.stringify(snapshot)) throw Error('A saved checkpoint conflicts with this backup.');
          if (!byId.has(snapshot.id)) byId.set(snapshot.id, snapshot);
        }
        const snapshots = [...byId.values()].sort((a,b) => Date.parse(a.at) - Date.parse(b.at));
        const complete = current.complete || imported.complete;
        const merged = {schemaVersion:1, fields:{...imported.fields,...current.fields}, taskChecks:{...imported.taskChecks,...current.taskChecks}, snapshots, complete, completedAt:complete ? (current.completedAt || imported.completedAt || snapshots[0]?.at) : null, updatedAt:current.updatedAt || imported.updatedAt};
        const validMerged = validateWork(id, merged); plans.push([key(id), validMerged]); plannedWork.set(id, validMerged);
      }
      if (incoming.parentReview) {
        const importedParent = validateParent(clone(incoming.parentReview), id => plannedWork.get(id) || work(id)), currentParent = parent();
        plans.push([course.parentKey, {schemaVersion:1, weeks:{...importedParent.weeks,...currentParent.weeks}, summary:currentParent.summary || importedParent.summary}]);
      }
      return plans;
    }
    function restore(incoming) {
      const plans = restorePlan(incoming), before = plans.map(([storageKey]) => [storageKey, localStorage.getItem(storageKey)]);
      try { plans.forEach(([storageKey, value]) => write(storageKey, value)); }
      catch (error) {
        for (const [storageKey, raw] of before) try { raw === null ? localStorage.removeItem(storageKey) : localStorage.setItem(storageKey, raw); } catch (ignored) {}
        throw error;
      }
    }
    function syncPortal() {
      const record = read(course.recordKey);
      if (!record) return null;
      if (!['assignments','assessments','logs','portfolio'].every(name => Array.isArray(record[name]))) throw Error('The school record needs recovery. Course work stayed separate.');
      let changed = false;
      for (const week of course.weeks) {
        let assignment = record.assignments.find(item => item.id === week.id);
        if (!assignment) {
          record.assignments.push({id:week.id, title:course.subject+' Week '+week.week+' · '+week.title, subject:course.subject, due:week.due, description:week.subtitle+'. '+week.independent.title+'. Friday checkpoint included.', link:course.page+'?id='+week.id, complete:false, completedDate:'', instructionCourse:course.id, instructionWeek:week.week, instructionPriority:course.priority || 100});
          changed = true;
        } else if (assignment.instructionPriority !== (course.priority || 100)) {
          assignment.instructionPriority = course.priority || 100;
          changed = true;
        }
      }
      const saved = evidence();
      for (const week of course.weeks) {
        const value = saved[week.id];
        const assignment = record.assignments.find(item => item.id === week.id);
        const complete = !!value?.complete, completedDate = complete ? value.completedAt.slice(0,10) : '';
        if (assignment && (assignment.complete !== complete || assignment.completedDate !== completedDate)) { assignment.complete = complete; assignment.completedDate = completedDate; changed = true; }
        if (!complete) continue;
        if (!record.portfolio.some(item => item.id === week.id)) {
          record.portfolio.push({id:week.id, title:course.subject+' Week '+week.week+' · '+week.title, subject:course.subject, date:value.completedAt.slice(0,10), description:'Saved instructional work and Friday checkpoint. Portfolio evidence: '+week.portfolio+' Completion is not a percentage grade.', link:course.page+'?id='+week.id});
          changed = true;
        }
      }
      if (changed) write(course.recordKey, record);
      return record;
    }
    function download(name, value, type = 'application/json') {
      const content = typeof value === 'string' ? value : JSON.stringify(value, null, 2), url = URL.createObjectURL(new Blob([content], {type})), anchor = document.createElement('a');
      anchor.href = url; anchor.download = name; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    const api = {course, assistanceLevels, reviewStatuses, escape, read, write, blank, courseFields, courseChecks, validateWork, work, save, checkpoint, evidence, parent, saveParent, backup, restorePlan, restore, syncPortal, download, key};
    registry[course.id] = api;
    return api;
  }

  window.InstructionCore = {create, registry, assistanceLevels, reviewStatuses, escape};
  (window.INSTRUCTION_COURSES || []).forEach(create);
})();
