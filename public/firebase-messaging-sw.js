importScripts(
  "https://www.gstatic.com/firebasejs/10.4.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.4.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyBjjYdhGMX9-OdkMKtKQAkCu7WEDElAzp4",
  authDomain: "live-chat-82684.firebaseapp.com",
  projectId: "live-chat-82684",
  storageBucket: "live-chat-82684.firebasestorage.app",
  messagingSenderId: "825259729187",
  appId: "1:825259729187:web:a9d623000822149748ac96",
  measurementId: "G-K3820Z30S5",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("🔕 Received background message:", payload);
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: "/chat-icon.png",
  });
});
