import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBjjYdhGMX9-OdkMKtKQAkCu7WEDElAzp4",
  authDomain: "live-chat-82684.firebaseapp.com",
  projectId: "live-chat-82684",
  storageBucket: "live-chat-82684.firebasestorage.app",
  messagingSenderId: "825259729187",
  appId: "1:825259729187:web:a9d623000822149748ac96",
  measurementId: "G-K3820Z30S5",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
export { messaging, getToken, onMessage };
