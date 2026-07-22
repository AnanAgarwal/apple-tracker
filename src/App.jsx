import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import LandingPage from './components/LandingPage.jsx';
import Dashboard from './components/Dashboard.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import PublicStatusPage from './components/PublicStatusPage.jsx';
import AuthModal from './components/AuthModal.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('apple_track_token') || '');
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'dashboard', 'admin', 'public-status', 'auth-login', 'auth-signup'
  const [initializing, setInitializing] = useState(true);

  // Restore session from token
  useEffect(() => {
    const restoreSession = async () => {
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Expired token
          localStorage.removeItem('apple_track_token');
          setToken('');
        }
      } catch (e) {
        console.error('Session restore failed:', e);
      } finally {
        setInitializing(false);
      }
    };
    restoreSession();
  }, [token]);

  const handleAuthSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('apple_track_token', userToken);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('apple_track_token');
    setCurrentView('landing');
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-apple-dark flex items-center justify-center text-apple-accent">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-apple-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Initializing Apple Track SaaS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-dark text-white flex flex-col">
      
      {/* NAVBAR */}
      <Navbar
        user={user}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLogout={handleLogout}
      />

      {/* MAIN VIEW CONTENT */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-8">
        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => setCurrentView(user ? 'dashboard' : 'auth-signup')}
            onLiveStatusClick={() => setCurrentView('public-status')}
          />
        )}

        {currentView === 'public-status' && (
          <PublicStatusPage
            onGetStarted={() => setCurrentView(user ? 'dashboard' : 'auth-signup')}
          />
        )}

        {currentView === 'dashboard' && user && (
          <Dashboard
            user={user}
            token={token}
          />
        )}

        {currentView === 'admin' && user && user.role === 'admin' && (
          <AdminPanel
            token={token}
          />
        )}

        {(currentView === 'auth-login' || currentView === 'auth-signup') && (
          <AuthModal
            initialMode={currentView === 'auth-signup' ? 'signup' : 'login'}
            onAuthSuccess={handleAuthSuccess}
            onCancel={() => setCurrentView('landing')}
          />
        )}
      </main>

    </div>
  );
}
