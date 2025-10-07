const { chromium } = require('playwright');
const fetch = require('node-fetch');

(async () => {
  const url = 'https://www.instagram.com/setupspawn/';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });

  const posts = await page.$$eval('article a', anchors => {
    const seen = new Set();
    const out = [];
    for (const a of anchors) {
      const href = a.getAttribute('href');
      if (!href || !href.startsWith('/p/')) continue;
      if (seen.has(href)) continue;
      seen.add(href);
      const img = a.querySelector('img');
      out.push({
        shortcode: href.split('/p/')[1].replace('/', ''),
        postUrl: 'https://www.instagram.com' + href,
        caption: img ? img.getAttribute('alt') : null,
        image: img ? img.src : null
      });
    }
    return out;
  });

  await browser.close();

  if (!posts.length) {
    console.log('No posts found or blocked.');
    return;
  }

  // Send data to n8n webhook
  const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
  if (WEBHOOK_URL) {
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: JSON.stringify({ posts }),
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Sent to webhook');
    } catch (e) {
      console.error('Webhook failed', e.message);
    }
  } else {
    console.log('No webhook URL provided.');
  }
})();

