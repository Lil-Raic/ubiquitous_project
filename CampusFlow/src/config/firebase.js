// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFVOM9BK6sEXSp07EjnqnREQ_ymRZ_NEI",
  authDomain: "campusflow-10758.firebaseapp.com",
  projectId: "campusflow-10758",
  storageBucket: "campusflow-10758.firebasestorage.app",
  messagingSenderId: "29810176499",
  appId: "1:29810176499:web:a85753e1e8b064b5532286",
  measurementId: "G-TLMVHXJRBZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);