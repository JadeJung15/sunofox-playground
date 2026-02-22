// js/games.js
import { Store } from './store.js';

function createShareButton(label, onClick) {
  const shareBtn = document.createElement('button');
  shareBtn.className = 'btn btn-primary btn-share';
  shareBtn.textContent = label || '공유하기';
  shareBtn.addEventListener('click', onClick);
  return shareBtn;
}

function dispatchShare(gameName, score) {
  window.dispatchEvent(new CustomEvent('gameShareRecord', {
    detail: { gameName, score }
  }));
}

function percent(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 100);
}

export class ReactionGame {
  constructor(element) {
    this.container = element;
    this.state = 'idle'; // idle, waiting, ready, finished
    this.timer = null;
    this.startTime = 0;
    this.attempts = [];
    this.handleClickBound = () => this.handleClick();
    this.handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.handleClick();
      }
    };
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-area reaction-area" id="reaction-area">
        <h3 class="game-title">⚡ 반응속도 테스트</h3>
        <p class="game-status">클릭해서 시작하세요!</p>
        <div class="game-result"></div>
      </div>
      <div class="game-controls">
        <p class="text-sub">마우스 클릭 또는 스페이스바로 플레이</p>
        <button class="btn btn-secondary" id="reset-reaction">기록 초기화</button>
      </div>
    `;
    this.area = this.container.querySelector('#reaction-area');
    this.status = this.container.querySelector('.game-status');
    this.result = this.container.querySelector('.game-result');

    this.area.addEventListener('click', this.handleClickBound);
    document.addEventListener('keydown', this.handleKeyDown);
    this.container.querySelector('#reset-reaction').addEventListener('click', () => {
      Store.saveGameRecord('reaction', null);
      this.attempts = [];
      this.result.textContent = '기록 초기화됨.';
      alert('기록이 초기화되었습니다.');
    });
  }

  handleClick() {
    if (this.state === 'idle' || this.state === 'finished') {
      this.startWait();
    } else if (this.state === 'waiting') {
      clearTimeout(this.timer);
      this.status.textContent = "너무 빨라요! 클릭하여 다시 시도하세요.";
      this.area.className = 'game-area reaction-area error';
      this.state = 'finished';
    } else if (this.state === 'ready') {
      const reactionTime = Date.now() - this.startTime;
      this.endGame(reactionTime);
    }
  }

  startWait() {
    this.state = 'waiting';
    this.area.className = 'game-area reaction-area waiting';
    this.status.textContent = "초록색이 되면 클릭하세요...";
    this.result.innerHTML = '';
    
    const randomTime = Math.floor(Math.random() * 2000) + 1000;
    this.timer = setTimeout(() => {
      this.state = 'ready';
      this.startTime = Date.now();
      this.area.className = 'game-area reaction-area ready';
      this.status.textContent = "클릭!!!";
    }, randomTime);
  }

  endGame(time) {
    this.state = 'finished';
    this.area.className = 'game-area reaction-area';
    
    const isBest = Store.saveGameRecord('reaction', time);
    const best = Store.getGameRecord('reaction');
    this.attempts.push(time);
    if (this.attempts.length > 5) this.attempts.shift();
    const avg = Math.round(this.attempts.reduce((sum, v) => sum + v, 0) / this.attempts.length);
    
    this.status.textContent = `${time}ms! 다시 하려면 클릭 또는 스페이스바를 누르세요.`;
    this.result.innerHTML = `현재: ${time}ms <br> 최고: ${best}ms ${isBest ? '(New!)' : ''}<br>최근 평균(최대 5회): ${avg}ms`;

    if (isBest) {
        this.result.appendChild(
          createShareButton('공유하기', () => dispatchShare('반응속도 테스트', `${time}ms`))
        );
    }
  }

  destroy() {
    clearTimeout(this.timer);
    document.removeEventListener('keydown', this.handleKeyDown);
    if (this.area) {
      this.area.removeEventListener('click', this.handleClickBound);
    }
  }
}

export class MemoryGame {
  constructor(element) {
    this.container = element;
    this.cards = [];
    this.flipped = [];
    this.matched = [];
    this.isLock = false;
    this.turns = 0;
    this.startTime = null;
    this.matchesTried = 0;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-header">
        <h3 class="game-title">🧠 카드 뒤집기</h3>
        <span class="game-score">Turns: 0</span>
      </div>
      <div class="memory-grid" id="memory-grid"></div>
      <div class="game-controls">
        <button class="btn btn-primary" id="start-memory">새 게임</button>
        <button class="btn btn-secondary" id="reset-memory">기록 초기화</button>
      </div>
    `;
    this.grid = this.container.querySelector('#memory-grid');
    this.scoreDisplay = this.container.querySelector('.game-score');
    
    this.container.querySelector('#start-memory').addEventListener('click', () => this.startGame());
    this.container.querySelector('#reset-memory').addEventListener('click', () => {
      Store.saveGameRecord('memory', null);
      this.scoreDisplay.textContent = `Turns: 0 (Best: -)`;
      alert('기록이 초기화되었습니다.');
    });
    this.startGame();
  }

  startGame() {
    const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
    const deck = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    
    this.grid.innerHTML = '';
    this.flipped = [];
    this.matched = [];
    this.turns = 0;
    this.matchesTried = 0;
    this.startTime = Date.now();
    this.isLock = false;
    this.scoreDisplay.textContent = `Turns: 0 (Best: ${Store.getGameRecord('memory') || '-'})`;

    deck.forEach((emoji, index) => {
      const card = document.createElement('div');
      card.className = 'memory-card';
      card.dataset.emoji = emoji;
      card.dataset.index = index;
      card.innerHTML = `<div class="front">?</div><div class="back">${emoji}</div>`;
      card.addEventListener('click', () => this.flipCard(card));
      this.grid.appendChild(card);
    });
  }

  flipCard(card) {
    if (this.isLock || card.classList.contains('flip') || this.matched.includes(card)) return;

    card.classList.add('flip');
    this.flipped.push(card);

    if (this.flipped.length === 2) {
      this.turns++;
      this.matchesTried++;
      this.scoreDisplay.textContent = `Turns: ${this.turns} (Best: ${Store.getGameRecord('memory') || '-'})`;
      this.checkMatch();
    }
  }

  checkMatch() {
    this.isLock = true;
    const [card1, card2] = this.flipped;

    if (card1.dataset.emoji === card2.dataset.emoji) {
      this.matched.push(card1, card2);
      this.flipped = [];
      this.isLock = false;
      if (this.matched.length === 16) this.endGame();
    } else {
      setTimeout(() => {
        card1.classList.remove('flip');
        card2.classList.remove('flip');
        this.flipped = [];
        this.isLock = false;
      }, 800);
    }
  }

  endGame() {
    const isBest = Store.saveGameRecord('memory', this.turns);
    const best = Store.getGameRecord('memory');
    const sec = Math.round((Date.now() - this.startTime) / 1000);
    const accuracy = percent(this.matched.length / 2, this.matchesTried);
    alert(`성공! ${this.turns}턴 / ${sec}초 / 정확도 ${accuracy}% (최고 기록: ${best || '-'})`);
    
    if (isBest) {
        const shareConfirm = confirm('새로운 최고 기록입니다! 커뮤니티에 공유하시겠습니까?');
        if (shareConfirm) dispatchShare('카드 뒤집기', `${this.turns}턴 / ${sec}초`);
    }
    this.startGame();
  }
}

export class RhythmGame {
  constructor(element) {
    this.container = element;
    this.lanes = ['A', 'S', 'D'];
    this.notes = [];
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.hits = 0;
    this.misses = 0;
    this.isPlaying = false;
    this.gameDurationMs = 20000;
    this.startAt = 0;
    this.lastFrame = 0;
    this.lastSpawn = 0;
    this.spawnMs = 700;
    this.animationId = null;
    this.handleKeyDown = (e) => {
      if (!this.isPlaying) return;
      const key = e.key.toLowerCase();
      if (key === 'a') this.hitLane(0);
      if (key === 's') this.hitLane(1);
      if (key === 'd') this.hitLane(2);
    };
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-header">
        <h3 class="game-title">🎵 리듬 레인 러시</h3>
        <span class="rhythm-score">Score: 0 | Combo: 0</span>
      </div>
      <div class="rhythm-area rhythm-lanes" id="rhythm-area">
        ${this.lanes.map((_, i) => `
          <div class="rhythm-lane" data-lane="${i}">
            <div class="rhythm-hitline"></div>
          </div>
        `).join('')}
      </div>
      <div class="game-controls">
        <p class="text-sub">A / S / D 키 또는 버튼으로 라인을 타격하세요.</p>
        <div class="rps-buttons">
          ${this.lanes.map((k, i) => `<button class="btn btn-secondary lane-hit-btn" data-lane="${i}">${k}</button>`).join('')}
        </div>
        <button class="btn btn-primary" id="start-rhythm">게임 시작</button>
        <button class="btn btn-secondary" id="reset-rhythm">기록 초기화</button>
      </div>
    `;

    this.area = this.container.querySelector('#rhythm-area');
    this.laneEls = [...this.container.querySelectorAll('.rhythm-lane')];
    this.scoreEl = this.container.querySelector('.rhythm-score');
    this.container.querySelector('#start-rhythm').addEventListener('click', () => this.startGame());
    this.container.querySelector('#reset-rhythm').addEventListener('click', () => {
      Store.saveGameRecord('rhythm', 0);
      this.stopGame();
      this.score = 0;
      this.combo = 0;
      this.maxCombo = 0;
      this.hits = 0;
      this.misses = 0;
      this.renderNotes();
      this.updateStatus();
      alert('기록이 초기화되었습니다.');
    });
    this.container.querySelectorAll('.lane-hit-btn').forEach(btn => {
      btn.addEventListener('click', () => this.hitLane(Number(btn.dataset.lane)));
    });
    document.addEventListener('keydown', this.handleKeyDown);
    this.updateStatus();
  }

  startGame() {
    this.stopGame();
    this.notes = [];
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.hits = 0;
    this.misses = 0;
    this.isPlaying = true;
    this.startAt = performance.now();
    this.lastFrame = this.startAt;
    this.lastSpawn = this.startAt;
    this.spawnMs = 700;
    this.renderNotes();
    this.updateStatus();
    this.animationId = requestAnimationFrame((ts) => this.tick(ts));
  }

  stopGame() {
    this.isPlaying = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }

  tick(now) {
    if (!this.isPlaying) return;
    const dt = now - this.lastFrame;
    this.lastFrame = now;
    const elapsed = now - this.startAt;

    if (elapsed > 8000) this.spawnMs = 560;
    if (elapsed > 14000) this.spawnMs = 460;

    if (now - this.lastSpawn >= this.spawnMs) {
      this.spawnNote();
      this.lastSpawn = now;
    }

    this.notes.forEach(note => {
      note.y += (0.045 + note.speedBoost) * dt;
    });

    const remaining = [];
    this.notes.forEach(note => {
      if (note.y >= 92) {
        this.combo = 0;
        this.misses += 1;
        note.el.remove();
      } else {
        remaining.push(note);
        note.el.style.top = `${note.y}%`;
      }
    });
    this.notes = remaining;
    this.updateStatus();

    if (elapsed >= this.gameDurationMs) {
      this.endGame();
      return;
    }

    this.animationId = requestAnimationFrame((ts) => this.tick(ts));
  }

  spawnNote() {
    const lane = Math.floor(Math.random() * this.lanes.length);
    const el = document.createElement('div');
    el.className = 'rhythm-note lane-note';
    el.style.left = `${lane * (100 / this.lanes.length) + 3}%`;
    el.style.width = `${(100 / this.lanes.length) - 6}%`;
    el.style.top = '0%';
    this.area.appendChild(el);
    this.notes.push({
      lane,
      y: 0,
      el,
      speedBoost: Math.random() * 0.015
    });
  }

  hitLane(lane) {
    if (!this.isPlaying) return;
    const notesInLane = this.notes
      .filter(n => n.lane === lane)
      .sort((a, b) => b.y - a.y);
    const target = notesInLane.find(n => n.y >= 70 && n.y <= 90);
    if (!target) {
      this.combo = 0;
      this.misses += 1;
      this.updateStatus();
      return;
    }
    const delta = Math.abs(84 - target.y);
    let gain = 8;
    if (delta <= 4) gain = 14;
    else if (delta <= 8) gain = 10;
    this.combo += 1;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    this.hits += 1;
    this.score += gain + Math.min(8, Math.floor(this.combo / 3));
    target.el.remove();
    this.notes = this.notes.filter(n => n !== target);
    this.updateStatus();
  }

  updateStatus() {
    const best = Store.getGameRecord('rhythm') || 0;
    this.scoreEl.textContent = `Score: ${this.score} | Combo: ${this.combo} | Best: ${best}`;
  }

  renderNotes() {
    if (!this.area) return;
    this.area.querySelectorAll('.lane-note').forEach(el => el.remove());
  }

  endGame() {
    this.stopGame();
    const isBest = Store.saveGameRecord('rhythm', this.score);
    const best = Store.getGameRecord('rhythm');
    const acc = percent(this.hits, this.hits + this.misses);
    alert(`게임 종료! 점수 ${this.score} / 최대 콤보 ${this.maxCombo} / 정확도 ${acc}% (최고 ${best || 0})`);
    this.renderNotes();
    if (isBest) {
      const shareConfirm = confirm('새로운 최고 기록입니다! 커뮤니티에 공유하시겠습니까?');
      if (shareConfirm) dispatchShare('리듬 레인 러시', `${this.score}점 / 콤보 ${this.maxCombo}`);
    }
  }

  destroy() {
    this.stopGame();
    this.renderNotes();
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}

export class PuzzleGame {
  constructor(element) {
    this.container = element;
    this.grid = Array.from({ length: 4 }, () => Array(4).fill(0));
    this.moves = 0;
    this.goal = 256;
    this.startTime = Date.now();
    this.isEnded = false;
    this.handleKeyDown = (e) => this.onKeyDown(e);
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-header">
        <h3 class="game-title">🧩 2048 챌린지</h3>
        <span class="puzzle-moves">Moves: 0 | Goal: ${this.goal}</span>
      </div>
      <div class="p2048-grid" id="p2048-grid"></div>
      <div class="game-controls">
        <p class="text-sub">방향키로 타일을 합쳐 ${this.goal} 타일을 만드세요. (낮은 Moves가 최고 기록)</p>
        <button class="btn btn-primary" id="restart-puzzle">새 게임</button>
        <button class="btn btn-secondary" id="reset-puzzle">기록 초기화</button>
      </div>
    `;
    this.gridEl = this.container.querySelector('#p2048-grid');
    this.movesEl = this.container.querySelector('.puzzle-moves');
    this.container.querySelector('#restart-puzzle').addEventListener('click', () => this.startGame());
    this.container.querySelector('#reset-puzzle').addEventListener('click', () => {
      Store.saveGameRecord('puzzle', null);
      alert('기록이 초기화되었습니다.');
      this.updateStatus();
    });
    document.addEventListener('keydown', this.handleKeyDown);
    this.startGame();
  }

  startGame() {
    this.grid = Array.from({ length: 4 }, () => Array(4).fill(0));
    this.moves = 0;
    this.startTime = Date.now();
    this.isEnded = false;
    this.spawn();
    this.spawn();
    this.draw();
    this.updateStatus();
  }

  onKeyDown(e) {
    const tag = e.target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    const map = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right'
    };
    const dir = map[e.key];
    if (!dir || this.isEnded) return;
    e.preventDefault();
    this.move(dir);
  }

  move(direction) {
    const before = JSON.stringify(this.grid);
    if (direction === 'left') this.grid = this.grid.map(row => this.mergeLine(row));
    if (direction === 'right') this.grid = this.grid.map(row => this.mergeLine([...row].reverse()).reverse());
    if (direction === 'up') this.rotateLeft();
    if (direction === 'down') this.rotateRight();

    if (direction === 'up') {
      this.grid = this.grid.map(row => this.mergeLine(row));
      this.rotateRight();
    }
    if (direction === 'down') {
      this.grid = this.grid.map(row => this.mergeLine(row));
      this.rotateLeft();
    }

    if (JSON.stringify(this.grid) === before) return;
    this.moves += 1;
    this.spawn();
    this.draw();
    this.updateStatus();
    this.checkState();
  }

  mergeLine(line) {
    const arr = line.filter(v => v !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        arr[i + 1] = 0;
      }
    }
    const merged = arr.filter(v => v !== 0);
    while (merged.length < 4) merged.push(0);
    return merged;
  }

  rotateLeft() {
    const next = Array.from({ length: 4 }, () => Array(4).fill(0));
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        next[3 - c][r] = this.grid[r][c];
      }
    }
    this.grid = next;
  }

  rotateRight() {
    const next = Array.from({ length: 4 }, () => Array(4).fill(0));
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        next[c][3 - r] = this.grid[r][c];
      }
    }
    this.grid = next;
  }

  spawn() {
    const empty = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.grid[r][c] === 0) empty.push([r, c]);
      }
    }
    if (!empty.length) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  draw() {
    this.gridEl.innerHTML = this.grid.flat().map(v => `
      <div class="p2048-cell p2048-${v || 0}">${v || ''}</div>
    `).join('');
  }

  updateStatus() {
    const best = Store.getGameRecord('puzzle');
    this.movesEl.textContent = `Moves: ${this.moves} | Goal: ${this.goal} | Best: ${best || '-'}`;
  }

  hasMoves() {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const v = this.grid[r][c];
        if (v === 0) return true;
        if (r < 3 && this.grid[r + 1][c] === v) return true;
        if (c < 3 && this.grid[r][c + 1] === v) return true;
      }
    }
    return false;
  }

  checkState() {
    const maxTile = Math.max(...this.grid.flat());
    if (maxTile >= this.goal) {
      this.isEnded = true;
      const isBest = Store.saveGameRecord('puzzle', this.moves);
      const sec = Math.round((Date.now() - this.startTime) / 1000);
      alert(`성공! ${this.goal} 달성 (${this.moves} moves / ${sec}초)`);
      if (isBest) {
        const shareConfirm = confirm('새로운 최고 기록입니다! 공유하시겠습니까?');
        if (shareConfirm) dispatchShare('2048 챌린지', `${this.moves} moves`);
      }
      return;
    }
    if (!this.hasMoves()) {
      this.isEnded = true;
      alert('게임 오버! 더 이상 합칠 수 없습니다. 새 게임으로 다시 도전하세요.');
    }
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}

export class MathGame {
    constructor(element) {
        this.container = element;
        this.score = 0;
        this.combo = 0;
        this.timeLeft = 30;
        this.timer = null;
        this.answer = null;
        this.isPlaying = false;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h3 class="game-title">🔢 스피드 합산</h3>
                <span class="math-status">Time: 30s | Score: 0 | Combo: 0</span>
            </div>
            <div class="math-area">
                <div class="math-question">시작 버튼을 눌러주세요</div>
                <div class="math-input-row">
                    <input type="number" class="input math-input" placeholder="정답 입력" inputmode="numeric" />
                    <button class="btn btn-primary" id="math-submit">확인</button>
                </div>
                <div class="math-feedback"></div>
            </div>
            <div class="game-controls">
                <button class="btn btn-primary" id="start-math">게임 시작</button>
                <button class="btn btn-secondary" id="reset-math">기록 초기화</button>
            </div>
        `;

        this.statusEl = this.container.querySelector('.math-status');
        this.questionEl = this.container.querySelector('.math-question');
        this.feedbackEl = this.container.querySelector('.math-feedback');
        this.inputEl = this.container.querySelector('.math-input');

        this.container.querySelector('#start-math').addEventListener('click', () => this.startGame());
        this.container.querySelector('#math-submit').addEventListener('click', () => this.submitAnswer());
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });
        this.container.querySelector('#reset-math').addEventListener('click', () => {
            Store.saveGameRecord('math', 0);
            this.feedbackEl.textContent = '기록 초기화됨.';
            alert('기록이 초기화되었습니다.');
        });
    }

    startGame() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.score = 0;
        this.combo = 0;
        this.timeLeft = 30;
        this.feedbackEl.textContent = '';
        this.updateStatus();
        this.nextQuestion();
        this.inputEl.value = '';
        this.inputEl.focus();

        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft -= 1;
            this.updateStatus();
            if (this.timeLeft <= 0) this.endGame();
        }, 1000);
    }

    updateStatus() {
        const best = Store.getGameRecord('math') || 0;
        this.statusEl.textContent = `Time: ${this.timeLeft}s | Score: ${this.score} | Combo: ${this.combo} (Best: ${best})`;
    }

    nextQuestion() {
        const levelBoost = Math.min(20, Math.floor(this.score / 3));
        const a = Math.floor(Math.random() * (20 + levelBoost)) + 1;
        const b = Math.floor(Math.random() * (20 + levelBoost)) + 1;
        const c = Math.floor(Math.random() * 10);
        const type = Math.random();
        if (type < 0.55) {
            const useThree = Math.random() < 0.4;
            this.answer = useThree ? a + b + c : a + b;
            this.questionEl.textContent = useThree ? `${a} + ${b} + ${c} = ?` : `${a} + ${b} = ?`;
            return;
        }
        if (type < 0.82) {
            const x = Math.max(a, b);
            const y = Math.min(a, b);
            this.answer = x - y;
            this.questionEl.textContent = `${x} - ${y} = ?`;
            return;
        }
        const x = Math.floor(Math.random() * 12) + 2;
        const y = Math.floor(Math.random() * 9) + 2;
        this.answer = x * y;
        this.questionEl.textContent = `${x} × ${y} = ?`;
    }

    submitAnswer() {
        if (!this.isPlaying) return;
        const value = parseInt(this.inputEl.value, 10);
        if (Number.isNaN(value)) return;
        if (value === this.answer) {
            this.combo += 1;
            const bonus = this.combo >= 5 ? 2 : 1;
            this.score += bonus;
            this.feedbackEl.textContent = bonus > 1 ? `정답! 콤보 보너스 +${bonus}` : '정답!';
        } else {
            this.combo = 0;
            this.timeLeft = Math.max(0, this.timeLeft - 1);
            this.feedbackEl.textContent = `틀림! 정답은 ${this.answer}`;
        }
        this.inputEl.value = '';
        this.nextQuestion();
        this.updateStatus();
    }

    endGame() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        clearInterval(this.timer);
        const isBest = Store.saveGameRecord('math', this.score);
        const best = Store.getGameRecord('math') || 0;
        this.questionEl.textContent = '게임 종료!';
        this.feedbackEl.innerHTML = `점수: ${this.score} / 최고: ${best}`;

        if (isBest) {
            const shareBtn = createShareButton('공유하기', () => {
                dispatchShare('스피드 합산', `${this.score}점`);
            });
            this.feedbackEl.appendChild(shareBtn);
        }
    }
}

export class RpsGame {
  constructor(element) {
    this.container = element;
    this.wins = 0;
    this.losses = 0;
    this.draws = 0;
    this.streak = 0;
    this.player = [];
    this.dealer = [];
    this.roundDone = true;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-header">
        <h3 class="game-title">🃏 블랙잭 러시</h3>
        <span class="rps-status">연승: 0 (Best: ${Store.getGameRecord('rps') || 0})</span>
      </div>
      <div class="rps-area blackjack-area">
        <div class="rps-result">라운드 시작을 눌러주세요.</div>
        <div class="rps-scoreboard">승 ${this.wins} / 패 ${this.losses} / 무 ${this.draws}</div>
        <p class="text-sub" id="bj-dealer">딜러: -</p>
        <p class="text-sub" id="bj-player">플레이어: -</p>
      </div>
      <div class="game-controls">
        <button class="btn btn-primary" id="bj-start">라운드 시작</button>
        <button class="btn btn-secondary" id="bj-hit">히트</button>
        <button class="btn btn-secondary" id="bj-stand">스탠드</button>
        <button class="btn btn-secondary" id="reset-rps">기록 초기화</button>
      </div>
    `;
    this.statusEl = this.container.querySelector('.rps-status');
    this.resultEl = this.container.querySelector('.rps-result');
    this.scoreEl = this.container.querySelector('.rps-scoreboard');
    this.dealerEl = this.container.querySelector('#bj-dealer');
    this.playerEl = this.container.querySelector('#bj-player');
    this.container.querySelector('#bj-start').addEventListener('click', () => this.startRound());
    this.container.querySelector('#bj-hit').addEventListener('click', () => this.hit());
    this.container.querySelector('#bj-stand').addEventListener('click', () => this.stand());
    this.container.querySelector('#reset-rps').addEventListener('click', () => {
      Store.saveGameRecord('rps', 0);
      this.wins = 0;
      this.losses = 0;
      this.draws = 0;
      this.streak = 0;
      this.roundDone = true;
      this.resultEl.textContent = '라운드 시작을 눌러주세요.';
      this.updateScoreboard();
      this.updateStatus();
      this.renderHands(true);
      alert('기록이 초기화되었습니다.');
    });
    this.updateStatus();
    this.updateScoreboard();
    this.renderHands(true);
  }

  drawCard() {
    const n = Math.floor(Math.random() * 13) + 1;
    if (n === 1) return 11;
    if (n >= 10) return 10;
    return n;
  }

  handTotal(cards) {
    let total = cards.reduce((a, b) => a + b, 0);
    let aces = cards.filter(v => v === 11).length;
    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }
    return total;
  }

  startRound() {
    this.player = [this.drawCard(), this.drawCard()];
    this.dealer = [this.drawCard(), this.drawCard()];
    this.roundDone = false;
    this.resultEl.textContent = '히트 또는 스탠드를 선택하세요.';
    this.renderHands(true);
    if (this.handTotal(this.player) === 21) this.finishRound();
  }

  hit() {
    if (this.roundDone) return;
    this.player.push(this.drawCard());
    this.renderHands(true);
    if (this.handTotal(this.player) > 21) this.finishRound();
  }

  stand() {
    if (this.roundDone) return;
    while (this.handTotal(this.dealer) < 17) {
      this.dealer.push(this.drawCard());
    }
    this.finishRound();
  }

  finishRound() {
    this.roundDone = true;
    const p = this.handTotal(this.player);
    const d = this.handTotal(this.dealer);
    let message = '';
    if (p > 21) {
      this.losses += 1;
      this.streak = 0;
      message = '버스트! 패배했습니다.';
    } else if (d > 21 || p > d) {
      this.wins += 1;
      this.streak += 1;
      message = '승리했습니다!';
    } else if (p < d) {
      this.losses += 1;
      this.streak = 0;
      message = '패배했습니다.';
    } else {
      this.draws += 1;
      message = '무승부입니다.';
    }
    const isBest = Store.saveGameRecord('rps', this.streak);
    this.resultEl.textContent = `${message} (나 ${p} / 딜러 ${d})`;
    this.updateStatus();
    this.updateScoreboard();
    this.renderHands(false);
    if (isBest && this.streak > 0) {
      this.resultEl.appendChild(
        createShareButton('공유하기', () => dispatchShare('블랙잭 러시', `${this.streak}연승`))
      );
    }
  }

  renderHands(hiddenDealer) {
    const playerTotal = this.handTotal(this.player);
    const dealerText = hiddenDealer && !this.roundDone
      ? `${this.dealer[0] || '-'} + ?`
      : `${this.dealer.join(', ')} (합 ${this.handTotal(this.dealer) || 0})`;
    this.dealerEl.textContent = `딜러: ${dealerText}`;
    this.playerEl.textContent = `플레이어: ${this.player.join(', ') || '-'} (합 ${playerTotal || 0})`;
  }

  updateStatus() {
    this.statusEl.textContent = `연승: ${this.streak} (Best: ${Store.getGameRecord('rps') || 0})`;
  }

  updateScoreboard() {
    this.scoreEl.textContent = `승 ${this.wins} / 패 ${this.losses} / 무 ${this.draws}`;
  }
}

export class PersonalityTest {
    constructor(element) {
        this.container = element;
        this.questions = [
            { q: '주말에 가장 하고 싶은 일은?', options: [
                { t: 'A', text: '혼자 조용히 쉬기' },
                { t: 'B', text: '친구들과 수다' },
                { t: 'C', text: '새로운 취미 도전' },
                { t: 'D', text: '즉흥 나들이' },
                { t: 'E', text: '감성 충전(카페/전시)' },
            ]},
            { q: '중요한 결정을 할 때 나는?', options: [
                { t: 'A', text: '차분히 혼자 정리' },
                { t: 'B', text: '주변 의견을 참고' },
                { t: 'C', text: '새로운 가능성을 탐색' },
                { t: 'D', text: '빠르게 실행' },
                { t: 'E', text: '감정에 따라 선택' },
            ]},
            { q: '스트레스를 받으면 나는?', options: [
                { t: 'A', text: '집에서 혼자 정리한다' },
                { t: 'B', text: '사람들과 이야기한다' },
                { t: 'C', text: '몸을 움직인다' },
                { t: 'D', text: '새로운 환경으로 간다' },
                { t: 'E', text: '음악/콘텐츠에 몰입' },
            ]},
            { q: '여행 스타일은?', options: [
                { t: 'A', text: '느긋하게 휴식' },
                { t: 'B', text: '맛집/사람 위주' },
                { t: 'C', text: '활동적인 일정' },
                { t: 'D', text: '즉흥 스팟 탐험' },
                { t: 'E', text: '사진/감성 기록' },
            ]},
            { q: '새로운 모임에서 나는?', options: [
                { t: 'A', text: '관찰하며 적응' },
                { t: 'B', text: '먼저 말 걸기' },
                { t: 'C', text: '게임/활동 제안' },
                { t: 'D', text: '분위기 띄우기' },
                { t: 'E', text: '조용히 분위기 즐기기' },
            ]},
            { q: '가장 끌리는 선물은?', options: [
                { t: 'A', text: '향초/디퓨저' },
                { t: 'B', text: '사진 앨범' },
                { t: 'C', text: '액티비티 티켓' },
                { t: 'D', text: '여행/체험 쿠폰' },
                { t: 'E', text: '감성 소품' },
            ]},
            { q: '좋아하는 음악 분위기는?', options: [
                { t: 'A', text: '잔잔한 로파이' },
                { t: 'B', text: '신나는 팝' },
                { t: 'C', text: '리듬감 있는 EDM' },
                { t: 'D', text: '강렬한 락' },
                { t: 'E', text: '감성 발라드' },
            ]},
            { q: '일할 때 선호하는 스타일은?', options: [
                { t: 'A', text: '혼자 집중' },
                { t: 'B', text: '팀과 협업' },
                { t: 'C', text: '새로운 시도' },
                { t: 'D', text: '빠르게 실행' },
                { t: 'E', text: '아이디어 스케치' },
            ]},
            { q: '에너지를 충전하는 방법은?', options: [
                { t: 'A', text: '혼자 쉬기' },
                { t: 'B', text: '사람들과 만나기' },
                { t: 'C', text: '움직이기' },
                { t: 'D', text: '즉흥 여행' },
                { t: 'E', text: '감성 콘텐츠' },
            ]},
            { q: '이상적인 카페 분위기는?', options: [
                { t: 'A', text: '조용하고 편안' },
                { t: 'B', text: '사람 북적이는 곳' },
                { t: 'C', text: '힙하고 트렌디' },
                { t: 'D', text: '새로운 콘셉트' },
                { t: 'E', text: '감성 인테리어' },
            ]},
        ];
        this.results = {
            A: { title: '🌙 고요한 관찰자', desc: '차분하고 깊이 있는 에너지를 가진 타입입니다. 혼자만의 시간이 가장 큰 회복 포인트!' },
            B: { title: '☀️ 소셜 리더', desc: '사람들과의 교류에서 힘을 얻는 타입입니다. 함께할수록 에너지가 올라가요.' },
            C: { title: '⚡ 활력 도전자', desc: '새로운 도전과 액션에서 즐거움을 느낍니다. 움직일수록 기분이 UP!' },
            D: { title: '🚀 즉흥 탐험가', desc: '즉흥적인 선택에 강하고 변화에 두려움이 없는 타입입니다.' },
            E: { title: '🎨 감성 크리에이터', desc: '분위기와 감성에 민감한 타입입니다. 아름다운 것에 둘러싸일 때 힘을 얻어요.' },
        };
        this.index = 0;
        this.score = { A: 0, B: 0, C: 0, D: 0, E: 0 };
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h3 class="game-title">💬 심리테스트</h3>
                <span class="test-progress">1 / ${this.questions.length}</span>
            </div>
            <div class="test-card">
                <div class="progress-track"><div class="progress-fill" style="width:0%"></div></div>
                <div class="test-question"></div>
                <div class="test-options"></div>
            </div>
            <div class="game-controls">
                <button class="btn btn-secondary" id="reset-test">다시 시작</button>
            </div>
        `;

        this.progressEl = this.container.querySelector('.test-progress');
        this.progressFill = this.container.querySelector('.progress-fill');
        this.questionEl = this.container.querySelector('.test-question');
        this.optionsEl = this.container.querySelector('.test-options');

        this.container.querySelector('#reset-test').addEventListener('click', () => this.reset());
        this.renderQuestion();
    }

    renderQuestion() {
        const current = this.questions[this.index];
        this.progressEl.textContent = `${this.index + 1} / ${this.questions.length}`;
        this.progressFill.style.width = `${Math.round((this.index / this.questions.length) * 100)}%`;
        this.questionEl.textContent = current.q;
        this.optionsEl.innerHTML = current.options.map(opt => (
            `<button class="test-option" data-type="${opt.t}">${opt.text}</button>`
        )).join('');

        this.optionsEl.querySelectorAll('.test-option').forEach(btn => {
            btn.addEventListener('click', () => this.pick(btn.dataset.type));
        });
    }

    pick(type) {
        this.score[type] += 1;
        this.index += 1;
        if (this.index >= this.questions.length) {
            this.showResult();
        } else {
            this.renderQuestion();
        }
    }

    showResult() {
        const top = Object.entries(this.score).sort((a, b) => b[1] - a[1])[0][0];
        const result = this.results[top];
        this.progressEl.textContent = '완료';
        this.progressFill.style.width = '100%';
        const summary = Object.entries(this.score)
          .sort((a, b) => b[1] - a[1])
          .map(([k, v]) => `${k}:${v}`)
          .join(' · ');
        this.questionEl.innerHTML = `<strong>${result.title}</strong>`;
        this.optionsEl.innerHTML = `
            <p class="test-result">${result.desc}</p>
            <p class="text-sub">성향 점수: ${summary}</p>
            <button class="btn btn-primary btn-share" id="share-test">결과 공유</button>
            <button class="btn btn-secondary" id="download-card">결과 카드 저장</button>
        `;
        this.optionsEl.querySelector('#share-test').addEventListener('click', () => {
            dispatchShare('심리테스트', result.title);
        });
        this.optionsEl.querySelector('#download-card').addEventListener('click', () => {
            this.downloadResultCard(result);
        });
    }

    reset() {
        this.index = 0;
        this.score = { A: 0, B: 0, C: 0, D: 0, E: 0 };
        this.progressFill.style.width = '0%';
        this.renderQuestion();
    }

    downloadResultCard(result) {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#f08a1d');
        gradient.addColorStop(1, '#2ef2c8');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        ctx.fillRect(80, 120, 920, 840);

        ctx.fillStyle = '#1b140f';
        ctx.font = '700 56px "Pretendard", sans-serif';
        ctx.fillText('SunoFox 테스트 결과', 140, 220);

        ctx.fillStyle = '#f08a1d';
        ctx.font = '700 64px "Pretendard", sans-serif';
        ctx.fillText(result.title, 140, 320);

        ctx.fillStyle = '#5c5248';
        ctx.font = '400 40px "Pretendard", sans-serif';
        const lines = this.wrapText(result.desc, 32);
        lines.forEach((line, i) => {
            ctx.fillText(line, 140, 420 + i * 54);
        });

        ctx.fillStyle = '#1b140f';
        ctx.font = '600 32px "Pretendard", sans-serif';
        ctx.fillText('youtube.com/@sunofox', 140, 900);

        const link = document.createElement('a');
        link.download = 'sunofox-test-result.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    wrapText(text, maxLen) {
        const words = text.split(' ');
        const lines = [];
        let line = '';
        words.forEach(word => {
            const testLine = line ? `${line} ${word}` : word;
            if (testLine.length > maxLen) {
                lines.push(line);
                line = word;
            } else {
                line = testLine;
            }
        });
        if (line) lines.push(line);
        return lines;
    }
}

export class NumberMemoryGame {
    constructor(element) {
        this.container = element;
        this.sequence = [];
        this.level = 3;
        this.isShowing = false;
        this.hasStarted = false;
        this.revealTimer = null;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h3 class="game-title">🔢 숫자 기억력</h3>
                <span class="number-status">Level: 3 (Best: ${Store.getGameRecord('number') || 0})</span>
            </div>
            <div class="number-area">
                <div class="number-sequence">시작 버튼을 눌러주세요</div>
                <input type="text" class="input number-input" placeholder="숫자를 입력하세요" inputmode="numeric" />
                <div class="number-feedback"></div>
            </div>
            <div class="game-controls">
                <button class="btn btn-primary" id="start-number">시작</button>
                <button class="btn btn-secondary" id="check-number">확인</button>
                <button class="btn btn-secondary" id="reset-number">기록 초기화</button>
            </div>
        `;

        this.statusEl = this.container.querySelector('.number-status');
        this.sequenceEl = this.container.querySelector('.number-sequence');
        this.inputEl = this.container.querySelector('.number-input');
        this.feedbackEl = this.container.querySelector('.number-feedback');

        this.container.querySelector('#start-number').addEventListener('click', () => this.start());
        this.container.querySelector('#check-number').addEventListener('click', () => this.check());
        this.container.querySelector('#reset-number').addEventListener('click', () => {
            Store.saveGameRecord('number', 0);
            this.level = 3;
            this.hasStarted = false;
            this.sequence = [];
            this.sequenceEl.textContent = '시작 버튼을 눌러주세요';
            this.feedbackEl.textContent = '기록 초기화됨.';
            this.updateStatus();
            alert('기록이 초기화되었습니다.');
        });
    }

    start() {
        if (this.isShowing) return;
        this.hasStarted = true;
        this.sequence = Array.from({ length: this.level }, () => Math.floor(Math.random() * 9) + 1);
        this.inputEl.value = '';
        this.feedbackEl.textContent = '';
        this.showSequence();
    }

    showSequence() {
        this.isShowing = true;
        let index = 0;
        this.sequenceEl.textContent = '';
        const tickMs = Math.max(360, 760 - this.level * 25);
        clearInterval(this.revealTimer);
        this.revealTimer = setInterval(() => {
            this.sequenceEl.textContent = this.sequence[index];
            index += 1;
            if (index >= this.sequence.length) {
                clearInterval(this.revealTimer);
                setTimeout(() => {
                    this.sequenceEl.textContent = '입력하세요!';
                    this.isShowing = false;
                    this.inputEl.focus();
                }, 600);
            }
        }, tickMs);
    }

    check() {
        if (!this.hasStarted || this.isShowing) return;
        const value = this.inputEl.value.trim();
        const answer = this.sequence.join('');
        if (!value) return;

        if (value === answer) {
            this.level += 1;
            this.feedbackEl.textContent = '정답! 다음 레벨로!';
            const isBest = Store.saveGameRecord('number', this.level - 1);
            if (isBest) {
                this.feedbackEl.textContent += ' (최고 기록!)';
                this.feedbackEl.appendChild(
                  createShareButton('기록 공유', () => dispatchShare('숫자 기억력', `Lv.${this.level - 1}`))
                );
            }
            this.updateStatus();
            this.start();
        } else {
            this.feedbackEl.textContent = `오답! 정답은 ${answer}`;
            this.level = 3;
            this.hasStarted = false;
            this.updateStatus();
        }
    }

    updateStatus() {
        const best = Store.getGameRecord('number') || 0;
        this.statusEl.textContent = `Level: ${this.level} (Best: ${best})`;
    }

    destroy() {
        clearInterval(this.revealTimer);
        this.isShowing = false;
    }
}

export class TypingGame {
    constructor(element) {
        this.container = element;
        this.phrases = [
            '빠르게 타이핑하면 기록이 올라갑니다',
            'SunoFox와 함께 즐거운 미니게임',
            '정확도가 높을수록 점수가 좋아요',
            '오늘도 멋진 하루 되세요',
            '속도와 정확도를 모두 잡아보자',
        ];
        this.startTime = null;
        this.roundDone = false;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h3 class="game-title">⌨️ 타이핑 속도</h3>
                <span class="typing-status">Best: ${Store.getGameRecord('typing') || 0} WPM</span>
            </div>
            <div class="typing-area">
                <div class="typing-phrase"></div>
                <textarea class="input typing-input" placeholder="여기에 입력하세요"></textarea>
                <div class="typing-feedback"></div>
            </div>
            <div class="game-controls">
                <button class="btn btn-primary" id="start-typing">문장 시작</button>
                <button class="btn btn-secondary" id="reset-typing">기록 초기화</button>
            </div>
        `;

        this.statusEl = this.container.querySelector('.typing-status');
        this.phraseEl = this.container.querySelector('.typing-phrase');
        this.inputEl = this.container.querySelector('.typing-input');
        this.feedbackEl = this.container.querySelector('.typing-feedback');

        this.container.querySelector('#start-typing').addEventListener('click', () => this.start());
        this.container.querySelector('#reset-typing').addEventListener('click', () => {
            Store.saveGameRecord('typing', 0);
            this.updateStatus();
            alert('기록이 초기화되었습니다.');
        });
        this.inputEl.addEventListener('input', () => this.check());
        this.start();
    }

    start() {
        const phrase = this.phrases[Math.floor(Math.random() * this.phrases.length)];
        this.phraseEl.textContent = phrase;
        this.inputEl.value = '';
        this.feedbackEl.textContent = '문장을 정확히 입력하세요.';
        this.startTime = null;
        this.roundDone = false;
        this.inputEl.focus();
    }

    check() {
        if (this.roundDone) return;
        if (!this.startTime) this.startTime = Date.now();
        const target = this.phraseEl.textContent;
        const typed = this.inputEl.value;
        let matched = 0;
        for (let i = 0; i < typed.length; i++) {
            if (typed[i] === target[i]) matched += 1;
        }
        const accuracy = percent(matched, Math.max(typed.length, 1));
        const elapsedSec = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
        this.feedbackEl.textContent = `진행 중... 정확도 ${accuracy}% | ${elapsedSec}초`;
        if (typed === target) {
            const timeMin = (Date.now() - this.startTime) / 60000;
            const wpm = Math.round((target.length / 5) / timeMin);
            const isBest = Store.saveGameRecord('typing', wpm);
            this.roundDone = true;
            this.feedbackEl.textContent = `완료! ${wpm} WPM / 정확도 ${accuracy}%`;
            if (isBest) {
                this.feedbackEl.textContent += ' (최고 기록!)';
                this.feedbackEl.appendChild(
                  createShareButton('기록 공유', () => dispatchShare('타이핑 속도', `${wpm} WPM`))
                );
            }
            this.updateStatus();
        }
    }

    updateStatus() {
        this.statusEl.textContent = `Best: ${Store.getGameRecord('typing') || 0} WPM`;
    }
}

export class ReflexGame {
  constructor(element) {
    this.container = element;
    this.score = 0;
    this.timeLeft = 20;
    this.isPlaying = false;
    this.expected = null;
    this.roundTimeout = null;
    this.timer = null;
    this.handleKeyDown = (e) => {
      if (!this.isPlaying) return;
      if (e.key === 'ArrowLeft') this.answer('left');
      if (e.key === 'ArrowRight') this.answer('right');
    };
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="game-header">
        <h3 class="game-title">⚡ 리플렉스 듀얼</h3>
        <span class="reflex-status">Time: 20s | Score: 0</span>
      </div>
      <div class="reflex-area reflex-duel-area">
        <div class="reflex-target" id="reflex-prompt">READY</div>
      </div>
      <div class="game-controls">
        <p class="text-sub">화면의 방향과 같은 버튼(또는 ←/→ 키)을 빠르게 누르세요.</p>
        <div class="rps-buttons">
          <button class="btn btn-secondary" data-answer="left">← LEFT</button>
          <button class="btn btn-secondary" data-answer="right">RIGHT →</button>
        </div>
        <button class="btn btn-primary" id="start-reflex">게임 시작</button>
        <button class="btn btn-secondary" id="reset-reflex">기록 초기화</button>
      </div>
    `;
    this.statusEl = this.container.querySelector('.reflex-status');
    this.promptEl = this.container.querySelector('#reflex-prompt');
    this.container.querySelector('#start-reflex').addEventListener('click', () => this.start());
    this.container.querySelector('#reset-reflex').addEventListener('click', () => {
      Store.saveGameRecord('reflex', 0);
      this.stopAll();
      this.score = 0;
      this.timeLeft = 20;
      this.promptEl.textContent = 'READY';
      this.updateStatus();
      alert('기록이 초기화되었습니다.');
    });
    this.container.querySelectorAll('[data-answer]').forEach(btn => {
      btn.addEventListener('click', () => this.answer(btn.dataset.answer));
    });
    document.addEventListener('keydown', this.handleKeyDown);
    this.updateStatus();
  }

  start() {
    this.stopAll();
    this.score = 0;
    this.timeLeft = 20;
    this.isPlaying = true;
    this.updateStatus();
    this.nextPrompt();
    this.timer = setInterval(() => {
      this.timeLeft -= 1;
      this.updateStatus();
      if (this.timeLeft <= 0) this.end();
    }, 1000);
  }

  nextPrompt() {
    if (!this.isPlaying) return;
    this.expected = Math.random() < 0.5 ? 'left' : 'right';
    this.promptEl.textContent = this.expected === 'left' ? '⬅ LEFT' : 'RIGHT ➡';
    const responseLimit = this.score >= 15 ? 650 : this.score >= 8 ? 800 : 950;
    clearTimeout(this.roundTimeout);
    this.roundTimeout = setTimeout(() => {
      this.score = Math.max(0, this.score - 1);
      this.nextPrompt();
      this.updateStatus();
    }, responseLimit);
  }

  answer(value) {
    if (!this.isPlaying || !this.expected) return;
    clearTimeout(this.roundTimeout);
    if (value === this.expected) this.score += 2;
    else this.score = Math.max(0, this.score - 1);
    this.updateStatus();
    this.nextPrompt();
  }

  updateStatus() {
    const best = Store.getGameRecord('reflex') || 0;
    this.statusEl.textContent = `Time: ${this.timeLeft}s | Score: ${this.score} (Best: ${best})`;
  }

  stopAll() {
    this.isPlaying = false;
    clearInterval(this.timer);
    clearTimeout(this.roundTimeout);
    this.timer = null;
    this.roundTimeout = null;
  }

  end() {
    this.stopAll();
    this.promptEl.textContent = 'TIME UP';
    const isBest = Store.saveGameRecord('reflex', this.score);
    if (isBest) {
      this.statusEl.textContent += ' (최고 기록!)';
      dispatchShare('리플렉스 듀얼', `${this.score}점`);
    }
  }

  destroy() {
    this.stopAll();
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}

export class MazeGame {
    constructor(element) {
        this.container = element;
        this.grid = [
            [1,1,1,1,1,1,1],
            [1,0,0,0,1,0,1],
            [1,0,1,0,1,0,1],
            [1,0,1,0,0,0,1],
            [1,0,1,1,1,0,1],
            [1,0,0,0,0,0,1],
            [1,1,1,1,1,1,1],
        ];
        this.player = { x: 1, y: 1 };
        this.goal = { x: 5, y: 5 };
        this.moves = 0;
        this.startTime = null;
        this.handleKeyDown = (e) => this.handleKey(e);
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h3 class="game-title">🧭 미로 탈출</h3>
                <span class="maze-status">Moves: 0 | Time: 0s | Best: ${Store.getGameRecord('maze') || 0}</span>
            </div>
            <div class="maze-grid"></div>
            <div class="maze-controls">
                <button class="btn btn-secondary" data-dir="up">▲</button>
                <div class="maze-row">
                    <button class="btn btn-secondary" data-dir="left">◀</button>
                    <button class="btn btn-secondary" data-dir="down">▼</button>
                    <button class="btn btn-secondary" data-dir="right">▶</button>
                </div>
            </div>
            <div class="game-controls">
                <button class="btn btn-primary" id="reset-maze">다시 시작</button>
                <button class="btn btn-secondary" id="reset-maze-score">기록 초기화</button>
            </div>
        `;

        this.statusEl = this.container.querySelector('.maze-status');
        this.gridEl = this.container.querySelector('.maze-grid');
        this.draw();

        this.container.querySelectorAll('.maze-controls [data-dir]').forEach(btn => {
            btn.addEventListener('click', () => this.move(btn.dataset.dir));
        });
        this.container.querySelector('#reset-maze').addEventListener('click', () => this.reset());
        this.container.querySelector('#reset-maze-score').addEventListener('click', () => {
            Store.saveGameRecord('maze', 0);
            this.updateStatus();
            alert('기록이 초기화되었습니다.');
        });
        document.addEventListener('keydown', this.handleKeyDown);
        this.startTime = Date.now();
    }

    handleKey(e) {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
        }
        if (e.key === 'ArrowUp') this.move('up');
        if (e.key === 'ArrowDown') this.move('down');
        if (e.key === 'ArrowLeft') this.move('left');
        if (e.key === 'ArrowRight') this.move('right');
    }

    reset() {
        this.player = { x: 1, y: 1 };
        this.moves = 0;
        this.startTime = Date.now();
        this.draw();
        this.updateStatus();
    }

    move(dir) {
        const delta = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] }[dir];
        if (!delta) return;
        const nx = this.player.x + delta[0];
        const ny = this.player.y + delta[1];
        if (this.grid[ny][nx] === 1) return;
        this.player = { x: nx, y: ny };
        this.moves += 1;
        this.draw();
        if (nx === this.goal.x && ny === this.goal.y) this.win();
        this.updateStatus();
    }

    draw() {
        this.gridEl.innerHTML = '';
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[0].length; x++) {
                const cell = document.createElement('div');
                cell.className = 'maze-cell';
                if (this.grid[y][x] === 1) cell.classList.add('wall');
                if (x === this.goal.x && y === this.goal.y) cell.classList.add('goal');
                if (x === this.player.x && y === this.player.y) cell.classList.add('player');
                this.gridEl.appendChild(cell);
            }
        }
    }

    updateStatus() {
        const best = Store.getGameRecord('maze') || 0;
        const sec = Math.round((Date.now() - this.startTime) / 1000);
        this.statusEl.textContent = `Moves: ${this.moves} | Time: ${sec}s | Best: ${best}`;
    }

    win() {
        const timeSec = Math.round((Date.now() - this.startTime) / 1000);
        const score = Math.max(0, 1000 - this.moves * 10 - timeSec * 5);
        const isBest = Store.saveGameRecord('maze', score);
        alert(`탈출 성공! 시간: ${timeSec}s, 점수: ${score}`);
        if (isBest) {
            dispatchShare('미로 탈출', `${score}점 / ${timeSec}초`);
        }
    }

    destroy() {
        document.removeEventListener('keydown', this.handleKeyDown);
    }
}

export class DodgeGame {
    constructor(element) {
        this.container = element;
        this.width = 280;
        this.height = 320;
        this.playerX = 120;
        this.obstacles = [];
        this.score = 0;
        this.timer = null;
        this.spawnTimer = null;
        this.fallSpeed = 4;
        this.isPlaying = false;
        this.handleKeyDown = (e) => {
            if (!this.isPlaying) return;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault();
            if (e.key === 'ArrowLeft') this.move('left');
            if (e.key === 'ArrowRight') this.move('right');
        };
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h3 class="game-title">☄️ 낙하 피하기</h3>
                <span class="dodge-status">Score: 0 (Best: ${Store.getGameRecord('dodge') || 0})</span>
            </div>
            <div class="dodge-area">
                <div class="dodge-player"></div>
            </div>
            <div class="dodge-controls">
                <button class="btn btn-secondary" data-move="left">◀</button>
                <button class="btn btn-secondary" data-move="right">▶</button>
            </div>
            <div class="game-controls">
                <button class="btn btn-primary" id="start-dodge">게임 시작</button>
                <button class="btn btn-secondary" id="reset-dodge">기록 초기화</button>
            </div>
        `;

        this.statusEl = this.container.querySelector('.dodge-status');
        this.areaEl = this.container.querySelector('.dodge-area');
        this.playerEl = this.container.querySelector('.dodge-player');

        this.container.querySelector('#start-dodge').addEventListener('click', () => this.start());
        this.container.querySelector('#reset-dodge').addEventListener('click', () => {
            Store.saveGameRecord('dodge', 0);
            this.updateStatus();
            alert('기록이 초기화되었습니다.');
        });
        this.container.querySelectorAll('.dodge-controls [data-move]').forEach(btn => {
            btn.addEventListener('click', () => this.move(btn.dataset.move));
        });
        document.addEventListener('keydown', this.handleKeyDown);
        this.updatePlayer();
    }

    start() {
        this.isPlaying = true;
        this.obstacles = [];
        this.score = 0;
        this.fallSpeed = 4;
        this.playerX = 120;
        this.clearObstacles();
        this.updatePlayer();
        this.updateStatus();
        clearInterval(this.timer);
        clearInterval(this.spawnTimer);

        this.timer = setInterval(() => this.tick(), 50);
        this.spawnTimer = setInterval(() => this.spawn(), 700);
    }

    move(dir) {
        if (dir === 'left') this.playerX -= 20;
        if (dir === 'right') this.playerX += 20;
        this.playerX = Math.max(0, Math.min(this.playerX, this.width - 30));
        this.updatePlayer();
    }

    updatePlayer() {
        this.playerEl.style.transform = `translateX(${this.playerX}px)`;
    }

    spawn() {
        const x = Math.floor(Math.random() * (this.width - 20));
        const el = document.createElement('div');
        el.className = 'dodge-obstacle';
        el.style.left = `${x}px`;
        el.style.top = `0px`;
        this.areaEl.appendChild(el);
        this.obstacles.push({ el, y: 0, x });
    }

    tick() {
        this.score += 1;
        this.updateStatus();
        const playerRect = { x: this.playerX, y: this.height - 24, w: 30, h: 18 };

        this.obstacles.forEach(obs => {
            obs.y += this.fallSpeed;
            obs.el.style.top = `${obs.y}px`;
        });

        const remaining = [];
        for (const obs of this.obstacles) {
            const hit = this.isHit(playerRect, { x: obs.x, y: obs.y, w: 20, h: 20 });
            if (hit) {
                this.end();
                return;
            }
            if (obs.y < this.height) remaining.push(obs);
            else obs.el.remove();
        }
        this.obstacles = remaining;
        if (this.score % 180 === 0) {
            this.fallSpeed = Math.min(9, this.fallSpeed + 0.2);
        }
    }

    isHit(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
    }

    updateStatus() {
        const best = Store.getGameRecord('dodge') || 0;
        this.statusEl.textContent = `Score: ${this.score} (Best: ${best})`;
    }

    clearObstacles() {
        this.areaEl.querySelectorAll('.dodge-obstacle').forEach(el => el.remove());
    }

    end() {
        this.isPlaying = false;
        clearInterval(this.timer);
        clearInterval(this.spawnTimer);
        const isBest = Store.saveGameRecord('dodge', this.score);
        alert(`게임 종료! 점수: ${this.score}`);
        if (isBest) {
            dispatchShare('낙하 피하기', `${this.score}점`);
        }
    }

    destroy() {
        this.isPlaying = false;
        clearInterval(this.timer);
        clearInterval(this.spawnTimer);
        document.removeEventListener('keydown', this.handleKeyDown);
        this.obstacles.forEach(obs => obs.el.remove());
        this.obstacles = [];
    }
}
