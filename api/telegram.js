const {
  validateBookingPayload,
  sendBookingToTelegram,
  getCorsHeaders
} = require('../lib/telegram-send');

module.exports = async (req, res) => {
  const corsHeaders = getCorsHeaders(req.headers.origin);

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const validation = validateBookingPayload(req.body);

    if (!validation.ok) {
      return res.status(400).json({ ok: false, error: validation.error });
    }

    await sendBookingToTelegram(validation.data);
    return res.status(200).json({ ok: true });
  } catch (error) {
    if (error.code === 'NOT_CONFIGURED') {
      return res.status(500).json({ ok: false, error: 'Bot not configured' });
    }

    console.error('Telegram send error:', error.details || error.message);
    return res.status(502).json({ ok: false, error: 'Failed to send message' });
  }
};
