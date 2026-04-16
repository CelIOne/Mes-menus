export default async function handler(req, res) {
  const { method, body } = req;
  const BASE = process.env.AIRTABLE_BASE;
  const TOKEN = process.env.AIRTABLE_TOKEN;
  const url = `https://api.airtable.com/v0/${BASE}/Recipes`;

  const response = await fetch(url, {
    method: method,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: method !== 'GET' ? JSON.stringify(body) : undefined
  });

  const data = await response.json();
  res.status(200).json(data);
}