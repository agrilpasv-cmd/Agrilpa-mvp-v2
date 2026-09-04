const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../app/producto/[slug]/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// I will find the exact bounds to replace.
// From `</main>` to `<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">`

const match = content.match(/<\/main>[\s\S]*?<DialogContent className="sm:max-w-\[600px\] max-h-\[90vh\] overflow-y-auto">/);
if (match) {
    const fixedContent = `</main>

      <ChatWidget 
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
      />

      {/* Quotation Dialog */}
      <Dialog open={isQuotationDialogOpen} onOpenChange={(open) => {
        setIsQuotationDialogOpen(open)
        if (!open) setQuotationSuccess(false)
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">`;

    content = content.replace(match[0], fixedContent);
    
    // Check if I accidentally duplicated the end of the related products block
    // Lines 770-781 in the previous view were from related products. The match will replace everything from the first </main>
    fs.writeFileSync(pagePath, content, 'utf8');
    console.log('Fixed JSX structure');
}
