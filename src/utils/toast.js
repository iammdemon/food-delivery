import toast from 'react-hot-toast';

const playSound = (url) => {
    const audio = new Audio(url);
    audio.play().catch(err => console.log('Audio play failed:', err));
};

const SUCCESS_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
const ERROR_SOUND = 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3';

export const toastSuccess = (msg) => {
    playSound(SUCCESS_SOUND);
    return toast.success(msg);
};

export const toastError = (msg) => {
    playSound(ERROR_SOUND);
    return toast.error(msg);
};

export default {
    success: toastSuccess,
    error: toastError
};
