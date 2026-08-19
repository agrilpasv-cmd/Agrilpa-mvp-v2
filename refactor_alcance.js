const fs = require('fs');
const file = 'app/dashboard/mis-publicaciones/nueva/page.tsx';
let c = fs.readFileSync(file, 'utf8');

const regex = /<div>\s*<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">\s*Mercado Nacional\s*<\/h4>[\s\S]*?\{selectedAlcance\.some\([^\)]+\) && \([\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*<\/div>\s*<\/div>/;

const replacement = `<div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Mercado Nacional
                  </h4>
                  <div className="space-y-3 bg-background p-3 rounded-lg border border-border">
                    <div className="flex flex-col gap-2.5">
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={selectedAlcance.some(item => item.startsWith("Nacional") || item.includes("nacional") || item.includes("Local"))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const defaultCountry = formData.country || "todo el país"
                              setSelectedAlcance([
                                ...selectedAlcance.filter(item => !item.startsWith("Nacional") && !item.includes("nacional") && !item.includes("Local")),
                                \`Nacional (Cobertura en \${defaultCountry})\`
                              ])
                            } else {
                              setSelectedAlcance(selectedAlcance.filter((item) => !item.startsWith("Nacional") && !item.includes("nacional") && !item.includes("Local")))
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        />
                        <span className="text-sm font-medium text-foreground">
                          Nacional (Cobertura en {formData.country || "todo el país"})
                        </span>
                      </label>
                    </div>
                  </div>
                </div>`;

c = c.replace(regex, replacement);
fs.writeFileSync(file, c);
