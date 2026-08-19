const fs = require('fs');
let c = fs.readFileSync('app/dashboard/mis-publicaciones/nueva/page.tsx', 'utf8');

// 1. Initial State
c = c.replace(/packagingSize:\s*"",/, 'packagingSize: "",\n    packagingSizeUnit: "kg",');

// 2. Submit Payload
c = c.replace(/packagingSize:\s*prev\.packagingSize \|\| "21000"/g, 'packagingSize: "21000", packagingSizeUnit: "kg"');
c = c.replace(/packagingSize:\s*"26000"/g, 'packagingSize: "26000", packagingSizeUnit: "kg"');
c = c.replace(/packagingSize:\s*"21000,26000"/g, 'packagingSize: "21000,26000", packagingSizeUnit: "kg"');

c = c.replace(/containerSize:\s*formData\.containerSize\s*\|\|\s*null,/, 'containerSize: formData.containerSize || null,\n          packagingSize: formData.packagingSize ? `${formData.packagingSize} ${formData.packagingSizeUnit}` : "",');

fs.writeFileSync('app/dashboard/mis-publicaciones/nueva/page.tsx', c);
