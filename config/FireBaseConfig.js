import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBMNZUfoumM3O_YdZbuaCxeosKqgIRY0tg",
  authDomain: "zomato-7b56d.firebaseapp.com",
  projectId: "zomato-7b56d",
  storageBucket: "zomato-7b56d.firebasestorage.app",
  messagingSenderId: "384297145885",
  appId: "1:384297145885:web:fb007d56ca7ae7722598f4",
  measurementId: "G-YPGY26H7EH"
};



const app = initializeApp(firebaseConfig);
export const db=getFirestore(app)
