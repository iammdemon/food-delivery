import { useState, useEffect } from 'react';

export const useTimeCheck = (deadline) => {
    const [isPastDeadline, setIsPastDeadline] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const checkDeadline = () => {
            const now = new Date();
            const target = new Date();
            target.setHours(deadline.hour, deadline.minute, 0, 0);

            const diff = target - now;

            if (diff <= 0) {
                setIsPastDeadline(true);
                setTimeLeft('Expired');
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
                setIsPastDeadline(false);
            }
        };

        checkDeadline();
        const interval = setInterval(checkDeadline, 1000);
        return () => clearInterval(interval);
    }, [deadline]);

    return { isPastDeadline, timeLeft };
};
