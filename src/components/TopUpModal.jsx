import React, { useState } from 'react';

const TopUpModal = ({ onClose, onSubmit }) => {
    const [amount, setAmount] = useState('');
    const [senderPhone, setSenderPhone] = useState('');
    const [screenshot, setScreenshot] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshot(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount || !senderPhone || !screenshot) {
            return alert('Please fill all fields and upload a screenshot!');
        }
        onSubmit({ amount, senderPhone, screenshot });
    };

    return (
        <div className="flex" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card animate-fade-in" style={{ width: '450px', padding: '2rem', borderColor: '#e2136e' }}>
                <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div className="flex" style={{ gap: '0.8rem', alignItems: 'center' }}>
                        <div style={{ background: '#e2136e', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem' }}>bKash</div>
                        <h2 style={{ margin: 0 }}>Top-Up Request</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ background: 'rgba(226, 19, 110, 0.1)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', borderLeft: '4px solid #e2136e' }}>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><strong>Instructions:</strong></p>
                    <p style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>1. Go to your bKash App or dial *247#</p>
                    <p style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>2. Choose <strong>"Send Money"</strong></p>
                    <p style={{ fontSize: '0.85rem', marginBottom: '0.3rem' }}>3. Enter Number: <strong style={{ color: '#e2136e' }}>01606305982</strong></p>
                    <p style={{ fontSize: '0.85rem' }}>4. Take a screenshot of the success message.</p>
                </div>

                <form onSubmit={handleSubmit} className="grid" style={{ gap: '1.2rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Amount (BDT)</label>
                        <input
                            type="number"
                            placeholder="Enter amount (e.g. 500)"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Sender bKash number</label>
                        <input
                            type="text"
                            placeholder="01XXXXXXXXX"
                            value={senderPhone}
                            onChange={e => setSenderPhone(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Payment Screenshot</label>
                        <div
                            style={{
                                width: '100%',
                                height: '100px',
                                border: '2px dashed var(--glass-border)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                background: 'rgba(255,255,255,0.02)'
                            }}
                        >
                            {screenshot ? (
                                <img src={screenshot} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ fontSize: '1.5rem' }}>🖼️</span>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Click to upload screenshot</p>
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0, cursor: 'pointer' }}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ padding: '1rem', background: '#e2136e', borderColor: '#e2136e' }}>
                        Submit Top-Up Request
                    </button>
                </form>
            </div>
        </div>
    );
};

export default TopUpModal;
