const fs = require('fs');
const path = require('path');

const files = [
    '../app/dashboard/mis-publicaciones/[id]/editar/page.tsx',
    '../app/admin/publicaciones/nueva/page.tsx',
    '../app/admin/publicaciones/[id]/editar/page.tsx'
];

files.forEach(f => {
    const filePath = path.join(__dirname, f);
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('ArrowRight')) {
        content = content.replace(/import \{([^}]+)\} from "lucide-react"/, (match, p1) => {
            return `import {${p1}, ArrowRight} from "lucide-react"`;
        });
        fs.writeFileSync(filePath, content);
        console.log('Fixed imports in ' + f);
    }
});
