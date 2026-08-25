export const inspector = { name: 'A. Sharma', id: 'LM-2048', department: 'Legal Metrology', region: 'West Bengal', location: 'Kolkata' };
export const demoProducts = {
  flour: { key:'flour', name:'Premium Wheat Flour', brand:'Harvest Gold', category:'Packaged Food → Flour', manufacturer:'Harvest Foods Pvt. Ltd.', quantity:'5 kg', mrp:'₹320', date:'08/2026', care:'1800-000-1234', origin:'India', batch:'HG-FL-0826', score:96, issues:[] },
  soap: { key:'soap', name:'PureCare Soap', brand:'PureCare', category:'Personal Care → Soap', manufacturer:'PureCare Consumer Products', quantity:'100 g', mrp:'₹48', date:'07/2026', care:'Not detected', origin:'India', batch:'PC-SO-0726', score:78, issues:[{title:'Consumer-care information unclear',severity:'Minor',desc:'Customer-care information was not confidently detected.',action:'Verify the declaration manually.'}] },
  oil: { key:'oil', name:'Sample Cooking Oil', brand:'FreshDrop', category:'Packaged Food → Edible Oil', manufacturer:'FreshDrop Foods', quantity:'900 ml / 1 L', mrp:'₹145', date:'08/2026', care:'Not detected', origin:'India', batch:'FD-OIL-0826', score:48, issues:[{title:'Missing mandatory declaration',severity:'Major',desc:'Required information was not reliably detected on the scanned package.',action:'Send for manual verification.'},{title:'Inconsistent quantity information',severity:'Major',desc:'Multiple quantity values were detected and could not be reconciled.',action:'Verify net quantity against the physical package.'},{title:'Consumer information missing',severity:'Minor',desc:'Consumer-care information was not detected.',action:'Verify the customer-care declaration.'}] }
};
export const seededInspections = [
 {id:'PK-10241',product:'Premium Wheat Flour',category:'Food',inspector:'A. Sharma',location:'Kolkata',score:96,status:'Passed',date:'Today',details:demoProducts.flour},
 {id:'PK-10240',product:'PureCare Soap',category:'Personal Care',inspector:'B. Sen',location:'Howrah',score:74,status:'Review',date:'Today',details:demoProducts.soap},
 {id:'PK-10239',product:'Cooking Oil',category:'Food',inspector:'A. Sharma',location:'Kolkata',score:48,status:'Failed',date:'Yesterday',details:demoProducts.oil}
];
export const productCatalog = [
 ['Premium Wheat Flour','Harvest Gold','Food',96,'Low'],['Sunrise Rice','Sunrise','Food',92,'Low'],['FreshDrop Cooking Oil','FreshDrop','Food',48,'Critical'],['PureCare Soap','PureCare','Personal Care',78,'High'],['AquaPure Water','AquaPure','Beverages',91,'Low'],['Crunchy Biscuits','Crunchy','Food',88,'Medium']
];
