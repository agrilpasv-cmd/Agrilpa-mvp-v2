const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../app/producto/[slug]/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

if (!content.includes('import { ChatWidget }')) {
    // Let's just put it after 'use client' or another known import.
    // E.g. `import React, { useState, useEffect, useMemo } from 'react'`
    const targetImport = "import React, { useState, useEffect, useMemo } from 'react'";
    if (content.includes(targetImport)) {
        content = content.replace(targetImport, targetImport + "\nimport { ChatWidget } from \"@/components/chat/chat-widget\"");
    } else {
        // Fallback: Just put it right after the first line ("use client")
        content = content.replace(/"use client"\n/, "\"use client\"\n\nimport { ChatWidget } from \"@/components/chat/chat-widget\"\n");
    }
    
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log('Import added successfully');
} else {
    console.log('Import already exists');
}
