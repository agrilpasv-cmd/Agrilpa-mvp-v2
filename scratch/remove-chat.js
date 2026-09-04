const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/producto/[slug]/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<ChatWidget\s+sellerName=\{product\.producer\}[\s\S]*?\/>/;
content = content.replace(regex, '{/* Global Chat Wrapper renders the chat widget */}');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Replaced ChatWidget in page.tsx');
