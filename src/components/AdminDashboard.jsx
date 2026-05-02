import React, { useState } from 'react';
import axios from 'axios';
import toast from '../utils/toast';

import API_BASE from '../api';

const AdminDashboard = ({ menu, setMenu, orderHistory, setOrderHistory, payments, setPayments, topUpRequests, setTopUpRequests, subscriptionRequests, setSubscriptionRequests, fetchData }) => {
    const [activeTab, setActiveTab] = useState('overview');

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

    // Filtering state
    const [filterType, setFilterType] = useState('all'); // all, 7d, 30d, 1y, custom
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const riders = menu.riders || [];

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

    const getRiderStats = (name) => {
        const deliveredCount = orderHistory.filter(o => o.assignedRider === name && o.status === 'Delivered').length;
        const earned = deliveredCount * 30;
        const paid = payments.filter(p => p.riderName === name).reduce((sum, p) => sum + p.amount, 0);
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

            {/* Admin Tab Navigation */}
            <nav className="flex" style={{ gap: '1rem', background: 'var(--glass-bg)', padding: '0.5rem', borderRadius: '12px' }}>
                {['overview', 'menu', 'riders', 'orders', 'payments', 'subscriptions'].map(tab => (
                    <button
                        key={tab}
                        className={activeTab === tab ? 'btn-primary' : 'btn-outline'}
                        onClick={() => setActiveTab(tab)}
                        style={{ padding: '0.6rem 1.2rem', textTransform: 'capitalize', border: activeTab === tab ? 'none' : '1px solid var(--glass-border)' }}
                    >
                        {tab === 'overview' ? 'ওভারভিউ' : 
                         tab === 'menu' ? 'মেনু' : 
                         tab === 'riders' ? 'রাইডার' : 
                         tab === 'orders' ? 'অর্ডারসমূহ' : 
                         tab === 'payments' ? 'টপ-আপ রিকোয়েস্ট' : 
                         tab === 'subscriptions' ? 'মেম্বারশিপ' : tab}
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
                                                        style={{ background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.75rem', padding: '0.2rem' }}
                                                    >
                                                        <option value="">Assign Rider</option>
                                                        {riders.map(r => <option key={r._id || r.id} value={r.name}>{r.name}</option>)}
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
                            <select value={itemCategory} onChange={e => setItemCategory(e.target.value)} style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0.5rem' }}>
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
                                const s = getRiderStats(r.name);
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
                                await axios.post(`${API_BASE}/payments`, {
                                    riderName: selectedRiderForPay,
                                    amount: parseFloat(payAmount),
                                    date: new Date().toLocaleDateString()
                                });
                                fetchData();
                                setPayAmount('');
                                toast.success('পেমেন্ট সফল হয়েছে! 💸');
                            } catch (err) {
                                toast.error('পেমেন্ট রেকর্ড করা সম্ভব হয়নি');
                            }
                        }} className="grid" style={{ gap: '1rem', marginTop: '1.5rem' }}>
                            <select value={selectedRiderForPay} onChange={e => setSelectedRiderForPay(e.target.value)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem' }}>
                                <option value="">রাইডার নির্বাচন করুন</option>
                                {riders.map(r => <option key={r._id || r.id} value={r.name}>{r.name}</option>)}
                            </select>
                            <input type="number" placeholder="টাকার পরিমাণ" value={payAmount} onChange={e => setPayAmount(e.target.value)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.5rem' }} />
                            <button type="submit" className="btn-primary">পেমেন্ট নিশ্চিত করুন</button>
                        </form>
                    </div>
                </section>
            )}

            {activeTab === 'orders' && <OrderHistorySection filteredOrders={filteredOrders} assignRider={assignRider} riders={riders} setViewProof={setViewProof} />}

            {activeTab === 'payments' && (
                <section className="glass-card">
                    <h3>🏦 বিকাশ টপ-আপ রিকোয়েস্ট</h3>
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
                                                <div>{req.date}</div>
                                                <div style={{ color: 'var(--text-muted)' }}>{req.time}</div>
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
const OrderHistorySection = ({ filteredOrders, assignRider, riders, setViewProof }) => {
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
                                        {order.assignedRider && <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>👤 {order.assignedRider}</span>}
                                        {order.deliveryProof && <button onClick={() => setViewProof(order.deliveryProof)} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>🖼️ Proof</button>}
                                        {!order.assignedRider && (
                                            <select onChange={e => assignRider(order._id || order.id, e.target.value)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.7rem' }}>
                                                <option value="">নির্ধারণ</option>
                                                {riders.map(r => <option key={r._id || r.id} value={r.name}>{r.name}</option>)}
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
