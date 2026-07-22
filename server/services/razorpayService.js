// Razorpay Subscription & Payment Service

export function createSubscriptionOrder(userId, userEmail, userName) {
  const subscriptionId = `sub_${Math.random().toString(36).substring(2, 11)}`;
  const orderId = `order_${Math.random().toString(36).substring(2, 11)}`;

  return {
    subscriptionId,
    orderId,
    amount: 99900, // ₹999 in paise
    currency: 'INR',
    planName: 'Apple Stock Tracker Pro Monthly',
    customerName: userName,
    customerEmail: userEmail,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_AppleTrackIndia999'
  };
}

export function processSubscriptionPayment(userId, paymentId, subscriptionId) {
  const paymentRecord = {
    id: paymentId || `pay_${Math.random().toString(36).substring(2, 11)}`,
    userId,
    amount: 999,
    currency: 'INR',
    status: 'completed',
    paymentMethod: 'UPI / Razorpay',
    razorpaySubscriptionId: subscriptionId || `sub_${Math.random().toString(36).substring(2, 11)}`,
    createdAt: new Date().toISOString()
  };

  return paymentRecord;
}

export function generateInvoiceHTML(payment, user) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice #${payment.id}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f7; color: #1d1d1f; padding: 40px; }
    .invoice-card { background: white; border-radius: 18px; padding: 40px; max-width: 600px; margin: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e5e7; padding-bottom: 20px; }
    .title { font-size: 24px; font-weight: 700; color: #0071e3; }
    .meta { font-size: 14px; color: #86868b; margin-top: 15px; }
    .table { width: 100%; margin-top: 30px; border-collapse: collapse; }
    .table th { text-align: left; padding: 12px; border-bottom: 1px solid #e5e5e7; color: #86868b; }
    .table td { padding: 12px; border-bottom: 1px solid #f2f2f4; }
    .total { text-align: right; font-size: 20px; font-weight: 700; margin-top: 20px; color: #1d1d1f; }
    .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #86868b; }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div class="title">Apple Track SaaS India</div>
      <div><strong>OFFICIAL INVOICE</strong></div>
    </div>
    <div class="meta">
      <p><strong>Invoice ID:</strong> ${payment.id}</p>
      <p><strong>Billed To:</strong> ${user.name} (${user.email})</p>
      <p><strong>Date:</strong> ${new Date(payment.createdAt).toLocaleDateString('en-IN')}</p>
      <p><strong>Status:</strong> <span style="color:#34c759; font-weight:600;">PAID (₹999/mo)</span></p>
    </div>
    <table class="table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Apple Store Restock Alert SaaS Subscription (Monthly)</td>
          <td>1</td>
          <td>₹999.00</td>
        </tr>
      </tbody>
    </table>
    <div class="total">Total Paid: ₹999.00 INR</div>
    <div class="footer">
      <p>Thank you for subscribing to Apple Store Pickup Tracker SaaS India.</p>
      <p>Questions? Contact support@appletrack.in</p>
    </div>
  </div>
</body>
</html>`;
}
