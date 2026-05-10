import React, { useState } from 'react';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--glass-border)',
    color: 'white',
    padding: '0.9rem 1rem',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box'
};

const FIREBASE_ERRORS = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
};

const Login = () => {
    const [mode, setMode] = useState('signin');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError('');
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error('Google Sign-in Error:', err);
            setError('Google sign-in failed: ' + (err.message || 'Please try again.'));
            setIsLoading(false);
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            if (mode === 'signup') {
                if (!name.trim()) { setError('Please enter your name.'); setIsLoading(false); return; }
                const result = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(result.user, { displayName: name.trim() });
            } else {
                await signInWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            setError(FIREBASE_ERRORS[err.code] || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = () => {
        setMode(m => m === 'signin' ? 'signup' : 'signin');
        setError('');
        setName('');
        setEmail('');
        setPassword('');
    };

    return (
        <div className="flex" style={{ minHeight: '85vh', justifyContent: 'center', alignItems: 'center' }}>
            <div className="glass-card animate-fade-in" style={{ width: '420px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🍱</div>
                <h1 style={{ marginBottom: '0.25rem', fontSize: '1.8rem' }}>
                    Welcome to <span style={{ color: 'var(--primary)' }}>Food Catering</span>
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                    {mode === 'signin' ? 'Sign in to access your dashboard' : 'Create a new account'}
                </p>

                <button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        padding: '0.85rem 1.5rem',
                        background: 'white',
                        color: '#1f2937',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        opacity: isLoading ? 0.7 : 1,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                        transition: 'opacity 0.2s',
                        marginBottom: '1.5rem'
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>or</span>
                    <div style={{ flex: 1, height: '1px', background: 'var(--glass-border)' }} />
                </div>

                <form onSubmit={handleEmailAuth} style={{ display: 'grid', gap: '1rem', textAlign: 'left' }}>
                    {mode === 'signup' && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Full Name</label>
                            <input
                                type="text"
                                placeholder="Your name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                disabled={isLoading}
                                style={inputStyle}
                            />
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Email</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                style={{ ...inputStyle, paddingRight: '3rem' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(v => !v)}
                                style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '1.1rem',
                                    padding: 0,
                                    lineHeight: 1
                                }}
                                tabIndex={-1}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p style={{ color: '#ef4444', fontSize: '0.85rem', margin: 0, textAlign: 'center' }}>{error}</p>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                        style={{ padding: '0.9rem', fontSize: '1rem', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                    >
                        {isLoading
                            ? (mode === 'signup' ? 'Creating account...' : 'Signing in...')
                            : (mode === 'signup' ? 'Create Account' : 'Sign In')}
                    </button>
                </form>

                <p style={{ marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        onClick={switchMode}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem', padding: 0 }}
                    >
                        {mode === 'signin' ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
