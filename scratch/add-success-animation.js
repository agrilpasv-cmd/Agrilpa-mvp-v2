const fs = require('fs');
const path = require('path');

const files = [
    '../app/dashboard/mis-publicaciones/nueva/page.tsx',
    '../app/dashboard/mis-publicaciones/[id]/editar/page.tsx',
    '../app/admin/publicaciones/nueva/page.tsx',
    '../app/admin/publicaciones/[id]/editar/page.tsx'
];

const overlayCode = `
      {/* SUCCESS OVERLAY ANIMATION */}
      {statusMessage.type === 'success' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFCF8]/90 backdrop-blur-md animate-in fade-in duration-500">
          <div className="flex flex-col items-center animate-in zoom-in-75 slide-in-from-bottom-8 duration-700 ease-out">
            <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" style={{ animationDuration: '2s' }}></div>
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-xl shadow-primary/30 transform transition-transform animate-in zoom-in delay-200 duration-500">
                  <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a202c] text-center mb-3 tracking-tight">¡Misión Cumplida!</h2>
            <p className="text-[#6B7280] font-medium text-center text-lg">{statusMessage.text}</p>
          </div>
        </div>
      )}
`;

files.forEach(f => {
    const filePath = path.join(__dirname, f);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Extend the timeout duration for redirect to let the animation play out
    // setTimeout(() => router.push("/dashboard/mis-publicaciones"), 1500)
    // or /admin/publicaciones
    content = content.replace(/setTimeout\(\(\) => router\.push\([^)]+\), 1500\)/g, (match) => {
        return match.replace('1500', '2500');
    });

    // 2. Add the overlay before the last </div>
    // We can just find `  )\n}` and replace with the overlay + `\n  )\n}`
    if (!content.includes('SUCCESS OVERLAY ANIMATION')) {
        content = content.replace(/    <\/div>\n  \)\n\}/g, `    </div>\n${overlayCode}    </div>\n  )\n}`);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Added success animation to ' + f);
});
