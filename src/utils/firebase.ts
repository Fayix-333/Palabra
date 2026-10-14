import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  onAuthStateChanged,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  firebaseConfig.apiKey !== 'MY_FIREBASE_API_KEY'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (err) {
    console.warn('Firebase initialization skipped or failed:', err);
  }
}

export { auth, db };

export async function loginWithGoogle(): Promise<User | null> {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase credentials are not configured in environment variables.');
  }
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function logoutUser(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function syncUserDataToFirestore(userId: string, data: Record<string, unknown>): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { ...data, updatedAt: Date.now() }, { merge: true });
    return true;
  } catch (err) {
    console.error('Failed to sync data to Firestore:', err);
    return false;
  }
}

export async function fetchUserDataFromFirestore(userId: string): Promise<Record<string, unknown> | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch data from Firestore:', err);
    return null;
  }
}
