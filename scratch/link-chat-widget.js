const fs = require('fs');
const path = require('path');

// 1. Update ChatWidget
const widgetPath = path.join(__dirname, '../components/chat/chat-widget.tsx');
let widgetContent = fs.readFileSync(widgetPath, 'utf8');

// Replace internal state with props
widgetContent = widgetContent.replace(
  `interface ChatWidgetProps {
  sellerName: string;
  sellerOnline?: boolean;
  product: ConversationProduct;
}`,
  `interface ChatWidgetProps {
  sellerName: string;
  sellerOnline?: boolean;
  product: ConversationProduct;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}`
);

widgetContent = widgetContent.replace(
  `export function ChatWidget({ sellerName, sellerOnline = true, product }: ChatWidgetProps) {\n  const [isOpen, setIsOpen] = useState(false)`,
  `export function ChatWidget({ sellerName, sellerOnline = true, product, isOpen, setIsOpen }: ChatWidgetProps) {`
);

fs.writeFileSync(widgetPath, widgetContent, 'utf8');
console.log('Updated ChatWidget');


// 2. Update Product Page
const pagePath = path.join(__dirname, '../app/producto/[slug]/page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Update handleContactVendor
pageContent = pageContent.replace(/setIsContactDialogOpen\(true\)/g, 'setIsChatOpen(true)');

// Add import if not present
if (!pageContent.includes('ChatWidget')) {
    pageContent = pageContent.replace(
        "import { ContactDialog } from \"@/components/contact-dialog\"",
        "import { ContactDialog } from \"@/components/contact-dialog\"\nimport { ChatWidget } from \"@/components/chat/chat-widget\""
    );
}

// Replace ChatOverlay with ChatWidget
const oldOverlay = `{isChatOpen && (
        <ChatOverlay
          vendorName={product.producer}
          vendorId={product.vendorId}
          productName={product.name}
          onClose={() => setIsChatOpen(false)}
        />
      )}`;

const newOverlay = `<ChatWidget 
        sellerName={product.producer} 
        sellerOnline={true}
        product={{
          id: product.id,
          title: product.name,
          price: product.price ? product.price.split(' ')[0] : 'Por Cotizar',
          currency: product.price && product.price.includes('USD') ? 'USD' : '$',
          image: product.image || '/placeholder.svg',
          quantity: product.unit || 'kg'
        }} 
        isOpen={isChatOpen} 
        setIsOpen={setIsChatOpen} 
      />`;

// If ChatOverlay exists, replace it. Otherwise, add before Quotation Dialog
if (pageContent.includes('ChatOverlay')) {
    pageContent = pageContent.replace(/\{isChatOpen && \(\s*<ChatOverlay[\s\S]*? \/>\s*\)\}/, newOverlay);
} else {
    pageContent = pageContent.replace('{/* Quotation Dialog */}', `${newOverlay}\n\n      {/* Quotation Dialog */}`);
}

fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('Updated Product Page');
