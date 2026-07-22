// Embedded in-memory / JSON file database for seamless deployment and local execution
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data_store.json');

// Initial seed data
const initialData = {
  users: [
    {
      id: 'usr_admin',
      email: 'admin@appletrack.in',
      name: 'Admin Manager',
      password: 'admin', // Demo password
      role: 'admin',
      telegramChatId: '-5015233395',
      subscriptionStatus: 'active',
      subscriptionExpiresAt: '2026-12-31T23:59:59.000Z',
      createdAt: new Date().toISOString()
    },
    {
      id: 'usr_demo',
      email: 'demo@appletrack.in',
      name: 'Rahul Sharma',
      password: 'demo',
      role: 'user',
      telegramChatId: '',
      subscriptionStatus: 'active',
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    }
  ],
  stores: [
    { id: 'R756', name: 'Apple Saket', city: 'Delhi', location: 'Select CITYWALK Mall, Saket, New Delhi 110017', active: true },
    { id: 'R757', name: 'Apple BKC', city: 'Mumbai', location: 'Jio World Drive, BKC, Mumbai 400051', active: true },
    { id: 'R758', name: 'Apple Noida', city: 'Noida (Upcoming)', location: 'DLF Mall of India, Sector 18, Noida 201301', active: true }
  ],
  devices: [
    { sku: 'MG6K4HN/A', model: 'iPhone 17', storage: '256GB', color: 'White', image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-17-white-select-202509?wid=470&hei=556&fmt=png-alpha' },
    { sku: 'MG6J4HN/A', model: 'iPhone 17', storage: '256GB', color: 'Black', image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-17-black-select-202509?wid=470&hei=556&fmt=png-alpha' },
    { sku: 'MG6L4HN/A', model: 'iPhone 17', storage: '256GB', color: 'Mist Blue', image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-17-blue-select-202509?wid=470&hei=556&fmt=png-alpha' },
    { sku: 'MG6N4HN/A', model: 'iPhone 17', storage: '256GB', color: 'Sage', image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-17-sage-select-202509?wid=470&hei=556&fmt=png-alpha' },
    { sku: 'MG6M4HN/A', model: 'iPhone 17', storage: '256GB', color: 'Lavender', image: 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-17-lavender-select-202509?wid=470&hei=556&fmt=png-alpha' }
  ],
  trackers: [
    {
      id: 'trk_demo_1',
      userId: 'usr_demo',
      selectedStores: ['R756', 'R758'],
      selectedSkus: ['MG6K4HN/A', 'MG6J4HN/A', 'MG6L4HN/A', 'MG6N4HN/A', 'MG6M4HN/A'],
      active: true,
      updatedAt: new Date().toISOString()
    }
  ],
  notifications: [
    {
      id: 'notif_101',
      userId: 'usr_demo',
      storeName: 'Apple Saket (Delhi)',
      deviceName: 'iPhone 17 256GB White',
      sku: 'MG6K4HN/A',
      message: '🚨 Apple Pickup Available!\n📱 iPhone 17 256GB White\n🏪 Apple Saket\nPickup available now!',
      status: 'delivered',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  availabilityState: {
    'R756:MG6K4HN/A': { status: 'available', lastUpdated: new Date().toISOString() },
    'R756:MG6J4HN/A': { status: 'unavailable', lastUpdated: new Date().toISOString() },
    'R756:MG6L4HN/A': { status: 'unavailable', lastUpdated: new Date().toISOString() },
    'R756:MG6N4HN/A': { status: 'available', lastUpdated: new Date().toISOString() },
    'R756:MG6M4HN/A': { status: 'unavailable', lastUpdated: new Date().toISOString() },
    'R758:MG6K4HN/A': { status: 'unavailable', lastUpdated: new Date().toISOString() }
  },
  payments: [
    {
      id: 'pay_sub_999_demo',
      userId: 'usr_demo',
      amount: 999,
      currency: 'INR',
      status: 'completed',
      paymentMethod: 'UPI / Razorpay',
      razorpayPaymentId: 'pay_O8x7ZqL992A',
      createdAt: new Date().toISOString()
    }
  ]
};

// Data Store Accessor
class DB {
  constructor() {
    this.data = initialData;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Error loading DB file:', e);
      this.data = initialData;
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2));
    } catch (e) {
      console.error('Error saving DB file:', e);
    }
  }
}

export const db = new DB();
