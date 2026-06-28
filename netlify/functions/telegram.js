const {
  validateBookingPayload,
  sendBookingToTelegram,
  getCorsHeaders
} = require('../lib/telegram-send');

exports.handler = async (event) => {
  const corsHeaders = getCorsHeaders(event.headers.origin || event.headers.Origin);

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Method not allowed' })
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const validation = validateBookingPayload(body);

    if (!validation.ok) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: false, error: validation.error })
      };
    }

    await sendBookingToTelegram(validation.data);

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  } catch (error) {
    const statusCode = error.code === 'NOT_CONFIGURED' ? 500 : 502;
    console.error('Telegram send error:', error.details || error.message);

    return {
      statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ok: false,
        error: error.code === 'NOT_CONFIGURED' ? 'Bot not configured' : 'Failed to send message'
      })
    };
  }
};
