import React, { useState } from 'react';
import axios from 'axios';
import toast from '../utils/toast';

import API_BASE from '../api';

const PayReceiptModal = ({ payment, onClose }) => {
    const date = payment.timestamp
        ? new Date(payment.timestamp).toLocaleString('en-GB')
        : payment.date || '—';
    const ref = payment._id ? payment._id.slice(-8).toUpperCase() : '—';
    return (
        <div onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={e => e.stopPropagation()} className="glass-card" style={{ width: '340px', padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>💸</div>
                <h3 style={{ marginBottom: '0.2rem' }}>Payment Receipt</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>ফুড ক্যাটারিং বরিশাল</p>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1rem', textAlign: 'left', marginBottom: '1.5rem' }}>
                    {[
                        ['Rider', payment.riderDisplayName || payment.riderName],
                        ['Amount', `৳ ${payment.amount}`],
                        ['Date', date],
                        ['Ref #', ref],
                    ].map(([label, val]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</span>
                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{val}</span>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => window.print()} className="btn-primary" style={{ flex: 1 }}>🖨️ Print</button>
                    <button onClick={onClose} className="btn-outline" style={{ flex: 1 }}>Close</button>
                </div>
            </div>
        </div>
    );
};

const RiderDashboard = ({ riderId, username, orderHistory, setOrderHistory, payments, fetchData }) => {
    const [deliveryPhotos, setDeliveryPhotos] = useState({});
    const [isCompleting, setIsCompleting] = useState({});
    const [payReceipt, setPayReceipt] = useState(null);

    // Helper to normalize strings (lowercase, alphanumeric only) for robust matching
    const normalize = (str) => {
        if (!str) return '';
        return str.toLowerCase().replace(/[^a-z0-9]/g, '');
    };

    const normRiderId = normalize(riderId);
    const normUsername = normalize(username);

    // Matches order.assignedRider against either the secure riderId (unique UID/username) or their display name
    const assignedOrders = orderHistory.filter(order => {
        const normAssigned = normalize(order.assignedRider);
        return normAssigned === normRiderId || normAssigned === normUsername;
    });

    // Commission Calculations
    const deliveredOrders = assignedOrders.filter(o => o.status === 'Delivered');
    const totalEarned = deliveredOrders.length * 30;
    const totalPaid = payments.filter(p => {
        const normPayRider = normalize(p.riderName);
        return normPayRider === normRiderId || normPayRider === normUsername;
    }).reduce((sum, p) => sum + p.amount, 0);
    const pendingBalance = totalEarned - totalPaid;

    const handleFileChange = (orderId, e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDeliveryPhotos(prev => ({ ...prev, [orderId]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Helper to compress image before saving to Base64
    const compressImage = (base64Str, maxWidth = 800) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality
            };
        });
    };

    const markAsDelivered = async (orderId, proofImg) => {
        if (!proofImg) return toast.error('Please upload a delivery photo first!');
        if (isCompleting[orderId]) return;

        setIsCompleting(prev => ({ ...prev, [orderId]: true }));
        try {
            // Compress the image to save space
            const compressedImg = await compressImage(proofImg);

            await axios.patch(`${API_BASE}/orders/${orderId}`, {
                status: 'Delivered',
                deliveryProof: compressedImg
            });

            await fetchData();

            // Clear local states
            setDeliveryPhotos(prev => {
                const newState = { ...prev };
                delete newState[orderId];
                return newState;
            });
            setIsCompleting(prev => {
                const newState = { ...prev };
                delete newState[orderId];
                return newState;
            });

            toast.success('Delivery completed successfully! 🚚✅');
        } catch (error) {
            console.error('Delivery failure:', error);
            setIsCompleting(prev => ({ ...prev, [orderId]: false }));
            toast.error('Error completing delivery. Check server connection.');
        }
    };

    return (
        <div className="animate-fade-in grid" style={{ gap: '2rem' }}>
            {/* Earnings Summary Card */}
            <section className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div className="glass-card" style={{ textAlign: 'center', borderColor: 'var(--primary)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>💰 মোট আয়</p>
                    <h2 style={{ color: 'var(--primary)', margin: '0.5rem 0' }}>৳ {totalEarned}</h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{deliveredOrders.length}টি ডেলিভারি x ৩০টাকা</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', borderColor: '#ef4444' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>💸 অলরেডি পেইড</p>
                    <h2 style={{ color: '#ef4444', margin: '0.5rem 0' }}>৳ {totalPaid}</h2>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', borderColor: 'var(--secondary)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>⏳ বকেয়া পেমেন্ট</p>
                    <h2 style={{ color: 'var(--secondary)', margin: '0.5rem 0' }}>৳ {pendingBalance}</h2>
                </div>
            </section>

            <header className="glass-card" style={{ borderColor: 'var(--primary)' }}>
                <h2>🚚 আমার নির্ধারিত ডেলিভারি</h2>
                <p style={{ color: 'var(--text-muted)' }}>ডেলিভারি সম্পন্ন করতে ছবি আপলোড করুন</p>
            </header>

            <section className="grid" style={{ gap: '1.5rem' }}>
                {assignedOrders.length === 0 && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <span style={{ fontSize: '3rem' }}>📭</span>
                        <h3>এখনো কোনো অর্ডার নির্ধারিত হয়নি।</h3>
                    </div>
                )}

                {assignedOrders.map(order => {
                    const orderId = order._id || order.id;
                    return (
                        <div key={orderId} className="glass-card" style={{ borderColor: order.status === 'Delivered' ? 'rgba(5, 150, 105, 0.3)' : 'var(--secondary)' }}>
                            <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div>
                                    <span style={{
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        background: order.status === 'Delivered' ? 'var(--primary)' : 'var(--secondary)',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}>
                                        {order.status === 'Delivered' ? 'ডেলিভারড' : 'পেইড'}
                                    </span>
                                    <span style={{ marginLeft: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {order.date} {order.time}
                                    </span>
                                </div>
                                <h3 style={{ color: 'var(--secondary)' }}>বিল: ৳ {order.total}</h3>
                            </div>

                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>👤 কাস্টমার ডিটেইলস</h4>
                                    <p style={{ fontWeight: 'bold' }}>{order.customerName}</p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>📞 {order.customerPhone}</p>
                                    <div style={{ marginTop: '1rem' }}>
                                        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>📍 ডেলিভারি ঠিকানা</h4>
                                        <p style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{order.customerAddress}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>📸 ডেলিভারি প্রুফ</h4>
                                    {order.status === 'Delivered' ? (
                                        <div style={{ position: 'relative', width: '100%', height: '150px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                            <img src={order.deliveryProof} alt="Proof" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ) : (
                                        <div className="grid" style={{ gap: '1rem' }}>
                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: '150px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '2px dashed var(--glass-border)',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    overflow: 'hidden',
                                                    position: 'relative'
                                                }}
                                            >
                                                {deliveryPhotos[orderId] ? (
                                                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                                        <img src={deliveryPhotos[orderId]} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        <div style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>✓</div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeliveryPhotos(prev => {
                                                                    const s = { ...prev };
                                                                    delete s[orderId];
                                                                    return s;
                                                                });
                                                            }}
                                                            style={{ position: 'absolute', bottom: '5px', right: '5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 6px', fontSize: '10px' }}
                                                        >Remove</button>
                                                    </div>
                                                ) : (
                                                    <div style={{ textAlign: 'center' }}>
                                                        <span style={{ fontSize: '2rem' }}>📷</span>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tap to Upload Photo</p>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    onChange={(e) => handleFileChange(orderId, e)}
                                                    style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                                                />
                                            </div>
                                            {deliveryPhotos[orderId] && (
                                                <button
                                                    className="btn-primary"
                                                    onClick={() => markAsDelivered(orderId, deliveryPhotos[orderId])}
                                                    disabled={isCompleting[orderId]}
                                                    style={{
                                                        width: '100%',
                                                        padding: '1rem',
                                                        marginTop: '1rem',
                                                        fontWeight: 'bold',
                                                        opacity: isCompleting[orderId] ? 0.7 : 1,
                                                        cursor: isCompleting[orderId] ? 'wait' : 'pointer'
                                                    }}
                                                >
                                                    {isCompleting[orderId] ? 'ডেলিভারি সম্পন্ন হচ্ছে...' : 'ডেলিভারি সম্পন্ন করুন ✅'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Payment History */}
            {(() => {
                const myPayments = payments.filter(p => {
                    const normP = normalize(p.riderName);
                    return normP === normRiderId || normP === normUsername;
                });
                if (myPayments.length === 0) return null;
                return (
                    <section className="glass-card">
                        <h3 style={{ marginBottom: '1.25rem' }}>💳 পেমেন্ট ইতিহাস</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '380px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>তারিখ</th>
                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>পরিমাণ</th>
                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Ref #</th>
                                        <th style={{ padding: '0.6rem 0.8rem' }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myPayments.map(p => {
                                        const dt = p.timestamp ? new Date(p.timestamp).toLocaleDateString('en-GB') : p.date || '—';
                                        const ref = p._id ? p._id.slice(-8).toUpperCase() : '—';
                                        return (
                                            <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                                                <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-muted)' }}>{dt}</td>
                                                <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right', color: '#10b981', fontWeight: '700' }}>৳ {p.amount}</td>
                                                <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{ref}</td>
                                                <td style={{ padding: '0.6rem 0.8rem' }}>
                                                    <button onClick={() => setPayReceipt(p)} style={{ background: 'rgba(235,94,40,0.1)', border: '1px solid rgba(235,94,40,0.3)', color: 'var(--primary)', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                                        🧾 Receipt
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>
                );
            })()}

            {payReceipt && <PayReceiptModal payment={payReceipt} onClose={() => setPayReceipt(null)} />}
        </div>
    );
};

export default RiderDashboard;
