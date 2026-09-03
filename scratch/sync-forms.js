const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../app/dashboard/mis-publicaciones/nueva/page.tsx');
const targetPaths = [
    { path: '../app/dashboard/mis-publicaciones/[id]/editar/page.tsx', isEdit: true, isAdmin: false },
    { path: '../app/admin/publicaciones/nueva/page.tsx', isEdit: false, isAdmin: true },
    { path: '../app/admin/publicaciones/[id]/editar/page.tsx', isEdit: true, isAdmin: true },
];

const srcContent = fs.readFileSync(srcPath, 'utf8');

// 1. Extract handleInputChange
const handleInputMatch = srcContent.match(/const handleInputChange = \([^)]+\) => \{[\s\S]*?(?=const handleImageUpload)/);
if (!handleInputMatch) throw new Error("Could not find handleInputChange");
const handleInputChangeStr = handleInputMatch[0];

// 2. Extract step functions
const stepFnsMatch = srcContent.match(/const validateStep = \(step: number\) => \{[\s\S]*?(?=const handleSubmit)/);
if (!stepFnsMatch) throw new Error("Could not find step functions");
const stepFnsStr = stepFnsMatch[0];

// 3. Extract the UI (stepsInfo + return)
const returnMatch = srcContent.match(/const stepsInfo = \[[\s\S]*/);
if (!returnMatch) throw new Error("Could not find return block");
const returnStr = returnMatch[0];


targetPaths.forEach(target => {
    const filePath = path.join(__dirname, target.path);
    let targetContent = fs.readFileSync(filePath, 'utf8');

    // Replace handleInputChange
    const targetHandleInputMatch = targetContent.match(/const handleInputChange = \([^)]+\) => \{[\s\S]*?(?=const handleImageUpload)/);
    if (targetHandleInputMatch) {
        targetContent = targetContent.replace(targetHandleInputMatch[0], handleInputChangeStr);
    }

    // Replace step functions
    const targetStepFnsMatch = targetContent.match(/const validateStep = \(step: number\) => \{[\s\S]*?(?=const handleSubmit)/);
    if (targetStepFnsMatch) {
        targetContent = targetContent.replace(targetStepFnsMatch[0], stepFnsStr);
    }

    // Replace return block
    // Find where the old return block starts (could be before or after activeCertsArray)
    // To be safe, we'll replace everything after `const activeCertsArray` or similar.
    
    // In previous versions, we had: const activeCertsArray = ...
    // Let's replace from `const activeCertsArray` to the end.
    // Wait, some files might not have stepsInfo if they are old.
    
    // Let's replace from `return \(` or `const stepsInfo =` or `const activeCertsArray =`
    const activeCertsMatch = targetContent.match(/const activeCertsArray = [\s\S]*/);
    
    let injectedReturn = returnStr;
    
    if (target.isEdit) {
        injectedReturn = injectedReturn.replace(/>Nueva publicación</g, '>Editar publicación<');
        injectedReturn = injectedReturn.replace(/Publicar producto/g, 'Guardar cambios');
    }
    
    if (target.isAdmin) {
        // Admin edits shouldn't redirect to /dashboard/... they redirect to /admin/...
        injectedReturn = injectedReturn.replace(/\/dashboard\/mis-publicaciones/g, '/admin/publicaciones');
    }

    // We must ensure activeCertsArray is present just before stepsInfo.
    const activeCertsLine = "const activeCertsArray = formData.certifications ? formData.certifications.split(',').map(c => c.trim()).filter(Boolean) : []\n\n  ";
    
    if (activeCertsMatch) {
        targetContent = targetContent.substring(0, activeCertsMatch.index) + activeCertsLine + injectedReturn;
    } else {
        // Fallback to replacing from return (
        const retIndex = targetContent.lastIndexOf('return (');
        if (retIndex !== -1) {
            targetContent = targetContent.substring(0, retIndex) + activeCertsLine + injectedReturn;
        }
    }

    fs.writeFileSync(filePath, targetContent, 'utf8');
    console.log('Updated ' + target.path);
});
