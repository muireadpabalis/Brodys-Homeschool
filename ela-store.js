/* Additive, per-assignment storage; no diagnostic records are migrated. */
(() => {
 'use strict';
 const prefix='brodyELABridge2026_', reviewKey='brodyELAParent2026';
 const read=(key,fallback=null)=>{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw);};
 const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
 const blank=()=>({schemaVersion:1,fields:{},checks:{},snapshots:[],updatedAt:null});
 const work=id=>read(prefix+id,blank());
 const save=(id,change)=>{const value=work(id);change(value);value.updatedAt=new Date().toISOString();write(prefix+id,value);return value;};
 const evidence=()=>Object.fromEntries(window.ELA_CURRICULUM.assignments.map(a=>[a.id,read(prefix+a.id)]).filter(([,v])=>v));
 const download=(name,value)=>{const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 // Current local values win conflicts; missing stage data and immutable snapshots merge.
 function merge(incoming){
  const valid=new Set(window.ELA_CURRICULUM.assignments.map(a=>a.id));
  for(const [id,v] of Object.entries(incoming||{})){
   if(!valid.has(id)||!v||!v.fields||!Array.isArray(v.snapshots))throw new Error('Invalid ELA evidence in backup.');
   const current=read(prefix+id);if(!current){write(prefix+id,v);continue;}
   current.fields={...v.fields,...current.fields};current.checks={...v.checks,...current.checks};
   const ids=new Set(current.snapshots.map(s=>s.id));for(const s of v.snapshots)if(!ids.has(s.id)){current.snapshots.push(s);ids.add(s.id);}
   write(prefix+id,current);
  }
 }
 window.ELAStore={prefix,reviewKey,read,write,work,save,evidence,download,esc,merge};
})();
