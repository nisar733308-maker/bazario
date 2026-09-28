# Bazario

अपने इलाके का classifieds app (OLX-style) - mobile-first PWA.

## क्या-क्या है
- 📦 Ad post (title, daam, category, 1-5 photo, ilaqa, mobile)
- 🏠 Home - naye ads, category filter, search
- 📄 Ad page - Call/WhatsApp seller
- ✏️ Mere Ads - pause/delete
- 🛡️ Admin panel (`admin.html`, sirf nisar733308@gmail.com)

## Setup (Firebase)
1. Firebase Console > **Bazario** project > Project settings > Your apps > Web app (</>) register karo
2. Jo config mile, uski values `js/firebaseConfig.js` me paste karo
3. Authentication > Sign-in method > **Email/Password** enable karo
4. Realtime Database banao (locked mode), phir Rules tab me `firebase-rules.json` ka content paste karke Publish karo
5. Done - site live hai GitHub Pages pe

Photos abhi database me compressed base64 me save hote hain (koi paid Storage nahi chahiye). Scale badhne pe Firebase Storage pe shift karna.

## Tech
Plain HTML/CSS/JS + Firebase (Auth + Realtime Database), GitHub Pages hosting, PWA installable.

## Local district choices
The district dropdown ships an offline list adapted from the third-party
[KTBsomen/Indian-state-district-json](https://github.com/KTBsomen/Indian-state-district-json)
under its MIT license (`data/DISTRICTS-LICENSE.txt`). It is **not verified as an official or
fully current government list**. Maharajganj's spelling was checked against its district
website, https://maharajganj.nic.in/, on 28 September 2026. Review/correct the rest
before relying on the list for nationwide onboarding. Old ad district text is retained
and old Maharajganj/Mahrajganj spellings are treated as one in the home filter.

This preview is on a separate branch; merge only after owner reviews screenshots.
