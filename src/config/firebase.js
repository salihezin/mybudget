import {initializeApp} from "firebase/app";
import {getDatabase, ref} from "firebase/database";
import {getAuth} from "firebase/auth";

export const firebaseConfig = {
    apiKey: "AIzaSyAzwvzAra96Snp_Cl80-UMSW8Sca9SJp7s",
    authDomain: "budget-84452.firebaseapp.com",
    projectId: "budget-84452",
    storageBucket: "budget-84452.appspot.com",
    messagingSenderId: "827229317232",
    appId: "1:827229317232:web:7862a56bb66a7ccb6d2cb5",
    measurementId: "G-8Q1C0JQS9G",
    databaseURL: "https://budget-84452-default-rtdb.europe-west1.firebasedatabase.app/",

};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const realTimeRef = ref(database, 'salih');

export const auth = getAuth(app);
