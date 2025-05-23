// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvUStwQu2lPrsSAaTMb9x3oVNzp0KyGRA",
  authDomain: "spect3r-spm.firebaseapp.com",
  projectId: "spect3r-spm",
  storageBucket: "spect3r-spm.appspot.com",
  messagingSenderId: "647567100345",
  appId: "1:647567100345:web:4b3e361a6a6273efe74e68"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable persistence for offline support
// enableIndexedDbPersistence(db).catch((err) => {
//   if (err.code === 'failed-precondition') {
//     console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
//   } else if (err.code === 'unimplemented') {
//     console.warn('The current browser does not support persistence.');
//   }
// });

export default app;