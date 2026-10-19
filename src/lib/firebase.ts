import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Ensure Firebase Auth persists sessions across page reloads
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Auth persistence warning:', err);
});

export interface AppAccountSession {
  uid: string;
  email: string;
  name: string;
  isFirebaseVerified?: boolean;
}

const SESSION_KEY = 'monolith_active_session_v1';
const USERS_REGISTRY_KEY = 'monolith_users_registry_v1';

interface StoredAccountRecord {
  uid: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

function getStoredUsers(): Record<string, StoredAccountRecord> {
  try {
    const raw = localStorage.getItem(USERS_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredUsers(users: Record<string, StoredAccountRecord>) {
  localStorage.setItem(USERS_REGISTRY_KEY, JSON.stringify(users));
}

export function getRememberedSession(): AppAccountSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveRememberedSession(session: AppAccountSession | null) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export async function signUpAccount(name: string, email: string, password: string): Promise<AppAccountSession> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedName = name.trim();

  // Check local registry first for immediate clear feedback
  const users = getStoredUsers();
  if (users[normalizedEmail]) {
    throw new Error('An account with this email already exists. Please switch to Sign In.');
  }

  let uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  let isFirebaseVerified = false;

  // Attempt Firebase Email/Password creation if enabled in Firebase Console
  try {
    const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
    if (trimmedName) {
      await updateProfile(cred.user, { displayName: trimmedName });
    }
    uid = cred.user.uid;
    isFirebaseVerified = Boolean(cred.user.emailVerified);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('email-already-in-use')) {
      throw new Error('An account with this email already exists. Please switch to Sign In.');
    }
    // If email/password provider is not manually enabled in Firebase Console, continue with persistent local account
  }

  // Save in persistent account registry so future Sign-In remembers credentials
  users[normalizedEmail] = {
    uid,
    email: normalizedEmail,
    name: trimmedName,
    passwordHash: btoa(encodeURIComponent(password)),
    createdAt: new Date().toISOString(),
  };
  saveStoredUsers(users);

  const session: AppAccountSession = {
    uid,
    email: normalizedEmail,
    name: trimmedName,
    isFirebaseVerified,
  };
  saveRememberedSession(session);
  return session;
}

export async function signInAccount(email: string, password: string): Promise<AppAccountSession> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getStoredUsers();
  const existingRecord = users[normalizedEmail];

  // Try Firebase Auth first if enabled
  try {
    const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
    const session: AppAccountSession = {
      uid: cred.user.uid,
      email: cred.user.email || normalizedEmail,
      name: cred.user.displayName || existingRecord?.name || normalizedEmail.split('@')[0],
      isFirebaseVerified: Boolean(cred.user.emailVerified),
    };
    saveRememberedSession(session);
    return session;
  } catch {
    // Check remembered registry
    if (!existingRecord) {
      throw new Error('No account found with this email. Please Sign Up first.');
    }
    const encodedInput = btoa(encodeURIComponent(password));
    if (existingRecord.passwordHash !== encodedInput) {
      throw new Error('Incorrect password. Please try again.');
    }
    const session: AppAccountSession = {
      uid: existingRecord.uid,
      email: existingRecord.email,
      name: existingRecord.name,
      isFirebaseVerified: false,
    };
    saveRememberedSession(session);
    return session;
  }
}

export async function signInWithGoogle(): Promise<AppAccountSession> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const session: AppAccountSession = {
    uid: user.uid,
    email: user.email || '',
    name: user.displayName || user.email?.split('@')[0] || 'Creator',
    isFirebaseVerified: Boolean(user.emailVerified),
  };
  saveRememberedSession(session);
  return session;
}

export async function logOutUser() {
  saveRememberedSession(null);
  try {
    await signOut(auth);
  } catch {
    // Ignore sign-out errors if using local session
  }
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
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
