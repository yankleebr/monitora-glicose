// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVeGfLIMRUlGvJ82lzrfXi8LcKNskimvM",
  authDomain: "monitora-glicose-9cb4d.firebaseapp.com",
  projectId: "monitora-glicose-9cb4d",
  storageBucket: "monitora-glicose-9cb4d.appspot.com",
  messagingSenderId: "321618445806",
  appId: "1:321618445806:web:0f029aca44999de5463aff"
};

// Initialize Firebase
const FirebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(FirebaseApp)

export {db}