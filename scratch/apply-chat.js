const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../app/producto/[slug]/page.tsx');

// We need to restore the file AGAIN from git because the last run broke it again.
try {
    require('child_process').execSync('git checkout -- "app/producto/[slug]/page.tsx"', { cwd: path.join(__dirname, '..') });
    console.log('Restored from git');
} catch (e) {
    console.error('Git checkout failed', e);
}

let content = fs.readFileSync(pagePath, 'utf8');

// 1. Add import
if (!content.includes('ChatWidget')) {
    content = content.replace(
        "import { ContactDialog } from \"@/components/contact-dialog\"",
        "import { ContactDialog } from \"@/components/contact-dialog\"\nimport { ChatWidget } from \"@/components/chat/chat-widget\""
    );
}

// 2. Update handleContactVendor to open the chat instead of contact dialog
content = content.replace(/setIsContactDialogOpen\(true\)/g, 'setIsChatOpen(true)');

// 3. Find and replace the ChatOverlay with the ChatWidget securely
// The ChatOverlay was:
//       {isChatOpen && (
//         <ChatOverlay
//           vendorName={product.producer}
//           vendorId={product.vendorId}
//           productName={product.name}
//           onClose={() => setIsChatOpen(false)}
//         />
//       )}

const oldOverlayRegex = /\{isChatOpen && \(\s*<ChatOverlay[\s\S]*? \/>\s*\)\}/;

// IMPORTANT: Use double dollar sign $$ so node.js replace() writes a single $
const newOverlay = `<ChatWidget 
        sellerName={product.producer} 
        sellerOnline={true}
        product={{
          id: product.id,
          title: product.name,
          price: product.price ? product.price.split(' ')[0] : 'Por Cotizar',
          currency: product.price && product.price.includes('USD') ? 'USD' : '$$',
          image: product.image || '/placeholder.svg',
          quantity: product.unit || 'kg'
        }} 
        isOpen={isChatOpen} 
        setIsOpen={setIsChatOpen} 
      />`;

if (content.match(oldOverlayRegex)) {
    content = content.replace(oldOverlayRegex, newOverlay);
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log('Successfully injected ChatWidget safely (with escaped dollar sign)!');
} else {
    console.error('Could not find ChatOverlay in the file!');
}
