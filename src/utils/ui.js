import { $ } from './dom.js';
export function toast(message, type='info') {
  const root = $('#toast-root');
  const node = document.createElement('div');
  node.className = `toast fixed right-5 top-5 z-[100] mt-2 rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-semibold shadow-xl ${type==='success'?'ring-2 ring-emerald-400':''}`;
  node.textContent = message; root.appendChild(node);
  setTimeout(() => node.remove(), 2600);
}
export const statusPill = status => {
  const map = { Passed:'bg-emerald-50 text-emerald-700', Review:'bg-amber-50 text-amber-700', Failed:'bg-red-50 text-red-700' };
  return `<span class="inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${map[status] || 'bg-slate-100 text-slate-600'}">${status}</span>`;
};
