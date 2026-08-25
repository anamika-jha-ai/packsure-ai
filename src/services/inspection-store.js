import { seededInspections } from '../data/demo-data.js';
const KEY='packsure-inspections';
export function getInspections(){ try { const saved=JSON.parse(localStorage.getItem(KEY)); return saved?.length ? saved : [...seededInspections]; } catch { return [...seededInspections]; } }
export function saveInspection(details){ const items=getInspections(); const id='PK-'+(10242+items.length); const entry={id,product:details.name,category:details.category.split('→')[0].trim(),inspector:'A. Sharma',location:'Kolkata',score:details.score,status:details.score>=90?'Passed':details.score>=70?'Review':'Failed',date:'Today',details}; items.unshift(entry); localStorage.setItem(KEY,JSON.stringify(items)); return entry; }
export function findInspection(id){ return getInspections().find(x=>x.id===id); }
