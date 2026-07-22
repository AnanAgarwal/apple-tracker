import React, { useState } from 'react';
import { Smartphone, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

import { safeJsonFetch } from '../utils/api.js';

export default function AuthModal({ initialMode = 'login', onAuthSuccess, onCancel }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = mode === 'signup' ? '/api/auth/register' : '/api/auth/login';
    const payload = mode === 'signup' ? { name, email, password } : { email, password };

    try {
      const { ok, data, error: fetchErr } = await safeJsonFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!ok || !data) {
        throw new Error(data?.error || fetchErr || 'Authentication failed');
      }

      onAuthSuccess(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 glass-card rounded-3xl p-8 border border-apple-border space-y-6 relative shadow-2xl">
      
      {/* BRAND LOGO */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-apple-accent/20 text-apple-accent mx-auto flex items-center justify-center p-2 shadow-lg shadow-apple-accent/20">
          <Smartphone className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold font-outfit text-white">
          {mode === 'signup' ? 'Create Apple Track Account' : 'Welcome Back'}
        </h2>
        <p className="text-xs text-apple-textMuted">
          {mode === 'signup' ? 'Start monitoring iPhone 17 pickup availability' : 'Log in to manage your restock trackers'}
        </p>
      </div>

      {/* ERROR ALERT */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-white">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-apple-textMuted absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-apple-card border border-apple-border text-white text-sm focus:outline-none focus:border-apple-accent transition-colors"
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-white">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-apple-textMuted absolute left-3.5 top-3.5" />
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="rahul@example.com"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-apple-card border border-apple-border text-white text-sm focus:outline-none focus:border-apple-accent transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-white">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-apple-textMuted absolute left-3.5 top-3.5" />
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-apple-card border border-apple-border text-white text-sm focus:outline-none focus:border-apple-accent transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-apple-accent hover:bg-apple-accentHover text-white font-semibold text-sm shadow-lg shadow-apple-accent/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
        >
          <span>{loading ? 'Please wait...' : (mode === 'signup' ? 'Create Account' : 'Log In')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* TOGGLE MODE */}
      <div className="text-center pt-4 border-t border-apple-border/50 text-xs text-apple-textMuted">
        {mode === 'signup' ? (
          <p>
            Already have an account?{' '}
            <button onClick={() => setMode('login')} className="text-apple-accent hover:underline font-semibold">
              Log In
            </button>
          </p>
        ) : (
          <p>
            Don't have an account yet?{' '}
            <button onClick={() => setMode('signup')} className="text-apple-accent hover:underline font-semibold">
              Sign Up
            </button>
          </p>
        )}
      </div>

    </div>
  );
}
