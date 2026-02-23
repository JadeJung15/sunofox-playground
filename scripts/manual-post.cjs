const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ serviceAccountKey.json 파일이 없습니다. 수동 등록을 진행할 수 없습니다.');
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const title = "✨ SevenCheck 그랜드 업데이트: 더 깊어진 분석과 소통의 시작";
const content = `안녕하세요, SevenCheck 이용자 여러분!
더욱 풍성하고 즐거운 서비스 경험을 위해 진행된 '그랜드 업데이트' 내역을 안내해 드립니다.

1. 📸 결과 이미지 저장 & 실시간 통계 도입
이제 테스트 결과를 예쁜 카드 형태로 소장할 수 있습니다!
- '이미지 저장' 버튼을 통해 나의 분석 리포트를 갤러리에 저장해 보세요.
- 내가 얻은 결과가 참여자 중 상위 몇 %인지 실시간 통계 그래프로 확인할 수 있습니다.

2. 💬 통합 커뮤니티 센터 오픈
공지사항과 자유게시판이 하나로 합쳐졌습니다!
- 상단 탭을 통해 새로운 소식과 유저들의 이야기를 더 간편하게 오갈 수 있습니다.
- 이제 게시판에 글을 쓰면 일일 퀘스트 포인트도 받을 수 있어요!

3. 🔔 실시간 알림 시스템
내 글에 댓글이 달리면 상단 🔔 아이콘이 알려드립니다!
- 중요한 반응을 놓치지 말고 실시간으로 소통해 보세요.

4. 📜 일일 퀘스트 & 보상 강화
세븐 오락실에 '일일 퀘스트'가 추가되었습니다.
- 매일 출석하기, 테스트 참여하기, 게시글 작성하기를 완료하고 추가 포인트를 획득하세요.

5. ✨ 명예로운 티어 오라(Aura) 효과
높은 등급의 수집가들에게 걸맞은 특별한 효과가 적용됩니다!
- 플래티넘 및 다이아몬드 등급 유저가 게시판에 글을 쓰면 이름 테두리에 화려한 애니메이션 오라가 나타납니다.

6. 📱 모바일 최적화 및 UI 개선
스마트폰에서도 모든 기능을 쾌적하게 이용할 수 있도록 대시보드 배치를 최적화했습니다.

---
SevenCheck은 여러분의 피드백을 바탕으로 매일 성장하고 있습니다. 
지금 바로 새로운 기능들을 체험해 보세요! 

감사합니다.
- SevenCheck Studio -`;

db.collection('announcements').add({
    title: title,
    content: content,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
}).then(() => {
    console.log('✅ 공지사항이 성공적으로 등록되었습니다.');
    process.exit(0);
}).catch(err => {
    console.error('❌ 등록 실패:', err);
    process.exit(1);
});
