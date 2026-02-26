const app = document.getElementById('app');

export function renderPrivacy() {
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
    app.innerHTML = `
        <div class="card legal-page fade-in">
            <h2 style="margin-bottom: 2rem; color: var(--accent-color);">📜 이용약관</h2>
            <div class="legal-content" style="line-height: 1.8; font-size: 0.95rem; color: var(--text-main);">
                <h4 style="margin-top: 1.5rem;">1. 서비스 이용</h4>
                <p>이용자는 본 약관을 준수해야 하며, 타인의 정보를 도용하거나 서비스의 정상적인 운영을 방해하는 행위를 해서는 안 됩니다.</p>
                <h4 style="margin-top: 1.5rem;">2. 포인트 및 아이템 (Arcade System)</h4>
                <p>- 서비스 내에서 획득한 포인트(P)와 아이템은 현금으로 환전할 수 없습니다.<br>- 부정한 방법으로 획득한 포인트는 사전 고지 없이 회수될 수 있습니다.<br>- 아이템의 가치는 서비스 업데이트에 따라 변동될 수 있습니다.</p>
                <h4 style="margin-top: 1.5rem;">3. 커뮤니티 이용 규칙</h4>
                <p>게시판 이용 시 욕설, 비방, 광고성 게시글은 관리자에 의해 삭제될 수 있으며, 반복 시 이용이 제한될 수 있습니다.</p>
                <h4 style="margin-top: 1.5rem;">4. 면책 사항</h4>
                <p>심리 테스트 결과는 통계적 경향성에 기반한 것으로, 의학적 진단이나 법적 판단의 근거로 사용될 수 없습니다.</p>
            </div>
        </div>`;
}

export function renderContact() {
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

export function renderGuide() {
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

            <!-- Encyclopedia CTA -->
            <div class="card" style="margin-top: 2.5rem; background: linear-gradient(135deg, #334155, #1e293b); color: #fff; border: none; text-align: center; padding: 2.5rem 1.5rem;">
                <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 0.75rem;">📒 수집한 아이템이 궁금하신가요?</h3>
                <p style="opacity: 0.8; font-size: 0.9rem; margin-bottom: 1.5rem;">지금까지 발견한 모든 아이템의 상세 정보와 가치를 확인해보세요.</p>
                <button onclick="location.hash='#book'" class="btn-primary" style="background: var(--accent-color); border: none; padding: 0.8rem 2rem; font-weight: 800;">아이템 도감 열기</button>
            </div>
        </div>
    `;
}

export function renderAbout() {
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
