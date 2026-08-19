const fs = require('fs');
let c = fs.readFileSync('app/dashboard/mis-publicaciones/[id]/editar/page.tsx', 'utf8');

// 1. Initial State
c = c.replace(/packagingSize:\s*"",/, 'packagingSize: "",\n    packagingSizeUnit: "kg",');

// 2. Load Data
const loadReplacement = `const pkgSizeFull = p.packaging_size?.toString() || "";
            const pkgMatch = pkgSizeFull.match(/^([\\d,.]+)\\s*([a-zA-Z]+)?$/);
            
            setFormData({
              ...
              packagingSize: pkgMatch ? pkgMatch[1] : pkgSizeFull,
              packagingSizeUnit: (pkgMatch && pkgMatch[2]) ? pkgMatch[2] : "kg",`;
// Wait, regex replace might be safer
c = c.replace(/packagingSize:\s*p\.packaging_size\?\.toString\(\)\s*\|\|\s*"",/, 'packagingSize: (p.packaging_size?.toString() || "").replace(/[a-zA-Z\\s]+$/g, ""),\n            packagingSizeUnit: (p.packaging_size?.toString() || "").match(/[a-zA-Z]+$/) ? (p.packaging_size?.toString() || "").match(/[a-zA-Z]+$/)[0] : "kg",');


// 3. Submit Payload
c = c.replace(/packaging_size:\s*parseInt\(formData\.packagingSize\)\s*\|\|\s*0,/, 'packaging_size: formData.packagingSize ? `${formData.packagingSize} ${formData.packagingSizeUnit}` : "",');

// FCL buttons
c = c.replace(/packagingSize:\s*prev\.packagingSize \|\| "21000"/g, 'packagingSize: "21000", packagingSizeUnit: "kg"');
c = c.replace(/packagingSize:\s*"26000"/g, 'packagingSize: "26000", packagingSizeUnit: "kg"');
c = c.replace(/packagingSize:\s*"21000,26000"/g, 'packagingSize: "21000,26000", packagingSizeUnit: "kg"');

fs.writeFileSync('app/dashboard/mis-publicaciones/[id]/editar/page.tsx', c);
