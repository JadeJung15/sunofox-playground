export const TESTS = [
    {
        id: 'mind-balance',
        category: '자기이해',
        title: '내 마음 균형 감각 테스트',
        desc: '지금의 나는 감정, 생각, 휴식 중 어디에 가장 기울어져 있는지 확인합니다.',
        thumb: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
        questions: [
            { q: '쉬는 날 가장 먼저 하고 싶은 일은?', options: [{ text: '혼자 조용히 쉬기', scores: { empathy: 2, logic: 1 } }, { text: '해야 할 일 정리하기', scores: { logic: 2, energy: 1 } }] },
            { q: '요즘 가장 자주 드는 생각은?', options: [{ text: '마음이 좀 지친다', scores: { empathy: 2, creativity: 1 } }, { text: '정리 안 된 일이 많다', scores: { logic: 2, energy: 1 } }] },
            { q: '친구가 갑자기 약속을 취소했다면?', options: [{ text: '괜찮다고 하지만 조금 서운하다', scores: { empathy: 2 } }, { text: '오히려 개인 시간이 생겨 좋다', scores: { logic: 1, creativity: 1 } }] },
            { q: '집중이 가장 잘 되는 순간은?', options: [{ text: '감정이 안정될 때', scores: { empathy: 2 } }, { text: '해야 할 순서가 보일 때', scores: { logic: 2 } }] },
            { q: '요즘 나에게 필요한 것은?', options: [{ text: '회복할 시간', scores: { empathy: 2, creativity: 1 } }, { text: '명확한 계획', scores: { logic: 2, energy: 1 } }] },
            { q: '어떤 공간이 편안한가?', options: [{ text: '햇빛 들어오는 조용한 공간', scores: { empathy: 2, creativity: 1 } }, { text: '책상과 도구가 정돈된 공간', scores: { logic: 2 } }] },
            { q: '이번 주 목표를 고른다면?', options: [{ text: '내 상태를 잘 돌보는 것', scores: { empathy: 2 } }, { text: '하나라도 끝내는 것', scores: { energy: 2, logic: 1 } }] }
        ],
        results: {
            energy: { title: '정비가 끝나면 바로 달리는 타입', desc: '지금은 잠시 조용하지만 다시 움직일 준비가 된 상태입니다.', img: 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=1200&q=80', color: '#2563eb', tags: ['#재정비', '#집중', '#전환직전'] },
            logic: { title: '정리와 구조가 필요한 타입', desc: '감정보다 우선 정리하고 싶은 항목들이 많습니다. 정돈이 곧 안정감입니다.', img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80', color: '#1d4ed8', tags: ['#정리', '#우선순위', '#차분함'] },
            empathy: { title: '회복과 안정이 먼저인 타입', desc: '지금은 성과보다 내 감정을 보호하는 쪽이 더 중요합니다.', img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80', color: '#0f766e', tags: ['#회복', '#안정', '#마음관리'] },
            creativity: { title: '감각을 환기해야 하는 타입', desc: '생각보다 감정이 오래 머물러 있습니다. 새로운 자극이 필요합니다.', img: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80', color: '#7c3aed', tags: ['#환기', '#전환', '#새로운자극'] }
        }
    },
    {
        id: 'relation-distance',
        category: '관계',
        title: '관계 거리감 테스트',
        desc: '사람과 가까워지는 속도와 편한 거리감을 확인하는 테스트입니다.',
        thumb: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80',
        questions: [
            { q: '새 모임에 들어가면?', options: [{ text: '먼저 분위기를 살핀다', scores: { logic: 2, empathy: 1 } }, { text: '먼저 말을 건다', scores: { energy: 2, empathy: 1 } }] },
            { q: '친해지는 기준은?', options: [{ text: '대화가 편해야 한다', scores: { empathy: 2 } }, { text: '리듬이 잘 맞아야 한다', scores: { energy: 2 } }] },
            { q: '답장이 늦는 사람을 보면?', options: [{ text: '이유가 있겠지 생각한다', scores: { empathy: 2 } }, { text: '관심도가 낮다고 느낀다', scores: { logic: 2 } }] },
            { q: '가장 부담 없는 만남은?', options: [{ text: '짧은 산책이나 차 한 잔', scores: { empathy: 2, creativity: 1 } }, { text: '목적이 분명한 약속', scores: { logic: 2 }}] },
            { q: '갈등이 생기면?', options: [{ text: '조금 시간을 두고 말한다', scores: { logic: 2, empathy: 1 } }, { text: '빨리 푸는 쪽이 낫다', scores: { energy: 2 }}] },
            { q: '좋아하는 사람 앞에서는?', options: [{ text: '표현보다 관찰이 먼저다', scores: { empathy: 2, logic: 1 } }, { text: '의외로 솔직해진다', scores: { energy: 2 }}] },
            { q: '이상적인 관계는?', options: [{ text: '편안하고 오래 가는 관계', scores: { empathy: 2 } }, { text: '서로 자극이 되는 관계', scores: { creativity: 2, energy: 1 } }] }
        ],
        results: {
            energy: { title: '빠르게 가까워지는 직진형', desc: '좋은 감정이 생기면 속도를 숨기지 않는 편입니다.', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80', color: '#ea580c', tags: ['#직진', '#빠른친화력', '#즉시반응'] },
            logic: { title: '거리 조절이 분명한 신중형', desc: '관계도 속도보다 안정이 중요합니다. 천천히 가까워지는 편입니다.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80', color: '#2563eb', tags: ['#신중함', '#거리조절', '#안정선호'] },
            empathy: { title: '편안함을 먼저 보는 공감형', desc: '관계의 깊이보다 마음의 온도를 더 크게 느끼는 편입니다.', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80', color: '#0f766e', tags: ['#공감', '#편안함', '#관계온도'] },
            creativity: { title: '특별한 연결을 찾는 감각형', desc: '평범한 관계보다 유난히 잘 맞는 연결에 더 끌립니다.', img: 'https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=1200&q=80', color: '#7c3aed', tags: ['#특별함', '#감각형', '#결맞음'] }
        }
    },
    {
        id: 'stress-language',
        category: '감정',
        title: '스트레스 반응 언어 테스트',
        desc: '스트레스를 받을 때 내가 가장 먼저 보이는 반응 패턴을 찾습니다.',
        thumb: 'https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?auto=format&fit=crop&w=1200&q=80',
        questions: [
            { q: '압박이 시작되면?', options: [{ text: '말수가 줄어든다', scores: { logic: 2 } }, { text: '예민하게 반응한다', scores: { energy: 2 } }] },
            { q: '가장 흔한 실수는?', options: [{ text: '혼자 버티려는 것', scores: { empathy: 2 } }, { text: '일을 한꺼번에 벌이는 것', scores: { energy: 2 }}] },
            { q: '회복 방법은?', options: [{ text: '생각을 정리한다', scores: { logic: 2 } }, { text: '감정을 털어놓는다', scores: { empathy: 2 }}] },
            { q: '표정은 주로?', options: [{ text: '무표정해진다', scores: { logic: 2 } }, { text: '피곤함이 바로 드러난다', scores: { empathy: 2 }}] },
            { q: '해야 할 일이 겹치면?', options: [{ text: '우선순위를 계산한다', scores: { logic: 2 } }, { text: '일단 하나부터 시작한다', scores: { energy: 2 }}] },
            { q: '위로를 받을 때 좋은 말은?', options: [{ text: '방법을 같이 찾자', scores: { logic: 2 } }, { text: '많이 힘들었겠다', scores: { empathy: 2 }}] },
            { q: '스트레스 후 남는 건?', options: [{ text: '머릿속 소음', scores: { creativity: 2, logic: 1 } }, { text: '몸의 피로감', scores: { empathy: 2, energy: 1 } }] }
        ],
        results: {
            energy: { title: '즉시 반응형 스트레스 타입', desc: '압박이 오면 몸과 표정에서 먼저 반응이 나타납니다.', img: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?auto=format&fit=crop&w=1200&q=80', color: '#dc2626', tags: ['#즉시반응', '#긴장표출', '#압박민감'] },
            logic: { title: '머릿속 과부하형 스트레스 타입', desc: '겉으로는 차분하지만 안쪽에서는 계산이 과열되는 편입니다.', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', color: '#1d4ed8', tags: ['#과부하', '#생각과열', '#차분한겉모습'] },
            empathy: { title: '감정 소모형 스트레스 타입', desc: '일보다 사람과 분위기에서 더 크게 지치는 경향이 있습니다.', img: 'https://images.unsplash.com/photo-1493836512294-502baa1986e2?auto=format&fit=crop&w=1200&q=80', color: '#0f766e', tags: ['#감정소모', '#사람피로', '#회복필요'] },
            creativity: { title: '생각 분산형 스트레스 타입', desc: '스트레스가 오면 주의가 넓게 흩어져 집중력이 먼저 흔들립니다.', img: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80', color: '#7c3aed', tags: ['#주의분산', '#집중저하', '#정리필요'] }
        }
    },
    {
        id: 'decision-core',
        category: '판단',
        title: '결정 중심축 테스트',
        desc: '선택할 때 내가 가장 크게 의지하는 기준이 무엇인지 봅니다.',
        thumb: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
        questions: [
            { q: '중요한 결정을 앞두면?', options: [{ text: '자료부터 모은다', scores: { logic: 2 } }, { text: '마음이 끌리는 쪽을 본다', scores: { creativity: 2 }}] },
            { q: '남의 조언은?', options: [{ text: '참고는 하되 직접 판단한다', scores: { logic: 2 } }, { text: '감정적으로 와닿는 말을 따른다', scores: { empathy: 2 }}] },
            { q: '후회가 적은 선택은?', options: [{ text: '충분히 검토한 선택', scores: { logic: 2 } }, { text: '내 마음이 원한 선택', scores: { creativity: 2 }}] },
            { q: '이득보다 중요한 것은?', options: [{ text: '안정성', scores: { logic: 2 } }, { text: '의미와 몰입감', scores: { creativity: 2 }}] },
            { q: '급한 상황에서는?', options: [{ text: '기준부터 세운다', scores: { logic: 2 } }, { text: '체감상 맞는 쪽으로 간다', scores: { energy: 2 }}] },
            { q: '결정 후 필요한 것은?', options: [{ text: '확신', scores: { logic: 2 } }, { text: '응원과 공감', scores: { empathy: 2 }}] },
            { q: '나를 움직이는 말은?', options: [{ text: '이게 가장 합리적이야', scores: { logic: 2 } }, { text: '이게 너답잖아', scores: { creativity: 2, empathy: 1 } }] }
        ],
        results: {
            energy: { title: '속도 우선 실행형', desc: '완벽한 정답보다 타이밍을 더 중요하게 보는 편입니다.', img: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80', color: '#ea580c', tags: ['#실행우선', '#타이밍', '#속도감'] },
            logic: { title: '근거 중심 판단형', desc: '결정에는 설명 가능한 이유가 있어야 안심이 됩니다.', img: 'https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80', color: '#2563eb', tags: ['#근거', '#판단기준', '#설명가능성'] },
            empathy: { title: '관계 고려 판단형', desc: '옳고 그름보다 누가 다치지 않는지가 중요합니다.', img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80', color: '#0f766e', tags: ['#관계고려', '#배려', '#조화'] },
            creativity: { title: '의미 중심 직감형', desc: '내가 왜 이 선택을 원하는지가 결정의 핵심입니다.', img: 'https://images.unsplash.com/photo-1516321310764-8d15b0f7f86f?auto=format&fit=crop&w=1200&q=80', color: '#7c3aed', tags: ['#직감', '#의미', '#나다운선택'] }
        }
    },
    {
        id: 'conversation-tone',
        category: '관계',
        title: '대화 톤 테스트',
        desc: '나는 대화를 통해 어떤 인상과 리듬을 만드는지 확인합니다.',
        thumb: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80',
        questions: [
            { q: '대화의 시작은?', options: [{ text: '가볍게 분위기를 풀며 시작', scores: { energy: 2 } }, { text: '상대 반응을 보고 맞춘다', scores: { empathy: 2 }}] },
            { q: '가장 많이 듣는 말은?', options: [{ text: '말이 시원시원해', scores: { energy: 2 } }, { text: '이야기 잘 들어준다', scores: { empathy: 2 }}] },
            { q: '내가 중요하게 보는 건?', options: [{ text: '전달력', scores: { logic: 2 } }, { text: '분위기', scores: { empathy: 2 }}] },
            { q: '침묵이 생기면?', options: [{ text: '새 주제를 꺼낸다', scores: { energy: 2 } }, { text: '굳이 채우지 않는다', scores: { logic: 2 }}] },
            { q: '칭찬을 할 때는?', options: [{ text: '바로 표현한다', scores: { energy: 2 } }, { text: '구체적으로 말해준다', scores: { logic: 2, empathy: 1 } }] },
            { q: '대화 후 기억나는 건?', options: [{ text: '주요 내용', scores: { logic: 2 } }, { text: '상대 표정과 분위기', scores: { empathy: 2 }}] },
            { q: '내 대화 스타일에 가까운 건?', options: [{ text: '리듬감 있는 진행', scores: { energy: 2, creativity: 1 } }, { text: '편안한 공기 만들기', scores: { empathy: 2 }}] }
        ],
        results: {
            energy: { title: '리듬을 끌고 가는 진행형', desc: '말의 속도와 텐션으로 분위기를 움직이는 편입니다.', img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80', color: '#ea580c', tags: ['#리듬', '#진행형', '#텐션메이커'] },
            logic: { title: '내용을 정리하는 구조형', desc: '정확한 전달과 맥락 정리에 강점이 있습니다.', img: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80', color: '#2563eb', tags: ['#정리형', '#전달력', '#맥락중심'] },
            empathy: { title: '편안함을 만드는 공감형', desc: '대화의 핵심은 내용보다 상대가 느끼는 감정에 있습니다.', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80', color: '#0f766e', tags: ['#공감형', '#편안함', '#대화온도'] },
            creativity: { title: '의외성이 있는 전환형', desc: '예상 밖의 표현과 비유로 대화에 새 결을 만듭니다.', img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80', color: '#7c3aed', tags: ['#비유', '#의외성', '#새로운결'] }
        }
    },
    {
        id: 'focus-pattern',
        category: '일상',
        title: '집중 패턴 테스트',
        desc: '집중이 잘 되는 조건과 흐트러지는 원인을 찾는 테스트입니다.',
        thumb: 'https://images.unsplash.com/photo-1494172961521-33799ddd43a5?auto=format&fit=crop&w=1200&q=80',
        questions: [
            { q: '집중 전 필요한 것은?', options: [{ text: '할 일 목록', scores: { logic: 2 } }, { text: '기분 전환', scores: { creativity: 2 }}] },
            { q: '흐트러질 때는?', options: [{ text: '변수가 많을 때', scores: { logic: 2 } }, { text: '감정이 가라앉을 때', scores: { empathy: 2 }}] },
            { q: '가장 좋은 시작 방식은?', options: [{ text: '작은 일부터 처리', scores: { logic: 2, energy: 1 } }, { text: '큰 흐름부터 잡기', scores: { creativity: 2 }}] },
            { q: '공간은?', options: [{ text: '정리된 책상', scores: { logic: 2 } }, { text: '감각적으로 편한 공간', scores: { creativity: 2, empathy: 1 } }] },
            { q: '방해 요소는?', options: [{ text: '메시지와 알림', scores: { logic: 2 } }, { text: '지루한 분위기', scores: { energy: 2 }}] },
            { q: '집중 후 가장 필요한 건?', options: [{ text: '짧은 체크와 정리', scores: { logic: 2 } }, { text: '기분 좋은 보상', scores: { empathy: 1, creativity: 1 }}] },
            { q: '내 집중력은?', options: [{ text: '천천히 올라가 오래 간다', scores: { logic: 2 } }, { text: '한 번 오르면 확 몰입한다', scores: { energy: 2, creativity: 1 } }] }
        ],
        results: {
            energy: { title: '몰입 점화형', desc: '시작만 붙으면 속도가 빠르게 붙는 타입입니다.', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80', color: '#ea580c', tags: ['#점화형', '#몰입속도', '#스타트중요'] },
            logic: { title: '구조 기반 집중형', desc: '집중은 감정보다 구조에서 시작됩니다. 순서와 정리가 핵심입니다.', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80', color: '#2563eb', tags: ['#구조', '#정리', '#순서중심'] },
            empathy: { title: '컨디션 의존 집중형', desc: '몸과 감정 상태가 안정될수록 집중력이 크게 좋아집니다.', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80', color: '#0f766e', tags: ['#컨디션', '#안정감', '#회복우선'] },
            creativity: { title: '감각 자극 집중형', desc: '재미와 자극이 들어올 때 집중력이 살아나는 타입입니다.', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', color: '#7c3aed', tags: ['#감각자극', '#흥미기반', '#재미필수'] }
        }
    },
    {
        id: 'self-image',
        category: '자기이해',
        title: '내가 보는 나 테스트',
        desc: '스스로 인식하는 나의 모습과 바깥에서 보이는 나의 차이를 가늠합니다.',
        thumb: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80',
        questions: [
            { q: '가장 자주 하는 자기평가는?', options: [{ text: '생각이 너무 많다', scores: { logic: 2 } }, { text: '마음이 쉽게 흔들린다', scores: { empathy: 2 }}] },
            { q: '남이 보는 나는?', options: [{ text: '차분한 편', scores: { logic: 2 } }, { text: '부드러운 편', scores: { empathy: 2 }}] },
            { q: '내 강점이라고 느끼는 건?', options: [{ text: '꾸준함', scores: { logic: 2 } }, { text: '분위기 파악', scores: { empathy: 2 }}] },
            { q: '가장 숨기고 싶은 건?', options: [{ text: '급해지는 마음', scores: { energy: 2 } }, { text: '엉뚱한 생각', scores: { creativity: 2 }}] },
            { q: '내가 바꾸고 싶은 건?', options: [{ text: '우유부단함', scores: { logic: 2 } }, { text: '감정 기복', scores: { empathy: 2 }}] },
            { q: '사람들이 오해하는 부분은?', options: [{ text: '차갑다고 본다', scores: { logic: 2, empathy: 1 } }, { text: '가벼워 보인다', scores: { creativity: 2 }}] },
            { q: '결국 내가 지키고 싶은 건?', options: [{ text: '내 기준', scores: { logic: 2 } }, { text: '내 감정의 결', scores: { empathy: 2, creativity: 1 } }] }
        ],
        results: {
            energy: { title: '겉보다 뜨거운 내부 엔진형', desc: '겉은 차분해 보여도 안쪽에는 즉시 움직이는 힘이 숨어 있습니다.', img: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80', color: '#ea580c', tags: ['#숨은에너지', '#내부동력', '#행동잠재력'] },
            logic: { title: '기준이 분명한 자기정의형', desc: '스스로를 볼 때도 감정보다 기준과 맥락을 더 중요하게 봅니다.', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80', color: '#2563eb', tags: ['#기준', '#자기정의', '#맥락중심'] },
            empathy: { title: '내면 온도가 중요한 섬세형', desc: '스스로를 이해할 때 마음의 컨디션과 감정의 결을 가장 크게 봅니다.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1200&q=80', color: '#0f766e', tags: ['#섬세함', '#내면온도', '#감정중심'] },
            creativity: { title: '숨은 결이 많은 감각형', desc: '설명하기 어려운 자기만의 결이 있고, 그 차이를 꽤 중요하게 느낍니다.', img: 'https://images.unsplash.com/photo-1516321310764-8d15b0f7f86f?auto=format&fit=crop&w=1200&q=80', color: '#7c3aed', tags: ['#결', '#감각', '#설명어려움'] }
        }
    },
    {
        id: 'love-style',
        category: '관계',
        title: '연애 스타일 테스트',
        desc: '관심이 생겼을 때 나는 어떤 방식으로 마음을 표현하는지 봅니다.',
        thumb: 'https://images.unsplash.com/photo-1518199266791-bd373292e90c?auto=format&fit=crop&w=1200&q=80',
        questions: [
            { q: '호감이 생기면?', options: [{ text: '먼저 연락할 타이밍을 본다', scores: { logic: 2 } }, { text: '티가 나게 챙긴다', scores: { energy: 2 }}] },
            { q: '좋아하는 사람과의 대화는?', options: [{ text: '자연스럽고 편해야 한다', scores: { empathy: 2 } }, { text: '설레는 포인트가 있어야 한다', scores: { creativity: 2 }}] },
            { q: '연애에서 가장 중요한 건?', options: [{ text: '신뢰와 안정감', scores: { logic: 2, empathy: 1 } }, { text: '끌림과 재미', scores: { energy: 2, creativity: 1 } }] },
            { q: '갈등이 생기면?', options: [{ text: '정리해서 말하고 싶다', scores: { logic: 2 } }, { text: '감정이 먼저 올라온다', scores: { empathy: 2 }}] },
            { q: '표현 방식은?', options: [{ text: '행동으로 챙긴다', scores: { energy: 2 } }, { text: '문장과 분위기로 전한다', scores: { creativity: 2 }}] },
            { q: '가장 불안한 순간은?', options: [{ text: '태도가 애매할 때', scores: { logic: 2 } }, { text: '마음의 온도가 식을 때', scores: { empathy: 2 }}] },
            { q: '좋아하는 관계는?', options: [{ text: '평온하게 길게 가는 관계', scores: { empathy: 2 } }, { text: '서로 자극이 되는 관계', scores: { creativity: 2, energy: 1 } }] }
        ],
        results: {
            energy: { title: '표현이 빠른 직관형', desc: '좋아하는 마음이 생기면 비교적 빨리 표현하는 편입니다.', img: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1200&q=80', color: '#ea580c', tags: ['#직관형', '#빠른표현', '#직진감정'] },
            logic: { title: '신뢰를 먼저 보는 안정형', desc: '끌림보다 관계의 명확성과 안정감을 더 중요하게 봅니다.', img: 'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=1200&q=80', color: '#2563eb', tags: ['#신뢰', '#안정형', '#명확함'] },
            empathy: { title: '정서 교감을 먼저 보는 공감형', desc: '좋아함의 기준은 설렘보다 마음이 편한지에 가깝습니다.', img: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80', color: '#0f766e', tags: ['#정서교감', '#편안함', '#공감연애'] },
            creativity: { title: '분위기와 결을 보는 감각형', desc: '말보다 공기와 결이 맞는지가 더 크게 다가옵니다.', img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80', color: '#7c3aed', tags: ['#분위기', '#결맞음', '#감각연애'] }
        }
    },
    {
        id: 'rest-rhythm',
        category: '일상',
        title: '휴식 리듬 테스트',
        desc: '나는 어떤 방식으로 쉬어야 가장 잘 회복되는지 확인합니다.',
        thumb: 'https://images.unsplash.com/photo-1494172961521-33799ddd43a5?auto=format&fit=crop&w=1200&q=80',
        questions: [
            { q: '휴식이 필요할 때 먼저 하는 건?', options: [{ text: '잠깐 멈추고 아무것도 안 한다', scores: { empathy: 2 } }, { text: '할 일부터 비워낸다', scores: { logic: 2 }}] },
            { q: '가장 좋은 휴식은?', options: [{ text: '조용한 시간', scores: { empathy: 2 } }, { text: '새로운 자극', scores: { creativity: 2 }}] },
            { q: '회복 후 기분은?', options: [{ text: '안정적이다', scores: { empathy: 2 } }, { text: '다시 뭔가 하고 싶다', scores: { energy: 2 }}] },
            { q: '쉬는 날 계획은?', options: [{ text: '비워두는 편', scores: { empathy: 2 } }, { text: '가볍게라도 세우는 편', scores: { logic: 2 }}] },
            { q: '지쳤을 때 피하는 건?', options: [{ text: '과한 인간관계', scores: { empathy: 2 } }, { text: '지루한 반복', scores: { creativity: 2 }}] },
            { q: '휴식에 필요한 건?', options: [{ text: '안심되는 공간', scores: { empathy: 2 } }, { text: '기분 전환 장치', scores: { creativity: 2, energy: 1 } }] },
            { q: '다시 움직일 때는?', options: [{ text: '자연스럽게 천천히', scores: { empathy: 2 } }, { text: '확실히 스위치를 켠다', scores: { energy: 2 }}] }
        ],
        results: {
            energy: { title: '휴식 후 가속형', desc: '충전이 끝나면 다시 빠르게 움직이는 타입입니다.', img: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80', color: '#ea580c', tags: ['#가속형', '#충전후질주', '#재시작'] },
            logic: { title: '정리 후 휴식형', desc: '정리가 조금 되어야 비로소 쉬었다는 느낌이 듭니다.', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80', color: '#2563eb', tags: ['#정리후휴식', '#질서', '#안심'] },
            empathy: { title: '안정 중심 회복형', desc: '회복의 핵심은 속도가 아니라 안전감과 차분함입니다.', img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80', color: '#0f766e', tags: ['#회복형', '#안정감', '#차분함'] },
            creativity: { title: '환기 중심 리프레시형', desc: '쉬는 동안에도 감각이 살아나야 제대로 회복됩니다.', img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', color: '#7c3aed', tags: ['#환기', '#리프레시', '#감각회복'] }
        }
    },
    {
        id: 'hidden-strength',
        category: '자기이해',
        title: '숨은 강점 테스트',
        desc: '스스로는 당연하게 여겨서 잘 못 보는 내 장점을 찾습니다.',
        thumb: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
        questions: [
            { q: '주변이 자주 부탁하는 일은?', options: [{ text: '정리하거나 판단하는 일', scores: { logic: 2 } }, { text: '분위기를 풀어주는 일', scores: { empathy: 2, energy: 1 } }] },
            { q: '내가 빨리 알아차리는 건?', options: [{ text: '문제의 원인', scores: { logic: 2 } }, { text: '사람의 기분 변화', scores: { empathy: 2 }}] },
            { q: '잘한다는 말을 듣는 건?', options: [{ text: '끝까지 해내는 것', scores: { energy: 2, logic: 1 } }, { text: '다르게 보는 시선', scores: { creativity: 2 }}] },
            { q: '혼자 있을 때 강한 건?', options: [{ text: '정리와 판단', scores: { logic: 2 } }, { text: '상상과 연결', scores: { creativity: 2 }}] },
            { q: '사람들 사이에서 강한 건?', options: [{ text: '분위기 읽기', scores: { empathy: 2 } }, { text: '진행과 추진', scores: { energy: 2 }}] },
            { q: '스스로 당연하게 느끼는 건?', options: [{ text: '책임감', scores: { logic: 2, energy: 1 } }, { text: '배려심', scores: { empathy: 2 }}] },
            { q: '내가 놓치기 쉬운 장점은?', options: [{ text: '꾸준함과 안정감', scores: { logic: 2 } }, { text: '감각과 유연함', scores: { creativity: 2, empathy: 1 } }] }
        ],
        results: {
            energy: { title: '판을 움직이는 추진력형', desc: '당연하게 여기지만 실제로는 상황을 앞으로 밀어내는 힘이 큽니다.', img: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80', color: '#ea580c', tags: ['#추진력', '#실행력', '#판전환'] },
            logic: { title: '질서를 만드는 안정감형', desc: '복잡한 상황에서 기준을 세우고 흐름을 안정시키는 강점이 있습니다.', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80', color: '#2563eb', tags: ['#안정감', '#기준', '#질서'] },
            empathy: { title: '사람을 편하게 하는 공감형', desc: '대단한 기술보다 곁의 사람을 편하게 만드는 힘이 큽니다.', img: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1200&q=80', color: '#0f766e', tags: ['#공감', '#편안함', '#배려'] },
            creativity: { title: '다른 가능성을 보는 감각형', desc: '남들이 지나치는 다른 해석과 새로운 결을 만들어냅니다.', img: 'https://images.unsplash.com/photo-1516321310764-8d15b0f7f86f?auto=format&fit=crop&w=1200&q=80', color: '#7c3aed', tags: ['#가능성', '#해석', '#새시선'] }
        }
    },
    {
        id: 'emotion-weather',
        category: '감정',
        title: '감정 날씨 테스트',
        desc: '지금 내 마음의 날씨가 맑음, 흐림, 소나기 중 어디에 가까운지 확인합니다.',
        thumb: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80',
        questions: [
            { q: '오늘 하루를 떠올리면?', options: [{ text: '해야 할 일이 먼저 보인다', scores: { logic: 2 } }, { text: '느낌이 먼저 떠오른다', scores: { empathy: 2 }}] },
            { q: '지금 가장 필요한 한마디는?', options: [{ text: '정리하면 괜찮아질 거야', scores: { logic: 2 } }, { text: '충분히 힘들 수 있어', scores: { empathy: 2 }}] },
            { q: '몸 상태는?', options: [{ text: '긴장된 편', scores: { energy: 2 } }, { text: '축 처지는 편', scores: { empathy: 2 }}] },
            { q: '생각 흐름은?', options: [{ text: '하나씩 계산된다', scores: { logic: 2 } }, { text: '이것저것 번진다', scores: { creativity: 2 }}] },
            { q: '지금 가장 가까운 풍경은?', options: [{ text: '정리된 실내', scores: { logic: 2 } }, { text: '바람 부는 창가', scores: { empathy: 2, creativity: 1 } }] },
            { q: '필요한 휴식은?', options: [{ text: '멈추고 진정하는 것', scores: { empathy: 2 } }, { text: '몸을 움직이는 것', scores: { energy: 2 }}] },
            { q: '지금 내 마음의 색은?', options: [{ text: '차분한 푸른색', scores: { logic: 2 } }, { text: '퍼지는 보랏빛', scores: { creativity: 2, empathy: 1 } }] }
        ],
        results: {
            energy: { title: '곧 쏟아질 소나기형', desc: '정지보다 배출이 필요한 상태입니다. 몸을 움직이는 회복이 잘 맞습니다.', img: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80', color: '#ea580c', tags: ['#소나기', '#배출', '#움직임필요'] },
            logic: { title: '잔잔한 흐림형', desc: '감정보다 생각이 많이 쌓여 있는 상태입니다. 정리가 회복에 도움이 됩니다.', img: 'https://images.unsplash.com/photo-1499346030926-9a72daac6c63?auto=format&fit=crop&w=1200&q=80', color: '#2563eb', tags: ['#흐림', '#정리필요', '#머릿속소음'] },
            empathy: { title: '촉촉한 비내림형', desc: '마음이 조금 젖어 있습니다. 따뜻한 회복과 안정감이 먼저입니다.', img: 'https://images.unsplash.com/photo-1503437313881-503a91226402?auto=format&fit=crop&w=1200&q=80', color: '#0f766e', tags: ['#비내림', '#회복', '#온기필요'] },
            creativity: { title: '바람 많은 전환형', desc: '감정이 고정되기보다 계속 방향을 바꾸고 있습니다. 환기가 효과적입니다.', img: 'https://images.unsplash.com/photo-1470259078422-826894b933aa?auto=format&fit=crop&w=1200&q=80', color: '#7c3aed', tags: ['#전환기', '#환기', '#흐름변화'] }
        }
    }
];
