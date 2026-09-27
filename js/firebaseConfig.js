// 🔥 Bazario Firebase Config (project: bazario-2920a)
window.firebaseConfig = {
  apiKey: "AIzaSyAPx_M0Et96w7qY9GB7bZk-wsxGnule9c8",
  authDomain: "bazario-2920a.firebaseapp.com",
  databaseURL: "https://bazario-2920a-default-rtdb.firebaseio.com",
  projectId: "bazario-2920a",
  storageBucket: "bazario-2920a.firebasestorage.app",
  messagingSenderId: "275381335548",
  appId: "1:275381335548:web:85319a7fd932036c18ee79"
};

window.FIREBASE_READY = !String(window.firebaseConfig.apiKey).startsWith('PASTE');
window.db = null;
window.auth = null;

if (window.FIREBASE_READY) {
  try {
    if (!firebase.apps.length) firebase.initializeApp(window.firebaseConfig);
    window.db = firebase.database();
    window.auth = firebase.auth();
    console.log("✅ Bazario Firebase connected!");
  } catch (e) {
    console.error("Firebase init error:", e);
    window.FIREBASE_READY = false;
  }
}
