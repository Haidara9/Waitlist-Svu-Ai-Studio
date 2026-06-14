"use client";
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// apiKey is supplied via env (NEXT_PUBLIC_FIREBASE_API_KEY); it is never committed.
const resolvedFirebaseConfig = {
  ...firebaseConfig,
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || firebaseConfig.apiKey,
};

if (!resolvedFirebaseConfig.apiKey) {
  throw new Error('Missing NEXT_PUBLIC_FIREBASE_API_KEY for Firebase initialization.');
}

export const app = !getApps().length ? initializeApp(resolvedFirebaseConfig) : getApp();

// Long polling improves reliability in restricted networks. The waitlist data
// lives in a NAMED Firestore database, so we pass firestoreDatabaseId explicitly.
export const db = initializeFirestore(
  app,
  { experimentalForceLongPolling: true },
  resolvedFirebaseConfig.firestoreDatabaseId
);
