// Web Audio API 기반 효과음 생성 및 전역 음소거 제어
class SoundManager {
    constructor() {
        this.isMuted = localStorage.getItem('sound_muted') === 'true';
        this.audioCtx = null;
        this.init();
    }

    init() {
        const toggleBtn = document.getElementById('sound-toggle');
        if (toggleBtn) {
            this.updateToggleButton(toggleBtn);
            toggleBtn.addEventListener('click', () => {
                this.isMuted = !this.isMuted;
                localStorage.setItem('sound_muted', this.isMuted);
                this.updateToggleButton(toggleBtn);
            });
        }
    }

    updateToggleButton(btn) {
        btn.textContent = this.isMuted ? '❌' : '🔊';
        btn.style.opacity = this.isMuted ? '0.5' : '1';
    }

    getAudioContext() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
        return this.audioCtx;
    }

    // 기본 노이즈 생성 (주사위 굴리는 소리 등)
    playNoise(duration, type = 'brown', volume = 0.1) {
        if (this.isMuted) return;
        const ctx = this.getAudioContext();
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            if (type === 'white') {
                data[i] = Math.random() * 2 - 1;
            } else { // brown noise (주사위 흔드는 소리 느낌)
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5; // 강도 조절
            }
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        source.connect(gain);
        gain.connect(ctx.destination);
        source.start();
    }

    // 둔탁한 소리 (주사위가 바닥에 닿는 소리)
    playThud(volume = 0.2) {
        if (this.isMuted) return;
        const ctx = this.getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    }

    // 성공/획득 효과음
    playSuccess() {
        if (this.isMuted) return;
        const ctx = this.getAudioContext();
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.1);
            osc.stop(ctx.currentTime + i * 0.1 + 0.3);
        });
    }

    // 실패 효과음
    playFailure() {
        if (this.isMuted) return;
        const ctx = this.getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    }

    // 슬롯머신 회전 소리
    playSlotTick() {
        if (this.isMuted) return;
        const ctx = this.getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    }
}

export const soundManager = new SoundManager();
