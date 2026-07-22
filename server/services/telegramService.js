import fetch from 'node-fetch';

const SYSTEM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8428862886:AAF0yZfs2z1b8UHkximmvobIbN5uWo67Xk8';

export async function sendTelegramAlert(chatId, message) {
  if (!chatId) {
    console.log('⚠️ Skipping Telegram dispatch: No Chat ID provided');
    return { success: false, error: 'No Chat ID provided' };
  }

  const url = `https://api.telegram.org/bot${SYSTEM_BOT_TOKEN}/sendMessage`;
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('Telegram Bot Error Response:', data);
      return { success: false, error: data.description || 'Failed to send message' };
    }

    return { success: true, messageId: data.result.message_id };
  } catch (error) {
    console.error('Telegram dispatch error:', error);
    return { success: false, error: error.message };
  }
}

export function buildRestockAlertMessage(storeName, deviceName, sku, storeId) {
  const storeUrl = `https://www.apple.com/in/shop/buy-iphone/iphone-17`;
  return `🚨 <b>APPLE PICKUP AVAILABLE ALERT!</b> 🚨

📱 <b>Device:</b> ${deviceName}
🏪 <b>Store:</b> ${storeName} (${storeId})
⏱️ <b>Status:</b> Pickup Available NOW!

⚡ <b>Action:</b> Open Apple Store immediately to reserve your unit before stock runs out:
👉 <a href="${storeUrl}">Reserve on Apple Store India</a>

--------------------------
<i>Powered by Apple Store Tracker SaaS India</i>`;
}
