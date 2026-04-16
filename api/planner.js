export default async function handler(req, res) {
  const BASE = process.env.AIRTABLE_BASE;
  const TOKEN = process.env.AIRTABLE_TOKEN;
 
  const recordId = req.query.id || '';
  const url = `https://api.airtable.com/v0/${BASE}/Planner${recordId ? '/'+recordId : ''}`;
 
  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'DELETE'
        ? JSON.stringify(req.body)
        : undefined,
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
 
