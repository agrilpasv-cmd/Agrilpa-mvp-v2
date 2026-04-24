const dns = require('dns');
const https = require('https');
const readline = require('readline');
const fs = require('fs');

// Intentar leer la llave de .env.local
let anonKey = '';
try {
  const envContent = fs.readFileSync('.env.local', 'utf-8');
  const match = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/);
  if (match) anonKey = match[1].trim();
} catch (e) {
  console.error("No se pudo leer .env.local para obtener la anon key.");
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n=== PRUEBA DE CREDENCIALES SUPABASE ===');
console.log('Este script evadirá los problemas de tu router local.\n');

rl.question('Ingresa tu correo: ', (email) => {
  rl.question('Ingresa tu contraseña: ', (password) => {
    rl.close();
    
    console.log('\nConectando a Supabase usando DNS de Google...');
    
    // Forzar DNS de Google para evitar el fallo del router local (Nexxt_9BBC5A.Home)
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    
    dns.resolve4('szazlttrgsgcpwqatpwx.supabase.co', (err, addresses) => {
      if (err) {
        console.error('✘ Error resolviendo DNS:', err.message);
        return;
      }
      
      const payload = JSON.stringify({ email: email.trim(), password: password.trim() });
      
      const req = https.request({
        hostname: addresses[0],
        port: 443,
        path: '/auth/v1/token?grant_type=password',
        method: 'POST',
        headers: {
          'Host': 'szazlttrgsgcpwqatpwx.supabase.co', // Host original
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('\n--- Resultado desde Supabase ---');
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ ¡ÉXITO! Las credenciales EXISTEN Y SON CORRECTAS en Supabase.');
            console.log('   Si en la página recibes error, el problema 100% es de conectividad (DNS local o configuración en Hostinger).');
          } else {
            console.log('❌ FALLO: Supabase rechazó estas credenciales.');
            try {
              const json = JSON.parse(data);
              console.log('   Motivo exacto dado por la base de datos:', json.error_description || json.msg || data);
            } catch(e) {
              console.log('   Respuesta del servidor:', data);
            }
          }
          console.log('--------------------------------\n');
        });
      });
      
      req.on('error', e => console.error('✘ Error de conexión:', e.message));
      req.write(payload);
      req.end();
    });
  });
});
