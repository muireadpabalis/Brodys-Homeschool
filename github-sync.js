/*
 * Cross-device school-record sync for the static GitHub Pages portal.
 *
 * Reads are public. Writes require a parent-supplied, repository-scoped GitHub
 * token. A parent may remember it on a trusted family workstation; it is never
 * included in Brody's student snapshot, IndexedDB work mirror, exports, or Git
 * history.
 */
(() => {
  'use strict';

  const portal = window.PORTAL;
  if (!portal?.student || !portal?.recordKey) return;

  const student = String(portal.student);
  const studentSlug = student.toLowerCase();
  if (studentSlug !== 'brody') return;

  const config = Object.freeze({
    owner: 'muireadpabalis',
    repo: 'Homeschool-Records-2026-2027',
    branch: 'main',
    path: 'records/brody/latest.json'
  });
  const tokenSessionKey = 'homeschoolGithubWriteTokenSessionV1';
  const rememberedTokenKey = 'homeschoolGithubWriteTokenTrustedDeviceV1';
  const credentialSignalKey = 'homeschoolGithubCredentialSignalV1';
  const acceptedRemoteSessionKey = 'homeschoolGithubAcceptedRemoteBrodyV1';
  const recoveryDatabaseName = 'homeschoolCloudRecovery2026V1';
  const recoveryStoreName = 'snapshots';
  const autoSaveDelayMs = 30000;
  const apiPath = config.path.split('/').map(encodeURIComponent).join('/');
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/contents/${apiPath}`;
  const apiReadUrl = `${apiUrl}?ref=${encodeURIComponent(config.branch)}`;
  const historyUrl = `https://github.com/${config.owner}/${config.repo}/commits/${config.branch}/${config.path}`;
  const isOwnKey = key => typeof key === 'string' && key.toLowerCase().startsWith(studentSlug);
  const excludedRecordKeys = new Set([
    `${studentSlug}parentaccess2026`,
    `${studentSlug}storagerecoverednotice2026`,
    `${studentSlug}githubsyncsession`,
    `${studentSlug}cloudsyncsession`,
    `${studentSlug}portalconfig`
  ]);
  const isRecordKey = key => isOwnKey(key) && !excludedRecordKeys.has(key.toLowerCase());
  const isLocalPreview = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && window.HOMESCHOOL_GITHUB_SYNC_ALLOW_LOCALHOST !== true;

  const state = {
    phase: 'starting',
    message: 'Checking GitHub for Brody\'s latest record…',
    connected: false,
    dirty: false,
    conflict: false,
    remoteChecked: false,
    remoteExists: false,
    remoteSha: null,
    remoteFingerprint: null,
    lastSavedAt: null,
    lastLoadedAt: null,
    error: null
  };
  const sessionTokenAtStart = readSessionToken();
  const rememberedTokenAtStart = readRememberedToken();
  let token = sessionTokenAtStart || rememberedTokenAtStart;
  let tokenRemembered = Boolean(token && rememberedTokenAtStart === token);
  let credentialGeneration = 0;
  let credentialAbortController = new AbortController();
  let bootstrapping = true;
  let suppressLocalNotice = false;
  let autoSaveTimer = null;
  let lastAutomaticSaveAt = 0;
  let saveChain = Promise.resolve();
  const initialSnapshot = captureValues();
  const initialLocalWasEmpty = Object.keys(initialSnapshot).length === 0;

  function readSessionToken() {
    try { return sessionStorage.getItem(tokenSessionKey) || ''; }
    catch (error) { return ''; }
  }

  function readRememberedToken() {
    try { return localStorage.getItem(rememberedTokenKey) || ''; }
    catch (error) { return ''; }
  }

  function cancelCredentialActivity() {
    credentialGeneration += 1;
    credentialAbortController.abort();
    credentialAbortController = new AbortController();
    clearAutoSaveTimer();
  }

  function credentialContext(value) {
    return {
      token: value,
      generation: credentialGeneration,
      controller: credentialAbortController
    };
  }

  function credentialIsCurrent(context) {
    return Boolean(context)
      && context.token === token
      && context.generation === credentialGeneration
      && context.controller === credentialAbortController
      && !context.controller.signal.aborted;
  }

  function credentialCancellationError() {
    const error = new Error('GitHub writing was disconnected while the request was running.');
    error.code = 'credential-cancelled';
    return error;
  }

  function isCredentialCancellation(error) {
    return error?.name === 'AbortError' || error?.code === 'credential-cancelled';
  }

  function setSessionToken(value) {
    cancelCredentialActivity();
    token = value;
    try {
      if (value) sessionStorage.setItem(tokenSessionKey, value);
      else sessionStorage.removeItem(tokenSessionKey);
    } catch (error) {
      // The in-memory copy still supports this page if sessionStorage is blocked.
    }
    tokenRemembered = Boolean(value && readRememberedToken() === value);
    state.connected = Boolean(token);
  }

  function persistRememberedToken(value, remember) {
    try {
      if (value && remember) localStorage.setItem(rememberedTokenKey, value);
      else localStorage.removeItem(rememberedTokenKey);
    } catch (error) {
      // A blocked localStorage leaves this as a session-only connection.
    }
    tokenRemembered = Boolean(value && readRememberedToken() === value);
  }

  function clearCredential(options = {}) {
    cancelCredentialActivity();
    token = '';
    tokenRemembered = false;
    state.connected = false;
    try { sessionStorage.removeItem(tokenSessionKey); } catch (error) {}
    try { localStorage.removeItem(rememberedTokenKey); } catch (error) {}
    if (options.broadcast === true) {
      try { localStorage.setItem(credentialSignalKey, `${Date.now()}:${crypto.randomUUID()}`); } catch (error) {}
    }
  }

  function acceptedRemoteSha() {
    try { return sessionStorage.getItem(acceptedRemoteSessionKey) || ''; }
    catch (error) { return ''; }
  }

  function rememberAcceptedRemote(sha) {
    try { sessionStorage.setItem(acceptedRemoteSessionKey, sha); } catch (error) {}
  }

  function clearAcceptedRemote() {
    try { sessionStorage.removeItem(acceptedRemoteSessionKey); } catch (error) {}
  }

  function captureValues() {
    const values = {};
    try {
      const keys = [];
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (isRecordKey(key)) keys.push(key);
      }
      keys.sort((a, b) => a.localeCompare(b));
      for (const key of keys) {
        const raw = localStorage.getItem(key);
        if (typeof raw === 'string') values[key] = raw;
      }
    } catch (error) {
      state.error = 'This browser could not read Brody\'s device copy.';
    }
    return values;
  }

  function fingerprint(values) {
    return JSON.stringify(Object.keys(values).sort().map(key => [key, values[key]]));
  }

  function hasValues(values) {
    return values && Object.keys(values).length > 0;
  }

  function validRemoteBundle(value) {
    if (!value || value.schemaVersion !== 1 || value.studentSlug !== studentSlug || value.student !== student || !value.values || typeof value.values !== 'object' || Array.isArray(value.values)) return false;
    return Object.entries(value.values).every(([key, raw]) => isRecordKey(key) && typeof raw === 'string');
  }

  function encodeUtf8(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    const chunkSize = 0x8000;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize));
    }
    return btoa(binary);
  }

  function decodeUtf8(value) {
    const binary = atob(String(value).replace(/\s/g, ''));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
    return new TextDecoder().decode(bytes);
  }

  function apiHeaders(writeToken = '') {
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (writeToken) headers.Authorization = `Bearer ${writeToken}`;
    return headers;
  }

  async function fetchRemote(writeToken = '', requestContext = null) {
    const response = await fetch(apiReadUrl, {
      method: 'GET',
      headers: apiHeaders(writeToken),
      cache: 'no-store',
      ...(requestContext ? {signal:requestContext.controller.signal} : {})
    });
    if (requestContext && !credentialIsCurrent(requestContext)) throw credentialCancellationError();
    if (response.status === 404) return {exists:false, sha:null, values:{}, bundle:null};
    if (!response.ok) {
      const error = new Error(response.status === 401 ? 'GitHub did not accept the parent token.' : response.status === 403 ? 'GitHub denied access or its request limit was reached.' : `GitHub could not load the record (${response.status}).`);
      error.status = response.status;
      throw error;
    }
    const file = await response.json();
    if (typeof file.content !== 'string' || typeof file.sha !== 'string') throw Error('GitHub returned an unreadable record file.');
    let bundle;
    try { bundle = JSON.parse(decodeUtf8(file.content)); }
    catch (error) { throw Error('The GitHub record file is not valid JSON.'); }
    if (!validRemoteBundle(bundle)) throw Error('The GitHub record file does not match Brody\'s record format.');
    return {exists:true, sha:file.sha, values:bundle.values, bundle};
  }

  function setPhase(phase, message, error = null) {
    state.phase = phase;
    state.message = message;
    state.error = error;
    renderStatus();
    window.dispatchEvent(new CustomEvent('homeschool-github-sync-status', {detail:publicStatus()}));
  }

  function publicStatus() {
    return {
      ...state,
      config,
      tokenPresent: Boolean(token),
      remembered: tokenRemembered,
      historyUrl
    };
  }

  function noteLocalChange() {
    if (suppressLocalNotice) return;
    state.dirty = true;
    if (bootstrapping) return;
    if (state.conflict) {
      setPhase('conflict', 'A newer GitHub copy exists. The device copy is safe; a parent should review it before loading from GitHub.');
      return;
    }
    if (!token) {
      setPhase('device-only', 'Saved on this device. Ask a parent to connect GitHub before changing computers.');
      return;
    }
    scheduleAutoSave();
  }

  const nativeSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    const result = nativeSetItem.call(this, key, value);
    try {
      if (this === localStorage && isRecordKey(String(key))) noteLocalChange();
    } catch (error) {}
    return result;
  };

  function clearAutoSaveTimer() {
    if (autoSaveTimer !== null) clearTimeout(autoSaveTimer);
    autoSaveTimer = null;
  }

  function scheduleAutoSave() {
    if (bootstrapping || !token || state.conflict || !state.remoteChecked) return;
    clearAutoSaveTimer();
    const elapsed = Date.now() - lastAutomaticSaveAt;
    const wait = Math.max(autoSaveDelayMs, autoSaveDelayMs - elapsed);
    setPhase('pending', 'Saved on this device. GitHub save is queued.');
    autoSaveTimer = setTimeout(() => {
      autoSaveTimer = null;
      lastAutomaticSaveAt = Date.now();
      saveNow({automatic:true, reason:'autosave'});
    }, wait);
  }

  async function archiveDeviceCopy(reason) {
    const values = captureValues();
    if (!hasValues(values) || !('indexedDB' in window)) return null;
    try {
      const database = await new Promise((resolve, reject) => {
        const request = indexedDB.open(recoveryDatabaseName, 1);
        request.onupgradeneeded = () => {
          if (!request.result.objectStoreNames.contains(recoveryStoreName)) request.result.createObjectStore(recoveryStoreName, {keyPath:'id'});
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || Error('Recovery archive could not open.'));
      });
      const id = `${studentSlug}:${new Date().toISOString()}:${crypto.randomUUID()}`;
      await new Promise((resolve, reject) => {
        const transaction = database.transaction(recoveryStoreName, 'readwrite');
        transaction.objectStore(recoveryStoreName).put({id, student, studentSlug, archivedAt:new Date().toISOString(), reason, remoteSha:state.remoteSha, values});
        transaction.oncomplete = resolve;
        transaction.onerror = () => reject(transaction.error || Error('Recovery archive could not be written.'));
        transaction.onabort = () => reject(transaction.error || Error('Recovery archive was cancelled.'));
      });
      database.close();
      return id;
    } catch (error) {
      return null;
    }
  }

  function applyRemote(values) {
    suppressLocalNotice = true;
    try {
      for (const [key, raw] of Object.entries(values)) localStorage.setItem(key, raw);
    } finally {
      suppressLocalNotice = false;
    }
  }

  async function loadLatest(options = {}) {
    const force = options.force === true;
    const readToken = options.publicRead === true ? '' : token;
    const readCredential = readToken ? credentialContext(readToken) : null;
    setPhase('loading', 'Loading Brody\'s latest GitHub record…');
    try {
      const remote = await fetchRemote(readToken, readCredential);
      state.remoteChecked = true;
      state.remoteExists = remote.exists;
      state.remoteSha = remote.sha;
      state.remoteFingerprint = fingerprint(remote.values);
      state.lastLoadedAt = remote.bundle?.savedAt || null;
      state.conflict = false;
      if (!remote.exists) {
        clearAcceptedRemote();
        const local = captureValues();
        state.dirty = hasValues(local);
        setPhase(token ? 'ready' : 'device-only', token ? 'GitHub is connected. Save now to create Brody\'s record history.' : 'No GitHub record exists yet. A parent can connect GitHub to create it.');
        if (token && state.dirty) scheduleAutoSave();
        return {loaded:false, exists:false};
      }

      const local = captureValues();
      const same = fingerprint(local) === state.remoteFingerprint;
      if (same) {
        clearAcceptedRemote();
        state.dirty = false;
        state.lastSavedAt = remote.bundle.savedAt || null;
        setPhase('saved', `GitHub has Brody's latest work${state.lastSavedAt ? ` from ${formatTime(state.lastSavedAt)}` : ''}.`);
        return {loaded:false, exists:true, same:true};
      }

      if ((bootstrapping && initialLocalWasEmpty) || force) {
        if (!hasValues(remote.values)) {
          state.dirty = hasValues(local);
          setPhase(token ? 'ready' : 'device-only', 'The GitHub record is empty; Brody\'s device copy was preserved.');
          return {loaded:false, exists:true, empty:true};
        }
        if (force && hasValues(local) && !same) await archiveDeviceCopy('Before loading the GitHub copy');
        applyRemote(remote.values);
        state.dirty = false;
        state.lastSavedAt = remote.bundle.savedAt || null;
        rememberAcceptedRemote(remote.sha);
        await window.StorageResilience?.flush?.().catch(() => {});
        setPhase('loaded', 'Brody\'s latest GitHub work was loaded. Refreshing the page…');
        location.reload();
        return {loaded:true, exists:true};
      }

      if (acceptedRemoteSha() === remote.sha) {
        state.conflict = false;
        state.dirty = true;
        state.lastSavedAt = remote.bundle.savedAt || null;
        setPhase(token ? 'pending' : 'device-only', token ? 'GitHub work was loaded; preserved device additions are queued for GitHub.' : 'GitHub work was loaded. Preserved device additions are saved on this device until a parent connects GitHub.');
        return {loaded:false, exists:true, merged:true};
      }

      state.conflict = true;
      state.dirty = true;
      setPhase('conflict', 'This device and GitHub have different work. Nothing was overwritten. A parent can export this device copy, then load GitHub.');
      return {loaded:false, exists:true, conflict:true};
    } catch (error) {
      if (isCredentialCancellation(error)) return {loaded:false, cancelled:true};
      if (error.status === 401 && readToken) clearCredential();
      state.remoteChecked = false;
      state.dirty = hasValues(captureValues());
      setPhase('offline', `${error.message} Brody's device copy is still safe.`, error.message);
      return {loaded:false, error:error.message};
    }
  }

  async function saveOnce(options = {}) {
    const writeToken = token;
    const writeCredential = writeToken ? credentialContext(writeToken) : null;
    if (!writeToken) {
      state.dirty = hasValues(captureValues());
      setPhase('device-only', 'Saved on this device. A parent must connect GitHub before saving across computers.');
      return {saved:false, reason:'no-token'};
    }
    if (state.conflict && options.resolveConflict !== true) {
      setPhase('conflict', 'GitHub save stopped because this device and GitHub have different work. Nothing was overwritten.');
      return {saved:false, reason:'conflict'};
    }

    await window.StorageResilience?.flush?.().catch(() => {});
    const values = captureValues();
    const valuesFingerprint = fingerprint(values);
    setPhase('saving', 'Saving Brody\'s work to GitHub…');

    try {
      const remote = await fetchRemote(writeToken, writeCredential);
      if (!credentialIsCurrent(writeCredential)) {
        setPhase('device-only', 'GitHub writing was disconnected before this save. Brody\'s device copy remains saved.');
        return {saved:false, reason:'disconnected'};
      }
      state.remoteChecked = true;
      if (remote.exists && !hasValues(values) && hasValues(remote.values)) {
        state.conflict = true;
        state.remoteExists = true;
        state.remoteSha = remote.sha;
        state.remoteFingerprint = fingerprint(remote.values);
        setPhase('conflict', 'A blank device copy cannot replace Brody\'s existing GitHub work. Load the GitHub copy instead.');
        return {saved:false, reason:'blank-local'};
      }

      const remoteFingerprint = fingerprint(remote.values);
      if (remote.exists && remoteFingerprint === valuesFingerprint) {
        clearAcceptedRemote();
        state.remoteExists = true;
        state.remoteSha = remote.sha;
        state.remoteFingerprint = remoteFingerprint;
        state.conflict = false;
        state.dirty = false;
        state.lastSavedAt = remote.bundle?.savedAt || state.lastSavedAt;
        setPhase('saved', `GitHub already has Brody's latest work${state.lastSavedAt ? ` from ${formatTime(state.lastSavedAt)}` : ''}.`);
        return {saved:true, unchanged:true, sha:remote.sha};
      }

      if (remote.exists && state.remoteSha && remote.sha !== state.remoteSha && options.resolveConflict !== true) {
        state.remoteExists = true;
        state.remoteSha = remote.sha;
        state.remoteFingerprint = remoteFingerprint;
        state.conflict = true;
        setPhase('conflict', 'A newer GitHub copy appeared before this save. Nothing was overwritten.');
        return {saved:false, reason:'conflict'};
      }
      if (remote.exists && !state.remoteSha && hasValues(remote.values) && options.resolveConflict !== true) {
        state.remoteExists = true;
        state.remoteSha = remote.sha;
        state.remoteFingerprint = remoteFingerprint;
        state.conflict = true;
        setPhase('conflict', 'GitHub has an existing record that was not this device\'s starting copy. Nothing was overwritten.');
        return {saved:false, reason:'unknown-base'};
      }

      const savedAt = new Date().toISOString();
      const bundle = {
        schemaVersion: 1,
        student,
        studentSlug,
        schoolYear: '2026–2027',
        savedAt,
        values
      };
      const body = {
        message: `${student} homeschool work · ${savedAt}`,
        content: encodeUtf8(JSON.stringify(bundle, null, 2) + '\n'),
        branch: config.branch
      };
      if (remote.exists) body.sha = remote.sha;

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {...apiHeaders(writeToken), 'Content-Type':'application/json'},
        body: JSON.stringify(body),
        signal: writeCredential.controller.signal
      });
      if (!credentialIsCurrent(writeCredential)) throw credentialCancellationError();
      if (response.status === 409 || response.status === 422) {
        state.conflict = true;
        setPhase('conflict', 'GitHub changed during this save. Nothing was overwritten; a parent should load the latest copy.');
        return {saved:false, reason:'conflict'};
      }
      if (!response.ok) {
        const error = new Error(response.status === 401
          ? 'GitHub did not accept the parent token.'
          : response.status === 403
            ? 'The token needs Contents read/write access to the records repository, or GitHub has temporarily limited requests.'
            : `GitHub could not save the record (${response.status}).`);
        error.status = response.status;
        throw error;
      }
      const result = await response.json();
      state.remoteExists = true;
      clearAcceptedRemote();
      state.remoteSha = result.content?.sha || null;
      state.remoteFingerprint = valuesFingerprint;
      state.conflict = false;
      state.dirty = false;
      state.lastSavedAt = savedAt;
      clearAcceptedRemote();
      setPhase('saved', `Saved to GitHub at ${formatTime(savedAt)}.`);
      return {saved:true, sha:state.remoteSha, savedAt};
    } catch (error) {
      if (isCredentialCancellation(error)) {
        state.dirty = hasValues(captureValues());
        if (!token) setPhase('device-only', 'GitHub writing was disconnected before this save. Brody\'s device copy remains saved.');
        return {saved:false, reason:'disconnected'};
      }
      state.dirty = true;
      if (error.status === 401) clearCredential();
      setPhase('offline', `${error.message} Brody's device copy is still safe.`, error.message);
      return {saved:false, error:error.message};
    }
  }

  function saveNow(options = {}) {
    clearAutoSaveTimer();
    saveChain = saveChain.catch(() => {}).then(() => saveOnce(options));
    return saveChain;
  }

  async function connect(value, options = {}) {
    const clean = String(value || '').trim();
    if (clean.length < 20 || /\s/.test(clean)) {
      setPhase('token-error', 'Enter the fine-grained GitHub token created for the records repository.');
      return {connected:false};
    }
    setSessionToken(clean);
    const connectionGeneration = credentialGeneration;
    setPhase('loading', 'Checking the GitHub connection…');
    const result = await loadLatest();
    if (result.error || connectionGeneration !== credentialGeneration || token !== clean) {
      state.connected = false;
      renderStatus();
      return {connected:false, ...result};
    }
    persistRememberedToken(clean, options.remember === true);
    state.connected = true;
    renderStatus();
    if (state.dirty && !state.conflict) scheduleAutoSave();
    return {connected:true, ...result};
  }

  function disconnect() {
    clearCredential({broadcast:true});
    setPhase('device-only', 'GitHub writing is disconnected. Brody\'s device copy remains saved.');
  }

  function formatTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString(undefined, {month:'short', day:'numeric', hour:'numeric', minute:'2-digit'});
  }

  function buildInterface() {
    if (!document.body) return;
    const dashboard = document.getElementById('dashboard');
    if (dashboard && !document.getElementById('github-sync-summary')) {
      const summary = document.createElement('div');
      summary.id = 'github-sync-summary';
      summary.className = 'github-sync-summary';
      summary.innerHTML = '<span class="github-sync-dot" aria-hidden="true"></span><strong>Work save:</strong> <span id="github-sync-summary-text" role="status" aria-live="polite"></span><button class="link-button" type="button" data-go="reports">Parent setup</button>';
      const hero = dashboard.querySelector('.hero-card');
      if (hero) hero.insertAdjacentElement('afterend', summary);
      summary.querySelector('[data-go="reports"]').addEventListener('click', () => {
        const reportsTab = document.querySelector('[data-view="reports"]');
        if (reportsTab) reportsTab.click();
      });
    }

    const reportGrid = document.querySelector('#reports .report-grid');
    if (reportGrid && !document.getElementById('github-sync-card')) {
      const card = document.createElement('article');
      card.id = 'github-sync-card';
      card.className = 'panel github-sync-card';
      card.innerHTML = `
        <p class="eyebrow">Parent setup</p>
        <h3>GitHub record history</h3>
        <p id="github-sync-detail" role="status" aria-live="polite"></p>
        <label class="github-sync-token-label" for="github-sync-token">Fine-grained GitHub token
          <input id="github-sync-token" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="github_pat_…">
        </label>
        <div class="actions">
          <button type="button" id="github-sync-connect">Connect GitHub</button>
          <button type="button" id="github-sync-save">Save now</button>
          <button type="button" id="github-sync-load">Load GitHub copy</button>
          <button type="button" id="github-sync-keep-device" hidden>Keep this device as latest</button>
          <button type="button" id="github-sync-disconnect">Disconnect &amp; forget on this browser</button>
        </div>
        <label class="github-sync-remember"><input id="github-sync-remember" type="checkbox"> Remember on this trusted family workstation</label>
        <p class="privacy-note">When remembered, anyone using this browser profile can write to the records repository. Leave this unchecked on a shared or public computer. The token stays in this browser profile after it closes and is never added to Brody's student record, work backup, exports, or GitHub commits.</p>
        <p class="privacy-note">Brody's record file and its version history are public. <a href="${historyUrl}" target="_blank" rel="noopener">Open GitHub history</a>. If a token is ever exposed, <a href="https://github.com/settings/personal-access-tokens" target="_blank" rel="noopener">revoke it in GitHub settings</a>.</p>`;
      reportGrid.append(card);

      const input = card.querySelector('#github-sync-token');
      const remember = card.querySelector('#github-sync-remember');
      card.querySelector('#github-sync-connect').addEventListener('click', async () => {
        const value = input.value;
        input.value = '';
        await connect(value, {remember:remember.checked});
      });
      card.querySelector('#github-sync-save').addEventListener('click', () => saveNow({reason:'parent'}));
      card.querySelector('#github-sync-load').addEventListener('click', async () => {
        const local = captureValues();
        if (hasValues(local) && !confirm('Load the latest GitHub copy on this device? This device copy will be archived first.')) return;
        await loadLatest({force:true});
      });
      card.querySelector('#github-sync-keep-device').addEventListener('click', async () => {
        if (!token) {
          setPhase('device-only', 'A parent must connect GitHub before keeping this device copy as the latest version.');
          return;
        }
        if (!confirm('Keep this device copy as the latest GitHub version? The previous GitHub version will remain in commit history.')) return;
        await saveNow({reason:'conflict-resolution', resolveConflict:true});
      });
      card.querySelector('#github-sync-disconnect').addEventListener('click', disconnect);
    }

    if (!dashboard && !document.getElementById('github-sync-page-status')) {
      const pageStatus = document.createElement('div');
      pageStatus.id = 'github-sync-page-status';
      pageStatus.className = 'github-sync-page-status no-print';
      pageStatus.setAttribute('role', 'status');
      pageStatus.setAttribute('aria-live', 'polite');
      document.body.append(pageStatus);
    }
    renderStatus();
  }

  function renderStatus() {
    const summary = document.getElementById('github-sync-summary-text');
    const detail = document.getElementById('github-sync-detail');
    const page = document.getElementById('github-sync-page-status');
    if (summary) summary.textContent = state.message;
    if (detail) detail.textContent = state.message;
    if (page) page.textContent = `Work save: ${state.message}`;
    const wrapper = document.getElementById('github-sync-summary');
    if (wrapper) wrapper.dataset.syncPhase = state.phase;
    const card = document.getElementById('github-sync-card');
    if (card) {
      card.dataset.syncPhase = state.phase;
      const saveButton = card.querySelector('#github-sync-save');
      const keepButton = card.querySelector('#github-sync-keep-device');
      const disconnectButton = card.querySelector('#github-sync-disconnect');
      if (saveButton) saveButton.disabled = !token || state.phase === 'saving' || state.conflict;
      if (keepButton) {
        keepButton.hidden = !state.conflict;
        keepButton.disabled = !token || state.phase === 'saving';
      }
      if (disconnectButton) disconnectButton.disabled = !token;
      const detail = card.querySelector('#github-sync-detail');
      if (detail) {
        if (token) detail.dataset.credential = tokenRemembered ? 'remembered' : 'session';
        else delete detail.dataset.credential;
      }
    }
  }

  function flushFromPageEvent() {
    if (!bootstrapping && token && state.dirty && !state.conflict) saveNow({automatic:true, reason:'page-event'});
  }

  document.addEventListener('DOMContentLoaded', buildInterface, {once:true});
  if (document.readyState !== 'loading') buildInterface();
  document.addEventListener('submit', () => setTimeout(flushFromPageEvent, 0));
  document.addEventListener('click', event => {
    if (event.target.closest('[data-assignment-toggle], #instruction-checkpoint, [data-reading-checkpoint], button[type="submit"]')) setTimeout(flushFromPageEvent, 0);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushFromPageEvent();
  });
  window.addEventListener('pagehide', flushFromPageEvent);
  window.addEventListener('storage', event => {
    if (event.key === credentialSignalKey && event.newValue) {
      clearCredential();
      setPhase('device-only', 'GitHub writing was disconnected in another tab. Brody\'s device copy remains saved.');
      return;
    }
    if (isRecordKey(event.key)) noteLocalChange();
  });

  const ready = (async () => {
    state.connected = Boolean(token);
    if (isLocalPreview) {
      bootstrapping = false;
      state.remoteChecked = true;
      state.dirty = hasValues(captureValues());
      setPhase('preview', 'GitHub sync is paused in this local preview. Device save remains active.');
      return publicStatus();
    }
    let deviceStatus = null;
    try {
      if (window.StorageResilience?.ready) deviceStatus = await window.StorageResilience.ready;
    } catch (error) {}
    if (deviceStatus?.recovered?.length) {
      bootstrapping = false;
      state.dirty = true;
      setPhase('loading', 'Saved work was recovered from this device. Refreshing before GitHub is checked…');
      return publicStatus();
    }
    const result = await loadLatest({publicRead:true});
    bootstrapping = false;
    if (result.loaded) return publicStatus();
    const local = captureValues();
    state.dirty = fingerprint(local) !== state.remoteFingerprint;
    if (token && state.dirty && !state.conflict && state.remoteChecked) scheduleAutoSave();
    else renderStatus();
    return publicStatus();
  })();

  window.GitHubSync = {
    ready,
    config,
    connect,
    disconnect,
    loadLatest,
    saveNow: () => saveNow({reason:'manual'}),
    status: publicStatus,
    captureValues: () => ({...captureValues()}),
    historyUrl
  };
})();
