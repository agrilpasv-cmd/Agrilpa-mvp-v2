const fs = require('fs');
let c = fs.readFileSync('lib/constants.ts', 'utf8');
c = c.replace(
  "{ value: 'unidad', label: 'Unidades (unidad)' },",
  "{ value: 'unidad', label: 'Unidades (unidad)' },\n  { value: 'caja', label: 'Cajas (caja)' },"
);
fs.writeFileSync('lib/constants.ts', c);
