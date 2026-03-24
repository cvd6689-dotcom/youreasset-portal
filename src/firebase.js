import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDh88w68TZGwabggyvWRS7vCc7VTEiXHTo",
  authDomain: "yoursasset.firebaseapp.com",
  projectId: "yoursasset",
  storageBucket: "yoursasset.firebasestorage.app",
  messagingSenderId: "148918167461",
  appId: "1:148918167461:web:6d552be8d70e0160d66a4c",
  measurementId: "G-NLXZXPXHV2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
