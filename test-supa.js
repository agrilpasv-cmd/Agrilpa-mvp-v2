const dns = require('dns');
const https = require('https');

dns.setServers(['8.8.8.8', '1.1.1.1']);

dns.resolve4('szazlttrgsgcpwqatpwx.supabase.co', (err, addresses) => {
  if (err) {
    console.error('DNS Resolve Error:', err.message);
    return;
  }
  const address = addresses[0];
  console.log('Resolves to IP:', address);

  const req = https.get(`https://${address}/auth/v1/health`, {
    headers: {
      'Host': 'szazlttrgsgcpwqatpwx.supabase.co'
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Status Code:', res.statusCode);
      console.log('Response:', data);
    });
  });

  req.on('error', e => console.error('Request Error:', e.message));
});
