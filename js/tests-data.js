export const TESTS = [
    {
        id: 'p1', category: '성격', title: '나의 숨겨진 아우라 컬러', desc: '7단계 심층 질문으로 당신만의 고유한 성향과 아우라를 분석합니다.', thumb: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
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
            energy: { title: '타오르는 태양의 레드', desc: '당신은 주변 사람들에게 에너지를 전파하는 강력한 아우라를 가졌습니다. 리더십이 뛰어나고 솔직한 표현이 매력적입니다.', img: 'https://images.unsplash.com/photo-1547891269-045ad33ed99a?auto=format&fit=crop&w=800&q=80', color: '#ef4444', tags: ['#열정', '#리더십', '#에너자이저'] },
            logic: { title: '냉철한 이성의 블루', desc: '데이터와 논리를 바탕으로 최선의 답을 찾는 전략가입니다. 신중하고 사려 깊은 태도가 주변의 신뢰를 얻습니다.', img: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=800&q=80', color: '#3b82f6', tags: ['#분석가', '#브레인', '#전략가'] },
            empathy: { title: '고요한 숲의 그린', desc: '주변을 편안하게 만드는 따뜻한 공감 능력의 소유자입니다. 당신과 함께라면 누구나 위로를 얻습니다.', img: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80', color: '#10b981', tags: ['#힐러', '#평화주의자', '#리스너'] },
            creativity: { title: '신비로운 보랏빛 밤', desc: '독창적인 시선으로 세상을 바라보는 예술가적 영혼입니다. 남들이 보지 못하는 가능성을 찾아냅니다.', img: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=800&q=80', color: '#8b5cf6', tags: ['#아이디어', '#아티스트', '#독창성'] }
        }
    },
    {
        id: 'p2', category: '성격', title: '내면 아이 유형 테스트', desc: '당신의 무의식 깊은 곳에 자리 잡은 내면 아이의 성향을 분석합니다.', thumb: 'https://images.pexels.com/photos/15131512/pexels-photo-15131512.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '어린 시절 가장 즐거웠던 기억은?', options: [{ text: '동네 친구들과 뛰어놀던 골목길', scores: {e:2, p:1} }, { text: '방 안에서 혼자 상상하며 놀던 시간', scores: {c:2, l:1} }] },
            { q: '꿈속에서 마법 지팡이를 얻었다면?', options: [{ text: '하늘을 날아 세계 여행을 떠난다', scores: {e:2, c:1} }, { text: '동물들과 대화하는 능력을 갖는다', scores: {p:2, c:1} }] },
            { q: '맛있는 간식이 하나만 남았다면?', options: [{ text: '친구에게 기분 좋게 양보한다', scores: {p:2, e:1} }, { text: '몰래 아껴두었다가 나중에 먹는다', scores: {l:2, c:1} }] },
            { q: '길을 잃은 강아지를 발견한다면?', options: [{ text: '주인을 찾아주기 위해 적극적으로 나선다', scores: {e:1, p:2} }, { text: '겁이 나지만 먹을 것을 챙겨준다', scores: {p:1, l:2} }] },
            { q: '무서운 번개가 칠 때 당신은?', options: [{ text: '가족에게 달려가 품에 안긴다', scores: {p:2, e:1} }, { text: '이불 속으로 들어가 소리를 차단한다', scores: {l:2, c:1} }] },
            { q: '새로운 장난감을 선물받았을 때?', options: [{ text: '설명서 없이 바로 조립해본다', scores: {c:2, e:1} }, { text: '그림을 보며 신중하게 하나씩 만든다', scores: {l:2, p:1} }] },
            { q: '잠들기 전 주로 어떤 생각을 하나요?', options: [{ text: '내일 일어날 즐거운 일들을 상상한다', scores: {e:1, c:2} }, { text: '오늘 하루 있었던 일들을 되짚어본다', scores: {l:2, p:1} }] }
        ],
        results: {
            energy: { title: '호기심 많은 모험가 아이', desc: '지치지 않는 호기심과 활기가 당신의 진정한 힘입니다.', img: 'https://images.pexels.com/photos/15020862/pexels-photo-15020862.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#f59e0b', tags: ['#모험가', '#에너지', '#천진난만'] },
            logic: { title: '지혜로운 꼬마 학자 아이', desc: '세상을 관찰하고 깊이 생각하는 것을 즐기는 통찰력 있는 아이입니다.', img: 'https://images.pexels.com/photos/4565130/pexels-photo-4565130.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#64748b', tags: ['#학자', '#통찰력', '#차분함'] },
            empathy: { title: '사랑이 넘치는 작은 천사', desc: '타인의 아픔을 어루만질 줄 아는 세상에서 가장 따뜻한 아이입니다.', img: 'https://images.pexels.com/photos/15165891/pexels-photo-15165891.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#ec4899', tags: ['#천사', '#공감', '#순수함'] },
            creativity: { title: '꿈꾸는 무지개 소년/소녀', desc: '상상력이 풍부하여 언제나 새로운 세상을 그리는 아이입니다.', img: 'https://images.pexels.com/photos/14567351/pexels-photo-14567351.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#8b5cf6', tags: ['#예술가', '#꿈나무', '#상상력'] }
        }
    },
    {
        id: 'p3', category: '성격', title: '연애 가치관 리포트', desc: '사랑에 대한 당신의 무의식적 태도와 선호하는 연애 스타일을 분석합니다.', thumb: 'https://images.pexels.com/photos/1024960/pexels-photo-1024960.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '연인과 가고 싶은 첫 데이트 장소는?', options: [{ text: '북적이는 핫플레이스와 축제', scores: {e:2, c:1} }, { text: '조용하고 분위기 있는 골목 카페', scores: {p:2, l:1} }] },
            { q: '연락 빈도에 대한 당신의 생각은?', options: [{ text: '일상의 모든 것을 공유하고 싶다', scores: {e:1, p:2} }, { text: '각자의 시간을 존중하는 연락이 좋다', scores: {l:2, p:1} }] },
            { q: '연인과 사소한 말다툼을 했다면?', options: [{ text: '그 자리에서 바로 대화로 푼다', scores: {e:1, l:2} }, { text: '잠시 시간을 갖고 감정을 추스른다', scores: {p:2, l:1} }] },
            { q: '기념일에 더 선호하는 선물은?', options: [{ text: '실용적이고 평소 필요했던 물건', scores: {l:2, e:1} }, { text: '정성이 담긴 편지와 추억의 선물', scores: {p:2, c:1} }] },
            { q: '연인이 갑자기 집 앞으로 찾아왔다면?', options: [{ text: '설레고 너무 기뻐서 바로 나간다', scores: {e:2, p:1} }, { text: '조금 당황스럽지만 고마운 마음이 든다', scores: {l:1, p:2} }] },
            { q: '사랑을 표현할 때 더 중요한 것은?', options: [{ text: '자주 말해주는 직접적인 애정 표현', scores: {e:2, c:1} }, { text: '행동으로 보여주는 든든한 배려', scores: {l:2, p:1} }] },
            { q: '이상적인 연인 관계의 모습은?', options: [{ text: '함께 성장하며 자극을 주는 관계', scores: {e:1, l:2} }, { text: '있는 그대로를 수용해주는 관계', scores: {p:2, c:1} }] }
        ],
        results: {
            energy: { title: '직진하는 불꽃 사랑', desc: '사랑에 있어 매우 솔직하고 열정적이며 연인에게 확신을 줍니다.', img: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#ef4444', tags: ['#열정', '#직진', '#사랑꾼'] },
            logic: { title: '신중한 신뢰의 건축가', desc: '감정보다 신뢰와 안정을 중요하게 여기며 탄탄한 관계를 쌓아갑니다.', img: 'https://images.pexels.com/photos/15526647/pexels-photo-15526647.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#3b82f6', tags: ['#신뢰', '#안정', '#현명함'] },
            empathy: { title: '은은하게 스며드는 사랑', desc: '한결같은 모습과 세심한 배려로 연인의 마음을 따뜻하게 녹입니다.', img: 'https://images.pexels.com/photos/14947741/pexels-photo-14947741.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#10b981', tags: ['#배려', '#다정함', '#해바라기'] },
            creativity: { title: '영감을 주는 소울메이트', desc: '독특한 데이트와 깊은 대화로 연인과 특별한 세계를 공유합니다.', img: 'https://images.pexels.com/photos/15343619/pexels-photo-15343619.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#8b5cf6', tags: ['#특별함', '#소울메이트', '#감성'] }
        }
    },
    {
        id: 'p4', category: '성격', title: '스트레스 방어기제 테스트', desc: '힘든 상황에서 당신의 마음이 어떻게 스스로를 보호하는지 분석합니다.', thumb: 'https://images.pexels.com/photos/6985001/pexels-photo-6985001.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '예상치 못한 큰 실수를 저질렀다면?', options: [{ text: '즉시 원인을 파악하고 해결책을 찾는다', scores: {l:2, e:1} }, { text: '일단 기분 전환을 위해 다른 일을 한다', scores: {c:2, p:1} }] },
            { q: '누군가 나를 이유 없이 비난한다면?', options: [{ text: '당당하게 나의 입장을 논리적으로 설명한다', scores: {l:2, e:1} }, { text: '상대할 가치가 없다고 생각하며 무시한다', scores: {p:1, l:2} }] },
            { q: '업무나 공부가 너무 쌓여 압박을 느낄 때?', options: [{ text: '우선순위를 정해 계획표를 짠다', scores: {l:2, p:1} }, { text: '잠시 잠을 자거나 휴식을 취하며 잊는다', scores: {p:2, c:1} }] },
            { q: '친구와 심한 갈등이 생겼을 때?', options: [{ text: '먼저 연락해서 대화를 시도한다', scores: {e:2, p:1} }, { text: '시간이 해결해 줄 것이라 믿고 기다린다', scores: {p:2, l:1} }] },
            { q: '슬픈 영화를 볼 때 당신의 모습은?', options: [{ text: '감정을 억누르지 않고 펑펑 운다', scores: {p:2, c:1} }, { text: '눈물이 나려 해도 꾹 참는다', scores: {l:2, e:1} }] },
            { q: '중요한 발표를 앞두고 떨린다면?', options: [{ text: '연습을 반복하며 완벽을 기한다', scores: {l:2, e:1} }, { text: '심호흡을 하며 마인드 컨트롤을 한다', scores: {p:2, c:1} }] },
            { q: '과거의 창피했던 기억이 떠오르면?', options: [{ text: '그때 왜 그랬을까 분석해본다', scores: {l:2, p:1} }, { text: '머리를 흔들며 강제로 생각을 지운다', scores: {e:1, c:2} }] }
        ],
        results: {
            energy: { title: '강인한 철벽 방어형', desc: '스트레스 상황에서 정면 돌파하려는 강한 의지를 가졌습니다.', img: 'https://images.pexels.com/photos/2832382/pexels-photo-2832382.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#475569', tags: ['#강철멘탈', '#정면돌파', '#단호함'] },
            logic: { title: '침착한 전략적 분석가', desc: '문제를 논리적으로 해체하여 감정에 휘둘리지 않고 해결합니다.', img: 'https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#334155', tags: ['#분석가', '#이성적', '#차분함'] },
            empathy: { title: '유연한 감성 수용자', desc: '감정을 있는 그대로 받아들이고 스스로를 치유하는 능력이 뛰어납니다.', img: 'https://images.pexels.com/photos/7130503/pexels-photo-7130503.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#94a3b8', tags: ['#회복탄력성', '#수용', '#힐러'] },
            creativity: { title: '창의적 승화의 대가', desc: '스트레스를 예술이나 새로운 아이디어로 승화시키는 독특한 능력이 있습니다.', img: 'https://images.pexels.com/photos/2832432/pexels-photo-2832432.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#8b5cf6', tags: ['#승화', '#아이디어', '#특별함'] }
        }
    },
    {
        id: 'p5', category: '성격', title: '나만의 여행 DNA', desc: '여행지에서 보여주는 행동으로 당신의 핵심 성격을 진단합니다.', thumb: 'https://images.pexels.com/photos/1051073/pexels-photo-1051073.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '여행 계획을 세울 때 당신의 스타일은?', options: [{ text: '시간 단위로 꼼꼼하게 동선을 짠다', scores: {l:2, e:1} }, { text: '목적지만 정하고 나머지는 가서 정한다', scores: {c:2, p:1} }] },
            { q: '공항에 도착했을 때 가장 먼저 드는 기분은?', options: [{ text: '늦지 않을지 걱정되고 분주하다', scores: {l:2, p:1} }, { text: '이미 떠난다는 사실로 즐겁다', scores: {e:2, c:1} }] },
            { q: '유명 맛집에 줄이 너무 길다면?', options: [{ text: '꼭 가야 한다면 끝까지 기다린다', scores: {l:1, e:2} }, { text: '옆에 있는 다른 식당으로 간다', scores: {c:1, p:2} }] },
            { q: '여행 중 비가 온다면 당신의 대처는?', options: [{ text: '실내 미술관 등으로 계획을 수정한다', scores: {l:2, c:1} }, { text: '빗소리를 들으며 숙소에서 쉰다', scores: {p:2, l:1} }] },
            { q: '현지인들이 추천하는 낯선 음식은?', options: [{ text: '유명한 이유가 있을 테니 도전한다', scores: {e:2, c:1} }, { text: '내가 아는 익숙한 음식을 선택한다', scores: {l:2, p:1} }] },
            { q: '여행 사진을 찍을 때 더 중점을 두는 곳은?', options: [{ text: '내가 잘 나온 예쁜 인물 사진', scores: {e:2, p:1} }, { text: '그곳 분위기가 담긴 풍경 사진', scores: {c:2, l:1} }] },
            { q: '여행이 끝나고 돌아오는 길에 드는 생각?', options: [{ text: '집에 가서 쉬고 싶다는 생각', scores: {l:2, p:1} }, { text: '다음엔 어디로 갈까 하는 생각', scores: {e:1, c:2} }] }
        ],
        results: {
            energy: { title: '열정적인 어드벤처러', desc: '새로운 세상을 직접 부딪히며 탐험하는 에너지가 넘치는 여행자입니다.', img: 'https://images.pexels.com/photos/2108845/pexels-photo-2108845.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#f97316', tags: ['#모험', '#열정', '#탐험가'] },
            logic: { title: '철저한 전략 기획가', desc: '모든 상황을 예측하고 최적의 경로를 찾는 완벽주의 여행자입니다.', img: 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#334155', tags: ['#계획형', '#분석', '#안정성'] },
            empathy: { title: '감성적인 낭만 방랑자', desc: '현지의 분위기와 사람들의 마음에 공감하며 여유를 즐기는 여행자입니다.', img: 'https://images.pexels.com/photos/238622/pexels-photo-238622.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#10b981', tags: ['#감성', '#여유', '#낭만'] },
            creativity: { title: '독창적인 무드 탐색가', desc: '남들은 가지 않는 숨은 명소를 찾고 자신만의 시각으로 기록하는 여행자입니다.', img: 'https://images.pexels.com/photos/16148505/pexels-photo-16148505.jpeg?auto=compress&cs=tinysrgb&w=800', color: '#8b5cf6', tags: ['#유니크', '#아티스트', '#기록'] }
        }
    },
    {
        id: 'p6', category: '성격', title: '대화 습관 분석기', desc: '평소 대화 방식을 통해 당신이 타인과 관계를 맺는 핵심적인 특징을 분석합니다.', thumb: 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '친구가 우울하다고 연락이 왔을 때?', options: [{ text: '이유를 물어보고 현실적인 위로를 한다', type: 'A' }, { text: '일단 만나서 기분을 풀어주려 노력한다', type: 'B' }] },
            { q: '대화 중 침묵이 흐를 때 당신은?', options: [{ text: '어색함을 참지 못하고 먼저 화제를 꺼낸다', type: 'A' }, { text: '침묵을 자연스럽게 받아들이고 기다린다', type: 'B' }] },
            { q: '나의 이야기를 할 때 당신의 스타일은?', options: [{ text: '결론부터 명확하게 말하는 편이다', type: 'A' }, { text: '상황과 감정을 상세히 설명하는 편이다', type: 'B' }] },
            { q: '상대방의 의견에 동의하지 않을 때?', options: [{ text: '나의 생각을 솔직하고 분명하게 밝힌다', type: 'A' }, { text: '상대방의 기분을 고려해 완곡하게 표현한다', type: 'B' }] },
            { q: '모임에서 주로 어떤 역할을 하나요?', options: [{ text: '대화를 주도하고 활기를 불어넣는 역할', type: 'A' }, { text: '이야기를 잘 들어주고 리액션해주는 역할', type: 'B' }] },
            { q: '비밀을 지켜달라는 부탁을 받으면?', options: [{ text: '어떤 상황에서도 절대 발설하지 않는다', type: 'A' }, { text: '정말 신뢰하는 딱 한 명에게만 고민을 상담한다', type: 'B' }] },
            { q: '통화와 카톡 중 더 선호하는 것은?', options: [{ text: '목소리로 감정을 느끼는 실시간 통화', type: 'A' }, { text: '생각을 정리해서 보낼 수 있는 메시지', type: 'B' }] }
        ],
        results: {
            A: { title: '명쾌한 소통의 마스터', desc: '당신은 주관이 뚜렷하고 의사전달 능력이 뛰어납니다. 사람들에게 신뢰감을 주는 명확한 화법이 강점입니다.', img: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800' },
            B: { title: '따뜻한 공감의 리스너', desc: '당신은 상대방의 마음을 어루만질 줄 아는 소통가입니다. 당신과 대화한 사람들은 모두 위로와 평온함을 얻습니다.', img: 'https://images.pexels.com/photos/3184391/pexels-photo-3184391.jpeg?auto=compress&cs=tinysrgb&w=800' }
        }
    },
    {
        id: 'p7', category: '성격', title: '우정 스타일 리포트', desc: '당신이 친구들 사이에서 어떤 존재인지, 어떤 우정을 지향하는지 분석합니다.', thumb: 'https://images.pexels.com/photos/461049/pexels-photo-461049.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '친구의 생일이 다가오면 당신은?', options: [{ text: '미리 선물을 준비하고 깜짝 파티를 계획한다', type: 'A' }, { text: '축하 메시지와 함께 친구가 원하는 선물을 묻는다', type: 'B' }] },
            { q: '오랜만에 연락한 친구가 만나자고 하면?', options: [{ text: '무조건 시간을 비워 반갑게 만난다', type: 'A' }, { text: '나의 스케줄을 확인한 뒤 신중히 약속을 잡는다', type: 'B' }] },
            { q: '친구가 나와 다른 취미를 갖자고 권하면?', options: [{ text: '친구를 위해서 기꺼이 함께 시도해본다', type: 'A' }, { text: '나와 맞지 않는다면 정중히 거절한다', type: 'B' }] },
            { q: '여행 중 친구와 의견이 갈린다면?', options: [{ text: '최대한 친구의 의견에 맞춰주려 노력한다', type: 'A' }, { text: '서로 절충안을 찾을 때까지 대화한다', type: 'B' }] },
            { q: '친구에게 서운한 점이 생겼을 때?', options: [{ text: '나중에 기회를 봐서 웃으며 이야기한다', type: 'A' }, { text: '속으로 삭이며 스스로 감정을 정리한다', type: 'B' }] },
            { q: '내가 생각하는 진정한 친구의 기준은?', options: [{ text: '매일 연락하고 자주 보는 즐거운 사이', type: 'A' }, { text: '가끔 연락해도 어제 본 것 같은 깊은 사이', type: 'B' }] },
            { q: '친구가 슬픈 일을 당했을 때 당신은?', options: [{ text: '함께 화내주고 울어주며 감정을 공유한다', type: 'A' }, { text: '든든하게 곁을 지키며 필요한 도움을 준다', type: 'B' }] }
        ],
        results: {
            A: { title: '의리 넘치는 분위기 메이커', desc: '당신은 우정을 매우 소중히 여기며 친구들에게 즐거움을 주는 존재입니다. 당신 주변엔 항상 활기가 넘칩니다.', img: 'https://images.pexels.com/photos/1587014/pexels-photo-1587014.jpeg?auto=compress&cs=tinysrgb&w=800' },
            B: { title: '한결같은 마음의 안식처', desc: '당신은 깊고 단단한 인간관계를 선호하는 사람입니다. 친구들은 당신의 조언과 침착함에서 큰 위안을 얻습니다.', img: 'https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?auto=compress&cs=tinysrgb&w=800' }
        }
    },
    {
        id: 'p8', category: '성격', title: '결단력 MBTI 테스트', desc: '당신이 선택의 기로에서 보여주는 결단력과 사고의 흐름을 분석합니다.', thumb: 'https://images.pexels.com/photos/5849552/pexels-photo-5849552.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '점심 메뉴를 정할 때 당신은?', options: [{ text: '먹고 싶은 메뉴를 3초 안에 결정한다', type: 'A' }, { text: '리뷰와 메뉴판을 한참 동안 살펴본다', type: 'B' }] },
            { q: '물건을 살 때 더 중요한 기준은?', options: [{ text: '디자인과 첫인상', type: 'A' }, { text: '성능과 가성비 비교', type: 'B' }] },
            { q: '약속 장소에 늦었을 때 당신의 행동은?', options: [{ text: '가장 빠른 택시를 타고 이동한다', type: 'A' }, { text: '지하철과 버스 시간을 비교해 최적 경로를 찾는다', type: 'B' }] },
            { q: '새로운 전자기기를 샀을 때?', options: [{ text: '일단 전원부터 켜고 이것저것 눌러본다', type: 'A' }, { text: '설명서를 정독한 뒤 기능을 익힌다', type: 'B' }] },
            { q: '갑작스러운 업무 변경 지시가 내려오면?', options: [{ text: '일단 알겠다고 하고 즉시 실행한다', type: 'A' }, { text: '변경 사유를 묻고 전체 일정을 재검토한다', type: 'B' }] },
            { q: '영화 선택을 못 하고 있을 때 당신은?', options: [{ text: '제일 상단에 있는 인기 영화를 본다', type: 'A' }, { text: '예고편과 평점을 꼼꼼히 확인한다', type: 'B' }] },
            { q: '인생의 중대한 결정을 앞두고 있다면?', options: [{ text: '나의 가슴이 시키는 대로 선택한다', type: 'A' }, { text: '장단점 리스트를 적어보고 머리로 판단한다', type: 'B' }] }
        ],
        results: {
            A: { title: '단호한 직관주의자', desc: '당신은 빠른 판단력과 실행력을 겸비한 리더 타입입니다. 불필요한 고민보다는 행동으로 결과를 만드는 사람입니다.', img: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=800' },
            B: { title: '신중한 전략 분석가', desc: '당신은 돌다리도 두드려보고 건너는 완벽주의 성향을 가졌습니다. 당신의 결정은 언제나 오류가 적고 탄탄합니다.', img: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=800' }
        }
    },
    {
        id: 'p9', category: '성격', title: '워크 스타일 리포트', desc: '일이나 과제를 할 때 나타나는 당신만의 효율성과 협업 방식을 진단합니다.', thumb: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '업무가 시작되면 당신이 가장 먼저 하는 일은?', options: [{ text: '전체적인 목표를 머릿속에 그린다', type: 'A' }, { text: 'To-Do 리스트를 문서화한다', type: 'B' }] },
            { q: '팀 프로젝트 중 의견 충돌이 발생하면?', options: [{ text: '나의 논리가 맞다면 끝까지 설득한다', type: 'A' }, { text: '전체의 화합을 위해 조금씩 양보한다', type: 'B' }] },
            { q: '집중력이 가장 잘 발휘되는 환경은?', options: [{ text: '적당한 소음이 있는 카페 같은 자유로운 곳', type: 'A' }, { text: '아무런 방해 없는 조용한 독서실 같은 곳', type: 'B' }] },
            { q: '마감 기한이 코앞으로 다가왔을 때?', options: [{ text: '엄청난 몰입도로 막판 스퍼트를 낸다', type: 'A' }, { text: '평소처럼 침착하게 남은 분량을 처리한다', type: 'B' }] },
            { q: '나의 업무 책상 스타일은?', options: [{ text: '창의적인 아이디어가 솟는 자유로운 정돈', type: 'A' }, { text: '칼같이 정리된 사무용품의 배치', type: 'B' }] },
            { q: '새로운 업무 도구를 도입해야 한다면?', options: [{ text: '좋아 보이면 바로 사용해본다', type: 'A' }, { text: '기존 방식보다 확실히 나은지 검증한다', type: 'B' }] },
            { q: '퇴근 시간이 되었는데 일이 조금 남았다면?', options: [{ text: '내일의 나에게 맡기고 일단 퇴근한다', type: 'A' }, { text: '찝찝하니 남아서 끝까지 마무리한다', type: 'B' }] }
        ],
        results: {
            A: { title: '창의적인 해결사', desc: '당신은 정해진 틀에 얽매이지 않고 새로운 길을 찾는 혁신가 타입입니다. 위기 상황에서 빛나는 기지를 발휘합니다.', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=500&q=60' },
            B: { title: '성실한 완벽가', desc: '당신은 주어진 역할을 묵묵히, 그리고 완벽하게 수행하는 조직의 기둥 같은 존재입니다. 당신의 책임감은 독보적입니다.', img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'p10', category: '성격', title: '자존감 온도 측정기', desc: '당신의 자존감 상태와 외부 자극에 대한 마음의 회복탄력성을 측정합니다.', thumb: 'https://images.pexels.com/photos/1051073/pexels-photo-1051073.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '거울 속 나의 모습을 볼 때 드는 생각은?', options: [{ text: '이 정도면 꽤 괜찮지! 만족한다', type: 'A' }, { text: '자꾸 단점이 보여서 고치고 싶다', type: 'B' }] },
            { q: '타인에게 칭찬을 받았을 때 당신은?', options: [{ text: '기분 좋게 감사하며 온전히 받아들인다', type: 'A' }, { text: '빈말이 아닐까 의심하거나 쑥스러워한다', type: 'B' }] },
            { q: '중요한 시험이나 면접에서 떨어졌다면?', options: [{ text: '부족한 점을 보완해 다시 도전할 의지를 다진다', type: 'A' }, { text: '나의 능력 자체에 의문을 가지며 자책한다', type: 'B' }] },
            { q: '남들이 다 하는 유행을 따라가지 못할 때?', options: [{ text: '나만의 개성이 중요하다고 생각하며 개의치 않는다', type: 'A' }, { text: '왠지 나만 뒤처지는 것 같아 불안함을 느낀다', type: 'B' }] },
            { q: '친구가 연락이 늦어지면 당신의 생각은?', options: [{ text: '많이 바쁜가 보다 생각하며 넘긴다', type: 'A' }, { text: '내가 뭐 잘못했나 걱정하며 불안해한다', type: 'B' }] },
            { q: '나의 감정을 타인에게 드러내는 것은?', options: [{ text: '솔직하게 표현하는 것이 건강하다고 믿는다', type: 'A' }, { text: '약점을 잡힐 것 같아 최대한 감추려 한다', type: 'B' }] },
            { q: '오늘 하루 수고한 나에게 해주고 싶은 말은?', options: [{ text: '정말 고생 많았어, 넌 최고야!', type: 'A' }, { text: '내일은 좀 더 열심히 살아야겠다', type: 'B' }] }
        ],
        results: {
            A: { title: '햇살 가득 맑은 하늘형', desc: '당신의 자존감은 매우 건강하고 안정적입니다. 자신을 사랑하는 마음이 타인에게도 긍정적인 영향을 미칩니다.', img: 'https://images.pexels.com/photos/1490730/pexels-photo-1490730.jpeg?auto=compress&cs=tinysrgb&w=800' },
            B: { title: '은은한 달빛 구름형', desc: '당신은 섬세하고 사려 깊은 마음을 가졌지만, 때로는 자신에게 너무 엄격할 때가 있습니다. 당신은 충분히 아름다운 사람입니다.', img: 'https://images.pexels.com/photos/1532767/pexels-photo-1532767.jpeg?auto=compress&cs=tinysrgb&w=800' }
        }
    },
    {
        id: 'p11', category: '성격', title: '나의 멘탈 방어력 측정', desc: '당신의 정신적 맷집과 어려운 상황에서의 극복 능력을 7단계로 테스트합니다.', thumb: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '갑작스러운 약속 취소 통보를 받는다면?', options: [{ text: '오히려 좋아! 혼자만의 시간을 즐긴다', type: 'A' }, { text: '준비 다 했는데... 서운함이 몰려온다', type: 'B' }] },
            { q: '모르는 사람들 앞에서 발표를 해야 한다면?', options: [{ text: '나를 뽐낼 수 있는 좋은 기회라고 생각한다', type: 'A' }, { text: '심장이 두근거리고 도망치고 싶어진다', type: 'B' }] },
            { q: '친구가 나에게 직언(팩폭)을 날린다면?', options: [{ text: '나를 위한 조언으로 겸허히 받아들인다', type: 'A' }, { text: '알긴 하지만 상처받고 자꾸 생각난다', type: 'B' }] },
            { q: '계획했던 일이 완전히 틀어졌을 때?', options: [{ text: '즉시 Plan B를 세워 실행에 옮긴다', type: 'A' }, { text: '머릿속이 하얘지고 패닉에 빠진다', type: 'B' }] },
            { q: '나에 대한 안 좋은 소문을 듣게 된다면?', options: [{ text: '어쩌라고? 내 갈 길을 묵묵히 간다', type: 'A' }, { text: '해명하고 싶고 하루 종일 신경 쓰인다', type: 'B' }] },
            { q: '어려운 퍼즐이나 퀴즈를 만났을 때?', options: [{ text: '풀릴 때까지 끝까지 매달려본다', type: 'A' }, { text: '적당히 고민하다가 해설을 찾아본다', type: 'B' }] },
            { q: '혼자 밤길을 걷다 무서운 느낌이 들면?', options: [{ text: '침착하게 주변을 살피며 발걸음을 재촉한다', type: 'A' }, { text: '온갖 무서운 상상을 하며 전력 질주한다', type: 'B' }] }
        ],
        results: {
            A: { title: '무적의 강철 멘탈', desc: '당신은 어떤 시련에도 쉽게 굴하지 않는 단단한 마음을 가졌습니다. 위기를 기회로 바꾸는 능력이 탁월합니다.', img: 'https://images.unsplash.com/photo-1506126613408-eca57c42797c?auto=format&fit=crop&w=500&q=60' },
            B: { title: '유리알 감성 소유자', desc: '당신은 섬세하고 공감 능력이 뛰어난 마음을 가졌습니다. 때로는 힘들 수 있지만 그만큼 세상을 아름답게 느낍니다.', img: 'https://images.unsplash.com/photo-1516589174184-c68d8e5fcc4a?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'p12', category: '성격', title: '돈 관리 성향 테스트', desc: '당신의 소비 습관과 부를 대하는 태도를 통해 성격의 이면을 분석합니다.', thumb: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '갑자기 보너스 100만원이 생겼다면?', options: [{ text: '미래를 위해 저축하거나 투자한다', type: 'A' }, { text: '평소 사고 싶었던 물건을 지른다', type: 'B' }] },
            { q: '친구들과의 모임에서 계산할 때?', options: [{ text: '1원 단위까지 깔끔하게 N분 일 한다', type: 'A' }, { text: '이번엔 내가 내고 다음에 얻어먹는다', type: 'B' }] },
            { q: '쇼핑몰에서 마음에 드는 비싼 옷을 봤을 때?', options: [{ text: '세일 기간을 기다리거나 장단점을 따진다', type: 'A' }, { text: '지금 안 사면 품절될 것 같아 결제한다', type: 'B' }] },
            { q: '한 달 가계부를 쓴 적이 있나요?', options: [{ text: '거의 매달 꼼꼼하게 기록한다', type: 'A' }, { text: '기록은 하지만 중간에 포기하는 편이다', type: 'B' }] },
            { q: '물건을 살 때 최저가를 찾는 편인가요?', options: [{ text: '모든 사이트를 비교해 가장 싼 곳을 찾는다', type: 'A' }, { text: '귀찮아서 대충 눈에 보이는 곳에서 산다', type: 'B' }] },
            { q: '돈을 벌어야 하는 가장 큰 이유는?', options: [{ text: '노후의 안락함과 미래의 대비를 위해', type: 'A' }, { text: '지금 현재 내가 하고 싶은 것을 하기 위해', type: 'B' }] },
            { q: '로또 1등에 당첨된다면 가장 먼저 할 일은?', options: [{ text: '주변에 알리지 않고 자산 전문가를 찾아간다', type: 'A' }, { text: '가족과 친구들에게 한턱 크게 낸다', type: 'B' }] }
        ],
        results: {
            A: { title: '철저한 자산 전략가', desc: '당신은 이성적이고 장기적인 시각을 가진 분입니다. 안정적인 기반 위에서 목표를 달성하는 타입입니다.', img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=500&q=60' },
            B: { title: '현재를 즐기는 욜로족', desc: '당신은 현재의 경험과 행복을 가장 중요하게 생각합니다. 낙천적이고 관대한 성격이 주변을 즐겁게 합니다.', img: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'p13', category: '성격', title: '나의 리더십 온도', desc: '집단 속에서 당신이 보여주는 영향력과 리더 스타일을 분석합니다.', thumb: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '팀 프로젝트의 팀장을 정해야 한다면?', options: [{ text: '자원하거나 추천을 받으면 기꺼이 맡는다', type: 'A' }, { text: '묵묵히 내 맡은 바 소임만 다하고 싶다', type: 'B' }] },
            { q: '의견 차이가 있을 때 당신의 조율 방식은?', options: [{ text: '논리적으로 설득하여 방향을 결정한다', type: 'A' }, { text: '모두의 의견을 듣고 다수결에 따른다', type: 'B' }] },
            { q: '팀원이 실수를 했을 때 당신의 반응은?', options: [{ text: '무엇이 잘못되었는지 명확히 지적하고 수정한다', type: 'A' }, { text: '격려하며 함께 해결책을 고민해본다', type: 'B' }] },
            { q: '목표 달성을 위해 가장 중요한 것은?', options: [{ text: '철저한 계획과 효율적인 시스템', type: 'A' }, { text: '팀원 간의 화합과 끈끈한 유대감', type: 'B' }] },
            { q: '긴급한 상황에서 당신의 모습은?', options: [{ text: '냉철하게 상황을 판단하고 지시를 내린다', type: 'A' }, { text: '주변의 동요를 막고 사람들을 안심시킨다', type: 'B' }] },
            { q: '어떤 리더가 더 훌륭하다고 생각하나요?', options: [{ text: '앞에서 강력하게 끌어주는 카리스마 리더', type: 'A' }, { text: '뒤에서 묵묵히 지원해주는 서번트 리더', type: 'B' }] },
            { q: '성과가 잘 나왔을 때 공을 돌리는 방식은?', options: [{ text: '전략을 잘 짠 나의 능력을 인정받고 싶다', type: 'A' }, { text: '모두가 열심히 해준 덕분이라고 말한다', type: 'B' }] }
        ],
        results: {
            A: { title: '카리스마 지휘관', desc: '당신은 목표 지향적이고 추진력이 강한 리더입니다. 명확한 비전으로 사람들을 행동하게 만드는 힘이 있습니다.', img: 'https://images.unsplash.com/photo-1507679799987-c7377ec486e8?auto=format&fit=crop&w=500&q=60' },
            B: { title: '포용력 있는 조율자', desc: '당신은 사람들의 마음을 얻는 부드러운 리더십을 가졌습니다. 당신과 함께라면 누구나 최고의 역량을 발휘합니다.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'p14', category: '성격', title: '창의성 잠재력 테스트', desc: '당신의 두뇌가 문제를 해결하는 방식과 창의적인 발상을 분석합니다.', thumb: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '새로운 요리를 할 때 당신은?', options: [{ text: '냉장고에 있는 재료들로 내 마음대로 만든다', type: 'A' }, { text: '검증된 레시피를 보고 정확히 따라 한다', type: 'B' }] },
            { q: '추상화 그림을 볼 때 드는 생각은?', options: [{ text: '작가의 의도가 무엇일까 상상력을 발휘한다', type: 'A' }, { text: '무엇을 그린 건지 이해하기 어렵다', type: 'B' }] },
            { q: '문제가 생겼을 때 해결하는 방식은?', options: [{ text: '아무도 생각하지 못한 새로운 방법을 찾는다', type: 'A' }, { text: '기존에 해왔던 가장 안전한 방법을 쓴다', type: 'B' }] },
            { q: '공상을 자주 하는 편인가요?', options: [{ text: '현실과 상관없는 엉뚱한 상상을 즐긴다', type: 'A' }, { text: '현실적인 계획과 일들을 주로 생각한다', type: 'B' }] },
            { q: '어떤 환경에서 아이디어가 더 잘 나오나요?', options: [{ text: '자유롭고 약간은 어수선한 공간', type: 'A' }, { text: '조용하고 질서 정연하게 정리된 공간', type: 'B' }] },
            { q: '호기심에 대한 당신의 정도는?', options: [{ text: '모든 것에 "왜?"라는 의문을 갖는다', type: 'A' }, { text: '필요한 정보만 습득하면 충분하다', type: 'B' }] },
            { q: '내가 발명가라면 어떤 것을 만들고 싶나요?', options: [{ text: '세상을 바꿀 수 있는 획기적인 발명품', type: 'A' }, { text: '생활의 불편함을 덜어주는 실용적인 도구', type: 'B' }] }
        ],
        results: {
            A: { title: '자유로운 상상가', desc: '당신은 무한한 가능성을 꿈꾸는 예술가적 영혼을 가졌습니다. 당신의 독특한 시선이 세상에 새로운 가치를 더합니다.', img: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=500&q=60' },
            B: { title: '실용적인 분석가', desc: '당신은 창의성을 현실로 구현해내는 뛰어난 능력을 가졌습니다. 체계적이고 실질적인 해결 능력이 당신의 강점입니다.', img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'p15', category: '성격', title: '스트레스 해소 유형', desc: '지친 당신의 영혼을 채워주는 가장 효과적인 휴식 방법을 제안합니다.', thumb: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '정말 힘든 하루를 보냈다면?', options: [{ text: '친구들을 만나 술 한잔하며 털어낸다', type: 'A' }, { text: '집에서 혼자 침대에 누워 넷플릭스를 본다', type: 'B' }] },
            { q: '휴일에 더 선호하는 활동은?', options: [{ text: '땀 흘리며 운동하거나 활동적으로 움직인다', type: 'A' }, { text: '독서를 하거나 조용히 명상을 한다', type: 'B' }] },
            { q: '스트레스를 받으면 입맛이 어떻게 되나요?', options: [{ text: '매운 것이나 맛있는 것을 찾아 폭식한다', type: 'A' }, { text: '입맛이 뚝 떨어져서 아무것도 먹기 싫다', type: 'B' }] },
            { q: '고민이 생겼을 때 당신은?', options: [{ text: '주변 사람들에게 말하며 위로를 얻는다', type: 'A' }, { text: '혼자 깊이 생각하며 답을 찾으려 한다', type: 'B' }] },
            { q: '가장 힐링이 되는 풍경은?', options: [{ text: '활기찬 사람들과 불빛이 가득한 도시 야경', type: 'A' }, { text: '고요한 파도 소리가 들리는 밤바다', type: 'B' }] },
            { q: '쇼핑으로 스트레스를 풀기도 하나요?', options: [{ text: '예쁜 물건을 사면 기분이 즉시 좋아진다', type: 'A' }, { text: '돈을 쓰면 오히려 나중에 스트레스를 더 받는다', type: 'B' }] },
            { q: '나만의 아지트가 있다면 어떤 곳인가요?', options: [{ text: '내가 좋아하는 사람들로 북적이는 단골집', type: 'A' }, { text: '나만 알고 싶은 조용하고 아늑한 카페', type: 'B' }] }
        ],
        results: {
            A: { title: '에너지 분출형', desc: '당신은 외부와의 교류를 통해 스트레스를 발산하는 타입입니다. 활동적인 취미가 당신의 삶에 활력을 줍니다.', img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=500&q=60' },
            B: { title: '내면 충전형', desc: '당신은 고요함 속에서 스스로를 정돈하며 에너지를 얻는 타입입니다. 정적인 휴식이 당신의 마음을 치유합니다.', img: 'https://images.unsplash.com/photo-1499209974431-9dac3e5d9774?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'p16', category: '성격', title: '나의 소비 습관 MBTI', desc: '영수증에 담긴 당신의 성격과 미래 자산 흐름을 분석합니다.', thumb: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '물건을 사기 전 당신의 행동은?', options: [{ text: '장단점과 후기를 꼼꼼히 검색한다', type: 'A' }, { text: '한눈에 반하면 고민 없이 결제한다', type: 'B' }] },
            { q: '식비를 아끼기 위해 도시락을 쌀 수 있나요?', options: [{ text: '절약을 위해서라면 기꺼이 실천한다', type: 'A' }, { text: '시간과 노력이 더 들어서 그냥 사 먹는다', type: 'B' }] },
            { q: '신용카드와 체크카드 중 주로 쓰는 것은?', options: [{ text: '잔액 범위 내에서 쓰는 체크카드가 편하다', type: 'A' }, { text: '혜택과 할부가 가능한 신용카드를 선호한다', type: 'B' }] },
            { q: '충동구매를 한 경험이 자주 있나요?', options: [{ text: '거의 없다, 계획에 없는 지출은 피한다', type: 'A' }, { text: '기분이 좋거나 나쁠 때 자주 하는 편이다', type: 'B' }] },
            { q: '돈을 모으는 가장 효율적인 방법은?', options: [{ text: '지출을 줄이는 것이 가장 확실하다', type: 'A' }, { text: '수입을 늘릴 방법을 찾는 것이 빠르다', type: 'B' }] },
            { q: '나를 위한 선물(보상)의 빈도는?', options: [{ text: '정말 큰 목표를 달성했을 때만 한다', type: 'A' }, { text: '수고한 나를 위해 자주 소소하게 선물한다', type: 'B' }] },
            { q: '주식이나 비트코인 투자에 대한 생각은?', options: [{ text: '원금이 보장되는 안전한 투자가 최고다', type: 'A' }, { text: '위험해도 고수익을 노리는 공격적 투자가 좋다', type: 'B' }] }
        ],
        results: {
            A: { title: '알뜰한 살림꾼', desc: '당신은 경제 관념이 뚜렷하고 계획적인 분입니다. 차곡차곡 쌓이는 자산과 함께 미래가 밝습니다.', img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=500&q=60' },
            B: { title: '플렉스 마스터', desc: '당신은 시원시원한 성격과 통 큰 소비력을 가졌습니다. 현재의 행복을 극대화할 줄 아는 멋쟁이입니다.', img: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'p17', category: '성격', title: '공감 능력(EQ) 진단', desc: '타인의 감정을 읽는 당신의 따뜻한 시선과 소통의 깊이를 측정합니다.', thumb: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '친구가 눈물을 흘리고 있다면?', options: [{ text: '왜 우는지 원인을 묻고 해결해주려 한다', type: 'A' }, { text: '아무 말 없이 꽉 안아주며 함께 슬퍼한다', type: 'B' }] },
            { q: '영화 속 주인공이 억울한 일을 당하면?', options: [{ text: '현실이 아니니 덤덤하게 관찰한다', type: 'A' }, { text: '마치 내 일처럼 화가 나고 가슴이 아프다', type: 'B' }] },
            { q: '대화할 때 당신이 주로 하는 말은?', options: [{ text: '"내 생각엔 이래..." 본인의 의견 중심', type: 'A' }, { text: '"맞아, 진짜 그랬겠다!" 상대방 맞장구 중심', type: 'B' }] },
            { q: '처음 만난 사람과 친해지는 속도는?', options: [{ text: '조금 시간이 걸리지만 천천히 알아간다', type: 'A' }, { text: '금방 공통점을 찾아 친근하게 대화한다', type: 'B' }] },
            { q: '길가에 핀 작은 풀꽃을 보며 드는 생각은?', options: [{ text: '그냥 자연의 일부라고 생각한다', type: 'A' }, { text: '척박한 곳에서 자라난 것이 기특하고 예쁘다', type: 'B' }] },
            { q: '누군가 나에게 실수를 했다면?', options: [{ text: '잘못된 부분은 확실히 짚고 넘어간다', type: 'A' }, { text: '그럴만한 사정이 있었겠지 하며 이해하려 한다', type: 'B' }] },
            { q: '반려동물의 기분을 잘 읽는 편인가요?', options: [{ text: '배고픈지 산책 가고 싶은지 정도만 안다', type: 'A' }, { text: '눈빛만 봐도 무엇을 원하는지 마음이 느껴진다', type: 'B' }] }
        ],
        results: {
            A: { title: '이성적인 해결사', desc: '당신은 감정보다는 상황을 객관적으로 파악하는 능력이 뛰어납니다. 실질적인 도움을 주는 든든한 조력자입니다.', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=500&q=60' },
            B: { title: '감성 충만 힐러', desc: '당신은 타인의 슬픔과 기쁨을 온전히 함께할 줄 아는 따뜻한 분입니다. 당신의 존재 자체가 누군가에겐 큰 위로입니다.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'p18', category: '성격', title: '나의 유머 코드 분석', desc: '당신이 사람들을 웃게 만드는 방식과 좋아하는 유머 스타일을 분석합니다.', thumb: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '어색한 분위기를 깨고 싶을 때 당신은?', options: [{ text: '자신의 흑역사를 셀프 디스하며 웃음을 유도한다', type: 'A' }, { text: '요즘 유행하는 재미있는 짤이나 정보를 공유한다', type: 'B' }] },
            { q: '친구의 썰렁한 아재 개그에 대한 반응은?', options: [{ text: '무표정으로 팩트 체크를 하며 찬물을 끼얹는다', type: 'A' }, { text: '너무 어이가 없어서 실소라도 터뜨려준다', type: 'B' }] },
            { q: '주변에서 당신을 부르는 별명은?', options: [{ text: '드립력이 뛰어난 미친 존재감', type: 'A' }, { text: '조용히 한 방씩 날리는 반전 매력', type: 'B' }] },
            { q: '어떤 장르의 예능을 더 좋아하나요?', options: [{ text: '멤버들의 케미가 돋보이는 리얼 버라이어티', type: 'A' }, { text: '정교하게 짜인 대본과 상황극의 코미디', type: 'B' }] },
            { q: '나의 웃음 장벽은 어떤가요?', options: [{ text: '남들은 안 웃는 포인트에서 혼자 빵 터진다', type: 'A' }, { text: '웬만해선 크게 웃지 않는 엄격한 편이다', type: 'B' }] },
            { q: '좋아하는 사람에게 매력을 어필하는 법은?', options: [{ text: '재미있는 이야기로 즐겁게 해준다', type: 'A' }, { text: '다정하고 진중한 모습으로 다가간다', type: 'B' }] },
            { q: '세상에서 가장 재미있는 것은?', options: [{ text: '사람들과 수다 떨며 웃는 시간', type: 'A' }, { text: '혼자서 재미있는 콘텐츠를 감상하는 시간', type: 'B' }] }
        ],
        results: {
            A: { title: '본투비 엔터테이너', desc: '당신은 타고난 유머 감각과 센스를 지닌 분입니다. 당신이 가는 곳마다 웃음꽃이 피어납니다.', img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=500&q=60' },
            B: { title: '고급스러운 블랙 유머가', desc: '당신은 관찰력이 예리하고 지적인 유머를 즐기는 분입니다. 짧지만 굵은 한마디로 사람들을 매료시킵니다.', img: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'p19', category: '성격', title: '워커홀릭 지수 테스트', desc: '일과 삶의 균형을 맞추고 있는지, 당신의 열정이 어디로 향하고 있는지 진단합니다.', thumb: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '퇴근 후 집에서도 업무 연락을 확인하나요?', options: [{ text: '당연히 확인하고 급한 건 바로 처리한다', type: 'A' }, { text: '내일 출근해서 확인하기 위해 알림을 끈다', type: 'B' }] },
            { q: '주말에 아무런 계획이 없다면?', options: [{ text: '밀린 공부를 하거나 자기계발을 한다', type: 'A' }, { text: '하루 종일 잠을 자거나 멍하게 쉰다', type: 'B' }] },
            { q: '완벽하게 일을 처리하지 못했을 때?', options: [{ text: '잠이 안 올 정도로 스트레스받고 자책한다', type: 'A' }, { text: '그럴 수도 있지 하며 다음 기회를 노린다', type: 'B' }] },
            { q: '나에게 "성공"이란 무엇인가요?', options: [{ text: '사회적 지위와 높은 연봉을 얻는 것', type: 'A' }, { text: '사랑하는 사람들과 행복한 시간을 보내는 것', type: 'B' }] },
            { q: '취미 생활을 할 때도 열정적인가요?', options: [{ text: '취미도 전문가 수준으로 잘하고 싶어 노력한다', type: 'A' }, { text: '그냥 스트레스 풀릴 정도로 즐기기만 한다', type: 'B' }] },
            { q: '휴가를 떠났을 때 당신의 마음은?', options: [{ text: '회사 일이 걱정되어 수시로 메일을 본다', type: 'A' }, { text: '핸드폰은 던져두고 휴가에만 온전히 몰입한다', type: 'B' }] },
            { q: '10년 뒤의 나에게 해주고 싶은 말은?', options: [{ text: '꿈을 이루기 위해 정말 열심히 살았구나!', type: 'A' }, { text: '여유를 즐기며 참 행복하게 살았구나!', type: 'B' }] }
        ],
        results: {
            A: { title: '열정의 불꽃 질주가', desc: '당신은 목표를 향해 쉬지 않고 달려가는 에너자이저입니다. 성취감에서 가장 큰 행복을 느끼는 타입입니다.', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=500&q=60' },
            B: { title: '여유로운 삶의 항해사', desc: '당신은 워라밸의 중요성을 알고 현재의 행복을 소중히 여깁니다. 마음의 평화가 당신의 가장 큰 자산입니다.', img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'p20', category: '성격', title: '나의 자아 성찰 리포트', desc: '당신이 스스로를 얼마나 잘 알고 있는지, 내면의 성숙도를 7단계로 분석합니다.', thumb: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=80',
        questions: [
            { q: '혼자 있는 시간을 어떻게 느끼나요?', options: [{ text: '에너지를 충전하는 소중하고 편안한 시간', type: 'A' }, { text: '외롭고 생각이 많아져서 조금 힘든 시간', type: 'B' }] },
            { q: '자신의 단점을 솔직하게 인정하나요?', options: [{ text: '인정하고 개선하려고 노력하는 편이다', type: 'A' }, { text: '단점을 마주하기 무서워 외면할 때가 많다', type: 'B' }] },
            { q: '일기를 쓰거나 기록을 남기는 편인가요?', options: [{ text: '생각과 감정을 글로 정리하며 돌아본다', type: 'A' }, { text: '기록보다는 그냥 머릿속으로 생각하고 넘긴다', type: 'B' }] },
            { q: '타인의 조언이 나의 생각과 다를 때?', options: [{ text: '왜 그렇게 말했는지 그 이면을 생각해본다', type: 'A' }, { text: '나를 무시한다고 생각하며 기분이 상한다', type: 'B' }] },
            { q: '나의 인생 가치관은 무엇인가요?', options: [{ text: '확고한 신념이 있고 그에 따라 행동한다', type: 'A' }, { text: '상황에 따라 유동적으로 변하는 편이다', type: 'B' }] },
            { q: '가장 최근에 나 자신을 칭찬한 적은?', options: [{ text: '오늘 또는 어제 소소한 일로 칭찬했다', type: 'A' }, { text: '기억이 나지 않을 정도로 오래되었다', type: 'B' }] },
            { q: '나는 나 자신과 친한가요?', options: [{ text: '나를 사랑하고 가장 든든한 내 편이다', type: 'A' }, { text: '나를 자꾸 비난하고 못살게 굴 때가 많다', type: 'B' }] }
        ],
        results: {
            A: { title: '깊은 내면의 탐구자', desc: '당신은 자신을 깊이 이해하고 사랑할 줄 아는 성숙한 영혼을 가졌습니다. 당신의 삶은 단단한 뿌리를 내리고 있습니다.', img: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=500&q=60' },
            B: { title: '피어나는 중인 성장판', desc: '당신은 현재 자신을 알아가는 소중한 과정 속에 있습니다. 조금만 더 자신을 믿어준다면 곧 활짝 꽃피울 것입니다.', img: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'v1', category: '얼굴', title: '퍼스널 무드 분석', desc: '당신의 이목구비가 풍기는 고유한 분위기와 매력을 정교하게 진단합니다.', thumb: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '거울을 볼 때 가장 먼저 눈에 띄는 곳은?', options: [{ text: '뚜렷한 눈매와 눈동자', type: 'A' }, { text: '매끄러운 턱선과 전체적인 실루엣', type: 'B' }] },
            { q: '평소 주변에서 어떤 칭찬을 많이 듣나요?', options: [{ text: '이목구비가 정말 화려하다', type: 'A' }, { text: '분위기가 정말 묘하고 신비롭다', type: 'B' }] },
            { q: '선호하는 사진 필터의 느낌은?', options: [{ text: '선명하고 색감이 뚜렷한 느낌', type: 'A' }, { text: '은은하고 부드러운 파스텔 느낌', type: 'B' }] },
            { q: '무표정일 때 당신의 인상은 어떤 편인가요?', options: [{ text: '카리스마 있고 차가운 도시적인 이미지', type: 'A' }, { text: '차분하고 선한 인상의 이미지', type: 'B' }] },
            { q: '잘 어울린다고 생각하는 액세서리는?', options: [{ text: '화려하고 볼드한 주얼리', type: 'A' }, { text: '작고 심플한 데일리 주얼리', type: 'B' }] },
            { q: '당신이 선호하는 메이크업 스타일은?', options: [{ text: '눈이나 입술에 확실한 포인트를 주는 스타일', type: 'A' }, { text: '한 듯 안 한 듯 자연스러운 꾸안꾸 스타일', type: 'B' }] },
            { q: '사진을 찍을 때 자신 있는 각도는?', options: [{ text: '정면에서 바라보는 당당한 각도', type: 'A' }, { text: '옆라인이 강조되는 분위기 있는 각도', type: 'B' }] }
        ],
        results: {
            A: { title: '고혹적인 시크 클래식', desc: '당신은 뚜렷한 존재감과 강렬한 에너지를 지닌 비주얼을 가졌습니다. 사람들의 시선을 단번에 사로잡는 화려함이 당신의 무기입니다.', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=500&q=60' },
            B: { title: '부드러운 내추럴 감성', desc: '당신은 편안하면서도 깊이 있는 무드를 지닌 비주얼을 가졌습니다. 볼수록 빠져드는 은은한 매력이 타인에게 편안함을 줍니다.', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'v2', category: '얼굴', title: '이미지 동물 찾기', desc: '당신의 이목구비 비율을 통해 닮은꼴 동물의 관상과 이미지를 분석합니다.', thumb: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '당신의 눈 모양은 어느 쪽에 가까운가요?', options: [{ text: '가로로 길고 눈꼬리가 살짝 올라간 눈', type: 'A' }, { text: '동그랗고 눈망울이 선명한 눈', type: 'B' }] },
            { q: '당신의 코끝 모양은 어떤가요?', options: [{ text: '오똑하고 날렵한 모양', type: 'A' }, { text: '둥글고 부드러운 모양', type: 'B' }] },
            { q: '웃을 때 입매의 모양은?', options: [{ text: '입꼬리가 시원하게 올라가는 스타일', type: 'A' }, { text: '입꼬리가 살짝 둥글게 말리는 스타일', type: 'B' }] },
            { q: '얼굴형의 전체적인 느낌은?', options: [{ text: '골격이 느껴지는 세련된 느낌', type: 'A' }, { text: '볼살이 약간 있는 귀여운 느낌', type: 'B' }] },
            { q: '본인과 잘 어울린다고 생각하는 동물은?', options: [{ text: '섹시한 고양이나 여우', type: 'A' }, { text: '순한 강아지나 토끼', type: 'B' }] },
            { q: '눈썹의 두께와 모양은 어떤가요?', options: [{ text: '진하고 각진 남성/여성적인 모양', type: 'A' }, { text: '연하고 완만한 일자 모양', type: 'B' }] },
            { q: '사람들에게 자주 듣는 말은?', options: [{ text: '첫인상이 강해 보인다', type: 'A' }, { text: '첫인상이 유해 보인다', type: 'B' }] }
        ],
        results: {
            A: { title: '도도한 고양이상', desc: '당신은 날렵하고 세련된 이미지를 가진 고양이상입니다. 도도해 보이지만 알수록 매력적인 반전 매력의 소유자입니다.', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=60' },
            B: { title: '포근한 강아지상', desc: '당신은 둥글둥글하고 선한 이미지를 가진 강아지상입니다. 누구에게나 호감을 주는 친근한 매력이 최고의 장점입니다.', img: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'v3', category: '얼굴', title: '첫인상 매력 포인트', desc: '처음 만난 사람이 당신에게서 느끼는 가장 독보적인 매력을 찾아드립니다.', thumb: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '대화할 때 당신의 주된 표정은?', options: [{ text: '진지하게 경청하는 표정', type: 'A' }, { text: '밝게 미소 짓는 표정', type: 'B' }] },
            { q: '자신의 얼굴에서 가장 자신 있는 부분은?', options: [{ text: '깊이 있는 눈빛', type: 'A' }, { text: '매력적인 입술 또는 보조개', type: 'B' }] },
            { q: '당신이 좋아하는 향수 계열은?', options: [{ text: '묵직한 우디나 머스크 계열', type: 'A' }, { text: '상큼한 시트러스나 플로럴 계열', type: 'B' }] },
            { q: '옷을 입을 때 더 중요하게 생각하는 것은?', options: [{ text: '핏과 실루엣의 완성도', type: 'A' }, { text: '컬러와 소재의 조화', type: 'B' }] },
            { q: '사람들과 처음 만났을 때 당신의 행동은?', options: [{ text: '차분하게 상황을 지켜본다', type: 'A' }, { text: '먼저 웃으며 인사를 건넨다', type: 'B' }] },
            { q: '당신이 선호하는 헤어 컬러는?', options: [{ text: '차분한 블랙이나 다크 브라운', type: 'A' }, { text: '화사한 브라운이나 밝은 컬러', type: 'B' }] },
            { q: '평소 즐겨 입는 상의 넥라인은?', options: [{ text: '단정한 셔츠나 셔츠형 칼라', type: 'A' }, { text: '편안한 라운드나 브이넥', type: 'B' }] }
        ],
        results: {
            A: { title: '지적인 아우라 마스터', desc: '당신은 성숙하고 이지적인 분위기로 상대방을 압도합니다. 신뢰감을 주는 눈빛이 당신의 가장 큰 무기입니다.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=60' },
            B: { title: '햇살 같은 러블리 아이콘', desc: '당신은 밝고 긍정적인 에너지를 뿜어내는 비주얼을 가졌습니다. 당신의 웃음은 주변을 순식간에 환하게 만드는 힘이 있습니다.', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'v4', category: '얼굴', title: '스마일 라인 진단', desc: '당신이 웃을 때 나타나는 입매와 볼 근육의 조화를 통해 최고의 미소를 찾아냅니다.', thumb: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '웃을 때 입꼬리가 어떻게 움직이나요?', options: [{ text: '옆으로 시원하게 벌어지며 올라간다', type: 'A' }, { text: '위로 둥글게 말려 올라간다', type: 'B' }] },
            { q: '미소 지을 때 치아가 어느 정도 보이나요?', options: [{ text: '윗니가 거의 다 보일 정도로 활짝 웃는다', type: 'A' }, { text: '치아를 살짝만 보이거나 가리고 웃는다', type: 'B' }] },
            { q: '웃을 때 눈 모양의 변화는?', options: [{ text: '눈이 반달 모양이 되며 활짝 휘어진다', type: 'A' }, { text: '눈꼬리에 주름이 살짝 지며 깊어진다', type: 'B' }] },
            { q: '주변에서 당신의 웃는 모습에 대해 뭐라고 하나요?', options: [{ text: '보는 사람까지 시원해지는 웃음이다', type: 'A' }, { text: '수줍고 참 예쁘게 웃는다', type: 'B' }] },
            { q: '사진을 찍을 때 주로 어떤 미소를 짓나요?', options: [{ text: '당당하게 활짝 웃는 표정', type: 'A' }, { text: '입을 다물고 살짝 짓는 미소', type: 'B' }] },
            { q: '당신은 보조개가 있나요?', options: [{ text: '없거나 희미한 편이다', type: 'A' }, { text: '선명하게 있거나 매력 포인트로 자리 잡고 있다', type: 'B' }] },
            { q: '웃을 때 광대의 움직임은 어떤가요?', options: [{ text: '광대가 시원하게 올라가며 입체감이 생긴다', type: 'A' }, { text: '광대보다는 입 주변 근육이 주로 움직인다', type: 'B' }] }
        ],
        results: {
            A: { title: '시원한 사이다 미소', desc: '당신은 보고만 있어도 기분이 좋아지는 청량한 미소를 가졌습니다. 자신감 넘치는 웃음이 당신의 비주얼을 완성합니다.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=60' },
            B: { title: '은은한 멜로 미소', desc: '당신은 마음을 설레게 하는 깊고 부드러운 미소를 가졌습니다. 눈빛과 입매가 조화를 이루어 묘한 분위기를 자아냅니다.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'v5', category: '얼굴', title: '어울리는 안경 스타일', desc: '당신의 얼굴형과 이목구비를 분석하여 최고의 인상을 만들어줄 안경을 추천합니다.', thumb: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
        questions: [
            { q: '당신의 얼굴에서 가장 넓은 부분은?', options: [{ text: '이마 부분이 넓은 편이다', type: 'A' }, { text: '광대나 하관 부분이 넓은 편이다', type: 'B' }] },
            { q: '턱선이 각진 편인가요, 둥근 편인가요?', options: [{ text: '브이라인 또는 각진 날렵한 턱선', type: 'A' }, { text: '부드러운 곡선의 둥근 턱선', type: 'B' }] },
            { q: '눈썹과 눈 사이의 거리는?', options: [{ text: '거리가 조금 있는 여유로운 느낌', type: 'A' }, { text: '거리가 가깝고 또렷한 느낌', type: 'B' }] },
            { q: '평소 입는 스타일은 어느 쪽에 가깝나요?', options: [{ text: '포멀하고 댄디한 스타일', type: 'A' }, { text: '캐주얼하고 힙한 스타일', type: 'B' }] },
            { q: '안경을 썼을 때 당신이 원하는 이미지는?', options: [{ text: '지적이고 전문적인 이미지', type: 'A' }, { text: '패셔너블하고 트렌디한 이미지', type: 'B' }] },
            { q: '코의 너비는 어느 정도인가요?', options: [{ text: '폭이 좁고 콧날이 얇은 편', type: 'A' }, { text: '폭이 어느 정도 있고 안정감 있는 편', type: 'B' }] },
            { q: '본인의 피부 톤에 더 어울리는 금속은?', options: [{ text: '세련된 실버 또는 티타늄', type: 'A' }, { text: '고급스러운 골드 또는 로즈골드', type: 'B' }] }
        ],
        results: {
            A: { title: '세련된 보스턴 프레임', desc: '당신은 상단이 평평하고 하단이 둥근 보스턴 테가 가장 잘 어울립니다. 부드러움과 지적인 이미지를 동시에 챙길 수 있습니다.', img: 'https://images.unsplash.com/photo-1513673048123-08505aa67997?auto=format&fit=crop&w=500&q=60' },
            B: { title: '클래식 웰링턴 프레임', desc: '당신은 사각형 모양의 웰링턴 테가 비주얼의 균형을 완벽하게 잡아줍니다. 안정감 있고 신뢰도 높은 이미지를 연출해 보세요.', img: 'https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'v6', category: '얼굴', title: '얼굴형 맞춤 헤어 추천', desc: '당신의 두상과 비율을 분석하여 인생 헤어스타일을 찾아드립니다.', thumb: 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '전체적인 얼굴의 길이는 어떤 편인가요?', options: [{ text: '가로보다 세로가 긴 편이다', type: 'A' }, { text: '가로와 세로 비율이 비슷한 편이다', type: 'B' }] },
            { q: '이마의 넓이는 어느 정도인가요?', options: [{ text: '이마가 시원하게 트인 편이다', type: 'A' }, { text: '이마가 좁고 아담한 편이다', type: 'B' }] },
            { q: '머리카락의 굵기와 힘은 어떤가요?', options: [{ text: '굵고 빳빳한 힘이 있는 모발', type: 'A' }, { text: '가늘고 부드러운 힘이 없는 모발', type: 'B' }] },
            { q: '옆머리의 볼륨감이 필요한 편인가요?', options: [{ text: '옆머리가 붙어야 얼굴이 작아 보인다', type: 'A' }, { text: '옆머리에 볼륨이 있어야 얼굴형이 보완된다', type: 'B' }] },
            { q: '본인이 선호하는 이미지는?', options: [{ text: '깔끔하고 정돈된 정석 미인/미남', type: 'A' }, { text: '자연스럽고 부드러운 분위기 미인/미남', type: 'B' }] },
            { q: '구관의 돌출 정도는 어떤가요?', options: [{ text: '입체감이 뚜렷한 편이다', type: 'A' }, { text: '평면적이고 차분한 편이다', type: 'B' }] },
            { q: '아침에 헤어 관리에 들이는 시간은?', options: [{ text: '드라이와 왁스로 꼼꼼하게 관리한다', type: 'A' }, { text: '툭툭 털고 나가도 되는 편한 게 좋다', type: 'B' }] }
        ],
        results: {
            A: { title: '세련된 포마드 & 스트레이트', desc: '당신은 얼굴형을 과감히 드러내는 깔끔한 스타일이 최고입니다. 뚜렷한 이목구비를 강조하여 전문성을 돋보이게 하세요.', img: 'https://images.pexels.com/photos/1805461/pexels-photo-1805461.jpeg?auto=compress&cs=tinysrgb&w=800' },
            B: { title: '내추럴 리프컷 & 웨이브', desc: '당신은 부드러운 곡선이 들어간 헤어스타일이 얼굴형을 완벽하게 보완해줍니다. 자연스러운 볼륨감이 당신의 매력을 배가시킵니다.', img: 'https://images.pexels.com/photos/3356170/pexels-photo-3356170.jpeg?auto=compress&cs=tinysrgb&w=800' }
        }
    },
    {
        id: 'v7', category: '얼굴', title: '베스트 메이크업 톤', desc: '당신의 피부 온도와 이목구비 채도를 분석하여 가장 빛나는 컬러를 찾습니다.', thumb: 'https://images.pexels.com/photos/3373739/pexels-photo-3373739.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '평소 햇볕에 탔을 때 당신의 피부는?', options: [{ text: '붉게 달아오르다가 금방 원래대로 돌아온다', type: 'A' }, { text: '검게 그을리고 오랫동안 유지된다', type: 'B' }] },
            { q: '손목 안쪽의 혈관 색깔은 어떤가요?', options: [{ text: '푸른색이나 보라색에 가깝다', type: 'A' }, { text: '초록색이나 올리브색에 가깝다', type: 'B' }] },
            { q: '어떤 색상의 옷을 입었을 때 얼굴이 환해 보이나요?', options: [{ text: '화이트, 네이비, 핑크 계열', type: 'A' }, { text: '아이보리, 베이지, 오렌지 계열', type: 'B' }] },
            { q: '당신의 눈동자 색깔은 어떤 톤인가요?', options: [{ text: '검은색이나 붉은 기 도는 갈색', type: 'A' }, { text: '노란 기 도는 밝은 갈색', type: 'B' }] },
            { q: '립 제품을 선택할 때 선호하는 색상은?', options: [{ text: '푸른 기 도는 레드나 로즈 핑크', type: 'A' }, { text: '따뜻한 느낌의 코랄이나 오렌지 레드', type: 'B' }] },
            { q: '골드 주얼리와 실버 주얼리 중 당신의 선택은?', options: [{ text: '깨끗해 보이는 실버', type: 'A' }, { text: '고급스러워 보이는 골드', type: 'B' }] },
            { q: '주변에서 당신의 피부 톤에 대해 뭐라고 하나요?', options: [{ text: '투명하고 창백해 보이는 편이다', type: 'A' }, { text: '건강하고 따뜻해 보이는 편이다', type: 'B' }] }
        ],
        results: {
            A: { title: '청량한 쿨톤의 정석', desc: '당신은 맑고 깨끗한 쿨 계열의 컬러가 가장 잘 어울립니다. 실버 액세서리와 쿨한 립 컬러로 본연의 미모를 밝혀보세요.', img: 'https://images.pexels.com/photos/247322/pexels-photo-247322.jpeg?auto=compress&cs=tinysrgb&w=800' },
            B: { title: '따스한 웜톤의 정석', desc: '당신은 포근하고 생기 넘치는 웜 계열의 컬러가 베스트입니다. 골드 주얼리와 따뜻한 베이지 톤이 당신을 더욱 돋보이게 합니다.', img: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=800' }
        }
    },
    {
        id: 'v8', category: '얼굴', title: '분위기 있는 패션 매칭', desc: '당신의 마스크와 체형 비율이 선호하는 최고의 패션 무드를 분석합니다.', thumb: 'https://images.pexels.com/photos/1884581/pexels-photo-1884581.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '당신의 어깨 라인은 어떤 편인가요?', options: [{ text: '직각에 가깝고 뚜렷한 편이다', type: 'A' }, { text: '곡선이 있고 부드러운 편이다', type: 'B' }] },
            { q: '얼굴에서 풍기는 전체적인 온도는?', options: [{ text: '이성적이고 차가운 느낌', type: 'A' }, { text: '감성적이고 따뜻한 느낌', type: 'B' }] },
            { q: '선호하는 옷의 소재는?', options: [{ text: '탄탄하고 힘 있는 가죽이나 데님', type: 'A' }, { text: '부드럽고 하늘거리는 실크나 니트', type: 'B' }] },
            { q: '신발을 선택할 때 더 중요한 가치는?', options: [{ text: '디자인과 날렵한 쉐입', type: 'A' }, { text: '착용감과 안정적인 쉐입', type: 'B' }] },
            { q: '당신의 체형에서 가장 큰 특징은?', options: [{ text: '팔다리가 길고 선이 굵다', type: 'A' }, { text: '전체적인 밸런스가 조화롭고 부드럽다', type: 'B' }] },
            { q: '주변에서 추천하는 당신의 스타일은?', options: [{ text: '화려한 명품이나 화려한 패턴', type: 'A' }, { text: '깔끔한 미니멀리즘 스타일', type: 'B' }] },
            { q: '당신이 가장 좋아하는 계절의 옷은?', options: [{ text: '코트와 수트의 계절, 겨울', type: 'A' }, { text: '가볍고 화사한 린넨의 계절, 여름', type: 'B' }] }
        ],
        results: {
            A: { title: '어반 아방가르드', desc: '당신은 독창적이고 세련된 스타일을 소화할 수 있는 강력한 마스크를 가졌습니다. 과감한 핏으로 독보적인 분위기를 연출하세요.', img: 'https://images.pexels.com/photos/1126993/pexels-photo-1126993.jpeg?auto=crop&w=500&q=60' },
            B: { title: '소프트 모더니즘', desc: '당신은 절제된 아름다움이 가장 잘 어울리는 비주얼입니다. 기본에 충실한 고급스러운 소재감이 당신의 품격을 높여줍니다.', img: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=crop&w=500&q=60' }
        }
    },
    {
        id: 'v9', category: '얼굴', title: '피부 생기 온도 체크', desc: '당신의 피부 톤과 결을 통해 현재의 컨디션과 어울리는 관리법을 제안합니다.', thumb: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '세안 직후 당신의 피부 상태는?', options: [{ text: '당김이 심하고 푸석한 느낌', type: 'A' }, { text: '금방 유분기가 올라오는 느낌', type: 'B' }] },
            { q: '피부 결에서 가장 고민되는 부분은?', options: [{ text: '각질과 거친 피부 결', type: 'A' }, { text: '넓은 모공과 블랙헤드', type: 'B' }] },
            { q: '스트레스를 받으면 피부에 어떤 변화가 생기나요?', options: [{ text: '안색이 어두워지고 칙칙해진다', type: 'A' }, { text: '트러블이 생기거나 붉어진다', type: 'B' }] },
            { q: '평소 물 섭취량은 어느 정도인가요?', options: [{ text: '하루 1리터 미만으로 적게 마신다', type: 'A' }, { text: '수시로 충분히 마시는 편이다', type: 'B' }] },
            { q: '잠을 못 잤을 때 가장 먼저 나타나는 현상은?', options: [{ text: '눈가가 휑하고 다크서클이 심해진다', type: 'A' }, { text: '피부가 푸석푸석하고 화장이 잘 안 받는다', type: 'B' }] },
            { q: '선호하는 스킨케어 제형은?', options: [{ text: '영양감이 풍부한 크림 타입', type: 'A' }, { text: '산뜻하고 가벼운 젤 타입', type: 'B' }] },
            { q: '당신의 피부는 예민한 편인가요?', options: [{ text: '외부 자극에 쉽게 붉어지는 예민한 피부', type: 'A' }, { text: '웬만해서는 크게 반응하지 않는 튼튼한 피부', type: 'B' }] }
        ],
        results: {
            A: { title: '고보습 물광 스킨', desc: '당신의 피부는 수분과 영양을 갈구하고 있습니다. 충분한 보습 관리만으로도 당신의 비주얼은 2배 이상 빛날 수 있습니다.', img: 'https://images.unsplash.com/photo-1570172619394-2125115decd4?auto=format&fit=crop&w=500&q=60' },
            B: { title: '깨끗한 도자기 스킨', desc: '당신은 기초가 탄탄하고 건강한 피부 결을 가졌습니다. 유수분 밸런스만 잘 유지한다면 투명한 비주얼을 계속 유지할 수 있습니다.', img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'v10', category: '얼굴', title: '토탈 비주얼 밸런스', desc: '얼굴의 조화로움과 대칭성을 통해 당신만의 황금 비율 포인트를 분석합니다.', thumb: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '눈, 코, 입 중 가장 강조하고 싶은 부위는?', options: [{ text: '시선을 끄는 또렷한 눈', type: 'A' }, { text: '균형 잡힌 코와 입매', type: 'B' }] },
            { q: '얼굴의 상, 중, 하 비율 중 어디가 가장 긴가요?', options: [{ text: '이마에서 눈썹까지(상안부)', type: 'A' }, { text: '눈썹에서 코끝까지(중안부)', type: 'B' }] },
            { q: '본인의 인상에서 가장 마음에 드는 키워드는?', options: [{ text: '카리스마 있고 확실한 개성', type: 'A' }, { text: '부드럽고 조화로운 안정감', type: 'B' }] },
            { q: '어떤 조명 아래에서 본인이 더 예뻐/멋져 보이나요?', options: [{ text: '그림자가 지는 강렬한 포인트 조명', type: 'A' }, { text: '전체적으로 화사한 자연광', type: 'B' }] },
            { q: '사진 보정을 할 때 주로 손대는 곳은?', options: [{ text: '눈 크기나 선명도', type: 'A' }, { text: '얼굴 라인과 비율', type: 'B' }] },
            { q: '당신의 귀 모양은 어떤가요?', options: [{ text: '귀가 크고 위로 솟은 스타일', type: 'A' }, { text: '귀가 작고 옆으로 붙은 스타일', type: 'B' }] },
            { q: '비주얼적으로 가장 닮고 싶은 롤모델은?', options: [{ text: '이목구비가 뚜렷한 서구적 미인/미남', type: 'A' }, { text: '선이 고운 동양적 미인/미남', type: 'B' }] }
        ],
        results: {
            A: { title: '강렬한 아방가르드 밸런스', desc: '당신은 개성 있는 부위들이 조화를 이루어 독보적인 인상을 형성합니다. 전형적인 틀을 벗어난 당신만의 매력을 믿으세요.', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=60' },
            B: { title: '완벽한 클래식 하모니', desc: '당신은 어느 한 곳 튀지 않으면서도 전체적인 비율이 매우 안정적인 황금 비율의 소유자입니다. 조화로움이 당신의 가장 큰 힘입니다.', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'f1', category: '사주', title: '오늘의 영적 타로 운세', desc: '당신의 무의식이 이끄는 카드를 통해 오늘 하루의 흐름과 필요한 조언을 드립니다.', thumb: 'https://images.pexels.com/photos/7534232/pexels-photo-7534232.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '지금 눈앞에 네 장의 카드가 있습니다. 가장 끌리는 것은?', options: [{ text: '화려한 태양이 그려진 카드', type: 'A' }, { text: '신비로운 달이 그려진 카드', type: 'B' }] },
            { q: '오늘 아침 눈을 떴을 때 가장 먼저 드는 생각은?', options: [{ text: '오늘은 뭔가 좋은 일이 생길 것 같아', type: 'A' }, { text: '조금 피곤하지만 차분하게 시작해보자', type: 'B' }] },
            { q: '길을 걷다 우연히 마주친 숫자가 있다면?', options: [{ text: '행운의 상징 7', type: 'A' }, { text: '완전함의 상징 10', type: 'B' }] },
            { q: '갑작스러운 비가 쏟아진다면?', options: [{ text: '시원하게 내리는 빗줄기를 즐긴다', type: 'A' }, { text: '젖지 않게 처마 밑에서 잠시 기다린다', type: 'B' }] },
            { q: '오늘 점심으로 더 끌리는 메뉴는?', options: [{ text: '활력을 주는 매콤하거나 든든한 음식', type: 'A' }, { text: '속을 편안하게 해주는 부드러운 음식', type: 'B' }] },
            { q: '친구가 갑자기 만나자고 연락이 온다면?', options: [{ text: '당연히 OK! 바로 나간다', type: 'A' }, { text: '오늘은 나만의 시간을 갖고 싶어 거절한다', type: 'B' }] },
            { q: '오늘 하루를 마무리하며 듣고 싶은 음악은?', options: [{ text: '심장이 뛰는 신나는 비트의 음악', type: 'A' }, { text: '마음을 울리는 잔잔한 피아노 선율', type: 'B' }] }
        ],
        results: {
            A: { title: '태양의 카드 (The Sun)', desc: '오늘은 당신에게 긍정적인 에너지가 가득한 날입니다. 망설였던 일이 있다면 과감하게 도전해보세요. 당신의 밝은 기운이 주변 사람들에게도 행운을 가져다줄 것입니다. 금전운과 대인관계운이 모두 최상입니다.', img: 'https://images.pexels.com/photos/2832432/pexels-photo-2832432.jpeg?auto=compress&cs=tinysrgb&w=800' },
            B: { title: '여사제 카드 (The High Priestess)', desc: '오늘은 직관력이 빛나는 날입니다. 활동적으로 움직이기보다는 내면의 소리에 귀를 기울여보세요. 복잡했던 고민들이 의외로 쉽게 풀릴 수 있습니다. 조용히 사색하거나 공부하기에 아주 좋은 하루입니다.', img: 'https://images.pexels.com/photos/311039/pexels-photo-311039.jpeg?auto=compress&cs=tinysrgb&w=800' }
        }
    },
    {
        id: 'f2', category: '사주', title: '타고난 재물운 그릇', desc: '당신이 태어날 때부터 가지고 있는 재물의 크기와 돈을 모으는 방식을 분석합니다.', thumb: 'https://images.pexels.com/photos/4386442/pexels-photo-4386442.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '지갑 속에 현금이 얼마나 있어야 안심이 되나요?', options: [{ text: '비상금으로 5만원 이상은 있어야 한다', type: 'A' }, { text: '카드만 있으면 되니 현금은 없어도 된다', type: 'B' }] },
            { q: '길에서 100원을 주웠다면?', options: [{ text: '소소한 행운이라 생각하며 저금통에 넣는다', type: 'A' }, { text: '100원으로 뭘 해, 그냥 주머니에 둔다', type: 'B' }] },
            { q: '친구들과의 모임 회비가 남았다면?', options: [{ text: '다음 모임을 위해 이월해서 적립한다', type: 'A' }, { text: '깔끔하게 1/N로 나눠서 돌려받는다', type: 'B' }] },
            { q: '은행 예금 금리가 0.1% 올랐다는 소식을 들으면?', options: [{ text: '당장 더 좋은 조건의 상품으로 갈아탄다', type: 'A' }, { text: '큰 차이 없으니 귀찮아서 그냥 둔다', type: 'B' }] },
            { q: '쇼핑할 때 포인트를 적립하시나요?', options: [{ text: '앱까지 켜서 꼼꼼하게 다 챙긴다', type: 'A' }, { text: '계산 과정이 길어지는 게 싫어서 패스한다', type: 'B' }] },
            { q: '큰돈을 벌고 싶은 가장 큰 이유는?', options: [{ text: '안정적인 미래와 노후를 대비하기 위해', type: 'A' }, { text: '사고 싶은 것을 마음껏 사고 즐기기 위해', type: 'B' }] },
            { q: '투자(주식/코인)에 대한 당신의 생각은?', options: [{ text: '원금 손실은 절대 안 된다. 안전이 최고!', type: 'A' }, { text: '하이 리스크 하이 리턴! 과감하게 투자한다', type: 'B' }] }
        ],
        results: {
            A: { title: '티끌 모아 태산형', desc: '당신은 성실함과 꼼꼼함으로 부를 축적하는 타입입니다. 낭비를 싫어하고 체계적으로 관리하기 때문에, 시간이 지날수록 재산이 눈덩이처럼 불어날 것입니다. 대기만성형 부자가 될 운명입니다.', img: 'https://images.pexels.com/photos/1447418/pexels-photo-1447418.jpeg?auto=compress&cs=tinysrgb&w=800' },
            B: { title: '일확천금 사업가형', desc: '당신은 돈의 흐름을 읽는 감각이 뛰어나고 배포가 큽니다. 작은 돈에 연연하기보다는 큰 그림을 그려 부를 창출합니다. 사업이나 투자를 통해 한 번에 큰 부를 얻을 수 있는 잠재력을 가졌습니다.', img: 'https://images.pexels.com/photos/6770610/pexels-photo-6770610.jpeg?auto=compress&cs=tinysrgb&w=800' }
        }
    },
    {
        id: 'f3', category: '사주', title: '나의 평생 인복 총량', desc: '살아가면서 당신을 도와줄 귀인이 얼마나 있는지, 사람 복을 타고났는지 알아봅니다.', thumb: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '힘든 일이 생겼을 때 바로 떠오르는 친구 수는?', options: [{ text: '3명 이상, 언제든 달려와 줄 친구들이 있다', type: 'A' }, { text: '1~2명, 정말 깊게 신뢰하는 소수 정예다', type: 'B' }] },
            { q: '새로운 모임에 나갔을 때 당신은?', options: [{ text: '사람들이 내 주위로 모여들어 금방 친해진다', type: 'A' }, { text: '구석에서 상황을 지켜보다 천천히 다가간다', type: 'B' }] },
            { q: '타인에게 베푸는 것에 대해 어떻게 생각하나요?', options: [{ text: '베풀면 언젠가 다 돌아온다고 믿는다', type: 'A' }, { text: '기대하지 않고 내가 좋아서 베푸는 것이다', type: 'B' }] },
            { q: '선배나 상사에게 예쁨을 받는 편인가요?', options: [{ text: '어딜 가나 윗사람들이 챙겨주는 편이다', type: 'A' }, { text: '묵묵히 할 일을 다해 인정을 받는 편이다', type: 'B' }] },
            { q: '곤란한 상황에서 도움을 받은 경험은?', options: [{ text: '신기하게도 항상 누군가 나타나 도와줬다', type: 'A' }, { text: '대부분 내 힘으로 스스로 해결해왔다', type: 'B' }] },
            { q: '사람을 볼 때 가장 중요하게 보는 것은?', options: [{ text: '나와 잘 통하는 코드와 유머 감각', type: 'A' }, { text: '예의 바르고 배려심 깊은 인성', type: 'B' }] },
            { q: '내가 생각하는 나의 인복 점수는?', options: [{ text: '나는 정말 인복 하나는 타고난 것 같다', type: 'A' }, { text: '인복보다는 나의 노력이 더 컸던 것 같다', type: 'B' }] }
        ],
        results: {
            A: { title: '사람이 따르는 인복 대마왕', desc: '당신은 주변에는 항상 좋은 사람들이 넘쳐납니다. 당신의 밝은 에너지와 베푸는 마음이 귀인을 끌어당깁니다. 힘들 때마다 손을 내밀어 줄 조력자들이 평생 함께할 운명입니다.', img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=500&q=60' },
            B: { title: '스스로 개척하는 자수성가형', desc: '당신은 많은 사람보다는 진실된 소수의 관계를 소중히 여깁니다. 남에게 의지하기보다 스스로의 능력으로 길을 여는 강인함이 있습니다. 당신의 곁에 남은 사람들은 평생 가는 진짜 내 편입니다.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'f4', category: '사주', title: '행운을 부르는 컬러 & 아이템', desc: '당신의 부족한 기운을 채워주고 좋은 운을 불러오는 맞춤형 개운 아이템을 추천합니다.', thumb: 'https://images.pexels.com/photos/1457801/pexels-photo-1457801.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '평소 옷장에 가장 많은 옷 색깔은?', options: [{ text: '블랙, 그레이 등 무채색 계열', type: 'A' }, { text: '베이지, 파스텔 등 밝은 색 계열', type: 'B' }] },
            { q: '마음이 가장 편안해지는 장소는?', options: [{ text: '탁 트인 바다나 강가', type: 'A' }, { text: '나무가 울창한 숲이나 산', type: 'B' }] },
            { q: '최근 유난히 자주 잃어버리는 물건은?', options: [{ text: '우산이나 액세서리 같은 잡동사니', type: 'A' }, { text: '지갑이나 카드 같은 중요한 물건', type: 'B' }] },
            { q: '나의 성격 중 고치고 싶은 점은?', options: [{ text: '너무 감정적이고 욱하는 성격', type: 'A' }, { text: '너무 우유부단하고 소심한 성격', type: 'B' }] },
            { q: '좋아하는 계절은 언제인가요?', options: [{ text: '활동적인 여름이나 시원한 가을', type: 'A' }, { text: '따뜻한 봄이나 포근한 겨울', type: 'B' }] },
            { q: '집 안에 화분이나 식물이 있나요?', options: [{ text: '관리가 귀찮아서 없거나 조화만 있다', type: 'A' }, { text: '직접 키우는 반려 식물이 있다', type: 'B' }] },
            { q: '중요한 미팅이 있을 때 챙기는 것은?', options: [{ text: '자신감을 주는 향수나 립스틱', type: 'A' }, { text: '신뢰감을 주는 시계나 깔끔한 구두', type: 'B' }] }
        ],
        results: {
            A: { title: '열정의 레드 & 골드', desc: '당신에게는 불의 기운이 행운을 가져다줍니다. 붉은 계열의 소품이나 골드 액세서리를 착용해보세요. 적극적인 에너지가 당신의 매력을 높여주고 재물운을 상승시켜 줄 것입니다.', img: 'https://images.pexels.com/photos/3419692/pexels-photo-3419692.jpeg?auto=compress&cs=tinysrgb&w=800' },
            B: { title: '치유의 그린 & 우드', desc: '당신에게는 나무의 기운이 필요합니다. 초록색 아이템이나 원목 소재의 물건을 가까이하세요. 마음의 안정을 찾고 대인관계가 더욱 부드러워지는 효과를 볼 수 있습니다.', img: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=800' }
        }
    },
    {
        id: 'f5', category: '사주', title: '미래 배우자 미리보기', desc: '사주 관법으로 분석한 당신의 미래 배우자 특징과 결혼 생활을 미리 확인해보세요.', thumb: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '이상적인 배우자의 조건 1순위는?', options: [{ text: '나를 존중해주고 대화가 잘 통하는 사람', type: 'A' }, { text: '경제력이 있고 능력이 뛰어난 사람', type: 'B' }] },
            { q: '결혼 후 꿈꾸는 주말의 모습은?', options: [{ text: '함께 취미 생활을 즐기며 데이트하기', type: 'A' }, { text: '각자 편안하게 쉬면서 재충전하기', type: 'B' }] },
            { q: '배우자와 다퉜을 때 해결 방식은?', options: [{ text: '그 자리에서 대화로 풀고 화해한다', type: 'A' }, { text: '잠시 떨어져 감정을 식힌 뒤 대화한다', type: 'B' }] },
            { q: '자녀 계획에 대한 당신의 생각은?', options: [{ text: '아이를 좋아해서 꼭 낳고 싶다', type: 'A' }, { text: '딩크족도 좋고 상황에 따라 결정한다', type: 'B' }] },
            { q: '배우자가 회식으로 늦게 들어온다면?', options: [{ text: '걱정되니까 데리러 나가거나 기다린다', type: 'A' }, { text: '먼저 자고 내일 아침에 이야기한다', type: 'B' }] },
            { q: '요리와 집안일 분담은 어떻게?', options: [{ text: '자신 있는 사람이 더 많이 하거나 함께 한다', type: 'A' }, { text: '철저하게 당번을 정해서 공평하게 한다', type: 'B' }] },
            { q: '결혼 생활에서 가장 중요한 가치는?', options: [{ text: '변함없는 사랑과 정서적 유대감', type: 'A' }, { text: '서로의 성장을 돕는 파트너십', type: 'B' }] }
        ],
        results: {
            A: { title: '다정다감한 친구 같은 배우자', desc: '당신은 친구처럼 편안하고 대화가 잘 통하는 배우자를 만날 운명입니다. 소소한 일상을 공유하며 웃음이 끊이지 않는 행복한 결혼 생활을 하게 될 것입니다. 서로가 서로에게 가장 친한 베프가 되어줍니다.', img: 'https://images.unsplash.com/photo-1516589174184-c68d8e5fcc4a?auto=format&fit=crop&w=500&q=60' },
            B: { title: '능력 있는 든든한 멘토 배우자', desc: '당신은 배울 점이 많고 사회적으로 성공한 배우자를 만날 가능성이 높습니다. 당신을 리드해주고 안정적인 울타리가 되어줄 사람입니다. 서로의 꿈을 응원하며 함께 성장하는 멋진 부부가 될 것입니다.', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'z1', category: '재미', title: '전생 유형 테스트', desc: '당신은 전생에 어떤 삶을 살았을까요? 무의식에 남은 기억을 통해 전생의 직업을 유추합니다.', thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '역사 드라마를 볼 때 가장 몰입되는 역할은?', options: [{ text: '화려한 의상을 입은 왕족이나 귀족', type: 'A' }, { text: '전장을 누비는 장군이나 무사', type: 'B' }] },
            { q: '평소 좋아하는 장소의 분위기는?', options: [{ text: '사람들이 북적이고 활기찬 시장', type: 'A' }, { text: '조용하고 고즈넉한 서재나 숲', type: 'B' }] },
            { q: '손재주가 좋은 편인가요?', options: [{ text: '무언가 만드는 것을 좋아하고 잘한다', type: 'A' }, { text: '손재주보다는 머리 쓰는 일이 편하다', type: 'B' }] },
            { q: '억울한 일을 당했을 때 당신은?', options: [{ text: '즉시 항의하고 바로잡으려 한다', type: 'A' }, { text: '훗날을 도모하며 조용히 참는다', type: 'B' }] },
            { q: '해외여행을 간다면 가고 싶은 곳은?', options: [{ text: '유럽의 고성이나 유적지', type: 'A' }, { text: '휴양지의 아름다운 자연', type: 'B' }] },
            { q: '본능적으로 끌리는 무기는?', options: [{ text: '날카롭고 예리한 검', type: 'A' }, { text: '멀리서 적을 맞추는 활', type: 'B' }] },
            { q: '꿈속에서 자주 보는 장면이 있나요?', options: [{ text: '하늘을 날거나 높은 곳에 있는 꿈', type: 'A' }, { text: '무언가에 쫓기거나 숨는 꿈', type: 'B' }] }
        ],
        results: {
            A: { title: '화려한 삶을 즐긴 왕족/귀족', desc: '당신은 전생에 높은 신분으로 태어나 권력과 부를 누렸을 가능성이 큽니다. 현생에서도 고급스러운 취향과 리더십을 보여주며, 남들에게 주목받는 것을 즐기는 경향이 있습니다.', img: 'https://images.unsplash.com/photo-1590053305130-13a500c328bd?auto=format&fit=crop&w=500&q=60' },
            B: { title: '세상을 유랑한 자유로운 예술가', desc: '당신은 전생에 얽매이지 않고 세상을 떠돌며 예술을 하거나 도를 닦던 영혼이었습니다. 현생에서도 자유를 갈망하며, 독창적인 사고방식으로 주변 사람들에게 영감을 줍니다.', img: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=500&q=60' }
        }
    },
        {
            id: 'z2', category: '재미', title: '조선시대 나의 직업은?', desc: '타임머신을 타고 조선시대로 간다면 당신은 무엇을 하고 있을까요? 싱크로율 200% 직업 찾기!', thumb: 'https://images.pexels.com/photos/15288258/pexels-photo-15288258.jpeg?auto=compress&cs=tinysrgb&w=800',
            questions: [
                { q: '아침 기상 시간, 당신의 스타일은?', options: [{ text: '새벽같이 일어나 부지런히 움직인다', type: 'A' }, { text: '해 중천에 뜰 때까지 느긋하게 잔다', type: 'B' }] },
                { q: '공부나 책 읽기를 좋아하나요?', options: [{ text: '새로운 지식을 쌓는 게 즐겁다', type: 'A' }, { text: '책만 보면 졸음이 쏟아진다', type: 'B' }] },
                { q: '남의 말을 잘 들어주는 편인가요?', options: [{ text: '고민 상담을 자주 해주는 편이다', type: 'A' }, { text: '내 이야기하기 바빠서 잘 못 듣는다', type: 'B' }] },
                { q: '손으로 하는 활동 중 자신 있는 것은?', options: [{ text: '요리, 바느질, 만들기 등 금손이다', type: 'A' }, { text: '글쓰기, 그림 그리기 등 예술 활동', type: 'B' }] },
                { q: '사람 많은 장터에 갔을 때 당신은?', options: [{ text: '물건값을 흥정하며 싸게 산다', type: 'A' }, { text: '사람 구경하고 맛있는 거 사 먹는다', type: 'B' }] },
                { q: '누군가와 시비가 붙었을 때?', options: [{ text: '논리정연하게 말로 제압한다', type: 'A' }, { text: '목소리 크기로 기선 제압한다', type: 'B' }] },
                { q: '가장 중요하게 생각하는 것은?', options: [{ text: '명예와 체면', type: 'A' }, { text: '실속과 재물', type: 'B' }] }
            ],
            results: {
                A: { title: '나랏일을 걱정하는 선비', desc: '당신은 학식과 인품을 겸비한 선비 스타일입니다. 명분을 중시하고 올곧은 성품을 지녔으며, 조직 내에서 브레인 역할을 담당하기에 딱 맞습니다.', img: 'https://images.pexels.com/photos/4565130/pexels-photo-4565130.jpeg?auto=compress&cs=tinysrgb&w=800' },
                B: { title: '돈을 긁어모으는 거상', desc: '당신은 뛰어난 수완과 눈치로 조선 팔도의 돈을 쓸어 담을 거상 스타일입니다. 현실 감각이 뛰어나고 협상 능력이 탁월하여 어디서든 잘 먹고 잘 살 타입입니다.', img: 'https://images.pexels.com/photos/5796219/pexels-photo-5796219.jpeg?auto=compress&cs=tinysrgb&w=800' }
            }
        },
    {
        id: 'z3', category: '재미', title: '무인도 생존 유형', desc: '비행기 추락으로 무인도에 떨어진 당신! 극한 상황에서 드러나는 당신의 생존 본능은?', thumb: 'https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '눈을 떠보니 낯선 해변가다. 가장 먼저 할 일은?', options: [{ text: '주변을 탐색하며 물과 식량을 찾는다', type: 'A' }, { text: '크게 소리 치며 구조 요청을 보낸다', type: 'B' }] },
            { q: '수풀 속에서 부스럭 소리가 난다!', options: [{ text: '무기가 될 만한 돌을 집어 든다', type: 'A' }, { text: '일단 나무 뒤로 숨어 동태를 살핀다', type: 'B' }] },
            { q: '배가 너무 고프다. 눈앞에 알 수 없는 열매가 있다면?', options: [{ text: '독이 있을지 모르니 조금만 맛본다', type: 'A' }, { text: '배고파 죽겠는데 일단 먹고 본다', type: 'B' }] },
            { q: '밤이 되어 추워지기 시작했다. 불은 어떻게?', options: [{ text: '나무를 비벼서 마찰열로 피운다', type: 'A' }, { text: '안경이나 유리를 이용해 빛을 모은다', type: 'B' }] },
            { q: '함께 표류한 동료가 다쳤다면?', options: [{ text: '알고 있는 지식으로 응급처치를 한다', type: 'A' }, { text: '당황해서 어쩔 줄 몰라 하며 위로한다', type: 'B' }] },
            { q: '저 멀리 배가 지나가는 것 같다!', options: [{ text: '불을 피워 연기로 신호를 보낸다', type: 'A' }, { text: '바다로 뛰어들어 헤엄치며 소리친다', type: 'B' }] },
            { q: '무인도 생활 3일 차, 당신의 심정은?', options: [{ text: '이곳의 생활에 점점 적응해간다', type: 'A' }, { text: '집에 가고 싶어서 매일 밤 운다', type: 'B' }] }
        ],
        results: {
            A: { title: '베어 그릴스 뺨치는 생존왕', desc: '당신은 어떤 극한 상황에서도 살아남을 수 있는 강인한 정신력과 적응력을 가졌습니다. 리더십을 발휘하여 무인도를 지상 낙원으로 만들지도 모릅니다.', img: 'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=800' },
            B: { title: '운이 따라주는 기적의 생존자', desc: '당신은 생존 지식은 부족할지 몰라도, 타고난 운과 긍정적인 마인드로 위기를 넘깁니다. 주변의 도움을 잘 이끌어내며 결국 구조될 운명입니다.', img: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=800' }
        }
    },
    {
        id: 'z4', category: '재미', title: '탕수육 소스 취향 분석', desc: '부먹 vs 찍먹? 사소한 취향 속에 숨겨진 당신의 성격과 대인관계 스타일을 알아봅니다.', thumb: 'https://images.pexels.com/photos/2347311/pexels-photo-2347311.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '탕수육이 나왔다! 소스는 어떻게?', options: [{ text: '바삭함을 위해 소스를 찍어 먹는다 (찍먹)', type: 'A' }, { text: '촉촉함을 위해 소스를 부어 먹는다 (부먹)', type: 'B' }] },
            { q: '친구가 말도 없이 소스를 부어버렸다면?', options: [{ text: '이미 부은 거 어쩔 수 없지, 그냥 먹는다', type: 'A' }, { text: '"아 왜 부어!" 하며 진심으로 화를 낸다', type: 'B' }] },
            { q: '평소 식사 메뉴 결정권은 누구에게?', options: [{ text: '내가 먹고 싶은 걸로 강력 추천한다', type: 'A' }, { text: '상대방이 먹고 싶은 걸로 따라간다', type: 'B' }] },
            { q: '뷔페에 가서 음식을 담는 스타일은?', options: [{ text: '조금씩 다양하게 여러 번 담아온다', type: 'A' }, { text: '좋아하는 것 위주로 한 접시 가득 담는다', type: 'B' }] },
            { q: '새로운 맛집을 발견했을 때?', options: [{ text: '검증된 베스트 메뉴를 시킨다', type: 'A' }, { text: '독특하고 새로운 메뉴에 도전한다', type: 'B' }] },
            { q: '혼밥(혼자 밥 먹기) 레벨은?', options: [{ text: '혼자서도 고깃집, 패밀리 레스토랑 가능', type: 'A' }, { text: '편의점이나 패스트푸드점 정도만 가능', type: 'B' }] },
            { q: '음식 먹을 때 가장 참을 수 없는 것은?', options: [{ text: '식감이 눅눅해지거나 맛이 섞이는 것', type: 'A' }, { text: '음식이 너무 뜨겁거나 식어서 맛없는 것', type: 'B' }] }
        ],
        results: {
            A: { title: '확고한 취향의 원칙주의자', desc: '당신은 (찍먹파에 가깝군요!) 호불호가 분명하고 자신의 영역을 중요하게 생각합니다. 깔끔하고 효율적인 것을 선호하며, 남에게 피해를 주지도 받지도 않으려는 합리적인 성격입니다.', img: 'https://images.pexels.com/photos/2673353/pexels-photo-2673353.jpeg?auto=compress&cs=tinysrgb&w=800' },
            B: { title: '둥글둥글한 융통성 대마왕', desc: '당신은 (부먹파에 가깝군요!) 상황에 따라 유연하게 대처하는 평화주의자입니다. 사람들과 어울리는 것을 좋아하고, 웬만하면 상대방에게 맞춰주는 배려심 깊은 성격입니다.', img: 'https://images.pexels.com/photos/1234535/pexels-photo-1234535.jpeg?auto=compress&cs=tinysrgb&w=800' }
        }
    },
    {
        id: 'z5', category: '재미', title: '나의 소울 칵테일 찾기', desc: '당신의 분위기와 현재 감정 상태에 딱 어울리는 칵테일 한 잔을 추천해 드립니다.', thumb: 'https://images.pexels.com/photos/1189257/pexels-photo-1189257.jpeg?auto=compress&cs=tinysrgb&w=800',
        questions: [
            { q: '오늘 밤, 당신이 원하는 분위기는?', options: [{ text: '시끌벅적하고 화려한 파티 분위기', type: 'A' }, { text: '조명 은은한 재즈바의 차분한 분위기', type: 'B' }] },
            { q: '술을 마실 때 선호하는 맛은?', options: [{ text: '입안이 상큼해지는 달콤 상큼한 맛', type: 'A' }, { text: '묵직하고 쌉싸름한 어른의 맛', type: 'B' }] },
            { q: '칵테일의 비주얼, 더 중요한 것은?', options: [{ text: '알록달록 예쁜 색감과 화려한 장식', type: 'A' }, { text: '심플하고 투명한 잔에 담긴 깔끔함', type: 'B' }] },
            { q: '취기에 대한 당신의 태도는?', options: [{ text: '적당히 기분 좋을 정도로만 마신다', type: 'A' }, { text: '이왕 마시는 거 끝까지 가본다', type: 'B' }] },
            { q: '안주는 어떤 것이 좋은가요?', options: [{ text: '과일이나 치즈 같은 가벼운 핑거푸드', type: 'A' }, { text: '스테이크나 감바스 같은 든든한 요리', type: 'B' }] },
            { q: '평소 스트레스를 푸는 방식은?', options: [{ text: '수다를 떨거나 노래방에서 소리 지르기', type: 'A' }, { text: '혼자 영화를 보거나 멍하니 있기', type: 'B' }] },
            { q: '내일 지구가 멸망한다면 마지막 한 잔은?', options: [{ text: '사랑하는 사람과 건배하며 마시는 샴페인', type: 'A' }, { text: '가장 비싸고 독한 위스키 스트레이트', type: 'B' }] }
        ],
        results: {
            A: { title: '상큼한 피치 크러쉬 (Peach Crush)', desc: '당신은 톡톡 튀는 매력과 사랑스러움을 지닌 사람입니다. 달콤하고 상큼한 피치 크러쉬처럼 주변 사람들에게 기분 좋은 에너지를 전파합니다. 오늘은 핑크빛 칵테일로 기분을 업 시켜보세요!', img: 'https://images.pexels.com/photos/2480828/pexels-photo-2480828.jpeg?auto=compress&cs=tinysrgb&w=800' },
            B: { title: '고독한 마티니 (Martini)', desc: '당신은 깊이 있고 지적인 분위기를 풍기는 사람입니다. 칵테일의 왕이라 불리는 마티니처럼, 겉은 차가워 보이지만 속은 뜨거운 열정을 품고 있습니다.  깔끔하고 드라이한 한 잔이 당신과 잘 어울립니다.', img: 'https://images.pexels.com/photos/613037/pexels-photo-613037.jpeg?auto=compress&cs=tinysrgb&w=800' }
        }
    }
];
