import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { secondaryAuth } from '../firebase';
import toast from '../utils/toast';

import API_BASE from '../api';

const ROLE_COLORS = {
    admin:    { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
    kitchen:  { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
    rider:    { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
    customer: { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
};

const AdminDashboard = ({ menu, setMenu, orderHistory, setOrderHistory, payments, setPayments, topUpRequests, setTopUpRequests, subscriptionRequests, setSubscriptionRequests, fetchData }) => {
    const [activeTab, setActiveTab] = useState('overview');

    // Refresh topup data whenever admin opens that tab
    useEffect(() => {
        if (activeTab === 'payments') fetchData();
    }, [activeTab, fetchData]);

    // Menu form state
    const [itemName, setItemName] = useState('');
    const [itemPrice, setItemPrice] = useState('');
    const [itemCategory, setItemCategory] = useState('lunch');
    const [itemIcon, setItemIcon] = useState('🍲');

    // Rider/Payment state
    const [newRiderName, setNewRiderName] = useState('');
    const [payAmount, setPayAmount] = useState('');
    const [selectedRiderForPay, setSelectedRiderForPay] = useState('');
    const [viewProof, setViewProof] = useState(null);
    const [payReceipt, setPayReceipt] = useState(null);

    // Filtering state
    const [filterType, setFilterType] = useState('all'); // all, 7d, 30d, 1y, custom
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Users tab state
    const [users, setUsers] = useState([]);
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [userSearch, setUserSearch] = useState('');
    const [newUserUsername, setNewUserUsername] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [newUserRole, setNewUserRole] = useState('customer');
    const [addUserLoading, setAddUserLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'users') fetchUsers();
    }, [activeTab]);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_BASE}/users`);
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const changeRole = async (username, role) => {
        try {
            await axios.patch(`${API_BASE}/users/${username}/role`, { role });
            setUsers(prev => prev.map(u => u.username === username ? { ...u, role } : u));
        } catch (err) {
            alert('Failed to change role');
        }
    };

    const deleteUser = async (username, name) => {
        if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        try {
            await axios.delete(`${API_BASE}/users/${username}`);
            setUsers(prev => prev.filter(u => u.username !== username));
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const addUser = async (e) => {
        e.preventDefault();
        if (!newUserUsername.trim() || !newUserEmail.trim() || !newUserPassword.trim()) return;
        setAddUserLoading(true);
        const username = newUserUsername.trim().toLowerCase().replace(/\s+/g, '_');
        try {
            // Create Firebase account — if the email already exists in Firebase (e.g. user was
            // previously deleted from MongoDB but not from Firebase), skip Firebase creation and
            // just recreate the MongoDB record so the user can still log in.
            try {
                const result = await createUserWithEmailAndPassword(secondaryAuth, newUserEmail.trim(), newUserPassword);
                await updateProfile(result.user, { displayName: newUserUsername.trim() });
                await secondaryAuth.signOut();
            } catch (firebaseErr) {
                if (firebaseErr.code === 'auth/weak-password') throw new Error('Password must be at least 6 characters');
                if (firebaseErr.code === 'auth/invalid-email') throw new Error('Invalid email address');
                if (firebaseErr.code !== 'auth/email-already-in-use') throw firebaseErr;
                // email-already-in-use: Firebase account still exists from before deletion — continue to recreate MongoDB record
            }

            // Create MongoDB user with hashed password
            const res = await axios.post(`${API_BASE}/admin/create-user`, {
                username,
                name: newUserUsername.trim(),
                email: newUserEmail.trim(),
                password: newUserPassword,
                role: newUserRole,
            });
            setUsers(prev => [res.data, ...prev]);
            setNewUserUsername('');
            setNewUserEmail('');
            setNewUserPassword('');
            toast.success(`User "${newUserUsername.trim()}" added as ${newUserRole}!`);
        } catch (err) {
            toast.error(err.message || err.response?.data?.error || 'Failed to add user');
        } finally {
            setAddUserLoading(false);
        }
    };

    const riders = menu.riders || [];

    // Helper to map stored rider value (name or username/UID) to their beautiful display name
    const getRiderDisplayName = (assignedVal) => {
        if (!assignedVal) return '';
        const found = riders.find(r => r.username === assignedVal || r.name === assignedVal);
        return found ? found.name : assignedVal;
    };

    // Helper to parse dates for older orders if missing timestamp
    const getTimestamp = (order) => {
        if (order.timestamp) return order.timestamp;
        return new Date(order.date).getTime() || 0;
    };

    // Filtered Orders Logic
    const filteredOrders = orderHistory.filter(order => {
        const ts = getTimestamp(order);
        const now = Date.now();

        if (filterType === '7d') return now - ts <= 7 * 24 * 60 * 60 * 1000;
        if (filterType === '30d') return now - ts <= 30 * 24 * 60 * 60 * 1000;
        if (filterType === '1y') return now - ts <= 365 * 24 * 60 * 60 * 1000;
        if (filterType === 'custom' && customStartDate && customEndDate) {
            const start = new Date(customStartDate).setHours(0, 0, 0, 0);
            const end = new Date(customEndDate).setHours(23, 59, 59, 999);
            return ts >= start && ts <= end;
        }
        return true; // 'all'
    });

    // Analytics based on filtered view
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrdersCount = filteredOrders.length;
    const uniqueCustomers = new Set(filteredOrders.map(order => order.customerName)).size;

    const addDish = async (e) => {
        e.preventDefault();
        if (!itemName || !itemPrice) return toast.error('Fill all fields!');
        try {
            await axios.post(`${API_BASE}/menu`, {
                name: itemName,
                price: parseFloat(itemPrice),
                category: itemCategory,
                icon: itemIcon
            });
            fetchData();
            setItemName(''); setItemPrice('');
            toast.success('Dish added successfully!');
        } catch (err) {
            toast.error('Failed to add dish');
        }
    };

    const removeDish = async (id, cat) => {
        try {
            await axios.delete(`${API_BASE}/menu/${id}`);
            fetchData();
            toast.success('Dish removed');
        } catch (err) {
            toast.error('Failed to remove dish');
        }
    };

    const addRider = async (e) => {
        e.preventDefault();
        if (!newRiderName) return toast.error('Enter rider name!');
        try {
            await axios.post(`${API_BASE}/riders`, { name: newRiderName });
            fetchData();
            setNewRiderName('');
            toast.success('Rider added successfully! 🛵');
        } catch (err) {
            toast.error('Failed to add rider');
        }
    };

    const assignRider = async (orderId, rName) => {
        try {
            await axios.patch(`${API_BASE}/orders/${orderId}`, {
                assignedRider: rName,
                status: 'Assigned'
            });
            fetchData();
            toast.success('Rider assigned');
        } catch (err) {
            toast.error('Failed to assign rider');
        }
    };

    const normalize = (str) => {
        if (!str) return '';
        return str.toLowerCase().replace(/[^a-z0-9]/g, '');
    };

    const getRiderStats = (r) => {
        if (!r) return { earned: 0, paid: 0, pending: 0 };
        const normName = normalize(r.name);
        const normUsername = normalize(r.username);

        const deliveredCount = orderHistory.filter(o => {
            if (o.status !== 'Delivered') return false;
            const normAssigned = normalize(o.assignedRider);
            return normAssigned === normName || normAssigned === normUsername;
        }).length;

        const earned = deliveredCount * 30;

        const paid = payments.filter(p => {
            const normPayRider = normalize(p.riderName);
            return normPayRider === normName || normPayRider === normUsername;
        }).reduce((sum, p) => sum + p.amount, 0);

        return { earned, paid, pending: earned - paid };
    };

    // Approval logic for Top-Up
    const handleApproveTopUp = async (req) => {
        try {
            await axios.patch(`${API_BASE}/topup/${req._id || req.id}/approve`);
            fetchData();
            window.dispatchEvent(new CustomEvent('walletUpdate'));
            toast.success(`Success! Requested amount added to ${req.username}'s wallet.`);
        } catch (err) {
            toast.error('Failed to approve top-up');
        }
    };

    const handleRejectTopUp = async (reqId) => {
        if (!window.confirm('Are you sure you want to reject this request?')) return;
        try {
            await axios.patch(`${API_BASE}/topup/${reqId}/reject`);
            fetchData();
            toast.success('Top-up request rejected');
        } catch (err) {
            toast.error('Failed to reject top-up');
        }
    };

    const handleUpdateSubscriptionStatus = async (id, status) => {
        try {
            await axios.patch(`${API_BASE}/subscriptions/${id}`, { status });
            fetchData();
            toast.success(`Subscription marked as ${status}`);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteSubscription = async (id) => {
        if (!window.confirm('Are you sure you want to delete this request?')) return;
        try {
            await axios.delete(`${API_BASE}/subscriptions/${id}`);
            fetchData();
            toast.success('Request deleted');
        } catch (err) {
            toast.error('Failed to delete request');
        }
    };

    return (
        <div className="animate-fade-in grid" style={{ gap: '2rem' }}>
            {/* Proof Modal */}
            {viewProof && (
                <div onClick={() => setViewProof(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
                    <div className="glass-card" style={{ padding: '1rem', maxWidth: '80%', maxHeight: '80%' }}>
                        <img src={viewProof} alt="Proof" style={{ width: '100%', maxHeight: '70vh', borderRadius: '8px' }} />
                    </div>
                </div>
            )}

            {/* Pay Receipt Modal */}
            {payReceipt && (
                <div onClick={() => setPayReceipt(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div onClick={e => e.stopPropagation()} className="glass-card" style={{ width: '360px', padding: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🧾</div>
                        <h3 style={{ marginBottom: '0.25rem' }}>Payment Receipt</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>ফুড ক্যাটারিং বরিশাল</p>
                        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1rem', textAlign: 'left', marginBottom: '1.5rem' }}>
                            {[
                                ['Rider', payReceipt.riderDisplayName || payReceipt.riderName],
                                ['Amount', `৳ ${payReceipt.amount}`],
                                ['Date', payReceipt.date],
                                ['Ref #', payReceipt._id ? payReceipt._id.slice(-8).toUpperCase() : '—'],
                            ].map(([label, val]) => (
                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</span>
                                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{val}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => window.print()} className="btn-primary" style={{ flex: 1 }}>🖨️ Print</button>
                            <button onClick={() => setPayReceipt(null)} className="btn-outline" style={{ flex: 1 }}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Tab Navigation */}
            {/* Admin Tab Navigation */}
            <nav className="flex" style={{ gap: '0.5rem', background: 'var(--glass-bg)', padding: '0.5rem', borderRadius: '12px', flexWrap: 'wrap' }}>
                {[
                    { key: 'overview',      label: 'Overview' },
                    { key: 'users',         label: '👥 Users' },
                    { key: 'menu',          label: 'Menu' },
                    { key: 'riders',        label: 'Riders' },
                    { key: 'orders',        label: 'Orders' },
                    { key: 'payments',      label: 'TopUp Requests' },
                    { key: 'subscriptions', label: 'Membership' },
                ].map(({ key, label }) => (
                    <button
                        key={key}
                        className={activeTab === key ? 'btn-primary' : 'btn-outline'}
                        onClick={() => setActiveTab(key)}
                        style={{ padding: '0.6rem 1.2rem', border: activeTab === key ? 'none' : '1px solid var(--glass-border)' }}
                    >
                        {label}
                    </button>
                ))}
            </nav>
            {activeTab === 'overview' && (
                <div className="grid" style={{ gap: '2rem' }}>
                    <section className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <div className="glass-card" style={{ textAlign: 'center', borderColor: 'var(--primary)' }}>
                            <p style={{ color: 'var(--text-muted)' }}>💰 মোট আয়</p>
                            <h2 style={{ color: 'var(--primary)' }}>৳ {totalRevenue.toFixed(2)}</h2>
                        </div>
                        <div className="glass-card" style={{ textAlign: 'center', borderColor: 'var(--secondary)' }}>
                            <p style={{ color: 'var(--text-muted)' }}>📦 মোট অর্ডার</p>
                            <h2 style={{ color: 'var(--secondary)' }}>{totalOrdersCount}</h2>
                        </div>
                        <div className="glass-card" style={{ textAlign: 'center', borderColor: '#8b5cf6' }}>
                            <p style={{ color: 'var(--text-muted)' }}>👥 কাস্টমার</p>
                            <h2 style={{ color: '#a78bfa' }}>{uniqueCustomers}</h2>
                        </div>
                    </section>

                    <section className="glass-card">
                        <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>📅 আজকের অর্ডারসমূহ</h3>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="grid" style={{ gap: '1rem', marginTop: '1rem' }}>
                            {filteredOrders
                                .filter(o => {
                                    const isToday = new Date(getTimestamp(o)).toDateString() === new Date().toDateString();
                                    return isToday && o.status !== 'Delivered';
                                })
                                .length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>আজকের জন্য কোনো পেন্ডিং অর্ডার নেই! ✨</p>
                            ) : (
                                filteredOrders
                                    .filter(o => {
                                        const isToday = new Date(getTimestamp(o)).toDateString() === new Date().toDateString();
                                        return isToday && o.status !== 'Delivered';
                                    })
                                    .map(order => (
                                        <div key={order._id || order.id} className="glass-card" style={{ padding: '0.8rem', borderLeft: `4px solid ${order.status === 'Assigned' ? 'var(--primary)' : 'var(--secondary)'}` }}>
                                            <div className="flex" style={{ justifyContent: 'space-between' }}>
                                                <div>
                                                    <span style={{ fontWeight: 'bold' }}>{order.customerName}</span>
                                                    <span style={{ marginLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.type.toUpperCase()}</span>
                                                </div>
                                                <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(255,255,255,0.05)' }}>
                                                    {order.status || 'Paid'}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>{order.items.join(', ')}</p>
                                            {!order.assignedRider && (
                                                <div className="flex" style={{ marginTop: '0.8rem', gap: '0.5rem' }}>
                                                    <select
                                                        onChange={e => assignRider(order._id || order.id, e.target.value)}
                                                        style={{ fontSize: '0.75rem', padding: '0.2rem' }}
                                                    >
                                                        <option value="">Assign Rider</option>
                                                        {riders.map(r => <option key={r._id || r.id} value={r.username}>{r.name}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    ))
                            )}
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'menu' && (
                <div className="grid" style={{ gap: '2rem' }}>
                    <section className="glass-card">
                        <h3>➕ নতুন খাবার যোগ করুন</h3>
                        <form onSubmit={addDish} className="grid" style={{ gridTemplateColumns: '1fr 100px 150px 50px 120px', gap: '1rem', marginTop: '1.5rem' }}>
                            <input type="text" placeholder="খাবারের নাম" value={itemName} onChange={e => setItemName(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0.5rem' }} />
                            <input type="number" placeholder="মূল্য" value={itemPrice} onChange={e => setItemPrice(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0.5rem' }} />
                            <select value={itemCategory} onChange={e => setItemCategory(e.target.value)} style={{ padding: '0.5rem' }}>
                                <option value="lunch">লাঞ্চ (দুপুর)</option>
                                <option value="dinner">ডিনার (রাত)</option>
                            </select>
                            <input type="text" value={itemIcon} onChange={e => setItemIcon(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0.5rem', textAlign: 'center' }} />
                            <button type="submit" className="btn-primary">খাবার যোগ করুন</button>
                        </form>
                    </section>

                    <section className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {['lunch', 'dinner'].map(cat => (
                            <div key={cat} className="glass-card">
                                <h3 style={{ textTransform: 'capitalize' }}>{cat === 'lunch' ? 'লাঞ্চ' : 'ডিনার'} মেনু</h3>
                                <div className="grid" style={{ gap: '0.5rem', marginTop: '1rem' }}>
                                    {menu[cat].map(item => (
                                        <div key={item._id || item.id} className="flex" style={{ justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <span>{item.icon} {item.name} (৳{item.price})</span>
                                            <button onClick={() => removeDish(item._id || item.id, cat)} style={{ color: '#ef4444', background: 'none' }}>মুছে ফেলুন</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </section>
                </div>
            )}

            {activeTab === 'riders' && (
                <section className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className="glass-card">
                        <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>🛵 রাইডার তালিকা</h3>
                            <form onSubmit={addRider} className="flex" style={{ gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="রাইডারের নাম"
                                    value={newRiderName}
                                    onChange={e => setNewRiderName(e.target.value)}
                                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0.4rem', borderRadius: '4px', fontSize: '0.8rem' }}
                                />
                                <button type="submit" className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>যোগ করুন</button>
                            </form>
                        </div>
                        <div className="grid" style={{ gap: '0.5rem', marginTop: '1rem' }}>
                            {riders.map(r => {
                                const s = getRiderStats(r);
                                return (
                                    <div key={r._id || r.id} className="glass-card" style={{ padding: '0.8rem' }}>
                                        <div className="flex" style={{ justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: 'bold' }}>{r.name}</span>
                                            <span style={{ color: 'var(--primary)' }}>Pend: ₹{s.pending}</span>
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Earned: ₹{s.earned} | Paid: ₹{s.paid}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="glass-card">
                        <h3>💸 রাইডারকে পেমেন্ট করুন</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!selectedRiderForPay || !payAmount) return;
                            try {
                                const riderObj = riders.find(r => r.username === selectedRiderForPay);
                                const paymentData = {
                                    riderName: selectedRiderForPay,
                                    riderDisplayName: riderObj?.name || selectedRiderForPay,
                                    amount: parseFloat(payAmount),
                                    date: new Date().toLocaleDateString('en-GB'),
                                    timestamp: new Date().toISOString(),
                                };
                                const res = await axios.post(`${API_BASE}/payments`, paymentData);
                                fetchData();
                                setPayAmount('');
                                setPayReceipt({ ...paymentData, _id: res.data._id });
                                toast.success('পেমেন্ট সফল হয়েছে! 💸');
                            } catch (err) {
                                toast.error('পেমেন্ট রেকর্ড করা সম্ভব হয়নি');
                            }
                        }} className="grid" style={{ gap: '1rem', marginTop: '1.5rem' }}>
                            <select value={selectedRiderForPay} onChange={e => setSelectedRiderForPay(e.target.value)} style={{ padding: '0.5rem' }}>
                                <option value="">রাইডার নির্বাচন করুন</option>
                                {riders.map(r => <option key={r._id || r.id} value={r.username}>{r.name}</option>)}
                            </select>
                            <input type="number" placeholder="টাকার পরিমাণ" value={payAmount} onChange={e => setPayAmount(e.target.value)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem' }} />
                            <button type="submit" className="btn-primary">পেমেন্ট নিশ্চিত করুন</button>
                        </form>
                    </div>
                </section>
            )}

            {activeTab === 'users' && (
                <div className="grid" style={{ gap: '2rem' }}>
                    {/* Add User */}
                    <section className="glass-card">
                        <h3 style={{ marginBottom: '1.5rem' }}>➕ Add User Manually</h3>
                        <form onSubmit={addUser}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Username</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. karim_hossain"
                                        value={newUserUsername}
                                        onChange={e => setNewUserUsername(e.target.value)}
                                        required
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Email</label>
                                    <input
                                        type="email"
                                        placeholder="e.g. karim@example.com"
                                        value={newUserEmail}
                                        onChange={e => setNewUserEmail(e.target.value)}
                                        required
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Min. 6 characters"
                                            value={newUserPassword}
                                            onChange={e => setNewUserPassword(e.target.value)}
                                            required
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.6rem 2.4rem 0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(p => !p)}
                                            style={{ position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
                                        >
                                            {showPassword ? '🙈' : '👁️'}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Role</label>
                                    <select
                                        value={newUserRole}
                                        onChange={e => setNewUserRole(e.target.value)}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.6rem 0.8rem', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="rider">Rider</option>
                                        <option value="kitchen">Kitchen</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" disabled={addUserLoading} style={{ padding: '0.6rem 1.8rem' }}>
                                {addUserLoading ? 'Adding...' : 'Add User'}
                            </button>
                        </form>
                    </section>

                    {/* User List */}
                    <section className="glass-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                            <h3>All Users <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>({users.length} total)</span></h3>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={userSearch}
                                    onChange={e => setUserSearch(e.target.value)}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.45rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', width: '180px' }}
                                />
                                <select
                                    value={userRoleFilter}
                                    onChange={e => setUserRoleFilter(e.target.value)}
                                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.45rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem' }}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="customer">Customer</option>
                                    <option value="rider">Rider</option>
                                    <option value="kitchen">Kitchen</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <button onClick={fetchUsers} className="btn-outline" style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem' }}>↻ Refresh</button>
                            </div>
                        </div>

                        {/* Role Summary Pills */}
                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            {['admin', 'kitchen', 'rider', 'customer'].map(role => {
                                const count = users.filter(u => u.role === role).length;
                                const { bg, color } = ROLE_COLORS[role];
                                return (
                                    <span key={role} onClick={() => setUserRoleFilter(userRoleFilter === role ? 'all' : role)} style={{ background: bg, color, padding: '0.3rem 0.9rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', textTransform: 'capitalize', border: `1px solid ${color}40` }}>
                                        {role} · {count}
                                    </span>
                                );
                            })}
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        <th style={{ padding: '0.7rem 1rem' }}>User ID</th>
                                        <th style={{ padding: '0.7rem 1rem' }}>Name</th>
                                        <th style={{ padding: '0.7rem 1rem' }}>Phone</th>
                                        <th style={{ padding: '0.7rem 1rem' }}>Balance</th>
                                        <th style={{ padding: '0.7rem 1rem' }}>Current Role</th>
                                        <th style={{ padding: '0.7rem 1rem' }}>Change Role</th>
                                        <th style={{ padding: '0.7rem 1rem' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users
                                        .filter(u => userRoleFilter === 'all' || u.role === userRoleFilter)
                                        .filter(u => !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()))
                                        .map(u => {
                                            const { bg, color } = ROLE_COLORS[u.role] || ROLE_COLORS.customer;
                                            return (
                                                <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                    <td style={{ padding: '0.8rem 1rem' }}>
                                                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--primary)', background: 'rgba(235, 94, 40, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid rgba(235, 94, 40, 0.2)' }}>
                                                            {u.customId || '—'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.8rem 1rem' }}>
                                                        <div style={{ fontWeight: '600' }}>{u.name}</div>
                                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{u.address || '—'}</div>
                                                    </td>
                                                    <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.phone || '—'}</td>
                                                    <td style={{ padding: '0.8rem 1rem', color: 'var(--primary)', fontWeight: '700' }}>৳ {(u.balance || 0).toFixed(0)}</td>
                                                    <td style={{ padding: '0.8rem 1rem' }}>
                                                        <span style={{ background: bg, color, padding: '0.25rem 0.7rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'capitalize' }}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.8rem 1rem' }}>
                                                        <select
                                                            value={u.role}
                                                            onChange={e => changeRole(u.username, e.target.value)}
                                                            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid var(--glass-border)', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                                                        >
                                                            <option value="customer">Customer</option>
                                                            <option value="rider">Rider</option>
                                                            <option value="kitchen">Kitchen</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '0.8rem 1rem' }}>
                                                        <button
                                                            onClick={() => deleteUser(u.username, u.name)}
                                                            style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.3rem 0.7rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    {users.filter(u => userRoleFilter === 'all' || u.role === userRoleFilter).filter(u => !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase())).length === 0 && (
                                        <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'orders' && <OrderHistorySection filteredOrders={filteredOrders} assignRider={assignRider} riders={riders} setViewProof={setViewProof} getRiderDisplayName={getRiderDisplayName} />}

            {activeTab === 'payments' && (
                <section className="glass-card">
                    <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3 style={{ margin: 0 }}>🏦 বিকাশ টপ-আপ রিকোয়েস্ট</h3>
                        <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{topUpRequests.filter(r => r.status === 'Pending').length} পেন্ডিং</span>
                            <button onClick={() => fetchData()} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>🔄 Refresh</button>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '0.8rem' }}>তারিখ/সময়</th>
                                    <th style={{ padding: '0.8rem' }}>কাস্টমার</th>
                                    <th style={{ padding: '0.8rem' }}>পরিমাণ</th>
                                    <th style={{ padding: '0.8rem' }}>প্রেরক নম্বর</th>
                                    <th style={{ padding: '0.8rem' }}>প্রমাণ (Screenshot)</th>
                                    <th style={{ padding: '0.8rem' }}>অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topUpRequests.length === 0 && (
                                    <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>কোনো টপ-আপ রিকোয়েস্ট পাওয়া যায়নি।</td></tr>
                                )}
                                {topUpRequests.map(req => {
                                    return (
                                        <tr key={req._id || req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: '0.8rem', fontSize: '0.8rem' }}>
                                                <div>{req.timestamp ? new Date(req.timestamp).toLocaleDateString('en-GB') : '—'}</div>
                                                <div style={{ color: 'var(--text-muted)' }}>{req.timestamp ? new Date(req.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                                            </td>
                                            <td style={{ padding: '0.8rem' }}>
                                                <div style={{ fontWeight: 'bold' }}>{req.username}</div>
                                            </td>
                                            <td style={{ padding: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>৳ {req.amount}</td>
                                            <td style={{ padding: '0.8rem' }}>{req.senderPhone}</td>
                                            <td style={{ padding: '0.8rem' }}>
                                                <button onClick={() => setViewProof(req.screenshot)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}>👁️ View</button>
                                            </td>
                                            <td style={{ padding: '0.8rem' }}>
                                                {req.status === 'Pending' ? (
                                                    <div className="flex" style={{ gap: '0.5rem' }}>
                                                        <button onClick={() => handleApproveTopUp(req)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>গ্রহণ করুন</button>
                                                        <button onClick={() => handleRejectTopUp(req._id || req.id)} style={{ background: 'none', color: '#ef4444', border: '1px solid #ef4444', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem' }}>প্রত্যাখ্যান</button>
                                                    </div>
                                                ) : (
                                                    <span style={{
                                                        padding: '0.3rem 0.6rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.75rem',
                                                        background: req.status === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                        color: req.status === 'Approved' ? '#10b981' : '#ef4444'
                                                    }}>
                                                        {req.status === 'Approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {activeTab === 'subscriptions' && (
                <section className="glass-card">
                    <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3>💎 মেম্বারশিপ রিকোয়েস্ট</h3>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{subscriptionRequests.length}টি রিকোয়েস্ট পাওয়া গেছে</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '0.8rem' }}>তারিখ</th>
                                    <th style={{ padding: '0.8rem' }}>কাস্টমার</th>
                                    <th style={{ padding: '0.8rem' }}>ফোন</th>
                                    <th style={{ padding: '0.8rem' }}>প্যাকেজ</th>
                                    <th style={{ padding: '0.8rem' }}>স্ট্যাটাস</th>
                                    <th style={{ padding: '0.8rem' }}>অ্যাকশন</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptionRequests.length === 0 && (
                                    <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>এখনো কোনো মেম্বারশিপ রিকোয়েস্ট নেই।</td></tr>
                                )}
                                {subscriptionRequests.map(req => (
                                    <tr key={req._id || req.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '0.8rem', fontSize: '0.85rem' }}>{new Date(req.timestamp).toLocaleDateString()}</td>
                                        <td style={{ padding: '0.8rem', fontWeight: 'bold' }}>{req.name}</td>
                                        <td style={{ padding: '0.8rem' }}>{req.phone}</td>
                                        <td style={{ padding: '0.8rem' }}>
                                            <span style={{ 
                                                padding: '0.2rem 0.6rem', 
                                                borderRadius: '4px', 
                                                fontSize: '0.75rem',
                                                background: req.package === 'monthly' ? 'rgba(249, 115, 22, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                                color: req.package === 'monthly' ? 'var(--primary)' : 'var(--secondary)'
                                            }}>
                                                {req.package === 'monthly' ? 'মাসিক' : 'সাপ্তাহিক'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.8rem' }}>
                                            <span style={{
                                                padding: '0.3rem 0.6rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                background: req.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : req.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                                                color: req.status === 'Approved' ? '#10b981' : req.status === 'Rejected' ? '#ef4444' : 'white'
                                            }}>
                                                {req.status === 'Approved' ? 'অনুমোদিত' : req.status === 'Rejected' ? 'প্রত্যাখ্যাত' : 'পেন্ডিং'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.8rem' }}>
                                            <div className="flex" style={{ gap: '0.5rem' }}>
                                                {req.status === 'Pending' && (
                                                    <>
                                                        <button onClick={() => handleUpdateSubscriptionStatus(req._id || req.id, 'Approved')} className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Approve</button>
                                                        <button onClick={() => handleUpdateSubscriptionStatus(req._id || req.id, 'Rejected')} style={{ background: 'none', color: '#ef4444', border: '1px solid #ef4444', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem' }}>Reject</button>
                                                    </>
                                                )}
                                                <button onClick={() => handleDeleteSubscription(req._id || req.id)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
};

// Sub-component for better state management of pagination
const OrderHistorySection = ({ filteredOrders, assignRider, riders, setViewProof, getRiderDisplayName }) => {
    const ITEMS_PER_PAGE = 10;
    const [currentPage, setCurrentPage] = useState(1);

    // Reset page when filters change (detected via filteredOrders length change or simply prop change)
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filteredOrders.length]);

    const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    return (
        <section className="glass-card">
            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
                <div>
                    <h3>📦 অর্ডার হিস্ট্রি</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        মোট {filteredOrders.length}টি রেকর্ডের মধ্যে {filteredOrders.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)}টি দেখানো হচ্ছে
                    </p>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                            <th style={{ padding: '0.8rem' }}>তারিখ/সময়</th>
                            <th style={{ padding: '0.8rem' }}>কাস্টমার</th>
                            <th style={{ padding: '0.8rem' }}>বিবরণ</th>
                            <th style={{ padding: '0.8rem' }}>রাইডার / প্রমাণ</th>
                            <th style={{ padding: '0.8rem' }}>মোট টাকা</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentOrders.map(order => (
                            <tr key={order._id || order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '0.8rem', fontSize: '0.8rem' }}>
                                    <div>{order.date}</div>
                                    <div style={{ color: 'var(--text-muted)' }}>{order.time}</div>
                                </td>
                                <td style={{ padding: '0.8rem' }}>
                                    <div style={{ fontWeight: 'bold' }}>{order.customerName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerPhone}</div>
                                </td>
                                <td style={{ padding: '0.8rem' }}>
                                    <div style={{ fontWeight: '600', fontSize: '0.8rem' }}>{order.type === 'lunch' ? 'লাঞ্চ' : 'ডিনার'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.items.join(', ')}</div>
                                </td>
                                <td style={{ padding: '0.8rem' }}>
                                    <div className="flex" style={{ gap: '0.5rem', alignItems: 'center' }}>
                                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', background: order.status === 'Delivered' ? 'var(--primary)' : 'var(--secondary)' }}>
                                            {order.status === 'Delivered' ? 'ডেলিভারড' : order.status === 'Assigned' ? 'রাইডার নির্ধারিত' : 'প্রক্রিয়াধীন'}
                                        </span>
                                        {order.assignedRider && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>👤 {getRiderDisplayName(order.assignedRider)}</span>}
                                        {order.deliveryProof && <button onClick={() => setViewProof(order.deliveryProof)} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>🖼️ Proof</button>}
                                        {!order.assignedRider && (
                                            <select onChange={e => assignRider(order._id || order.id, e.target.value)} style={{ fontSize: '0.7rem' }}>
                                                <option value="">নির্ধারণ</option>
                                                {riders.map(r => <option key={r._id || r.id} value={r.username}>{r.name}</option>)}
                                            </select>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: '0.8rem', fontWeight: 'bold' }}>৳ {order.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex" style={{ justifyContent: 'center', marginTop: '2rem', gap: '0.5rem' }}>
                    <button
                        className="btn-outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        style={{ padding: '0.4rem 0.8rem', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        ◀ Prev
                    </button>

                    {/* Show limited page numbers if many */}
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i + 1}
                            className={currentPage === i + 1 ? 'btn-primary' : 'btn-outline'}
                            onClick={() => setCurrentPage(i + 1)}
                            style={{ padding: '0.4rem 0.8rem', border: currentPage === i + 1 ? 'none' : '1px solid var(--glass-border)' }}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        className="btn-outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        style={{ padding: '0.4rem 0.8rem', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        Next ▶
                    </button>
                </div>
            )}
        </section>
    );
};

export default AdminDashboard;
