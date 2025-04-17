import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmiPttHQCoQHvTprZ6a9RR5L6jPpu_p-M",
  authDomain: "flood-1d18f.firebaseapp.com",
  databaseURL: "https://flood-1d18f-default-rtdb.firebaseio.com/",
  projectId: "flood-1d18f",
  storageBucket: "flood-1d18f.appspot.com",
  messagingSenderId: "912019950517",
  appId: "1:912019950517:web:371feeefec47af8ab3a7fc",
  measurementId: "G-RDZXTJRR3T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // Export database instance

export { db };