import React, { useState } from 'react';
import axios from 'axios';
import toast from '../utils/toast';

import API_BASE from '../api';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedUser = username.trim();
        if (!trimmedUser) return;

        setIsLoading(true);
        try {
            const lowerUser = trimmedUser.toLowerCase().replace(/\s+/g, '_');

            // For admin, we can still hardcode or use backend
            // Let's use backend for everyone for consistency
            let role = 'customer';
            if (lowerUser === 'admin') role = 'admin';
            if (lowerUser.includes('kitchen')) role = 'kitchen';

            const response = await axios.post(`${API_BASE}/auth/login`, {
                username: lowerUser,
                name: trimmedUser,
                role: role
            });

            const userData = {
                id: response.data.username || response.data._id,
                name: response.data.name,
                role: response.data.role,
                username: response.data.username
            };

            onLogin(userData);
        } catch (err) {
            console.error('Login error:', err);
            const status = err.response?.status;
            let msg = err.response?.data?.details || err.response?.data?.error || err.message;
            if (typeof msg === 'object') msg = JSON.stringify(msg);

            if (status === 404) {
                toast.error(`Server Error (404): API Route not found. Please check deployment. (${msg})`);
            } else if (status === 500) {
                toast.error(`Database Error (500): Check MongoDB connection in Vercel settings. (${msg})`);
            } else {
                toast.error(`Login Failed: ${msg}. Check your internet connection.`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex" style={{ height: '80vh', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass-card animate-fade-in" style={{ width: '400px', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}><span style={{ color: 'var(--primary)' }}>ফুড ক্যাটারিং বরিশালে</span> স্বাগতম</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>চালিয়ে যেতে আপনার নাম লিখুন</p>

                <form onSubmit={handleSubmit} className="grid" style={{ gap: '1.5rem' }}>
                    <input
                        type="text"
                        placeholder="আপনার নাম লিখুন (উদা: Admin, Lamia, বা Tisa)"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            padding: '1rem',
                            borderRadius: '8px',
                            fontSize: '1rem'
                        }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '1rem' }} disabled={isLoading}>
                        {isLoading ? 'সংযুক্ত হচ্ছে...' : 'লগইন / প্রবেশ করুন'}
                    </button>
                </form>

            </div>
        </div>
    );
};

export default Login;
