import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
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

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';

// Extracted DashboardLayout to prevent re-creation on every render
const DashboardLayout = ({ children, title, user, activeTab, setActiveTab, balance, setShowTopUpModal, handleLogout, showTopUpModal, handleTopUpRequest }) => (
  <div className="container animate-fade-in">
    {showTopUpModal && <TopUpModal onClose={() => setShowTopUpModal(false)} onSubmit={handleTopUpRequest} />}
    <header className="flex" style={{ justifyContent: 'space-between', marginBottom: '3rem' }}>
      <div>
        <h1 style={{ fontSize: '2.5rem' }}>Food <span style={{ color: 'var(--primary)' }}>Catering</span></h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Welcome, <span style={{ color: 'white', fontWeight: 'bold' }}>{user?.name}</span> ({title})
        </p>
      </div>
      <div className="flex">
        {user?.role === 'customer' && (
          <div className="flex" style={{ marginRight: '1rem', background: 'var(--glass-bg)', borderRadius: '12px', padding: '0.3rem' }}>
            <button className={activeTab === 'menu' ? 'btn-primary' : 'btn-outline'} onClick={() => setActiveTab('menu')}>Menu</button>
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
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const { balance, topUp, deduct, refresh: refreshWallet } = useWallet(user?.username || user?.id);
  const { profile, updateProfile } = useProfile(user?.username || user?.id);
  const [selectedItems, setSelectedItems] = useState([]);

  const [menu, setMenu] = useState({ lunch: [], dinner: [], riders: [] });
  const [orderHistory, setOrderHistory] = useState([]);
  const [payments, setPayments] = useState([]);
  const [topUpRequests, setTopUpRequests] = useState([]);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [menuRes, ordersRes, topUpRes, ridersRes, paymentsRes] = await Promise.all([
        axios.get(`${API_BASE}/menu`),
        axios.get(`${API_BASE}/orders`),
        axios.get(`${API_BASE}/topup`),
        axios.get(`${API_BASE}/riders`),
        axios.get(`${API_BASE}/payments`)
      ]);
      setMenu({
        lunch: menuRes.data.lunch,
        dinner: menuRes.data.dinner,
        riders: ridersRes.data
      });
      setOrderHistory(ordersRes.data);
      setTopUpRequests(topUpRes.data);
      setPayments(paymentsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('current_user', JSON.stringify(user));

      // Prevent redundant sync
      const savedUser = JSON.parse(localStorage.getItem('current_user'));
      if (savedUser && savedUser.role !== user.role) {
        // ...
      }
    } else {
      localStorage.removeItem('current_user');
    }
  }, [user]);

  // New effect for one-time validation on mount
  useEffect(() => {
    const saved = localStorage.getItem('current_user');
    if (saved) {
      const parsedUser = JSON.parse(saved);
      axios.post(`${API_BASE}/auth/login`, {
        username: parsedUser.username || parsedUser.id,
        name: parsedUser.name,
        role: parsedUser.role
      }).then(res => {
        if (res.data.role !== parsedUser.role) {
          setUser(prev => ({ ...prev, role: res.data.role }));
        }
      }).catch(err => console.error('Auth sync failed:', err));
    }
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    const dashboardMap = { admin: '/admin', rider: '/rider', customer: '/user', kitchen: '/kitchen' };
    navigate(dashboardMap[u.role] || '/');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
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
      alert('Top-up request sent! Admin will approve it soon. ⏳');
    } catch (err) {
      alert('Failed to send request.');
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
    if (selectedItems.length === 0) return alert('Select some food first!');
    if (totalPending > balance) return alert('Insufficient balance!');
    if (!profile.phone || !profile.address) {
      alert('Complete profile first!');
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
      alert('Order placed! 🍱');
    } catch (err) { alert('Failed to place order.'); }
  };

  const myOrders = orderHistory.filter(o => o.customerId === (user?.username || user?.id));

  return (
    <Routes>
      <Route path="/" element={<LandingPage onLoginClick={() => navigate('/login')} />} />
      <Route path="/login" element={<div className="container"><Login onLogin={handleLogin} /></div>} />

      <Route path="/admin" element={
        <ProtectedRoute user={user} allowedRole="admin">
          <DashboardLayout title="Admin" user={user} handleLogout={handleLogout} showTopUpModal={showTopUpModal} setShowTopUpModal={setShowTopUpModal} handleTopUpRequest={handleTopUpRequest}>
            <AdminDashboard menu={menu} setMenu={setMenu} orderHistory={orderHistory} setOrderHistory={setOrderHistory} payments={payments} setPayments={setPayments} topUpRequests={topUpRequests} setTopUpRequests={setTopUpRequests} fetchData={fetchData} />
          </DashboardLayout>
        </ProtectedRoute>
      } />

      <Route path="/rider" element={
        <ProtectedRoute user={user} allowedRole="rider">
          <DashboardLayout title="Rider" user={user} handleLogout={handleLogout} showTopUpModal={showTopUpModal} setShowTopUpModal={setShowTopUpModal} handleTopUpRequest={handleTopUpRequest}>
            <RiderDashboard username={user?.name} orderHistory={orderHistory} setOrderHistory={setOrderHistory} payments={payments} fetchData={fetchData} />
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
    <AppContent />
  </Router>
);

export default App;
