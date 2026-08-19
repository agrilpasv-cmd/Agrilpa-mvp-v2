const fs = require('fs');

function fixProductosPage() {
  const file = 'app/productos/page.tsx';
  let c = fs.readFileSync(file, 'utf8');

  // Fix the mapper
  c = c.replace(/price: up\.price_type === "quote" \|\| !up\.price \|\| up\.price === "Por Cotizar" \? "Por Cotizar" : `\$\{up\.price\}\$ \/ \$\{up\.unit \|\| "kg"\}`/g, 
                'price: up.price_type === "quote" || !up.price || up.price === "Por Cotizar" ? "Por Cotizar" : up.price, currency: up.currency || "$", unit: up.unit || "kg"');
                
  c = c.replace(/minOrder: up\.min_order_quantity \? `\$\{up\.min_order_quantity\} \$\{up\.unit \|\| "kg"\}` : up\.min_order\?\.replace\(\/kilos\/gi, "kg"\)/g,
                'minOrder: up.min_order_quantity ? `MIN. ${up.min_order_quantity} ${up.unit === "unidad" && up.min_order_quantity > 1 ? "unidades" : (up.unit || "kg")}` : up.min_order?.replace(/kilos/gi, "kg")');

  // Fix formatMinOrder
  c = c.replace(/return minOrderStr\.replace\(\/kilos\/gi, "kg"\)\.replace\(\/MIN\\\.\/gi, ""\)\.trim\(\)/g,
                'if (minOrderStr.toUpperCase().startsWith("MIN.")) return minOrderStr; return `MIN. ${minOrderStr.replace(/kilos/gi, "kg").trim()}`');

  // Fix UI
  c = c.replace(/<span className="text-lg font-bold text-foreground">\s*\{product\.price\}\s*<\/span>\s*<span className="text-xs font-medium text-muted-foreground"> \/kg<\/span>/g,
                '<span className="text-lg font-bold text-foreground">{product.currency}{product.price}</span>\n                              <span className="text-xs font-medium text-muted-foreground"> / {product.unit}</span>');

  fs.writeFileSync(file, c);
}

function fixProductoPage() {
  const file = 'app/producto/[slug]/page.tsx';
  let c = fs.readFileSync(file, 'utf8');

  // Fix the related mapper
  c = c.replace(/price: p\.price === "Por Cotizar" \? "Por Cotizar" : `\$\{p\.currency \|\| "US\$"\} \$\{p\.price\}`/g,
                'price: p.price === "Por Cotizar" ? "Por Cotizar" : p.price, currency: p.currency || "$", unit: p.unit || "kg"');

  // Fix UI
  c = c.replace(/<span className="text-lg font-bold text-foreground">\s*\{relProduct\.price\}\s*<\/span>\s*<span className="text-xs font-medium text-muted-foreground"> \/kg<\/span>/g,
                '<span className="text-lg font-bold text-foreground">{relProduct.currency || "$"}{relProduct.price}</span>\n                              <span className="text-xs font-medium text-muted-foreground"> / {relProduct.unit || "kg"}</span>');

  fs.writeFileSync(file, c);
}

try { fixProductosPage(); } catch(e) { console.error("Error in productos:", e); }
try { fixProductoPage(); } catch(e) { console.error("Error in producto:", e); }
