const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/dashboard/mis-publicaciones/nueva/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The position="popper" and a max-height is usually best for Shadcn Selects that contain many items.
// It forces them to open downwards (or where there's room) and limits the height.
content = content.replace(/<SelectContent>/g, '<SelectContent position="popper" className="max-h-60">');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed SelectContent tags');
