const fs = require('fs');

const INFERRED_UNIT_LOGIC = `(() => {
                            if (formData.unit === 'lt' || formData.unit === 'L') return 'lt';
                            if (formData.unit === 'gal') return 'gal';
                            if (formData.unit === 'unidad' || formData.unit === 'caja') return 'u';
                            return 'kg';
                          })()`;

function fixPayload(file, isNueva) {
  let c = fs.readFileSync(file, 'utf8');

  // Change it to just send formData.packagingSize without the inferred unit string
  // For nueva/admin_nueva:
  // Note: we need to use a regex to match the previous replacement exactly.
  
  const regex = /packaging_?size:\s*formData\.packagingSize\s*\?\s*`\$\{formData\.packagingSize\}\s*\$\{\(\(\)\s*=>\s*\{\s*if\s*\(formData\.unit\s*===\s*'lt'\s*\|\|\s*formData\.unit\s*===\s*'L'\)\s*return\s*'lt';\s*if\s*\(formData\.unit\s*===\s*'gal'\)\s*return\s*'gal';\s*if\s*\(formData\.unit\s*===\s*'unidad'\s*\|\|\s*formData\.unit\s*===\s*'caja'\)\s*return\s*'u';\s*return\s*'kg';\s*\}\)\(\)\}`\s*:\s*"",/g;

  if (file.includes('admin')) {
     c = c.replace(regex, 'packaging_size: formData.packagingSize ? parseInt(formData.packagingSize) : null,');
  } else if (file.includes('nueva')) {
     c = c.replace(regex, 'packagingSize: formData.packagingSize ? parseInt(formData.packagingSize) : null,');
  } else {
     c = c.replace(regex, 'packaging_size: formData.packagingSize ? parseInt(formData.packagingSize) : null,');
  }

  fs.writeFileSync(file, c);
}

try { fixPayload('app/dashboard/mis-publicaciones/nueva/page.tsx', true); } catch(e) {}
try { fixPayload('app/dashboard/mis-publicaciones/[id]/editar/page.tsx', false); } catch(e) {}
try { fixPayload('app/admin/publicaciones/nueva/page.tsx', true); } catch(e) {}
try { fixPayload('app/admin/publicaciones/[id]/editar/page.tsx', false); } catch(e) {}

