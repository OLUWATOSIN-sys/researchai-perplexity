import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

    if (!PERPLEXITY_API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    const response = await axios.post('https://api.perplexity.ai/chat/completions', {
      model: "sonar-medium-online",
      messages: [{ role: "user", content: message }]
    }, {
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json({
      content: response.data.choices[0].message.content
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'API request failed',
      details: error.message 
    });
  }
}