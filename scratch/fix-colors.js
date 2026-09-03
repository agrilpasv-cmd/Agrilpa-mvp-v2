const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/dashboard/mis-publicaciones/nueva/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
    { find: /text-emerald-500/g, replace: 'text-primary' },
    { find: /text-emerald-600/g, replace: 'text-primary' },
    { find: /text-emerald-700/g, replace: 'text-primary' },
    { find: /bg-emerald-500/g, replace: 'bg-primary' },
    { find: /bg-emerald-600/g, replace: 'bg-primary' },
    { find: /bg-emerald-100\/50/g, replace: 'bg-primary/20' },
    { find: /bg-emerald-100/g, replace: 'bg-primary/20' },
    { find: /bg-emerald-50/g, replace: 'bg-primary/10' },
    { find: /border-emerald-200/g, replace: 'border-primary/30' },
];

replacements.forEach(r => {
    content = content.replace(r.find, r.replace);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replaced emerald colors with primary theme colors');
