import React, { useState } from 'react';
import axios from 'axios';
import toast from '../utils/toast';

import API_BASE from '../api';

const KitchenDashboard = ({ orderHistory, fetchData }) => {
    const [updatingId, setUpdatingId] = useState(null);

    const getTimestamp = (order) => {
        if (order.timestamp) return order.timestamp;
        return new Date(order.date).getTime() || 0;
    };

    const todaysOrders = orderHistory.filter(o => {
        const ts = getTimestamp(o);
        const orderDate = new Date(ts);
        const today = new Date();

        // Robust today check
        const isToday = orderDate.getFullYear() === today.getFullYear() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getDate() === today.getDate();
        return isToday;
    });

    console.log('Kitchen - orderHistory count:', orderHistory.length);
    console.log('Kitchen - todaysOrders count:', todaysOrders.length);
    if (orderHistory.length > 0) {
        console.log('Kitchen - Latest Order Data:', {
            id: orderHistory[0]._id,
            status: orderHistory[0].status,
            ts: getTimestamp(orderHistory[0]),
            dateString: new Date(getTimestamp(orderHistory[0])).toDateString()
        });
    }

    const updateStatus = async (orderId, status) => {
        setUpdatingId(orderId);
        try {
            await axios.patch(`${API_BASE}/orders/${orderId}`, { status });
            await fetchData();
            toast.success(`Order status updated to ${status}! 🍳`);
        } catch (err) {
            toast.error('Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    // Active orders are any orders that are NOT Delivered yet (no date filter to prevent midnight cutoff/timezone bugs)
    const activeOrders = orderHistory.filter(o => o.status !== 'Delivered');

    // Delivered orders are filtered to show only those delivered today (or recent 5)
    const deliveredToday = orderHistory.filter(o => {
        if (o.status !== 'Delivered') return false;
        const ts = getTimestamp(o);
        const orderDate = new Date(ts);
        const today = new Date();
        return orderDate.getFullYear() === today.getFullYear() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getDate() === today.getDate();
    });

    const statusOptions = ['Confirmed', 'Preparing', 'Sent For Delivery', 'Delivered'];

    // Group active orders by status columns (with 'Assigned' mapped to 'Confirmed' so they don't vanish!)
    const groupedOrders = statusOptions.reduce((acc, status) => {
        if (status === 'Confirmed') {
            acc[status] = activeOrders.filter(o => o.status === 'Confirmed' || o.status === 'Assigned');
        } else if (status === 'Delivered') {
            acc[status] = deliveredToday;
        } else {
            acc[status] = activeOrders.filter(o => o.status === status);
        }
        return acc;
    }, {});

    // Orders that are just "Paid" but not yet "Confirmed"
    const pendingOrders = activeOrders.filter(o => !o.status || o.status === 'Paid');

    return (
        <div className="animate-fade-in grid" style={{ gap: '2rem' }}>
            <header className="flex" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '2rem' }}>👨‍🍳 কিচেন ড্যাশবোর্ড</h2>
                    <p style={{ color: 'var(--text-muted)' }}>আজকের খাবারের প্রস্তুতি এবং ডেলিভারি স্ট্যাটাস পরিচালনা করুন</p>
                </div>
                <div className="glass-card" style={{ padding: '0.5rem 1rem' }}>
                    <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>আজকের মোট অর্ডার: {todaysOrders.length}টি</span>
                </div>
            </header>

            <main className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                {/* Pending Confirmation */}
                <section className="glass-card" style={{ height: '100%' }}>
                    <h3 style={{ color: 'var(--secondary)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        📥 নতুন অর্ডারসমূহ
                        <span style={{ fontSize: '0.8rem', background: 'var(--secondary)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>{pendingOrders.length}</span>
                    </h3>
                    <div className="grid" style={{ gap: '1rem' }}>
                        {pendingOrders.map(order => (
                            <div key={order._id || order.id} className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid var(--secondary)' }}>
                                <div className="flex" style={{ justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 'bold' }}>{order.customerName}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.type}</span>
                                </div>
                                <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>{order.items.join(', ')}</p>
                                <button
                                    className="btn-primary"
                                    style={{ width: '100%', marginTop: '0.5rem', padding: '0.4rem' }}
                                    onClick={() => updateStatus(order._id || order.id, 'Confirmed')}
                                    disabled={updatingId === (order._id || order.id)}
                                >
                                    অর্ডার কনফার্ম করুন
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Status Columns */}
                {['Confirmed', 'Preparing', 'Sent For Delivery'].map(status => (
                    <section key={status} className="glass-card" style={{ height: '100%' }}>
                        <h3 style={{ color: 'var(--primary)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {status === 'Confirmed' ? '✅' : status === 'Preparing' ? '🍳' : '🚚'} {status === 'Confirmed' ? 'নিশ্চিত' : status === 'Preparing' ? 'প্রস্তুত হচ্ছে' : 'ডেলিভারিতে পাঠানো হয়েছে'}
                            <span style={{ fontSize: '0.8rem', background: 'var(--primary)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>{groupedOrders[status].length}</span>
                        </h3>
                        <div className="grid" style={{ gap: '1rem' }}>
                            {groupedOrders[status].map(order => (
                                <div key={order._id || order.id} className="glass-card" style={{ padding: '1rem', borderLeft: '4px solid var(--primary)' }}>
                                    <div className="flex" style={{ justifyContent: 'space-between' }}>
                                        <span style={{ fontWeight: 'bold' }}>{order.customerName}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.type}</span>
                                    </div>
                                    <p style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>{order.items.join(', ')}</p>
                                    <div className="flex" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
                                        {statusOptions.slice(statusOptions.indexOf(status) + 1).slice(0, 1).map(nextStatus => (
                                            <button
                                                key={nextStatus}
                                                className="btn-primary"
                                                style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}
                                                onClick={() => updateStatus(order._id || order.id, nextStatus)}
                                                disabled={updatingId === (order._id || order.id)}
                                            >
                                                {nextStatus === 'Preparing' ? 'প্রস্তুতি শুরু করুন' : nextStatus === 'Sent For Delivery' ? 'ডেলিভারিতে পাঠান' : nextStatus === 'Delivered' ? 'ডেলিভারি সম্পন্ন' : nextStatus}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {/* Delivered */}
                <section className="glass-card" style={{ opacity: 0.7 }}>
                    <h3 style={{ color: 'var(--text-muted)', marginBottom: '1.2rem' }}>🏁 Recently Delivered</h3>
                    <div className="grid" style={{ gap: '1rem' }}>
                        {groupedOrders['Delivered'].slice(0, 5).map(order => (
                            <div key={order._id || order.id} className="glass-card" style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.02)' }}>
                                <div className="flex" style={{ justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: '600' }}>{order.customerName}</span>
                                    <span style={{ fontSize: '0.7rem' }}>✅ Done</span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.items.join(', ')}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default KitchenDashboard;
