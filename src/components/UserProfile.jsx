import React, { useState, useEffect } from 'react';

const UserProfile = ({ profile, onUpdate, initialName }) => {
    const [draft, setDraft] = useState({ name: '', phone: '', address: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Initialize draft with current profile data and name
    useEffect(() => {
        setDraft({ ...profile, name: initialName });
    }, [profile, initialName]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDraft(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!draft.name.trim()) return alert('Name cannot be empty!');

        setIsSaving(true);

        // Simulate a tiny delay for "saved" feel
        setTimeout(() => {
            onUpdate(draft);
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 600);
    };

    return (
        <div className="glass-card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <header className="flex" style={{ justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                <h2 style={{ margin: 0 }}>Personal Information</h2>
                {showSuccess && (
                    <span className="animate-fade-in" style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: '600' }}>
                        ✅ Details Saved Successfully!
                    </span>
                )}
            </header>

            <form onSubmit={handleSave} className="grid" style={{ gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={draft.name}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            padding: '0.8rem',
                            borderRadius: '8px'
                        }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="e.g. +91 9876543210"
                        value={draft.phone}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            padding: '0.8rem',
                            borderRadius: '8px'
                        }}
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Delivery Address</label>
                    <textarea
                        name="address"
                        placeholder="Flat, House No, Building, Apartment, Area, City..."
                        value={draft.address}
                        onChange={handleChange}
                        rows="4"
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            padding: '0.8rem',
                            borderRadius: '8px',
                            resize: 'none'
                        }}
                    />
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSaving}
                    style={{
                        padding: '1rem',
                        fontSize: '1rem',
                        marginTop: '0.5rem',
                        opacity: isSaving ? 0.7 : 1,
                        cursor: isSaving ? 'wait' : 'pointer'
                    }}
                >
                    {isSaving ? 'Saving Changes...' : 'Save Profile Details'}
                </button>
            </form>

            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(5, 150, 105, 0.1)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <p style={{ color: 'var(--primary)' }}>💡 These details will be included in your food delivery receipts.</p>
            </div>
        </div>
    );
};

export default UserProfile;
