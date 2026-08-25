import './styles/app.css';
import { $, mount } from './utils/dom.js'; import { toast } from './utils/ui.js'; import { renderShell, renderLogin, showApp, navItems } from './components/layout.js';
import { renderDashboard, initDashboard, destroyCharts } from './pages/dashboard.js'; import { renderScan, initScan, getCurrent } from './pages/scan.js'; import { renderInspection, initInspection } from './pages/inspection.js'; import { renderHistory, initHistory } from './pages/history.js'; import { renderAnalytics, initAnalytics, destroy as destroyAnalytics } from './pages/analytics.js'; import { renderRules, initRules } from './pages/rules.js'; import { renderProducts, initProducts } from './pages/products.js'; import { renderReport, initReport } from './pages/report.js';
renderShell();
let currentProduct=null, currentRoute='dashboard';
const pages={dashboard:renderDashboard,scan:renderScan,history:renderHistory,analytics:renderAnalytics,rules:renderRules,products:renderProducts,report:renderReport};
function setActiveNav(route){document.querySelectorAll('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.route===route));$('#crumb').textContent=navItems.find(x=>x[0]===route)?.[1]||'Inspection';}
function go(route){destroyCharts();destroyAnalytics();currentRoute=route;setActiveNav(route);if(route==='inspection'){mount('#page-root',renderInspection(currentProduct));initInspection(currentProduct,{go});return;}mount('#page-root',pages[route]()); if(route==='dashboard')initDashboard(); if(route==='scan')initScan({showInspection:product=>{currentProduct=product;go('inspection')}}); if(route==='history')initHistory({openInspection:p=>{currentProduct=p;go('inspection')}}); if(route==='analytics')initAnalytics(); if(route==='rules')initRules(); if(route==='products')initProducts({go,selectDemo:key=>{go('scan');setTimeout(()=>document.querySelector(`[data-demo="${key}"]`)?.click(),0)}}); if(route==='report')initReport();}
function login(){showApp();go('dashboard');toast('Welcome to PackSure AI','success');}
document.addEventListener('click',e=>{const route=e.target.closest('[data-route]')?.dataset.route;if(route)go(route);});
renderLogin(login);
window.packSure={go,login,getCurrent};
