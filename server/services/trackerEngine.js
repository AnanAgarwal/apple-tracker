import { db } from '../database.js';
import { sendTelegramAlert, buildRestockAlertMessage } from './telegramService.js';

class TrackerEngine {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.checkIntervalMs = 30000; // Check every 30 seconds
    this.lastCheckTimestamp = null;
    this.stats = {
      totalChecks: 0,
      alertsTriggered: 0,
      lastStatusChange: null
    };
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('🚀 Apple Store Pickup Tracker Engine started (Interval: 30s)');
    
    // Run initial check
    this.performCheck();

    // Schedule background loop
    this.intervalId = setInterval(() => {
      this.performCheck();
    }, this.checkIntervalMs);
  }

  stop() {
    if (!this.isRunning) return;
    clearInterval(this.intervalId);
    this.isRunning = false;
    console.log('⏹️ Tracker Engine stopped');
  }

  async performCheck() {
    this.lastCheckTimestamp = new Date().toISOString();
    this.stats.totalChecks += 1;

    try {
      // Evaluate all store & device combinations
      const stores = db.data.stores;
      const devices = db.data.devices;
      const trackers = db.data.trackers;

      for (const store of stores) {
        for (const device of devices) {
          const key = `${store.id}:${device.sku}`;
          const previousState = db.data.availabilityState[key] || { status: 'unavailable' };
          
          // Current state from state machine
          const currentState = db.data.availabilityState[key] || { status: 'unavailable' };

          // STATE CHANGE DETECTOR: Only notify if transitioning from unavailable -> available
          if (previousState.status === 'unavailable' && currentState.status === 'available') {
            await this.dispatchAlertsForRestock(store, device);
            this.stats.alertsTriggered += 1;
            this.stats.lastStatusChange = new Date().toISOString();
          }
        }
      }
    } catch (e) {
      console.error('Error during tracker check:', e);
    }
  }

  async dispatchAlertsForRestock(store, device) {
    console.log(`🎉 RESTOCK DETECTED! Store: ${store.name}, Device: ${device.model} ${device.storage} ${device.color}`);
    
    // Find all active subscribers monitoring this store & device
    const activeSubscribers = db.data.users.filter(u => {
      if (u.subscriptionStatus !== 'active') return false;
      
      const userTracker = db.data.trackers.find(t => t.userId === u.id && t.active);
      if (!userTracker) return false;

      const storeMatches = userTracker.selectedStores.includes(store.id);
      const skuMatches = userTracker.selectedSkus.includes(device.sku);
      return storeMatches && skuMatches;
    });

    const alertMsg = buildRestockAlertMessage(
      store.name,
      `${device.model} ${device.storage} ${device.color}`,
      device.sku,
      store.id
    );

    for (const user of activeSubscribers) {
      if (user.telegramChatId) {
        const result = await sendTelegramAlert(user.telegramChatId, alertMsg);
        
        // Log notification
        db.data.notifications.unshift({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: user.id,
          storeName: `${store.name} (${store.city})`,
          deviceName: `${device.model} ${device.storage} ${device.color}`,
          sku: device.sku,
          message: alertMsg,
          status: result.success ? 'delivered' : 'failed',
          timestamp: new Date().toISOString()
        });
        db.save();
      }
    }
  }

  // Admin Restock State Simulator (Unavailable <-> Available)
  toggleStockState(storeId, sku, forcedStatus) {
    const key = `${storeId}:${sku}`;
    const previousState = db.data.availabilityState[key] || { status: 'unavailable' };
    const newStatus = forcedStatus || (previousState.status === 'available' ? 'unavailable' : 'available');

    db.data.availabilityState[key] = {
      status: newStatus,
      lastUpdated: new Date().toISOString()
    };
    db.save();

    const store = db.data.stores.find(s => s.id === storeId);
    const device = db.data.devices.find(d => d.sku === sku);

    // If state changed to available, immediately fire check loop
    if (previousState.status === 'unavailable' && newStatus === 'available' && store && device) {
      this.dispatchAlertsForRestock(store, device);
    }

    return { key, previousStatus: previousState.status, newStatus };
  }
}

export const trackerEngine = new TrackerEngine();
