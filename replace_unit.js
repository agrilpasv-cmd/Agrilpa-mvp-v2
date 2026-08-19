const fs = require('fs');
const file = 'app/dashboard/mis-publicaciones/nueva/page.tsx';
let c = fs.readFileSync(file, 'utf8');

const targetRegex = /<Select value=\{formData\.unit\}(?:[\s\S]*?)<\/Select>/g;

const replacement = `<Select value={formData.unit} onValueChange={(v) => setFormData(p => ({...p, unit: v}))} disabled={isLoading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES_MEDIDA.map((u) => (
                    <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>`;

c = c.replace(targetRegex, replacement);

fs.writeFileSync(file, c);
