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
        id: 'p3', category: '성격', title: '연애 가치관 리포트', desc: '사랑에 대한 당신의 무의식적 태도와 선호하는 연애 스타일을 분석합니다.', thumb: 'https://images.unsplash.com/photo-1518199266791-bd373292e90c?auto=format&fit=crop&w=800&q=80',
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
            energy: { title: '직진하는 불꽃 사랑', desc: '사랑에 있어 매우 솔직하고 열정적이며 연인에게 확신을 줍니다.', img: 'https://images.unsplash.com/photo-1511733849282-589d29dad210?auto=format&fit=crop&w=800&q=80', color: '#ef4444', tags: ['#열정', '#직진', '#사랑꾼'] },
            logic: { title: '신중한 신뢰의 건축가', desc: '감정보다 신뢰와 안정을 중요하게 여기며 탄탄한 관계를 쌓아갑니다.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80', color: '#3b82f6', tags: ['#신뢰', '#안정', '#현명함'] },
            empathy: { title: '은은하게 스며드는 사랑', desc: '한결같은 모습과 세심한 배려로 연인의 마음을 따뜻하게 녹입니다.', img: 'https://images.unsplash.com/photo-1516589174184-c68d8e5fcc4a?auto=format&fit=crop&w=800&q=80', color: '#10b981', tags: ['#배려', '#다정함', '#해바라기'] },
            creativity: { title: '영감을 주는 소울메이트', desc: '독특한 데이트와 깊은 대화로 연인과 특별한 세계를 공유합니다.', img: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=80', color: '#8b5cf6', tags: ['#특별함', '#소울메이트', '#감성'] }
        }
    },
    {
        id: 'p4', category: '성격', title: '스트레스 방어기제 테스트', desc: '힘든 상황에서 당신의 마음이 어떻게 스스로를 보호하는지 분석합니다.', thumb: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=800&q=80',
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
            energy: { title: '강인한 철벽 방어형', desc: '스트레스 상황에서 정면 돌파하려는 강한 의지를 가졌습니다.', img: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80', color: '#475569', tags: ['#강철멘탈', '#정면돌파', '#단호함'] },
            logic: { title: '침착한 전략적 분석가', desc: '문제를 논리적으로 해체하여 감정에 휘둘리지 않고 해결합니다.', img: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=800&q=80', color: '#334155', tags: ['#분석가', '#이성적', '#차분함'] },
            empathy: { title: '유연한 감성 수용자', desc: '감정을 있는 그대로 받아들이고 스스로를 치유하는 능력이 뛰어납니다.', img: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80', color: '#94a3b8', tags: ['#회복탄력성', '#수용', '#힐러'] },
            creativity: { title: '창의적 승화의 대가', desc: '스트레스를 예술이나 새로운 아이디어로 승화시키는 독특한 능력이 있습니다.', img: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=800&q=80', color: '#8b5cf6', tags: ['#승화', '#아이디어', '#특별함'] }
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
    }
];
