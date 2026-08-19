const fs = require('fs');

function update(file) {
  let c = fs.readFileSync(file, 'utf8');

  // Remove packagingSize from required fields check (only if present)
  c = c.replace(/\{\s*key:\s*"packagingSize"\s*,\s*label:\s*"Peso por Embalaje"\s*\},/g, '');

  // Modify the packagingSize input block
  const oldBlock = /<label htmlFor="packagingSize" className="block text-sm font-medium mb-2">\s*Peso por Embalaje\s*<span className="text-red-500">\*<\/span>\s*<\/label>\s*<div className="flex gap-2">\s*<Input[\s\S]*?id="packagingSize"[\s\S]*?disabled={isLoading}\s*required\s*\/>\s*<span className="flex items-center px-3 bg-primary\/10 border border-primary\/20 rounded-md font-semibold text-primary">\s*kg\s*<\/span>\s*<\/div>/;

  const newBlock = `<label htmlFor="packagingSize" className="block text-sm font-medium mb-2">
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
                          className="w-full pr-24"
                          min="1"
                          disabled={isLoading}
                        />
                        <div className="absolute right-0 top-0 h-full flex items-center">
                          <Select value={formData.packagingSizeUnit || "kg"} onValueChange={(v) => setFormData(p => ({...p, packagingSizeUnit: v}))} disabled={isLoading}>
                            <SelectTrigger className="h-full border-y-0 border-r-0 border-l rounded-l-none bg-primary/5 text-primary border-primary/20 w-[80px] focus:ring-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="L">L</SelectItem>
                              <SelectItem value="gal">gal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>`;

  c = c.replace(oldBlock, newBlock);
  fs.writeFileSync(file, c);
}

try { update('app/dashboard/mis-publicaciones/nueva/page.tsx'); } catch (e) { console.error("Error in nueva:", e) }
try { update('app/dashboard/mis-publicaciones/[id]/editar/page.tsx'); } catch (e) { console.error("Error in editar:", e) }
try { update('app/admin/publicaciones/nueva/page.tsx'); } catch (e) { console.error("Error in admin nueva:", e) }
try { update('app/admin/publicaciones/[id]/editar/page.tsx'); } catch (e) { console.error("Error in admin editar:", e) }
