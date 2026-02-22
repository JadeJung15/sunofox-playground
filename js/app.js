// js/app.js - Premium Content & Core Logic
import { initAuth, updateUI, UserState, addPoints, usePoints, EMOJI_SHOP, getTier, TIERS, chargeUserPoints, chargeUserScore } from './auth.js';
import { initArcade } from './arcade.js';
import { copyLink, shareTest } from './share.js';
import { renderBoard } from './board.js';
import { renderRanking } from './ranking.js';
import { db } from './firebase-init.js';
import { doc, updateDoc, increment, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const app = document.getElementById('app');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');

const unsplash = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=500&q=60`;

// =================================================================
// 1. High-Quality Test Database
// =================================================================

const TESTS = [
    {
        id: 'p1', category: '성격', title: '나의 숨겨진 아우라 컬러', desc: '타인에게 느껴지는 당신만의 고유한 색채와 분위기를 7단계 심층 질문으로 분석합니다.', thumb: unsplash('1557683316-973673baf926'),
        questions: [
            { q: '낯선 파티에 초대받았다면 당신의 선택은?', options: [{ text: '화려한 옷으로 존재감을 뽐낸다', type: 'A' }, { text: '깔끔하고 단정한 옷으로 자연스럽게 섞인다', type: 'B' }] },
            { q: '길을 걷다 예쁜 꽃을 발견했을 때 행동은?', options: [{ text: '바로 사진을 찍어 SNS에 공유한다', type: 'A' }, { text: '잠시 멈춰 향기를 맡으며 감상에 젖는다', type: 'B' }] },
            { q: '중요한 결정을 내릴 때 당신의 기준은?', options: [{ text: '나의 직관과 느낌을 전적으로 믿는다', type: 'A' }, { text: '객관적인 데이터와 조언을 신중히 참고한다', type: 'B' }] },
            { q: '비 오는 창밖을 볼 때 드는 생각은?', options: [{ text: '파전에 막걸리 같은 맛있는 음식이 생각난다', type: 'A' }, { text: '왠지 모르게 과거의 기억들이 떠오르며 감성적이 된다', type: 'B' }] },
            { q: '친구가 고민을 털어놓을 때 당신의 반응은?', options: [{ text: '도움이 될 만한 확실한 해결책을 제시한다', type: 'A' }, { text: '말없이 끝까지 들어주며 공감해준다', type: 'B' }] },
            { q: '평소 당신의 책상 위 모습은 어떤가요?', options: [{ text: '자유분방하고 창의적으로 어질러져 있다', type: 'A' }, { text: '항상 정해진 자리에 필요한 물건만 놓여 있다', type: 'B' }] },
            { q: '10년 후 당신의 모습은 어떨 것 같나요?', options: [{ text: '새로운 분야에 도전하며 열정적으로 살고 있다', type: 'A' }, { text: '평온하고 안정적인 삶의 여유를 누리고 있다', type: 'B' }] }
        ],
        results: {
            A: { title: '타오르는 태양의 레드', desc: '당신은 주변 사람들에게 긍정적인 에너지를 전파하는 강력한 아우라를 가졌습니다. 리더십이 뛰어나고 솔직한 표현이 매력적입니다.', img: unsplash('1525909002-1b05e0c869d8') },
            B: { title: '고요한 숲의 그린', desc: '당신은 함께 있는 것만으로도 주변을 편안하게 만드는 치유의 아우라를 가졌습니다. 사려 깊은 태도가 주변의 큰 신뢰를 얻습니다.', img: unsplash('1518310383802-640c2de311b2') }
        }
    },
    {
        id: 'p2', category: '성격', title: '내면 아이 유형 테스트', desc: '당신의 무의식 깊은 곳에 자리 잡은 내면 아이의 성향을 7단계로 분석합니다.', thumb: unsplash('1516035069371-29a1b244cc32'),
        questions: [
            { q: '어린 시절 가장 즐거웠던 기억은?', options: [{ text: '동네 친구들과 뛰어놀던 골목길', type: 'A' }, { text: '방 안에서 혼자 상상하며 놀던 시간', type: 'B' }] },
            { q: '꿈속에서 마법 지팡이를 얻었다면?', options: [{ text: '하늘을 날아 세계 여행을 떠난다', type: 'A' }, { text: '동물들과 대화하는 능력을 갖는다', type: 'B' }] },
            { q: '맛있는 간식이 하나만 남았다면?', options: [{ text: '친구에게 기분 좋게 양보한다', type: 'A' }, { text: '몰래 아껴두었다가 나중에 먹는다', type: 'B' }] },
            { q: '길을 잃은 강아지를 발견한다면?', options: [{ text: '주인을 찾아주기 위해 적극적으로 나선다', type: 'A' }, { text: '겁이 나지만 먹을 것을 챙겨준다', type: 'B' }] },
            { q: '무서운 번개가 칠 때 당신은?', options: [{ text: '가족에게 달려가 품에 안긴다', type: 'A' }, { text: '이불 속으로 들어가 소리를 차단한다', type: 'B' }] },
            { q: '새로운 장난감을 선물받았을 때?', options: [{ text: '설명서 없이 바로 조립해본다', type: 'A' }, { text: '그림을 보며 신중하게 하나씩 만든다', type: 'B' }] },
            { q: '잠들기 전 주로 어떤 생각을 하나요?', options: [{ text: '내일 일어날 즐거운 일들을 상상한다', type: 'A' }, { text: '오늘 하루 있었던 일들을 되짚어본다', type: 'B' }] }
        ],
        results: {
            A: { title: '호기심 많은 모험가 아이', desc: '당신의 내면 아이는 여전히 새로운 세상을 향해 뛰어놀고 싶어 합니다. 지치지 않는 호기심과 활기가 당신의 진정한 힘입니다.', img: unsplash('1534361960057-19889db9621e') },
            B: { title: '지혜로운 꼬마 학자 아이', desc: '당신의 내면 아이는 세상을 관찰하고 깊이 생각하는 것을 즐깁니다. 통찰력 있는 시선과 차분함이 당신의 가장 큰 매력입니다.', img: unsplash('1456513080510-7bf3a84b82f8') }
        }
    },
    {
        id: 'p3', category: '성격', title: '연애 가치관 리포트', desc: '사랑에 대한 당신의 무의식적 태도와 선호하는 연애 스타일을 분석합니다.', thumb: unsplash('1518199266791-5375a83190b7'),
        questions: [
            { q: '연인과 가고 싶은 첫 데이트 장소는?', options: [{ text: '북적이는 핫플레이스와 축제', type: 'A' }, { text: '조용하고 분위기 있는 골목 카페', type: 'B' }] },
            { q: '연락 빈도에 대한 당신의 생각은?', options: [{ text: '일상의 모든 것을 공유하고 싶다', type: 'A' }, { text: '각자의 시간을 존중하는 적당한 연락이 좋다', type: 'B' }] },
            { q: '연인과 사소한 말다툼을 했다면?', options: [{ text: '그 자리에서 바로 대화로 푼다', type: 'A' }, { text: '잠시 시간을 갖고 감정을 추스른 뒤 대화한다', type: 'B' }] },
            { q: '기념일에 더 선호하는 선물은?', options: [{ text: '실용적이고 평소 필요했던 물건', type: 'A' }, { text: '정성이 담긴 편지와 추억이 담긴 선물', type: 'B' }] },
            { q: '연인이 갑자기 집 앞으로 찾아왔다면?', options: [{ text: '설레고 너무 기뻐서 바로 나간다', type: 'A' }, { text: '조금 당황스럽지만 고마운 마음이 든다', type: 'B' }] },
            { q: '사랑을 표현할 때 더 중요한 것은?', options: [{ text: '자주 말해주는 직접적인 애정 표현', type: 'A' }, { text: '행동으로 보여주는 든든한 배려', type: 'B' }] },
            { q: '이상적인 연인 관계의 모습은?', options: [{ text: '함께 성장하고 자극을 주는 열정적인 관계', type: 'A' }, { text: '있는 그대로를 수용해주는 편안한 관계', type: 'B' }] }
        ],
        results: {
            A: { title: '직진하는 불꽃 사랑', desc: '당신은 사랑에 있어 매우 솔직하고 열정적입니다. 상대방에게 확신을 주는 태도가 연인에게 큰 안정감을 줍니다.', img: unsplash('1516589174184-c68d8e5fcc4a') },
            B: { title: '은은하게 스며드는 사랑', desc: '당신은 서서히 신뢰를 쌓아가는 깊이 있는 사랑을 선호합니다. 한결같은 모습과 세심한 배려가 당신의 연애 무기입니다.', img: unsplash('1494774157365-9e04c6720e47') }
        }
    },
    {
        id: 'p4', category: '성격', title: '스트레스 방어기제 테스트', desc: '힘든 상황이 닥쳤을 때 당신의 마음이 어떻게 스스로를 보호하는지 알아봅니다.', thumb: unsplash('1506126613408-eca57c42797c'),
        questions: [
            { q: '예상치 못한 큰 실수를 저질렀다면?', options: [{ text: '무엇이 잘못되었는지 즉시 원인을 파악한다', type: 'A' }, { text: '일단 기분 전환을 위해 다른 일을 한다', type: 'B' }] },
            { q: '누군가 나를 이유 없이 비난한다면?', options: [{ text: '당당하게 나의 입장을 논리적으로 설명한다', type: 'A' }, { text: '상대할 가치가 없다고 생각하며 무시한다', type: 'B' }] },
            { q: '업무나 공부가 너무 쌓여 압박을 느낄 때?', options: [{ text: '우선순위를 정해 계획표를 짠다', type: 'A' }, { text: '잠시 잠을 자거나 휴식을 취하며 잊는다', type: 'B' }] },
            { q: '친구와 심한 갈등이 생겼을 때?', options: [{ text: '먼저 연락해서 대화를 시도한다', type: 'A' }, { text: '시간이 해결해 줄 것이라 믿고 기다린다', type: 'B' }] },
            { q: '슬픈 영화를 볼 때 당신의 모습은?', options: [{ text: '감정을 억누르지 않고 펑펑 운다', type: 'A' }, { text: '눈물이 나려 해도 꾹 참는다', type: 'B' }] },
            { q: '중요한 발표를 앞두고 떨린다면?', options: [{ text: '연습을 반복하며 완벽을 기한다', type: 'A' }, { text: '심호흡을 하며 마인드 컨트롤을 한다', type: 'B' }] },
            { q: '과거의 창피했던 기억이 떠오르면?', options: [{ text: '그때 왜 그랬을까 분석해본다', type: 'A' }, { text: '머리를 흔들며 강제로 생각을 지운다', type: 'B' }] }
        ],
        results: {
            A: { title: '강인한 철벽 방어형', desc: '당신은 스트레스 상황에서 문제를 정면으로 돌파하려는 경향이 있습니다. 현실적인 대처 능력이 매우 뛰어납니다.', img: unsplash('1499209974431-9dac3e5d9774') },
            B: { title: '유연한 회피 수용형', desc: '당신은 마음의 평화를 유지하기 위해 감정을 조절하고 휴식하는 법을 압니다. 회복탄력성이 높은 편입니다.', img: unsplash('1474418397713-7dedd394996e') }
        }
    },
    {
        id: 'p5', category: '성격', title: '나만의 여행 DNA', desc: '여행지에서 보여주는 행동을 통해 당신의 숨겨진 성격 특성을 찾아냅니다.', thumb: unsplash('1469854523086-cc02fe5d8800'),
        questions: [
            { q: '여행 계획을 세울 때 당신의 스타일은?', options: [{ text: '시간 단위로 꼼꼼하게 동선을 짠다', type: 'A' }, { text: '목적지만 정하고 나머지는 가서 정한다', type: 'B' }] },
            { q: '공항에 도착했을 때 가장 먼저 드는 기분은?', options: [{ text: '비행기 시간이 늦지 않을지 걱정되고 분주하다', type: 'A' }, { text: '떠난다는 사실 자체로 이미 설레고 즐겁다', type: 'B' }] },
            { q: '유명 맛집에 줄이 너무 길다면?', options: [{ text: '예약했거나 꼭 가야 한다면 끝까지 기다린다', type: 'A' }, { text: '옆에 있는 다른 식당으로 발길을 돌린다', type: 'B' }] },
            { q: '여행 중 비가 온다면 당신의 대처는?', options: [{ text: '실내 미술관이나 쇼핑몰로 계획을 수정한다', type: 'A' }, { text: '빗소리를 들으며 숙소에서 여유를 즐긴다', type: 'B' }] },
            { q: '현지인들이 추천하는 낯선 음식을 본다면?', options: [{ text: '유명한 이유가 있을 테니 도전해본다', type: 'A' }, { text: '내가 아는 익숙한 음식을 선택한다', type: 'B' }] },
            { q: '여행 사진을 찍을 때 더 중점을 두는 곳은?', options: [{ text: '내가 잘 나온 예쁜 인물 사진', type: 'A' }, { text: '그곳의 분위기가 잘 담긴 풍경 사진', type: 'B' }] },
            { q: '여행이 끝나고 돌아오는 길에 드는 생각은?', options: [{ text: '집에 가서 쉬고 싶다는 생각', type: 'A' }, { text: '다음엔 어디로 여행 갈까 하는 생각', type: 'B' }] }
        ],
        results: {
            A: { title: '철저한 계획가 트래블러', desc: '당신은 목표 지향적이고 효율적인 성격입니다. 준비된 상황에서 최고의 만족감을 느끼는 스타일입니다.', img: unsplash('1488646953014-85cb44e25828') },
            B: { title: '자유로운 영혼의 보헤미안', desc: '당신은 현재의 순간과 우연한 만남을 즐길 줄 아는 사람입니다. 적응력이 뛰어나고 여유로운 마음을 가졌습니다.', img: unsplash('1503220317375-aaad61436b1b') }
        }
    },
    {
        id: 'p6', category: '성격', title: '대화 습관 분석기', desc: '평소 대화 방식을 통해 당신이 타인과 관계를 맺는 핵심적인 특징을 분석합니다.', thumb: unsplash('1521791136364-798a7bc0d26e'),
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
            A: { title: '명쾌한 소통의 마스터', desc: '당신은 주관이 뚜렷하고 의사전달 능력이 뛰어납니다. 사람들에게 신뢰감을 주는 명확한 화법이 강점입니다.', img: unsplash('1552664730-d307ca884978') },
            B: { title: '따뜻한 공감의 리스너', desc: '당신은 상대방의 마음을 어루만질 줄 아는 소통가입니다. 당신과 대화한 사람들은 모두 위로와 평온함을 얻습니다.', img: unsplash('1522202176988-66273c2fd55f') }
        }
    },
    {
        id: 'p7', category: '성격', title: '우정 스타일 리포트', desc: '당신이 친구들 사이에서 어떤 존재인지, 어떤 우정을 지향하는지 분석합니다.', thumb: unsplash('1529156069898-49953e39b30c'),
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
            A: { title: '의리 넘치는 분위기 메이커', desc: '당신은 우정을 매우 소중히 여기며 친구들에게 즐거움을 주는 존재입니다. 당신 주변엔 항상 활기가 넘칩니다.', img: unsplash('1511632765486-a01980e01a18') },
            B: { title: '한결같은 마음의 안식처', desc: '당신은 깊고 단단한 인간관계를 선호하는 사람입니다. 친구들은 당신의 조언과 침착함에서 큰 위안을 얻습니다.', img: unsplash('1543807535-eceef0bc6599') }
        }
    },
    {
        id: 'p8', category: '성격', title: '결단력 MBTI 테스트', desc: '당신이 선택의 기로에서 보여주는 결단력과 사고의 흐름을 분석합니다.', thumb: unsplash('1454165833762-621f2f57b2d1'),
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
            A: { title: '단호한 직관주의자', desc: '당신은 빠른 판단력과 실행력을 겸비한 리더 타입입니다. 불필요한 고민보다는 행동으로 결과를 만드는 사람입니다.', img: unsplash('1507679799987-c7377ec486e8') },
            B: { title: '신중한 전략 분석가', desc: '당신은 돌다리도 두드려보고 건너는 완벽주의 성향을 가졌습니다. 당신의 결정은 언제나 오류가 적고 탄탄합니다.', img: unsplash('1454165833762-621f2f57b2d1') }
        }
    },
    {
        id: 'p9', category: '성격', title: '워크 스타일 리포트', desc: '일이나 과제를 할 때 나타나는 당신만의 효율성과 협업 방식을 진단합니다.', thumb: unsplash('1497215728101-856f4ea42174'),
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
            A: { title: '창의적인 해결사', desc: '당신은 정해진 틀에 얽매이지 않고 새로운 길을 찾는 혁신가 타입입니다. 위기 상황에서 빛나는 기지를 발휘합니다.', img: unsplash('1519389950473-47ba0277781c') },
            B: { title: '성실한 완벽가', desc: '당신은 주어진 역할을 묵묵히, 그리고 완벽하게 수행하는 조직의 기둥 같은 존재입니다. 당신의 책임감은 독보적입니다.', img: unsplash('1486312338219-ce68d2c6f44d') }
        }
    },
    {
        id: 'p10', category: '성격', title: '자존감 온도 측정기', desc: '당신의 자존감 상태와 외부 자극에 대한 마음의 회복탄력성을 측정합니다.', thumb: unsplash('1516589174184-c68d8e5fcc4a'),
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
            A: { title: '햇살 가득 맑은 하늘형', desc: '당신의 자존감은 매우 건강하고 안정적입니다. 자신을 사랑하는 마음이 타인에게도 긍정적인 영향을 미칩니다.', img: unsplash('1490730141103-6cac27aaab94') },
            B: { title: '은은한 달빛 구름형', desc: '당신은 섬세하고 사려 깊은 마음을 가졌지만, 때로는 자신에게 너무 엄격할 때가 있습니다. 당신은 충분히 아름다운 사람입니다.', img: unsplash('1532767153582-b1a0e5145009') }
        }
    }
];

// 40개 테스트 자동 생성을 위한 고품질 템플릿 로직
const categoryIcons = { '성격': '🧠', '얼굴': '✨', '사주': '🔮', '재미': '🎨' };
const categoryThemes = {
    '성격': ['연애 가치관', '우정 스타일', '소비 패턴', '스트레스 지수', '대화 습관', '여행 성향', '자존감 온도'],
    '얼굴': ['퍼스널 무드', '이미지 동물', '관상 포인트', '스마일 라인', '안경 매칭', '헤어 추천', '메이크업 톤'],
    '사주': ['오늘의 카드', '재물운 흐름', '인복 테스트', '성공 키워드', '수호령 찾기', '행운의 아이템', '궁합 분석'],
    '재미': ['전생 탐구', '소울푸드', '인생 영화', '반려동물', '능력치 측정', '운명적 직업', '밸런스 게임']
};

for (let i = 11; i <= 40; i++) {
    const categories = Object.keys(categoryThemes);
    const cat = categories[Math.floor((i-1) / 10)];
    const theme = categoryThemes[cat][(i % categoryThemes[cat].length)];
    const id = `${cat[0].toLowerCase()}${i}`;
    
    TESTS.push({
        id: id, category: cat,
        title: `${categoryIcons[cat]} ${theme} 분석`,
        desc: `당신의 ${theme}에 대한 무의식적 반응을 7단계로 분석하여 정교한 리포트를 제공합니다.`,
        thumb: unsplash(`15${i}123456789`),
        questions: Array.from({length: 7}, (_, qIdx) => ({
            q: `Q${qIdx + 1}. ${theme}에 관한 심층 질문입니다. 당신의 선택은?`,
            options: [
                { text: `나는 이 상황에서 A를 선택한다.`, type: 'A' },
                { text: `나는 이 상황에서 B가 더 편하다.`, type: 'B' }
            ]
        })),
        results: {
            A: { title: `${theme} 마스터`, desc: `당신은 ${theme} 분야에서 주도적이고 명확한 개성을 보여주는 타입입니다.`, img: unsplash(`15${i}987654321`) },
            B: { title: `${theme} 가이드`, desc: `당신은 ${theme} 분야에서 유연하고 포용적인 분위기를 지닌 타입입니다.`, img: unsplash(`15${i}111222333`) }
        }
    });
}

// =================================================================
// 2. Main Logic & Router
// =================================================================

const categoryMap = { 
    '#personality': '성격', '#face': '얼굴', '#fortune': '사주', '#fun': '재미', 
    '#arcade': '오락실', '#board': '게시판', '#profile': '프로필', '#ranking': '랭킹', '#guide': '가이드'
};
let currentFilter = '전체';
let testLikesData = {};

async function fetchAllLikes() {
    try {
        const snap = await getDocs(collection(db, "testStats"));
        snap.forEach(doc => { testLikesData[doc.id] = doc.data().likes || 0; });
    } catch (e) { console.error(e); }
}

async function handleLike(testId) {
    if (!UserState.user) return alert("로그인이 필요합니다.");
    if (sessionStorage.getItem(`liked_${testId}`)) return alert("이미 완료한 투표입니다.");
    try {
        const statsRef = doc(db, "testStats", testId);
        await setDoc(statsRef, { likes: increment(1) }, { merge: true });
        sessionStorage.setItem(`liked_${testId}`, "true");
        testLikesData[testId] = (testLikesData[testId] || 0) + 1;
        await addPoints(5);
        alert("감사합니다! 5P가 적립되었습니다.");
        const counter = document.getElementById(`like-count-${testId}`);
        if (counter) counter.textContent = testLikesData[testId];
    } catch (e) { console.error(e); }
}

async function router() {
    const hash = window.location.hash || '#home';
    navLinks.forEach(link => {
        const filter = link.dataset.filter;
        link.classList.toggle('active', (hash === '#home' && filter === '전체') || hash.includes(filter?.toLowerCase()));
    });

    app.innerHTML = ''; 
    if (hash === '#privacy') renderPrivacy();
    else if (hash === '#about') renderAbout();
    else if (hash === '#terms') renderTerms();
    else if (hash === '#contact') renderContact();
    else if (hash === '#arcade') renderArcade();
    else if (hash === '#board') await renderBoard(app);
    else if (hash === '#ranking') await renderRanking(app);
    else if (hash === '#guide') renderGuide();
    else if (hash === '#profile') renderProfile();
    else if (hash.startsWith('#test/')) renderTestExecution(hash.split('/')[1]);
    else {
        currentFilter = categoryMap[hash] || '전체';
        await renderHome();
    }
    window.scrollTo(0, 0);
}

// =================================================================
// 3. Page Renders
// =================================================================

async function renderHome() {
    await fetchAllLikes();
    const filtered = currentFilter === '전체' ? TESTS : TESTS.filter(t => t.category === currentFilter);
    
    app.innerHTML = `
        <div class="test-grid">
            ${filtered.map(t => {
                const likes = testLikesData[t.id] || 0;
                return `
                <div class="test-card fade-in" data-cat="${t.category}" onclick="location.hash='#test/${t.id}'">
                    <div class="thumb-wrapper">
                        <div class="test-thumb" style="background-image: url('${t.thumb}')">
                            <div class="like-badge">❤️ ${likes}</div>
                        </div>
                    </div>
                    <div class="test-info">
                        <span class="test-category-tag">${t.category}</span>
                        <h3>${t.title}</h3>
                        <p>${t.desc}</p>
                    </div>
                </div>`;
            }).join('')}
        </div>
    `;
    updateUI();
}

function renderProfile() {
    if (!UserState.user) {
        app.innerHTML = `<div class="card" style="text-align:center; padding:4rem;"><h2>👤 로그인이 필요합니다</h2><button id="login-btn" class="btn-primary" style="margin:1.5rem auto 0;">로그인하기</button></div>`;
        return;
    }
    const inv = UserState.data.inventory || [];
    const groupedInv = inv.reduce((acc, item) => { acc[item] = (acc[item] || 0) + 1; return acc; }, {});
    const invHTML = Object.entries(groupedInv).map(([name, count]) => `
        <div class="inv-card">
            <span class="inv-icon">${name.split(' ')[0]}</span>
            <span class="inv-name">${name.split(' ')[1] || ''}</span>
            <span class="inv-badge">${count}</span>
        </div>
    `).join('') || '<p class="text-sub">수집한 아이템이 없습니다.</p>';

    const currentScore = UserState.data.totalScore || 0;
    const tier = getTier(currentScore);
    const nextTier = TIERS[TIERS.indexOf(tier) + 1] || tier;
    const progress = tier === nextTier ? 100 : Math.min(100, (currentScore / nextTier.min) * 100);
    const stats = UserState.data.arcadeStats || { mining: 0, gacha: 0, alchemy: 0, lottery: 0, betting: 0, checkin: 0 };

    app.innerHTML = `
        <div class="profile-page fade-in">
            <div class="card profile-header-card" style="padding: 2.5rem 1.5rem; text-align: center; overflow: hidden; position: relative;">
                <div class="profile-accent-bg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100px; background: linear-gradient(135deg, var(--accent-color), var(--accent-soft)); opacity: 0.1;"></div>
                <div id="user-emoji" style="font-size: 5rem; margin: 0 auto 1rem; position: relative; display: inline-block; background: var(--card-bg); border-radius: 50%; width: 100px; height: 100px; line-height: 100px; box-shadow: var(--shadow-md);">👤</div>
                <div class="tier-badge" style="background: var(--accent-color); color: #fff; display: inline-block; padding: 4px 12px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; margin-bottom: 0.5rem; position: relative;">${tier.name}</div>
                <h2 id="user-name" style="font-size: 2rem; font-weight: 800; margin-bottom: 1.5rem;">닉네임</h2>
                
                <div class="progress-container" style="max-width: 400px; margin: 0 auto 2rem;">
                    <div class="progress-label" style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem;">
                        <span>등급 성장도</span>
                        <span>${currentScore.toLocaleString()} / ${nextTier.min.toLocaleString()}</span>
                    </div>
                    <div class="progress-track" style="height: 10px; background: var(--bg-color); border-radius: 10px; overflow: hidden;">
                        <div class="progress-fill" style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, var(--accent-color), var(--accent-soft)); border-radius: 10px;"></div>
                    </div>
                    <p style="font-size: 0.75rem; color: var(--text-sub); margin-top: 0.5rem;">다음 등급까지 <strong>${Math.max(0, nextTier.min - currentScore).toLocaleString()}P</strong> 남았습니다.</p>
                </div>

                <div class="profile-stats-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; max-width: 400px; margin: 0 auto;">
                    <div class="stat-box" style="background: var(--bg-color); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <span style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-sub); margin-bottom: 0.25rem;">누적 랭킹 점수</span>
                        <span style="font-size: 1.5rem; font-weight: 900; color: var(--accent-color);">${currentScore.toLocaleString()}</span>
                    </div>
                    <div class="stat-box" style="background: var(--bg-color); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <span style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-sub); margin-bottom: 0.25rem;">보유 포인트</span>
                        <span style="font-size: 1.5rem; font-weight: 900; color: var(--accent-secondary);">${(UserState.data.points || 0).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <details class="profile-details" open>
                <summary>📊 오락실 이용 통계</summary>
                <div class="content-area">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; text-align: center;">
                        <div><small class="text-sub">⛏️ 채굴</small><p><strong>${stats.mining || 0}</strong></p></div>
                        <div><small class="text-sub">📦 가챠</small><p><strong>${stats.gacha || 0}</strong></p></div>
                        <div><small class="text-sub">⚗️ 연금술</small><p><strong>${stats.alchemy || 0}</strong></p></div>
                        <div><small class="text-sub">🎫 복권</small><p><strong>${stats.lottery || 0}</strong></p></div>
                        <div><small class="text-sub">🎲 베팅</small><p><strong>${stats.betting || 0}</strong></p></div>
                        <div><small class="text-sub">📅 출석</small><p><strong>${stats.checkin || 0}</strong></p></div>
                    </div>
                </div>
            </details>

            <details class="profile-details" open>
                <summary>🎒 내 인벤토리</summary>
                <div class="content-area"><div class="inventory-grid">${invHTML}</div></div>
            </details>
            
            <details class="profile-details" open>
                <summary>🏪 이모지 교환소</summary>
                <div class="content-area shop-wrapper">
                    ${Object.entries(EMOJI_SHOP).map(([cat, emojis]) => `
                        <h4 style="margin-top:1rem; font-size:0.9rem; color:var(--accent-color);">${cat}</h4>
                        <div class="emoji-grid" style="margin-top:0.8rem;">
                            ${Object.entries(emojis).map(([e, price]) => `
                                <button class="emoji-btn ${UserState.data.unlockedEmojis.includes(e) ? 'owned' : 'locked'} ${UserState.data.emoji === e ? 'active' : ''}" data-emoji="${e}">
                                    <span class="e-icon">${e}</span>
                                    <span class="e-price">${price}</span>
                                </button>`).join('')}
                        </div>
                    `).join('')}
                </div>
            </details>

            <details class="profile-details">
                <summary>⚙️ 계정 설정</summary>
                <div class="content-area">
                    <div class="setting-group" style="background: var(--bg-color); padding: 1.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1rem;">
                        <label style="display: block; font-size: 0.9rem; font-weight: 800; margin-bottom: 0.75rem;">닉네임 변경</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" id="nickname-input" style="flex: 1; padding: 0.8rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 0.95rem;" placeholder="새 닉네임 입력">
                            <button id="nickname-save" class="btn-primary" style="padding: 0 1.5rem; font-size: 0.9rem;">변경</button>
                        </div>
                        <p id="nickname-msg" style="margin-top: 0.75rem; font-size: 0.8rem; font-weight: 600;"></p>
                    </div>
                    <button id="logout-btn" class="btn-secondary" style="width: 100%; padding: 1rem; color: #ef4444; border-color: rgba(239, 68, 68, 0.2); font-weight: 700;">로그아웃</button>
                </div>
            </details>

            ${UserState.isAdmin ? `
            <details class="profile-details admin-only" style="border-color: var(--accent-color);">
                <summary style="color: var(--accent-color);">🛡️ 관리자 콘솔 (Admin)</summary>
                <div class="content-area">
                    <div class="admin-tool-group" style="background: rgba(99, 102, 241, 0.05); padding: 1.5rem; border-radius: var(--radius-md); border: 1px dashed var(--accent-color);">
                        <h4 style="margin-bottom: 1rem; font-size: 0.95rem;">👤 사용자 관리</h4>
                        <button id="admin-search-users" class="btn-secondary" style="width:100%; margin-bottom:1rem; border-color:var(--accent-color); color:var(--accent-color);">사용자 목록 불러오기</button>
                        <div id="admin-user-list-container" style="max-height: 200px; overflow-y: auto; margin-bottom: 1.5rem; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border-color); display: none;"></div>
                        
                        <h4 style="margin-bottom: 1rem; font-size: 0.95rem;">💰 사용자 자산 관리</h4>
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <input type="text" id="admin-target-uid" style="padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" placeholder="대상 UID (미입력 시 본인)">
                            <div style="display: flex; gap: 0.5rem;">
                                <input type="number" id="admin-amount" style="flex: 1; padding: 0.8rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);" placeholder="수량 (+ 또는 -)">
                                <button id="admin-charge-points-btn" class="btn-primary" style="background: var(--accent-secondary); box-shadow: none; font-size: 0.8rem; padding: 0 10px;">포인트 집행</button>
                                <button id="admin-charge-score-btn" class="btn-primary" style="background: var(--accent-color); box-shadow: none; font-size: 0.8rem; padding: 0 10px;">점수 집행</button>
                            </div>
                        </div>
                        <p id="admin-msg" style="margin-top: 0.75rem; font-size: 0.8rem; font-weight: 700; color: var(--accent-color);"></p>
                    </div>
                </div>
            </details>
            ` : ''}
        </div>
    `;
    updateUI();
    if (UserState.isAdmin) {
        document.getElementById('admin-charge-points-btn').onclick = async () => {
            const uid = document.getElementById('admin-target-uid').value.trim();
            const amount = parseInt(document.getElementById('admin-amount').value);
            const msg = document.getElementById('admin-msg');
            if (isNaN(amount)) return alert("금액을 정확히 입력하세요.");
            if (await chargeUserPoints(uid, amount)) {
                msg.textContent = `성공: ${uid || '본인'}에게 ${amount}P 적용 완료.`;
                document.getElementById('admin-amount').value = '';
            } else { msg.textContent = "실패: 사용자 정보를 확인하세요."; }
        };
        document.getElementById('admin-charge-score-btn').onclick = async () => {
            const uid = document.getElementById('admin-target-uid').value.trim();
            const amount = parseInt(document.getElementById('admin-amount').value);
            const msg = document.getElementById('admin-msg');
            if (isNaN(amount)) return alert("수량을 정확히 입력하세요.");
            if (await chargeUserScore(uid, amount)) {
                msg.textContent = `성공: ${uid || '본인'}에게 ${amount}점 적용 완료.`;
                document.getElementById('admin-amount').value = '';
            } else { msg.textContent = "실패: 사용자 정보를 확인하세요."; }
        };
        document.getElementById('admin-search-users').onclick = async () => {
            const listContainer = document.getElementById('admin-user-list-container');
            try {
                const snap = await getDocs(collection(db, "users"));
                const users = [];
                snap.forEach(d => {
                    const data = d.data();
                    users.push(`
                        <div style="display:flex; justify-content:space-between; align-items:center; padding: 0.6rem; border-bottom: 1px solid var(--border-color);">
                            <div style="display:flex; flex-direction:column; overflow:hidden;">
                                <span style="font-size:0.85rem; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${data.nickname}</span>
                                <small style="font-size:0.65rem; color:var(--text-sub);">${d.id}</small>
                            </div>
                            <button class="admin-select-user-btn btn-secondary" data-uid="${d.id}" style="padding: 4px 8px; font-size: 0.7rem; white-space:nowrap;">등록</button>
                        </div>
                    `);
                });
                listContainer.innerHTML = users.join('');
                listContainer.style.display = 'block';
                
                listContainer.querySelectorAll('.admin-select-user-btn').forEach(btn => {
                    btn.onclick = () => {
                        document.getElementById('admin-target-uid').value = btn.dataset.uid;
                        alert(`${btn.dataset.uid} 사용자가 선택되었습니다.`);
                    };
                });
            } catch (e) { alert("목록 로드 실패"); }
        };
    }
}

function renderArcade() {
    if (!UserState.user) { renderProfile(); return; }
    app.innerHTML = `
        <div class="arcade-page fade-in">
            <div class="card arcade-header" style="text-align:center; padding: 2.5rem 1.5rem; background: linear-gradient(135deg, var(--accent-color), var(--accent-soft)); color: #fff; border: none; margin-bottom: 2rem; border-radius: var(--radius-lg); position: relative; overflow: hidden;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: 0.1;"></div>
                <h2 style="font-size: 2.2rem; font-weight: 900; margin-bottom: 0.5rem; position: relative;">🎰 SEVEN ARCADE</h2>
                <p style="opacity: 0.9; font-size: 1rem; font-weight: 600; position: relative;">매일 즐거운 게임과 포인트 혜택!</p>
                <div class="arcade-user-stats" style="display: inline-flex; justify-content: center; gap: 2rem; margin-top: 2rem; background: rgba(255,255,255,0.2); padding: 0.8rem 2rem; border-radius: 50px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.3); position: relative;">
                    <div style="display:flex; align-items:center; gap:8px;"><span style="font-size:0.85rem; font-weight:700;">내 포인트:</span><span id="user-points" style="font-weight:900; font-size: 1.1rem;">0</span></div>
                    <div style="display:flex; align-items:center; gap:8px;"><span style="font-size:0.85rem; font-weight:700;">부스터:</span><span style="font-weight:900; font-size: 1.1rem;">${UserState.data.boosterCount || 0}회</span></div>
                </div>
            </div>

            <div class="arcade-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
                <!-- 1. 출석체크 -->
                <div class="card arcade-item-card" style="margin-bottom:0; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">📅 일일 출석체크</h3>
                        <span style="background: rgba(16, 185, 129, 0.1); color: #10b981; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">FREE</span>
                    </div>
                    <p class="text-sub" style="font-size:0.9rem; margin-bottom:1.5rem; flex-grow: 1;">하루 한 번, 클릭만으로 <strong>100P</strong>를 즉시 획득하세요.</p>
                    <button id="daily-checkin-btn" class="btn-primary" style="width:100%; background:#10b981; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);">출석체크 완료하기</button>
                </div>

                <!-- 2. 포인트 채굴 -->
                <div class="card arcade-item-card" style="margin-bottom:0; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">⛏️ 포인트 채굴</h3>
                        <span style="background: rgba(99, 102, 241, 0.1); color: var(--accent-color); padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">LIMITLESS</span>
                    </div>
                    <p class="text-sub" style="font-size:0.9rem; margin-bottom:1.5rem; flex-grow: 1;">채굴기를 가동하여 무작위 포인트를 생산합니다. (5~15P)</p>
                    <button id="click-game-btn" class="btn-primary" style="width:100%; height:55px; background:linear-gradient(90deg, var(--accent-color), #8b5cf6);">채굴기 가동 시작</button>
                </div>

                <!-- 3. 복권 -->
                <div class="card arcade-item-card" style="margin-bottom:0; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">🎫 럭키 복권</h3>
                        <span style="background: rgba(253, 160, 133, 0.1); color: #fda085; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">JACKPOT</span>
                    </div>
                    <div id="lotto-result" class="lotto-card" style="height:70px; display:flex; align-items:center; justify-content:center; margin-bottom:1.25rem; border:2px dashed #fda085; border-radius:15px; font-weight:800; font-size:1rem; background:rgba(253,160,133,0.05); color: #fda085;">당신의 행운을 테스트하세요!</div>
                    <button id="lotto-btn" class="btn-primary" style="width:100%; background:#fda085; box-shadow: 0 4px 14px rgba(253, 160, 133, 0.3);">복권 구매 (500P)</button>
                </div>

                <!-- 4. 베팅 -->
                <div class="card arcade-item-card" style="margin-bottom:0;">
                    <h3 style="font-size:1.2rem; font-weight: 800; margin-bottom: 1rem; display:flex; align-items:center; gap:10px;">🎲 포인트 베팅</h3>
                    <div style="background: var(--bg-color); padding: 1rem; border-radius: var(--radius-md); margin-bottom: 1rem; border: 1px solid var(--border-color);">
                        <label style="display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-sub); margin-bottom: 0.5rem;">베팅 금액 설정</label>
                        <input type="number" id="bet-amount" value="100" min="10" style="width:100%; background: transparent; border: none; text-align:center; font-size:1.5rem; font-weight:900; color: var(--accent-color); outline: none;">
                    </div>
                    <div id="bet-result-msg" style="text-align:center; font-weight:800; margin-bottom:1rem; min-height:35px; font-size:0.9rem; color: var(--text-sub);">Ready to play?</div>
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.6rem;">
                        <button class="bet-btn btn-secondary" style="font-weight: 800;" data-game="oddeven" data-choice="odd">홀수</button>
                        <button class="bet-btn btn-secondary" style="font-weight: 800;" data-game="oddeven" data-choice="even">짝수</button>
                        <button class="bet-btn btn-secondary" style="font-weight: 800;" data-game="dice" data-choice="low">1 ~ 3</button>
                        <button class="bet-btn btn-secondary" style="font-weight: 800;" data-game="dice" data-choice="high">4 ~ 6</button>
                    </div>
                </div>

                <!-- 5. 아이템 뽑기 -->
                <div class="card arcade-item-card" style="margin-bottom:0;">
                    <h3 style="font-size:1.2rem; font-weight: 800; margin-bottom: 1rem; display:flex; align-items:center; gap:10px;">📦 아이템 뽑기</h3>
                    <div id="gacha-result" class="gacha-box" style="min-height:75px; display:flex; align-items:center; justify-content:center; margin-bottom:1.25rem; border:2px dashed var(--border-color); border-radius:15px; text-align:center; font-size:0.9rem; background:rgba(0,0,0,0.02); font-weight: 600;">희귀 아이템이 쏟아집니다</div>
                    <div style="display:grid; grid-template-columns: 1fr 1.5fr; gap:0.6rem;">
                        <button id="gacha-btn" class="btn-primary" style="background:var(--text-main); box-shadow: 0 4px 14px rgba(30, 41, 59, 0.2);">1회 (100P)</button>
                        <button id="gacha-10-btn" class="btn-primary" style="background:var(--accent-color); box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);">10회 (950P 🔥)</button>
                    </div>
                </div>

                <!-- 6. 연금술 -->
                <div class="card arcade-item-card" style="margin-bottom:0; display: flex; flex-direction: column;">
                    <h3 style="font-size:1.2rem; font-weight: 800; margin-bottom: 1rem; display:flex; align-items:center; gap:10px;">⚗️ 아이템 연금술</h3>
                    <p class="text-sub" style="font-size:0.9rem; margin-bottom:1.5rem; flex-grow: 1;">재료 5개 ➔ 상급 아이템 연성<br><small style="color:var(--accent-color);">(수수료 500P 소모)</small></p>
                    <div id="alchemy-result" style="text-align:center; font-weight:800; color:var(--accent-color); margin-bottom:1rem; min-height:35px; font-size:0.9rem;"></div>
                    <button id="alchemy-btn" class="btn-primary" style="width:100%; background:var(--accent-secondary); box-shadow: 0 4px 14px rgba(16, 185, 129, 0.2);">연금술 합체!</button>
                </div>

                <!-- 7. UP DOWN -->
                <div class="card arcade-item-card" style="margin-bottom:0;">
                    <h3 style="font-size:1.2rem; font-weight: 800; margin-bottom: 1rem; display:flex; align-items:center; gap:10px;">🔢 UP & DOWN</h3>
                    <p class="text-sub" style="font-size:0.9rem; margin-bottom:1.5rem;">1~50 숫자 맞추기 (보상 <strong>50P</strong>)</p>
                    <div style="display:flex; gap:0.6rem; background: var(--bg-color); padding: 0.5rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                        <input type="number" id="updown-input" style="flex:1; background: transparent; border: none; text-align:center; font-size:1.2rem; font-weight:800; outline: none;" placeholder="??">
                        <button id="updown-submit" class="btn-primary" style="width:80px; height: 45px; padding:0;">확인</button>
                    </div>
                    <p id="updown-msg" style="text-align:center; margin-top:1.25rem; font-weight:900; color:var(--accent-color); font-size:1rem; min-height: 24px;"></p>
                </div>

                <!-- 8. 아이템 판매소 (Market) -->
                <div class="card arcade-item-card" style="margin-bottom:0; border: 2px solid var(--accent-soft); background: rgba(99, 102, 241, 0.02);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="font-size:1.2rem; font-weight: 800; display:flex; align-items:center; gap:10px;">🏪 아이템 중고장터</h3>
                        <span style="background: var(--accent-color); color: #fff; padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 800;">HOT</span>
                    </div>
                    <p class="text-sub" style="font-size:0.9rem; margin-bottom:1.5rem;">보유한 아이템을 포인트로 즉시 환전하세요. (가치의 70% 환급)</p>
                    <div id="market-ui-container"></div>
                    <button id="market-open-btn" class="btn-secondary" style="width:100%; border-width: 2px; border-color:var(--accent-color); color:var(--accent-color); font-weight: 800;">판매 목록 열기</button>
                </div>
            </div>

            <!-- 부스터는 하단에 별도 배치 -->
            <div class="card booster-section fade-in" style="margin-top:2.5rem; background:linear-gradient(90deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); border: 2px solid var(--accent-soft); padding: 2rem; border-radius: var(--radius-lg);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.5rem;">
                    <div style="flex: 1; min-width: 250px;">
                        <h3 style="font-size:1.4rem; font-weight: 900; color:var(--accent-color); margin-bottom:0.5rem; display: flex; align-items: center; gap: 8px;">⚡ 슈퍼 부스터 (Super Booster)</h3>
                        <p class="text-sub" style="font-size:0.95rem; font-weight: 600;">부스터 활성화 시 모든 테스트 보상 포인트가 <strong>2배(20P)</strong>로 지급됩니다.</p>
                    </div>
                    <button id="buy-booster-btn" class="btn-primary" style="background:var(--accent-color); padding: 1rem 2.5rem; font-size: 1rem; border-radius: 50px;">부스터 20회 충전 (100P)</button>
                </div>
            </div>
        </div>
    `;
    initArcade(); 
    document.getElementById('buy-booster-btn').onclick = async () => {
        if (await usePoints(100)) {
            await updateDoc(doc(db, "users", UserState.user.uid), { boosterCount: increment(20) });
            UserState.data.boosterCount = (UserState.data.boosterCount || 0) + 20;
            updateUI(); alert("부스터 충전 완료! 🔥"); renderArcade();
        }
    };
    updateUI();
}

async function renderResult(testId, answers) {
    const test = TESTS.find(t => t.id === testId);
    const result = test.results[answers.filter(x => x==='A').length >= 4 ? 'A' : 'B'];
    let reward = 10;
    if (UserState.user && UserState.data.boosterCount > 0) {
        reward = 20;
        await updateDoc(doc(db, "users", UserState.user.uid), { boosterCount: increment(-1) });
        UserState.data.boosterCount -= 1;
    }
    if (UserState.user) await addPoints(reward);

    app.innerHTML = `
        <div class="result-card fade-in" data-cat="${test.category}">
            <span class="test-category">분석 리포트</span>
            <div class="result-img" style="background-image: url('${result.img}'); background-size:cover; background-position:center;"></div>
            <h2 style="color:var(--accent-color);">[${result.title}]</h2>
            <div class="result-desc" style="text-align:left; line-height:1.8; margin:1.5rem 0;"><p>${result.desc}</p></div>
            <button id="like-btn" class="btn-secondary" style="width:auto; padding:0.6rem 1.5rem; border-radius:50px; margin-bottom:1.5rem;">❤️ 좋아요 <span id="like-count-${testId}">${testLikesData[testId] || 0}</span></button>
            <p class="text-sub" style="font-weight:800; color:var(--accent-secondary);">보상 +${reward}P 지급 완료!</p>
            <div class="share-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; margin-top:1.5rem;">
                <button class="btn-primary" id="share-result" style="background:var(--text-main);">결과 공유</button>
                <button class="btn-primary" id="share-test" style="background:var(--accent-soft);">링크 공유</button>
            </div>
            <button class="btn-secondary" style="width:100%; margin-top:1rem;" onclick="location.hash='#home'">다른 테스트 보러 가기</button>
        </div>`;
    document.getElementById('like-btn').onclick = () => handleLike(testId);
    document.getElementById('share-result').onclick = () => shareTest(testId, `나의 결과: ${result.title}`);
    document.getElementById('share-test').onclick = () => copyLink(window.location.origin + `/#test/${testId}`);
}

function renderPrivacy() { app.innerHTML = `<div class="card legal-page fade-in"><h2>🔒 개인정보처리방침</h2><p>귀하의 데이터는 안전하게 보호됩니다.</p></div>`; }
function renderAbout() { app.innerHTML = `<div class="card guide-container fade-in"><h2>✨ 서비스 소개</h2><p>SevenCheck Studio는 심리 분석과 성장의 재미를 결합한 플랫폼입니다.</p></div>`; }
function renderTerms() { app.innerHTML = `<div class="card legal-page fade-in"><h2>📜 이용약관</h2><p>이용 규칙을 준수해 주세요.</p></div>`; }
function renderContact() { app.innerHTML = `<div class="card guide-container fade-in" style="text-align:center;"><h2>📧 문의하기</h2><p>support@sevencheck.studio</p></div>`; }

function renderGuide() {
    app.innerHTML = `
        <div class="guide-page fade-in">
            <div class="card guide-header" style="text-align:center; padding: 3.5rem 1.5rem; background: linear-gradient(135deg, var(--color-guide), #94a3b8); color: #fff; border: none; margin-bottom: 2rem; border-radius: var(--radius-lg);">
                <h2 style="font-size: 2.5rem; font-weight: 900; margin-bottom: 0.75rem;">📖 이용 가이드</h2>
                <p style="opacity: 0.9; font-size: 1.1rem; font-weight: 600;">SevenCheck을 완벽하게 즐기는 방법을 안내해 드립니다.</p>
            </div>

            <details class="profile-details" open>
                <summary>🧠 심리 테스트 및 분석</summary>
                <div class="content-area">
                    <p style="margin-bottom: 1.25rem; line-height: 1.7;">SevenCheck의 모든 테스트는 <strong>딱 7번의 질문</strong>으로 당신의 잠재력과 본모습을 정교하게 분석합니다.</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                        <div style="background: var(--bg-color); padding: 1.25rem; border-radius: 12px;">
                            <h4 style="color: var(--color-personality); margin-bottom: 0.5rem;">다양한 카테고리</h4>
                            <p style="font-size: 0.85rem; color: var(--text-sub);">성격, 비주얼, 운세, 재미 등 당신이 궁금한 모든 분야의 리포트를 제공합니다.</p>
                        </div>
                        <div style="background: var(--bg-color); padding: 1.25rem; border-radius: 12px;">
                            <h4 style="color: var(--accent-secondary); margin-bottom: 0.5rem;">참여 보상</h4>
                            <p style="font-size: 0.85rem; color: var(--text-sub);">테스트 완료 시 기본 10P가 지급되며, 부스터 사용 시 20P를 획득합니다.</p>
                        </div>
                    </div>
                </div>
            </details>

            <details class="profile-details" open>
                <summary>💰 포인트 및 부스터 시스템</summary>
                <div class="content-area">
                    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                        <div>
                            <h4 style="color: var(--accent-color); margin-bottom: 0.5rem; font-size: 1.1rem;">포인트(P) 활용처</h4>
                            <p style="font-size: 0.95rem; line-height: 1.6;">모은 포인트는 오락실 게임 참여, 복권 구매, 게시글 강조, 그리고 상점에서 희귀 이모지를 교환하는 데 사용할 수 있습니다.</p>
                        </div>
                        <div style="background: linear-gradient(90deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); padding: 1.5rem; border-radius: 15px; border: 2px solid var(--accent-soft);">
                            <h4 style="color: var(--accent-color); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">⚡ 슈퍼 부스터 (Super Booster)</h4>
                            <p style="font-size: 0.9rem; line-height: 1.6; font-weight: 600;">오락실에서 부스터를 충전하면 다음 20회의 테스트 완료 보상이 <strong>무조건 2배(20P)</strong>로 적용됩니다. 빠른 성장을 위한 필수 아이템입니다!</p>
                        </div>
                    </div>
                </div>
            </details>

            <details class="profile-details" open>
                <summary>🎰 세븐 오락실 (Seven Arcade)</summary>
                <div class="content-area">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.25rem;">
                        <div style="border-left: 3px solid var(--accent-color); padding-left: 1rem;">
                            <h4 style="margin-bottom: 0.4rem;">⛏️ 포인트 채굴</h4>
                            <p style="font-size: 0.85rem; color: var(--text-sub);">별도의 비용 없이 클릭만으로 소량의 포인트를 지속적으로 생산합니다.</p>
                        </div>
                        <div style="border-left: 3px solid #fda085; padding-left: 1rem;">
                            <h4 style="margin-bottom: 0.4rem;">🎫 럭키 복권</h4>
                            <p style="font-size: 0.85rem; color: var(--text-sub);">최대 30,000P 당첨의 기회! 당신의 행운을 시험해 보세요.</p>
                        </div>
                        <div style="border-left: 3px solid var(--accent-secondary); padding-left: 1rem;">
                            <h4 style="margin-bottom: 0.4rem;">⚗️ 아이템 연금술</h4>
                            <p style="font-size: 0.85rem; color: var(--text-sub);">아이템 5개를 합성하여 오직 연금술로만 나오는 <strong>초희귀 아이템</strong>을 연성합니다.</p>
                        </div>
                        <div style="border-left: 3px solid #f43f5e; padding-left: 1rem;">
                            <h4 style="margin-bottom: 0.4rem;">🏪 중고장터</h4>
                            <p style="font-size: 0.85rem; color: var(--text-sub);">수집한 아이템이 너무 많다면 장터에 판매하여 즉시 포인트로 환전하세요.</p>
                        </div>
                    </div>
                </div>
            </details>

            <details class="profile-details" open>
                <summary>🏆 등급 및 랭킹</summary>
                <div class="content-area">
                    <p style="margin-bottom: 1.25rem;">보유한 모든 아이템의 가치를 합산한 <strong>'아이템 점수'</strong>로 당신의 명예가 결정됩니다.</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-color); padding: 1.5rem; border-radius: 12px; font-weight: 800; font-size: 0.85rem; overflow-x: auto; white-space: nowrap; gap: 10px;">
                        <span>ROOKIE</span> ➔ <span>BRONZE</span> ➔ <span>SILVER</span> ➔ <span>GOLD</span> ➔ <span>PLATINUM</span> ➔ <span style="color: var(--accent-color);">DIAMOND</span>
                    </div>
                    <p style="margin-top: 1.25rem; font-size: 0.95rem;">상위 10명의 수집가는 <strong>랭킹</strong> 페이지에 실시간으로 등재되어 모든 사용자에게 공개됩니다.</p>
                </div>
            </details>

            <details class="profile-details">
                <summary>💬 커뮤니티 매너</summary>
                <div class="content-area" style="line-height: 1.8; font-size: 0.95rem;">
                    <p>1. 모든 사용자는 서로를 존중하며 따뜻한 언어를 사용해야 합니다.</p>
                    <p>2. <strong>게시글 강조(Premium)</strong> 기능을 사용하면 리스트 상단에 화려한 효과와 함께 고정됩니다.</p>
                    <p>3. 도배, 욕설, 광고 등 부적절한 활동은 서비스 이용이 제한될 수 있습니다.</p>
                </div>
            </details>
        </div>
    `;
}

function renderTestExecution(testId) {
    const test = TESTS.find(t => t.id === testId);
    if (!test) return;
    let step = 0;
    const answers = [];

    const updateStep = () => {
        if (step >= 7) { renderResult(testId, answers); return; }
        const qData = test.questions[step];
        app.innerHTML = `
            <div class="test-container fade-in" data-cat="${test.category}">
                <div class="test-header-info">
                    <span class="step-counter">Question ${String(step + 1).padStart(2, '0')} / 07</span>
                    <div class="progress-mini"><div class="progress-mini-fill" style="width:${((step + 1) / 7) * 100}%"></div></div>
                </div>
                <h2 class="test-question">${qData.q}</h2>
                <div class="options-grid">
                    ${qData.options.map((opt, idx) => `
                        <button class="option-btn fade-in" style="animation-delay: ${idx * 0.1}s" data-type="${opt.type}">
                            ${opt.text}
                        </button>`).join('')}
                </div>
            </div>`;
        app.querySelectorAll('.option-btn').forEach(btn => {
            btn.onclick = () => {
                answers.push(btn.dataset.type);
                step++;
                updateStep();
            };
        });
    };
    updateStep();
}

themeToggle.onclick = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '✨';
};
window.addEventListener('hashchange', router);
window.addEventListener('load', router);
initAuth();
router();
