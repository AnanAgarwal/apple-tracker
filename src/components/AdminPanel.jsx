import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, Users, Bell, DollarSign, RefreshCw, Zap, CheckCircle2, AlertTriangle, UserCheck, UserX } from 'lucide-react';

import { safeJsonFetch } from '../utils/api.js';

export default function AdminPanel({ token }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulationStatus, setSimulationStatus] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, notifRes] = await Promise.all([
        safeJsonFetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        safeJsonFetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
        safeJsonFetch('/api/admin/notifications', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (statsRes.ok) setStats(statsRes.data);
      if (usersRes.ok) setUsers(usersRes.data.users || []);
      if (notifRes.ok) setNotifications(notifRes.data.notifications || []);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleSimulateRestock = async (storeId, sku, status) => {
    setSimulationStatus(`Triggering ${status} state...`);
    try {
      const { ok, data } = await safeJsonFetch('/api/admin/simulate-restock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ storeId, sku, status })
      });
      if (ok && data) {
        setSimulationStatus(data.message);
      }
      fetchAdminData();
    } catch (e) {
      setSimulationStatus('Simulation failed');
    }
  };

  const handleExtendUser = async (userId) => {
    try {
      await safeJsonFetch('/api/admin/toggle-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ userId, extendDays: 30 })
      });
      fetchAdminData();
    } catch (e) {
      console.error('User update failed:', e);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-apple-accent">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="font-medium">Loading SaaS Analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-16">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-apple-border pb-6">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
            <Shield className="w-4 h-4" />
            <span>Admin Operational Control Center</span>
          </div>
          <h1 className="text-3xl font-extrabold font-outfit text-white mt-1">SaaS Analytics & Engine Control</h1>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-4 py-2 rounded-xl bg-apple-card hover:bg-apple-border text-white text-xs font-medium border border-apple-border flex items-center space-x-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="glass-card rounded-2xl p-6 space-y-2 border border-apple-border">
          <div className="flex items-center justify-between text-apple-textMuted text-xs">
            <span>Monthly Recurring Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">₹{stats?.mrr?.toLocaleString('en-IN') || 0}</div>
          <div className="text-xs text-emerald-400 font-medium">₹999/mo per active user</div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-2 border border-apple-border">
          <div className="flex items-center justify-between text-apple-textMuted text-xs">
            <span>Active Subscribers</span>
            <Users className="w-4 h-4 text-apple-accent" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.activeSubscribers || 0} / {stats?.totalUsers || 0}</div>
          <div className="text-xs text-apple-textMuted">Conversion: {stats?.conversionRate}</div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-2 border border-apple-border">
          <div className="flex items-center justify-between text-apple-textMuted text-xs">
            <span>Total Telegram Alerts</span>
            <Bell className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalAlerts || 0}</div>
          <div className="text-xs text-amber-400 font-medium">State-machine filtered</div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-2 border border-apple-border">
          <div className="flex items-center justify-between text-apple-textMuted text-xs">
            <span>Engine Check Interval</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">30s</div>
          <div className="text-xs text-emerald-400 font-medium">● Status: Active</div>
        </div>

      </div>

      {/* RESTOCK ENGINE SIMULATOR */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-purple-500/30">
        <div className="flex items-center justify-between border-b border-apple-border pb-4">
          <div className="flex items-center space-x-3">
            <Zap className="w-6 h-6 text-purple-400" />
            <div>
              <h3 className="text-xl font-bold font-outfit text-white">Restock Engine State-Transition Simulator</h3>
              <p className="text-xs text-apple-textMuted">Force state change (Unavailable $\rightarrow$ Available) to trigger instant Telegram alerts to subscribers</p>
            </div>
          </div>
          {simulationStatus && (
            <span className="text-xs text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full border border-purple-500/30">
              {simulationStatus}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-2xl bg-apple-dark/60 border border-apple-border space-y-3">
            <div className="font-semibold text-white text-sm">Apple Saket • White (256GB)</div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSimulateRestock('R756', 'MG6K4HN/A', 'available')}
                className="flex-1 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors"
              >
                Set AVAILABLE (Restock Alert)
              </button>
              <button
                onClick={() => handleSimulateRestock('R756', 'MG6K4HN/A', 'unavailable')}
                className="py-2 px-3 rounded-xl bg-apple-card hover:bg-apple-border text-apple-textMuted text-xs font-medium border border-apple-border"
              >
                Set Out of Stock
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-apple-dark/60 border border-apple-border space-y-3">
            <div className="font-semibold text-white text-sm">Apple Saket • Black (256GB)</div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSimulateRestock('R756', 'MG6J4HN/A', 'available')}
                className="flex-1 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors"
              >
                Set AVAILABLE (Restock Alert)
              </button>
              <button
                onClick={() => handleSimulateRestock('R756', 'MG6J4HN/A', 'unavailable')}
                className="py-2 px-3 rounded-xl bg-apple-card hover:bg-apple-border text-apple-textMuted text-xs font-medium border border-apple-border"
              >
                Set Out of Stock
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-apple-dark/60 border border-apple-border space-y-3">
            <div className="font-semibold text-white text-sm">Apple Noida • Sage (256GB)</div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSimulateRestock('R758', 'MG6N4HN/A', 'available')}
                className="flex-1 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors"
              >
                Set AVAILABLE (Restock Alert)
              </button>
              <button
                onClick={() => handleSimulateRestock('R758', 'MG6N4HN/A', 'unavailable')}
                className="py-2 px-3 rounded-xl bg-apple-card hover:bg-apple-border text-apple-textMuted text-xs font-medium border border-apple-border"
              >
                Set Out of Stock
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* USER MANAGEMENT TABLE */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-apple-border pb-4">
          <h3 className="text-xl font-bold font-outfit text-white">Registered SaaS Users & Subscriptions</h3>
          <span className="text-xs text-apple-textMuted">{users.length} Registered Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-apple-textMuted">
            <thead className="text-xs uppercase bg-apple-dark/50 text-apple-textMuted border-b border-apple-border">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Telegram Chat ID</th>
                <th className="px-4 py-3">Subscription</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-border/50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-apple-dark/40 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-white">{u.name}</div>
                    <div className="text-xs text-apple-textMuted">{u.email}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded font-mono uppercase ${
                      u.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-apple-card text-apple-textMuted'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-white">
                    {u.telegramChatId ? <span className="text-blue-400">● {u.telegramChatId}</span> : <span className="text-apple-textMuted">Not Set</span>}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      u.subscriptionStatus === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {u.subscriptionStatus === 'active' ? 'Active Pro (₹999)' : 'Expired'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => handleExtendUser(u.id)}
                      className="px-3 py-1.5 rounded-lg bg-apple-accent/20 hover:bg-apple-accent/30 text-apple-accent text-xs font-medium border border-apple-accent/30 transition-colors"
                    >
                      +30 Days Pro
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
