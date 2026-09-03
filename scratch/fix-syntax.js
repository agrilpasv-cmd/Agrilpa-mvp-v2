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
    
    // It currently looks like:
    //     </div>
    //       {/* SUCCESS OVERLAY ANIMATION */}
    //       ...
    //     </div>
    //   )
    // }
    
    // Which means it was placed outside the outermost div, because the regex matched the final </div>!
    // The outermost wrapper was: <div className="min-h-screen bg-[#FDFCF8] text-[#1a202c] pb-24">
    // So the final </div> closes that.
    
    // Let's replace the malformed ending.
    const malformedEndRegex = /    <\/div>\n\s*\{\/\* SUCCESS OVERLAY ANIMATION \*\/\}([\s\S]*?)    <\/div>\n  \)\n\}/;
    
    const match = content.match(malformedEndRegex);
    if (match) {
        const overlayCode = match[1];
        // We want the overlay inside the outermost div, so we put it BEFORE the first </div>
        const fixedEnding = `      {/* SUCCESS OVERLAY ANIMATION */}${overlayCode}    </div>\n  )\n}`;
        content = content.replace(malformedEndRegex, fixedEnding);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed syntax error in ' + f);
    }
});
