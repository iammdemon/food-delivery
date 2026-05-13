import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCCfb5aBB2eRXSMGmdqoNty-0p1Ii88cHU",
  authDomain: "easyfood-5c944.firebaseapp.com",
  projectId: "easyfood-5c944",
  storageBucket: "easyfood-5c944.firebasestorage.app",
  messagingSenderId: "457749345976",
  appId: "1:457749345976:web:14f0e84a9c7ba40d1ca64d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Secondary app used by admins to create new Firebase accounts without signing out the current admin
const secondaryApp = getApps().find(a => a.name === 'Secondary') || initializeApp(firebaseConfig, 'Secondary');
export const secondaryAuth = getAuth(secondaryApp);
