// js/app.js
const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');

// 테스트 데이터베이스 (결과별 고유 애니메이션 이미지 포함)
const TESTS = [
    { 
        id: 'hero-origin', 
        category: '성격', 
        title: '판타지 세계 나의 직업', 
        desc: '이세계에 소환된 당신, 어떤 클래스로 전직할까요?', 
        thumb: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '길을 가다 마주친 몬스터! 첫 행동은?', options: [{ text: '검을 뽑아 돌진한다', type: 'A' }, { text: '거리를 두며 마법 주문을 외운다', type: 'B' }] },
            { q: '동료를 한 명 영입한다면?', options: [{ text: '나를 지켜줄 든든한 방패 기사', type: 'A' }, { text: '강력한 파괴력을 가진 흑마법사', type: 'B' }] },
            { q: '가장 탐나는 보물은?', options: [{ text: '전설의 성검', type: 'A' }, { text: '지혜의 마법 지팡이', type: 'B' }] },
            { q: '당신이 선호하는 전투 방식은?', options: [{ text: '근접전에서 느끼는 타격감', type: 'A' }, { text: '후방에서 지원하는 지략전', type: 'B' }] },
            { q: '마을 사람들이 도움을 요청한다.', options: [{ text: '직접 몸을 써서 해결해준다', type: 'A' }, { text: '마법 장치나 도구로 도와준다', type: 'B' }] },
            { q: '나의 가장 큰 장점은?', options: [{ text: '지치지 않는 체력과 용기', type: 'A' }, { text: '명석한 두뇌와 판단력', type: 'B' }] },
            { q: '최종 보스와의 대결에서?', options: [{ text: '정면 돌파로 승부한다', type: 'A' }, { text: '약점을 노려 한 방에 끝낸다', type: 'B' }] }
        ],
        results: {
            A: { 
                title: '용맹한 성기사', 
                desc: '당신은 정의감이 넘치고 행동력이 뛰어납니다. 항상 앞장서서 동료들을 이끄는 리더 타입이군요!',
                img: 'https://images.unsplash.com/photo-1559519529-31718974cb14?auto=format&fit=crop&w=500&q=60'
            },
            B: { 
                title: '대현자 마법사', 
                desc: '냉철한 판단력과 깊은 지식을 가진 당신은 전략적인 사고에 능합니다. 세상을 바꿀 지혜의 소유자입니다.',
                img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=60'
            }
        }
    },
    { 
        id: 'school-life', 
        category: '성격', 
        title: '하이틴 애니 속 나의 역할', 
        desc: '학교 배경 애니메이션에서 나는 어떤 캐릭터일까?', 
        thumb: 'https://images.unsplash.com/photo-1523050853061-850013fca462?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '등굣길, 당신의 모습은?', options: [{ text: '친구들과 수다 떨며 즐겁게', type: 'A' }, { text: '이어폰을 끼고 혼자 차분하게', type: 'B' }] },
            { q: '점심시간에 당신은 어디에?', options: [{ text: '매점이나 운동장에서 활발하게', type: 'A' }, { text: '교실이나 도서관에서 조용히', type: 'B' }] },
            { q: '동아리를 선택한다면?', options: [{ text: '활동적인 밴드부나 운동부', type: 'A' }, { text: '감성적인 미술부나 독서부', type: 'B' }] },
            { q: '발표 수업 시간이 다가왔다.', options: [{ text: '자신 있게 나가서 발표한다', type: 'A' }, { text: '원고를 꼼꼼히 준비해 차분히 읽는다', type: 'B' }] },
            { q: '축제 때 당신이 맡을 역할은?', options: [{ text: '무대 위 주인공', type: 'A' }, { text: '무대 뒤 든든한 스태프', type: 'B' }] },
            { q: '친구가 고민 상담을 요청하면?', options: [{ text: '함께 놀러 나가 기분을 풀어준다', type: 'A' }, { text: '조용히 들어주며 공감해준다', type: 'B' }] },
            { q: '방과 후 나의 일상은?', options: [{ text: '친구들과 카페에서 즐거운 시간', type: 'A' }, { text: '집에서 좋아하는 취미에 몰두', type: 'B' }] }
        ],
        results: {
            A: { 
                title: '인기 만점 주인공', 
                desc: '어디서나 주목받는 밝은 에너지를 가진 당신! 주변 사람들을 행복하게 만드는 능력이 있네요.',
                img: 'https://images.unsplash.com/photo-1541178735423-4793327ad1f1?auto=format&fit=crop&w=500&q=60'
            },
            B: { 
                title: '신비로운 전학생', 
                desc: '차분하고 생각이 깊은 당신은 남들이 모르는 독특한 매력을 지니고 있습니다. 관찰력이 매우 뛰어나군요.',
                img: 'https://images.unsplash.com/photo-1525921429573-05911ad2fc6b?auto=format&fit=crop&w=500&q=60'
            }
        }
    },
    { 
        id: 'element-power', 
        category: '감성', 
        title: '나를 상징하는 원소', 
        desc: '불과 물 중 당신의 영혼은 무엇을 닮았나요?', 
        thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '좋아하는 계절은?', options: [{ text: '뜨거운 열정의 여름', type: 'Fire' }, { text: '차분하고 맑은 가을', type: 'Water' }] },
            { q: '가장 끌리는 풍경은?', options: [{ text: '타오르는 노을', type: 'Fire' }, { text: '끝없이 펼쳐진 바다', type: 'Water' }] },
            { q: '화가 났을 때 당신은?', options: [{ text: '금방 뜨거워졌다가 식는다', type: 'Fire' }, { text: '차갑게 가라앉으며 생각한다', type: 'Water' }] },
            { q: '선호하는 색상 톤은?', options: [{ text: '강렬한 붉은색 계열', type: 'Fire' }, { text: '평온한 푸른색 계열', type: 'Water' }] },
            { q: '휴식을 취할 때?', options: [{ text: '땀을 흘리며 활동적으로', type: 'Fire' }, { text: '반신욕이나 명상을 하며', type: 'Water' }] },
            { q: '도전적인 상황이 오면?', options: [{ text: '열정으로 맞서 싸운다', type: 'Fire' }, { text: '유연하게 흘려보낸다', type: 'Water' }] },
            { q: '당신을 한 단어로 표현하면?', options: [{ text: '열정(Passion)', type: 'Fire' }, { text: '정화(Pure)', type: 'Water' }] }
        ],
        results: {
            Fire: { 
                title: '타오르는 불꽃', 
                desc: '당신은 주도적이고 열정적인 사람입니다. 목표가 생기면 누구보다 뜨겁게 타올라 성취해내는군요!',
                img: 'https://images.unsplash.com/photo-1518107616385-ad30833edce7?auto=format&fit=crop&w=500&q=60'
            },
            Water: { 
                title: '고요한 푸른 물결', 
                desc: '당신은 유연하고 포용력이 넓은 사람입니다. 주변 사람들을 편안하게 감싸주는 치유의 에너지를 가졌네요.',
                img: 'https://images.unsplash.com/photo-1505118380757-91f5f45d8de4?auto=format&fit=crop&w=500&q=60'
            }
        }
    },
    { 
        id: 'magic-pet', 
        category: '감성', 
        title: '나의 수호 정령 찾기', 
        desc: '내 곁을 지켜줄 특별한 영적 파트너는 누구일까요?', 
        thumb: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '동물 중에서 더 끌리는 쪽은?', options: [{ text: '민첩한 여우', type: 'A' }, { text: '영리한 부엉이', type: 'B' }] },
            { q: '밤하늘을 볼 때 찾는 것은?', options: [{ text: '반짝이는 별자리', type: 'A' }, { text: '은은한 달빛', type: 'B' }] },
            { q: '당신이 좋아하는 시간대는?', options: [{ text: '활기찬 오후', type: 'A' }, { text: '신비로운 자정', type: 'B' }] },
            { q: '숲속에서 길을 잃었다면?', options: [{ text: '직감을 믿고 나아간다', type: 'A' }, { text: '흔적을 분석하며 길을 찾는다', type: 'B' }] },
            { q: '어떤 초능력이 탐나나요?', options: [{ text: '순간이동', type: 'A' }, { text: '시간 정지', type: 'B' }] },
            { q: '당신의 방 스타일은?', options: [{ text: '다양한 소품으로 꾸민 방', type: 'A' }, { text: '필요한 것만 있는 미니멀 방', type: 'B' }] },
            { q: '꿈을 자주 꾸시나요?', options: [{ text: '모험이 가득한 화려한 꿈', type: 'A' }, { text: '잔잔하고 기억에 남는 꿈', type: 'B' }] }
        ],
        results: {
            A: { 
                title: '신비로운 구미호 정령', 
                desc: '변화무쌍하고 매력적인 당신! 임기응변에 강하고 어디서나 잘 적응하는 영리함을 가졌습니다.',
                img: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=500&q=60'
            },
            B: { 
                title: '지혜로운 수호 부엉이', 
                desc: '깊은 통찰력과 인내심을 가진 당신! 남들이 보지 못하는 본질을 꿰뚫어 보는 힘이 있군요.',
                img: 'https://images.unsplash.com/photo-1543549710-8902f9a02eb5?auto=format&fit=crop&w=500&q=60'
            }
        }
    },
    { 
        id: 'detective-case', 
        category: '성격', 
        title: '추리 애니 속 나의 지능', 
        desc: '사건 발생! 당신은 어떤 방식으로 범인을 잡을까요?', 
        thumb: 'https://images.unsplash.com/photo-1453873531674-215ee3ac4cd1?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '사건 현장에 도착했다. 가장 먼저 하는 일은?', options: [{ text: '현장의 전체적인 분위기를 살핀다', type: 'A' }, { text: '작은 발자국 하나까지 꼼꼼히 조사한다', type: 'B' }] },
            { q: '증언이 엇갈린다. 누구를 믿을까?', options: [{ text: '나의 직감과 사람의 태도', type: 'A' }, { text: '객관적인 증거와 알리바이', type: 'B' }] },
            { q: '범인이 남긴 암호가 발견되었다.', options: [{ text: '번뜩이는 영감으로 풀어낸다', type: 'A' }, { text: '하나씩 대입하며 논리적으로 푼다', type: 'B' }] },
            { q: '추리 도중 막다른 길에 다다랐다.', options: [{ text: '잠시 쉬며 생각을 환기한다', type: 'A' }, { text: '처음부터 다시 차근차근 검토한다', type: 'B' }] },
            { q: '당신의 탐정 도구는?', options: [{ text: '변장 도구와 사교술', type: 'A' }, { text: '최첨단 분석기', type: 'B' }] },
            { q: '범인과 대면했을 때?', options: [{ text: '심리전으로 자백을 유도한다', type: 'A' }, { text: '증거를 들이밀어 항복시킨다', type: 'B' }] },
            { q: '사건 해결 후 당신의 소감은?', options: [{ text: '진실은 언제나 하나!', type: 'A' }, { text: '모든 퍼즐이 맞춰졌군.', type: 'B' }] }
        ],
        results: {
            A: { 
                title: '괴도 신사 탐정', 
                desc: '창의적이고 직관적인 추리력을 가진 당신! 사람의 마음을 읽는 능력이 탁월하여 어려운 사건도 화려하게 해결합니다.',
                img: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=500&q=60'
            },
            B: { 
                title: '명탐정 브레인', 
                desc: '논리적이고 치밀한 분석력을 가진 당신! 작은 단서 하나 놓치지 않는 꼼꼼함으로 완벽하게 진실을 찾아냅니다.',
                img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=500&q=60'
            }
        }
    },
    { 
        id: 'space-pilot', 
        category: '성격', 
        title: '우주 함대 보직 테스트', 
        desc: '광활한 우주선에서 당신이 맡게 될 역할은?', 
        thumb: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '우주선에 알람이 울린다! 당신의 행동은?', options: [{ text: '즉시 조종간을 잡고 상황을 통제한다', type: 'Pilot' }, { text: '시스템 로그를 확인해 원인을 파악한다', type: 'Eng' }] },
            { q: '새로운 행성에 도착했다. 무엇을 할까?', options: [{ text: '직접 내려가 행성을 탐사한다', type: 'Pilot' }, { text: '궤도 위에서 행성 데이터를 수집한다', type: 'Eng' }] },
            { q: '에너지가 부족하다. 해결책은?', options: [{ text: '최대한 아끼며 운행을 계속한다', type: 'Pilot' }, { text: '새로운 에너지원을 개발하거나 수리한다', type: 'Eng' }] },
            { q: '동료가 다쳤다. 어떻게 대응할까?', options: [{ text: '빠르게 안전한 곳으로 후송한다', type: 'Pilot' }, { text: '응급 처치 장비를 작동시켜 고친다', type: 'Eng' }] },
            { q: '외계 생명체와의 조우!', options: [{ text: '당당하게 소통을 시도한다', type: 'Pilot' }, { text: '그들의 기술력을 먼저 분석한다', type: 'Eng' }] },
            { q: '당신이 더 신뢰하는 것은?', options: [{ text: '나의 경험과 조종 감각', type: 'Pilot' }, { text: '우주선의 데이터', type: 'Eng' }] },
            { q: '미션 성공 후 당신이 받는 칭찬은?', options: [{ text: '최고의 리더십이었어!', type: 'Pilot' }, { text: '완벽한 기술 지원이었어!', type: 'Eng' }] }
        ],
        results: {
            Pilot: { 
                title: '무적의 함장님', 
                desc: '결단력 있고 카리스마 넘치는 리더입니다. 위기 상황에서도 흔들리지 않고 모두를 목적지까지 이끄는 힘이 있습니다.',
                img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=60'
            },
            Eng: { 
                title: '천재 수석 엔지니어', 
                desc: '분석적이고 지적인 기술 전문가입니다. 어떤 복잡한 기계라도 당신의 손을 거치면 완벽하게 작동하게 되는군요.',
                img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=500&q=60'
            }
        }
    },
    { 
        id: 'food-chef', 
        category: '감성', 
        title: '애니 속 요리 장인', 
        desc: '당신의 요리는 사람들에게 어떤 감동을 줄까요?', 
        thumb: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '요리할 때 가장 중요한 것은?', options: [{ text: '먹는 사람을 생각하는 마음', type: 'Heart' }, { text: '완벽한 레시피와 계량', type: 'Tech' }] },
            { q: '어떤 재료에 더 끌리나요?', options: [{ text: '신선하고 자연스러운 재료', type: 'Heart' }, { text: '희귀하고 독특한 향신료', type: 'Tech' }] },
            { q: '주방 분위기는 어떠한가요?', options: [{ text: '활기차고 따뜻한 분위기', type: 'Heart' }, { text: '조용하고 집중된 분위기', type: 'Tech' }] },
            { q: '요리가 완성되었을 때의 느낌은?', options: [{ text: '뿌듯하고 행복한 기분', type: 'Heart' }, { text: '성공했다는 만족감', type: 'Tech' }] },
            { q: '플레이팅 스타일은?', options: [{ text: '정감 가고 푸짐하게', type: 'Heart' }, { text: '예술 작품처럼 정교하게', type: 'Tech' }] },
            { q: '누군가 맛없다고 한다면?', options: [{ text: '슬퍼하며 보완할 점을 묻는다', type: 'Heart' }, { text: '조리 과정의 문제를 분석한다', type: 'Tech' }] },
            { q: '당신의 시그니처 메뉴는?', options: [{ text: '추억을 부르는 소울 푸드', type: 'Heart' }, { text: '화려한 기술의 요리', type: 'Tech' }] }
        ],
        results: {
            Heart: { 
                title: '마음을 치유하는 요리사', 
                desc: '당신의 요리에는 사람의 마음을 녹이는 따뜻함이 담겨 있습니다. 먹는 것만으로도 행복해지는 마법을 부리시네요!',
                img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=500&q=60'
            },
            Tech: { 
                title: '전설의 미식 장인', 
                desc: '당신은 완벽을 추구하는 요리 예술가입니다. 정교한 기술과 창의적인 맛의 조합으로 사람들을 놀라게 만드는군요.',
                img: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=500&q=60'
            }
        }
    },
    { 
        id: 'magic-academy', 
        category: '사주', 
        title: '마법 학교 기숙사 배정', 
        desc: '7번의 선택으로 결정되는 당신의 운명적인 기숙사', 
        thumb: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '입학식 날, 당신의 기분은?', options: [{ text: '두근거리는 기대감', type: 'G' }, { text: '차분한 긴장감', type: 'S' }] },
            { q: '어떤 수업이 가장 듣고 싶나요?', options: [{ text: '하늘을 나는 비행 수업', type: 'G' }, { text: '비밀스러운 약초 조제', type: 'S' }] },
            { q: '도서관 금지구역에 들어간다면?', options: [{ text: '당당하게 모험을 즐긴다', type: 'G' }, { text: '몰래 숨어 정보를 캔다', type: 'S' }] },
            { q: '당신이 가장 아끼는 마법 물건은?', options: [{ text: '빛나는 용기의 펜던트', type: 'G' }, { text: '투명해지는 은신 망토', type: 'S' }] },
            { q: '어려운 마법 주문을 연습할 때?', options: [{ text: '될 때까지 반복하며 도전한다', type: 'G' }, { text: '원리를 이해하고 실습한다', type: 'S' }] },
            { q: '친구를 사귀는 방식은?', options: [{ text: '누구에게나 먼저 다가간다', type: 'G' }, { text: '마음이 맞는 소수와 깊게 사귄다', type: 'S' }] },
            { q: '졸업 후 당신의 모습은?', options: [{ text: '세상을 구하는 영웅', type: 'G' }, { text: '지식을 전파하는 연구자', type: 'S' }] }
        ],
        results: {
            G: { 
                title: '그리핀 라이온 기숙사', 
                desc: '당신은 용기와 정의를 상징하는 사자의 심장을 가졌습니다. 어떤 역경도 굴하지 않고 헤쳐나갈 운명이네요!',
                img: 'https://images.unsplash.com/photo-1541512416146-3cf58d6b2732?auto=format&fit=crop&w=500&q=60'
            },
            S: { 
                title: '실버 스네이크 기숙사', 
                desc: '당신은 야망과 지혜를 상징하는 뱀의 영리함을 가졌습니다. 치밀한 계획과 실력으로 세상을 뒤흔들 운명입니다.',
                img: 'https://images.unsplash.com/photo-1531912479218-4690c1db477b?auto=format&fit=crop&w=500&q=60'
            }
        }
    },
    { 
        id: 'time-traveler', 
        category: '감성', 
        title: '나의 시간 여행 타입', 
        desc: '과거로? 미래로? 당신의 영혼이 머물고 싶은 시간', 
        thumb: 'https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '시간 여행 장치를 얻었다. 어디로 갈까?', options: [{ text: '그리운 추억이 있는 과거', type: 'Past' }, { text: '궁금한 미래의 도시', type: 'Future' }] },
            { q: '과거의 나를 만난다면?', options: [{ text: '따뜻하게 안아준다', type: 'Past' }, { text: '중요한 정보를 알려준다', type: 'Future' }] },
            { q: '미래의 기술 중 가장 탐나는 것은?', options: [{ text: '기억 저장 기술', type: 'Past' }, { text: '은하계 여행 기술', type: 'Future' }] },
            { q: '당신의 패션 스타일은?', options: [{ text: '빈티지하고 클래식한 룩', type: 'Past' }, { text: '세련되고 미니멀한 룩', type: 'Future' }] },
            { q: '가장 소중한 물건은?', options: [{ text: '오래된 일기장이나 사진', type: 'Past' }, { text: '최신형 스마트 기기', type: 'Future' }] },
            { q: '어떤 장르를 더 좋아하나요?', options: [{ text: '로맨스 판타지', type: 'Past' }, { text: 'SF 미스터리', type: 'Future' }] },
            { q: '인생의 모토는?', options: [{ text: '지나간 것은 아름답다', type: 'Past' }, { text: '내일은 오늘보다 나을 것이다', type: 'Future' }] }
        ],
        results: {
            Past: { 
                title: '따뜻한 로맨티스트 여행자', 
                desc: '당신은 감수성이 풍부하고 소중한 기억을 간직할 줄 아는 사람입니다. 과거의 아름다움을 현대에 전하는 메신저이기도 하네요.',
                img: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=500&q=60'
            },
            Future: { 
                title: '혁신적인 개척자 여행자', 
                desc: '당신은 호기심이 많고 변화를 즐기는 사람입니다. 항상 새로운 가능성을 꿈꾸며 미래를 설계하는 선구자적 면모가 있군요.',
                img: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=500&q=60'
            }
        }
    },
    { 
        id: 'pet-dragon', 
        category: '사주', 
        title: '나와 닮은 전설의 용', 
        desc: '당신의 성격 속에 숨겨진 강력한 용의 기운은?', 
        thumb: 'https://images.unsplash.com/photo-1577493322601-3ae139071c51?auto=format&fit=crop&w=500&q=60',
        questions: [
            { q: '당신의 힘은 어디서 나오나요?', options: [{ text: '강력한 신체적 힘', type: 'A' }, { text: '신비로운 정신적 힘', type: 'B' }] },
            { q: '주로 활동하는 장소는?', options: [{ text: '높은 산이나 하늘', type: 'A' }, { text: '깊은 바다나 동굴', type: 'B' }] },
            { q: '보물을 지킬 때 당신의 태도는?', options: [{ text: '침입자를 단숨에 쫓아버린다', type: 'A' }, { text: '함정을 파서 포기하게 한다', type: 'B' }] },
            { q: '사람들이 당신을 볼 때 느끼는 감정은?', options: [{ text: '경외심과 공포', type: 'A' }, { text: '신비로움과 경이로움', type: 'B' }] },
            { q: '당신의 숨결(Breath)은?', options: [{ text: '모든 것을 태우는 화염', type: 'A' }, { text: '모든 것을 얼리는 냉기', type: 'B' }] },
            { q: '당신이 가장 중요하게 여기는 것?', options: [{ text: '최강이라는 명예', type: 'A' }, { text: '끝없는 생명의 영속성', type: 'B' }] },
            { q: '인간과 친구가 될 수 있나요?', options: [{ text: '나를 존중한다면 가능하다', type: 'A' }, { text: '먼저 지혜를 증명해야 한다', type: 'B' }] }
        ],
        results: {
            A: { 
                title: '태양의 골드 드래곤', 
                desc: '당신은 압도적인 존재감과 리더십을 가졌습니다. 태양처럼 밝고 강한 에너지는 주변을 이끄는 힘이 됩니다.',
                img: 'https://images.unsplash.com/photo-1535666669445-e8c15cd2e7d9?auto=format&fit=crop&w=500&q=60'
            },
            B: { 
                title: '달빛의 실버 드래곤', 
                desc: '당신은 우아하고 신비로운 매력을 가졌습니다. 차분한 통찰력과 지혜로 세상의 흐름을 읽어내는 능력이 탁월하군요.',
                img: 'https://images.unsplash.com/photo-1502134249126-9f3755a50d78?auto=format&fit=crop&w=500&q=60'
            }
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
            <p>7번의 질문으로 확인하는 나의 모든 것</p>
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
    const result = test.results[winningType];

    app.innerHTML = `
        <div class="ad-slot">AD SPACE - 결과 상단</div>
        <div class="result-card fade-in">
            <span class="test-category">${test.title} 결과</span>
            <div class="result-img" style="background-image: url('${result.img}'); background-size: cover; background-position: center;"></div>
            <h2 style="font-size:2rem; color:var(--accent-color); margin-bottom:1rem; word-break:keep-all;">당신은 [${result.title}]</h2>
            <p style="font-size:1.1rem; line-height:1.8; margin-bottom:2rem; word-break:keep-all; padding: 0 15px;">${result.desc}</p>
            
            <div class="share-grid">
                <button class="btn-share" id="share-web">공유하기</button>
                <button class="btn-share btn-copy" id="share-copy">링크 복사</button>
            </div>
            
            <button class="btn-share" style="width:100%; margin-top:1rem; background:#4a4a4a;" onclick="location.hash='#home'">다른 테스트 더 보기</button>
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
        } else { alert('공유하기를 지원하지 않는 브라우저입니다. 링크 복사를 이용해주세요!'); }
    };
}

themeToggle.onclick = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '✨';
};

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
