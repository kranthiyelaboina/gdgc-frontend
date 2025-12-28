// Firebase configuration for GDGC Platform
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyD6cuuCXP0grs_dx3dQXPCqa_YRGj2kj2g",
  authDomain: "gdgciare.firebaseapp.com",
  projectId: "gdgciare",
  storageBucket: "gdgciare.firebasestorage.app",
  messagingSenderId: "",
  appId: ""
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export default app;
