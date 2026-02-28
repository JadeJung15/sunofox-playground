import { UserState } from '../auth.js?v=8.4.0';
import { ITEM_GRADES, ITEM_VALUES } from '../constants/shops.js';

export function renderAbout() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="card guide-container fade-in">
            <h2 style="margin-bottom: 1.5rem; color: var(--accent-color);">✨ SevenCheck: 나를 찾는 여정</h2>
            <div style="line-height: 1.9; color: var(--text-main);">
                <p style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1.5rem;">"딱 7번의 질문으로, 당신의 내면을 비춥니다."</p>
                <p>SevenCheck Studio는 심리학적 통찰과 디지털 재미를 결합하여, 바쁜 현대인들이 잠시나마 자신을 돌아볼 수 있는 '마음의 쉼터'를 지향합니다.</p>
                <div style="background: var(--bg-color); padding: 1.5rem; border-radius: var(--radius-md); margin: 2rem 0;">
                    <h4 style="margin-bottom: 0.8rem;">🚀 우리의 미션</h4>
                    <ul style="list-style: none; padding: 0;">
                        <li>✅ 정교한 분석을 통한 자아 발견 도구 제공</li>
                        <li>✅ 심리 테스트와 게임화를 통한 즐거운 사용자 경험</li>
                        <li>✅ 수집과 성장의 재미를 느낄 수 있는 오락실 시스템</li>
                    </ul>
                </div>
                <p>우리는 단순히 결과를 보여주는 것에 그치지 않고, 당신이 가진 고유한 매력(Aura)을 발견하고 이를 가꿀 수 있는 커뮤니티를 만들어 갑니다.</p>
            </div>
        </div>`;
}

export function renderPrivacy() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="card legal-page fade-in">
            <h2 style="margin-bottom: 2rem; color: var(--accent-color);">🔒 개인정보처리방침</h2>
            <div class="legal-content" style="line-height: 1.8; font-size: 0.95rem; color: var(--text-main);">
                <p style="margin-bottom: 1.5rem;">SevenCheck Studio(이하 "서비스")는 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 및 관련 법령을 준수합니다.</p>

                <h4 style="margin-top: 1.5rem;">1. 수집하는 개인정보 항목</h4>
                <p>- 회원가입 시: 이메일 주소, 닉네임 (Google 소셜 로그인 경유)<br>
                   - 서비스 이용 시: 테스트 결과, 포인트 및 아이템 정보, 게시글/댓글, 접속 기록</p>

                <h4 style="margin-top: 1.5rem;">2. 개인정보의 수집 및 이용 목적</h4>
                <p>- 회원 식별 및 서비스 제공<br>
                   - 랭킹, 도감 등 게임화 기능 운영<br>
                   - 서비스 개선 및 통계 분석</p>

                <h4 style="margin-top: 1.5rem;">3. 개인정보의 보유 및 이용 기간</h4>
                <p>회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다. 단, 관련 법령에 따라 일정 기간 보존이 필요한 경우 해당 기간 동안 보관합니다.</p>

                <h4 style="margin-top: 1.5rem;">4. 제3자 서비스 이용 안내 (Google AdSense)</h4>
                <p>본 서비스는 Google AdSense를 통해 광고를 게재합니다. Google은 쿠키를 사용하여 이용자의 관심사에 기반한 광고를 표시할 수 있습니다.</p>
                <p style="margin-top: 0.75rem;">- Google의 광고 쿠키 사용으로 인해, 이용자가 본 서비스 또는 다른 웹사이트를 방문할 때 Google이 광고를 게재할 수 있습니다.<br>
                   - 이용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener" style="color: var(--accent-color);">Google 광고 설정</a> 페이지에서 맞춤 광고를 비활성화할 수 있습니다.<br>
                   - 또한 <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener" style="color: var(--accent-color);">aboutads.info</a>를 방문하여 관심 기반 광고에 사용되는 제3자 벤더의 쿠키를 비활성화할 수 있습니다.</p>

                <h4 style="margin-top: 1.5rem;">5. 이용자의 권리</h4>
                <p>이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있습니다. 개인정보 관련 문의는 아래 연락처로 접수하십시오.</p>

                <h4 style="margin-top: 1.5rem;">6. 개인정보 보호 책임자</h4>
                <p>이메일: sunofox.official@gmail.com</p>

                <p style="margin-top: 2rem; font-size: 0.85rem; color: var(--text-sub);">본 방침은 2025년 1월 1일부터 시행됩니다.</p>
            </div>
        </div>`;
}

export function renderTerms() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="card legal-page fade-in">
            <h2 style="margin-bottom: 2rem; color: var(--accent-color);">📜 이용약관</h2>
            <div class="legal-content" style="line-height: 1.8; font-size: 0.95rem; color: var(--text-main);">
                <p style="margin-bottom: 1.5rem; font-weight: 600;">SevenCheck 서비스를 이용해 주셔서 감사합니다. 본 약관은 이용자가 서비스를 이용함에 있어 필요한 권리, 의무 및 책임사항을 규정합니다.</p>

                <h4 style="margin-top: 1.5rem;">1. 서비스의 이용</h4>
                <p>이용자는 본 약관 및 관련 법령을 준수해야 합니다. 타인의 개인정보를 도용하거나 서비스의 정상적인 운영을 방해하는 행위(해킹, 매크로 사용 등)는 엄격히 금지되며, 위반 시 서비스 이용이 제한될 수 있습니다.</p>

                <h4 style="margin-top: 1.5rem;">2. 디지털 자산 (포인트 및 아이템)</h4>
                <p>- 서비스 내에서 획득한 포인트(P)와 아이템은 서비스 내부에서만 사용 가능한 디지털 콘텐츠입니다.<br>
                   - 어떠한 경우에도 이를 현금으로 환전하거나 실제 화폐 거래의 대상으로 삼을 수 없습니다.<br>
                   - 시스템 오류나 부정한 방법으로 획득한 자산은 사전 고지 없이 회수되거나 조정될 수 있습니다.</p>

                <h4 style="margin-top: 1.5rem;">3. 이용자 콘텐츠 및 권리</h4>
                <p>- 이용자가 게시판에 작성한 게시물에 대한 지적재산권은 이용자에게 귀속됩니다.<br>
                   - 다만, 회사는 서비스의 운영, 홍보, 개선을 위해 이용자의 게시물을 복제, 전시, 수정할 수 있는 비독점적 라이선스를 가집니다.<br>
                   - 부적절한 게시물(비방, 욕설, 광고 등)은 관리자의 판단에 따라 삭제될 수 있습니다.</p>

                <h4 style="margin-top: 1.5rem;">4. 서비스의 변경 및 중단</h4>
                <p>회사는 최상의 서비스 경험을 제공하기 위해 예고 없이 기능의 일부를 변경하거나 업데이트할 수 있습니다. 또한 운영상의 사유로 서비스를 일시 중단하거나 종료할 수 있습니다.</p>

                <h4 style="margin-top: 1.5rem;">5. 책임의 제한 (면책 사항)</h4>
                <p>- 회사는 서비스 내 제공되는 분석 결과의 정확성이나 신뢰성을 보증하지 않습니다. 테스트 결과는 통계적 경향성에 기반한 엔터테인먼트 요소로만 활용되어야 하며, 전문적인 의학적 진단이나 법적 판단의 근거가 될 수 없습니다.<br>
                   - 이용자의 귀책사유로 발생한 서비스 이용 장애나 손해에 대해서는 책임을 지지 않습니다.</p>

                <h4 style="margin-top: 1.5rem;">6. 약관의 개정 및 분쟁 해결</h4>
                <p>- 본 약관은 법령의 변화나 서비스 정책에 따라 변경될 수 있으며, 변경 사항은 서비스 내 공지사항을 통해 알립니다.<br>
                   - 본 서비스와 관련한 모든 분쟁은 대한민국 법령을 준용하며, 관할 법원은 회사의 소재지 관할 법원으로 합니다.</p>

                <p style="margin-top: 2.5rem; font-size: 0.85rem; color: var(--text-sub);">시행일자: 2025년 1월 1일 (최종 수정일: 2026년 2월 27일)</p>
            </div>
        </div>`;
}

export function renderContact() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="card guide-container fade-in" style="text-align:center; padding: 4rem 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1.5rem;">📧</div>
            <h2 style="margin-bottom: 1rem; color: var(--accent-color);">무엇을 도와드릴까요?</h2>
            <p style="color: var(--text-sub); margin-bottom: 2.5rem;">서비스 이용 중 불편한 점이나 제휴 제안이 있으시면 언제든 연락주세요.</p>

            <div style="display: grid; gap: 1rem; max-width: 400px; margin: 0 auto; text-align: left;">
                <div style="background: var(--bg-color); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <small style="color: var(--text-sub); display: block; margin-bottom: 0.3rem;">공식 이메일</small>
                    <strong style="font-size: 1.1rem;">sunofox.official@gmail.com</strong>
                </div>
                <div style="background: var(--bg-color); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <small style="color: var(--text-sub); display: block; margin-bottom: 0.3rem;">운영 시간</small>
                    <strong style="font-size: 1.1rem;">평일 10:00 - 18:00 (KST)</strong>
                </div>
            </div>

            <p style="margin-top: 3rem; font-size: 0.85rem; color: var(--text-sub);">보통 영업일 기준 24시간 이내에 답변을 드립니다.</p>
        </div>`;
}

export async function renderEncyclopedia() {
    const app = document.getElementById('app');
    const discovered = UserState.data?.discoveredItems || [];

    const ITEM_DESCRIPTIONS = {
        '💩 돌멩이': '어디서나 흔히 볼 수 있는 평범한 돌멩이입니다. 가치는 낮지만 수집의 시작입니다.',
        '💊 물약': '기력을 회복시켜주는 기초적인 물약입니다. 연금술의 단골 재료입니다.',
        '🌱 묘목': '작고 소중한 생명의 시작입니다. 정성껏 돌보면 큰 나무가 될 잠재력이 있습니다.',
        '🦴 뼛조각': '오랜 세월 풍화된 정체 모를 동물의 뼛조각입니다.',
        '🪵 나뭇가지': '바닥에 떨어진 평범한 나뭇가지입니다. 무언가 만드는 재료로 쓸 수 있을 것 같습니다.',
        '🐚 조개껍데기': '해변에서 주워온 예쁜 조개껍데기입니다. 바다의 소리가 들리는 것 같습니다.',
        '🥉 동메달': '노력의 결실로 얻은 구리빛 메달입니다. 수집가로서의 첫 발걸음을 상징합니다.',
        '🥈 은메달': '뛰어난 성취를 증명하는 은빛 메달입니다. 상당한 가치를 지니고 있습니다.',
        '🌳 일반 나무': '울창한 잎을 가진 평범하지만 든든한 나무입니다. 자연의 기운을 담고 있습니다.',
        '⚔️ 녹슨 칼': '시간의 흐름을 이기지 못하고 녹슬어버린 칼입니다. 한때는 날카로웠을지도 모릅니다.',
        '🛡️ 낡은 방패': '수많은 전투의 흔적이 남은 낡은 방패입니다. 여전히 누군가를 지킬 준비가 되어 있습니다.',
        '🏹 연습용 활': '초보 궁수들이 사용하는 가벼운 활입니다. 과녁을 맞히는 재미가 있습니다.',
        '🥇 금메달': '최고의 영광을 상징하는 황금빛 메달입니다. 모든 수집가가 탐내는 귀한 아이템입니다.',
        '🍀 행운의 클로버': '발견하는 것만으로도 행운을 가져다준다는 희귀한 네잎 클로버입니다.',
        '🌲 전나무': '추운 겨울에도 푸르름을 잃지 않는 강인한 나무입니다. 고결한 분위기를 자아냅니다.',
        '🍎 사과나무': '달콤한 결실을 맺는 풍요로운 나무입니다. 보기만 해도 마음이 풍성해집니다.',
        '🔮 신비한 수정': '알 수 없는 빛을 내뿜는 신비한 수정입니다. 마법의 힘이 깃들어 있는 것 같습니다.',
        '🗝️ 황금 열쇠': '무엇이든 열 수 있을 것 같은 눈부신 황금 열쇠입니다. 보물 상자를 찾아보세요.',
        '📖 마법 서적': '고대 언어로 기록된 마법 서적입니다. 읽는 것만으로도 지혜가 샘솟는 기분입니다.',
        '🏺 고대 유물': '먼 과거의 문명이 남긴 귀중한 유물입니다. 역사적 가치가 매우 높습니다.',
        '💎 다이아몬드': '영원히 변치 않는 광채를 뿜어내는 최상급 보석입니다. 엄청난 가치를 자랑합니다.',
        '🧪 현자의 돌': '모든 물질을 금으로 바꿀 수 있다는 전설의 촉매제입니다. 연금술의 정점입니다.',
        '🧬 인공 생명체': '금단의 연금술로 탄생한 신비로운 존재입니다. 생명의 신비를 담고 있습니다.',
        '⚡ 번개 병': '폭풍우 치는 밤의 강력한 번개를 병 속에 가두었습니다. 엄청난 에너지가 요동칩니다.',
        '🌌 은하수 가루': '밤하늘의 은하수를 한 줌 담아온 듯한 신비로운 가루입니다. 우주의 기운이 느껴집니다.',
        '✨ 생명의 나무': '신화 속에서나 존재한다는 전설의 나무입니다. 영원한 생명력의 원천입니다.',
        '👑 제왕의 왕관': '진정한 지배자만이 쓸 수 있다는 전설의 왕관입니다. 범접할 수 없는 위엄이 느껴집니다.',
        '🗡️ 엑스칼리버': '바위에 박혀있던 전설의 성검입니다. 선택받은 자만이 이 검을 휘두를 수 있습니다.',
        '🐉 용의 심장': '강력한 고대 용의 박동이 느껴지는 심장입니다. 무한한 마력의 원천이라 전해집니다.',
        '🪐 성운의 조각': '우주의 탄생과 함께 생성된 성운의 조각입니다. 신의 영역에 닿은 자만이 소유할 수 있습니다.'
    };

    app.innerHTML = `
        <div class="book-page fade-in">
            <button onclick="location.hash='#guide'" class="btn-secondary" style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 8px; font-weight: 800; padding: 0.6rem 1.2rem; background: var(--card-bg); border-radius: 50px; box-shadow: var(--shadow-sm);">
                ← 가이드로 돌아가기
            </button>

            <div class="card book-header" style="background: linear-gradient(135deg, #1e293b, #334155); color:#fff; border:none; padding:3rem 1.5rem; text-align:center; border-radius: var(--radius-lg); margin-bottom:2rem;">
                <h2 style="font-size:2.2rem; font-weight:900; margin-bottom:0.5rem;">📒 아이템 도감</h2>
                <p style="opacity:0.9; font-weight:600;">세븐 오락실에서 발견한 모든 보물들의 상세 정보</p>
                <div style="margin-top:1.5rem; display:inline-block; background:rgba(255,255,255,0.1); padding:0.5rem 1.5rem; border-radius:50px; font-size:0.9rem; font-weight:800;">
                    수집률: ${discovered.length} / ${Object.keys(ITEM_VALUES).length} (${Math.round((discovered.length / Object.keys(ITEM_VALUES).length) * 100)}%)
                </div>
            </div>

            <div class="card" style="margin-bottom: 2rem; background: var(--bg-color); border: 1px solid var(--accent-soft); padding: 1.5rem;">
                <h3 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 1rem; color: var(--accent-color); display: flex; align-items: center; gap: 8px;">
                    💡 아이템 가치 및 획득 가이드
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                    <div>
                        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; font-weight: 800;">💎 가치 산정 방식</h4>
                        <p style="font-size: 0.85rem; color: var(--text-sub); line-height: 1.6;">
                            아이템의 가치는 <strong>희귀도(Grade)</strong>에 따라 결정됩니다. 등급이 높을수록 획득 확률이 낮아지며, 인벤토리에 보유한 모든 아이템의 가치 총합이 나의 <strong>'통합 아이템 점수'</strong>가 됩니다.
                        </p>
                    </div>
                    <div>
                        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; font-weight: 800;">🧪 효율적인 획득 방법</h4>
                        <ul style="font-size: 0.85rem; color: var(--text-sub); line-height: 1.6; padding-left: 1.2rem;">
                            <li><strong>뽑기:</strong> 가장 기본적인 획득 경로입니다.</li>
                            <li><strong>연금술:</strong> 낮은 등급 아이템 6개를 확정적으로 상위 등급으로 변환하여 가치를 크게 뻥튀기할 수 있습니다.</li>
                            <li><strong>복권:</strong> 낮은 확률로 '다이아몬드' 같은 고가치 아이템을 획득합니다.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; font-weight: 800;">🏆 명예와 랭킹</h4>
                        <p style="font-size: 0.85rem; color: var(--text-sub); line-height: 1.6;">
                            모은 점수에 따라 <strong>ROOKIE부터 DIAMOND</strong>까지 티어가 결정됩니다. 고가치 아이템을 많이 수집하여 명예의 전당(랭킹)에 이름을 올려보세요!
                        </p>
                    </div>
                </div>
            </div>

            ${Object.entries(ITEM_GRADES).map(([grade, items]) => `
                <div class="card" style="margin-bottom:2rem; border-left: 6px solid var(--color-${grade.toLowerCase()}, #ccc);">
                    <h3 style="margin-bottom:1.5rem; font-size:1.1rem; display:flex; align-items:center; gap:10px;">
                        ${grade === 'LEGENDARY' ? '✨' : grade === 'RARE' ? '💎' : grade === 'UNCOMMON' ? '🥈' : '💩'}
                        ${grade} 아이템
                    </h3>
                    <div class="book-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;">
                        ${items.map(name => {
                            const isUnlocked = discovered.includes(name);
                            const icon = name.split(' ')[0];
                            const label = name.substring(name.indexOf(' ') + 1);
                            const desc = ITEM_DESCRIPTIONS[name] || '정보가 없습니다.';

                            return `
                                <div class="book-item-card ${isUnlocked ? 'unlocked' : 'locked'}" style="background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 15px; padding: 1.5rem; transition: transform 0.2s, box-shadow 0.2s; ${isUnlocked ? '' : 'opacity: 0.6; filter: grayscale(0.8);'}">
                                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                        <div style="font-size: 2.5rem; background: var(--bg-color); width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; border-radius: 12px; border: 1px solid var(--border-color);">
                                            ${isUnlocked ? icon : '❓'}
                                        </div>
                                        <div>
                                            <h4 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.2rem;">${isUnlocked ? label : '???'}</h4>
                                            <span style="font-size: 0.85rem; font-weight: 900; color: var(--accent-color);">${ITEM_VALUES[name]}P</span>
                                        </div>
                                    </div>
                                    <p style="font-size: 0.85rem; line-height: 1.6; color: var(--text-sub); min-height: 3rem;">
                                        ${isUnlocked ? desc : '아직 발견하지 못한 아이템입니다. 오락실 활동을 통해 획득할 수 있습니다.'}
                                    </p>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

export function renderGuide() {
    const app = document.getElementById('app');
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
                            <p style="font-size: 0.85rem; color: var(--text-sub);">테스트 완료 시 기본 10P와 분석 결과에 따른 <strong>희귀 아이템</strong>이 지급됩니다.</p>
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
                            <p style="font-size: 0.95rem; line-height: 1.6;">모은 포인트는 오락실 게임 참여, 게시글 강조, 그리고 상점에서 희귀 이모지, 테두리, 배경을 교환하는 데 사용됩니다.</p>
                        </div>
                        <div style="background: linear-gradient(90deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1)); padding: 1.5rem; border-radius: 15px; border: 2px solid var(--accent-soft);">
                            <h4 style="color: var(--accent-color); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 8px;">⚡ 슈퍼 부스터 (Super Booster)</h4>
                            <p style="font-size: 0.9rem; line-height: 1.6; font-weight: 600;">오락실에서 부스터를 충전하면 다음 20회의 테스트 완료 보상이 <strong>무조건 2배(20P)</strong>로 적용되어 빠른 성장이 가능합니다.</p>
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
                            <p style="font-size: 0.85rem; color: var(--text-sub);">비용 없이 클릭만으로 5~15P를 지속적으로 생산합니다.</p>
                        </div>
                        <div style="border-left: 3px solid #fda085; padding-left: 1rem;">
                            <h4 style="margin-bottom: 0.4rem;">🎰 이모지 슬롯</h4>
                            <p style="font-size: 0.85rem; color: var(--text-sub);">3개의 이모지를 맞춰 최대 <strong>5,000P 잭팟</strong>을 노려보세요.</p>
                        </div>
                        <div style="border-left: 3px solid #f43f5e; padding-left: 1rem;">
                            <h4 style="margin-bottom: 0.4rem;">🧨 폭탄 돌리기</h4>
                            <p style="font-size: 0.85rem; color: var(--text-sub);">안전한 전선을 끊어 포인트를 누적하세요. 위험하지만 보상은 강력합니다.</p>
                        </div>
                        <div style="border-left: 3px solid var(--accent-secondary); padding-left: 1rem;">
                            <h4 style="margin-bottom: 0.4rem;">⚗️ 아이템 연금술</h4>
                            <p style="font-size: 0.85rem; color: var(--text-sub);">낮은 등급 아이템 6개를 합성하여 확정적으로 상위 아이템을 연성합니다.</p>
                        </div>
                    </div>
                </div>
            </details>

            <details class="profile-details" open>
                <summary>✨ 실시간 프로필 동기화</summary>
                <div class="content-area">
                    <p style="margin-bottom: 1rem; line-height: 1.7;">SevenCheck은 최신 웹 기술을 통해 <strong>실시간 프로필 동기화</strong>를 지원합니다.</p>
                    <ul style="font-size: 0.95rem; line-height: 1.8; color: var(--text-main);">
                        <li>✅ 닉네임이나 이모지를 변경하면 <strong>과거에 쓴 모든 게시물과 댓글</strong>이 즉시 업데이트됩니다.</li>
                        <li>✅ 상점에서 구매한 <strong>오라, 테두리, 배경</strong>도 실시간으로 모든 화면에 반영됩니다.</li>
                        <li>✅ 내가 획득한 티어(등급) 배지는 랭킹과 프로필에서 실시간으로 확인할 수 있습니다.</li>
                    </ul>
                </div>
            </details>

            <details class="profile-details">
                <summary>🏆 등급 및 랭킹</summary>
                <div class="content-area">
                    <p style="margin-bottom: 1.25rem;">보유한 모든 아이템의 가치를 합산한 <strong>'아이템 점수'</strong>로 당신의 명예가 결정됩니다.</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-color); padding: 1.5rem; border-radius: 12px; font-weight: 800; font-size: 0.85rem; overflow-x: auto; white-space: nowrap; gap: 10px;">
                        <span>ROOKIE</span> ➔ <span>BRONZE</span> ➔ <span>SILVER</span> ➔ <span>GOLD</span> ➔ <span>PLATINUM</span> ➔ <span style="color: var(--accent-color);">DIAMOND</span>
                    </div>
                    <p style="margin-top: 1.25rem; font-size: 0.95rem;">상위 10명의 수집가는 <strong>명예의 전당</strong>에 실시간으로 등재되어 모든 사용자에게 공개됩니다.</p>
                </div>
            </details>

            <details class="profile-details">
                <summary>💬 커뮤니티 매너</summary>
                <div class="content-area" style="line-height: 1.8; font-size: 0.95rem;">
                    <p>1. 모든 사용자는 서로를 존중하며 따뜻한 언어를 사용해야 합니다.</p>
                    <p>2. <strong>게시글 강조(Premium)</strong> 기능을 사용하면 화려한 효과와 함께 리스트 상단에 노출됩니다.</p>
                    <p>3. 도배, 욕설, 광고 등 부적절한 활동은 서비스 이용이 제한될 수 있습니다.</p>
                </div>
            </details>

            <div class="card" style="margin-top: 2.5rem; background: linear-gradient(135deg, #334155, #1e293b); color: #fff; border: none; text-align: center; padding: 2.5rem 1.5rem;">
                <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 0.75rem;">📒 수집한 아이템이 궁금하신가요?</h3>
                <p style="opacity: 0.8; font-size: 0.9rem; margin-bottom: 1.5rem;">지금까지 발견한 모든 아이템의 상세 정보와 가치를 확인해보세요.</p>
                <button onclick="location.hash='#book'" class="btn-primary" style="background: var(--accent-color); border: none; padding: 0.8rem 2rem; font-weight: 800;">아이템 도감 열기</button>
            </div>
        </div>
    `;
}
