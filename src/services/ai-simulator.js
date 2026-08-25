export const analysisSteps = [
  'Image preprocessing',
  'Detecting label regions',
  'Extracting text with OCR',
  'Identifying product category',
  'Checking applicable requirements',
  'Validating declarations',
  'Generating compliance score'
];

export function analyzeProduct(product, onStep) {
  return new Promise(resolve => {
    let i = 0;
    const timer = setInterval(() => {
      onStep(i, analysisSteps[i]);
      i++;
      if (i >= analysisSteps.length) {
        clearInterval(timer);
        resolve(product);
      }
    }, 430);
  });
}

const clean = value => String(value || '').replace(/\s+/g, ' ').trim();

export function inferProductDetails(ocrText, fileName = 'Uploaded product') {
  const raw = clean(ocrText);
  const lower = raw.toLowerCase();
  const lines = raw.split(/[\n|]+/).map(clean).filter(Boolean);

  const match = (regex, fallback = 'Not detected') => {
    const found = raw.match(regex);
    return found?.[1] ? clean(found[1]) : fallback;
  };

  const quantity = match(/(?:net\s*(?:quantity|qty)|quantity)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?\s*(?:kg|g|mg|l|ml|litre|liter|litres|liters|pcs?|pieces?))/i);
  const mrp = match(/(?:mrp|m\.r\.p\.?|maximum retail price)\s*[:\-]?\s*(₹|rs\.?\s*)?([0-9]+(?:\.\d{1,2})?)/i);
  const date = match(/(?:mfg|mfd|manufactured|packed|packing|pkd|date)\s*(?:date)?\s*[:\-]?\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{1,2}[\/-]\d{2,4}|\d{2,4}[\/-]\d{1,2})/i);
  const batch = match(/(?:batch|lot|lot no\.?|batch no\.?)\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-\/]+)/i);
  const care = match(/(?:customer care|consumer care|helpline|toll free|contact us)\s*[:\-]?\s*([^\n|]{6,60})/i);
  const origin = /country of origin|made in india|product of india|manufactured in india/i.test(raw) ? 'India' : 'Not detected';
  const manufacturer = match(/(?:manufactured by|manufactured & packed by|marketed by|packed by|manufacturer)\s*[:\-]?\s*([^\n|]{4,100})/i);

  let category = 'Packaged Commodity';
  let subcategory = 'General';
  if (/wheat|flour|atta|rice|dal|pulse|biscuit|cookie|juice|snack|oil|ghee|spice|salt|sugar|food/i.test(lower)) {
    category = 'Packaged Food';
    if (/oil|edible/i.test(lower)) subcategory = 'Edible Oil';
    else if (/flour|atta|wheat/i.test(lower)) subcategory = 'Flour';
    else if (/rice/i.test(lower)) subcategory = 'Rice';
    else if (/biscuit|cookie/i.test(lower)) subcategory = 'Biscuits';
    else if (/juice/i.test(lower)) subcategory = 'Beverage';
  } else if (/soap|shampoo|toothpaste|cream|lotion|detergent/i.test(lower)) {
    category = 'Personal Care / Household';
    subcategory = /soap/i.test(lower) ? 'Soap' : /shampoo/i.test(lower) ? 'Shampoo' : 'Personal Care';
  } else if (/water|mineral water|beverage|drink/i.test(lower)) {
    category = 'Beverages';
    subcategory = 'Packaged Water / Beverage';
  }

  const likelyName = lines.find(line => {
    const l = line.toLowerCase();
    return line.length > 3 && line.length < 70 && !/(mrp|batch|manufactur|packed|quantity|customer|care|fssai|barcode|www\.|http|₹|rs\.?\s*\d)/i.test(l);
  }) || fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ');

  const fields = [
    ['Product Name', likelyName, likelyName !== fileName ? 88 : 62],
    ['Brand', match(/(?:brand)\s*[:\-]?\s*([^\n|]{2,60})/i), 78],
    ['Manufacturer', manufacturer, manufacturer === 'Not detected' ? 52 : 90],
    ['Net Quantity', quantity, quantity === 'Not detected' ? 50 : 95],
    ['MRP', mrp === 'Not detected' ? mrp : `₹${mrp.replace(/^₹|^rs\.?\s*/i, '')}`, mrp === 'Not detected' ? 50 : 96],
    ['Manufacturing / Packing Date', date, date === 'Not detected' ? 48 : 92],
    ['Consumer Care', care, care === 'Not detected' ? 48 : 88],
    ['Country of Origin', origin, origin === 'Not detected' ? 50 : 96],
    ['Batch / Lot Number', batch, batch === 'Not detected' ? 50 : 91]
  ];

  const checks = [
    ['MRP declaration', mrp !== 'Not detected'],
    ['Net quantity declaration', quantity !== 'Not detected'],
    ['Manufacturer / packer information', manufacturer !== 'Not detected'],
    ['Consumer-care information', care !== 'Not detected'],
    ['Date declaration', date !== 'Not detected'],
    ['Country of origin', origin !== 'Not detected']
  ];

  const violations = [];
  if (mrp === 'Not detected') violations.push({ title: 'MRP declaration not detected', severity: 'Major', desc: 'The OCR text did not contain a reliable MRP value.', action: 'Inspect the MRP area on the physical package.' });
  if (quantity === 'Not detected') violations.push({ title: 'Net quantity not detected', severity: 'Major', desc: 'A clear net quantity declaration was not identified.', action: 'Verify the quantity declaration manually.' });
  if (manufacturer === 'Not detected') violations.push({ title: 'Manufacturer information not detected', severity: 'Major', desc: 'Manufacturer or packer information was not confidently identified.', action: 'Review the manufacturer/packer declaration.' });
  if (care === 'Not detected') violations.push({ title: 'Consumer-care information unclear', severity: 'Minor', desc: 'Customer-care information was not confidently detected in OCR output.', action: 'Zoom into the consumer-care panel and verify manually.' });
  if (date === 'Not detected') violations.push({ title: 'Manufacturing / packing date not detected', severity: 'Minor', desc: 'No reliable date pattern was identified.', action: 'Verify the printed date on the package.' });

  const score = Math.max(25, Math.round((checks.filter(x => x[1]).length / checks.length) * 100 - violations.filter(v => v.severity === 'Major').length * 6));
  const product = {
    key: 'uploaded',
    name: likelyName,
    brand: match(/(?:brand)\s*[:\-]?\s*([^\n|]{2,60})/i),
    category: `${category} → ${subcategory}`,
    manufacturer,
    quantity,
    mrp: mrp === 'Not detected' ? mrp : `₹${mrp.replace(/^₹|^rs\.?\s*/i, '')}`,
    date,
    care,
    origin,
    batch,
    score,
    issues: violations,
    ocrText: raw,
    checks,
    fields
  };
  return product;
}

export function extractedFields(product) {
  return product.fields || [
    ['Product Name', product.name, 97], ['Brand', product.brand, 96], ['Manufacturer', product.manufacturer, 92],
    ['Net Quantity', product.quantity, 96], ['MRP', product.mrp, 99], ['Manufacturing/Packing Date', product.date, 94],
    ['Consumer Care', product.care, product.care === 'Not detected' ? 61 : 89], ['Country of Origin', product.origin, 98],
    ['Batch/Lot Number', product.batch, 93]
  ];
}
