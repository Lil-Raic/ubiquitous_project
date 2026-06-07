import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// Core configuration keys connecting the app to your specific Firebase cloud project
const firebaseConfig = {
  apiKey: "AIzaSyDFVOM9BK6sEXSp07EjnqnREQ_ymRZ_NEI",
  authDomain: "campusflow-10758.firebaseapp.com",
  projectId: "campusflow-10758",
  storageBucket: "campusflow-10758.firebasestorage.app",
  messagingSenderId: "29810176499",
  appId: "1:29810176499:web:a85753e1e8b064b5532286",
  measurementId: "G-TLMVHXJRBZ"
};

// Initializes the Firebase application services and exports them for use across your screens
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);