import http from 'http';

http.get('http://localhost:3009/api/public/geo-info', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'DATA:', JSON.parse(data)));
}).on('error', (err) => console.error('Error:', err.message));
