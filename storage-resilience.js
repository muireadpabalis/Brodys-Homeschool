/* Device-local progress mirror and recovery. Keeps Rory and Brody records separate on their shared GitHub Pages origin. */
(() => {
  'use strict';
  const cfg = window.PORTAL;
  if (!cfg?.student || !cfg?.recordKey) return;

  const prefix = cfg.student.toLowerCase();
  const databaseName = 'homeschoolDeviceBackup2026V1';
  const storeName = 'records';
  const recoveredNoticeKey = prefix + 'StorageRecoveredNotice2026';
  const isOwnKey = key => typeof key === 'string' && key.toLowerCase().startsWith(prefix);
  const validJson = raw => {
    if (typeof raw !== 'string') return false;
    try { JSON.parse(raw); return true; } catch (error) { return false; }
  };
  const localSnapshot = () => {
    const values = new Map();
    try {
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (isOwnKey(key)) values.set(key, localStorage.getItem(key));
      }
      return {ok:true, values, error:null};
    } catch (error) {
      return {ok:false, values, error:error?.message || 'Browser storage could not be read.'};
    }
  };
  const initialSnapshot = localSnapshot();
  const initialKeys = initialSnapshot.ok ? new Set(initialSnapshot.values.keys()) : null;
  let database = null;
  let writeQueue = Promise.resolve();
  let snapshotTimer = null;
  let status = {available:false, persistent:false, recovered:[], preservedBackups:[], error:null};

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(Error('IndexedDB is unavailable.'));
      const request = indexedDB.open(databaseName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName, {keyPath:'key'});
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || Error('Device backup could not open.'));
      request.onblocked = () => reject(Error('Device backup is blocked by another browser tab.'));
    });
  }

  function transactionComplete(transaction) {
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || Error('Device backup transaction failed.'));
      transaction.onabort = () => reject(transaction.error || Error('Device backup transaction was cancelled.'));
    });
  }

  function readBackups() {
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, 'readonly');
      const request = transaction.objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result.filter(entry => isOwnKey(entry?.key) && typeof entry.raw === 'string'));
      request.onerror = () => reject(request.error || Error('Device backup could not be read.'));
    });
  }

  async function snapshotNow() {
    if (!database) return false;
    const snapshot = localSnapshot();
    if (!snapshot.ok) {
      status.error = snapshot.error;
      showStatus();
      return false;
    }
    const values = snapshot.values;
    const previous = await readBackups();
    const previousByKey = new Map(previous.map(entry => [entry.key, entry]));
    const preservedBackups = [];
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const updatedAt = new Date().toISOString();
    for (const [key, raw] of values) {
      if (typeof raw !== 'string') continue;
      const previousEntry = previousByKey.get(key);
      if (previousEntry && validJson(previousEntry.raw) && !validJson(raw)) {
        preservedBackups.push(key);
        continue;
      }
      store.put({key, raw, student:cfg.student, updatedAt});
    }
    await transactionComplete(transaction);
    status.preservedBackups = preservedBackups;
    return true;
  }

  function queueSnapshot() {
    writeQueue = writeQueue.catch(() => {}).then(snapshotNow);
    return writeQueue;
  }

  function scheduleSnapshot() {
    if (snapshotTimer !== null) return;
    snapshotTimer = setTimeout(() => {
      snapshotTimer = null;
      queueSnapshot();
    }, 0);
  }

  function showStatus() {
    const reports = document.querySelector('#reports .report-grid');
    if (!reports) return;
    let card = document.getElementById('device-storage-card');
    if (!card) {
      card = document.createElement('article');
      card.id = 'device-storage-card';
      card.className = 'panel';
      card.innerHTML = '<h3>Device save</h3><p id="device-storage-status" aria-live="polite"></p><p class="privacy-note">Use this site in a regular Chrome or Edge window on the same device. Private and embedded browsers can discard website data when they close. Export the Full Record after each school week.</p>';
      reports.append(card);
    }
    const message = card.querySelector('#device-storage-status');
    if (status.recovered.length) message.textContent = 'Saved work was recovered from this device backup.';
    else if (status.preservedBackups.length) message.textContent = 'Device save kept its last good backup because one browser record needs parent attention.';
    else if (status.error && status.available) message.textContent = 'The last device backup was preserved, but this browser could not update it. Export the Full Record before closing.';
    else if (status.available && status.persistent) message.textContent = 'Device save is active and protected from routine browser storage cleanup.';
    else if (status.available) message.textContent = 'Device save is active. Keep weekly Full Record backups for long-term protection.';
    else message.textContent = 'This browser could not create the extra device backup. Export the Full Record before closing it.';
  }

  const ready = (async () => {
    try {
      database = await openDatabase();
      status.available = true;
      if (!initialSnapshot.ok) {
        status.error = initialSnapshot.error;
        showStatus();
        return status;
      }
      const backups = await readBackups();
      const recovered = [];
      for (const entry of backups) {
        if (initialKeys.has(entry.key)) continue;
        try {
          localStorage.setItem(entry.key, entry.raw);
          if (localStorage.getItem(entry.key) === entry.raw) recovered.push(entry.key);
        } catch (error) {
          status.error = error?.message || 'A saved record could not be restored to browser storage.';
        }
      }
      status.recovered = recovered;
      // Reload immediately after recovery. Application scripts may have built an
      // empty starter record while IndexedDB opened; yielding here would give
      // those stale in-memory defaults a chance to overwrite recovered work.
      if (recovered.length) {
        try { sessionStorage.setItem(recoveredNoticeKey, JSON.stringify(recovered)); } catch (error) {}
        location.reload();
        return status;
      }
      if (navigator.storage?.persisted) status.persistent = await navigator.storage.persisted();
      if (!status.persistent && navigator.storage?.persist) {
        try { status.persistent = await navigator.storage.persist(); } catch (error) {}
      }
      await queueSnapshot();
      try {
        const notice = JSON.parse(sessionStorage.getItem(recoveredNoticeKey) || '[]');
        if (Array.isArray(notice) && notice.length) status.recovered = notice;
        sessionStorage.removeItem(recoveredNoticeKey);
      } catch (error) {}
      for (const eventName of ['input','change','submit','click']) document.addEventListener(eventName, scheduleSnapshot);
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') queueSnapshot(); });
      window.addEventListener('pagehide', () => queueSnapshot());
      window.addEventListener('storage', event => { if (isOwnKey(event.key)) scheduleSnapshot(); });
      setInterval(queueSnapshot, 4000);
      showStatus();
      return status;
    } catch (error) {
      status = {available:false, persistent:false, recovered:[], preservedBackups:[], error:error.message};
      showStatus();
      return status;
    }
  })();

  window.StorageResilience = {ready, flush:() => queueSnapshot(), status:() => ({...status})};
})();
