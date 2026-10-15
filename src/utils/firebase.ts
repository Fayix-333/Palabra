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
  getDocFromServer,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export interface BroadcastMessage {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  type: 'login' | 'milestone' | 'lesson';
  message: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  message: string;
  timestamp: number;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig &&
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
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

    // Initial connection test
    getDocFromServer(doc(db, 'test', 'connection')).catch(() => {
      // Non-blocking connection probe
    });
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
  provider.setCustomParameters({ prompt: 'select_account' });
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
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, { ...data, updatedAt: Date.now() }, { merge: true });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}

export async function fetchUserDataFromFirestore(userId: string): Promise<Record<string, unknown> | null> {
  if (!isFirebaseConfigured || !db) return null;
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return null;
  }
}

export async function broadcastUserLogin(user: User): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const broadcastsCol = collection(db, 'broadcasts');
    const name = user.displayName || user.email?.split('@')[0] || 'A fellow learner';
    await addDoc(broadcastsCol, {
      userId: user.uid,
      userName: name,
      userPhoto: user.photoURL || '',
      type: 'login',
      message: `${name} just signed in to study Spanish!`,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn('Could not broadcast user login:', err);
  }
}

export function subscribeToBroadcasts(
  callback: (broadcasts: BroadcastMessage[]) => void
): () => void {
  if (!isFirebaseConfigured || !db) {
    callback([]);
    return () => {};
  }
  try {
    const broadcastsCol = collection(db, 'broadcasts');
    const q = query(broadcastsCol, orderBy('timestamp', 'desc'), limit(20));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: BroadcastMessage[] = [];
        snapshot.forEach((itemDoc) => {
          const data = itemDoc.data();
          items.push({
            id: itemDoc.id,
            userId: data.userId || '',
            userName: data.userName || 'Learner',
            userPhoto: data.userPhoto || '',
            type: data.type || 'login',
            message: data.message || 'A learner signed in',
            timestamp: data.timestamp || Date.now(),
          });
        });
        callback(items);
      },
      (error) => {
        console.warn('Broadcasts subscription notice:', error);
      }
    );
  } catch (err) {
    console.warn('Failed to listen to broadcasts:', err);
    return () => {};
  }
}

export async function sendChatMessage(user: User, messageText: string): Promise<void> {
  if (!isFirebaseConfigured || !db || !messageText.trim()) return;
  try {
    const chatCol = collection(db, 'chats');
    const name = user.displayName || user.email?.split('@')[0] || 'Learner';
    await addDoc(chatCol, {
      userId: user.uid,
      userName: name,
      userPhoto: user.photoURL || '',
      message: messageText.trim(),
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn('Could not send chat message:', err);
  }
}

export function subscribeToChatMessages(
  callback: (messages: ChatMessage[]) => void
): () => void {
  if (!isFirebaseConfigured || !db) {
    callback([]);
    return () => {};
  }
  try {
    const chatCol = collection(db, 'chats');
    const q = query(chatCol, orderBy('timestamp', 'asc'), limit(50));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: ChatMessage[] = [];
        snapshot.forEach((itemDoc) => {
          const data = itemDoc.data();
          items.push({
            id: itemDoc.id,
            userId: data.userId || '',
            userName: data.userName || 'Learner',
            userPhoto: data.userPhoto || '',
            message: data.message || '',
            timestamp: data.timestamp || Date.now(),
          });
        });
        callback(items);
      },
      (error) => {
        console.warn('Chat subscription notice:', error);
      }
    );
  } catch (err) {
    console.warn('Failed to listen to chat messages:', err);
    return () => {};
  }
}
