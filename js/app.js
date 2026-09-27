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

window.doLogin = async () => {
  const email = document.getElementById('auth-email').value.trim();
  const pass = document.getElementById('auth-pass').value;
  if (!email || !pass) return alert('ईमेल और पासवर्ड भरें।');
  try {
    await window.auth.signInWithEmailAndPassword(email, pass);
    window.closeAuthModal();
    window.showToast('✅ लॉगिन हो गया!');
  } catch (e) { alert('लॉगिन error: ' + e.message); }
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
  } catch (e) { alert('रजिस्ट्रेशन error: ' + e.message); }
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
      <button class="modal-close" onclick="closeAuthModal()">✕</button>
      <div class="modal-title">🔑 लॉगिन / रजिस्टर</div>
      <div class="field"><label>पूरा नाम (नए अकाउंट के लिए)</label><input id="auth-name" placeholder="जैसे: Ramesh Kumar"></div>
      <div class="field"><label>मोबाइल नंबर (नए अकाउंट के लिए)</label><input id="auth-phone" type="tel" maxlength="10" placeholder="10 अंकों का नंबर"></div>
      <div class="field"><label>ईमेल *</label><input id="auth-email" type="email" placeholder="aap@example.com"></div>
      <div class="field"><label>पासवर्ड *</label><input id="auth-pass" type="password" placeholder="कम से कम 6 अक्षर"></div>
      <div class="btn-row">
        <button class="btn btn-primary" onclick="doLogin()">लॉगिन</button>
        <button class="btn btn-amber" onclick="doRegister()">नया अकाउंट</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(div.firstElementChild);
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
