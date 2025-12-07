import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, listAll, getMetadata, getDownloadURL, updateMetadata } from 'firebase/storage';

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
export const db = getFirestore(app);
export const storage = getStorage(app);

// Email/password helpers
export const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => signOut(auth);

// Google Sign-In helper
export const googleProvider = new GoogleAuthProvider();
export const signInWithGoogle = async () => signInWithPopup(auth, googleProvider);

// Client-side helper to add a login event to Firestore. Note: this writes directly
// from the client; ensure your Firestore rules allow authenticated clients to write
// to `loginEvents` if you use this. Alternatively, keep writes server-side.
export async function addLoginEvent({ uid, email, displayName, userAgent } = {}) {
  try {
    await addDoc(collection(db, 'loginEvents'), {
      uid: uid || null,
      email: email || null,
      displayName: displayName || null,
      userAgent: userAgent || null,
      ts: serverTimestamp(),
    });
  } catch (err) {
    console.error('addLoginEvent failed', err);
  }
}

// File upload helper - uploads file to Firebase Storage
export async function uploadFile(file, userId) {
  try {
    if (!file) throw new Error('No file provided');
    
    // Only allow .png, .jpg, .jpeg and .mp4 files
    const allowedTypes = ['image/png', 'image/jpeg', 'video/mp4'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only .png, .jpg, .jpeg (images) and .mp4 (videos) files are allowed');
    }

    // Create unique filename: userId/timestamp-filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const storagePath = `uploads/${userId}/${filename}`;
    
    const fileRef = ref(storage, storagePath);
      // sanitize filename for header
      const safeName = (file.name || 'download').replace(/"/g, "'");
      const metadata = {
        contentType: file.type,
        contentDisposition: `attachment; filename="${safeName}"`,
      };
      const snapshot = await uploadBytes(fileRef, file, metadata);
    
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      path: snapshot.ref.fullPath,
      uploadedAt: new Date().toISOString(),
      userId: userId,
    };
  } catch (err) {
    console.error('File upload failed:', err);
    throw err;
  }
}

// Get all files uploaded by a user
export async function getUserFiles(userId) {
  try {
    const userFolderRef = ref(storage, `uploads/${userId}`);
    const result = await listAll(userFolderRef);
    
    const files = [];
    for (const fileRef of result.items) {
      const metadata = await getMetadata(fileRef);
      files.push({
        name: fileRef.name,
        fullPath: fileRef.fullPath,
        size: metadata.size,
        type: metadata.contentType,
        uploadedAt: metadata.timeCreated,
      });
    }
    
    return files.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  } catch (err) {
    console.error('Failed to get user files:', err);
    throw err;
  }
}

// Download file - get download URL
export async function getFileDownloadUrl(filePath) {
  try {
    const fileRef = ref(storage, filePath);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (err) {
    console.error('Failed to get file download URL:', err);
    throw err;
  }
}

// Update metadata for an existing file (e.g., set contentDisposition to force download)
export async function updateFileMetadata(filePath, filename) {
  try {
    const fileRef = ref(storage, filePath);
    const safeName = (filename || 'download').replace(/"/g, "'");
    const newMetadata = {
      contentDisposition: `attachment; filename="${safeName}"`,
    };
    const updated = await updateMetadata(fileRef, newMetadata);
    return updated;
  } catch (err) {
    console.error('Failed to update metadata:', err);
    throw err;
  }
}

export default app;
