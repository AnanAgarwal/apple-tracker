import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Smartphone, Send, CreditCard, RefreshCw, CheckCircle2, AlertTriangle, Bell, Clock, ShieldCheck, Zap } from 'lucide-react';
import DeviceStoreSelector from './DeviceStoreSelector.jsx';
import TelegramSetupModal from './TelegramSetupModal.jsx';
import RazorpayModal from './RazorpayModal.jsx';

import { safeJsonFetch } from '../utils/api.js';

export default function Dashboard({ user, token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [telegramModalOpen, setTelegramModalOpen] = useState(false);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);

  // Preference states
  const [selectedStores, setSelectedStores] = useState(['R756']);
  const [selectedSkus, setSelectedSkus] = useState(['MG6K4HN/A']);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { ok, data: json } = await safeJsonFetch('/api/trackers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (ok && json) {
        setData(json);
        if (json.tracker) {
          setSelectedStores(json.tracker.selectedStores || ['R756']);
          setSelectedSkus(json.tracker.selectedSkus || ['MG6K4HN/A']);
        }
      }
    } catch (e) {
      console.error('Failed to fetch tracker dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const handleStoreToggle = (storeId) => {
    setSelectedStores(prev => 
      prev.includes(storeId) ? prev.filter(id => id !== storeId) : [...prev, storeId]
    );
  };

  const handleSkuToggle = (sku) => {
    setSelectedSkus(prev => 
      prev.includes(sku) ? prev.filter(s => s !== sku) : [...prev, sku]
    );
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await safeJsonFetch('/api/trackers/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ selectedStores, selectedSkus })
      });
      await fetchDashboardData();
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChatId = async (chatId) => {
    await safeJsonFetch('/api/telegram/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ chatId })
    });
    await fetchDashboardData();
  };

  const handleSendTestMsg = async () => {
    setTesting(true);
    try {
      const { ok, data: json, error } = await safeJsonFetch('/api/telegram/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      await fetchDashboardData();
      return ok ? json : { success: false, error: error || json?.error || 'Failed' };
    } catch (e) {
      return { success: false, error: e.message };
    } finally {
      setTesting(false);
    }
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    await safeJsonFetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(paymentDetails)
    });
    await fetchDashboardData();
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-apple-accent">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="font-medium">Loading User Dashboard...</span>
        </div>
      </div>
    );
  }

  const isSubscribed = data?.subscription?.status === 'active';

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      
      {/* USER WELCOME HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-apple-border pb-6">
        <div>
          <div className="flex items-center space-x-2 text-apple-accent font-semibold text-xs tracking-wider uppercase">
            <LayoutDashboard className="w-4 h-4" />
            <span>Subscriber Restock Operations</span>
          </div>
          <h1 className="text-3xl font-extrabold font-outfit text-white mt-1">Welcome, {user?.name || 'Restock Hunter'}</h1>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setRazorpayModalOpen(true)}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center space-x-2 shadow-lg ${
              isSubscribed 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-apple-accent hover:bg-apple-accentHover text-white shadow-apple-accent/30'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{isSubscribed ? 'Subscription Active (₹999/mo)' : 'Upgrade to Pro ₹999/mo'}</span>
          </button>
        </div>
      </div>

      {/* STATUS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* SUBSCRIPTION CARD */}
        <div className="glass-card rounded-2xl p-6 space-y-3 border border-apple-border">
          <div className="flex items-center justify-between text-apple-textMuted text-xs">
            <span>Subscription Status</span>
            <CreditCard className="w-4 h-4 text-apple-accent" />
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${isSubscribed ? 'bg-emerald-400 pulse-emerald' : 'bg-red-400'}`} />
            <span className="text-xl font-bold text-white">{isSubscribed ? 'Pro Active' : 'Inactive'}</span>
          </div>
          <p className="text-xs text-apple-textMuted">
            {isSubscribed && data?.subscription?.expiresAt 
              ? `Renews on ${new Date(data.subscription.expiresAt).toLocaleDateString('en-IN')}` 
              : 'Subscribe to receive Telegram alerts'}
          </p>
        </div>

        {/* TELEGRAM STATUS CARD */}
        <div className="glass-card rounded-2xl p-6 space-y-3 border border-apple-border">
          <div className="flex items-center justify-between text-apple-textMuted text-xs">
            <span>Telegram Bot Link</span>
            <Send className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white truncate font-mono">
            {data?.telegramChatId ? data.telegramChatId : 'Not Configured'}
          </div>
          <button
            onClick={() => setTelegramModalOpen(true)}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium underline"
          >
            {data?.telegramChatId ? 'Change Chat ID / Test Alert' : '+ Configure Telegram Bot'}
          </button>
        </div>

        {/* MONITORED STORES */}
        <div className="glass-card rounded-2xl p-6 space-y-3 border border-apple-border">
          <div className="flex items-center justify-between text-apple-textMuted text-xs">
            <span>Selected Stores</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {selectedStores.length} Apple Store{selectedStores.length !== 1 ? 's' : ''}
          </div>
          <p className="text-xs text-apple-textMuted truncate">
            {selectedStores.map(id => data?.allStores?.find(s => s.id === id)?.name).join(', ') || 'None selected'}
          </p>
        </div>

        {/* ENGINE SPEED */}
        <div className="glass-card rounded-2xl p-6 space-y-3 border border-apple-border">
          <div className="flex items-center justify-between text-apple-textMuted text-xs">
            <span>Checking Engine Speed</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">30 Seconds</div>
          <p className="text-xs text-emerald-400 font-medium">● Instant State-Change Alerts</p>
        </div>

      </div>

      {/* DEVICE & STORE SELECTOR */}
      <DeviceStoreSelector
        stores={data?.allStores || []}
        devices={data?.allDevices || []}
        selectedStores={selectedStores}
        selectedSkus={selectedSkus}
        onStoreToggle={handleStoreToggle}
        onSkuToggle={handleSkuToggle}
        onSavePreferences={handleSavePreferences}
        saving={saving}
      />

      {/* NOTIFICATION LOGS TABLE */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-apple-border pb-4">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-apple-accent" />
            <div>
              <h3 className="text-xl font-bold font-outfit text-white">Your Telegram Restock Alert Logs</h3>
              <p className="text-xs text-apple-textMuted">History of instant restock notifications sent to your account</p>
            </div>
          </div>
          <span className="text-xs text-apple-textMuted">{data?.notifications?.length || 0} Total Alerts</span>
        </div>

        {data?.notifications?.length === 0 ? (
          <div className="text-center py-10 text-apple-textMuted text-sm">
            No restock notifications triggered yet. You will receive an instant alert here and on Telegram when stock arrives!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-apple-textMuted">
              <thead className="text-xs uppercase bg-apple-dark/50 text-apple-textMuted border-b border-apple-border">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">Device Model</th>
                  <th className="px-4 py-3">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-apple-border/50">
                {data?.notifications?.map(notif => (
                  <tr key={notif.id} className="hover:bg-apple-dark/40 transition-colors">
                    <td className="px-4 py-4 text-xs font-mono text-white">
                      {new Date(notif.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 font-medium text-white">{notif.storeName}</td>
                    <td className="px-4 py-4 text-apple-accent font-semibold">{notif.deviceName}</td>
                    <td className="px-4 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        notif.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {notif.status === 'delivered' ? '✓ Delivered via Bot' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODALS */}
      <TelegramSetupModal
        isOpen={telegramModalOpen}
        onClose={() => setTelegramModalOpen(false)}
        telegramChatId={data?.telegramChatId}
        onSaveChatId={handleSaveChatId}
        onSendTestMsg={handleSendTestMsg}
        testing={testing}
      />

      <RazorpayModal
        isOpen={razorpayModalOpen}
        onClose={() => setRazorpayModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        token={token}
        user={user}
      />

    </div>
  );
}
