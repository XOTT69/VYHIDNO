// Єдиний serverless proxy — ВСІ моделі (Claude/GPT/DeepSeek) йдуть через
// один LUMI gateway, OpenAI-сумісний формат. Ключ живе тільки тут, на сервері.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // --- Захист паролем, щоб сторонні не юзали твій LUMI-ключ ---
  const secret = req.headers['x-app-secret'];
  if (!process.env.APP_SECRET || secret !== process.env.APP_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { model, system, messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages[] required' });
  }
  if (!model) {
    return res.status(400).json({ error: 'model required' });
  }

  const apiKey = process.env.LUMI_API_KEY;
  const baseUrl = process.env.LUMI_BASE_URL || 'https://lumi.monobank.com.ua';

  if (!apiKey) {
    return res.status(500).json({ error: 'LUMI_API_KEY не налаштований' });
  }

  try {
    const r = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model, // TODO: звір точний слаг у LUMI → LLM Маркетплейс, якщо впаде 404
        messages: [{ role: 'system', content: system }, ...messages],
        temperature: 0.7
      })
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(r.status).json({ error: errText });
    }

    const data = await r.json();
    const reply = data.choices?.[0]?.message?.content ?? '(порожня відповідь)';
    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error, try again' });
  }
}
