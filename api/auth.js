/* ============================================================================
 * TikTok Minis — Silent Login: code -> open_id takasi
 * ----------------------------------------------------------------------------
 * Konum : articgamestudio.com reposunda  api/auth.js
 * Adres : https://articgamestudio.com/api/auth
 *
 * Vercel /api klasorunu otomatik taniyor; ekstra ayar dosyasi GEREKMIYOR.
 *
 * !! CLIENT SECRET BURAYA YAZILMAZ !!
 * Vercel panelinde Settings > Environment Variables:
 *     TIKTOK_CLIENT_KEY     = mg4v9mglusnpw7a5
 *     TIKTOK_CLIENT_SECRET  = (portaldan aldigin YENI secret)
 * Ekledikten sonra REDEPLOY etmen gerekir, yoksa degiskenler gorunmez.
 *
 * Veritabani yok. [DOC] "Sadece open_id'yi sakla; baska API cagirmayacaksan
 * token suresi ve yenileme mantigini gormezden gelebilirsin."
 * IAP'ye gecince burasi genisleyecek (order/create + webhook + DB).
 * ========================================================================== */

const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';

module.exports = async function handler(req, res) {
  // --- CORS ---------------------------------------------------------------
  // Oyun TikTok webview'i icinde calisiyor; origin ongorulemez, bu yuzden
  // acik birakiyoruz. Guvenli, cunku endpoint yalnizca kullaniciya bagli ve
  // 5 dakika omurlu bir code'u takas ediyor; secret disari cikmiyor.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  // --- Girdi --------------------------------------------------------------
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const code = body && body.code;
  if (!code || typeof code !== 'string' || code.length > 512) {
    return res.status(400).json({ error: 'missing_code' });
  }

  const clientKey    = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  if (!clientKey || !clientSecret) {
    console.error('[auth] ortam degiskenleri eksik');
    return res.status(500).json({ error: 'server_misconfigured' });
  }

  // --- TikTok ile takas ---------------------------------------------------
  // [DOC] Content-Type application/x-www-form-urlencoded OLMAK ZORUNDA.
  // [DOC] code tek kullanimlik ve 5 dakika sonra gecersiz.
  const form = new URLSearchParams({
    client_key:    clientKey,
    client_secret: clientSecret,
    code:          code,
    grant_type:    'authorization_code'
  });

  try {
    const r = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache'
      },
      body: form.toString()
    });

    const data = await r.json();

    if (!r.ok || data.error) {
      // Hata detayini LOGA yaz, istemciye SIZDIRMA.
      console.error('[auth] takas basarisiz:', data.error, data.error_description, data.log_id);
      return res.status(401).json({ error: 'exchange_failed' });
    }

    // Sadece open_id doner. access_token/refresh_token istemciye ASLA gitmez.
    // IAP'ye gecince bunlari burada DB'ye yazacagiz.
    return res.status(200).json({ open_id: data.open_id });

  } catch (err) {
    console.error('[auth] beklenmeyen hata:', err && err.message);
    return res.status(502).json({ error: 'upstream_error' });
  }
};

