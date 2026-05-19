const fetch = require('node-fetch');
async function test() {
  const res = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '1234', password: '4321' })
  });
  console.log('Status:', res.status);
  console.log(await res.text());
}
test();
