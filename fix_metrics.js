const fs = require('fs');

function fixHero() {
  const file = 'components/product-hero.tsx';
  let c = fs.readFileSync(file, 'utf8');

  // Remove the four grey text snippets
  c = c.replace(/\{\s*product\.price !== "Por Cotizar" && \(\s*<p className="text-\[10px\] text-slate-400 mt-1">por kg<\/p>\s*\)\s*\}/g, '');
  
  c = c.replace(/<p className="text-\[10px\] text-slate-400 mt-1">\s*\{\s*product\.shippingUnitType === "FCL" \? "FCL" : product\.shippingUnitType === "LCL" \? "LCL" : "kg"\s*\}\s*<\/p>/g, '');
  
  c = c.replace(/<p className="text-\[10px\] text-slate-400 mt-1">tipo de empaque<\/p>/g, '');
  
  c = c.replace(/<p className="text-\[10px\] text-slate-400 mt-1">kg por embalaje<\/p>/g, '');

  fs.writeFileSync(file, c);
}

function fixPage() {
  const file = 'app/producto/[slug]/page.tsx';
  let c = fs.readFileSync(file, 'utf8');

  // Fix price format
  c = c.replace(/price: data\.product\.price_type === "quote" \|\| !data\.product\.price \|\| data\.product\.price === "Por Cotizar" \? "Por Cotizar" : `\$\{data\.product\.price\}\$ \/ \$\{data\.product\.unit \|\| "kg"\}`/g, 
                'price: data.product.price_type === "quote" || !data.product.price || data.product.price === "Por Cotizar" ? "Por Cotizar" : `${data.product.currency || "$"}${data.product.price} / ${data.product.unit || "kg"}`');

  // Fix min order
  const newMinOrder = `minOrder: (() => {
                const u = data.product.unit || "kg";
                const mq = data.product.min_order_quantity;
                if (mq) {
                  return \`MIN. \${mq} \${u === 'unidad' && mq > 1 ? 'unidades' : u}\`;
                }
                return data.product.min_order?.replace(/kilos/gi, "kg");
              })()`;
              
  c = c.replace(/minOrder: data\.product\.min_order_quantity \? `MIN\. \$\{data\.product\.min_order_quantity\} \$\{data\.product\.unit \|\| "kg"\}` : data\.product\.min_order\?\.replace\(\/kilos\/gi, "kg"\)/g, newMinOrder);

  fs.writeFileSync(file, c);
}

try { fixHero(); } catch(e) { console.error("Error hero:", e); }
try { fixPage(); } catch(e) { console.error("Error page:", e); }
