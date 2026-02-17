import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5001/api';

export const useProfile = (username) => {
    const [profile, setProfile] = useState({ phone: '', address: '' });

    const fetchProfile = useCallback(async () => {
        if (!username) return;
        try {
            const res = await axios.get(`${API_BASE}/users/${username}`);
            setProfile({
                phone: res.data.phone || '',
                address: res.data.address || ''
            });
        } catch (err) {
            console.error('Failed to fetch profile:', err);
        }
    }, [username]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const updateProfile = async (newData) => {
        if (!username) return;
        try {
            const res = await axios.patch(`${API_BASE}/users/${username}/profile`, newData);
            setProfile({
                phone: res.data.phone,
                address: res.data.address
            });
        } catch (err) {
            console.error('Failed to update profile:', err);
        }
    };

    return { profile, updateProfile };
};
