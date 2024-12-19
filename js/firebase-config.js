// Your web app's Firebase configuration
const firebaseConfig = {
    // Copy these values from your Firebase console
    apiKey: "AIzaSyBQJLbvN-6yAuWl2zq2hORV8_wppOOqTQQ",
    authDomain: "poker-tetris.firebaseapp.com",
    projectId: "poker-tetris",
    storageBucket: "poker-tetris.firebasestorage.app",
    messagingSenderId: "799690131418",
    appId: "1:799690131418:web:83d51a58975f8c31c062e3"
};

// Initialize Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };