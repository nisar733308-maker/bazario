// ===== Bazario shared app logic =====
window.CATEGORIES = [
  { id:'all',    label:'सभी', icon:'🏠' },
  { id:'mobile', label:'मोबाइल', icon:'📱' },
  { id:'vehicle',label:'गाड़ी', icon:'🛵' },
  { id:'furniture', label:'फर्नीचर', icon:'🛋️' },
  { id:'property', label:'ज़मीन/मकान', icon:'🏡' },
  { id:'animal', label:'पशु', icon:'🐄' },
  { id:'electronics', label:'इलेक्ट्रॉनिक्स', icon:'💻' },
  { id:'job',    label:'नौकरी', icon:'💼' },
  { id:'fashion',label:'कपड़े/फैशन', icon:'👕' },
  { id:'other',  label:'अन्य', icon:'📦' }
];
window.catLabel = (id) => { const c = window.CATEGORIES.find(c => c.id === id); return c ? c.icon + ' ' + c.label : id; };

window.ADMIN_EMAIL = 'nisar733308@gmail.com';

// ---------- Toast ----------
window.showToast = (msg, ms = 2600) => {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.style.display = 'block';
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.style.display = 'none', ms);
};

// ---------- Setup banner when Firebase config not pasted ----------
window.renderSetupBannerIfNeeded = () => {
  if (window.FIREBASE_READY) return;
  const b = document.createElement('div');
  b.className = 'setup-banner';
  b.innerHTML = '<b>⚙️ Firebase setup baaki hai</b><br>Firebase Console > Bazario project > Project settings > Your apps > Web app register karke config values <code>js/firebaseConfig.js</code> me paste karo. Uske baad app poori tarah chalegi.';
  document.body.prepend(b);
};

// ---------- Auth ----------
window.currentUser = null;
window.userProfile = null;

window.initAuth = (onReady) => {
  if (!window.FIREBASE_READY) { if (onReady) onReady(); return; }
  window.auth.onAuthStateChanged(async (user) => {
    window.currentUser = user;
    window.userProfile = null;
    if (user) {
      try {
        const snap = await window.db.ref('users/' + user.uid).once('value');
        window.userProfile = snap.val() || {};
      } catch (e) {}
    }
    if (onReady) onReady(user);
    document.dispatchEvent(new CustomEvent('bazario-auth', { detail: { user } }));
  });
};

window.openAuthModal = () => {
  const m = document.getElementById('auth-modal');
  if (m) m.classList.add('open');
};
window.closeAuthModal = () => {
  const m = document.getElementById('auth-modal');
  if (m) m.classList.remove('open');
};

window.authErrText = (e) => {
  const s = ((e && e.code) || '') + ' ' + ((e && e.message) || '');
  if (/invalid-credential|INVALID_LOGIN_CREDENTIALS|wrong-password|user-not-found|EMAIL_NOT_FOUND/.test(s))
    return 'गलत ईमेल या पासवर्ड। अगर अकाउंट नहीं बनाया तो "नया अकाउंट" दबाएं, या "पासवर्ड भूल गए?" से रीसेट करें।';
  if (/email-already-in-use|EMAIL_EXISTS/.test(s))
    return 'यह ईमेल पहले से रजिस्टर है। सीधे लॉगिन करें या "पासवर्ड भूल गए?" से रीसेट करें।';
  if (/invalid-email|INVALID_EMAIL/.test(s)) return 'ईमेल सही नहीं लग रहा - दोबारा लिखें।';
  if (/too-many-requests|TOO_MANY_ATTEMPTS/.test(s)) return 'बहुत बार कोशिश हो गई। कुछ मिनट बाद दोबारा करें।';
  if (/network-request-failed/.test(s)) return 'इंटरनेट की समस्या - नेट चेक करके दोबारा करें।';
  return null;
};

window.doResetPass = async () => {
  const email = document.getElementById('auth-email').value.trim();
  if (!email) return alert('पहले ऊपर अपना ईमेल लिखें, फिर "पासवर्ड भूल गए?" दबाएं।');
  try {
    await window.auth.sendPasswordResetEmail(email);
    alert('✅ पासवर्ड रीसेट लिंक ' + email + ' पर भेज दिया गया। ईमेल (और स्पैम फोल्डर) चेक करें।');
  } catch (e) { alert(window.authErrText(e) || ('रीसेट error: ' + e.message)); }
};

window.doLogin = async () => {
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-pass').value;
  if (!email || !pass) return alert('ईमेल और पासवर्ड भरें।');
  try {
    await window.auth.signInWithEmailAndPassword(email, pass);
    window.closeAuthModal();
    window.showToast('✅ लॉगिन हो गया!');
  } catch (e) { alert(window.authErrText(e) || ('लॉगिन error: ' + e.message)); }
};

window.doRegister = async () => {
  const name = document.getElementById('auth-name').value.trim();
  const phone = document.getElementById('auth-phone').value.trim();
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-pass').value;
  if (!name || !phone || !email || !pass) return alert('नाम, मोबाइल, ईमेल, पासवर्ड सब भरें।');
  if (pass.length < 6) return alert('पासवर्ड कम से कम 6 अक्षर का हो।');
  try {
    const cred = await window.auth.createUserWithEmailAndPassword(email, pass);
    await window.db.ref('users/' + cred.user.uid).set({ name, phone, email, createdAt: Date.now(), blocked: false });
    window.closeAuthModal();
    window.showToast('✅ रजिस्ट्रेशन सफल!');
  } catch (e) { alert(window.authErrText(e) || ('रजिस्ट्रेशन error: ' + e.message)); }
};

window.doLogout = () => {
  if (!confirm('लॉगआउट करना है?')) return;
  window.auth.signOut().then(() => { window.showToast('👋 लॉगआउट हो गया'); setTimeout(() => location.href = 'index.html', 600); });
};

// ---------- Auth modal markup (shared) ----------
window.injectAuthModal = () => {
  if (document.getElementById('auth-modal') || !document.body) return;
  const div = document.createElement('div');
  div.innerHTML = `
  <div class="modal" id="auth-modal">
    <div class="modal-card">
      <button class="modal-close" onclick="closeAuthModal()">\u2715</button>
      <div class="modal-title">\ud83d\udd11 \u0932\u0949\u0917\u093f\u0928 / \u0930\u091c\u093f\u0938\u094d\u091f\u0930</div>
      <div class="field"><label>\u092a\u0942\u0930\u093e \u0928\u093e\u092e (\u0928\u090f \u0905\u0915\u093e\u0909\u0902\u091f \u0915\u0947 \u0932\u093f\u090f)</label><input id="auth-name" placeholder="\u091c\u0948\u0938\u0947: Ramesh Kumar"></div>
      <div class="field"><label>\u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930 (\u0928\u090f \u0905\u0915\u093e\u0909\u0902\u091f \u0915\u0947 \u0932\u093f\u090f)</label><input id="auth-phone" type="tel" maxlength="10" placeholder="10 \u0905\u0902\u0915\u094b\u0902 \u0915\u093e \u0928\u0902\u092c\u0930"></div>
      <div class="field"><label>\u0908\u092e\u0947\u0932 *</label><input id="auth-email" type="email" placeholder="aap@example.com"></div>
      <div class="field"><label>\u092a\u093e\u0938\u0935\u0930\u094d\u0921 *</label><input id="auth-pass" type="password" placeholder="\u0915\u092e \u0938\u0947 \u0915\u092e 6 \u0905\u0915\u094d\u0937\u0930"></div>
      <div class="btn-row">
        <button class="btn btn-primary" onclick="doLogin()">\u0932\u0949\u0917\u093f\u0928</button>
        <button class="btn btn-amber" onclick="doRegister()">\u0928\u092f\u093e \u0905\u0915\u093e\u0909\u0902\u091f</button>
      </div>
      <div style="text-align:center;margin:-4px 0 8px"><span class="report-link" onclick="doResetPass()">\u092a\u093e\u0938\u0935\u0930\u094d\u0921 \u092d\u0942\u0932 \u0917\u090f?</span></div>
      <div class="otp-divider"><span>YA</span></div>
      <div class="field"><label>\ud83d\udcf1 \u092e\u094b\u092c\u093e\u0907\u0932 \u0938\u0947 \u0932\u0949\u0917\u093f\u0928 (OTP)</label><input id="otp-phone" type="tel" maxlength="10" placeholder="10 \u0905\u0902\u0915\u094b\u0902 \u0915\u093e \u092e\u094b\u092c\u093e\u0907\u0932"></div>
      <div id="recaptcha-container" style="margin-bottom:10px"></div>
      <div class="field" id="otp-section" style="display:none"><label>SMS me aaya OTP</label><input id="otp-code" type="tel" maxlength="6" placeholder="6 \u0905\u0902\u0915\u094b\u0902 \u0915\u093e OTP"></div>
      <div id="otp-resend" style="display:none;text-align:center;margin:-6px 0 10px"><span class="report-link" onclick="resendOtp()">\ud83d\udd04 OTP \u0928\u0939\u0940\u0902 \u0906\u092f\u093e? \u0926\u094b\u092c\u093e\u0930\u093e \u092d\u0947\u091c\u094b</span></div>
      <button class="btn btn-outline" id="otp-btn" onclick="handleOtpBtn()">\ud83d\udce9 OTP \u092d\u0947\u091c\u094b</button>
    </div>
  </div>`;
  document.body.appendChild(div.firstElementChild);
};

// ---------- Phone OTP login ----------
window.handleOtpBtn = async () => {
  const sect = document.getElementById('otp-section');
  if (sect && sect.style.display === 'none') return window.sendOtp();
  return window.verifyOtp();
};

window._resetRecaptcha = () => {
  if (window.recaptchaVerifier) {
    try { window.recaptchaVerifier.clear(); } catch (_) {}
    window.recaptchaVerifier = null;
  }
  const rc = document.getElementById('recaptcha-container');
  if (rc) rc.innerHTML = '';
};

window.sendOtp = async (useVisible) => {
  let phone = document.getElementById('otp-phone').value.replace(/\D/g, '');
  if (phone.length === 11 && phone.startsWith('0')) phone = phone.slice(1);
  if (!/^\d{10}$/.test(phone)) return alert('\u0938\u0939\u0940 10 \u0905\u0902\u0915\u094b\u0902 \u0915\u093e \u092e\u094b\u092c\u093e\u0907\u0932 \u0928\u0902\u092c\u0930 \u0921\u093e\u0932\u094b\u0964');
  const btn = document.getElementById('otp-btn');
  btn.disabled = true; btn.textContent = '\u23f3 \u092d\u0947\u091c\u093e \u091c\u093e \u0930\u0939\u093e \u0939\u0948...';
  try {
    window._resetRecaptcha();
    const rc = document.getElementById('recaptcha-container');
    const holder = document.createElement('div');
    rc.appendChild(holder);
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(holder, { size: useVisible ? 'normal' : 'invisible' });
    await window.recaptchaVerifier.render();
    window.confirmationResult = await window.auth.signInWithPhoneNumber('+91' + phone, window.recaptchaVerifier);
    document.getElementById('otp-section').style.display = '';
    const rs = document.getElementById('otp-resend'); if (rs) rs.style.display = '';
    btn.disabled = false;
    btn.textContent = '\u2705 OTP Verify \u0915\u0930\u094b'; btn.className = 'btn btn-primary';
    showToast('\ud83d\udce9 OTP SMS \u0938\u0947 \u092d\u0947\u091c\u093e \u0917\u092f\u093e - 1-2 \u092e\u093f\u0928\u091f \u092e\u0947\u0902 \u0906\u090f\u0917\u093e', 3500);
  } catch (e) {
    const code = e.code || '';
    window._resetRecaptcha();
    btn.disabled = false; btn.textContent = '\ud83d\udce9 OTP \u092d\u0947\u091c\u094b';
    if (/captcha|app-credential|network-request-failed/i.test(code) && !useVisible) {
      showToast('\ud83e\udd16 Neeche "I\'m not a robot" tick karo, phir OTP \u092d\u0947\u091c\u094b dabao', 6000);
      return window.sendOtp(true);
    }
    if (/quota-exceeded|too-many-requests/i.test(code)) {
      alert('Aaj ki free SMS limit (10) khatam ho gayi hai. Kal try karo, ya abhi email + password se login kar lo.');
    } else if (/invalid-phone-number/i.test(code)) {
      alert('Number sahi nahi lag raha. Bina +91/0 ke sirf 10 ank daalo.');
    } else {
      alert('OTP nahi ja paya (' + code + '): ' + e.message + '\n\nInternet check karke dobara try karo. Baar-baar na chale to email + password se login ho jata hai.');
    }
  }
};

window.resendOtp = () => {
  window._resetRecaptcha();
  const sect = document.getElementById('otp-section'); if (sect) sect.style.display = 'none';
  const rs = document.getElementById('otp-resend'); if (rs) rs.style.display = 'none';
  const btn = document.getElementById('otp-btn');
  btn.className = 'btn btn-outline';
  window.sendOtp(true);
};

window.verifyOtp = async () => {
  const code = document.getElementById('otp-code').value.trim();
  if (code.length !== 6) return alert('6 \u0905\u0902\u0915\u094b\u0902 \u0915\u093e OTP \u0921\u093e\u0932\u094b\u0964');
  const btn = document.getElementById('otp-btn');
  btn.disabled = true; btn.textContent = '\u23f3 Check ho raha hai...';
  try {
    const cred = await window.confirmationResult.confirm(code);
    const uref = window.db.ref('users/' + cred.user.uid);
    const snap = await uref.once('value');
    if (!snap.exists()) {
      const name = document.getElementById('auth-name').value.trim();
      const phone = document.getElementById('otp-phone').value.replace(/\D/g, '').slice(-10);
      await uref.set({ name: name || 'User', phone, email: '', createdAt: Date.now(), blocked: false });
    }
    window.closeAuthModal();
    window._resetRecaptcha();
    showToast('\u2705 \u092e\u094b\u092c\u093e\u0907\u0932 \u0938\u0947 \u0932\u0949\u0917\u093f\u0928 \u0939\u094b \u0917\u092f\u093e!');
  } catch (e) {
    btn.disabled = false; btn.textContent = '\u2705 OTP Verify \u0915\u0930\u094b';
    const code2 = e.code || '';
    if (/invalid-verification-code/i.test(code2)) alert('OTP galat hai. SMS wala 6 ank dhyan se daalo.');
    else if (/code-expired/i.test(code2)) alert('OTP expire ho gaya. "OTP दोबारा भेजो" dabao.');
    else alert('Verify nahi hua (' + code2 + '): ' + e.message);
  }
};

// ---------- Photo compression (no Storage needed) ----------
window.compressPhoto = (file, maxSize = 800, quality = 0.72) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const scale = Math.min(1, maxSize / Math.max(width, height));
      width = Math.round(width * scale); height = Math.round(height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = e.target.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

// ---------- Formatting ----------
window.fmtPrice = (p) => '₹' + Number(p || 0).toLocaleString('en-IN');
window.timeAgo = (ts) => {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'अभी-अभी';
  if (s < 3600) return Math.floor(s / 60) + ' मिनट पहले';
  if (s < 86400) return Math.floor(s / 3600) + ' घंटे पहले';
  return Math.floor(s / 86400) + ' दिन पहले';
};
window.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// ---------- Favorites ----------
window.getFavs = async () => {
  if (!window.currentUser) return {};
  try {
    const snap = await window.db.ref('users/' + window.currentUser.uid + '/favorites').once('value');
    return snap.val() || {};
  } catch (e) { return {}; }
};

window.toggleFav = async (adId) => {
  if (!window.currentUser) { openAuthModal(); showToast('पसंद के liye पहले लॉगिन करो'); return null; }
  const ref = window.db.ref('users/' + window.currentUser.uid + '/favorites/' + adId);
  try {
    const snap = await ref.once('value');
    if (snap.exists()) { await ref.remove(); return false; }
    await ref.set(Date.now());
    return true;
  } catch (e) { showToast('⚠️ कुछ गड़बड़ हुई'); return null; }
};

// ---------- Chat ----------
window.openChatWithSeller = async (ad) => {
  if (!window.currentUser) { openAuthModal(); showToast('Chat के liye पहले लॉगिन करो'); return; }
  if (window.currentUser.uid === ad.uid) return;
  const buyer = window.currentUser;
  const myName = (window.userProfile && window.userProfile.name) || 'Buyer';
  const chatId = ad.id + '_' + buyer.uid;
  const ref = window.db.ref('chats/' + chatId);
  let exists = false;
  try { exists = (await ref.once('value')).exists(); } catch (e) { exists = false; }
  if (!exists) {
    const ts = Date.now();
    await ref.set({
      adId: ad.id,
      adTitle: ad.title || '',
      members: { [buyer.uid]: true, [ad.uid]: true },
      names: { [buyer.uid]: myName, [ad.uid]: ad.sellerName || 'Seller' },
      lastMsg: '', lastTs: ts
    });
    const upd = {};
    upd['userChats/' + buyer.uid + '/' + chatId] = { adId: ad.id, adTitle: ad.title || '', otherUid: ad.uid, otherName: ad.sellerName || 'Seller', lastMsg: '', lastTs: ts, lastFrom: '' };
    upd['userChats/' + ad.uid + '/' + chatId] = { adId: ad.id, adTitle: ad.title || '', otherUid: buyer.uid, otherName: myName, lastMsg: '', lastTs: ts, lastFrom: '' };
    await window.db.ref().update(upd);
  }
  location.href = 'chat.html?chat=' + encodeURIComponent(chatId);
};

// ---------- Chat notifications (foreground) ----------
window.askNotifPermission = () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
};

window.watchChatNotifications = () => {
  if (!window.currentUser || !window.FIREBASE_READY) return;
  const uid = window.currentUser.uid;
  const seenKey = 'bazario-chatseen-' + uid;
  let lastSeen = Number(localStorage.getItem(seenKey) || 0);
  let firstLoad = true;
  window.db.ref('userChats/' + uid).on('value', (snap) => {
    const val = snap.val() || {};
    let newest = 0, newestChat = null;
    Object.keys(val).forEach(id => {
      const c = val[id];
      if ((c.lastTs || 0) > newest) { newest = c.lastTs; newestChat = { id, ...c }; }
    });
    if (firstLoad) {
      firstLoad = false;
      if (newest > lastSeen) { lastSeen = newest; localStorage.setItem(seenKey, String(lastSeen)); }
      return;
    }
    if (newestChat && newest > lastSeen) {
      lastSeen = newest; localStorage.setItem(seenKey, String(lastSeen));
      if (newestChat.lastFrom === uid) return;
      const title = '\ud83d\udcac ' + (newestChat.otherName || 'Naya message');
      const body = newestChat.lastMsg || 'Naya message aaya hai';
      showToast(title + ': ' + body, 4200);
      if ('Notification' in window && Notification.permission === 'granted') {
        try { new Notification(title, { body, icon: './icon-192.png' }); } catch (e) {}
      }
    }
  });
};

// ---------- FCM token registration (admin broadcasts; dormant till VAPID key) ----------
window.initFcm = async () => {
  if (!window.FIREBASE_READY || !window.FCM_VAPID_KEY || !window.currentUser) return;
  if (typeof firebase.messaging !== 'function' || !('serviceWorker' in navigator)) return;
  try {
    const messaging = firebase.messaging();
    const reg = await navigator.serviceWorker.getRegistration();
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') return;
    messaging.onMessage((payload) => {
      const n = (payload && payload.notification) || {};
      showToast('\ud83d\udd14 ' + (n.title || 'Bazario') + ': ' + (n.body || ''), 4500);
    });
    const token = await messaging.getToken({ vapidKey: window.FCM_VAPID_KEY, serviceWorkerRegistration: reg });
    if (token) {
      const key = btoa(token).replace(/[^a-zA-Z0-9]/g, '').slice(-16);
      await window.db.ref('users/' + window.currentUser.uid + '/fcmTokens/' + key).set(token);
    }
  } catch (e) { console.log('FCM skip:', e.message); }
};

// ---------- Notification enable banner (user-tapped, reliable prompt) ----------
window.enableNotifications = async () => {
  if (!window.FIREBASE_READY) return showToast('\u26a0\ufe0f Internet check karo');
  if (!window.currentUser) { openAuthModal(); return showToast('\u092a\u0939\u0932\u0947 \u0932\u0949\u0917\u093f\u0928 \u0915\u0930\u094b'); }
  if (!('Notification' in window)) return showToast('\u26a0\ufe0f Ye browser notification support nahi karta', 4000);
  const b = document.getElementById('notif-banner');
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') {
      return showToast('\u274c Permission nahi mili. Phone Settings > Apps > Bazario/Chrome > Notifications ON karo, phir dobara try karo', 6000);
    }
    if (typeof firebase.messaging !== 'function' || !window.FCM_VAPID_KEY) {
      return showToast('\u26a0\ufe0f Notification setup adhoora hai - app refresh karke dobara try karo', 5000);
    }
    showToast('\u23f3 Notification chalu ho rahi hai...', 2000);
    const messaging = firebase.messaging();
    const reg = await navigator.serviceWorker.getRegistration();
    const token = await messaging.getToken({ vapidKey: window.FCM_VAPID_KEY, serviceWorkerRegistration: reg });
    if (!token) return showToast('\u26a0\ufe0f Token nahi ban paya - refresh karke try karo', 5000);
    const key = btoa(token).replace(/[^a-zA-Z0-9]/g, '').slice(-16);
    await window.db.ref('users/' + window.currentUser.uid + '/fcmTokens/' + key).set(token);
    if (b) b.style.display = 'none';
    showToast('\u2705 Notification ON! Ab sab updates pahunchenge.', 4500);
  } catch (e) {
    showToast('\u26a0\ufe0f Notification setup fail: ' + e.message, 6000);
  }
};
