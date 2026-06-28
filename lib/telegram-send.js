function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePhone(value) {
  return value.replace(/\D/g, '').length >= 10;
}

function validateBookingPayload(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Invalid payload' };
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const consent = body.consent === true || body.consent === 'true';

  if (!name || name.length > 120) {
    return { ok: false, error: 'Invalid name' };
  }

  if (!validateEmail(email) || email.length > 160) {
    return { ok: false, error: 'Invalid email' };
  }

  if (!validatePhone(phone) || phone.length > 40) {
    return { ok: false, error: 'Invalid phone' };
  }

  if (!consent) {
    return { ok: false, error: 'Consent required' };
  }

  return {
    ok: true,
    data: { name, email, phone, consent }
  };
}

async function sendBookingToTelegram(payload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    const error = new Error('Telegram bot is not configured');
    error.code = 'NOT_CONFIGURED';
    throw error;
  }

  const timestamp = new Date().toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    dateStyle: 'short',
    timeStyle: 'short'
  });

  const text = [
    '🆕 <b>Заявка на диагностику</b>',
    '',
    `<b>Имя:</b> ${escapeHtml(payload.name)}`,
    `<b>E-mail:</b> ${escapeHtml(payload.email)}`,
    `<b>Телефон:</b> ${escapeHtml(payload.phone)}`,
    `<b>Согласие на обработку ПД:</b> да`,
    '',
    `🕐 ${timestamp} (МСК)`
  ].join('\n');

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    const error = new Error('Telegram API error');
    error.code = 'TELEGRAM_ERROR';
    error.details = data;
    throw error;
  }

  return data;
}

function getCorsHeaders(origin) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
  const headerOrigin = allowedOrigin === '*' ? '*' : origin || allowedOrigin;

  return {
    'Access-Control-Allow-Origin': headerOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

module.exports = {
  validateBookingPayload,
  sendBookingToTelegram,
  getCorsHeaders
};
