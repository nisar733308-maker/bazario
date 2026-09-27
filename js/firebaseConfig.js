// 🔥 Bazario Firebase Config
// Nisar bhai: Firebase Console > Bazario project > Project settings > Your apps se
// real values yahan paste karni hain. Tab tak app "setup mode" me rahega.
window.firebaseConfig = {
  apiKey: "PASTE_API_KEY_HERE",
  authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://PASTE_PROJECT_ID-default-rtdb.firebaseio.com/",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID"
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
