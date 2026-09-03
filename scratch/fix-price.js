const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../app/dashboard/mis-publicaciones/nueva/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the price logic in handleInputChange
const oldPriceLogic = `    if (name === "price") {
      let cleanVal = value.replace(/[^0-9.]/g, "")
      const parts = cleanVal.split(".")
      if (parts[0].length > 2) parts[0] = parts[0].slice(0, 2)
      if (parts.length > 1) {
        parts[1] = parts[1].slice(0, 2)
        cleanVal = parts.slice(0, 2).join(".")
      } else {
        cleanVal = parts[0]
      }
      processedValue = cleanVal
    }`;

const newPriceLogic = `    if (name === "price") {
      let cleanVal = value.replace(/[^0-9.]/g, "")
      const firstDotIndex = cleanVal.indexOf('.')
      if (firstDotIndex !== -1) {
          cleanVal = cleanVal.substring(0, firstDotIndex + 1) + cleanVal.substring(firstDotIndex + 1).replace(/\\./g, '')
      }
      const parts = cleanVal.split(".")
      
      if (parts.length === 1 && parts[0].length >= 2) {
          parts[0] = parts[0].slice(0, 2)
          cleanVal = parts[0] + "."
      } else if (parts[0].length > 2) {
          parts[0] = parts[0].slice(0, 2)
      }
      if (parts.length > 1) {
          parts[1] = parts[1].slice(0, 2)
          cleanVal = \`\${parts[0]}.\${parts[1]}\`
      }
      processedValue = cleanVal
    }`;

content = content.replace(oldPriceLogic, newPriceLogic);

// Add onBlur to price Input
const oldPriceInput = `<Input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="0.00" className="h-11 font-bold rounded-xl" />`;
const newPriceInput = `<Input type="text" name="price" value={formData.price} onChange={handleInputChange} onBlur={(e) => { const v = e.target.value; if (v) { const parts = v.split('.'); if (parts.length === 1) { setFormData(p => ({...p, price: v + '.00'})); } else if (parts.length === 2 && parts[1] === '') { setFormData(p => ({...p, price: v + '00'})); } else if (parts.length === 2 && parts[1].length === 1) { setFormData(p => ({...p, price: v + '0'})); } } }} placeholder="0.00" className="h-11 font-bold rounded-xl" />`;

content = content.replace(oldPriceInput, newPriceInput);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed price input format logic.');
