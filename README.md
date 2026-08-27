# PackSure AI

**Scan. Verify. Comply.**

A polished prototype for packaged commodity compliance inspection.

## Project structure

```text
packsure-ai/
├── index.html                 # Browser entry point
├── package.json               # Local development scripts
├── README.md                  # Setup and developer notes
├── public/
│   └── assets/                # Images, icons and future static assets
└── src/
    ├── app.js                 # Application bootstrap + routing
    ├── styles/
    │   └── app.css            # Global styles and animations
    ├── components/
    │   └── layout.js          # Login, shell, navigation
    ├── data/
    │   ├── demo-data.js       # Demo products, inspector and seeded inspections
    │   └── rules.js           # Demonstration compliance rules
    ├── pages/
    │   ├── dashboard.js
    │   ├── scan.js
    │   ├── inspection.js
    │   ├── history.js
    │   ├── analytics.js
    │   ├── rules.js
    │   ├── products.js
    │   └── report.js
    ├── services/
    │   ├── ai-simulator.js    # Deterministic OCR/AI simulation
    │   └── inspection-store.js# Local inspection persistence
    └── utils/
        ├── dom.js             # Small DOM helpers
        └── ui.js              # Toasts and status badges
```

## Run locally

### Recommended

```bash
npm install
npm run dev
```

Then open the Vite URL shown in the terminal.

### No-install fallback

Because the app uses browser-native modules, a local server is recommended. For a quick SIH demo, use VS Code's **Live Server** extension and open `index.html`.

## Demo flow

`Try Demo → Dashboard → Scan Product → Select Sample Cooking Oil → Analyze → Inspection → Save → Report → History / Analytics`

The demo is deterministic and stores saved inspections in browser `localStorage`, so the core presentation does not depend on an external AI API.

## Important prototype note

The rules shown in the UI are demonstration rules only. Final regulatory requirements must be validated against current official Legal Metrology regulations and by authorized officials.

## Real Image Inspection
The Scan Product page now accepts a real product image or a camera capture. The browser runs Tesseract.js OCR, extracts likely MRP, quantity, manufacturer, dates, batch/lot, consumer-care and origin fields, infers a product category, and applies the prototype compliance checks. OCR is best-effort and should be treated as inspection assistance, not a legally binding determination.
