const fs = require('fs');

const file = 'app/producto/[slug]/page.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/value: \`\\\${data\.product\.packaging_size\} kg\`/g, 'value: String(data.product.packaging_size).match(/[a-zA-Z]/) ? data.product.packaging_size : `${data.product.packaging_size} kg`');

fs.writeFileSync(file, c);
