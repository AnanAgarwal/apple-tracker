import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { db } from './database.js';
import { trackerEngine } from './services/trackerEngine.js';
import { sendTelegramAlert, buildRestockAlertMessage } from './services/telegramService.js';
import { createSubscriptionOrder, processSubscriptionPayment, generateInvoiceHTML } from './services/razorpayService.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'apple_track_secret_key_india_999';

app.use(cors());
app.use(express.json());

// Start background tracker engine
trackerEngine.start();

// JWT Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// Admin Middleware
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin privileges required' });
  }
}

// --- PUBLIC ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    engineRunning: trackerEngine.isRunning,
    lastCheck: trackerEngine.lastCheckTimestamp
  });
});

// Public Live Status Page Endpoint
app.get('/api/public/status', (req, res) => {
  const stores = db.data.stores;
  const devices = db.data.devices;
  const state = db.data.availabilityState;

  const publicData = stores.map(store => {
    const storeDevices = devices.map(dev => {
      const key = `${store.id}:${dev.sku}`;
      const itemState = state[key] || { status: 'unavailable', lastUpdated: new Date().toISOString() };
      return {
        sku: dev.sku,
        model: dev.model,
        storage: dev.storage,
        color: dev.color,
        status: itemState.status,
        lastUpdated: itemState.lastUpdated
      };
    });

    const availableCount = storeDevices.filter(d => d.status === 'available').length;

    return {
      id: store.id,
      name: store.name,
      city: store.city,
      location: store.location,
      availableCount,
      totalMonitored: storeDevices.length,
      devices: storeDevices
    };
  });

  res.json({
    timestamp: new Date().toISOString(),
    stores: publicData,
    pricing: '₹999/month for Instant Telegram Restock Alerts'
  });
});

// Auth Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  const existing = db.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Account already exists with this email' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    email: email.toLowerCase(),
    name,
    password, // Plain text for local demo simplicity
    role: 'user',
    telegramChatId: '',
    subscriptionStatus: 'active', // 7-day initial trial / active
    subscriptionExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  };

  db.data.users.push(newUser);

  // Initialize tracker defaults
  db.data.trackers.push({
    id: `trk_${Date.now()}`,
    userId: newUser.id,
    selectedStores: ['R756', 'R758'],
    selectedSkus: ['MG6K4HN/A', 'MG6J4HN/A', 'MG6L4HN/A', 'MG6N4HN/A', 'MG6M4HN/A'],
    active: true,
    updatedAt: new Date().toISOString()
  });

  db.save();

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: newUser });
});

// Auth Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  const user = db.data.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

// Auth Get Me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// --- USER DASHBOARD ROUTES ---

// Get User Tracker Details
app.get('/api/trackers', authenticateToken, (req, res) => {
  const tracker = db.data.trackers.find(t => t.userId === req.user.id);
  const user = db.data.users.find(u => u.id === req.user.id);
  const userNotifications = db.data.notifications.filter(n => n.userId === req.user.id);

  res.json({
    tracker: tracker || { selectedStores: ['R756'], selectedSkus: ['MG6K4HN/A'] },
    allStores: db.data.stores,
    allDevices: db.data.devices,
    telegramChatId: user ? user.telegramChatId : '',
    subscription: {
      status: user ? user.subscriptionStatus : 'inactive',
      expiresAt: user ? user.subscriptionExpiresAt : null
    },
    notifications: userNotifications,
    lastChecked: trackerEngine.lastCheckTimestamp
  });
});

// Save Device & Store Preferences
app.post('/api/trackers/update', authenticateToken, (req, res) => {
  const { selectedStores, selectedSkus } = req.body;

  let tracker = db.data.trackers.find(t => t.userId === req.user.id);
  if (tracker) {
    tracker.selectedStores = selectedStores || tracker.selectedStores;
    tracker.selectedSkus = selectedSkus || tracker.selectedSkus;
    tracker.updatedAt = new Date().toISOString();
  } else {
    tracker = {
      id: `trk_${Date.now()}`,
      userId: req.user.id,
      selectedStores: selectedStores || ['R756'],
      selectedSkus: selectedSkus || ['MG6K4HN/A'],
      active: true,
      updatedAt: new Date().toISOString()
    };
    db.data.trackers.push(tracker);
  }

  db.save();
  res.json({ success: true, tracker });
});

// Save Telegram Chat ID
app.post('/api/telegram/update', authenticateToken, (req, res) => {
  const { chatId } = req.body;
  const user = db.data.users.find(u => u.id === req.user.id);

  if (!user) return res.status(404).json({ error: 'User not found' });

  user.telegramChatId = (chatId || '').trim();
  db.save();

  res.json({ success: true, telegramChatId: user.telegramChatId });
});

// Trigger Test Telegram Message
app.post('/api/telegram/test', authenticateToken, async (req, res) => {
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user || !user.telegramChatId) {
    return res.status(400).json({ error: 'Please enter and save your Telegram Chat ID first.' });
  }

  const testMsg = buildRestockAlertMessage('Apple Saket (Delhi)', 'iPhone 17 256GB White', 'MG6K4HN/A', 'R756');
  const result = await sendTelegramAlert(user.telegramChatId, testMsg);

  if (result.success) {
    // Log test notification
    db.data.notifications.unshift({
      id: `notif_test_${Date.now()}`,
      userId: user.id,
      storeName: 'Apple Saket (Delhi)',
      deviceName: 'iPhone 17 256GB White (TEST)',
      sku: 'MG6K4HN/A',
      message: testMsg,
      status: 'delivered',
      timestamp: new Date().toISOString()
    });
    db.save();

    res.json({ success: true, message: 'Test notification sent to Telegram!' });
  } else {
    res.status(500).json({ error: result.error || 'Failed to dispatch test notification' });
  }
});

// --- PAYMENTS & SUBSCRIPTION ---

// Create Razorpay Order
app.post('/api/payments/create-subscription', authenticateToken, (req, res) => {
  const user = db.data.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const order = createSubscriptionOrder(user.id, user.email, user.name);
  res.json(order);
});

// Verify & Process Payment
app.post('/api/payments/verify', authenticateToken, (req, res) => {
  const { paymentId, subscriptionId } = req.body;
  const user = db.data.users.find(u => u.id === req.user.id);

  if (!user) return res.status(404).json({ error: 'User not found' });

  // Activate subscription for 30 days
  user.subscriptionStatus = 'active';
  user.subscriptionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Create payment record
  const paymentRecord = processSubscriptionPayment(user.id, paymentId, subscriptionId);
  db.data.payments.unshift(paymentRecord);
  db.save();

  res.json({
    success: true,
    user,
    payment: paymentRecord
  });
});

// Payment History
app.get('/api/payments/history', authenticateToken, (req, res) => {
  const payments = db.data.payments.filter(p => p.userId === req.user.id);
  res.json({ payments });
});

// Download Invoice HTML
app.get('/api/payments/invoice/:id', authenticateToken, (req, res) => {
  const payment = db.data.payments.find(p => p.id === req.params.id && p.userId === req.user.id);
  const user = db.data.users.find(u => u.id === req.user.id);

  if (!payment || !user) {
    return res.status(404).send('Invoice not found');
  }

  const html = generateInvoiceHTML(payment, user);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// --- ADMIN ROUTES ---

// Get SaaS Admin Metrics
app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  const totalUsers = db.data.users.length;
  const activeSubscribers = db.data.users.filter(u => u.subscriptionStatus === 'active').length;
  const mrr = activeSubscribers * 999;
  const totalAlerts = db.data.notifications.length;
  const conversionRate = totalUsers > 0 ? ((activeSubscribers / totalUsers) * 100).toFixed(1) : 0;

  res.json({
    mrr,
    totalUsers,
    activeSubscribers,
    totalAlerts,
    conversionRate: `${conversionRate}%`,
    engineRunning: trackerEngine.isRunning,
    lastCheck: trackerEngine.lastCheckTimestamp,
    engineStats: trackerEngine.stats
  });
});

// Admin Users List
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  res.json({ users: db.data.users });
});

// Admin Toggle User Status / Manual Subscription Extension
app.post('/api/admin/toggle-user', authenticateToken, requireAdmin, (req, res) => {
  const { userId, status, extendDays } = req.body;
  const targetUser = db.data.users.find(u => u.id === userId);

  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  if (status) {
    targetUser.subscriptionStatus = status;
  }
  if (extendDays) {
    const currentExpiry = new Date(targetUser.subscriptionExpiresAt > new Date().toISOString() ? targetUser.subscriptionExpiresAt : Date.now());
    currentExpiry.setDate(currentExpiry.getDate() + Number(extendDays));
    targetUser.subscriptionExpiresAt = currentExpiry.toISOString();
    targetUser.subscriptionStatus = 'active';
  }

  db.save();
  res.json({ success: true, user: targetUser });
});

// Admin Trigger Simulated Restock State Change (Unavailable -> Available)
app.post('/api/admin/simulate-restock', authenticateToken, requireAdmin, (req, res) => {
  const { storeId, sku, status } = req.body;
  
  const result = trackerEngine.toggleStockState(storeId || 'R756', sku || 'MG6K4HN/A', status);
  res.json({
    success: true,
    result,
    message: `State toggled for ${result.key}: ${result.previousStatus} -> ${result.newStatus}`
  });
});

// Admin Global Notification Logs
app.get('/api/admin/notifications', authenticateToken, requireAdmin, (req, res) => {
  res.json({ notifications: db.data.notifications });
});

// Start Express Listener
app.listen(PORT, () => {
  console.log(`⚡ Apple Store Tracker SaaS server running on port ${PORT}`);
});
