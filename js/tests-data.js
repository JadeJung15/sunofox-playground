
export const TESTS = [
    {
        id: 'p1', category: '성격', title: '나의 숨겨진 아우라 컬러', desc: '7단계 심층 질문으로 당신만의 고유한 성향과 아우라를 분석합니다.', thumb: 'https://images.pexels.com/photos/16148505/pexels-photo-16148505.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '낯선 파티에 초대받았다면 당신의 선택은?', options: [{ text: '화려한 옷으로 존재감을 뽐낸다', scores: {e:2, c:1} }, { text: '깔끔하고 단정한 옷으로 자연스럽게 섞인다', scores: {l:1, p:1} }] },
            { q: '길을 걷다 예쁜 꽃을 발견했을 때 행동은?', options: [{ text: '바로 사진을 찍어 SNS에 공유한다', scores: {e:1, c:2} }, { text: '잠시 멈춰 향기를 맡으며 감상에 젖는다', scores: {p:2, l:1} }] },
            { q: '중요한 결정을 내릴 때 당신의 기준은?', options: [{ text: '나의 직관과 느낌을 전적으로 믿는다', scores: {c:2, e:1} }, { text: '객관적인 데이터와 조언을 신중히 참고한다', scores: {l:2, p:1} }] },
            { q: '비 오는 창밖을 볼 때 드는 생각은?', options: [{ text: '파전에 막걸리 같은 맛있는 음식이 생각난다', scores: {e:2, l:1} }, { text: '왠지 모르게 과거의 기억들이 떠오르며 감성적이 된다', scores: {p:2, c:1} }] },
            { q: '친구가 고민을 털어놓을 때 당신의 반응은?', options: [{ text: '도움이 될 만한 확실한 해결책을 제시한다', scores: {l:2, e:1} }, { text: '말없이 끝까지 들어주며 공감해준다', scores: {p:2, c:1} }] },
            { q: '평소 당신의 책상 위 모습은 어떤가요?', options: [{ text: '자유분방하고 창의적으로 어질러져 있다', scores: {c:2, e:1} }, { text: '항상 정해진 자리에 필요한 물건만 놓여 있다', scores: {l:2, p:1} }] },
            { q: '10년 후 당신의 모습은 어떨 것 같나요?', options: [{ text: '새로운 분야에 도전하며 열정적으로 살고 있다', scores: {e:2, c:1} }, { text: '평온하고 안정적인 삶의 여유를 누리고 있다', scores: {p:2, l:1} }] }
        ],
        results: {
            energy: { title: '타오르는 태양의 레드', desc: '당신은 주변 사람들에게 에너지를 전파하는 강력한 아우라를 가졌습니다. 리더십이 뛰어나고 솔직한 표현이 매력적입니다.', img: 'https://images.pexels.com/photos/2832432/pexels-photo-2832432.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#ef4444', tags: ['#열정', '#리더십', '#에너자이저'] },
            logic: { title: '냉철한 이성의 블루', desc: '데이터와 논리를 바탕으로 최선의 답을 찾는 전략가입니다. 신중하고 사려 깊은 태도가 주변의 신뢰를 얻습니다.', img: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#3b82f6', tags: ['#분석가', '#브레인', '#전략가'] },
            empathy: { title: '고요한 숲의 그린', desc: '주변을 편안하게 만드는 따뜻한 공감 능력의 소유자입니다. 당신과 함께라면 누구나 위로를 얻습니다.', img: 'https://images.pexels.com/photos/7130503/pexels-photo-7130503.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#10b981', tags: ['#힐러', '#평화주의자', '#리스너'] },
            creativity: { title: '신비로운 보랏빛 밤', desc: '독창적인 시선으로 세상을 바라보는 예술가적 영혼입니다. 남들이 보지 못하는 가능성을 찾아냅니다.', img: 'https://images.pexels.com/photos/2832432/pexels-photo-2832432.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#8b5cf6', tags: ['#아이디어', '#아티스트', '#독창성'] }
        }
    },
]