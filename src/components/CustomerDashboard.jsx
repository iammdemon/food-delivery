import React from 'react';

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
    UserProfile // Component
}) => {
    if (activeTab === 'profile') {
        return <UserProfile profile={profile} onUpdate={onProfileUpdate} initialName={user.name} />;
    }

    return (
        <main className="grid" style={{ gridTemplateColumns: '1fr 350px' }}>
            <section className="grid" style={{ gap: '2rem' }}>
                {/* Lunch Section */}
                <div className="glass-card">
                    <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2>🍱 দুপুরের লাঞ্চ</h2>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ডেডলাইন: সকাল ১০:০০</p>
                            <p style={{ color: lunchTime.isPastDeadline ? '#ef4444' : 'var(--primary)' }}>
                                {lunchTime.isPastDeadline ? 'অর্ডার বন্ধ' : `সময় বাকি: ${lunchTime.timeLeft}`}
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
                        <button
                            className="btn-primary"
                            style={{ marginTop: '1.5rem', width: '100%' }}
                            onClick={() => placeOrder('lunch')}
                        >
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
                                {dinnerTime.isPastDeadline ? 'অর্ডার বন্ধ' : `সময় বাকি: ${dinnerTime.timeLeft}`}
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
                        <button
                            className="btn-primary"
                            style={{ marginTop: '1.5rem', width: '100%' }}
                            onClick={() => placeOrder('dinner')}
                        >
                            ডিনার অর্ডার দিন (৳ {selectedItems.filter(i => menu.dinner.some(l => (l._id || l.id) === (i._id || i.id))).reduce((s, i) => s + i.price, 0)})
                        </button>
                    )}
                </div>
            </section>

            {/* Sidebar / Orders */}
            <aside className="grid" style={{ alignContent: 'start' }}>
                <div className="glass-card">
                    <h3>আমার অর্ডারসমূহ</h3>
                    <div className="grid" style={{ gap: '1rem', marginTop: '1rem' }}>
                        {myOrders.length === 0 && <p style={{ color: 'var(--text-muted)' }}>এখনো কোনো অর্ডার নেই।</p>}
                        {myOrders.map(order => (
                            <div key={order._id || order.id} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                                <div className="flex" style={{ justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: '600' }}>{order.type === 'lunch' ? 'লাঞ্চ' : 'ডিনার'}</span>
                                    <span style={{ color: 'var(--secondary)' }}>৳ {order.total}</span>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: order.status === 'Delivered' ? 'var(--primary)' : 'var(--secondary)', marginBottom: '0.3rem' }}>
                                    স্ট্যাটাস: {order.status === 'Delivered' ? 'ডেলিভারড' : order.status === 'Assigned' ? 'রাইডার নির্ধারিত' : 'প্রক্রিয়াধীন'}
                                </p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.items.join(', ')}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </main>
    );
};

export default CustomerDashboard;
