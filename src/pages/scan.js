import { demoProducts } from '../data/demo-data.js';
import { analyzeProduct, analysisSteps, inferProductDetails, extractedFields } from '../services/ai-simulator.js';
import { $, escapeHtml } from '../utils/dom.js';
import { toast } from '../utils/ui.js';

let selected = null;
let uploadedImage = null;
let stream = null;

export function getCurrent(){ return selected; }

export function renderScan(){
  return `<section class="scan-page">
    <div class="hero-banner">
      <div><div class="eyebrow">LIVE INSPECTION WORKSPACE</div><h1>Scan a real packaged commodity</h1><p>Upload a label, use your camera, and PackSure will run browser-based OCR to extract visible declarations from the actual image.</p></div>
      <div class="hero-badge"><span class="pulse-dot"></span> OCR ready</div>
    </div>
    <div class="scan-grid">
      <div class="glass-card scan-main">
        <div id="scan-content">
          <div class="source-grid">
            <button id="capture" class="source-card camera-card"><span class="source-icon">⌾</span><strong>Capture with camera</strong><small>Use your device camera</small></button>
            <label class="source-card upload-card"><span class="source-icon">↥</span><strong>Upload product image</strong><small>JPG, PNG, WEBP · label facing camera</small><input id="upload" type="file" accept="image/*" capture="environment" hidden></label>
          </div>
          <div class="demo-divider"><span>or use a deterministic SIH demo</span></div>
          <div class="demo-grid">${Object.values(demoProducts).map(p=>`<button data-demo="${p.key}" class="demo-tile"><span class="demo-score">${p.score}</span><span><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.category)}</small></span></button>`).join('')}</div>
        </div>
      </div>
      <aside class="glass-card scan-side"><div class="eyebrow">WHAT HAPPENS NEXT</div><div class="pipeline"><div><b>01</b><span>Read the label</span></div><div><b>02</b><span>Extract text + values</span></div><div><b>03</b><span>Detect category</span></div><div><b>04</b><span>Run compliance checks</span></div><div><b>05</b><span>Explain every flag</span></div></div><div class="privacy-note">↳ Processing is performed in your browser for this prototype. Your image is not uploaded to an external AI service.</div></aside>
    </div>
  </section>`;
}

export function initScan({showInspection}){
  $('#capture').onclick = startCamera;
  $('#upload').onchange = e => { const file=e.target.files?.[0]; if(file) handleImage(file, showInspection); };
  document.querySelectorAll('[data-demo]').forEach(b => b.onclick = () => { selected={...demoProducts[b.dataset.demo]}; uploadedImage=null; renderSelected(showInspection, true); });
}

async function startCamera(){
  try {
    stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}, audio:false});
    $('#scan-content').innerHTML = `<div class="camera-stage"><video id="camera" autoplay playsinline></video><div class="camera-frame"><span></span></div></div><div class="camera-actions"><button id="close-camera" class="btn-secondary">Cancel</button><button id="snap" class="btn-primary">Capture image</button></div><canvas id="camera-canvas" hidden></canvas>`;
    $('#camera').srcObject=stream;
    $('#close-camera').onclick=stopCamera;
    $('#snap').onclick=()=>{ const video=$('#camera'), canvas=$('#camera-canvas'); canvas.width=video.videoWidth; canvas.height=video.videoHeight; canvas.getContext('2d').drawImage(video,0,0); canvas.toBlob(blob=>{ if(blob) handleImage(new File([blob],'camera-capture.jpg',{type:'image/jpeg'}), null); },'image/jpeg',.92); };
  } catch(e){ toast('Camera access was blocked. You can upload an image instead.','error'); }
}
function stopCamera(){ if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;} window.packSure.go('scan'); }

async function handleImage(file, showInspection){
  if(file.size > 12*1024*1024){ toast('Please choose an image under 12 MB.','error'); return; }
  if(!file.type.startsWith('image/')){ toast('Please choose a JPG, PNG or WEBP image.','error'); return; }
  uploadedImage = await fileToDataURL(file);
  selected = {name:file.name.replace(/\.[^.]+$/,''), category:'Detecting from image…', image:uploadedImage, score:0, issues:[], ocrText:''};
  renderSelected(showInspection, false, file);
}

function renderSelected(showInspection, isDemo=false, file=null){
  $('#scan-content').innerHTML = `<div class="selected-workspace">
    <div class="selected-top"><div><div class="eyebrow">${isDemo?'DEMO PRODUCT':'REAL IMAGE'}</div><h2>${escapeHtml(selected.name)}</h2><p>${isDemo?escapeHtml(selected.category):'Image loaded — ready for OCR and compliance analysis.'}</p></div><button id="change-image" class="btn-secondary">Choose another</button></div>
    <div class="preview-layout">
      <div class="image-preview"><img src="${selected.image || demoImage(selected.key)}" alt="Product label preview"><div class="scan-overlay"><span class="scanline"></span></div></div>
      <div class="preview-info"><div class="info-pill"><span>Input</span><b>${isDemo?'Seeded demo':'User image'}</b></div><div class="info-pill"><span>OCR engine</span><b>${isDemo?'Deterministic':'Tesseract.js'}</b></div><div class="info-pill"><span>Mode</span><b>Local analysis</b></div></div>
    </div>
    <button id="analyze" class="btn-primary analyze-btn">Analyze with PackSure AI <span>→</span></button>
    <div id="progress" class="hidden"></div>
  </div>`;
  $('#change-image').onclick=()=>window.packSure.go('scan');
  $('#analyze').onclick=async()=>{
    const progress=$('#progress'); progress.classList.remove('hidden');
    progress.innerHTML='<div class="analysis-box"><div class="analysis-head"><span class="spinner"></span><div><b>PackSure is inspecting the label</b><small id="analysis-status">Preparing image…</small></div></div><div class="steps" id="steps"></div><div class="ocr-progress"><div id="ocr-bar"></div></div></div>';
    if(!isDemo){
      if(!window.Tesseract){ toast('OCR engine is still loading. Try again in a moment.','error'); return; }
      try{
        const result=await window.Tesseract.recognize(uploadedImage,'eng',{logger:m=>{ if(m.status==='recognizing text') $('#analysis-status').textContent=`Reading label… ${Math.round(m.progress*100)}%`; }});
        selected={...inferProductDetails(result.data.text,file?.name||selected.name),image:uploadedImage,ocrText:result.data.text};
      }catch(err){ toast('OCR could not read this image. You can still review the image manually.','error'); selected={...inferProductDetails('',file?.name||selected.name),image:uploadedImage}; }
    } else { await analyzeProduct(selected, i=>{$('#steps').innerHTML=analysisSteps.map((s,n)=>`<div class="analysis-step ${n<=i?'done':''}"><span>${n<=i?'✓':'○'}</span>${s}</div>`).join('');}); selected.extracted=extractedFields(selected); }
    if(!selected.extracted) selected.extracted=extractedFields(selected);
    $('#ocr-bar').style.width='100%';
    $('#analysis-status').textContent='Analysis complete';
    setTimeout(()=>showInspection({...selected, image:uploadedImage}),450);
  };
}
function fileToDataURL(file){ return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);}); }
function demoImage(key){ return `https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1000&q=85`; }
