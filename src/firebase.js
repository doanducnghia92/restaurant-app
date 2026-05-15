import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxEtbl--V5CXfdnUh8YC0h2JYYt80M-lk",
  authDomain: "restaurant-app-24e87.firebaseapp.com",
  projectId: "restaurant-app-24e87",
  storageBucket: "restaurant-app-24e87.firebasestorage.app",
  messagingSenderId: "290371383386",
  appId: "1:290371383386:web:15bfbd8b281689fd11a863",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function storageGet(key) {
  const ref = doc(db, "restaurant", key);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data().value;
  }

  return null;
}

export async function storageSet(key, value) {
  const ref = doc(db, "restaurant", key);

  await setDoc(ref, {
    value,
    updatedAt: Date.now(),
  });
}

export function storageSubscribe(key, callback) {
  const ref = doc(db, "restaurant", key);

  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback(snap.data().value);
    }
  });
}