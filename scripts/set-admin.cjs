const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Usage:
// 1) Download Firebase service account key JSON from console.
// 2) Save it as `serviceAccountKey.json` in this scripts folder.
// 3) Set UID below, then run: `node scripts/set-admin.cjs`

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = '6LVa2hs5ICSi4cgNjRBAx3dA2In2';

admin
  .auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`Admin claim set for uid: ${uid}`);
  })
  .catch((err) => {
    console.error('Failed to set admin claim:', err);
    process.exit(1);
  });
