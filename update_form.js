const fs = require('fs');
const file = 'app/dashboard/mis-publicaciones/nueva/page.tsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Capacidad de Abastecimiento
c = c.replace(/<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">[\s\S]*?<\/Select>\s*<\/div>\s*<\/div>/, `<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex gap-2 relative">
                  <Input
                    id="supplyCapacity"
                    type="number"
                    name="supplyCapacity"
                    value={formData.supplyCapacity}
                    onChange={handleInputChange}
                    placeholder="Ej: 50"
                    min="0"
                    disabled={isLoading}
                    className="w-full pr-12"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm flex items-center justify-center">
                    {formData.saleMethod === "fcl" ? "FCL" : (formData.unit || "kg")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm font-medium px-1">/</span>
                  <Select value={formData.supplyCapacityPeriod} onValueChange={(v) => setFormData(p => ({...p, supplyCapacityPeriod: v}))} disabled={isLoading}>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Selecciona una opción" />
  </SelectTrigger>
  <SelectContent>
                    <SelectItem value="mes">mes</SelectItem>
                    <SelectItem value="semana">semana</SelectItem>
                    <SelectItem value="temporada">temporada</SelectItem>
                    <SelectItem value="año">año</SelectItem>
                    </SelectContent>
</Select>
                </div>
              </div>`);

// 2. Cantidad Disponible (remove exact {formData.unit} and replace)
c = c.replace(/<div className="absolute right-3 top-1\/2 -translate-y-1\/2 text-muted-foreground text-sm flex items-center justify-center">\s*\{formData\.unit\}\s*<\/div>/g, `<div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm flex items-center justify-center">
                    {formData.saleMethod === "fcl" ? "FCL" : (formData.unit || "kg")}
                  </div>`);

// Pedido Minimo (already has a similar check, let's normalize it)
c = c.replace(/<span className="absolute right-3 top-1\/2 -translate-y-1\/2 text-muted-foreground text-sm">\s*\{formData\.saleMethod === "fcl" \? "cont\." : \(formData\.unit \|\| "kg"\)\}\s*<\/span>/, `<span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm flex items-center justify-center">
                    {formData.saleMethod === "fcl" ? "FCL" : (formData.unit || "kg")}
                  </span>`);

// 3. Incoterm options
c = c.replace(/<SelectItem value="A definir con el comprador">A definir con el comprador<\/SelectItem>[\s\S]*?<SelectItem value="CIP">CIP – Transporte y seguro pagados<\/SelectItem>/, `<SelectItem value="A definir con el comprador">A definir con el comprador</SelectItem>
                <SelectItem value="EXW">EXW – En finca / bodega del vendedor</SelectItem>
                <SelectItem value="FOB">FOB – Libre a bordo (Puerto de origen)</SelectItem>
                <SelectItem value="CIF">CIF – Costo, seguro y flete (Puerto destino)</SelectItem>
                <SelectItem value="DDP">DDP – Entregado en destino final</SelectItem>`);

fs.writeFileSync(file, c);
