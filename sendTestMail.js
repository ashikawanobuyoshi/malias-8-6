import fetch from 'node-fetch'; // Node 20 以降なら fetch は標準でも可

const apiUrl = 'http://localhost:3000/api/send-email';

const body = {
  to: "studiomalia1@gmail.com",
  subject: "テストメール",
  html: "<p>これはテスト本文です。</p>"
};

const res = await fetch(apiUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body)
});

const data = await res.json();
console.log(data);
