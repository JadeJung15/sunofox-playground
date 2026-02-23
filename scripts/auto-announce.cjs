const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.log('⚠️ serviceAccountKey.json not found. Skipping auto-announcement.');
    process.exit(0);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

try {
    const lastCommitMsg = execSync('git log -1 --pretty=%B').toString().trim();
    const lastCommitHash = execSync('git log -1 --pretty=%h').toString().trim();
    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    console.log(`🚀 Posting announcement: ${lastCommitMsg}`);

    const announcement = {
        title: `🔄 시스템 자동 업데이트 (${today})`,
        content: `기능 업데이트 안내\n\n[내역]\n- ${lastCommitMsg.split('\n')[0]}\n\nBuild: ${lastCommitHash}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    db.collection('announcements').add(announcement)
        .then(() => {
            console.log('✅ Success!');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Firestore Error:', err);
            process.exit(0);
        });

} catch (error) {
    console.error('❌ Git Error:', error);
    process.exit(0);
}
