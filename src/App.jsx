import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';
import toast from './utils/toast';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, getRedirectResult } from 'firebase/auth';
import { auth } from './firebase';
import { DASHBOARD_MAP } from './constants';
import { useWallet } from './hooks/useWallet';
import { useTimeCheck } from './hooks/useTimeCheck';
import { useProfile } from './hooks/useProfile';
import { INITIAL_MENU, DEADLINES } from './data/menu';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import RiderDashboard from './components/RiderDashboard';
import TopUpModal from './components/TopUpModal';
import KitchenDashboard from './components/KitchenDashboard';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerDashboard from './components/CustomerDashboard';

import API_BASE from './api';
const ADMIN_EMAILS = ['seo.mdemon@gmail.com'];

// Extracted DashboardLayout to prevent re-creation on every render
const DashboardLayout = ({ children, title, user, activeTab, setActiveTab, balance, setShowTopUpModal, handleLogout, showTopUpModal, handleTopUpRequest }) => (
  <div className="container animate-fade-in">
    {showTopUpModal && <TopUpModal onClose={() => setShowTopUpModal(false)} onSubmit={handleTopUpRequest} />}
    <header className="flex" style={{ justifyContent: 'space-between', marginBottom: '3rem' }}>
      <div>
        <h1 style={{ fontSize: '2.5rem' }}>ফুড ক্যাটারিং <span style={{ color: 'var(--primary)' }}>বরিশাল</span></h1>
        <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          Welcome, <span style={{ color: 'white', fontWeight: 'bold' }}>{user?.name}</span> ({title})
          {user?.customId && (
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--primary)', background: 'rgba(235, 94, 40, 0.1)', padding: '0.15rem 0.45rem', borderRadius: '4px', fontSize: '0.75rem', border: '1px solid rgba(235, 94, 40, 0.2)' }}>
              ID: {user.customId}
            </span>
          )}
        </p>
      </div>
      <div className="flex">
        {user?.role === 'customer' && (
          <div className="flex" style={{ marginRight: '1rem', background: 'var(--glass-bg)', borderRadius: '12px', padding: '0.3rem' }}>
            <button className={activeTab === 'menu' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('menu')}>Menu</button>
            <button className={activeTab === 'transactions' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('transactions')}>Transactions</button>
            <button className={activeTab === 'profile' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('profile')}>Profile</button>
          </div>
        )}
        <button className="btn-outline" onClick={handleLogout} style={{ marginRight: '1rem' }}>Logout</button>
        {user?.role === 'customer' && activeTab === 'menu' && (
          <div className="glass-card" style={{ padding: '0.75rem 1.5rem' }}>
            <span style={{ color: 'var(--secondary)', fontWeight: 'bold', marginRight: '1rem' }}>৳ {balance.toFixed(2)}</span>
            <button className="btn-primary" onClick={() => setShowTopUpModal(true)}>+ Top Up</button>
          </div>
        )}
      </div>
    </header>
    {children}
  </div>
);

const AppContent = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('menu');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const isInitialAuthCheck = useRef(true);

  const { balance, topUp, deduct, refresh: refreshWallet } = useWallet(user?.username || user?.id);
  const { profile, updateProfile } = useProfile(user?.username || user?.id);
  const [selectedItems, setSelectedItems] = useState([]);

  const [menu, setMenu] = useState({ lunch: [], dinner: [], riders: [] });
  const [orderHistory, setOrderHistory] = useState([]);
  const [payments, setPayments] = useState([]);
  const [topUpRequests, setTopUpRequests] = useState([]);
  const [subscriptionRequests, setSubscriptionRequests] = useState([]);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [menuRes, ordersRes, topUpRes, ridersRes, paymentsRes, subsRes] = await Promise.all([
        axios.get(`${API_BASE}/menu`),
        axios.get(`${API_BASE}/orders`),
        axios.get(`${API_BASE}/topup`),
        axios.get(`${API_BASE}/riders`),
        axios.get(`${API_BASE}/payments`),
        axios.get(`${API_BASE}/subscriptions`)
      ]);
      setMenu({
        lunch: menuRes.data.lunch,
        dinner: menuRes.data.dinner,
        riders: ridersRes.data
      });
      setOrderHistory(ordersRes.data);
      setTopUpRequests(topUpRes.data);
      setPayments(paymentsRes.data);
      setSubscriptionRequests(subsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    getRedirectResult(auth).catch(err => {
      console.error('Google redirect error:', err.message);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const isInitial = isInitialAuthCheck.current;
      isInitialAuthCheck.current = false;

      if (firebaseUser) {
        try {
          const cached = JSON.parse(localStorage.getItem('current_user') || 'null');

          if (cached?.username === firebaseUser.uid) {
            // Token refresh or session restore — reuse cache, skip network calls
            setUser(cached);
            setAuthLoading(false);
            return;
          }

          // New login or signup — sync with Firebase and backend
          if (!firebaseUser.displayName) await firebaseUser.reload();
          const freshUser = auth.currentUser;
          const email = freshUser.email || '';
          const name = freshUser.displayName || email.split('@')[0];
          let role = 'customer';
          if (ADMIN_EMAILS.includes(email)) role = 'admin';
          if (email.toLowerCase().includes('kitchen')) role = 'kitchen';

          const response = await axios.post(`${API_BASE}/auth/login`, {
            username: freshUser.uid,
            name,
            role
          });

          const userData = {
            id: response.data.username,
            username: response.data.username,
            name: response.data.name,
            role: response.data.role,
            email
          };

          setUser(userData);
          localStorage.setItem('current_user', JSON.stringify(userData));

          const publicRoutes = ['/', '/login'];
          if (publicRoutes.includes(window.location.pathname) || !isInitial) {
            navigate(DASHBOARD_MAP[userData.role] || '/');
          }
        } catch (err) {
          console.error('Auth sync failed:', err);
          toast.error('Database Sync Failed: ' + (err.response?.data?.error || err.message || 'Could not register user.'));
          setUser(null);
          localStorage.removeItem('current_user');
        }
      } else {
        // Only redirect to homepage if they were previously logged in (transition to logged out)
        const wasLoggedIn = !!localStorage.getItem('current_user') || user !== null;
        setUser(null);
        localStorage.removeItem('current_user');
        if (wasLoggedIn && !isInitial) {
          navigate('/');
        }
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    console.log('DEBUG: handleLogout called!');
    try {
      await signOut(auth);
      console.log('DEBUG: signOut(auth) completed!');
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('DEBUG: signOut error:', error);
      toast.error('Logout failed: ' + error.message);
    }
  };

  const handleTopUpRequest = async (requestData) => {
    try {
      await axios.post(`${API_BASE}/topup`, {
        userId: user.username || user.id,
        username: user.name,
        amount: parseFloat(requestData.amount),
        senderPhone: requestData.senderPhone,
        screenshot: requestData.screenshot
      });
      fetchData();
      setShowTopUpModal(false);
      toast.success('Top-up request sent! Admin will approve it soon. ⏳');
    } catch (err) {
      toast.error('Failed to send request.');
    }
  };

  const lunchTime = useTimeCheck(DEADLINES.lunch);
  const dinnerTime = useTimeCheck(DEADLINES.dinner);

  const toggleItem = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.find(i => (item._id || item.id) === (i._id || i.id));
      if (isSelected) return prev.filter(i => (item._id || item.id) !== (i._id || i.id));
      return [...prev, item];
    });
  };

  const placeOrder = async (type) => {
    const totalPending = selectedItems.reduce((sum, item) => sum + item.price, 0);
    if (selectedItems.length === 0) return toast.error('Select some food first!');
    if (totalPending > balance) return toast.error('Insufficient balance!');
    if (!profile.phone || !profile.address) {
      toast.error('Complete profile first!');
      setActiveTab('profile');
      return;
    }
    try {
      await axios.post(`${API_BASE}/orders`, {
        customerId: user.username || user.id,
        customerName: user.name,
        customerPhone: profile.phone,
        customerAddress: profile.address,
        type,
        items: selectedItems.map(i => i.name),
        total: totalPending
      });
      fetchData(); refreshWallet(); setSelectedItems([]);
      toast.success('Order placed! 🍱');
    } catch (err) { toast.error('Failed to place order.'); }
  };

  const myOrders = orderHistory.filter(o => o.customerId === (user?.username || user?.id));

  if (authLoading) {
    return (
      <div className="flex" style={{ height: '100vh', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '3rem' }}>🍱</div>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={
        user
          ? <Navigate to={DASHBOARD_MAP[user.role] || '/'} replace />
          : <LandingPage onLoginClick={() => navigate('/login')} />
      } />
      <Route path="/login" element={
        user
          ? <Navigate to={DASHBOARD_MAP[user.role] || '/'} replace />
          : <div className="container"><Login /></div>
      } />

      <Route path="/admin" element={
        <ProtectedRoute user={user} allowedRole="admin">
          <DashboardLayout title="Admin" user={user} handleLogout={handleLogout} showTopUpModal={showTopUpModal} setShowTopUpModal={setShowTopUpModal} handleTopUpRequest={handleTopUpRequest}>
            <AdminDashboard menu={menu} setMenu={setMenu} orderHistory={orderHistory} setOrderHistory={setOrderHistory} payments={payments} setPayments={setPayments} topUpRequests={topUpRequests} setTopUpRequests={setTopUpRequests} subscriptionRequests={subscriptionRequests} setSubscriptionRequests={setSubscriptionRequests} fetchData={fetchData} />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/rider" element={
        <ProtectedRoute user={user} allowedRole="rider">
          <DashboardLayout title="Rider" user={user} handleLogout={handleLogout} showTopUpModal={showTopUpModal} setShowTopUpModal={setShowTopUpModal} handleTopUpRequest={handleTopUpRequest}>
            <RiderDashboard riderId={user?.username} username={user?.name} orderHistory={orderHistory} setOrderHistory={setOrderHistory} payments={payments} fetchData={fetchData} />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/kitchen" element={
        <ProtectedRoute user={user} allowedRole="kitchen">
          <DashboardLayout title="Kitchen" user={user} handleLogout={handleLogout} showTopUpModal={showTopUpModal} setShowTopUpModal={setShowTopUpModal} handleTopUpRequest={handleTopUpRequest}>
            <KitchenDashboard orderHistory={orderHistory} fetchData={fetchData} />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/user" element={
        <ProtectedRoute user={user} allowedRole="customer">
          <DashboardLayout title="Customer" user={user} activeTab={activeTab} setActiveTab={setActiveTab} balance={balance} handleLogout={handleLogout} showTopUpModal={showTopUpModal} setShowTopUpModal={setShowTopUpModal} handleTopUpRequest={handleTopUpRequest}>
            <CustomerDashboard user={user} balance={balance} activeTab={activeTab} setActiveTab={setActiveTab} setShowTopUpModal={setShowTopUpModal} lunchTime={lunchTime} dinnerTime={dinnerTime} menu={menu} selectedItems={selectedItems} toggleItem={toggleItem} placeOrder={placeOrder} myOrders={myOrders} profile={profile} onProfileUpdate={(d) => updateProfile(d)} UserProfile={UserProfile} />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <Router>
    <Toaster position="top-right" reverseOrder={false} />
    <AppContent />
  </Router>
);

export default App;
