const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/dashboard/dashboard-shell.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Check for `Check` import in lucide-react and add if missing
if (!content.includes('Check,')) {
    content = content.replace('X,', 'X,\n    Check,');
}

// 2. Replace the modal wrapper and header
const oldModalStartRegex = /<div className="fixed inset-0 z-\[100\] flex items-center justify-center bg-black\/70 backdrop-blur-sm p-4 overflow-y-auto">[\s\S]*?<div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-\[90vh\] overflow-y-auto flex flex-col transition-all transform scale-100">/;

const newModalStart = `<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6 overflow-y-auto">
                    <div className="bg-[#FDFCF8] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden transition-all transform scale-100 border border-border/50">
                        
                        {/* Left Sidebar Stepper (Desktop) */}
                        <div className="hidden md:flex flex-col w-[300px] bg-white p-8 border-r border-border/50 shrink-0 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>
                            
                            <div className="mb-10 relative z-10">
                                <Image src="/agrilpa-logo.svg" alt="Agrilpa" width={140} height={50} priority />
                                <p className="text-sm text-muted-foreground mt-4 font-medium">Configura tu perfil comercial para desbloquear todas las herramientas de negociación B2B.</p>
                            </div>

                            <div className="flex-1 relative z-10">
                                <div className="space-y-6">
                                    {/* Step 1 */}
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors \${setupStep >= 1 ? 'border-primary bg-primary text-white shadow-md shadow-primary/20' : 'border-gray-200 text-muted-foreground bg-white'}\`}>
                                                {setupStep > 1 ? <Check className="w-4 h-4" /> : "1"}
                                            </div>
                                            <div className={\`w-0.5 h-full mt-2 transition-colors \${setupStep > 1 ? 'bg-primary' : 'bg-gray-100'}\`}></div>
                                        </div>
                                        <div className="pb-6">
                                            <p className={\`font-bold \${setupStep >= 1 ? 'text-foreground' : 'text-muted-foreground'}\`}>Perfil Comercial</p>
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Información básica y tipo de empresa</p>
                                        </div>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors \${setupStep >= 2 ? 'border-primary bg-primary text-white shadow-md shadow-primary/20' : 'border-gray-200 text-muted-foreground bg-white'}\`}>
                                                {setupStep > 2 ? <Check className="w-4 h-4" /> : "2"}
                                            </div>
                                            <div className={\`w-0.5 h-full mt-2 transition-colors \${setupStep > 2 ? 'bg-primary' : 'bg-gray-100'}\`}></div>
                                        </div>
                                        <div className="pb-6">
                                            <p className={\`font-bold \${setupStep >= 2 ? 'text-foreground' : 'text-muted-foreground'}\`}>Ubicación</p>
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Datos de contacto y origen</p>
                                        </div>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={\`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors \${setupStep >= 3 ? 'border-primary bg-primary text-white shadow-md shadow-primary/20' : 'border-gray-200 text-muted-foreground bg-white'}\`}>
                                                3
                                            </div>
                                        </div>
                                        <div>
                                            <p className={\`font-bold \${setupStep >= 3 ? 'text-foreground' : 'text-muted-foreground'}\`}>Preferencias Comerciales</p>
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">Productos de interés y volúmenes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Content Area */}
                        <div className="flex-1 flex flex-col relative h-[90vh] overflow-y-auto">
                            {/* Mobile Header (Hidden on Desktop) */}
                            <div className="md:hidden p-5 border-b border-border bg-white sticky top-0 z-10">
                                <div className="flex justify-between items-center mb-4">
                                    <Image src="/agrilpa-logo.svg" alt="Agrilpa" width={110} height={40} priority />
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">Paso {setupStep} de 3</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3].map((step) => (
                                        <div key={step} className={\`flex-1 h-1.5 rounded-full transition-all duration-300 \${setupStep >= step ? "bg-primary" : "bg-gray-100"}\`} />
                                    ))}
                                </div>
                            </div>`;

const oldHeaderRegex = /\{\/\* Header \*\/\}[\s\S]*?<\/div>\n\n                        \{setupError/m;
const newHeaderReplacement = `{setupError`;

if (content.match(oldModalStartRegex) && content.match(oldHeaderRegex)) {
    content = content.replace(oldModalStartRegex, newModalStart);
    content = content.replace(oldHeaderRegex, newHeaderReplacement);
}

// Enhance inputs and buttons inside the form
// Convert the old flat grey button to a nice green one
content = content.replace(
    /className="flex-1 bg-primary text-white font-semibold py-3\.5 rounded-md hover:bg-primary\/90 flex items-center justify-center gap-2 transition uppercase disabled:opacity-50"/g,
    'className="flex-1 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary/90 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 uppercase disabled:opacity-50 disabled:hover:translate-y-0"'
);

// Convert back button
content = content.replace(
    /className="flex-1 bg-white border border-gray-300 text-foreground font-semibold py-3\.5 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 transition uppercase"/g,
    'className="flex-1 bg-white border border-border text-foreground font-bold py-3.5 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 transition-all hover:text-primary uppercase"'
);

// Convert inputs to rounded-xl styling and add nice background
content = content.replace(/rounded-md/g, 'rounded-xl');

// Remove original </form> and </div> wrapper because we added a new div structure for the sidebar
// Wait, the original had:
//                     </div>
//                 </div>
//             )}
// We need to just leave the bottom the same. The form is inside the right content area which is a div that closes when the modal closes.
// Since we opened a flex row, we just need to make sure the divs match.
// `oldModalStartRegex` replaced 2 divs with 2 divs (1 background fixed, 1 flex row wrapper). 
// Then we added `<div sidebar>` and `<div right content>`. The right content wraps the `<form>`.
// So we need to add one closing `</div>` right before `)}` at the end of the modal.
const endOfModalRegex = /<\/form>\n                    <\/div>\n                <\/div>\n            \)}/;
const endOfModalReplacement = `</form>\n                        </div>\n                    </div>\n                </div>\n            )}`;
content = content.replace(endOfModalRegex, endOfModalReplacement);

// Add the success animation when submitting
// We will insert it just inside the Right Content Area, above the form
const formStartRegex = /<form onSubmit=\{handleSetupSubmit\} className="p-6 flex-1 space-y-4">/;
const formStartReplacement = `
                            {isSubmittingSetup && !setupError && (
                                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                                            <Check className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground mb-2">¡Perfil Completado!</h3>
                                    <p className="text-muted-foreground font-medium">Configurando tu panel B2B...</p>
                                </div>
                            )}
                            <form onSubmit={handleSetupSubmit} className="p-6 md:p-8 flex-1 space-y-5">`;
content = content.replace(formStartRegex, formStartReplacement);


fs.writeFileSync(filePath, content, 'utf8');
console.log('Onboarding modal upgraded!');
