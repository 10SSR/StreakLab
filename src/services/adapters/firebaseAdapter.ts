import { AuthAdapter, FirestoreAdapter, FCMAdapter } from './types';
import { localAuthAdapter, localFirestoreAdapter, localFCMAdapter } from './localAdapter';

// Check if Firebase environment variables are provided
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

export const isFirebaseConfigured = Boolean(apiKey && projectId && apiKey !== 'your-api-key');

// When configured, Firebase SDK would initialize here.
// When not configured, we gracefully export the local adapters without crashing or throwing errors.
export const authAdapter: AuthAdapter = isFirebaseConfigured ? localAuthAdapter : localAuthAdapter;
export const firestoreAdapter: FirestoreAdapter = isFirebaseConfigured ? localFirestoreAdapter : localFirestoreAdapter;
export const fcmAdapter: FCMAdapter = isFirebaseConfigured ? localFCMAdapter : localFCMAdapter;
