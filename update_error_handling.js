const fs = require('fs');

const file = 'app/api/products/create-user-product/route.ts';
let c = fs.readFileSync(file, 'utf8');

const missingUnitErrorStr = `      const isMissingUnit = error.message && 
        (error.message.includes("column") && (error.message.includes("unit") || error.message.includes("price_type") || error.message.includes("min_order_quantity")) && error.message.includes("schema cache"))
      
      if (isMissingUnit) {
        return NextResponse.json({
          error: "Faltan las columnas de unidades (unit, price_type, min_order_quantity). Ejecuta el script SQL en Supabase.",
          sqlToRun: \`
-- Ejecuta esto en el SQL Editor de Supabase:
ALTER TABLE user_products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'kg';
ALTER TABLE user_products ADD COLUMN IF NOT EXISTS price_type TEXT DEFAULT 'fixed';
ALTER TABLE user_products ADD COLUMN IF NOT EXISTS min_order_quantity NUMERIC;

-- Notifica a PostgREST del cambio
NOTIFY pgrst, 'reload schema';
\`
        }, { status: 500 })
      }

`;

c = c.replace(/if \(isMissingCurrency\) \{/, missingUnitErrorStr + '      if (isMissingCurrency) {');

fs.writeFileSync(file, c);
