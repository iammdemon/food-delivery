import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';

export const useWallet = (username) => {
    const [balance, setBalance] = useState(0);

    const fetchBalance = useCallback(async () => {
        if (!username) return;
        try {
            const res = await axios.get(`${API_BASE}/users/${username}`);
            setBalance(res.data.balance || 0);
        } catch (err) {
            console.error('Failed to fetch balance:', err);
        }
    }, [username]);

    useEffect(() => {
        fetchBalance();

        // Polling or custom event for updates
        window.addEventListener('walletUpdate', fetchBalance);
        return () => window.removeEventListener('walletUpdate', fetchBalance);
    }, [fetchBalance]);

    const topUp = async (amount) => {
        if (!username) return;
        // In this app, topUp is usually via request approve, 
        // but if there's a direct topUp call:
        // We'll just trigger a refresh for now as the server handles the credit logic
        window.dispatchEvent(new CustomEvent('walletUpdate'));
    };

    const deduct = async (amount) => {
        if (!username) return false;
        // The actual deduction happens in the placeOrder call on the backend
        // We return true here to allow the frontend flow, but the real source of truth is the DB
        return true;
    };

    return { balance, topUp, deduct, refresh: fetchBalance };
};
