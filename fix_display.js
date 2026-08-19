const fs = require('fs');

const file = 'app/producto/[slug]/page.tsx';
let c = fs.readFileSync(file, 'utf8');

const REPLACE_STR = `String(data.product.packaging_size).match(/[a-zA-Z]/) ? data.product.packaging_size : \`\${data.product.packaging_size} \${(() => { const u = data.product.unit; if (u === 'lt' || u === 'L') return 'lt'; if (u === 'gal') return 'gal'; if (u === 'unidad' || u === 'caja') return 'u'; return 'kg'; })()}\``;

c = c.replace(/packagingSize:\s*`\$\{data\.product\.packaging_size\} kg`,/g, `packagingSize: ${REPLACE_STR},`);
c = c.replace(/value:\s*`\$\{data\.product\.packaging_size\} kg`/g, `value: ${REPLACE_STR}`);

fs.writeFileSync(file, c);
