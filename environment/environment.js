// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBce---VwdzSDsx6Lf4wy0aRcXjxT5bxEE",
    authDomain: "serviceprovidercrm1.firebaseapp.com",
    projectId: "serviceprovidercrm1",
    storageBucket: "serviceprovidercrm1.firebasestorage.app",
    messagingSenderId: "613892148086",
    appId: "1:613892148086:web:9fe04fe71cac55ed80c857"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export default app;
export { auth, db, storage };