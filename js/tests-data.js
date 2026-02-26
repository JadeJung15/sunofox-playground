export const TESTS = [
    {
        id: 'energy-test',
        category: '재미',
        title: '2030 반말보룸 🎧 I’m Your Energy 테스트',
        desc: '요즘 니 에너지 어디서 나오냐. 정상인 척 살고 있지만 다 티 난다. 7개만 고르면 결과 나옴.',
        thumb: 'https://scontent-icn2-1.cdninstagram.com/v/t51.2885-15/491508562_17899630527177267_864338183336279557_n.webp?efg=eyJ2ZW5jb2RlX3RhZyI6InRocmVhZHMuRkVFRC5pbWFnZV91cmxnZW4uMzQweDM0MC5zZHIuZjc1NzYxLmRlZmF1bHRfaW1hZ2UuYzIifQ&_nc_ht=scontent-icn2-1.cdninstagram.com&_nc_cat=103&_nc_oc=Q6cZ2QHbzQmKbOGml7RiY8X2CSBkBJ3GjBYzJOIzC8sJlIMyBIqPKvawh93-3JzOkQ3bbbU&_nc_ohc=fFITkIfMz-IQ7kNvwFH-dBQ&_nc_gid=ooHjmv3sNFgEvi8Ltao-Xg&edm=AKr904kBAAAA&ccb=7-5&ig_cache_key=MzYxOTA3MDI2NzQ2ODY2ODA4Mg%3D%3D.3-ccb7-5&oh=00_AftHxKNa4yr1pD9UNQCcIW9su6AADRPT4ppfvsIndaeevw&oe=69A5E5D8&_nc_sid=23467f',
        customTraits: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10'],
        questions: [
            { 
                q: '아침에 눈 뜨자마자 하는 행동', 
                options: [
                    { text: '폰부터 확인', type: 'T1' },
                    { text: '알람 끄고 다시 잠', type: 'T3' },
                    { text: '음악 틀기', type: 'T5' },
                    { text: '멍 때리기', type: 'T9' }
                ] 
            },
            { 
                q: '약속 없는 주말', 
                options: [
                    { text: '집에서 콘텐츠 몰아봄', type: 'T2' },
                    { text: '카페 가서 시간 보냄', type: 'T6' },
                    { text: '게임이나 취미', type: 'T7' },
                    { text: '그냥 누워있음', type: 'T4' }
                ] 
            },
            { 
                q: '스트레스 받았을 때', 
                options: [
                    { text: '혼자 잠수', type: 'T7' },
                    { text: '친구 만나서 털기', type: 'T8' },
                    { text: '음악 들으면서 정리', type: 'T5' },
                    { text: '일단 잠', type: 'T1' }
                ] 
            },
            { 
                q: '단톡방에서 나는', 
                options: [
                    { text: '말 많은 편', type: 'T10' },
                    { text: '가끔 등장', type: 'T8' },
                    { text: '읽기만 함', type: 'T9' },
                    { text: '알림 꺼둠', type: 'T6' }
                ] 
            },
            { 
                q: '여행 스타일', 
                options: [
                    { text: '즉흥 출발', type: 'T10' },
                    { text: '계획 세움', type: 'T3' },
                    { text: '남 따라감', type: 'T4' },
                    { text: '집이 최고', type: 'T7' }
                ] 
            },
            { 
                q: '노래 들을 때 중요 포인트', 
                options: [
                    { text: '비트', type: 'T10' },
                    { text: '가사', type: 'T4' },
                    { text: '분위기', type: 'T6' },
                    { text: '멜로디', type: 'T5' }
                ] 
            },
            { 
                q: '지금 내 상태', 
                options: [
                    { text: '에너지 넘침', type: 'T10' },
                    { text: '살짝 지침', type: 'T1' },
                    { text: '생각 많음', type: 'T9' },
                    { text: '그냥 귀찮음', type: 'T2' }
                ] 
            }
        ],
        results: {
            T1: { 
                title: '인간 배터리 5%형', 
                desc: '맨날 피곤하다면서 늦게 잠. 충전 방식이 이상함.',
                img: 'https://images.unsplash.com/photo-1541580621-077eb672b144?auto=format&fit=crop&w=800&q=80',
                tags: ['#방전직전', '#늦게잠', '#만성피로'],
                color: '#ef4444'
            },
            T2: { 
                title: '도파민 중독자형', 
                desc: '릴스 하나만 본다 해놓고 시간 증발 전문.',
                img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
                tags: ['#도파민', '#알고리즘', '#시간순삭'],
                color: '#8b5cf6'
            },
            T3: { 
                title: '계획은 완벽 실행은 내일부터형', 
                desc: '할 일 정리하는 건 세계 1위. 시작은 아직 안 함.',
                img: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80',
                tags: ['#J호소인', '#계획만', '#미루기'],
                color: '#f59e0b'
            },
            T4: { 
                title: '새벽 감성 과몰입형', 
                desc: '밤 되면 인생 정리함. 아침 되면 리셋.',
                img: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
                tags: ['#새벽감성', '#과몰입', '#감수성'],
                color: '#3b82f6'
            },
            T5: { 
                title: '인간 플레이리스트형', 
                desc: '기분 조절 = 음악. 노래 없으면 하루 이상함.',
                img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
                tags: ['#음악필수', '#노동요', '#뮤직이즈마이라이프'],
                color: '#10b981'
            },
            T6: { 
                title: '조용한 또라이형', 
                desc: '겉보기엔 정상. 근데 생각이 묘하게 웃김.',
                img: 'https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=800&q=80',
                tags: ['#반전매력', '#은은한광기', '#마이웨이'],
                color: '#a855f7'
            },
            T7: { 
                title: '집순이 집돌이 에너지형', 
                desc: '밖에 나가면 체력 급감. 집 오면 회복.',
                img: 'https://images.unsplash.com/photo-1499916078039-922301b0eb9b?auto=format&fit=crop&w=800&q=80',
                tags: ['#집최고', '#이불밖은위험해', '#홈바디'],
                color: '#f97316'
            },
            T8: { 
                title: '사회생활 ON 인간 OFF형', 
                desc: '밖에서는 멀쩡. 집 오면 말수 0.',
                img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
                tags: ['#온오프', '#자본주의미소', '#에너지절약'],
                color: '#6366f1'
            },
            T9: { 
                title: '관찰자 모드 인간형', 
                desc: '다 보고 있음. 근데 참여는 안 함.',
                img: 'https://images.unsplash.com/photo-1494059980473-813e73ee784b?auto=format&fit=crop&w=800&q=80',
                tags: ['#지켜보기', '#방관자', '#내적참여'],
                color: '#64748b'
            },
            T10: { 
                title: '숨겨진 광기 보유자형', 
                desc: '평소엔 조용. 친해지면 사람들이 놀람.',
                img: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=800&q=80',
                tags: ['#친해지면돌변', '#도른자', '#핵인싸'],
                color: '#ec4899'
            }
        }
    },
    {
        id: 'ending-test',
        category: '재미',
        title: '나의 인생 엔딩 보고서',
        desc: '당신의 삶이 한 권의 책이라면, 그 마지막 페이지는 어떤 모습일까요?',
        thumb: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80',
        questions: [
            { 
                q: '긴 여행의 끝, 마지막 기차역에 도착했습니다. 당신의 손에 들린 가방은 어떤 상태인가요?', 
                options: [
                    { text: '추억이 담긴 기념품으로 가득 차 무거운 가방', type: 'A' },
                    { text: '꼭 필요한 것만 남겨 가벼워진 배낭', type: 'B' }
                ] 
            },
            { 
                q: '역 대합실 벽에 커다란 거울이 있습니다. 거울 속 당신은 어떤 표정을 짓고 있나요?', 
                options: [
                    { text: '지나온 길을 회상하며 짓는 옅은 미소', type: 'A' },
                    { text: '새로운 시작을 앞둔 듯한 맑은 눈빛', type: 'B' }
                ] 
            },
            { 
                q: '갑자기 낯선 이가 다가와 당신의 인생을 한 단어로 정의해달라고 합니다.', 
                options: [
                    { text: '끊임없이 뜨거웠던 "열정"', type: 'A' },
                    { text: '잔잔하고 포근했던 "평온"', type: 'B' }
                ] 
            },
            { 
                q: '창밖으로 노을이 지기 시작합니다. 당신은 이 풍경을 누구와 함께 보고 싶나요?', 
                options: [
                    { text: '나를 사랑해준 수많은 사람들', type: 'A' },
                    { text: '나의 진심을 아는 단 한 사람', type: 'B' }
                ] 
            },
            { 
                q: '책장에 당신의 이름이 적힌 마지막 권이 꽂힙니다. 책의 표지 색깔은?', 
                options: [
                    { text: '강렬하고 화려한 금빛', type: 'A' },
                    { text: '차분하고 깊은 감색', type: 'B' }
                ] 
            },
            { 
                q: '마지막 페이지의 문장은 어떻게 끝맺음하고 싶나요?', 
                options: [
                    { text: '"그는 참으로 멋진 삶을 살았다."', type: 'A' },
                    { text: '"그가 머문 자리는 여전히 따뜻했다."', type: 'B' }
                ] 
            },
            { 
                q: '이제 눈을 감습니다. 당신의 귓가에 들리는 마지막 소리는?', 
                options: [
                    { text: '환호성과 박수 소리', type: 'A' },
                    { text: '사랑한다는 나지막한 속삭임', type: 'B' }
                ] 
            }
        ],
        results: {
            A: { 
                title: '화려한 불꽃의 피날레', 
                desc: '당신의 삶은 마치 한 편의 블록버스터 영화 같았습니다. 끊임없이 도전하고 쟁취하며 많은 이들에게 영감을 주었네요. 당신의 엔딩은 수많은 박수 갈채 속에서 가장 찬란하게 빛날 것입니다.',
                img: 'https://images.unsplash.com/photo-1498931299472-f7a63a5a1cfa?auto=format&fit=crop&w=800&q=80',
                tags: ['#열정', '#주인공', '#성공']
            },
            B: { 
                title: '깊은 숲속의 고요한 새벽', 
                desc: '당신의 삶은 맑은 호수처럼 투명하고 깊었습니다. 화려함보다는 내면의 가치를 소중히 여겼으며, 당신이 머문 자리에는 늘 은은한 향기가 남았습니다. 당신의 엔딩은 평화로운 안식 그 자체일 것입니다.',
                img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80',
                tags: ['#평온', '#내면', '#휴식']
            }
        }
    },
    {
        id: 'p1',
 category: '성격', title: '나의 숨겨진 아우라 컬러', desc: '7단계 심층 질문으로 당신만의 고유한 성향과 아우라를 분석합니다.', thumb: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
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
        id: 'p12', category: '성격', title: '돈 관리 성향 테스트', desc: '당신의 소비 습관과 부를 대하는 태도를 통해 성격의 이면을 분석합니다.', thumb: 'https://images.unsplash.com/photo-1554224155-1696413575b9?auto=format&fit=crop&w=500&q=60',
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
        id: 'v3', category: '얼굴', title: '첫인상 매력 포인트', desc: '처음 만난 사람이 당신에게서 느끼는 가장 독보적인 매력을 찾아드립니다.', thumb: 'https://images.unsplash.com/photo-15222075469751-3a6694fb2f61?auto=format&fit=crop&w=500&q=60',
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
            { q: '당신의 얼굴형 중 어디가 가장 넓은 부분인가요?', options: [{ text: '이마 부분이 넓은 편이다', type: 'A' }, { text: '광대나 하관 부분이 넓은 편이다', type: 'B' }] },
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
        id: 'v11', category: '얼굴', title: '나의 아우라 컬러 진단', desc: '외모에서 풍기는 당신만의 고유한 색과 아우라를 분석합니다.', thumb: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '햇빛 아래 당신의 눈동자 색은?', options: [{ text: '진하고 깊은 블랙/초코', type: 'A' }, { text: '맑고 투명한 브라운/호박', type: 'B' }] },
            { q: '자주 입는 옷의 명도는?', options: [{ text: '차분하고 어두운 톤', type: 'A' }, { text: '화사하고 밝은 톤', type: 'B' }] },
            { q: '당신의 이목구비 중 가장 화려한 곳은?', options: [{ text: '강렬한 눈빛', type: 'A' }, { text: '부드러운 입매', type: 'B' }] },
            { q: '주변에서 느끼는 당신의 온도차는?', options: [{ text: '첫인상은 차갑지만 알수록 따뜻하다', type: 'A' }, { text: '첫인상부터 편안하고 다정하다', type: 'B' }] },
            { q: '사진 찍을 때 선호하는 필터는?', options: [{ text: '대비가 강한 흑백이나 선명한 톤', type: 'A' }, { text: '몽환적이고 부드러운 파스텔 톤', type: 'B' }] },
            { q: '당신의 코 선은 어떤가요?', options: [{ text: '직선으로 곧게 뻗은 느낌', type: 'A' }, { text: '곡선이 가미된 부드러운 느낌', type: 'B' }] },
            { q: '당신의 아우라를 한마디로 표현한다면?', options: [{ text: '카리스마와 무게감', type: 'A' }, { text: '생동감과 친근함', type: 'B' }] }
        ],
        results: {
            A: { title: '미드나잇 로얄 블루', desc: '당신은 깊고 지적인 아우라를 풍깁니다. 말하지 않아도 느껴지는 존재감이 주변을 압도하는 매력이 있습니다.', img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=500&q=60' },
            B: { title: '선셋 골든 오렌지', desc: '당신은 주변을 밝게 만드는 따뜻한 아우라의 소유자입니다. 생기 넘치는 에너지와 호감을 주는 이미지가 최고의 강점입니다.', img: 'https://images.unsplash.com/photo-1547891269-045ad33ed99a?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'v12', category: '얼굴', title: '눈빛 분위기 테스트', desc: '당신의 눈 모양과 눈빛이 주는 특별한 메시지를 분석합니다.', thumb: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '당신의 눈꼬리는 어느 쪽인가요?', options: [{ text: '살짝 올라간 날렵한 눈꼬리', type: 'A' }, { text: '살짝 내려간 순한 눈꼬리', type: 'B' }] },
            { q: '쌍꺼풀의 유무와 형태는?', options: [{ text: '무쌍 또는 얇은 속쌍꺼풀', type: 'A' }, { text: '짙고 선명한 아웃라인 쌍꺼풀', type: 'B' }] },
            { q: '대화할 때 상대방의 눈을 어떻게 보나요?', options: [{ text: '정면으로 뚫어지게 응시한다', type: 'A' }, { text: '부드럽게 맞추며 자주 웃는다', type: 'B' }] },
            { q: '당신의 눈동자 크기는 어떤가요?', options: [{ text: '눈동자가 크고 선명하다', type: 'A' }, { text: '흰자가 많이 보여 예리한 느낌이다', type: 'B' }] },
            { q: '당신이 선호하는 아이 메이크업은?', options: [{ text: '아이라인을 길게 뺀 시크한 스타일', type: 'A' }, { text: '글리터와 음영을 강조한 화려한 스타일', type: 'B' }] },
            { q: '눈 아래 애교살이 있나요?', options: [{ text: '없거나 아주 연한 편이다', type: 'A' }, { text: '도톰하게 있어 눈매가 강조된다', type: 'B' }] },
            { q: '눈빛이 매력적이라는 말을 들어봤나요?', options: [{ text: '섹시하고 카리스마 있다는 말', type: 'A' }, { text: '맑고 초롱초롱하다는 말', type: 'B' }] }
        ],
        results: {
            A: { title: '치명적인 블랙홀 눈빛', desc: '당신은 한 번 보면 빠져나올 수 없는 깊고 강렬한 눈빛을 가졌습니다. 신비로운 매력이 사람들을 끌어당깁니다.', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=60' },
            B: { title: '포근한 아침 햇살 눈빛', desc: '당신은 보는 사람의 마음을 편안하게 만드는 선하고 맑은 눈빛을 가졌습니다. 신뢰감을 주는 이미지가 당신의 비주얼 포인트입니다.', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'v13', category: '얼굴', title: '나의 비주얼 DNA', desc: '유전적으로 타고난 당신의 이미지 핵심 요소를 찾아드립니다.', thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '당신의 얼굴형은 어느 쪽인가요?', options: [{ text: '골격이 잡힌 세련된 직선형', type: 'A' }, { text: '볼륨감이 있는 부드러운 곡선형', type: 'B' }] },
            { q: '당신의 코 모양은 어떤 특징이 있나요?', options: [{ text: '콧날이 좁고 오똑한 스타일', type: 'A' }, { text: '콧방울이 둥글고 안정감 있는 스타일', type: 'B' }] },
            { q: '당신의 입술 두께는 어떤가요?', options: [{ text: '얇고 정돈된 느낌', type: 'A' }, { text: '도톰하고 입체적인 느낌', type: 'B' }] },
            { q: '당신의 피부 톤은 어떤 느낌인가요?', options: [{ text: '투명하고 밝은 톤', type: 'A' }, { text: '건강하고 윤기 있는 톤', type: 'B' }] },
            { q: '당신의 이미지는 "전통적" vs "현대적"?', options: [{ text: '세련된 도시의 현대적 미', type: 'A' }, { text: '단아하고 우아한 전통적 미', type: 'B' }] },
            { q: '당신의 눈썹은 어떤 모양인가요?', options: [{ text: '각이 살아있는 진한 눈썹', type: 'A' }, { text: '결이 부드러운 연한 눈썹', type: 'B' }] },
            { q: '가장 많이 닮았다는 소리를 듣는 쪽은?', options: [{ text: '어머니 쪽 라인', type: 'A' }, { text: '아버지 쪽 라인', type: 'B' }] }
        ],
        results: {
            A: { title: '프리미엄 어반 DNA', desc: '당신은 세련된 도시미를 타고난 비주얼입니다. 어떤 스타일도 하이엔드하게 소화하는 감각을 가졌습니다.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=60' },
            B: { title: '클래식 로맨틱 DNA', desc: '당신은 따뜻하고 우아한 고전미를 타고난 비주얼입니다. 시간이 흘러도 변치 않는 고급스러움이 당신의 자산입니다.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'v14', category: '얼굴', title: '옆선 매력 지수 분석', desc: '옆모습에서 드러나는 당신의 숨겨진 분위기를 측정합니다.', thumb: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '당신의 턱선은 어떤 스타일인가요?', options: [{ text: 'L자 형태의 각이 살아있는 턱선', type: 'A' }, { text: '매끄럽게 이어지는 둥근 턱선', type: 'B' }] },
            { q: '코와 이마 사이의 각도는?', options: [{ text: '각도가 깊어 이목구비가 뚜렷해 보인다', type: 'A' }, { text: '각도가 완만하여 선이 고와 보인다', type: 'B' }] },
            { q: '귀의 위치는 어떤가요?', options: [{ text: '눈보다 위쪽에 위치한다', type: 'A' }, { text: '눈과 비슷하거나 아래쪽에 위치한다', type: 'B' }] },
            { q: '웃을 때 옆모습의 변화는?', options: [{ text: '입체감이 살아나며 화려해진다', type: 'A' }, { text: '라인이 정리되며 부드러워진다', type: 'B' }] },
            { q: '본인의 옆모습 중 마음에 드는 곳은?', options: [{ text: '오똑한 콧대', type: 'A' }, { text: '길게 뻗은 목선', type: 'B' }] },
            { q: '안경을 썼을 때 옆모습은 어떤가요?', options: [{ text: '지적인 느낌이 배가된다', type: 'A' }, { text: '얼굴의 여백이 채워져 안정감이 생긴다', type: 'B' }] },
            { q: '머리를 묶었을 때와 풀었을 때 중 옆모습은?', options: [{ text: '깔끔하게 묶었을 때 라인이 돋보인다', type: 'A' }, { text: '자연스럽게 풀었을 때 분위기가 산다', type: 'B' }] }
        ],
        results: {
            A: { title: '조각 같은 입체 옆선', desc: '당신은 옆모습이 마치 조각처럼 선명하고 입체적입니다. 측면에서 느껴지는 카리스마가 매우 인상적입니다.', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=60' },
            B: { title: '수채화 같은 곡선 옆선', desc: '당신은 부드러운 곡선들이 조화를 이루는 예술적인 옆선을 가졌습니다. 은은하고 서정적인 분위기가 당신의 매력입니다.', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'v15', category: '얼굴', title: '퍼스널 칼라 자가진단', desc: '당신의 이목구비를 가장 밝게 비춰줄 베스트 컬러 톤을 찾습니다.', thumb: 'https://images.unsplash.com/photo-1523260572679-8e2fe2762bf1?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '흰색 티셔츠를 입었을 때 당신은?', options: [{ text: '얼굴이 깨끗하고 환해 보인다', type: 'A' }, { text: '얼굴이 창백하거나 노랗게 뜬다', type: 'B' }] },
            { q: '검정색 머리색이 잘 어울리나요?', options: [{ text: '피부 톤이 대비되어 선명해 보인다', type: 'A' }, { text: '인상이 너무 세 보이거나 칙칙해 보인다', type: 'B' }] },
            { q: '어떤 메이크업 제품을 썼을 때 뜨나요?', options: [{ text: '오렌지나 베이지 계열', type: 'A' }, { text: '핑크나 퍼플 계열', type: 'B' }] },
            { q: '당신의 눈 주위 피부 색은?', options: [{ text: '푸른 기나 회색 기가 도는 편', type: 'A' }, { text: '노란 기나 갈색 기가 도는 편', type: 'B' }] },
            { q: '잘 어울리는 립 컬러는?', options: [{ text: '강렬한 레드나 푸른 핑크', type: 'A' }, { text: '따뜻한 코랄이나 브릭 레드', type: 'B' }] },
            { q: '골드 주얼리 vs 실버 주얼리?', options: [{ text: '깔끔한 실버', type: 'A' }, { text: '고급스러운 골드', type: 'B' }] },
            { q: '당신의 이미지는 "시원함" vs "따스함"?', options: [{ text: '시원하고 도회적인 느낌', type: 'A' }, { text: '포근하고 자연스러운 느낌', type: 'B' }] }
        ],
        results: {
            A: { title: '차가운 도시의 쿨톤', desc: '당신은 블루 베이스의 시원한 컬러들이 베스트입니다. 실버 액세서리와 선명한 컬러로 당신의 이미지를 완성해 보세요.', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=500&q=60' },
            B: { title: '따스한 햇살의 웜톤', desc: '당신은 옐로우 베이스의 따뜻한 컬러들이 찰떡입니다. 골드 액세서리와 부드러운 뉴트럴 톤으로 당신의 매력을 극대화하세요.', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'v16', category: '얼굴', title: '나의 비주얼 온도계', desc: '당신의 외모가 풍기는 분위기가 차가운지 따뜻한지 측정해 드립니다.', thumb: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '무표정일 때 화났냐는 소리를 듣나요?', options: [{ text: '자주 듣거나 인상이 차갑다는 소리를 듣는다', type: 'A' }, { text: '거의 안 듣고 인상이 선하다는 소리를 듣는다', type: 'B' }] },
            { q: '당신의 입술 산은 어떤가요?', options: [{ text: '입술 산이 뾰족하고 뚜렷하다', type: 'A' }, { text: '입술 산이 둥글고 완만하다', type: 'B' }] },
            { q: '당신의 눈썹 산은 어떤가요?', options: [{ text: '높게 솟은 아치형이나 각진 눈썹', type: 'A' }, { text: '낮고 일직선에 가까운 눈썹', type: 'B' }] },
            { q: '어떤 재질의 옷을 입을 때 예뻐 보이나요?', options: [{ text: '실크나 가죽 같은 광택 있는 소재', type: 'A' }, { text: '니트나 코튼 같은 보송한 소재', type: 'B' }] },
            { q: '당신의 코 모양은?', options: [{ text: '코끝이 뾰족하고 세련된 느낌', type: 'A' }, { text: '코끝이 둥글고 복스러운 느낌', type: 'B' }] },
            { q: '주변 사람들이 당신을 부르는 수식어는?', options: [{ text: '멋지다, 섹시하다, 똑똑해 보인다', type: 'A' }, { text: '예쁘다, 귀엽다, 착해 보인다', type: 'B' }] },
            { q: '선호하는 배경 음악은?', options: [{ text: '비트가 빠르고 세련된 일렉트로닉', type: 'A' }, { text: '서정적이고 따뜻한 어쿠스틱', type: 'B' }] }
        ],
        results: {
            A: { title: '영하 10도, 얼음 공주/왕자', desc: '당신은 범접할 수 없는 차갑고 세련된 아우라를 가졌습니다. 도도한 매력이 당신의 비주얼 정체성입니다.', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=60' },
            B: { title: '영상 25도, 따뜻한 봄날', desc: '당신은 보는 사람의 마음을 녹이는 온화하고 다정한 분위기를 가졌습니다. 누구에게나 사랑받는 비주얼입니다.', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'v17', category: '얼굴', title: '닮은꼴 영화 캐릭터 찾기', desc: '당신의 이목구비가 완성하는 영화 속 주인공 타입을 찾아드립니다.', thumb: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '당신이 주인공이라면 어떤 장르?', options: [{ text: '스펙터클한 액션이나 첩보물', type: 'A' }, { text: '가슴 설레는 로맨틱 코미디', type: 'B' }] },
            { q: '당신의 눈빛에서 느껴지는 감정은?', options: [{ text: '강한 의지와 열정', type: 'A' }, { text: '풍부한 감성과 눈물', type: 'B' }] },
            { q: '영화 속 당신의 의상은?', options: [{ text: '몸에 딱 붙는 제복이나 수트', type: 'A' }, { text: '편안하고 스타일리시한 데일리룩', type: 'B' }] },
            { q: '당신의 얼굴에서 가장 드라마틱한 부분은?', options: [{ text: '날카로운 눈매와 콧날', type: 'A' }, { text: '웃을 때 매력적인 입매', type: 'B' }] },
            { q: '주변에서 듣는 당신의 분위기는?', options: [{ text: '카리스마 있고 리더십 있어 보인다', type: 'A' }, { text: '주변을 밝히는 에너지가 있다', type: 'B' }] },
            { q: '당신의 목소리 톤은 어떤가요?', options: [{ text: '낮고 신뢰감을 주는 중저음', type: 'A' }, { text: '밝고 경쾌한 하이톤', type: 'B' }] },
            { q: '당신이 가장 좋아하는 영화 대사는?', options: [{ text: '"내가 승리할 것이다"', type: 'A' }, { text: '"사랑해"', type: 'B' }] }
        ],
        results: {
            A: { title: '강인한 카리스마 전사 타입', desc: '당신은 뚜렷한 주관과 강렬한 눈빛을 지닌 주인공 비주얼입니다. 어떤 어려움도 헤쳐나갈 힘이 느껴집니다.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=60' },
            B: { title: '사랑스러운 로맨스 주인공 타입', desc: '당신은 모두의 첫사랑 같은 맑고 환한 분위기를 가졌습니다. 웃는 모습 하나로 스토리를 완성하는 매력적인 비주얼입니다.', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'v18', category: '얼굴', title: '나의 비주얼 무게감 테스트', desc: '이목구비의 부피감과 무게감을 통해 가장 돋보이는 연출법을 찾습니다.', thumb: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '당신의 코는 얼굴에서 어느 정도 차지하나요?', options: [{ text: '크고 오똑하여 존재감이 확실하다', type: 'A' }, { text: '작고 아담하여 조화롭다', type: 'B' }] },
            { q: '당신의 눈썹 두께는 어떤가요?', options: [{ text: '굵고 진해서 인상을 결정한다', type: 'A' }, { text: '얇고 연해서 부드러운 느낌을 준다', type: 'B' }] },
            { q: '얼굴의 하관(턱)은 어떤 느낌인가요?', options: [{ text: '안정감 있고 골격이 느껴진다', type: 'A' }, { text: '갸름하고 가벼운 느낌이다', type: 'B' }] },
            { q: '당신에게 더 잘 어울리는 모자는?', options: [{ text: '창이 넓고 화려한 모자', type: 'A' }, { text: '심플한 캡이나 비니', type: 'B' }] },
            { q: '당신의 이미지는 "화려함" vs "수수함"?', options: [{ text: '화려하고 눈에 띄는 스타일', type: 'A' }, { text: '수수하고 깨끗한 스타일', type: 'B' }] },
            { q: '사진을 찍을 때 그림자가 잘 지는 편인가요?', options: [{ text: '그늘이 잘 져서 입체적으로 나온다', type: 'A' }, { text: '그늘 없이 평면적으로 깨끗하게 나온다', type: 'B' }] },
            { q: '주변에서 인상이 깊다는 말을 듣나요?', options: [{ text: '한 번 보면 잊혀지지 않는 강한 인상', type: 'A' }, { text: '볼수록 질리지 않는 편안한 인상', type: 'B' }] }
        ],
        results: {
            A: { title: '압도적인 중량감의 미학', desc: '당신은 이목구비가 뚜렷하고 화려하여 존재감이 확실합니다. 과감한 스타일링이 당신의 매력을 배가시킵니다.', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=60' },
            B: { title: '가볍고 맑은 여백의 미학', desc: '당신은 조화로운 비율과 맑은 선을 가진 비주얼입니다. 덜어낼수록 빛나는 당신만의 깨끗한 이미지를 믿으세요.', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'v19', category: '얼굴', title: '눈매 맞춤형 아이라인 추천', desc: '당신의 눈 모양을 분석하여 가장 매력적인 눈매를 만드는 라인을 찾습니다.', thumb: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '눈을 떴을 때 쌍꺼풀이 어느 정도 보이나요?', options: [{ text: '거의 보이지 않거나 없다', type: 'A' }, { text: '뒷라인이 선명하게 보인다', type: 'B' }] },
            { q: '눈동자와 눈꺼풀 사이의 공간은?', options: [{ text: '눈꺼풀이 눈동자를 살짝 덮고 있다', type: 'A' }, { text: '눈동자가 시원하게 다 보인다', type: 'B' }] },
            { q: '당신의 눈 가로 길이는?', options: [{ text: '세로보다 가로가 훨씬 길다', type: 'A' }, { text: '가로와 세로 비율이 적당하다', type: 'B' }] },
            { q: '눈꼬리의 주름 방향은?', options: [{ text: '위쪽으로 향하는 편이다', type: 'A' }, { text: '아래쪽으로 향하는 편이다', type: 'B' }] },
            { q: '당신이 원하는 눈매의 이미지는?', options: [{ text: '날카롭고 섹시한 고양이 눈매', type: 'A' }, { text: '선하고 부드러운 강아지 눈매', type: 'B' }] },
            { q: '평소 눈 화장 번짐이 심한가요?', options: [{ text: '눈꺼풀 구조상 잘 번지는 편이다', type: 'A' }, { text: '깔끔하게 잘 유지되는 편이다', type: 'B' }] },
            { q: '속눈썹의 숱과 길이는 어떤가요?', options: [{ text: '숱이 많고 길어서 눈매가 강조된다', type: 'A' }, { text: '숱이 적고 짧아 아이라인이 필수다', type: 'B' }] }
        ],
        results: {
            A: { title: '세련된 캣츠아이 윙 라인', desc: '당신은 눈꼬리를 살짝 위로 뺀 라인이 가장 잘 어울립니다. 눈매의 시원함을 살려 자신감 있는 눈빛을 완성하세요.', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=500&q=60' },
            B: { title: '부드러운 하프 문 라인', desc: '당신은 눈꼬리를 따라 자연스럽게 내린 라인이 최고의 미모를 완성해줍니다. 선하고 맑은 눈망울을 강조해 보세요.', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'v20', category: '얼굴', title: '비주얼 밸런스 최종 진단', desc: '이목구비의 조화와 대칭, 분위기까지 총망라한 당신의 비주얼 리포트.', thumb: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '당신의 얼굴 좌우 대칭은 어떤가요?', options: [{ text: '어느 한쪽이 훨씬 마음에 드는 편이다', type: 'A' }, { text: '거의 비슷해서 구분하기 어렵다', type: 'B' }] },
            { q: '어떤 표정을 지을 때 가장 자신 있나요?', options: [{ text: '시크하게 입술을 다문 표정', type: 'A' }, { text: '활짝 웃으며 치아를 보이는 표정', type: 'B' }] },
            { q: '당신의 이미지는 "화려한 주연" vs "진중한 조연"?', options: [{ text: '어디서든 주인공이 되는 화려한 아우라', type: 'A' }, { text: '탄탄한 내실과 깊이가 느껴지는 분위기', type: 'B' }] },
            { q: '본인의 이목구비 중 하나만 바꿀 수 있다면?', options: [{ text: '눈을 더 크게 하거나 코를 더 높인다', type: 'A' }, { text: '바꾸고 싶은 곳 없이 지금이 좋다', type: 'B' }] },
            { q: '당신의 비주얼을 날씨에 비유한다면?', options: [{ text: '청량하고 맑은 여름 정오', type: 'A' }, { text: '은은하고 차분한 가을 노을', type: 'B' }] },
            { q: '당신을 본 사람들의 첫마디는?', options: [{ text: '"와, 진짜 화려하다!"', type: 'A' }, { text: '"정말 분위기 있다!"', type: 'B' }] },
            { q: '당신이 가장 소중히 여기는 비주얼 포인트는?', options: [{ text: '나만의 독특한 개성', type: 'A' }, { text: '전체적인 조화로움', type: 'B' }] }
        ],
        results: {
            A: { title: '독보적인 매력의 비주얼 퀸/킹', desc: '당신은 누구도 흉내 낼 수 없는 강렬한 개성과 비주얼을 가졌습니다. 당신의 당당함이 최고의 미학입니다.', img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=500&q=60' },
            B: { title: '완벽한 조화의 비주얼 마스터', desc: '당신은 모든 부위가 황금 비율로 어우러진 최고의 밸런스를 가졌습니다. 볼수록 깊이가 느껴지는 진정한 미의 소유자입니다.', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=60' }
        }
    },
    // --- Fortune Tests (15) ---
    {
        id: 'f6', category: '사주', title: '오늘의 비밀 메시지', desc: '우주가 당신에게 보내는 오늘의 단 한마디 조언을 확인하세요.', thumb: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '지금 가장 먼저 떠오르는 색깔은?', options: [{ text: '정열적인 레드나 옐로우', type: 'A' }, { text: '차분한 블루나 그린', type: 'B' }] },
            { q: '오늘 당신의 컨디션을 점수로 매긴다면?', options: [{ text: '70점 이상, 에너지가 넘친다', type: 'A' }, { text: '70점 미만, 휴식이 필요하다', type: 'B' }] },
            { q: '길을 가다 우연히 동전을 발견했다면?', options: [{ text: '기분 좋게 줍는다', type: 'A' }, { text: '그냥 지나친다', type: 'B' }] },
            { q: '지금 당신의 주변은 어떤가요?', options: [{ text: '사람 소리로 북적북적하다', type: 'A' }, { text: '고요하고 적막하다', type: 'B' }] },
            { q: '어떤 날씨 아래에 있고 싶나요?', options: [{ text: '따사로운 햇살 아래', type: 'A' }, { text: '촉촉한 빗줄기 아래', type: 'B' }] },
            { q: '지금 마시고 싶은 음료는?', options: [{ text: '정신이 번쩍 드는 아이스 커피', type: 'A' }, { text: '마음이 편해지는 따뜻한 차', type: 'B' }] },
            { q: '오늘 하루, 당신의 마음가짐은?', options: [{ text: '열심히 달려보자!', type: 'A' }, { text: '물 흐르듯 흘러가자', type: 'B' }] }
        ],
        results: {
            A: { title: '과감하게 행동하라 (Action)', desc: '오늘은 망설임보다 실행이 필요한 날입니다. 당신의 직관을 믿고 첫발을 내디뎌 보세요. 행운은 움직이는 자의 편입니다.', img: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=500&q=60' },
            B: { title: '잠시 멈추어 돌아보라 (Reflection)', desc: '서두르기보다 주변을 살피고 내면을 정돈하는 것이 좋습니다. 놓치고 있던 소중한 가치를 발견하게 될 것입니다.', img: 'https://images.unsplash.com/photo-1499209974431-9dac3e5d9774?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'f7', category: '사주', title: '나의 숨겨진 잠재력 운세', desc: '당신조차 몰랐던 당신 안의 특별한 재능과 운의 흐름을 분석합니다.', thumb: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '당신이 초능력을 하나 가질 수 있다면?', options: [{ text: '미래를 보는 예지력', type: 'A' }, { text: '타인의 마음을 읽는 독심술', type: 'B' }] },
            { q: '어려운 문제에 부딪혔을 때 당신은?', options: [{ text: '끝까지 파고들어 정답을 찾는다', type: 'A' }, { text: '주변의 도움을 받아 함께 해결한다', type: 'B' }] },
            { q: '꿈속에서 당신은 주로 어떤 모습인가요?', options: [{ text: '무언가를 성취하거나 이끄는 모습', type: 'A' }, { text: '자유롭게 여행하거나 관찰하는 모습', type: 'B' }] },
            { q: '어린 시절 당신은 어떤 아이였나요?', options: [{ text: '궁금한 건 못 참는 호기심 대장', type: 'A' }, { text: '친구들의 이야기를 잘 듣는 꼬마 상담사', type: 'B' }] },
            { q: '낯선 환경에 던져졌을 때 당신의 적응력은?', options: [{ text: '금방 파악하고 주도권을 잡는다', type: 'A' }, { text: '천천히 스며들며 사람들과 친해진다', type: 'B' }] },
            { q: '당신이 가장 성취감을 느끼는 순간은?', options: [{ text: '어려운 목표를 달성했을 때', type: 'A' }, { text: '누군가에게 진심 어린 감사를 받았을 때', type: 'B' }] },
            { q: '인생의 터닝포인트가 온다면?', options: [{ text: '과감하게 변화를 선택한다', type: 'A' }, { text: '신중하게 리스크를 분석한다', type: 'B' }] }
        ],
        results: {
            A: { title: '혁신적인 전략가의 기운', desc: '당신은 남들이 보지 못하는 기회를 포착하는 천부적인 감각이 있습니다. 리더로서 세상을 변화시킬 잠재력이 매우 큽니다.', img: 'https://images.unsplash.com/photo-1507679799987-c7377ec486e8?auto=format&fit=crop&w=500&q=60' },
            B: { title: '따뜻한 치유자의 기운', desc: '당신은 사람들의 마음을 움직이고 위로하는 강력한 공감의 에너지를 가졌습니다. 많은 이들의 삶에 빛이 되어줄 운명입니다.', img: 'https://images.unsplash.com/photo-1516589174184-c68d8e5fcc4a?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'f8', category: '사주', title: '금전운 상승 가이드', desc: '당신의 경제적 흐름을 개선하고 부를 끌어당기는 비결을 알려드립니다.', thumb: 'https://images.unsplash.com/photo-1554224155-1696413575b9?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '돈을 쓸 때 당신이 느끼는 감정은?', options: [{ text: '미래를 위한 가치 있는 투자다', type: 'A' }, { text: '왠지 모르게 불안하고 아깝다', type: 'B' }] },
            { q: '자산 관리를 위해 가장 먼저 해야 할 일은?', options: [{ text: '수입을 늘릴 구체적인 계획 수립', type: 'A' }, { text: '지출을 줄이는 가계부 작성', type: 'B' }] },
            { q: '투자 정보를 얻는 당신의 경로는?', options: [{ text: '전문 서적이나 강의를 통한 공부', type: 'A' }, { text: '지인이나 커뮤니티의 생생한 후기', type: 'B' }] },
            { q: '당신의 책상 위 지갑의 위치는?', options: [{ text: '항상 정해진 자리에 깔끔하게', type: 'A' }, { text: '가방 안이나 어딘가에 자유롭게', type: 'B' }] },
            { q: '세일 문구를 봤을 때 당신의 반응은?', options: [{ text: '필요한 물건인지 먼저 생각한다', type: 'A' }, { text: '일단 싸니까 장바구니에 담는다', type: 'B' }] },
            { q: '부자가 된 자신의 모습을 상상하면?', options: [{ text: '사회에 기여하고 사업을 확장한다', type: 'A' }, { text: '편안하게 쉬며 여행을 다닌다', type: 'B' }] },
            { q: '돈은 당신에게 어떤 의미인가요?', options: [{ text: '꿈을 이루기 위한 강력한 도구', type: 'A' }, { text: '안전한 삶을 지켜주는 울타리', type: 'B' }] }
        ],
        results: {
            A: { title: '공격적인 자산 증식형', desc: '당신은 돈의 흐름을 주도할 준비가 되어 있습니다. 과감한 도전과 배움이 당신을 큰 부의 길로 인도할 것입니다.', img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=500&q=60' },
            B: { title: '안정적인 내실 관리형', desc: '당신은 꼼꼼하고 착실하게 부를 쌓아가는 타입입니다. 작은 새어나감을 막는 것이 당신의 재물운을 폭발시키는 열쇠입니다.', img: 'https://images.unsplash.com/photo-1554224155-1696413575b9?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'f9', category: '사주', title: '연애운 대박 징조 테스트', desc: '당신에게 다가올 운명적인 인연과 연애의 흐름을 미리 체크해보세요.', thumb: 'https://images.unsplash.com/photo-1518199266791-bd373292e90c?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '길에서 우연히 옛사랑을 마주친다면?', options: [{ text: '밝게 인사하며 안부를 묻는다', type: 'A' }, { text: '모른 척 조용히 지나간다', type: 'B' }] },
            { q: '지금 당신이 원하는 연애의 온도는?', options: [{ text: '뜨겁고 열정적인 한여름 밤', type: 'A' }, { text: '은은하고 포근한 늦가을 오후', type: 'B' }] },
            { q: '소개팅 제안이 들어온다면 당신의 선택은?', options: [{ text: '새로운 만남은 언제나 환영이다', type: 'A' }, { text: '조건과 프로필을 신중히 따져본다', type: 'B' }] },
            { q: '사랑에 빠졌을 때 당신의 모습은?', options: [{ text: '온 세상이 핑크빛으로 보인다', type: 'A' }, { text: '오히려 더 침착해지려 노력한다', type: 'B' }] },
            { q: '연인과 가고 싶은 꿈의 여행지는?', options: [{ text: '화려한 도시 야경 투어', type: 'A' }, { text: '조용한 휴양지 풀빌라', type: 'B' }] },
            { q: '당신이 생각하는 운명이란?', options: [{ text: '스스로 만들어가는 것이다', type: 'A' }, { text: '정해진 흐름이 있는 것이다', type: 'B' }] },
            { q: '지금 누군가 당신을 짝사랑하고 있을까요?', options: [{ text: '당연히 그럴 것 같다', type: 'A' }, { text: '설마 그럴 리가 없다고 생각한다', type: 'B' }] }
        ],
        results: {
            A: { title: '곧 다가올 불꽃 같은 인연', desc: '조만간 당신의 심장을 뛰게 할 강렬한 인연이 나타날 징조입니다. 마음의 문을 활짝 열고 기회를 놓치지 마세요.', img: 'https://images.unsplash.com/photo-1511733849282-589d29dad210?auto=format&fit=crop&w=500&q=60' },
            B: { title: '스며드는 잔잔한 사랑', desc: '주변에 이미 당신을 지켜보는 따뜻한 시선이 있습니다. 익숙함 속에서 진정한 보석을 발견하게 될 운명입니다.', img: 'https://images.unsplash.com/photo-1516589174184-c68d8e5fcc4a?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'f10', category: '사주', title: '나의 수호 동물 운세', desc: '당신을 지켜주고 행운을 가져다주는 영적인 수호 동물을 찾아드립니다.', thumb: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '깊은 숲속에서 길을 잃었다면?', options: [{ text: '높은 곳에 올라가 길을 찾는다', type: 'A' }, { text: '동물들의 흔적을 따라간다', type: 'B' }] },
            { q: '당신이 가장 좋아하는 시간대는?', options: [{ text: '활동적인 낮 시간', type: 'A' }, { text: '신비로운 밤 시간', type: 'B' }] },
            { q: '위기의 순간, 당신의 무기는?', options: [{ text: '빠른 스피드와 순발력', type: 'A' }, { text: '강한 힘과 인내심', type: 'B' }] },
            { q: '당신은 무리 생활을 좋아하나요?', options: [{ text: '함께 어울리는 것이 좋다', type: 'A' }, { text: '혼자만의 시간이 더 편하다', type: 'B' }] },
            { q: '어떤 날씨에 에너지가 솟나요?', options: [{ text: '천둥 번개가 치는 거친 날씨', type: 'A' }, { text: '안개가 낀 몽환적인 날씨', type: 'B' }] },
            { q: '당신의 시력(통찰력)은 어떤가요?', options: [{ text: '멀리 보고 핵심을 꿰뚫는다', type: 'A' }, { text: '가까운 것의 세밀함을 포착한다', type: 'B' }] },
            { q: '수호 동물에게 바라는 점은?', options: [{ text: '나를 강하게 이끌어주길', type: 'A' }, { text: '나를 따뜻하게 보호해주길', type: 'B' }] }
        ],
        results: {
            A: { title: '용맹한 하늘의 제왕, 독수리', desc: '당신의 수호 동물은 독수리입니다. 높은 이상과 넓은 시야로 당신의 목표를 달성할 수 있도록 강력한 기운을 불어넣어 줍니다.', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=60' },
            B: { title: '지혜로운 숲의 수호자, 늑대', desc: '당신의 수호 동물은 늑대입니다. 끈끈한 유대감과 예리한 직관으로 위기에서 당신을 보호하고 올바른 길로 인도합니다.', img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'f11', category: '사주', title: '오늘의 금전운 주머니', desc: '오늘 당신의 지갑이 얼마나 두둑해질지, 돈이 들어오는 통로를 분석합니다.', thumb: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '지금 지갑에 현금이 얼마나 있나요?', options: [{ text: '만 원 이상 넉넉히 있다', type: 'A' }, { text: '거의 없거나 카드만 있다', type: 'B' }] },
            { q: '오늘 아침 결제한 첫 항목은?', options: [{ text: '교통비나 식비 등 필수 지출', type: 'A' }, { text: '커피나 간식 등 기호 식품', type: 'B' }] },
            { q: '길에서 돈을 줍는 상상을 한다면?', options: [{ text: '고액권 지폐를 줍는다', type: 'A' }, { text: '희귀한 동전을 줍는다', type: 'B' }] },
            { q: '지금 가장 사고 싶은 물건의 가격은?', options: [{ text: '10만원 이상의 고가 제품', type: 'A' }, { text: '소소한 생활 용품', type: 'B' }] },
            { q: '누군가에게 돈을 빌려준다면?', options: [{ text: '신중하게 차용증을 쓴다', type: 'A' }, { text: '믿고 그냥 빌려준다', type: 'B' }] },
            { q: '나의 저축 성향은?', options: [{ text: '목표 금액을 정해 철저히', type: 'A' }, { text: '남는 돈을 여유 있게', type: 'B' }] },
            { q: '오늘 하루, 돈이 들어온다면 어디서?', options: [{ text: '열심히 일한 대가(수입)', type: 'A' }, { text: '생각지 못한 행운(이벤트 등)', type: 'B' }] }
        ],
        results: {
            A: { title: '꽉 찬 황금 주머니', desc: '오늘은 재물운이 매우 강한 날입니다. 노력한 만큼의 보상이 확실히 들어오니 자신 있게 활동하세요.', img: 'https://images.unsplash.com/photo-1589758438368-0ad531db3366?auto=format&fit=crop&w=500&q=60' },
            B: { title: '소소한 행운 주머니', desc: '큰돈은 아니더라도 기분 좋은 소액의 행운이 따르는 날입니다. 주변 사람들에게 베풀면 더 큰 복으로 돌아옵니다.', img: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'f12', category: '사주', title: '나의 주간 운세 예보', desc: '이번 한 주 당신의 운 흐름이 맑음일지 흐림일지 미리 확인하세요.', thumb: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '이번 주 가장 중요한 일정은?', options: [{ text: '업무나 학업 관련 중요한 일', type: 'A' }, { text: '사람들과의 즐거운 약속', type: 'B' }] },
            { q: '월요일 아침의 기분은 어땠나요?', options: [{ text: '활기차고 의욕이 넘쳤다', type: 'A' }, { text: '조금 처지고 쉬고 싶었다', type: 'B' }] },
            { q: '이번 주에 꼭 하고 싶은 한 가지는?', options: [{ text: '미뤄왔던 일 마무리하기', type: 'A' }, { text: '나를 위한 충분한 휴식', type: 'B' }] },
            { q: '지금 당신의 에너지를 색으로 표현하면?', options: [{ text: '강렬한 오렌지색', type: 'A' }, { text: '부드러운 하늘색', type: 'B' }] },
            { q: '이번 주 날씨가 당신의 운에 영향을 줄까요?', options: [{ text: '날씨에 상관없이 내 페이스를 유지한다', type: 'A' }, { text: '맑은 날에 기운이 더 난다', type: 'B' }] },
            { q: '이번 주에 만나고 싶은 귀인은?', options: [{ text: '나를 이끌어줄 멘토', type: 'A' }, { text: '마음이 잘 맞는 친구', type: 'B' }] },
            { q: '일요일 저녁, 당신은 무엇을 하고 있을까요?', options: [{ text: '다음 주를 완벽하게 준비한다', type: 'A' }, { text: '주말의 여운을 만끽하며 쉰다', type: 'B' }] }
        ],
        results: {
            A: { title: '쾌청한 맑음 뒤 무지개', desc: '이번 주는 당신의 노력이 빛을 발하는 주입니다. 주 초반의 바쁨이 주 후반의 큰 성취감으로 돌아올 것입니다.', img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=60' },
            B: { title: '포근한 구름 사이 햇살', desc: '무난하고 평화로운 한 주가 예상됩니다. 큰 변화보다는 일상의 소소한 행복을 만끽하며 에너지를 충전하세요.', img: 'https://images.unsplash.com/photo-1499209974431-9dac3e5d9774?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'f13', category: '사주', title: '성공을 부르는 이름 궁합', desc: '당신의 닉네임이나 이름이 성공 운과 얼마나 잘 맞는지 분석합니다.', thumb: 'https://images.unsplash.com/photo-1503551723145-6c040742065b?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '지금 사용 중인 닉네임의 느낌은?', options: [{ text: '강하고 임팩트 있는 느낌', type: 'A' }, { text: '부드럽고 친근한 느낌', type: 'B' }] },
            { q: '이름을 불렀을 때 들리는 소리의 온도는?', options: [{ text: '선명하고 차가운 금속음 느낌', type: 'A' }, { text: '울림이 있고 따뜻한 나무 느낌', type: 'B' }] },
            { q: '닉네임을 지을 때 가장 고려한 것은?', options: [{ text: '나의 정체성과 전문성', type: 'A' }, { text: '부르기 편함과 친근함', type: 'B' }] },
            { q: '이름에 숫자가 포함되어 있나요?', options: [{ text: '그렇다, 숫자의 기운을 믿는다', type: 'A' }, { text: '아니다, 글자로만 이루어졌다', type: 'B' }] },
            { q: '남들이 당신의 이름을 부를 때 기분은?', options: [{ text: '자신감이 생기고 힘이 난다', type: 'A' }, { text: '편안하고 자연스럽다', type: 'B' }] },
            { q: '성공한 사람들의 이름에서 느껴지는 공통점은?', options: [{ text: '강력한 카리스마와 발음', type: 'A' }, { text: '기억하기 쉬운 리듬감', type: 'B' }] },
            { q: '만약 이름을 바꾼다면 어떤 쪽으로?', options: [{ text: '부와 명예를 부르는 이름', type: 'A' }, { text: '건강과 행복을 지켜주는 이름', type: 'B' }] }
        ],
        results: {
            A: { title: '명예를 드높이는 승부사의 이름', desc: '당신의 이름(닉네임)은 리더의 기운을 담고 있습니다. 사회적인 성공과 명예를 얻기에 최적화된 이름입니다.', img: 'https://images.unsplash.com/photo-1507679799987-c7377ec486e8?auto=format&fit=crop&w=500&q=60' },
            B: { title: '덕망을 쌓는 조율자의 이름', desc: '당신의 이름(닉네임)은 사람을 끌어당기는 따뜻한 힘이 있습니다. 대인관계를 통해 큰 부와 행복을 이룰 운명입니다.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'f14', category: '사주', title: '오늘의 행운 장소 찾기', desc: '지금 당장 당신의 운을 틔워줄 행운의 장소를 추천해 드립니다.', thumb: 'https://images.unsplash.com/photo-1449156003956-3372473ff794?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '지금 당신이 있는 곳의 채광은?', options: [{ text: '햇살이 잘 들어 밝다', type: 'A' }, { text: '조금 어둡거나 은은하다', type: 'B' }] },
            { q: '어떤 소리에 더 끌리나요?', options: [{ text: '활기찬 도시의 백색 소음', type: 'A' }, { text: '잔잔한 물소리나 새소리', type: 'B' }] },
            { q: '지금 옷차림은 어떤가요?', options: [{ text: '외출하기 좋은 외출복', type: 'A' }, { text: '편안한 실내복', type: 'B' }] },
            { q: '가장 최근에 방문한 핫플레이스는?', options: [{ text: '줄 서서 기다리는 유명 맛집', type: 'A' }, { text: '한적하고 분위기 있는 카페', type: 'B' }] },
            { q: '이동 수단 중 선호하는 것은?', options: [{ text: '활기찬 지하철이나 버스', type: 'A' }, { text: '여유로운 걷기나 드라이브', type: 'B' }] },
            { q: '지금 당장 순간 이동을 한다면?', options: [{ text: '뉴욕의 타임스퀘어', type: 'A' }, { text: '몰디브의 에메랄드 해변', type: 'B' }] },
            { q: '오늘 하루, 당신의 목적지는?', options: [{ text: '새로운 에너지를 얻는 곳', type: 'A' }, { text: '지친 마음을 다독이는 곳', type: 'B' }] }
        ],
        results: {
            A: { title: '활기찬 에너지가 넘치는 시장/광장', desc: '오늘은 사람이 많고 생동감 넘치는 곳이 당신의 행운 장소입니다. 그곳의 활기가 당신의 막힌 운을 시원하게 뚫어줄 것입니다.', img: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=500&q=60' },
            B: { title: '고요함이 머무는 공원/도서관', desc: '오늘은 차분하게 생각을 정리할 수 있는 고요한 곳이 최고의 장소입니다. 정적인 공간에서 당신의 행운이 조용히 싹틀 것입니다.', img: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'f15', category: '사주', title: '나의 타고난 오행 분석', desc: '목화토금수, 당신의 기질을 결정하는 핵심 원소를 찾아드립니다.', thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '당신의 성격을 한 단어로 표현하면?', options: [{ text: '뜨거운 열정의 불', type: 'A' }, { text: '유연한 적응력의 물', type: 'B' }] },
            { q: '어떤 색상의 옷이 가장 잘 어울리나요?', options: [{ text: '화려한 레드나 옐로우 계열', type: 'A' }, { text: '차분한 블루나 블랙 계열', type: 'B' }] },
            { q: '어려움에 처했을 때 당신의 반응은?', options: [{ text: '정면으로 부딪혀 돌파한다', type: 'A' }, { text: '우회하거나 상황을 지켜본다', type: 'B' }] },
            { q: '좋아하는 맛은 어느 쪽인가요?', options: [{ text: '스트레스 풀리는 매운맛', type: 'A' }, { text: '깔끔하고 깊은 짠맛/신맛', type: 'B' }] },
            { q: '당신의 체질은 어떤 편인가요?', options: [{ text: '몸에 열이 많고 활동적이다', type: 'A' }, { text: '몸이 찬 편이고 차분하다', type: 'B' }] },
            { q: '창밖을 볼 때 더 끌리는 풍경은?', options: [{ text: '타오르는 화려한 노을', type: 'A' }, { text: '깊고 푸른 끝없는 바다', type: 'B' }] },
            { q: '인생에서 더 중요한 가치는?', options: [{ text: '확실한 성과와 승리', type: 'A' }, { text: '내면의 평화와 지혜', type: 'B' }] }
        ],
        results: {
            A: { title: '타오르는 불(火)의 기운', desc: '당신은 열정적이고 에너지가 넘치는 화(火)의 기운을 타고났습니다. 솔직한 표현과 추진력이 당신의 가장 큰 무기입니다.', img: 'https://images.unsplash.com/photo-1547891269-045ad33ed99a?auto=format&fit=crop&w=500&q=60' },
            B: { title: '흐르는 물(수)의 기운', desc: '당신은 지혜롭고 유연한 수(수)의 기운을 가졌습니다. 어떤 상황에서도 적응하며 깊은 통찰력으로 문제를 해결하는 능력이 탁월합니다.', img: 'https://images.unsplash.com/photo-1557683311-eac922347aa1?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'f16', category: '사주', title: '나의 행운 보석 타로', desc: '당신의 기운을 보호하고 운을 상승시켜 줄 운명의 보석을 알려드립니다.', thumb: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '지금 끌리는 보석의 색깔은?', options: [{ text: '강렬한 레드나 핫핑크', type: 'A' }, { text: '청량한 블루나 에메랄드', type: 'B' }] },
            { q: '당신이 가장 선호하는 금속 재질은?', options: [{ text: '고급스러운 골드', type: 'A' }, { text: '깨끗한 실버/백금', type: 'B' }] },
            { q: '보석을 착용한다면 어느 부위에?', options: [{ text: '눈에 띄는 목걸이나 귀걸이', type: 'A' }, { text: '나만 볼 수 있는 팔찌나 반지', type: 'B' }] },
            { q: '당신이 보석을 좋아하는 이유는?', options: [{ text: '변치 않는 가치와 상징성', type: 'A' }, { text: '아름다움과 심리적 만족감', type: 'B' }] },
            { q: '선물을 받는다면 어떤 보석이?', options: [{ text: '화려하고 큰 다이아몬드', type: 'A' }, { text: '은은하고 묘한 진주나 탄생석', type: 'B' }] },
            { q: '지금 당신의 에너지를 광물에 비유하면?', options: [{ text: '단단하고 강한 원석', type: 'A' }, { text: '부드럽고 매끄러운 가공석', type: 'B' }] },
            { q: '보석의 힘(기운)을 믿으시나요?', options: [{ text: '그렇다, 특별한 기운이 있다', type: 'A' }, { text: '아니다, 그냥 예쁜 장식품이다', type: 'B' }] }
        ],
        results: {
            A: { title: '열정의 루비 (Ruby)', desc: '당신에게는 활력과 용기를 주는 루비가 행운의 보석입니다. 붉은 기운이 당신의 대인관계운과 성공운을 강력하게 밀어줄 것입니다.', img: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=500&q=60' },
            B: { title: '지혜의 사파이어 (Sapphire)', desc: '당신에게는 평화와 지혜를 주는 사파이어가 최고의 파트너입니다. 푸른 기운이 당신의 복잡한 머릿속을 맑게 하고 올바른 판단을 돕습니다.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'f17', category: '사주', title: '오늘의 수호 메시지 타로', desc: '당신의 수호천사가 전하는 오늘의 특별한 경고와 조언을 확인하세요.', thumb: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '지금 당신의 등 뒤에 무엇이 느껴지나요?', options: [{ text: '따뜻한 온기', type: 'A' }, { text: '신선한 바람', type: 'B' }] },
            { q: '오늘 하루, 가장 조심해야 할 것은?', options: [{ text: '말실수와 구설수', type: 'A' }, { text: '충동적인 소비와 지출', type: 'B' }] },
            { q: '지금 당장 실천해야 할 행운의 행동은?', options: [{ text: '주변 정리정돈하기', type: 'A' }, { text: '소중한 사람에게 연락하기', type: 'B' }] },
            { q: '수호천사의 날개 색깔은 무엇일까요?', options: [{ text: '눈부신 하얀색', type: 'A' }, { text: '신비로운 금색', type: 'B' }] },
            { q: '당신이 가장 힘들 때 듣고 싶은 말은?', options: [{ text: '"충분히 잘하고 있어"', type: 'A' }, { text: '"걱정 마, 다 잘 될 거야"', type: 'B' }] },
            { q: '오늘 당신의 행운 아이템은?', options: [{ text: '거울이나 안경', type: 'A' }, { text: '이어폰이나 책', type: 'B' }] },
            { q: '천사가 당신에게 준 오늘의 미션은?', options: [{ text: '3번 이상 크게 웃기', type: 'A' }, { text: '10분 이상 명상하기', type: 'B' }] }
        ],
        results: {
            A: { title: '보호의 날개 (Protection)', desc: '오늘은 당신을 향한 부정적인 기운이 차단되는 날입니다. 안심하고 당신의 계획대로 밀고 나가세요. 수호천사가 든든히 지켜주고 있습니다.', img: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=500&q=60' },
            B: { title: '인도의 빛 (Guidance)', desc: '오늘은 새로운 길을 찾는 영감을 얻게 되는 날입니다. 평소와 다른 선택을 해보세요. 수호천사가 당신을 더 나은 방향으로 인도하고 있습니다.', img: 'https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'f18', category: '사주', title: '나의 타고난 인연운 그릇', desc: '당신이 평생 만날 인연들의 특징과 귀인을 알아보는 시간입니다.', thumb: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '사람을 처음 볼 때 가장 먼저 보는 곳은?', options: [{ text: '전체적인 태도와 매너', type: 'A' }, { text: '목소리와 대화 스타일', type: 'B' }] },
            { q: '나에게 더 힘을 주는 인연은?', options: [{ text: '냉철하게 조언해주는 동료', type: 'A' }, { text: '무조건 내 편이 되어주는 친구', type: 'B' }] },
            { q: '악연을 만났을 때 당신의 대처는?', options: [{ text: '즉시 거리를 두고 차단한다', type: 'A' }, { text: '좋게 풀려고 끝까지 노력한다', type: 'B' }] },
            { q: '당신은 인맥 넓히기를 좋아하나요?', options: [{ text: '다양한 사람을 만나는 게 즐겁다', type: 'A' }, { text: '깊고 좁은 관계가 더 편하다', type: 'B' }] },
            { q: '인연운을 높여주는 당신의 매력은?', options: [{ text: '신뢰감과 책임감', type: 'A' }, { text: '다정함과 유머 감각', type: 'B' }] },
            { q: '가장 기억에 남는 고마운 사람은?', options: [{ text: '나를 성장시켜준 엄격한 스승', type: 'A' }, { text: '나를 믿어준 따뜻한 가족/친구', type: 'B' }] },
            { q: '운명적인 만남을 믿으시나요?', options: [{ text: '그렇다, 만날 사람은 꼭 만난다', type: 'A' }, { text: '아니다, 인연도 노력으로 만든다', type: 'B' }] }
        ],
        results: {
            A: { title: '성공을 돕는 전략적 인연운', desc: '당신은 사회적인 성취를 함께 이뤄갈 인맥을 얻는 운을 타고났습니다. 공적인 자리에서 만나는 사람들이 당신의 인생을 크게 바꿔줄 것입니다.', img: 'https://images.unsplash.com/photo-1507679799987-c7377ec486e8?auto=format&fit=crop&w=500&q=60' },
            B: { title: '마음을 채우는 정서적 인연운', desc: '당신은 언제든 기댈 수 있는 따뜻한 사람들을 곁에 두는 복을 타고났습니다. 돈으로 살 수 없는 진실한 유대감이 당신의 인생을 풍요롭게 합니다.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'f19', category: '사주', title: '인생 후반전 성공운', desc: '당신의 인생 중기 이후부터 펼쳐질 놀라운 성공의 지도를 그려드립니다.', thumb: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '나이가 드는 것에 대한 당신의 생각은?', options: [{ text: '경험이 쌓여 노련해지는 즐거운 과정', type: 'A' }, { text: '체력이 떨어지고 열정이 식을까 봐 걱정', type: 'B' }] },
            { q: '지금 하고 있는 일의 전망은?', options: [{ text: '시간이 흐를수록 빛을 발할 전문직', type: 'A' }, { text: '언제든 새로운 시작이 가능한 유연한 일', type: 'B' }] },
            { q: '당신의 노후 준비 상태는?', options: [{ text: '이미 차근차근 계획대로 진행 중', type: 'A' }, { text: '이제 막 관심을 갖고 시작하는 단계', type: 'B' }] },
            { q: '인생 후반전에 가장 얻고 싶은 것은?', options: [{ text: '사회적인 명성과 지위', type: 'A' }, { text: '안정적인 부와 여유로운 시간', type: 'B' }] },
            { q: '은퇴 후 당신이 살고 싶은 곳은?', options: [{ text: '편의시설 가득한 세련된 도심', type: 'A' }, { text: '자연과 함께하는 아늑한 전원', type: 'B' }] },
            { q: '당신은 배움을 멈추지 않나요?', options: [{ text: '평생 새로운 것을 배우고 싶다', type: 'A' }, { text: '어느 정도 이루면 편히 쉬고 싶다', type: 'B' }] },
            { q: '마지막에 당신이 남기고 싶은 것은?', options: [{ text: '나의 이름과 업적', type: 'A' }, { text: '내가 사랑한 사람들과의 추억', type: 'B' }] }
        ],
        results: {
            A: { title: '찬란한 황금기, 대기만성의 운명', desc: '당신의 인생은 후반으로 갈수록 정점에 도달합니다. 젊은 시절의 고생이 큰 자산이 되어 누구보다 존경받고 풍요로운 노후를 보내게 될 것입니다.', img: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=500&q=60' },
            B: { title: '평온한 안식처, 행복한 노후의 운명', desc: '당신의 인생은 후반으로 갈수록 평화와 안정을 찾게 됩니다. 큰 굴곡 없이 소중한 사람들과 함께 소소한 행복을 누리는 가장 이상적인 삶을 살게 될 것입니다.', img: 'https://images.unsplash.com/photo-1499209974431-9dac3e5d9774?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'f20', category: '사주', title: '인생 최종 운명 보고서', desc: '당신의 사주 팔자가 그리는 인생 전체의 커다란 흐름을 요약해드립니다.', thumb: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '인생은 "마라톤"일까요, "단거리 질주"일까요?', options: [{ text: '긴 호흡으로 멀리 가는 마라톤', type: 'A' }, { text: '순간의 폭발력으로 승부하는 단거리', type: 'B' }] },
            { q: '당신이 가장 후회하는 것은?', options: [{ text: '시도하지 않았던 일들', type: 'A' }, { text: '잘못된 선택을 했던 일들', type: 'B' }] },
            { q: '인생의 중반기를 지나고 있다면 당신의 기분은?', options: [{ text: '이제 진짜 시작이다! 기대감', type: 'A' }, { text: '지금까지 잘 버텼다... 안도감', type: 'B' }] },
            { q: '당신이 믿는 사후 세계의 모습은?', options: [{ text: '새로운 삶으로의 환생', type: 'A' }, { text: '영원한 안식과 평화', type: 'B' }] },
            { q: '인생에서 가장 큰 자산은 무엇인가요?', options: [{ text: '내가 이뤄낸 성취와 경험', type: 'A' }, { text: '나를 사랑해준 소중한 사람들', type: 'B' }] },
            { q: '당신은 운명을 바꿀 수 있다고 믿나요?', options: [{ text: '노력으로 얼마든지 개척 가능하다', type: 'A' }, { text: '큰 틀은 정해져 있다고 생각한다', type: 'B' }] },
            { q: '마지막에 웃는 자가 누구라고 생각하나요?', options: [{ text: '포기하지 않고 끝까지 간 사람', type: 'A' }, { text: '매 순간 행복을 만끽한 사람', type: 'B' }] }
        ],
        results: {
            A: { title: '대기만성, 황금빛 노년의 운명', desc: '당신의 인생은 시간이 갈수록 더욱 빛나게 될 것입니다. 초년의 고생은 모두 밑거름이 되어, 노년에는 누구보다 풍요롭고 명예로운 삶을 누릴 것입니다.', img: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=500&q=60' },
            B: { title: '화려한 비상, 전성기의 주인공', desc: '당신의 인생은 드라마틱한 성공과 화려한 전성기를 품고 있습니다. 당신의 재능이 꽃피는 순간, 세상은 당신의 발아래에 있게 될 것입니다.', img: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=500&q=60' }
        }
    },
    // --- 재미/심리 Tests (15) ---
    {
        id: 'p21', category: '재미', title: '나의 빌런 유형 DNA', desc: '영화나 드라마 속 빌런이 된다면 당신은 어떤 스타일일까요?', thumb: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '계획이 틀어졌을 때 당신의 반응은?', options: [{ text: '침착하게 새로운 플랜B를 가동한다', type: 'A' }, { text: '분노를 참지 못하고 모두 부숴버린다', type: 'B' }] },
            { q: '당신이 빌런이 된 동기는?', options: [{ text: '세상의 불공평함을 바로잡기 위해', type: 'A' }, { text: '그냥 나의 순수한 욕망과 재미를 위해', type: 'B' }] },
            { q: '당신의 비밀 기지는 어디인가요?', options: [{ text: '최첨단 설비를 갖춘 도심 고층 빌딩', type: 'A' }, { text: '아무도 모르는 깊은 산속 지하 동굴', type: 'B' }] },
            { q: '히어로를 만났을 때 당신의 행동은?', options: [{ text: '여유롭게 대화하며 자신의 철학을 설파한다', type: 'A' }, { text: '묻지도 따지지도 않고 선제공격한다', type: 'B' }] },
            { q: '동료가 배신했다는 소식을 듣는다면?', options: [{ text: '철저하게 역이용하여 대가를 치르게 한다', type: 'A' }, { text: '직접 찾아가 본때를 보여준다', type: 'B' }] },
            { q: '당신을 상징하는 시그니처 아이템은?', options: [{ text: '세련된 정장과 차가운 안경', type: 'A' }, { text: '화려한 마스크와 정체불명의 무기', type: 'B' }] },
            { q: '마지막 순간, 당신의 최후는?', options: [{ text: '다음 시즌을 기약하며 유유히 사라진다', type: 'A' }, { text: '화끈하게 모든 걸 불태우며 폭주한다', type: 'B' }] }
        ],
        results: {
            A: { title: '냉철한 천재 전략가형 빌런', desc: '당신은 지능적이고 치밀한 계획으로 세상을 뒤흔드는 타입입니다. 말 한마디로 사람들을 조종하는 카리스마를 가졌습니다.', img: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=500&q=60' },
            B: { title: '예측불허 광기 본능형 빌런', desc: '당신은 본능에 충실하고 파괴적인 에너지를 지닌 타입입니다. 어디로 튈지 모르는 당신의 행동이 히어로를 가장 당황하게 만듭니다.', img: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'p22', category: '재미', title: '좀비 아포칼립스 생존 전략', desc: '좀비 세상이 온다면 당신은 끝까지 살아남을 수 있을까요?', thumb: 'https://images.unsplash.com/photo-1531911082206-323b922f2432?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '뉴스에서 좀비 발생 소식을 봤을 때 가장 먼저 하는 일은?', options: [{ text: '생존 물품을 챙겨 안전한 곳으로 숨는다', type: 'A' }, { text: '무기를 찾아 밖으로 나가 동태를 살핀다', type: 'B' }] },
            { q: '최고의 생존 파트너를 고른다면?', options: [{ text: '지식이 풍부한 브레인 친구', type: 'A' }, { text: '싸움 실력이 뛰어난 무술가 친구', type: 'B' }] },
            { q: '은신처에 모르는 생존자가 문을 두드린다면?', options: [{ text: '함께 힘을 합치기 위해 들여보내 준다', type: 'A' }, { text: '위험 요소가 될 수 있으니 무시한다', type: 'B' }] },
            { q: '식량이 얼마 남지 않았을 때 당신의 선택은?', options: [{ text: '계획을 세워 조금씩 나눠 먹는다', type: 'A' }, { text: '위험을 무릅쓰고 마트로 파밍을 나간다', type: 'B' }] },
            { q: '좀비 떼가 들이닥친 절체절명의 순간!', options: [{ text: '미리 준비한 트랩을 가동한다', type: 'A' }, { text: '수단과 방법을 가리지 않고 돌파한다', type: 'B' }] },
            { q: '당신이 가장 의지하는 도구는?', options: [{ text: '지도와 나침반, 그리고 통신 기기', type: 'A' }, { text: '튼튼한 배트나 날카로운 칼', type: 'B' }] },
            { q: '마지막 인류의 희망이 당신에게 달렸다면?', options: [{ text: '사명감을 가지고 백신을 찾아 나선다', type: 'A' }, { text: '나와 내 사람들의 생존만 챙긴다', type: 'B' }] }
        ],
        results: {
            A: { title: '지혜로운 브레인 생존자', desc: '당신은 치밀한 분석과 준비성으로 살아남는 타입입니다. 위기 상황에서도 이성을 잃지 않고 최선의 길을 찾아냅니다.', img: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=500&q=60' },
            B: { title: '강인한 전투형 전사 생존자', desc: '당신은 타고난 신체 능력과 순발력으로 좀비들을 제압하는 타입입니다. 당신의 용감함이 그룹의 희망이 됩니다.', img: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80' }
        }
    },
    {
        id: 'p23', category: '재미', title: '나의 술버릇 MBTI', desc: '술기운에 드러나는 당신의 진짜 속마음과 행동 패턴을 분석합니다.', thumb: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '술자리가 시작될 때 당신의 포지션은?', options: [{ text: '열심히 안주를 챙기고 술을 따른다', type: 'A' }, { text: '이미 텐션이 올라가 수다를 떨고 있다', type: 'B' }] },
            { q: '취기가 살짝 오르면 어떤 변화가 생기나요?', options: [{ text: '말수가 적어지고 진지해진다', type: 'A' }, { text: '웃음이 많아지고 애교가 늘어난다', type: 'B' }] },
            { q: '좋아하는 사람과 술을 마신다면?', options: [{ text: '실수하지 않으려 정신을 바짝 차린다', type: 'A' }, { text: '은근슬쩍 플러팅을 하며 직진한다', type: 'B' }] },
            { q: '기억이 끊길 정도로 마신 적이 있나요?', options: [{ text: '거의 없다, 자기 절제가 강한 편이다', type: 'A' }, { text: '가끔 있다, 그럴 땐 세상이 즐겁다', type: 'B' }] },
            { q: '술자리 중간에 사라진다면 당신은 어디에?', options: [{ text: '몰래 편의점에 가서 아이스크림 사 오는 중', type: 'A' }, { text: '화장실 거울 보며 춤추거나 수다 떠는 중', type: 'B' }] },
            { q: '다음 날 숙취 해소 방법은?', options: [{ text: '조용히 해장국 먹고 하루 종일 잠자기', type: 'A' }, { text: '친구들에게 어제 무슨 일 있었냐고 카톡 하기', type: 'B' }] },
            { q: '당신에게 술이란 어떤 의미인가요?', options: [{ text: '진솔한 대화를 위한 매개체', type: 'A' }, { text: '지루한 일상을 깨는 파티 타임', type: 'B' }] }
        ],
        results: {
            A: { title: '진중한 선비형 술고래', desc: '취해도 흐트러짐이 없는 당신! 술기운을 빌려 평소 못다 한 진심을 전하는 따뜻한 분입니다.', img: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=500&q=60' },
            B: { title: '활발한 골든 리트리버형', desc: '술만 마시면 텐션 폭발! 모든 사람과 친구가 되는 당신은 술자리의 진정한 주인공입니다.', img: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'p24', category: '재미', title: '나의 마음 냉장고 테스트', desc: '당신의 마음속에는 어떤 것들이 차곡차곡 쌓여있을까요?', thumb: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '냉장고 문을 열었을 때 가장 먼저 보이는 것은?', options: [{ text: '가지런히 정리된 반찬과 식재료', type: 'A' }, { text: '먹다 남은 피자와 각종 소스들', type: 'B' }] },
            { q: '유통기한이 하루 지난 우유를 발견했다면?', options: [{ text: '찝찝하니까 바로 버린다', type: 'A' }, { text: '냄새 맡아보고 괜찮으면 그냥 먹는다', type: 'B' }] },
            { q: '냉장고에 가장 많이 채워두고 싶은 것은?', options: [{ text: '든든하고 건강한 집밥 재료', type: 'A' }, { text: '시원한 맥주와 달콤한 간식', type: 'B' }] },
            { q: '당신의 냉장고 청소 빈도는?', options: [{ text: '주기적으로 칸칸이 닦고 정리한다', type: 'A' }, { text: '냄새가 나거나 꽉 찼을 때 몰아서 한다', type: 'B' }] },
            { q: '남이 내 냉장고를 열어본다면?', options: [{ text: '자신 있게 보여줄 수 있다', type: 'A' }, { text: '절대 사수! 부끄러워서 막는다', type: 'B' }] },
            { q: '냉장고 조명이 갑자기 나갔다면?', options: [{ text: '바로 서비스 센터에 전화하거나 고친다', type: 'A' }, { text: '핸드폰 플래시 켜고 대충 쓴다', type: 'B' }] },
            { q: '냉장고 칸 하나를 통째로 비울 수 있다면 무엇으로?', options: [{ text: '나의 미래를 위한 공부 자료', type: 'A' }, { text: '가보고 싶은 여행지 티켓들', type: 'B' }] }
        ],
        results: {
            A: { title: '깔끔한 냉동실, 원칙주의형', desc: '당신의 마음은 정돈되어 있고 확실한 기준이 있습니다. 스스로를 잘 관리하는 성실한 분입니다.', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=500&q=60' },
            B: { title: '풍성한 야채실, 감성충만형', desc: '당신의 마음은 따뜻한 정과 추억들로 가득 차 있습니다. 자유분방하고 포근한 매력을 가진 분입니다.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80' }
        }
    },
    {
        id: 'p25', category: '재미', title: '나의 인생 장르 분석', desc: '당신의 삶을 영화로 만든다면 어떤 장르가 가장 잘 어울릴까요?', thumb: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '오늘 아침, 당신의 오프닝 장면은?', options: [{ text: '알람 소리에 벌떡 일어나 운동하는 장면', type: 'A' }, { text: '따스한 햇살을 받으며 커피를 마시는 장면', type: 'B' }] },
            { q: '인생의 위기 순간, 어떤 음악이 깔릴까요?', options: [{ text: '비장하고 웅장한 오케스트라', type: 'A' }, { text: '긴박하고 통통 튀는 재즈 비트', type: 'B' }] },
            { q: '당신이 가장 많이 하는 대사는?', options: [{ text: '"할 수 있어! 끝까지 가보자"', type: 'A' }, { text: '"재밌겠다! 일단 해보지 뭐"', type: 'B' }] },
            { q: '당신의 라이벌은 어떤 존재인가요?', options: [{ text: '넘어서야 할 강력한 적수', type: 'A' }, { text: '서로 티격태격하며 정드는 친구', type: 'B' }] },
            { q: '하이라이트 장면의 장소는?', options: [{ text: '수많은 관중이 환호하는 경기장', type: 'A' }, { text: '아름다운 노을이 지는 해변가', type: 'B' }] },
            { q: '결말 부분에서 당신의 모습은?', options: [{ text: '최고의 자리에 올라 성공한 모습', type: 'A' }, { text: '사랑하는 이들과 크게 웃는 모습', type: 'B' }] },
            { q: '관객들에게 남기고 싶은 한마디는?', options: [{ text: '"당신도 승리할 수 있습니다"', type: 'A' }, { text: '"인생은 정말 아름다운 여행이에요"', type: 'B' }] }
        ],
        results: {
            A: { title: '가슴 웅장해지는 휴먼 드라마', desc: '당신은 목표를 향해 나아가는 멋진 주인공입니다. 당신의 끈기와 열정이 많은 이들에게 감동을 줍니다.', img: 'https://images.unsplash.com/photo-1507679799987-c7377ec486e8?auto=format&fit=crop&w=500&q=60' },
            B: { title: '유쾌 발랄 판타지 코미디', desc: '당신의 인생은 즐거움과 신비함으로 가득 차 있습니다. 긍정적인 마인드가 당신을 최고의 인기 캐릭터로 만듭니다.', img: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=500&q=60' }
        }
    },
    {
        id: 'p26', category: '재미', title: '나의 멘탈 MBTI 테스트', desc: '유리 멘탈일까, 강철 멘탈일까? 당신의 정신적 맷집을 측정합니다.', thumb: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '인터넷에 올린 글에 악플이 달렸다면?', options: [{ text: '논리적으로 반박하거나 즉시 신고한다', type: 'A' }, { text: '하루 종일 속상해서 자꾸 확인한다', type: 'B' }] },
            { q: '시험 점수가 기대보다 낮게 나왔을 때?', options: [{ text: '어디서 틀렸는지 분석하고 다음을 기약한다', type: 'A' }, { text: '나의 지능과 미래에 대해 깊은 절망에 빠진다', type: 'B' }] },
            { q: '무서운 놀이기구를 탈 때 당신의 반응은?', options: [{ text: '스릴을 만끽하며 소리 지르고 즐긴다', type: 'A' }, { text: '눈을 꼭 감고 제발 빨리 끝나기를 빈다', type: 'B' }] },
            { q: '낯선 사람들과의 저녁 식사 자리는?', options: [{ text: '새로운 인맥을 쌓을 즐거운 기회다', type: 'A' }, { text: '무슨 말을 해야 할지 몰라 기가 빨린다', type: 'B' }] },
            { q: '갑작스러운 업무 지시가 퇴근 10분 전에!', options: [{ text: '화가 나지만 신속하게 처리하고 퇴근한다', type: 'A' }, { text: '억울함에 눈물이 핑 돌고 멘붕이 온다', type: 'B' }] },
            { q: '나를 향한 비난 섞인 조언을 들으면?', options: [{ text: '틀린 말 없네 하고 쿨하게 넘긴다', type: 'A' }, { text: '그 사람의 말투와 표정까지 계속 떠오른다', type: 'B' }] },
            { q: '멘탈을 회복하는 가장 좋은 방법은?', options: [{ text: '땀 흘리며 운동하거나 취미에 몰두하기', type: 'A' }, { text: '이불 속에 들어가서 푹 자거나 울기', type: 'B' }] }
        ],
        results: {
            A: { title: '불사조 강철 멘탈', desc: '당신은 어떤 시련에도 굴하지 않는 단단한 마음을 가졌습니다. 위기를 기회로 바꾸는 능력이 탁월합니다.', img: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80' },
            B: { title: '섬세한 유리알 감성', desc: '당신은 매우 섬세하고 예민한 감각을 지녔습니다. 때로는 힘들 수 있지만 그만큼 공감 능력이 뛰어난 따뜻한 분입니다.', img: 'https://images.unsplash.com/photo-1516589174184-c68d8e5fcc4a?auto=format&fit=crop&w=800&q=80' }
        }
    },
    {
        id: 'p27', category: '재미', title: '나의 쇼핑 중독 유형', desc: '영수증이 말해주는 당신의 성격과 미래 자산 상태를 분석합니다.', thumb: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '쇼핑몰에 들어갔을 때 당신의 동선은?', options: [{ text: '필요한 물건이 있는 곳으로 바로 직진한다', type: 'A' }, { text: '1층부터 꼭대기까지 하나씩 다 둘러본다', type: 'B' }] },
            { q: '"한정 판매", "마지막 수량" 문구를 본다면?', options: [{ text: '상술인 걸 아니까 덤덤하게 지나친다', type: 'A' }, { text: '지금 안 사면 평생 후회할 것 같아 결제한다', type: 'B' }] },
            { q: '장바구니에 담아둔 물건은 몇 개인가요?', options: [{ text: '3개 미만, 정말 살 것만 담아둔다', type: 'A' }, { text: '10개 이상, 일단 마음에 들면 다 담는다', type: 'B' }] },
            { q: '스트레스를 받았을 때 당신의 해소법은?', options: [{ text: '맛있는 걸 먹거나 잠을 자며 푼다', type: 'A' }, { text: '온라인 쇼핑몰 앱을 켜고 아이쇼핑을 한다', type: 'B' }] },
            { q: '물건을 사고 나서 후회한 적이 있나요?', options: [{ text: '거의 없다, 신중하게 고르기 때문이다', type: 'A' }, { text: '자주 있다, 택배 박스 뜯을 때가 제일 설렌다', type: 'B' }] },
            { q: '당신의 통장 잔고를 확인하는 주기는?', options: [{ text: '매일 혹은 결제할 때마다 꼼꼼히 확인한다', type: 'A' }, { text: '월급날이나 카드값 나가는 날에만 본다', type: 'B' }] },
            { q: '나에게 쇼핑이란 무엇인가요?', options: [{ text: '생존을 위한 필수적인 수단', type: 'A' }, { text: '삶의 활력을 주는 소중한 행복', type: 'B' }] }
        ],
        results: {
            A: { title: '철저한 계획 소비의 마법사', desc: '당신은 경제 관념이 뚜렷하고 이성적인 소비자입니다. 불필요한 낭비를 지양하며 내실을 다지는 스타일입니다.', img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=500&q=60' },
            B: { title: '지름신이 강림한 플렉스왕', desc: '당신은 현재의 행복을 위해 아낌없이 투자하는 타입입니다. 시원시원한 성격이 매력적이지만 가끔은 통장을 살펴주세요!', img: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=800&q=80' }
        }
    },
    {
        id: 'p28', category: '재미', title: '나의 연애 세포 생존기', desc: '당신의 연애 세포는 지금 활발하게 활동 중일까요?', thumb: 'https://images.unsplash.com/photo-1518199266791-bd373292e90c?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '설레는 로맨스 드라마를 볼 때 당신의 반응은?', options: [{ text: '나도 저런 사랑을 하고 싶다며 몰입한다', type: 'A' }, { text: '현실은 저렇지 않다며 팩트 체크를 한다', type: 'B' }] },
            { q: '마음에 드는 이성이 나타난다면?', options: [{ text: '어떻게든 접점을 만들어 다가가려 노력한다', type: 'A' }, { text: '멀리서 지켜보다가 혼자 마음을 정리한다', type: 'B' }] },
            { q: '소개팅 제안이 들어온다면 당신의 선택은?', options: [{ text: '설레는 마음으로 프로필을 확인한다', type: 'A' }, { text: '만나기까지의 과정이 귀찮아서 거절한다', type: 'B' }] },
            { q: '최근 당신의 카톡 테마나 프로필 사진은?', options: [{ text: '화사하고 예쁜 감성적인 사진', type: 'A' }, { text: '기본 이미지거나 아무런 변화가 없음', type: 'B' }] },
            { q: '길에서 커플들이 다정하게 걷는 것을 보면?', options: [{ text: '보기 좋다며 흐뭇하게 미소 짓는다', type: 'A' }, { text: '아무 생각 없거나 빨리 지나가고 싶다', type: 'B' }] },
            { q: '나만의 시간을 보낼 때 당신의 기분은?', options: [{ text: '즐겁지만 가끔은 누군가 옆에 있으면 좋겠다', type: 'A' }, { text: '완벽하다! 누구의 간섭도 없는 지금이 최고다', type: 'B' }] },
            { q: '연애 세포에게 한마디 한다면?', options: [{ text: '"제발 깨어나서 열일해줘!"', type: 'A' }, { text: '"당분간은 더 자도 괜찮아"', type: 'B' }] }
        ],
        results: {
            A: { title: '심장 박동 100%, 핑크빛 설렘주의보', desc: '당신의 연애 세포는 현재 매우 건강하고 활발합니다! 곧 다가올 인연을 맞이할 준비가 완벽하게 되어 있네요.', img: 'https://images.unsplash.com/photo-1511733849282-589d29dad210?auto=format&fit=crop&w=800&q=80' },
            B: { title: '무기한 휴면 상태, 철벽 방어 중', desc: '현재 연애보다 자신만의 시간이 더 소중한 상태군요. 조급해하지 마세요. 당신이 원할 때 세포들은 다시 깨어날 거예요.', img: 'https://images.unsplash.com/photo-1516589174184-c68d8e5fcc4a?auto=format&fit=crop&w=800&q=80' }
        }
    },
    {
        id: 'p29', category: '재미', title: '나의 맛집 탐험대 지수', desc: '음식을 대하는 당신의 열정과 미식가로서의 자질을 테스트합니다.', thumb: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '유명 맛집 줄이 1시간 이상이라면?', options: [{ text: '맛있는 걸 먹기 위해서라면 기꺼이 기다린다', type: 'A' }, { text: '기다리는 건 시간 낭비, 옆집으로 간다', type: 'B' }] },
            { q: '음식이 나오자마자 당신이 하는 일은?', options: [{ text: '최적의 각도로 사진을 찍어 기록한다', type: 'A' }, { text: '따끈할 때 바로 한 입 크게 먹는다', type: 'B' }] },
            { q: '새로운 낯선 메뉴에 대한 당신의 태도는?', options: [{ text: '이곳만의 특별한 맛일 테니 도전해본다', type: 'A' }, { text: '실패하고 싶지 않아 아는 맛을 고른다', type: 'B' }] },
            { q: '당신만의 숨겨진 단골 맛집이 있나요?', options: [{ text: '리스트로 정리해두고 친구들에게 추천한다', type: 'A' }, { text: '나만 알고 싶어서 절대 비밀로 한다', type: 'B' }] },
            { q: '음식 맛에서 가장 중요하게 생각하는 것은?', options: [{ text: '재료 본연의 맛과 깊은 풍미', type: 'A' }, { text: '중독성 있는 강력한 양념 맛', type: 'B' }] },
            { q: '멀리 떨어진 곳까지 맛집 원정을 가나요?', options: [{ text: '그 맛을 위해서라면 전국 어디든 간다', type: 'A' }, { text: '집 근처에서 대충 해결하는 게 편하다', type: 'B' }] },
            { q: '오늘 점심 메뉴를 고르는 당신의 방식은?', options: [{ text: '전날부터 미리 정해두고 기대한다', type: 'A' }, { text: '배고플 때 눈에 띄는 곳으로 들어간다', type: 'B' }] }
        ],
        results: {
            A: { title: '미슐랭 뺨치는 미식 탐험가', desc: '당신은 음식을 예술로 즐길 줄 아는 진정한 미식가입니다. 당신의 추천은 모두가 믿고 따라갑니다.', img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80' },
            B: { title: '효율 중시 실속파 먹보', desc: '음식은 맛있으면 장땡! 복잡한 것보다 편안하고 든든한 한 끼를 선호하는 소박하고 정겨운 분입니다.', img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80' }
        }
    },
    {
        id: 'p30', category: '재미', title: '나의 스트레스 동물 찾기', desc: '스트레스받을 때 당신의 모습은 어떤 동물과 닮았을까요?', thumb: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '화가 머리끝까지 났을 때 당신은?', options: [{ text: '큰 소리로 따지거나 불만을 표출한다', type: 'A' }, { text: '입을 꾹 다물고 혼자만의 동굴로 들어간다', type: 'B' }] },
            { q: '갑자기 많은 일감이 쏟아진다면?', options: [{ text: '우선순위를 정해 미친 듯이 처리한다', type: 'A' }, { text: '일단 멍하니 있다가 현실을 부정한다', type: 'B' }] },
            { q: '누군가 나를 계속 귀찮게 한다면?', options: [{ text: '단호하게 거절 의사를 밝힌다', type: 'A' }, { text: '싫은 내색 못 하고 끙끙 앓는다', type: 'B' }] },
            { q: '가장 편안함을 느끼는 자세는?', options: [{ text: '대자로 뻗어 누운 당당한 자세', type: 'A' }, { text: '몸을 웅크린 포근한 자세', type: 'B' }] },
            { q: '스트레스를 풀기 위한 최고의 안주는?', options: [{ text: '씹는 맛이 일품인 매콤한 닭발', type: 'A' }, { text: '부드럽고 달콤한 케이크', type: 'B' }] },
            { q: '어려운 고민이 있을 때 당신의 행동은?', options: [{ text: '친구들을 불러 수다 떨며 잊는다', type: 'A' }, { text: '혼자 밤새 고민하며 해결책을 찾는다', type: 'B' }] },
            { q: '지금 당신의 에너지는 어떤 상태인가요?', options: [{ text: '금방이라도 폭발할 것 같은 화산', type: 'A' }, { text: '서서히 말라가는 작은 샘물', type: 'B' }] }
        ],
        results: {
            A: { title: '포효하는 용맹한 사자', desc: '스트레스 상황에서 정면 돌파를 선택하는 당신! 강한 추진력으로 위기를 극복하는 멋진 리더 타입입니다.', img: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80' },
            B: { title: '웅크린 귀여운 고슴도치', desc: '힘들 땐 자신을 보호하며 시간을 갖는 당신! 섬세하고 조심스러운 성격이 매력적인 평화주의자입니다.', img: 'https://images.unsplash.com/photo-1503777119540-ce54b422baff?auto=format&fit=crop&w=800&q=80' }
        }
    },
    {
        id: 'p31', category: '재미', title: '나의 인생 영화 장르', desc: '당신의 삶을 영화로 만든다면 어떤 장르가 어울릴까요?', thumb: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '당신이 가장 좋아하는 배경은?', options: [{ text: '최첨단 도시의 화려한 야경', type: 'A' }, { text: '푸른 숲속의 고요한 오두막', type: 'B' }] },
            { q: '영화 속 당신의 의상은?', options: [{ text: '카리스마 넘치는 블랙 가죽 자켓', type: 'A' }, { text: '포근하고 화사한 니트 원피스/셔츠', type: 'B' }] },
            { q: '인생의 교훈을 한 문장으로 한다면?', options: [{ text: '"강한 자가 살아남는 것이다"', type: 'A' }, { text: '"사랑이 세상을 구원할 것이다"', type: 'B' }] },
            { q: '당신의 절친 역할은 누구?', options: [{ text: '말보다 행동이 빠른 열혈 파트너', type: 'A' }, { text: '언제나 곁을 지켜주는 다정한 소울메이트', type: 'B' }] },
            { q: '영화의 클라이맥스 장면은?', options: [{ text: '거대한 폭발 속에서 살아남는 장면', type: 'A' }, { text: '비 내리는 창밖을 보며 미소 짓는 장면', type: 'B' }] },
            { q: '관객들이 당신에게 기대하는 것은?', options: [{ text: '손에 땀을 쥐게 하는 통쾌한 복수', type: 'A' }, { text: '가슴 뭉클해지는 따뜻한 위로', type: 'B' }] },
            { q: '영화가 끝나고 엔딩 크레딧 곡은?', options: [{ text: '강렬한 록 음악이나 웅장한 OST', type: 'A' }, { text: '잔잔한 어쿠스틱 발라드', type: 'B' }] }
        ],
        results: {
            A: { title: '스펙터클 액션 블록버스터', desc: '당신은 인생의 모든 역경을 시원하게 뚫고 나가는 주인공입니다! 박진감 넘치는 삶이 당신을 기다립니다.', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80' },
            B: { title: '서정적인 멜로 판타지', desc: '당신의 삶은 한 편의 시처럼 아름답고 신비롭습니다. 주변 사람들에게 따뜻한 감동을 주는 소중한 존재입니다.', img: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=800&q=80' }
        }
    },
    {
        id: 'p32', category: '재미', title: '나의 워라밸 지수 테스트', desc: '당신은 일과 삶 중 어디에 더 무게를 두고 있나요?', thumb: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '퇴근 후 집에서도 업무 연락을 확인하나요?', options: [{ text: '당연하다, 확인해야 마음이 편하다', type: 'A' }, { text: '절대 금지! 업무 모드는 꺼둔다', type: 'B' }] },
            { q: '주말에 아무런 계획이 없다면 당신은?', options: [{ text: '밀린 공부를 하거나 자기계발을 한다', type: 'A' }, { text: '하루 종일 침대와 한 몸이 되어 쉰다', type: 'B' }] },
            { q: '회식 자리에 대한 당신의 생각은?', options: [{ text: '사회생활의 연장선, 기꺼이 참여한다', type: 'A' }, { text: '개인 시간이 더 소중하다, 정중히 거절한다', type: 'B' }] },
            { q: '가장 받고 싶은 포상은?', options: [{ text: '높은 보너스와 승진', type: 'A' }, { text: '유급 휴가와 자유로운 시간', type: 'B' }] },
            { q: '업무 중 가장 즐거운 시간은?', options: [{ text: '프로젝트를 완벽하게 마무리했을 때', type: 'A' }, { text: '점심시간이나 커피 브레이크 타임', type: 'B' }] },
            { q: '나의 인생 가치관은?', options: [{ text: '성취와 성공이 주는 짜릿함', type: 'A' }, { text: '소소하고 확실한 일상의 행복', type: 'B' }] },
            { q: '미래의 나에게 하고 싶은 말은?', options: [{ text: '"최고의 자리까지 올라가느라 고생했어"', type: 'A' }, { text: '"여유롭게 인생을 즐기느라 고생했어"', type: 'B' }] }
        ],
        results: {
            A: { title: '열정 가득한 워커홀릭 전차', desc: '당신은 목표를 향해 달리는 질주본능이 뛰어납니다. 성취감에서 가장 큰 행복을 느끼는 타입입니다.', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80' },
            B: { title: '여유로운 삶의 낭만 항해사', desc: '당신은 삶의 진정한 의미를 알고 즐길 줄 아는 멋쟁이입니다. 마음의 평화가 당신의 가장 큰 자산입니다.', img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80' }
        }
    },
    {
        id: 'p33', category: '재미', title: '나의 수면 유형 동물 찾기', desc: '당신의 잠자는 습관으로 성격의 이면을 분석합니다.', thumb: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '잠자리에 들기 전 당신이 하는 일은?', options: [{ text: '내일 할 일을 꼼꼼히 체크한다', type: 'A' }, { text: '좋아하는 영상을 보며 멍하니 있는다', type: 'B' }] },
            { q: '아침 알람 소리를 들었을 때 반응은?', options: [{ text: '한 번에 벌떡 일어나 씻으러 간다', type: 'A' }, { text: '5분만 더... 스누즈 버튼을 연타한다', type: 'B' }] },
            { q: '잠잘 때 당신의 주된 포즈는?', options: [{ text: '반듯하게 누워 정자세로 잔다', type: 'A' }, { text: '몸을 웅크리거나 인형을 안고 잔다', type: 'B' }] },
            { q: '꿈을 얼마나 자주 꾸나요?', options: [{ text: '거의 꾸지 않거나 기억이 안 난다', type: 'A' }, { text: '매일 밤 스펙터클한 꿈을 꾼다', type: 'B' }] },
            { q: '가장 선호하는 잠옷 스타일은?', options: [{ text: '깔끔하고 단정한 면 잠옷', type: 'A' }, { text: '최대한 편안한 낡은 티셔츠', type: 'B' }] },
            { q: '낮잠에 대한 당신의 생각은?', options: [{ text: '시간 아깝다, 밤에 몰아서 자야 한다', type: 'A' }, { text: '꿀맛 같은 휴식, 틈나면 자야 한다', type: 'B' }] },
            { q: '일어났을 때 가장 먼저 드는 생각은?', options: [{ text: '오늘 하루도 활기차게 시작해보자!', type: 'A' }, { text: '벌써 아침이야? 더 자고 싶다...', type: 'B' }] }
        ],
        results: {
            A: { title: '부지런한 아침형 종달새', desc: '당신은 계획적이고 에너지가 넘치는 사람입니다! 규칙적인 생활이 당신의 성공을 돕습니다.', img: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=800&q=80' },
            B: { title: '여유로운 밤의 수호자, 부엉이', desc: '당신은 감수성이 풍부하고 밤에 창의력이 샘솟는 사람입니다! 자유로운 영혼이 당신의 매력 포인트입니다.', img: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=800&q=80' }
        }
    },
    {
        id: 'p34', category: '재미', title: '나의 여행 가방 MBTI', desc: '짐 싸는 스타일로 알아보는 당신의 핵심 성격!', thumb: 'https://images.unsplash.com/photo-1505691938895-1758d7eaa511?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '여행 일주일 전, 당신은 무엇을 하나요?', options: [{ text: '가져갈 물건 리스트를 작성한다', type: 'A' }, { text: '아무 생각 없다가 전날 밤에 챙긴다', type: 'B' }] },
            { q: '캐리어 안의 상태는 어떤가요?', options: [{ text: '파우치별로 완벽하게 분류되어 있다', type: 'A' }, { text: '일단 다 때려 넣어서 닫기 힘들 정도다', type: 'B' }] },
            { q: '비상약이나 우산 등을 꼭 챙기나요?', options: [{ text: '혹시 모르니 만반의 준비를 다 한다', type: 'A' }, { text: '필요하면 가서 사지 뭐 하고 넘긴다', type: 'B' }] },
            { q: '공항에 도착했을 때 당신의 모습은?', options: [{ text: '3시간 전 도착해서 여유를 즐긴다', type: 'A' }, { text: '간당간당하게 도착해서 전력 질주한다', type: 'B' }] },
            { q: '여행지에서 입을 옷 선택 기준은?', options: [{ text: '요일별로 코디를 미리 다 짜둔다', type: 'A' }, { text: '그날 아침 기분에 따라 골라 입는다', type: 'B' }] },
            { q: '기념품 쇼핑에 대한 당신의 태도는?', options: [{ text: '지인들에게 줄 선물을 꼼꼼히 챙긴다', type: 'A' }, { text: '귀찮아서 내 거 하나 사면 끝이다', type: 'B' }] },
            { q: '여행이 끝나고 돌아와서 짐 정리는?', options: [{ text: '오자마자 바로 다 풀어서 세탁기 돌린다', type: 'A' }, { text: '일주일 동안 캐리어가 현관에 방치된다', type: 'B' }] }
        ],
        results: {
            A: { title: '철저한 준비성의 컨트롤러', desc: '당신은 어떤 상황에서도 당황하지 않는 완벽주의자입니다. 당신의 든든함이 주변 사람들을 안심시킵니다.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80' },
            B: { title: '자유로운 영혼의 방랑자', desc: '당신은 틀에 박힌 것보다 우연의 행복을 즐기는 사람입니다. 낙천적인 성격이 당신의 삶을 다채롭게 만듭니다.', img: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=800&q=80' }
        }
    },
    {
        id: 'p35', category: '재미', title: '인생 최종 가치관 진단', desc: '당신이 삶에서 가장 소중하게 여기는 단 하나의 가치를 찾아드립니다.', thumb: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '다시 태어난다면 어떤 삶을?', options: [{ text: '역사에 이름을 남기는 위대한 삶', type: 'A' }, { text: '평범하지만 사랑 가득한 행복한 삶', type: 'B' }] },
            { q: '당신이 가장 후회하는 순간은?', options: [{ text: '성공할 기회를 놓쳤을 때', type: 'A' }, { text: '사랑하는 사람에게 상처 줬을 때', type: 'B' }] },
            { q: '돈과 명예 중 하나를 고른다면?', options: [{ text: '세상을 바꿀 수 있는 막강한 명예', type: 'A' }, { text: '현실적인 풍요를 누릴 수 있는 돈', type: 'B' }] },
            { q: '당신의 묘비명에 적고 싶은 말은?', options: [{ text: '"여기 최고의 업적을 남긴 이가 잠들다"', type: 'A' }, { text: '"여기 누구보다 뜨겁게 사랑한 이가 잠들다"', type: 'B' }] },
            { q: '인생의 가장 큰 시련이 왔을 때 당신은?', options: [{ text: '더욱 강해져서 스스로 일어선다', type: 'A' }, { text: '주변의 사랑으로 상처를 치유한다', type: 'B' }] },
            { q: '당신이 생각하는 "진정한 성공"이란?', options: [{ text: '나의 능력을 세상에 입증하는 것', type: 'A' }, { text: '내 마음의 평온을 지키는 것', type: 'B' }] },
            { q: '마지막으로 나 자신에게 해주고 싶은 말은?', options: [{ text: '"너는 정말 위대한 일을 해냈어!"', type: 'A' }, { text: '"너는 정말 충분히 사랑받을 자격이 있어"', type: 'B' }] }
        ],
        results: {
            A: { title: '찬란한 성취의 별', desc: '당신은 자아실현과 목표 달성을 통해 삶의 의미를 찾는 분입니다. 당신의 성공이 세상을 밝히는 등불이 됩니다.', img: 'https://images.unsplash.com/photo-1507679799987-c7377ec486e8?auto=format&fit=crop&w=800&q=80' },
            B: { title: '따뜻한 사랑의 안식처', desc: '당신은 관계와 정서적 충만함을 최고의 가치로 여기는 분입니다. 당신의 존재 자체가 누군가에겐 살아가는 이유입니다.', img: 'https://images.unsplash.com/photo-1516589174184-c68d8e5fcc4a?auto=format&fit=crop&w=800&q=80' }
        }
    },
    // --- Fortune Tests (15) ---
    {
        id: 'f21', category: '사주', title: '오늘의 행운 상징 타로', desc: '당신을 행운으로 이끌어줄 오늘의 특별한 상징물을 확인하세요.', thumb: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '지금 이 순간, 가장 갖고 싶은 물건은?', options: [{ text: '반짝이는 보석이나 액세서리', type: 'A' }, { text: '부드러운 질감의 인형이나 쿠션', type: 'B' }] },
            { q: '오늘 아침, 당신의 기분을 색으로 표현한다면?', options: [{ text: '정열적인 오렌지나 레드', type: 'A' }, { text: '차분한 에메랄드나 민트', type: 'B' }] },
            { q: '길을 걷다 마주친 행운의 징조는?', options: [{ text: '하늘에 뜬 일곱 빛깔 무지개', type: 'A' }, { text: '발밑에 떨어진 네 잎 클로버', type: 'B' }] },
            { q: '지금 당장 떠나고 싶은 곳의 날씨는?', options: [{ text: '햇살 가득 화창한 날씨', type: 'A' }, { text: '안개 자욱한 신비로운 날씨', type: 'B' }] },
            { q: '누군가에게 행운을 빌어준다면?', options: [{ text: '힘찬 응원의 메시지를 보낸다', type: 'A' }, { text: '조용히 기도하며 마음을 전한다', type: 'B' }] },
            { q: '오늘 당신의 걸음걸이는 어떤가요?', options: [{ text: '자신감 있게 씩씩한 발걸음', type: 'A' }, { text: '주변을 살피며 조심스러운 발걸음', type: 'B' }] },
            { q: '꿈속에서 당신은 무엇이 되고 싶나요?', options: [{ text: '세상을 비추는 밝은 별', type: 'A' }, { text: '바다를 품은 깊은 심연', type: 'B' }] }
        ],
        results: {
            A: { title: '타오르는 불꽃의 상징', desc: '오늘은 열정과 도전을 상징하는 기운이 당신과 함께합니다. 망설이지 말고 행동하세요. 당신의 에너지가 모든 것을 이룰 것입니다.', img: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=500&q=60' },
            B: { title: '은은한 달빛의 상징', desc: '오늘은 통찰과 안정을 상징하는 기운이 감도는 날입니다. 조급함보다는 침착함을 유지하면 큰 결실을 맺게 될 것입니다.', img: 'https://images.unsplash.com/photo-1499209974431-9dac3e5d9774?auto=format&fit=crop&w=500&q=60' }
        }
    },
    // ... (14 more fortune tests would go here, IDs f22-f35)
];
