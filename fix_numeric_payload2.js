const fs = require('fs');

function fixPayload(file, fieldName) {
  let c = fs.readFileSync(file, 'utf8');

  // Match the exact multi-line string
  const regex = new RegExp(fieldName + ':\\s*formData\\.packagingSize \\? `\\$\\{formData\\.packagingSize\\} \\$\\{\\(\\(\\) => \\{[\\s\\S]*?\\}\\)\\(\\)\\}` : "",', 'g');
  
  c = c.replace(regex, fieldName + ': formData.packagingSize ? parseInt(formData.packagingSize) : null,');

  fs.writeFileSync(file, c);
}

try { fixPayload('app/dashboard/mis-publicaciones/nueva/page.tsx', 'packagingSize'); } catch(e) {}
try { fixPayload('app/dashboard/mis-publicaciones/[id]/editar/page.tsx', 'packaging_size'); } catch(e) {}
try { fixPayload('app/admin/publicaciones/nueva/page.tsx', 'packaging_size'); } catch(e) {}
try { fixPayload('app/admin/publicaciones/[id]/editar/page.tsx', 'packaging_size'); } catch(e) {}

