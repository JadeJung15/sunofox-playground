// js/app.js
const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');

// 테스트 데이터베이스 (Anime Style 비주얼 + 7단계 질문 + 상세 한글 결과)
const TESTS = [
    { 
        id: 'real-mbti', 
        category: '성격', 
        title: '나의 진짜 내면 성격', 
        desc: '겉모습 속에 숨겨진 당신의 진짜 성격을 7번의 선택으로 확인하세요.', 
        thumb: 'https://images.unsplash.com/photo-1578632738908-4521c442075a?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '주말 아침, 창밖을 보며 드는 생각은?', options: [{ text: '밖으로 나가 사람들을 만나고 싶다', type: 'E' }, { text: '집에서 조용히 여유를 즐기고 싶다', type: 'I' }] },
            { q: '새로운 취미를 시작한다면?', options: [{ text: '활동적인 동호회 활동', type: 'E' }, { text: '혼자서 하는 독서나 그리기', type: 'I' }] },
            { q: '친구의 갑작스러운 약속 제안에?', options: [{ text: '좋아! 어디서 볼까?', type: 'E' }, { text: '미안, 오늘은 좀 쉬고 싶어', type: 'I' }] },
            { q: '문제가 생겼을 때 해결 방식은?', options: [{ text: '주변에 조언을 구하고 대화한다', type: 'E' }, { text: '혼자 깊이 고민하며 해결책을 찾는다', type: 'I' }] },
            { q: '자신을 표현하는 단어는?', options: [{ text: '에너제틱하고 사교적인', type: 'E' }, { text: '차분하고 사색적인', type: 'I' }] },
            { q: '파티에 초대받았을 때 나의 모습은?', options: [{ text: '처음 본 사람과도 금방 친해진다', type: 'E' }, { text: '아는 사람 곁에만 머무른다', type: 'I' }] },
            { q: '하루를 마무리하는 가장 좋은 방법은?', options: [{ text: '왁자지껄한 모임 후의 수다', type: 'E' }, { text: '조명 아래 혼자만의 일기 쓰기', type: 'I' }] }
        ],
        results: {
            E: { title: '빛나는 햇살 에너지', desc: '당신은 주변을 밝게 비추는 태양 같은 사람입니다. 사람들과의 만남에서 힘을 얻고, 긍정적인 에너지를 전파하는 능력이 탁월하군요!' },
            I: { title: '포근한 달빛 감성', desc: '당신은 깊고 은은한 매력을 가진 달빛 같은 사람입니다. 혼자만의 시간에서 창의성을 발휘하며, 내면의 단단한 중심을 가진 분이시네요.' }
        }
    },
    { 
        id: 'love-destiny', 
        category: '감성', 
        title: '나의 운명적 연애 타입', 
        desc: '애니메이션 같은 로맨틱한 연애, 당신은 어떤 사랑을 꿈꾸나요?', 
        thumb: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '운명적인 만남이 시작된다면?', options: [{ text: '첫눈에 불꽃이 튀는 강렬한 만남', type: 'A' }, { text: '서서히 스며드는 따뜻한 만남', type: 'B' }] },
            { q: '연인과 가고 싶은 장소는?', options: [{ text: '화려한 야경이 보이는 도심', type: 'A' }, { text: '은은한 파도 소리가 들리는 바다', type: 'B' }] },
            { q: '질투심이 느껴질 때 당신은?', options: [{ text: '솔직하게 서운함을 바로 표현한다', type: 'A' }, { text: '혼자 마음을 정리하며 지켜본다', type: 'B' }] },
            { q: '당신이 생각하는 이상적인 연애는?', options: [{ text: '매일이 새로운 열정적인 사랑', type: 'A' }, { text: '서로를 이해하고 믿어주는 안정된 사랑', type: 'B' }] },
            { q: '기념일에 당신의 준비는?', options: [{ text: '화려한 서프라이즈 이벤트', type: 'A' }, { text: '진심이 담긴 손편지와 작은 선물', type: 'B' }] },
            { q: '연애할 때 나의 연락 스타일은?', options: [{ text: '틈날 때마다 일상을 공유하는 톡', type: 'A' }, { text: '중요한 순간에 진심을 전하는 통화', type: 'B' }] },
            { q: '함께 꿈꾸는 미래의 모습은?', options: [{ text: '세계를 여행하며 즐기는 모험', type: 'A' }, { text: '따뜻한 집에서 나누는 소소한 일상', type: 'B' }] }
        ],
        results: {
            A: { title: '불꽃 같은 정열파', desc: '당신은 사랑 앞에 당당하고 열정적인 사람입니다. 연인에게 모든 것을 쏟아붓는 순수한 마음을 가졌으며, 당신과의 연애는 언제나 영화처럼 극적일 거예요.' },
            B: { title: '포근한 안식처파', desc: '당신은 연인에게 쉼터가 되어주는 따뜻한 사람입니다. 상대의 마음을 섬세하게 살필 줄 알며, 시간이 지날수록 깊어지는 진한 사랑을 하는 타입이네요.' }
        }
    },
    { 
        id: 'office-warrior', 
        category: '성격', 
        title: '직장 속 나의 부캐 찾기', 
        desc: '사무실이라는 전장에서 당신은 어떤 전사일까요?', 
        thumb: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '출근 후 가장 먼저 하는 일은?', options: [{ text: '오늘의 할 일을 완벽하게 정리', type: 'Plan' }, { text: '커피 한 잔과 함께 기분 전환', type: 'Flow' }] },
            { q: '회의 시간에 당신의 태도는?', options: [{ text: '핵심을 찌르는 의견 제시', type: 'Plan' }, { text: '분위기를 부드럽게 만드는 리액션', type: 'Flow' }] },
            { q: '업무 중 예상치 못한 실수를 했다면?', options: [{ text: '원인을 분석하고 즉시 수정한다', type: 'Plan' }, { text: '당황하지 않고 유연하게 대처한다', type: 'Flow' }] },
            { q: '야근이 확정되었을 때 당신은?', options: [{ text: '최대한 빠르게 일을 끝내려 집중한다', type: 'Plan' }, { text: '동료들과 간식을 먹으며 힘을 낸다', type: 'Flow' }] },
            { q: '직장 동료가 실수를 했을 때?', options: [{ text: '해결 방법을 논리적으로 알려준다', type: 'Plan' }, { text: '괜찮다고 다독이며 격려해준다', type: 'Flow' }] },
            { q: '퇴근 후 나의 모습은?', options: [{ text: '자기계발이나 계획적인 운동', type: 'Plan' }, { text: '침대에서 맛있는 것 먹으며 힐링', type: 'Flow' }] },
            { q: '다음 프로젝트를 맡게 된다면?', options: [{ text: '모든 과정을 철저히 리드하고 싶다', type: 'Plan' }, { text: '자유로운 환경에서 창의력을 발휘하고 싶다', type: 'Flow' }] }
        ],
        results: {
            Plan: { title: '완벽주의 전략가', desc: '당신은 철저한 계획과 실행력을 겸비한 스마트한 인재입니다. 어떤 어려운 프로젝트도 당신의 손을 거치면 완벽하게 성공하게 될 거예요!' },
            Flow: { title: '유연한 분위기 메이커', desc: '당신은 조직의 윤활유 같은 존재입니다. 뛰어난 공감 능력과 창의적인 발상으로 팀의 사기를 높이고 문제를 독창적으로 해결하는군요.' }
        }
    },
    { 
        id: 'fashion-aura', 
        category: '감성', 
        title: '나만의 분위기 코드', 
        desc: '당신을 감싸고 있는 오라(Aura)는 어떤 색깔인가요?', 
        thumb: 'https://images.unsplash.com/photo-1560972550-aba3456b5564?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '당신이 좋아하는 아침 풍경은?', options: [{ text: '안개 낀 고요한 숲', type: 'Cool' }, { text: '햇살이 쏟아지는 창가', type: 'Warm' }] },
            { q: '더 끌리는 질감은?', options: [{ text: '매끄럽고 차가운 실크', type: 'Cool' }, { text: '폭신하고 부드러운 니트', type: 'Warm' }] },
            { q: '가장 좋아하는 색조는?', options: [{ text: '시크한 무채색이나 블루', type: 'Cool' }, { text: '화사한 파스텔이나 오렌지', type: 'Warm' }] },
            { q: '당신을 닮은 보석은?', options: [{ text: '신비로운 다이아몬드', type: 'Cool' }, { text: '따뜻한 호박(Amber)', type: 'Warm' }] },
            { q: '비 오는 날 당신의 기분은?', options: [{ text: '차분해지며 사색에 잠긴다', type: 'Cool' }, { text: '포근한 분위기에 행복해진다', type: 'Warm' }] },
            { q: '사람들이 말하는 당신의 이미지는?', options: [{ text: '도회적이고 지적인 느낌', type: 'Cool' }, { text: '친근하고 사랑스러운 느낌', type: 'Warm' }] },
            { q: '자주 사용하는 향수는?', options: [{ text: '상쾌한 시트러스나 우디 향', type: 'Cool' }, { text: '달콤한 바닐라나 플로럴 향', type: 'Warm' }] }
        ],
        results: {
            Cool: { title: '미스티 블루 오라', desc: '당신은 신비롭고 세련된 분위기를 가진 사람입니다. 차분한 카리스마로 주변 사람들에게 신뢰감을 주며, 범접할 수 없는 독특한 매력이 있네요.' },
            Warm: { title: '피치 골드 오라', desc: '당신은 보고만 있어도 마음이 따뜻해지는 사람입니다. 밝고 긍정적인 기운으로 주변을 치유하며, 모두에게 사랑받는 포근한 에너지를 가졌군요.' }
        }
    },
    { 
        id: 'money-road', 
        category: '사주', 
        title: '미래 재물운 보고서', 
        desc: '7번의 선택으로 알아보는 나의 황금빛 미래 재력', 
        thumb: 'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '갑자기 거액의 복권에 당첨된다면?', options: [{ text: '즉시 안전한 곳에 투자한다', type: 'Rich' }, { text: '그동안 사고 싶었던 것을 산다', type: 'Happy' }] },
            { q: '물건을 살 때 당신의 기준은?', options: [{ text: '미래의 가치와 가성비', type: 'Rich' }, { text: '지금 당장 느끼는 디자인과 만족', type: 'Happy' }] },
            { q: '재테크에 대한 당신의 생각은?', options: [{ text: '공부를 통해 공격적으로 도전', type: 'Rich' }, { text: '차곡차곡 저축하며 안정적으로', type: 'Happy' }] },
            { q: '성공한 부자의 삶 중 부러운 것은?', options: [{ text: '끊임없이 불어나는 자산', type: 'Rich' }, { text: '제약 없이 누리는 자유로운 시간', type: 'Happy' }] },
            { q: '길을 가다 반짝이는 동전을 발견하면?', options: [{ text: '행운의 징조라며 소중히 챙긴다', type: 'Rich' }, { text: '기분 좋게 웃으며 지나간다', type: 'Happy' }] },
            { q: '당신의 지갑 스타일은?', options: [{ text: '깔끔하게 정리된 장지갑', type: 'Rich' }, { text: '가볍고 편안한 카드지갑', type: 'Happy' }] },
            { q: '10년 후 나의 모습은?', options: [{ text: '자수성가한 경제적 자유인', type: 'Rich' }, { text: '좋아하는 일을 하며 사는 행복한 사람', type: 'Happy' }] }
        ],
        results: {
            Rich: { title: '자수성가 자산가형', desc: '당신은 돈의 흐름을 읽는 본능적인 감각을 가졌습니다. 치밀한 계산과 결단력으로 미래에 큰 부를 쌓을 잠재력이 매우 높네요!' },
            Happy: { title: '풍요로운 라이프형', desc: '당신은 돈보다 가치 있는 삶을 즐길 줄 아는 사람입니다. 성실하게 쌓아온 기반 위에 소소한 행운이 겹쳐 늘 여유롭고 풍족한 삶을 살게 될 거예요.' }
        }
    },
    { 
        id: 'hidden-talent', 
        category: '성격', 
        title: '나의 숨겨진 천재성', 
        desc: '아직 발견하지 못한 당신만의 특별한 재능을 찾아보세요.', 
        thumb: 'https://images.unsplash.com/photo-1513001900722-370f803f498d?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '복잡한 퍼즐을 마주했을 때?', options: [{ text: '끝까지 물고 늘어져 풀어낸다', type: 'Logic' }, { text: '전체적인 모양을 보며 감으로 맞춘다', type: 'Art' }] },
            { q: '평소에 아이디어가 떠오르면?', options: [{ text: '메모장에 꼼꼼히 기록한다', type: 'Logic' }, { text: '머릿속으로 상상하며 즐긴다', type: 'Art' }] },
            { q: '좋아하는 과목은?', options: [{ text: '수학이나 과학 같은 이과 계열', type: 'Logic' }, { text: '미술이나 음악 같은 예체능 계열', type: 'Art' }] },
            { q: '길을 설명할 때 당신은?', options: [{ text: '몇 미터 직진 후 좌회전하세요', type: 'Logic' }, { text: '저기 빨간 건물 보이면 꺾으세요', type: 'Art' }] },
            { q: '당신의 책상 상태는?', options: [{ text: '칼같이 정리된 상태', type: 'Logic' }, { text: '자유분방하게 어질러진 상태', type: 'Art' }] },
            { q: '결정을 내릴 때 중요한 것은?', options: [{ text: '객관적인 근거와 데이터', type: 'Logic' }, { text: '나의 느낌과 감정', type: 'Art' }] },
            { q: '새로운 기계를 샀을 때?', options: [{ text: '설명서를 정독한다', type: 'Logic' }, { text: '일단 이것저것 만져본다', type: 'Art' }] }
        ],
        results: {
            Logic: { title: '분석적인 전략가', desc: '당신은 논리적이고 치밀한 사고력을 가졌습니다. 복잡한 문제를 단순화하여 해결하는 능력이 뛰어나며, 리더로서의 자질이 충분합니다.' },
            Art: { title: '창의적인 예술가', desc: '당신은 남들이 보지 못하는 세상을 보는 눈을 가졌습니다. 풍부한 상상력과 공감 능력은 세상을 더 아름답게 만드는 큰 힘이 됩니다.' }
        }
    },
    { 
        id: 'food-soul', 
        category: '감성', 
        title: '나의 소울 푸드 분석', 
        desc: '음식 취향으로 알아보는 당신의 성격과 감성 상태', 
        thumb: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '오늘따라 스트레스가 쌓였다면?', options: [{ text: '땀이 날 정도로 매운 음식', type: 'Strong' }, { text: '입안에서 녹는 달콤한 디저트', type: 'Mild' }] },
            { q: '선호하는 맛의 계열은?', options: [{ text: '강렬하고 짠맛의 조화', type: 'Strong' }, { text: '담백하고 건강한 맛', type: 'Mild' }] },
            { q: '식사할 때 가장 중요한 것은?', options: [{ text: '푸짐한 양과 포만감', type: 'Strong' }, { text: '정갈한 플레이팅과 분위기', type: 'Mild' }] },
            { q: '친구와 맛집을 간다면?', options: [{ text: '줄 서서 기다리는 유명 맛집', type: 'Strong' }, { text: '조용하고 대화하기 좋은 곳', type: 'Mild' }] },
            { q: '새로운 도전에 대해?', options: [{ text: '처음 보는 이색 요리 도전!', type: 'Strong' }, { text: '늘 먹던 익숙한 메뉴 선택', type: 'Mild' }] },
            { q: '요리할 때 나의 스타일은?', options: [{ text: '화려한 기술과 불 맛!', type: 'Strong' }, { text: '정성이 담긴 느린 요리', type: 'Mild' }] },
            { q: '당신을 비유한다면?', options: [{ text: '톡 쏘는 탄산음료', type: 'Strong' }, { text: '따뜻한 라떼 한 잔', type: 'Mild' }] }
        ],
        results: {
            Strong: { title: '강렬한 핫스파이시', desc: '당신은 솔직하고 에너지가 넘치는 사람입니다. 호불호가 확실하며, 목표를 향해 거침없이 나아가는 화끈한 성격의 소유자군요!' },
            Mild: { title: '부드러운 밀크 바닐라', desc: '당신은 다정다감하고 평화를 사랑하는 사람입니다. 주변을 편안하게 만드는 매력이 있으며, 사소한 것에서도 행복을 찾을 줄 아는 분이네요.' }
        }
    },
    { 
        id: 'past-life-anime', 
        category: '사주', 
        title: '나의 전생 판타지', 
        desc: '전생에 당신은 어떤 세상을 구했을까요?', 
        thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '전쟁터 한복판, 당신의 손에 들린 것은?', options: [{ text: '날카로운 전설의 성검', type: 'Hero' }, { text: '신비로운 마법의 지팡이', type: 'Sage' }] },
            { q: '당신이 다스리던 땅은?', options: [{ text: '화려하고 거대한 왕국', type: 'Hero' }, { text: '구름 위의 비밀스러운 섬', type: 'Sage' }] },
            { q: '백성들이 당신을 부르던 칭호는?', options: [{ text: '무적의 수호자', type: 'Hero' }, { text: '지혜로운 인도자', type: 'Sage' }] },
            { q: '당신의 가장 충성스러운 동료는?', options: [{ text: '강력한 용의 기사', type: 'Hero' }, { text: '영리한 숲의 정령', type: 'Sage' }] },
            { q: '어려운 결정을 내릴 때 당신은?', options: [{ text: '직감과 용기로 밀어붙인다', type: 'Hero' }, { text: '별의 움직임을 읽어 판단한다', type: 'Sage' }] },
            { q: '휴식할 때 즐기던 것은?', options: [{ text: '화려한 연회와 사냥', type: 'Hero' }, { text: '도서관에서의 고대 서적 읽기', type: 'Sage' }] },
            { q: '현생의 나에게 전하고 싶은 메시지는?', options: [{ text: '두려워 말고 도전하라', type: 'Hero' }, { text: '늘 지혜롭게 생각하라', type: 'Sage' }] }
        ],
        results: {
            Hero: { title: '대륙의 패왕, 전설의 용사', desc: '전생에 당신은 대륙을 호령하던 용맹한 용사였습니다. 현생에서도 당신의 강한 의지와 리더십은 어디서든 빛을 발하게 될 것입니다.' },
            Sage: { title: '하늘의 예언자, 신비의 마도사', desc: '전생에 당신은 세상을 올바른 길로 인도하던 현자였습니다. 깊은 통찰력과 직관은 당신이 살아가며 마주할 모든 어려움을 해결해 줄 열쇠입니다.' }
        }
    },
    { 
        id: 'pet-match', 
        category: '감성', 
        title: '나와 닮은 영혼의 반려동물', 
        desc: '7번의 질문으로 만나는 당신의 운명적인 짝궁 동물', 
        thumb: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '혼자 있을 때 당신은?', options: [{ text: '누군가 보고 싶어 연락한다', type: 'Dog' }, { text: '혼자만의 자유를 만끽한다', type: 'Cat' }] },
            { q: '칭찬을 받았을 때 나의 반응은?', options: [{ text: '너무 좋아서 꼬리를 흔들듯 기뻐한다', type: 'Dog' }, { text: '덤덤하게 고맙다고 말한다', type: 'Cat' }] },
            { q: '산책을 나간다면?', options: [{ text: '새로운 길을 탐험하며 신나게', type: 'Dog' }, { text: '익숙하고 편안한 길로 천천히', type: 'Cat' }] },
            { q: '처음 보는 사람을 대할 때?', options: [{ text: '먼저 다가가 인사를 건넨다', type: 'Dog' }, { text: '거리를 두고 조심스럽게 살핀다', type: 'Cat' }] },
            { q: '집안의 상태는?', options: [{ text: '장난감과 물건이 섞인 활기찬 상태', type: 'Dog' }, { text: '정돈되고 깔끔한 상태', type: 'Cat' }] },
            { q: '애정 표현을 할 때?', options: [{ text: '아낌없이 온몸으로 표현한다', type: 'Dog' }, { text: '은근하게 챙겨주며 표현한다', type: 'Cat' }] },
            { q: '당신을 더 기쁘게 하는 것은?', options: [{ text: '다 함께 즐거운 시간', type: 'Dog' }, { text: '나만의 공간에서의 휴식', type: 'Cat' }] }
        ],
        results: {
            Dog: { title: '사랑스러운 골든 리트리버', desc: '당신은 존재만으로도 주변을 행복하게 만드는 무한 긍정주의자입니다. 사람을 진심으로 아끼는 당신은 누구에게나 환영받는 최고의 친구입니다.' },
            Cat: { title: '고고한 브리티시 숏헤어', desc: '당신은 독립적이고 세련된 매력을 가진 사람입니다. 자신만의 기준이 명확하며, 당신의 신뢰를 얻은 사람에게는 누구보다 깊은 애정을 주는 츤데레 매력의 소유자군요.' }
        }
    },
    { 
        id: 'hobby-master', 
        category: '성격', 
        title: '인생 취미 가이드', 
        desc: '지루한 일상을 바꿔줄 당신에게 딱 맞는 취미는?', 
        thumb: 'https://images.unsplash.com/photo-1520156582985-31368ad1a1b1?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '몸을 움직이는 것 vs 머리를 쓰는 것?', options: [{ text: '땀 흘리는 활동적인 것', type: 'A' }, { text: '집중해서 생각하는 정적인 것', type: 'B' }] },
            { q: '취미에 투자할 시간은?', options: [{ text: '짧고 굵게 즐기는 취미', type: 'A' }, { text: '오래도록 깊게 파고드는 취미', type: 'B' }] },
            { q: '누구와 함께하고 싶나요?', options: [{ text: '여러 사람과 북적이며', type: 'A' }, { text: '나 혼자 오롯이 집중하며', type: 'B' }] },
            { q: '취미의 목적은?', options: [{ text: '스트레스 해소와 활력', type: 'A' }, { text: '성취감과 지적 만족', type: 'B' }] },
            { q: '장소는 어디가 좋은가요?', options: [{ text: '탁 트인 야외 공간', type: 'A' }, { text: '안정적인 실내 공간', type: 'B' }] },
            { q: '취미 도구를 준비할 때?', options: [{ text: '일단 시작하고 나중에 구비', type: 'A' }, { text: '완벽하게 갖추고 시작', type: 'B' }] },
            { q: '하고 난 뒤의 느낌은?', options: [{ text: '개운하고 상쾌한 기분', type: 'A' }, { text: '뿌듯하고 차분해지는 기분', type: 'B' }] }
        ],
        results: {
            A: { title: '액티브 어드벤처러', desc: '당신은 활동적인 스포츠나 아웃도어 취미가 제격입니다! 등산, 서핑, 혹은 댄스 같은 활동으로 일상의 스트레스를 날려버리세요.' },
            B: { title: '크리에이티브 마스터', desc: '당신은 결과물을 만들어내는 정적인 취미가 어울립니다. 요리, 프로그래밍, 혹은 악기 연주를 통해 당신의 섬세한 감각을 표현해보세요.' }
        }
    }
];

let currentFilter = '전체';

function router() {
    const hash = window.location.hash || '#home';
    navLinks.forEach(link => {
        const filter = link.dataset.filter;
        link.classList.toggle('active', (hash === '#home' && filter === '전체') || hash.includes(filter.toLowerCase()));
    });

    if (hash.startsWith('#test/')) {
        renderTestExecution(hash.split('/')[1]);
    } else {
        const filterMap = { '#personality': '성격', '#face': '감성', '#fortune': '사주' };
        currentFilter = filterMap[hash] || '전체';
        renderHome();
    }
    window.scrollTo(0, 0);
}

function renderHome() {
    const filtered = currentFilter === '전체' ? TESTS : TESTS.filter(t => t.category === currentFilter);
    app.innerHTML = `
        <div class="ad-slot">AD SPACE - 메인 상단</div>
        <section class="portal-hero">
            <h1><span>7</span>Check</h1>
            <p>7번의 선택으로 확인하는 나의 모든 것</p>
        </section>
        <div class="test-grid">
            ${filtered.map(t => `
                <a href="#test/${t.id}" class="test-card fade-in">
                    <div class="test-thumb" style="background-image: url('${t.thumb}')"></div>
                    <div class="test-info">
                        <h3>${t.title}</h3>
                        <p>${t.desc}</p>
                    </div>
                </a>
            `).join('')}
        </div>
        <div class="ad-slot">AD SPACE - 메인 하단</div>
    `;
}

function renderTestExecution(testId) {
    const test = TESTS.find(t => t.id === testId);
    if (!test) return location.hash = '#home';

    let step = 0;
    const answers = [];

    const updateStep = () => {
        const currentQ = test.questions[step];
        app.innerHTML = `
            <div class="ad-slot">AD SPACE - 테스트 상단</div>
            <div class="test-execution fade-in">
                <div class="progress-container">
                    <div class="step-dots">
                        ${Array.from({length: 7}).map((_, i) => `<div class="dot ${i <= step ? 'active' : ''}"></div>`).join('')}
                    </div>
                </div>
                <h2 style="font-size:1.5rem; margin-bottom:2rem; word-break:keep-all;">Q${step + 1}. ${currentQ.q}</h2>
                <div class="options">
                    ${currentQ.options.map(opt => `<button class="option-btn" data-type="${opt.type}">${opt.text}</button>`).join('')}
                </div>
            </div>
            <div class="ad-slot">AD SPACE - 테스트 하단</div>
        `;

        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.onclick = () => {
                answers.push(btn.dataset.type);
                if (step < 6) {
                    step++;
                    updateStep();
                } else {
                    renderResult(testId, answers);
                }
            };
        });
    };
    updateStep();
}

function renderResult(testId, answers) {
    const test = TESTS.find(t => t.id === testId);
    const counts = answers.reduce((acc, type) => { acc[type] = (acc[type] || 0) + 1; return acc; }, {});
    const winningType = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    const result = test.results[winningType] || { title: '미확인 타입', desc: '분석 중 오류가 발생했습니다.' };

    app.innerHTML = `
        <div class="ad-slot">AD SPACE - 결과 상단</div>
        <div class="result-card fade-in">
            <span class="test-category">${test.title} 분석 결과</span>
            <div class="result-img" style="background-image: url('${test.thumb}'); background-size: cover; background-position: center;"></div>
            <h2 style="font-size:2rem; color:var(--accent-color); margin-bottom:1rem; word-break:keep-all;">당신은 [${result.title}]</h2>
            <p style="font-size:1.1rem; line-height:1.8; margin-bottom:2rem; word-break:keep-all; padding: 0 10px;">${result.desc}</p>
            
            <div class="share-grid">
                <button class="btn-share" id="share-web">공유하기</button>
                <button class="btn-share btn-copy" id="share-copy">링크 복사</button>
            </div>
            
            <button class="btn-share" style="width:100%; margin-top:1rem; background:#4a4a4a;" onclick="location.hash='#home'">다른 테스트 하러 가기</button>
        </div>
        <div class="ad-slot">AD SPACE - 결과 하단</div>
    `;

    document.getElementById('share-copy').onclick = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('링크가 복사되었습니다! 친구들에게 공유해보세요.');
    };

    document.getElementById('share-web').onclick = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `SevenCheck - ${test.title}`,
                    text: `나의 테스트 결과는 [${result.title}]! 당신의 타입도 7번의 질문으로 확인해보세요.`,
                    url: window.location.href,
                });
            } catch (err) { console.log(err); }
        } else { alert('링크를 복사해 공유해 주세요!'); }
    };
}

themeToggle.onclick = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '✨';
};

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
