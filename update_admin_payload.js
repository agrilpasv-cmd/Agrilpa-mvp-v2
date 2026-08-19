const fs = require('fs');

function fixNuevaAdmin() {
  let c = fs.readFileSync('app/admin/publicaciones/nueva/page.tsx', 'utf8');

  // Initial State
  c = c.replace(/packagingSize:\s*"",/, 'packagingSize: "",\n    packagingSizeUnit: "kg",');

  // Submit Payload
  c = c.replace(/containerSize:\s*formData\.containerSize\s*\|\|\s*null,/, 'containerSize: formData.containerSize || null,\n          packaging_size: formData.packagingSize ? `${formData.packagingSize} ${formData.packagingSizeUnit}` : "",');

  // FCL
  c = c.replace(/packagingSize:\s*prev\.packagingSize \|\| "21000"/g, 'packagingSize: "21000", packagingSizeUnit: "kg"');
  c = c.replace(/packagingSize:\s*"26000"/g, 'packagingSize: "26000", packagingSizeUnit: "kg"');
  c = c.replace(/packagingSize:\s*"21000,26000"/g, 'packagingSize: "21000,26000", packagingSizeUnit: "kg"');
  
  fs.writeFileSync('app/admin/publicaciones/nueva/page.tsx', c);
}

function fixEditarAdmin() {
  let c = fs.readFileSync('app/admin/publicaciones/[id]/editar/page.tsx', 'utf8');

  // Initial State
  c = c.replace(/packagingSize:\s*"",/, 'packagingSize: "",\n    packagingSizeUnit: "kg",');

  // Load Data
  c = c.replace(/packagingSize:\s*p\.packaging_size\?\.toString\(\)\s*\|\|\s*"",/, 'packagingSize: (p.packaging_size?.toString() || "").replace(/[a-zA-Z\\s]+$/g, ""),\n            packagingSizeUnit: (p.packaging_size?.toString() || "").match(/[a-zA-Z]+$/) ? (p.packaging_size?.toString() || "").match(/[a-zA-Z]+$/)[0] : "kg",');

  // Submit Payload
  c = c.replace(/packaging_size:\s*parseInt\(formData\.packagingSize\)\s*\|\|\s*0,/, 'packaging_size: formData.packagingSize ? `${formData.packagingSize} ${formData.packagingSizeUnit}` : "",');

  // FCL buttons
  c = c.replace(/packagingSize:\s*prev\.packagingSize \|\| "21000"/g, 'packagingSize: "21000", packagingSizeUnit: "kg"');
  c = c.replace(/packagingSize:\s*"26000"/g, 'packagingSize: "26000", packagingSizeUnit: "kg"');
  c = c.replace(/packagingSize:\s*"21000,26000"/g, 'packagingSize: "21000,26000", packagingSizeUnit: "kg"');

  fs.writeFileSync('app/admin/publicaciones/[id]/editar/page.tsx', c);
}

try { fixNuevaAdmin(); } catch (e) { console.error(e) }
try { fixEditarAdmin(); } catch (e) { console.error(e) }
