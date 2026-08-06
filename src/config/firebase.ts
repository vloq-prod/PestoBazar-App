import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyA8Gxa466tZ9qT5PYVTDwGZayjss6JokZs",
  authDomain: "pestobazar-staging.firebaseapp.com",
  projectId: "pestobazar-staging",
  storageBucket: "pestobazar-staging.firebasestorage.app",
  messagingSenderId: "516822946337",
  appId: "1:516822946337:android:f5d23971597582f25f8960",
};

export const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
