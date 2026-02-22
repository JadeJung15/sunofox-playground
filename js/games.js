// js/games.js
import { Store } from './store.js';

export class ReactionGame {
  constructor(element) {
    this.container = element;
    this.state = 'idle'; // idle, waiting, ready, finished
    this.timer = null;
    this.startTime = 0;
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
        <button class="btn btn-secondary" id="reset-reaction">기록 초기화</button>
      </div>
    `;
    this.area = this.container.querySelector('#reaction-area');
    this.status = this.container.querySelector('.game-status');
    this.result = this.container.querySelector('.game-result');

    this.area.addEventListener('click', () => this.handleClick());
    this.container.querySelector('#reset-reaction').addEventListener('click', () => {
      Store.saveGameRecord('reaction', null);
      this.result.textContent = '기록 초기화됨.';
      alert('기록이 초기화되었습니다.');
    });
  }

  handleClick() {
    if (this.state === 'idle' || this.state === 'finished') {
      this.startWait();
    } else if (this.state === 'waiting') {
      clearTimeout(this.timer);
      this.status.textContent = "너무 빨라요! 다시 시도하세요.";
      this.area.className = 'game-area reaction-area error';
      this.state = 'finished'; // Go to finished state to allow restart
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
    
    this.status.textContent = `${time}ms! 다시 하려면 클릭.`;
    this.result.innerHTML = `현재: ${time}ms <br> 최고: ${best}ms ${isBest ? '(New!)' : ''}`;

    if (isBest) {
        this.result.innerHTML += ` <button class="btn btn-primary btn-share" data-game-name="반응속도 테스트" data-score="${time}ms">공유하기</button>`;
        this.result.querySelector('.btn-share').addEventListener('click', (e) => {
            window.dispatchEvent(new CustomEvent('gameShareRecord', { 
                detail: { 
                    gameName: e.target.dataset.gameName, 
                    score: e.target.dataset.score 
                } 
            }));
        });
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
    alert(`성공! 총 ${this.turns}턴 소요되었습니다. (최고 기록: ${best || '-'})`);
    
    if (isBest) {
        const shareConfirm = confirm('새로운 최고 기록입니다! 커뮤니티에 공유하시겠습니까?');
        if (shareConfirm) {
            window.dispatchEvent(new CustomEvent('gameShareRecord', { 
                detail: { 
                    gameName: '카드 뒤집기', 
                    score: `${this.turns}턴` 
                } 
            }));
        }
    }
    this.startGame();
  }
}

export class RhythmGame {
    constructor(element) {
        this.container = element;
        this.score = 0;
        this.isPlaying = false;
        this.spawnInterval = null;
        this.gameTimer = null;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h3 class="game-title">🎵 비트 탭</h3>
                <span class="rhythm-score">Score: 0</span>
            </div>
            <div class="rhythm-area" id="rhythm-area">
                <div class="target-zone"></div>
                <div class="notes-container"></div>
            </div>
            <div class="game-controls">
                <p>타이밍에 맞춰 스페이스바 또는 화면 터치!</p>
                <button class="btn btn-primary" id="start-rhythm">게임 시작</button>
                <button class="btn btn-secondary" id="reset-rhythm">기록 초기화</button>
            </div>
        `;
        this.area = this.container.querySelector('#rhythm-area');
        this.notesContainer = this.container.querySelector('.notes-container');
        this.scoreEl = this.container.querySelector('.rhythm-score');
        
        this.container.querySelector('#start-rhythm').addEventListener('click', () => this.startGame());
        this.container.querySelector('#reset-rhythm').addEventListener('click', () => {
            Store.saveGameRecord('rhythm', 0);
            this.scoreEl.textContent = `Score: 0 (Best: 0)`;
            alert('기록이 초기화되었습니다.');
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isPlaying) {
                e.preventDefault(); // Scroll prevent
                this.hit();
            }
        });
        this.area.addEventListener('touchstart', (e) => {
             if (this.isPlaying) {
                e.preventDefault();
                this.hit();
             }
        });
    }

    startGame() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.score = 0;
        this.scoreEl.textContent = `Score: 0 (Best: ${Store.getGameRecord('rhythm') || 0})`;
        this.notesContainer.innerHTML = '';
        
        this.spawnInterval = setInterval(() => this.spawnNote(), 800);
        this.gameTimer = setTimeout(() => this.endGame(), 15000); // 15 seconds game
    }

    spawnNote() {
        const note = document.createElement('div');
        note.className = 'rhythm-note';
        this.notesContainer.appendChild(note);
        
        setTimeout(() => {
            if (note.parentNode) {
                note.remove();
            }
        }, 2000);
    }

    hit() {
        const notes = document.querySelectorAll('.rhythm-note');
        const targetY = this.area.clientHeight - 50; // Approximation
        let hitMade = false;

        notes.forEach(note => {
            const noteY = note.offsetTop;
            if (noteY > targetY - 40 && noteY < targetY + 40) {
                this.score += 10;
                this.scoreEl.textContent = `Score: ${this.score} (Best: ${Store.getGameRecord('rhythm') || 0})`;
                note.classList.add('hit');
                setTimeout(() => note.remove(), 100);
                hitMade = true;
            }
        });

        if (hitMade) {
            this.area.classList.add('pulse');
            setTimeout(() => this.area.classList.remove('pulse'), 100);
        }
    }

    endGame() {
        this.isPlaying = false;
        clearInterval(this.spawnInterval);
        clearTimeout(this.gameTimer);
        
        const isBest = Store.saveGameRecord('rhythm', this.score);
        const best = Store.getGameRecord('rhythm');
        alert(`게임 종료! 점수: ${this.score} (최고 기록: ${best || 0})`);
        this.notesContainer.innerHTML = '';

        if (isBest) {
            const shareConfirm = confirm('새로운 최고 기록입니다! 커뮤니티에 공유하시겠습니까?');
            if (shareConfirm) {
                window.dispatchEvent(new CustomEvent('gameShareRecord', { 
                    detail: { 
                        gameName: '비트 탭', 
                        score: `${this.score}점` 
                    } 
                }));
            }
        }
    }
}

export class PuzzleGame {
    constructor(element) {
        this.container = element;
        this.tiles = [];
        this.emptyIndex = 15;
        this.moves = 0;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h3 class="game-title">🧩 15 퍼즐</h3>
                <span class="puzzle-moves">Moves: 0</span>
            </div>
            <div class="puzzle-grid" id="puzzle-grid"></div>
            <div class="game-controls">
                <button class="btn btn-primary" id="shuffle-puzzle">섞기</button>
                <button class="btn btn-secondary" id="reset-puzzle">기록 초기화</button>
            </div>
        `;
        this.grid = this.container.querySelector('#puzzle-grid');
        this.movesEl = this.container.querySelector('.puzzle-moves');
        
        this.container.querySelector('#shuffle-puzzle').addEventListener('click', () => this.shuffle());
        this.container.querySelector('#reset-puzzle').addEventListener('click', () => {
            Store.saveGameRecord('puzzle', null);
            this.movesEl.textContent = `Moves: 0 (Best: -)`;
            alert('기록이 초기화되었습니다.');
        });
        this.initGrid();
    }

    initGrid() {
        this.tiles = Array.from({length: 15}, (_, i) => i + 1);
        this.tiles.push(null); // Empty slot
        this.emptyIndex = 15;
        this.draw();
        this.shuffle(); // Shuffle on init
    }

    draw() {
        this.grid.innerHTML = '';
        this.tiles.forEach((num, index) => {
            const tile = document.createElement('div');
            tile.className = `puzzle-tile ${num === null ? 'empty' : ''}`;
            if (num !== null) {
                tile.textContent = num;
                tile.addEventListener('click', () => this.move(index));
            }
            this.grid.appendChild(tile);
        });
        this.movesEl.textContent = `Moves: ${this.moves} (Best: ${Store.getGameRecord('puzzle') || '-'})`;
    }

    move(index) {
        if (this.canMove(index)) {
            this.tiles[this.emptyIndex] = this.tiles[index];
            this.tiles[index] = null;
            this.emptyIndex = index;
            this.moves++;
            this.draw();
            this.checkWin();
        }
    }

    canMove(index) {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const emptyRow = Math.floor(this.emptyIndex / 4);
        const emptyCol = this.emptyIndex % 4;
        
        return (Math.abs(row - emptyRow) + Math.abs(col - emptyCol)) === 1;
    }

    shuffle() {
        // Perform many valid random moves to ensure solvability
        for (let i = 0; i < 200; i++) { // More shuffles for better randomness
            const neighbors = [];
            const row = Math.floor(this.emptyIndex / 4);
            const col = this.emptyIndex % 4;

            if (row > 0) neighbors.push(this.emptyIndex - 4);
            if (row < 3) neighbors.push(this.emptyIndex + 4);
            if (col > 0) neighbors.push(this.emptyIndex - 1);
            if (col < 3) neighbors.push(this.emptyIndex + 1);

            if (neighbors.length > 0) {
                const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.tiles[this.emptyIndex] = this.tiles[randomNeighbor];
                this.tiles[randomNeighbor] = null;
                this.emptyIndex = randomNeighbor;
            }
        }
        this.moves = 0;
        this.draw();
    }

    checkWin() {
        // Only check if last tile is empty and others are sorted
        if (this.tiles[15] !== null) return;
        
        for (let i = 0; i < 15; i++) {
            if (this.tiles[i] !== i + 1) return;
        }
        
        const isBest = Store.saveGameRecord('puzzle', this.moves);
        const best = Store.getGameRecord('puzzle');
        alert(`축하합니다! ${this.moves}번 움직여서 완성했습니다. (최고 기록: ${best || '-'})`);

        if (isBest) {
            const shareConfirm = confirm('새로운 최고 기록입니다! 커뮤니티에 공유하시겠습니까?');
            if (shareConfirm) {
                window.dispatchEvent(new CustomEvent('gameShareRecord', { 
                    detail: { 
                        gameName: '15 퍼즐', 
                        score: `${this.moves}회` 
                    } 
                }));
            }
        }
    }
}

export class MathGame {
    constructor(element) {
        this.container = element;
        this.score = 0;
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
                <span class="math-status">Time: 30s | Score: 0</span>
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
        this.statusEl.textContent = `Time: ${this.timeLeft}s | Score: ${this.score} (Best: ${best})`;
    }

    nextQuestion() {
        const a = Math.floor(Math.random() * 30) + 1;
        const b = Math.floor(Math.random() * 30) + 1;
        const c = Math.floor(Math.random() * 10);
        const useThree = Math.random() < 0.4;
        this.answer = useThree ? a + b + c : a + b;
        this.questionEl.textContent = useThree ? `${a} + ${b} + ${c} = ?` : `${a} + ${b} = ?`;
    }

    submitAnswer() {
        if (!this.isPlaying) return;
        const value = parseInt(this.inputEl.value, 10);
        if (Number.isNaN(value)) return;
        if (value === this.answer) {
            this.score += 1;
            this.feedbackEl.textContent = '정답!';
        } else {
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
            const shareBtn = document.createElement('button');
            shareBtn.className = 'btn btn-primary btn-share';
            shareBtn.textContent = '공유하기';
            shareBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('gameShareRecord', {
                    detail: { gameName: '스피드 합산', score: `${this.score}점` }
                }));
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
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h3 class="game-title">✊ 가위바위보</h3>
                <span class="rps-status">연승: 0 (Best: ${Store.getGameRecord('rps') || 0})</span>
            </div>
            <div class="rps-area">
                <div class="rps-buttons">
                    <button class="btn btn-secondary" data-pick="rock">✊ 바위</button>
                    <button class="btn btn-secondary" data-pick="paper">✋ 보</button>
                    <button class="btn btn-secondary" data-pick="scissors">✌️ 가위</button>
                </div>
                <div class="rps-result">버튼을 눌러 대결하세요!</div>
                <div class="rps-scoreboard">승 ${this.wins} / 패 ${this.losses} / 무 ${this.draws}</div>
            </div>
            <div class="game-controls">
                <button class="btn btn-secondary" id="reset-rps">기록 초기화</button>
            </div>
        `;

        this.statusEl = this.container.querySelector('.rps-status');
        this.resultEl = this.container.querySelector('.rps-result');
        this.scoreEl = this.container.querySelector('.rps-scoreboard');

        this.container.querySelectorAll('.rps-buttons .btn').forEach(btn => {
            btn.addEventListener('click', () => this.playRound(btn.dataset.pick));
        });
        this.container.querySelector('#reset-rps').addEventListener('click', () => {
            Store.saveGameRecord('rps', 0);
            this.updateStatus();
            alert('기록이 초기화되었습니다.');
        });
    }

    playRound(player) {
        const cpu = this.randomPick();
        const result = this.getResult(player, cpu);

        if (result === 'win') {
            this.wins += 1;
            this.streak += 1;
        } else if (result === 'lose') {
            this.losses += 1;
            this.streak = 0;
        } else {
            this.draws += 1;
        }

        const isBest = Store.saveGameRecord('rps', this.streak);
        this.resultEl.innerHTML = `내 선택: ${this.toKorean(player)} / 컴퓨터: ${this.toKorean(cpu)}<br>${this.resultMessage(result)}`;
        if (isBest && this.streak > 0) {
            const shareBtn = document.createElement('button');
            shareBtn.className = 'btn btn-primary btn-share';
            shareBtn.textContent = '공유하기';
            shareBtn.addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('gameShareRecord', {
                    detail: { gameName: '가위바위보', score: `${this.streak}연승` }
                }));
            });
            this.resultEl.appendChild(shareBtn);
        }
        this.updateStatus();
        this.updateScoreboard();
    }

    updateStatus() {
        this.statusEl.textContent = `연승: ${this.streak} (Best: ${Store.getGameRecord('rps') || 0})`;
    }

    updateScoreboard() {
        this.scoreEl.textContent = `승 ${this.wins} / 패 ${this.losses} / 무 ${this.draws}`;
    }

    randomPick() {
        const picks = ['rock', 'paper', 'scissors'];
        return picks[Math.floor(Math.random() * picks.length)];
    }

    getResult(player, cpu) {
        if (player === cpu) return 'draw';
        if (
            (player === 'rock' && cpu === 'scissors') ||
            (player === 'paper' && cpu === 'rock') ||
            (player === 'scissors' && cpu === 'paper')
        ) return 'win';
        return 'lose';
    }

    resultMessage(result) {
        if (result === 'win') return '승리! 연승을 이어가세요.';
        if (result === 'lose') return '패배! 연승이 끊겼습니다.';
        return '무승부! 다시 도전!';
    }

    toKorean(pick) {
        if (pick === 'rock') return '바위';
        if (pick === 'paper') return '보';
        return '가위';
    }
}

export class PersonalityTest {
    constructor(element) {
        this.container = element;
        this.questions = [
            { q: '주말에 가장 하고 싶은 일은?', options: [
                { t: 'A', text: '혼자 조용히 쉬기' },
                { t: 'B', text: '친구들과 약속 잡기' },
                { t: 'C', text: '새로운 취미 도전' },
            ]},
            { q: '스트레스를 받으면 나는?', options: [
                { t: 'A', text: '집에서 혼자 정리한다' },
                { t: 'B', text: '사람들과 이야기한다' },
                { t: 'C', text: '밖으로 나간다' },
            ]},
            { q: '여행 스타일은?', options: [
                { t: 'A', text: '느긋하게 휴식' },
                { t: 'B', text: '맛집/사람 위주' },
                { t: 'C', text: '활동적인 일정' },
            ]},
            { q: '집에 도착하면 먼저 하는 일은?', options: [
                { t: 'A', text: '샤워 후 휴식' },
                { t: 'B', text: '메신저 확인' },
                { t: 'C', text: '운동이나 산책' },
            ]},
            { q: '새로운 모임에서 나는?', options: [
                { t: 'A', text: '관찰하며 적응' },
                { t: 'B', text: '먼저 말 걸기' },
                { t: 'C', text: '분위기 띄우기' },
            ]},
            { q: '가장 끌리는 선물은?', options: [
                { t: 'A', text: '향초/디퓨저' },
                { t: 'B', text: '사진 앨범' },
                { t: 'C', text: '액티비티 티켓' },
            ]},
        ];
        this.results = {
            A: { title: '🍃 고요한 힐링러', desc: '혼자만의 시간을 즐기며 재충전하는 타입입니다. 느긋한 루틴이 최고의 휴식이에요.' },
            B: { title: '✨ 소셜 에너지러', desc: '사람들과의 교류가 에너지입니다. 함께 웃고 떠드는 시간이 최고의 회복제!' },
            C: { title: '🔥 액티브 챌린저', desc: '새로운 경험과 활동에서 힐링을 느낍니다. 움직일수록 기분이 좋아져요.' },
        };
        this.index = 0;
        this.score = { A: 0, B: 0, C: 0 };
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="game-header">
                <h3 class="game-title">💬 심리테스트</h3>
                <span class="test-progress">1 / ${this.questions.length}</span>
            </div>
            <div class="test-card">
                <div class="test-question"></div>
                <div class="test-options"></div>
            </div>
            <div class="game-controls">
                <button class="btn btn-secondary" id="reset-test">다시 시작</button>
            </div>
        `;

        this.progressEl = this.container.querySelector('.test-progress');
        this.questionEl = this.container.querySelector('.test-question');
        this.optionsEl = this.container.querySelector('.test-options');

        this.container.querySelector('#reset-test').addEventListener('click', () => this.reset());
        this.renderQuestion();
    }

    renderQuestion() {
        const current = this.questions[this.index];
        this.progressEl.textContent = `${this.index + 1} / ${this.questions.length}`;
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
        this.questionEl.innerHTML = `<strong>${result.title}</strong>`;
        this.optionsEl.innerHTML = `
            <p class="test-result">${result.desc}</p>
            <button class="btn btn-primary btn-share" id="share-test">결과 공유</button>
        `;
        this.optionsEl.querySelector('#share-test').addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('gameShareRecord', {
                detail: { gameName: '심리테스트', score: result.title }
            }));
        });
    }

    reset() {
        this.index = 0;
        this.score = { A: 0, B: 0, C: 0 };
        this.renderQuestion();
    }
}
