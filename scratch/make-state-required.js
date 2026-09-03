const fs = require('fs');
const path = require('path');

const files = [
    '../app/dashboard/mis-publicaciones/nueva/page.tsx',
    '../app/dashboard/mis-publicaciones/[id]/editar/page.tsx',
    '../app/admin/publicaciones/nueva/page.tsx',
    '../app/admin/publicaciones/[id]/editar/page.tsx'
];

files.forEach(f => {
    const filePath = path.join(__dirname, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Update validateStep to check for state
    const oldValidate = 'if (!formData.country) return "Selecciona el País de Origen."';
    const newValidate = 'if (!formData.country) return "Selecciona el País de Origen."\n      if (!formData.state) return "Debes ingresar el Estado / Región."';
    
    if (content.includes(oldValidate) && !content.includes('!formData.state')) {
        content = content.replace(oldValidate, newValidate);
    }
    
    // 2. Update UI to add asterisk to Estado / Región
    // <label className="text-sm font-bold text-foreground">Estado / Región</label>
    const oldLabel = '<label className="text-sm font-bold text-foreground">Estado / Región</label>';
    const newLabel = '<label className="text-sm font-bold text-foreground">Estado / Región <span className="text-destructive">*</span></label>';
    
    if (content.includes(oldLabel)) {
        content = content.replace(oldLabel, newLabel);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Made state mandatory in ' + f);
});
