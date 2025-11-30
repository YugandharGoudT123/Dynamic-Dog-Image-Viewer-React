import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA7Z9XgympzUwY_0IYeySs1yqh_3xuWbl8",
  authDomain: "fir-integration-project-8c205.firebaseapp.com",
  projectId: "fir-integration-project-8c205",
  storageBucket: "fir-integration-project-8c205.firebasestorage.app",
  messagingSenderId: "416572401970",
  appId: "1:416572401970:web:332cf17525d1e540480f2b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Email/password helpers
export const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);

// Google Sign-In helper
export const googleProvider = new GoogleAuthProvider();
export const signInWithGoogle = async () => signInWithPopup(auth, googleProvider);

export default app;
