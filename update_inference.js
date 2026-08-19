const fs = require('fs');

const INFERRED_UNIT_LOGIC = `(() => {
                            if (formData.unit === 'lt' || formData.unit === 'L') return 'lt';
                            if (formData.unit === 'gal') return 'gal';
                            if (formData.unit === 'unidad' || formData.unit === 'caja') return 'u';
                            return 'kg';
                          })()`;

const BADGE_BLOCK = `<label htmlFor="packagingSize" className="block text-sm font-medium mb-2">
                        Contenido / Capacidad por Embalaje <span className="text-muted-foreground text-xs font-normal">(Opcional)</span>
                      </label>
                      <div className="flex gap-2 relative">
                        <Input
                          id="packagingSize"
                          type="number"
                          name="packagingSize"
                          value={formData.packagingSize}
                          onChange={handleInputChange}
                          placeholder="Ej: 200, 25, 10"
                          className="w-full pr-12"
                          min="1"
                          disabled={isLoading || formData.unit === 'unidad'}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold flex items-center justify-center">
                          {${INFERRED_UNIT_LOGIC}}
                        </div>
                      </div>`;

function updateFile(file, isNueva) {
  let c = fs.readFileSync(file, 'utf8');

  // Replace the old block (the one with the select)
  const selectBlockRegex = /<label htmlFor="packagingSize" className="block text-sm font-medium mb-2">[\s\S]*?<\/Select>\s*<\/div>\s*<\/div>/;
  c = c.replace(selectBlockRegex, BADGE_BLOCK);

  // Update Payload
  if (isNueva) {
    // For nueva it was: packagingSize: formData.packagingSize ? `${formData.packagingSize} ${formData.packagingSizeUnit}` : "",
    c = c.replace(/packagingSize:\s*formData\.packagingSize \? \`\$\{formData\.packagingSize\} \$\{formData\.packagingSizeUnit\}\` : "",/, 
                  `packagingSize: formData.packagingSize ? \`\${formData.packagingSize} \${${INFERRED_UNIT_LOGIC}}\` : "",`);
    // admin nueva uses packaging_size
    c = c.replace(/packaging_size:\s*formData\.packagingSize \? \`\$\{formData\.packagingSize\} \$\{formData\.packagingSizeUnit\}\` : "",/, 
                  `packaging_size: formData.packagingSize ? \`\${formData.packagingSize} \${${INFERRED_UNIT_LOGIC}}\` : "",`);
  } else {
    // For editar it was: packaging_size: formData.packagingSize ? `${formData.packagingSize} ${formData.packagingSizeUnit}` : "",
    c = c.replace(/packaging_size:\s*formData\.packagingSize \? \`\$\{formData\.packagingSize\} \$\{formData\.packagingSizeUnit\}\` : "",/, 
                  `packaging_size: formData.packagingSize ? \`\${formData.packagingSize} \${${INFERRED_UNIT_LOGIC}}\` : "",`);
  }

  // Remove packagingSizeUnit from state
  c = c.replace(/\s*packagingSizeUnit:\s*"kg",?/g, '');
  
  // In editar, it was loaded into state as packagingSizeUnit. We can remove that line if we want, or leave it. It's harmless to leave it.
  c = c.replace(/packagingSizeUnit: \(p\.packaging_size[\s\S]*?: "kg",/, '');

  fs.writeFileSync(file, c);
}

try { updateFile('app/dashboard/mis-publicaciones/nueva/page.tsx', true); } catch(e) { console.error(e) }
try { updateFile('app/dashboard/mis-publicaciones/[id]/editar/page.tsx', false); } catch(e) { console.error(e) }
try { updateFile('app/admin/publicaciones/nueva/page.tsx', true); } catch(e) { console.error(e) }
try { updateFile('app/admin/publicaciones/[id]/editar/page.tsx', false); } catch(e) { console.error(e) }
