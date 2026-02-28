import { UserState } from "../auth.js?v=8.0.0";
import {
    SUNO_PRESETS,
    SUNO_LANGUAGE_MODE_OPTIONS,
    SUNO_INTENSITY_OPTIONS
} from "../suno/presets.js?v=8.1.0";
import {
    consumeSunoGateRequest,
    getSunoRuntimeConfig,
    hasSunoAccess,
    unlockSunoForAllowedUser,
    unlockSunoWithPasscode
} from "../suno/access.js?v=8.1.0";
import { generateSunoDraft, saveSunoDraft } from "../suno/service.js?v=8.1.0";

const state = {
    presetId: SUNO_PRESETS[0].id,
    options: {
        languageMode: "KR_ONLY",
        vocalGender: "FEMALE",
        bpmHint: "",
        themeHint: "",
        intensity: "EMOTIONAL"
    },
    draft: {
        title: "",
        style: "",
        lyrics: ""
    },
    isBusy: false,
    gateOpen: false
};

let listenersBound = false;

function getSelectedPreset() {
    return SUNO_PRESETS.find(preset => preset.id === state.presetId) || SUNO_PRESETS[0];
}

function isUnlocked() {
    return hasSunoAccess({ user: UserState.user, isMaster: UserState.isMaster });
}

function copyText(value, label) {
    if (!value.trim()) {
        alert(`${label} 내용이 비어 있습니다.`);
        return;
    }

    navigator.clipboard.writeText(value)
        .then(() => alert(`${label} 복사가 완료되었습니다.`))
        .catch(() => alert("클립보드 복사에 실패했습니다."));
}

function getBundledDraftText() {
    return JSON.stringify({
        title: state.draft.title.trim(),
        style: state.draft.style.trim(),
        lyrics: state.draft.lyrics.trim()
    }, null, 2);
}

async function handleGenerate(variation = false) {
    if (!isUnlocked()) {
        alert("하단 Admin 링크에서 인증을 완료해 주세요.");
        return;
    }

    state.isBusy = true;
    renderSunoGenerator();

    try {
        const preset = getSelectedPreset();
        state.draft = await generateSunoDraft(preset, state.options, variation);
    } catch (error) {
        console.error("Suno draft generation failed:", error);
        alert("생성 중 오류가 발생했습니다.");
    } finally {
        state.isBusy = false;
        renderSunoGenerator();
    }
}

async function handleSave() {
    if (!isUnlocked()) {
        alert("인증이 필요합니다.");
        return;
    }

    if (!state.draft.title || !state.draft.style || !state.draft.lyrics) {
        alert("저장할 초안이 없습니다. 먼저 생성해 주세요.");
        return;
    }

    try {
        const result = await saveSunoDraft(state.draft, {
            presetId: state.presetId,
            presetName: getSelectedPreset().name,
            options: state.options,
            user: UserState.user
        });

        if (!result.ok && result.reason === "storage-disabled") {
            alert("저장 기능은 아직 비활성화 상태입니다. 설정에서 storage.enabled를 켜면 바로 연결됩니다.");
            return;
        }

        alert("초안이 저장되었습니다.");
    } catch (error) {
        console.error("Suno draft save failed:", error);
        alert("저장에 실패했습니다. Firestore 설정과 권한을 확인해 주세요.");
    }
}

function bindGlobalListeners() {
    if (listenersBound) return;
    listenersBound = true;

    window.addEventListener("suno:open-gate", () => {
        state.gateOpen = true;
        if (window.location.hash === "#suno" || window.location.hash === "#suno-generator") {
            renderSunoGenerator();
        }
    });
}

function getGateMessage() {
    const config = getSunoRuntimeConfig();
    const passcodeConfigured = !!config.access?.passcodeHash;
    const emailWhitelistEnabled = !!config.access?.allowFirebaseWhitelist && (config.access?.allowedEmails || []).length > 0;

    if (passcodeConfigured && emailWhitelistEnabled) {
        return "패스코드 또는 허용된 Firebase 계정으로 잠금을 해제할 수 있습니다.";
    }
    if (passcodeConfigured) {
        return "설정된 패스코드를 입력하면 현재 세션 동안 편집 기능이 활성화됩니다.";
    }
    if (emailWhitelistEnabled) {
        return "현재는 허용된 Firebase 계정 로그인으로만 잠금 해제가 가능합니다.";
    }
    return "현재 접근 설정이 비어 있습니다. js/site-config.js에서 passcodeHash 또는 allowedEmails를 설정해 주세요.";
}

function renderPresetButtons() {
    return SUNO_PRESETS.map(preset => `
        <button
            class="suno-chip ${state.presetId === preset.id ? "active" : ""}"
            data-suno-preset="${preset.id}"
            ${!isUnlocked() ? "disabled" : ""}
        >${preset.name}</button>
    `).join("");
}

function renderSelectOptions(options, selectedValue) {
    return options.map(option => `
        <option value="${option.value}" ${selectedValue === option.value ? "selected" : ""}>${option.label}</option>
    `).join("");
}

function bindPageEvents() {
    const app = document.getElementById("app");
    const unlocked = isUnlocked();
    if (!app) return;

    app.querySelectorAll("[data-suno-preset]").forEach(button => {
        button.addEventListener("click", () => {
            state.presetId = button.dataset.sunoPreset;
            renderSunoGenerator();
        });
    });

    app.querySelectorAll("[data-suno-option]").forEach(input => {
        input.addEventListener("change", () => {
            state.options[input.dataset.sunoOption] = input.value;
        });
    });

    app.querySelectorAll("[data-suno-field]").forEach(textarea => {
        textarea.addEventListener("input", () => {
            state.draft[textarea.dataset.sunoField] = textarea.value;
        });
    });

    app.querySelector("#suno-generate-btn")?.addEventListener("click", () => handleGenerate(false));
    app.querySelector("#suno-variation-btn")?.addEventListener("click", () => handleGenerate(true));
    app.querySelector("#suno-save-btn")?.addEventListener("click", handleSave);

    app.querySelectorAll("[data-copy-field]").forEach(button => {
        button.addEventListener("click", () => {
            const field = button.dataset.copyField;
            const labels = { title: "제목", style: "스타일", lyrics: "가사" };
            copyText(state.draft[field] || "", labels[field] || "내용");
        });
    });

    app.querySelector("#suno-copy-bundle-btn")?.addEventListener("click", () => {
        copyText(getBundledDraftText(), "JSON");
    });

    app.querySelector("#suno-passcode-submit")?.addEventListener("click", async () => {
        const input = app.querySelector("#suno-passcode-input");
        const passcode = input?.value || "";
        if (!passcode.trim()) {
            alert("패스코드를 입력해 주세요.");
            return;
        }

        const result = await unlockSunoWithPasscode(passcode);
        if (!result.ok) {
            if (result.reason === "not-configured") {
                alert("현재 패스코드가 설정되지 않았습니다. js/site-config.js에 SHA-256 해시를 넣어 주세요.");
            } else {
                alert("패스코드가 일치하지 않습니다.");
            }
            return;
        }

        state.gateOpen = false;
        renderSunoGenerator();
    });

    app.querySelector("#suno-whitelist-submit")?.addEventListener("click", () => {
        const result = unlockSunoForAllowedUser(UserState.user, UserState.isMaster);
        if (!result.ok) {
            alert(UserState.user
                ? "허용된 이메일 계정이 아닙니다."
                : "먼저 상단 로그인 버튼으로 Firebase 로그인해 주세요.");
            return;
        }

        state.gateOpen = false;
        renderSunoGenerator();
    });

    if (state.gateOpen && !unlocked) {
        app.querySelector("#suno-passcode-input")?.focus();
    }
}

export function renderSunoGenerator() {
    bindGlobalListeners();

    const app = document.getElementById("app");
    if (!app) return;

    const unlocked = isUnlocked();
    if (consumeSunoGateRequest()) {
        state.gateOpen = true;
    }

    const preset = getSelectedPreset();
    const config = getSunoRuntimeConfig();
    const hasSave = !!config.storage?.enabled;

    app.innerHTML = `
        <div class="suno-page fade-in">
            <section class="suno-hero">
                <div class="suno-hero-copy">
                    <span class="suno-eyebrow">PRIVATE CREATOR TOOL</span>
                    <h1>수노 생성기</h1>
                    <p>애니 음악용 Title / Style / Lyrics 초안을 빠르게 설계하는 내부 작업 페이지입니다.</p>
                </div>
                <div class="suno-status ${unlocked ? "is-unlocked" : "is-locked"}">
                    <strong>${unlocked ? "Admin unlocked" : "Locked workspace"}</strong>
                    <span>${unlocked ? "현재 세션에서 생성, 편집, 복사 기능을 사용할 수 있습니다." : "하단 Footer의 Admin 링크로 게이트를 열어야 기능이 활성화됩니다."}</span>
                </div>
            </section>

            <section class="suno-grid">
                <div class="card suno-panel">
                    <div class="suno-panel-head">
                        <div>
                            <h2>장르 프리셋</h2>
                            <p>${preset.genres.join(" / ")} 기반, 18~19세 여성 보컬 톤 기준</p>
                        </div>
                    </div>
                    <div class="suno-chip-grid">
                        ${renderPresetButtons()}
                    </div>
                </div>

                <div class="card suno-panel">
                    <div class="suno-panel-head">
                        <div>
                            <h2>옵션</h2>
                            <p>languageMode, bpmHint, themeHint, intensity를 반영합니다.</p>
                        </div>
                    </div>
                    <div class="suno-option-grid">
                        <label class="suno-field">
                            <span>언어 모드</span>
                            <select data-suno-option="languageMode" ${!unlocked ? "disabled" : ""}>
                                ${renderSelectOptions(SUNO_LANGUAGE_MODE_OPTIONS, state.options.languageMode)}
                            </select>
                        </label>
                        <label class="suno-field">
                            <span>강도</span>
                            <select data-suno-option="intensity" ${!unlocked ? "disabled" : ""}>
                                ${renderSelectOptions(SUNO_INTENSITY_OPTIONS, state.options.intensity)}
                            </select>
                        </label>
                        <label class="suno-field">
                            <span>BPM 힌트</span>
                            <input
                                data-suno-option="bpmHint"
                                type="number"
                                min="60"
                                max="220"
                                value="${state.options.bpmHint}"
                                ${!unlocked ? "disabled" : ""}
                                placeholder="${preset.bpm}"
                            >
                        </label>
                        <label class="suno-field">
                            <span>테마 힌트</span>
                            <input
                                data-suno-option="themeHint"
                                type="text"
                                value="${state.options.themeHint}"
                                ${!unlocked ? "disabled" : ""}
                                placeholder="예: 빗속 재회, 새벽 차선, 별빛 약속"
                            >
                        </label>
                    </div>
                    <div class="suno-action-row">
                        <button id="suno-generate-btn" class="btn-primary" ${!unlocked || state.isBusy ? "disabled" : ""}>${state.isBusy ? "생성 중..." : "생성"}</button>
                        <button id="suno-variation-btn" class="btn-secondary" ${!unlocked || state.isBusy ? "disabled" : ""}>변주/다시 생성</button>
                        <button id="suno-save-btn" class="btn-secondary" ${!unlocked ? "disabled" : ""}>저장${hasSave ? "" : " (대기)"}</button>
                    </div>
                </div>
            </section>

            <section class="card suno-panel suno-gate-panel ${state.gateOpen ? "" : "hidden"}">
                <div class="suno-panel-head">
                    <div>
                        <h2>Admin Gate</h2>
                        <p>${getGateMessage()}</p>
                    </div>
                </div>
                <div class="suno-gate-grid">
                    <div class="suno-gate-card">
                        <label class="suno-field">
                            <span>패스코드</span>
                            <input id="suno-passcode-input" type="password" placeholder="세션 잠금 해제용 패스코드">
                        </label>
                        <button id="suno-passcode-submit" class="btn-primary">패스코드로 열기</button>
                    </div>
                    <div class="suno-gate-card">
                        <p class="suno-gate-note">Firebase 로그인 후 허용 이메일 1개만 화이트리스트로 열 수도 있습니다.</p>
                        <button id="suno-whitelist-submit" class="btn-secondary">허용 이메일로 열기</button>
                    </div>
                </div>
            </section>

            <section class="suno-result-stack">
                <div class="card suno-panel">
                    <div class="suno-result-head">
                        <div>
                            <h3>제목</h3>
                            <p>🦊 한국어 제목 — English Title 형식</p>
                        </div>
                        <button class="btn-secondary" data-copy-field="title">복사</button>
                    </div>
                    <textarea class="suno-textarea suno-title-textarea" data-suno-field="title" ${!unlocked ? "disabled" : ""} placeholder="🦊 새벽의 숲길 — Path of Dawn">${state.draft.title}</textarea>
                </div>

                <div class="card suno-panel">
                    <div class="suno-result-head">
                        <div>
                            <h3>스타일</h3>
                            <p>영문 한 줄 설계도만 유지</p>
                        </div>
                        <button class="btn-secondary" data-copy-field="style">복사</button>
                    </div>
                    <textarea class="suno-textarea" data-suno-field="style" ${!unlocked ? "disabled" : ""} placeholder="Symphonic DnB, Cinematic Bass | 174 BPM | strings, breakbeats, synth bass, choir | female vocal + clear emotional tone | restrained verses, swelling ache, explosive chorus, lingering storm afterglow">${state.draft.style}</textarea>
                </div>

                <div class="card suno-panel">
                    <div class="suno-result-head">
                        <div>
                            <h3>가사</h3>
                            <p>영문 섹션 태그만 사용, 본문은 실제 가사만 작성</p>
                        </div>
                        <div class="suno-result-actions">
                            <button class="btn-secondary" data-copy-field="lyrics">복사</button>
                            <button id="suno-copy-bundle-btn" class="btn-primary">JSON 복사</button>
                        </div>
                    </div>
                    <textarea class="suno-textarea suno-lyrics-textarea" data-suno-field="lyrics" ${!unlocked ? "disabled" : ""} placeholder="[Verse]&#10;...&#10;&#10;[Chorus]&#10;...">${state.draft.lyrics}</textarea>
                </div>
            </section>

            ${!unlocked ? `
                <div class="suno-lock-hint">
                    <span>현재는 읽기 전용 상태입니다. Footer의 작은 Admin 링크로만 잠금을 해제할 수 있습니다.</span>
                </div>
            ` : ""}
        </div>
    `;

    bindPageEvents();
}
