const fs = require('fs');
const file = 'app/dashboard/mis-publicaciones/nueva/page.tsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/<select\b[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g, (m, name, inner) => {
  const valueAttr = m.match(/value=\{([^\}]+)\}/);
  const val = valueAttr ? valueAttr[1] : '';
  
  let res = `<Select value={${val}} onValueChange={(v) => setFormData(p => ({...p, ${name}: v}))} disabled={isLoading}>\n`;
  res += `  <SelectTrigger className="w-full">\n`;
  res += `    <SelectValue placeholder="Selecciona una opción" />\n`;
  res += `  </SelectTrigger>\n`;
  res += `  <SelectContent>\n`;
  
  // Remove default empty options
  let parsedInner = inner.replace(/<option[^>]*value=""[^>]*>[^<]*<\/option>/g, '');
  
  // Convert basic options
  parsedInner = parsedInner.replace(/<option value="([^"]+)">([^<]+)<\/option>/g, '<SelectItem value="$1">$2</SelectItem>');
  
  // Convert mapped options
  parsedInner = parsedInner.replace(/<option key=\{([^\}]+)\} value=\{([^\}]+)\}>([^<]+)<\/option>/g, '<SelectItem key={$1} value={$2}>$3</SelectItem>');
  
  // Convert optgroups
  parsedInner = parsedInner.replace(/<optgroup label="([^"]+)">([\s\S]*?)<\/optgroup>/g, '<SelectGroup>\n      <SelectLabel>$1</SelectLabel>$2\n    </SelectGroup>');
  
  res += parsedInner;
  res += `  </SelectContent>\n</Select>`;
  
  return res;
});

// Import missing SelectGroup and SelectLabel
if (c.indexOf('SelectGroup') > -1 && c.indexOf('SelectGroup,') === -1) {
    c = c.replace('SelectContent, SelectItem', 'SelectContent, SelectItem, SelectGroup, SelectLabel');
}

fs.writeFileSync(file, c);
