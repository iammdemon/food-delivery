import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE from '../api';

const STATUS_MAP = {
    Delivered: { label: 'ডেলিভারড', color: 'var(--primary)' },
    Assigned: { label: 'রাইডার নির্ধারিত', color: 'var(--secondary)' },
    Paid: { label: 'পেমেন্ট হয়েছে', color: '#8b5cf6' },
    Preparing: { label: 'প্রস্তুত হচ্ছে', color: '#f59e0b' },
    Confirmed: { label: 'নিশ্চিত', color: '#10b981' },
    'Sent For Delivery': { label: 'ডেলিভারিতে', color: '#3b82f6' },
    Cancelled: { label: 'বাতিল', color: '#ef4444' },
};

const ReceiptModal = ({ order, onClose }) => {
    const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: 'white' };
    const date = order.timestamp ? new Date(order.timestamp).toLocaleString('en-GB') : '—';

    return (
        <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={e => e.stopPropagation()} className="glass-card" style={{ width: '360px', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px dashed rgba(255,255,255,0.15)', paddingBottom: '1rem' }}>
                    <div style={{ fontSize: '2.5rem' }}>🧾</div>
                    <h3 style={{ margin: '0.25rem 0' }}>Order Receipt</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ফুড ক্যাটারিং বরিশাল</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
                    {[
                        ['Order ID', order._id ? order._id.slice(-8).toUpperCase() : '—'],
                        ['Date', date],
                        ['Type', order.type === 'lunch' ? 'লাঞ্চ' : 'ডিনার'],
                        ['Customer', order.customerName || '—'],
                    ].map(([label, val]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{label}</span>
                            <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{val}</span>
                        </div>
                    ))}
                    <div style={{ margin: '0.75rem 0 0.25rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>Items</div>
                    {(order.items || []).map((item, i) => (
                        <div key={i} style={{ fontSize: '0.85rem', padding: '0.2rem 0', color: 'rgba(255,255,255,0.85)' }}>• {item}</div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <span style={{ fontWeight: '700' }}>Total</span>
                        <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '1.1rem' }}>৳ {order.total}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Status</span>
                        <span style={{ color: statusInfo.color, fontWeight: '600', fontSize: '0.82rem' }}>{statusInfo.label}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => window.print()} className="btn-primary" style={{ flex: 1 }}>🖨️ Print</button>
                    <button onClick={onClose} className="btn-outline" style={{ flex: 1 }}>Close</button>
                </div>
            </div>
        </div>
    );
};

const CustomerDashboard = ({
    user,
    balance,
    activeTab,
    setActiveTab,
    setShowTopUpModal,
    lunchTime,
    dinnerTime,
    menu,
    selectedItems,
    toggleItem,
    placeOrder,
    myOrders,
    profile,
    onProfileUpdate,
    UserProfile,
}) => {
    const [receiptOrder, setReceiptOrder] = useState(null);
    const [topUpHistory, setTopUpHistory] = useState([]);
    const [txLoading, setTxLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'transactions' && user?.username) {
            setTxLoading(true);
            axios.get(`${API_BASE}/topup?userId=${user.username}`)
                .then(r => setTopUpHistory(r.data))
                .catch(() => {})
                .finally(() => setTxLoading(false));
        }
    }, [activeTab, user?.username]);

    if (activeTab === 'profile') {
        return <UserProfile profile={profile} onUpdate={onProfileUpdate} initialName={user.name} />;
    }

    if (activeTab === 'transactions') {
        const topUpTotal = topUpHistory.filter(t => t.status === 'Approved').reduce((s, t) => s + t.amount, 0);
        const orderTotal = myOrders.reduce((s, o) => s + (o.total || 0), 0);
        return (
            <div className="animate-fade-in grid" style={{ gap: '2rem' }}>
                {/* Summary Cards */}
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ textAlign: 'center', borderColor: 'var(--primary)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>💳 মোট রিচার্জ</p>
                        <h2 style={{ color: 'var(--primary)', margin: '0.4rem 0' }}>৳ {topUpTotal}</h2>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{topUpHistory.filter(t => t.status === 'Approved').length}টি অনুমোদিত</p>
                    </div>
                    <div className="glass-card" style={{ textAlign: 'center', borderColor: 'var(--secondary)' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>🛒 মোট অর্ডার খরচ</p>
                        <h2 style={{ color: 'var(--secondary)', margin: '0.4rem 0' }}>৳ {orderTotal}</h2>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{myOrders.length}টি অর্ডার</p>
                    </div>
                    <div className="glass-card" style={{ textAlign: 'center', borderColor: '#10b981' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>💰 বর্তমান ব্যালেন্স</p>
                        <h2 style={{ color: '#10b981', margin: '0.4rem 0' }}>৳ {balance.toFixed(2)}</h2>
                    </div>
                </div>

                {/* Order History */}
                <section className="glass-card">
                    <h3 style={{ marginBottom: '1.25rem' }}>🛒 অর্ডার ইতিহাস</h3>
                    {myOrders.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>কোনো অর্ডার নেই।</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>তারিখ</th>
                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>ধরন</th>
                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>আইটেম</th>
                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>মোট</th>
                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>স্ট্যাটাস</th>
                                        <th style={{ padding: '0.6rem 0.8rem' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myOrders.map(order => {
                                        const si = STATUS_MAP[order.status] || { label: order.status, color: 'white' };
                                        const dt = order.timestamp ? new Date(order.timestamp).toLocaleDateString('en-GB') : '—';
                                        return (
                                            <tr key={order._id || order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                                                <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>{dt}</td>
                                                <td style={{ padding: '0.6rem 0.8rem' }}>{order.type === 'lunch' ? 'লাঞ্চ' : 'ডিনার'}</td>
                                                <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>{(order.items || []).join(', ')}</td>
                                                <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', color: 'var(--primary)', fontWeight: '700' }}>৳ {order.total}</td>
                                                <td style={{ padding: '0.6rem 0.8rem' }}>
                                                    <span style={{ color: si.color, fontWeight: '600', fontSize: '0.78rem' }}>{si.label}</span>
                                                </td>
                                                <td style={{ padding: '0.6rem 0.8rem' }}>
                                                    <button onClick={() => setReceiptOrder(order)} style={{ background: 'rgba(235,94,40,0.1)', border: '1px solid rgba(235,94,40,0.3)', color: 'var(--primary)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                                        🧾 Receipt
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Top-Up History */}
                <section className="glass-card">
                    <h3 style={{ marginBottom: '1.25rem' }}>💳 টপ-আপ ইতিহাস</h3>
                    {txLoading ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>লোড হচ্ছে...</p>
                    ) : topUpHistory.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>কোনো টপ-আপ ইতিহাস নেই।</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '400px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>তারিখ</th>
                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>পরিমাণ</th>
                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>স্ট্যাটাস</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topUpHistory.map(t => {
                                        const tColor = t.status === 'Approved' ? '#10b981' : t.status === 'Rejected' ? '#ef4444' : '#f59e0b';
                                        const dt = t.timestamp ? new Date(t.timestamp).toLocaleDateString('en-GB') : '—';
                                        return (
                                            <tr key={t._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                                                <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>{dt}</td>
                                                <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', color: '#10b981', fontWeight: '700' }}>+ ৳ {t.amount}</td>
                                                <td style={{ padding: '0.6rem 0.8rem' }}>
                                                    <span style={{ color: tColor, fontWeight: '600', fontSize: '0.78rem' }}>
                                                        {t.status === 'Approved' ? 'অনুমোদিত' : t.status === 'Rejected' ? 'প্রত্যাখ্যাত' : 'অপেক্ষমাণ'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {receiptOrder && <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />}
            </div>
        );
    }

    return (
        <>
            {receiptOrder && <ReceiptModal order={receiptOrder} onClose={() => setReceiptOrder(null)} />}
            <main className="grid" style={{ gridTemplateColumns: '1fr 350px' }}>
                <section className="grid" style={{ gap: '2rem' }}>
                    {/* Lunch Section */}
                    <div className="glass-card">
                        <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2>🍱 দুপুরের লাঞ্চ</h2>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ডেডলাইন: সকাল ১০:০০</p>
                                <p style={{ color: lunchTime.isPastDeadline ? '#ef4444' : 'var(--primary)' }}>
                                    {lunchTime.isPastDeadline ? 'অর্ডার বন্ধ' : `সময় বাকি: ${lunchTime.timeLeft}`}
                                </p>
                            </div>
                        </div>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                            {menu.lunch.map(item => (
                                <div
                                    key={item._id || item.id}
                                    className={`glass-card ${selectedItems.find(i => (item._id && i._id === item._id) || (item.id && i.id === item.id)) ? 'selected' : ''}`}
                                    onClick={() => !lunchTime.isPastDeadline && toggleItem(item)}
                                    style={{
                                        padding: '1rem',
                                        cursor: lunchTime.isPastDeadline ? 'not-allowed' : 'pointer',
                                        opacity: lunchTime.isPastDeadline ? 0.6 : 1,
                                        border: selectedItems.find(i => (item._id && i._id === item._id) || (item.id && i.id === item.id)) ? '2px solid var(--primary)' : '1px solid var(--glass-border)'
                                    }}
                                >
                                    <span style={{ fontSize: '2rem' }}>{item.icon}</span>
                                    <h4 style={{ marginTop: '0.5rem' }}>{item.name}</h4>
                                    <p style={{ color: 'var(--secondary)', fontWeight: '700' }}>৳ {item.price}</p>
                                </div>
                            ))}
                        </div>
                        {!lunchTime.isPastDeadline && menu.lunch.length > 0 && (
                            <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => placeOrder('lunch')}>
                                লাঞ্চ অর্ডার দিন (৳ {selectedItems.filter(i => menu.lunch.some(l => (l._id || l.id) === (i._id || i.id))).reduce((s, i) => s + i.price, 0)})
                            </button>
                        )}
                    </div>

                    {/* Dinner Section */}
                    <div className="glass-card">
                        <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2>🌙 রাতের ডিনার</h2>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ডেডলাইন: বিকাল ০৫:০০</p>
                                <p style={{ color: dinnerTime.isPastDeadline ? '#ef4444' : 'var(--primary)' }}>
                                    {dinnerTime.isPastDeadline ? 'অর্ডার বন্ধ' : `সময় বাকি: ${dinnerTime.timeLeft}`}
                                </p>
                            </div>
                        </div>
                        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
                            {menu.dinner.map(item => (
                                <div
                                    key={item._id || item.id}
                                    className={`glass-card ${selectedItems.find(i => (item._id && i._id === item._id) || (item.id && i.id === item.id)) ? 'selected' : ''}`}
                                    onClick={() => !dinnerTime.isPastDeadline && toggleItem(item)}
                                    style={{
                                        padding: '1rem',
                                        cursor: dinnerTime.isPastDeadline ? 'not-allowed' : 'pointer',
                                        opacity: dinnerTime.isPastDeadline ? 0.6 : 1,
                                        border: selectedItems.find(i => (item._id && i._id === item._id) || (item.id && i.id === item.id)) ? '2px solid var(--primary)' : '1px solid var(--glass-border)'
                                    }}
                                >
                                    <span style={{ fontSize: '2rem' }}>{item.icon}</span>
                                    <h4 style={{ marginTop: '0.5rem' }}>{item.name}</h4>
                                    <p style={{ color: 'var(--secondary)', fontWeight: '700' }}>৳ {item.price}</p>
                                </div>
                            ))}
                        </div>
                        {!dinnerTime.isPastDeadline && menu.dinner.length > 0 && (
                            <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => placeOrder('dinner')}>
                                ডিনার অর্ডার দিন (৳ {selectedItems.filter(i => menu.dinner.some(l => (l._id || l.id) === (i._id || i.id))).reduce((s, i) => s + i.price, 0)})
                            </button>
                        )}
                    </div>
                </section>

                {/* Sidebar / Orders */}
                <aside className="grid" style={{ alignContent: 'start' }}>
                    <div className="glass-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>আমার অর্ডারসমূহ</h3>
                            <button onClick={() => setActiveTab('transactions')} style={{ fontSize: '0.75rem', background: 'rgba(235,94,40,0.1)', border: '1px solid rgba(235,94,40,0.3)', color: 'var(--primary)', padding: '0.25rem 0.6rem', borderRadius: '6px', cursor: 'pointer' }}>
                                সব দেখুন
                            </button>
                        </div>
                        <div className="grid" style={{ gap: '1rem' }}>
                            {myOrders.length === 0 && <p style={{ color: 'var(--text-muted)' }}>এখনো কোনো অর্ডার নেই।</p>}
                            {myOrders.map(order => (
                                <div key={order._id || order.id} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                                    <div className="flex" style={{ justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: '600' }}>{order.type === 'lunch' ? 'লাঞ্চ' : 'ডিনার'}</span>
                                        <span style={{ color: 'var(--secondary)' }}>৳ {order.total}</span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: (STATUS_MAP[order.status] || {}).color || 'var(--secondary)', marginBottom: '0.2rem' }}>
                                        {(STATUS_MAP[order.status] || { label: order.status }).label}
                                    </p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{(order.items || []).join(', ')}</p>
                                        <button onClick={() => setReceiptOrder(order)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.8rem', padding: '0', flexShrink: 0, marginLeft: '0.5rem' }}>
                                            🧾
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </main>
        </>
    );
};

export default CustomerDashboard;
