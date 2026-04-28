import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBrOwzvOnjLb4UPdKYXPPlTBtkvrSOr9uQ",
  authDomain: "grupo-consultio.firebaseapp.com",
  projectId: "grupo-consultio",
  storageBucket: "grupo-consultio.firebasestorage.app",
  messagingSenderId: "949812633990",
  appId: "1:949812633990:web:8925a0c4131fbb3fc4cc07",
  measurementId: "G-P2DQCXD9MK"
};

const app = initializeApp(firebaseConfig);

export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
