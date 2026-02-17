import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

const RiderDashboard = ({ username, orderHistory, setOrderHistory, payments, fetchData }) => {
    const [deliveryPhotos, setDeliveryPhotos] = useState({}); // To store local base64 for unsaved orders
    const [isCompleting, setIsCompleting] = useState({});

    const assignedOrders = orderHistory.filter(order => order.assignedRider === username);

    // Commission Calculations
    const deliveredOrders = assignedOrders.filter(o => o.status === 'Delivered');
    const totalEarned = deliveredOrders.length * 30;
    const totalPaid = payments.filter(p => p.riderName === username).reduce((sum, p) => sum + p.amount, 0);
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
        if (!proofImg) return alert('Please upload a delivery photo first!');
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

            alert('Delivery completed successfully! 🚚✅');
        } catch (error) {
            console.error('Delivery failure:', error);
            setIsCompleting(prev => ({ ...prev, [orderId]: false }));
            alert('Error completing delivery. Check server connection.');
        }
    };

    return (
        <div className="animate-fade-in grid" style={{ gap: '2rem' }}>
            {/* Earnings Summary Card */}
            <section className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div className="glass-card" style={{ textAlign: 'center', borderColor: 'var(--primary)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>💰 Total Earned</p>
                    <h2 style={{ color: 'var(--primary)', margin: '0.5rem 0' }}>৳ {totalEarned}</h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{deliveredOrders.length} deliveries x 30tk</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', borderColor: '#ef4444' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>💸 Already Paid</p>
                    <h2 style={{ color: '#ef4444', margin: '0.5rem 0' }}>৳ {totalPaid}</h2>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', borderColor: 'var(--secondary)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>⏳ Pending Payment</p>
                    <h2 style={{ color: 'var(--secondary)', margin: '0.5rem 0' }}>৳ {pendingBalance}</h2>
                </div>
            </section>

            <header className="glass-card" style={{ borderColor: 'var(--primary)' }}>
                <h2>🚚 My Assigned Deliveries</h2>
                <p style={{ color: 'var(--text-muted)' }}>Upload photos to complete deliveries</p>
            </header>

            <section className="grid" style={{ gap: '1.5rem' }}>
                {assignedOrders.length === 0 && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: '3rem' }}>
                        <span style={{ fontSize: '3rem' }}>📭</span>
                        <h3>No orders assigned yet.</h3>
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
                                        {(order.status || 'Paid').toUpperCase()}
                                    </span>
                                    <span style={{ marginLeft: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {order.date} {order.time}
                                    </span>
                                </div>
                                <h3 style={{ color: 'var(--secondary)' }}>Bill: ৳ {order.total}</h3>
                            </div>

                            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>👤 Customer Details</h4>
                                    <p style={{ fontWeight: 'bold' }}>{order.customerName}</p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>📞 {order.customerPhone}</p>
                                    <div style={{ marginTop: '1rem' }}>
                                        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>📍 Delivery Address</h4>
                                        <p style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{order.customerAddress}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>📸 Delivery Proof</h4>
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
                                                    {isCompleting[orderId] ? 'Completing Delivery...' : 'Complete Delivery ✅'}
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
        </div>
    );
};

export default RiderDashboard;
