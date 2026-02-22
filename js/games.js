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
      this.state = 'idle';
    } else if (this.state === 'ready') {
      const reactionTime = Date.now() - this.startTime;
      this.endGame(reactionTime);
    }
  }

  startWait() {
    this.state = 'waiting';
    this.area.className = 'game-area reaction-area waiting';
    this.status.textContent = "초록색이 되면 클릭하세요...";
    this.result.textContent = '';
    
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
    this.status.textContent = `${time}ms! 다시 하려면 클릭.`;
    
    const isBest = Store.saveGameRecord('reaction', time);
    const best = Store.getGameRecord('reaction');
    this.result.innerHTML = `현재: ${time}ms <br> 최고: ${best}ms ${isBest ? '(New!)' : ''}`;
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
      </div>
    `;
    this.grid = this.container.querySelector('#memory-grid');
    this.scoreDisplay = this.container.querySelector('.game-score');
    
    this.container.querySelector('#start-memory').addEventListener('click', () => this.startGame());
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
      this.scoreDisplay.textContent = `Turns: ${this.turns}`;
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
    Store.saveGameRecord('memory', this.turns);
    alert(`성공! 총 ${this.turns}턴 소요되었습니다.`);
    this.startGame();
  }
}

export class RhythmGame {
    constructor(element) {
        this.container = element;
        this.score = 0;
        this.isPlaying = false;
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
            </div>
        `;
        this.area = this.container.querySelector('#rhythm-area');
        this.notesContainer = this.container.querySelector('.notes-container');
        this.scoreEl = this.container.querySelector('.rhythm-score');
        
        this.container.querySelector('#start-rhythm').addEventListener('click', () => this.startGame());
        
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
        this.scoreEl.textContent = `Score: 0`;
        this.notesContainer.innerHTML = '';
        
        this.spawnInterval = setInterval(() => this.spawnNote(), 800);
        this.gameTimer = setTimeout(() => this.endGame(), 15000); // 15 seconds game
    }

    spawnNote() {
        const note = document.createElement('div');
        note.className = 'rhythm-note';
        this.notesContainer.appendChild(note);
        
        // Cleanup missed notes
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
            // Check if note is near the target zone (bottom)
            if (noteY > targetY - 40 && noteY < targetY + 40) {
                this.score += 10;
                this.scoreEl.textContent = `Score: ${this.score}`;
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
        Store.saveGameRecord('rhythm', this.score);
        alert(`게임 종료! 점수: ${this.score}`);
        this.notesContainer.innerHTML = '';
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
            </div>
        `;
        this.grid = this.container.querySelector('#puzzle-grid');
        this.movesEl = this.container.querySelector('.puzzle-moves');
        
        this.container.querySelector('#shuffle-puzzle').addEventListener('click', () => this.shuffle());
        this.initGrid();
    }

    initGrid() {
        this.tiles = Array.from({length: 15}, (_, i) => i + 1);
        this.tiles.push(null); // Empty slot
        this.emptyIndex = 15;
        this.draw();
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
        // Simple valid shuffle: perform random valid moves
        for (let i = 0; i < 100; i++) {
            const neighbors = [];
            const row = Math.floor(this.emptyIndex / 4);
            const col = this.emptyIndex % 4;

            if (row > 0) neighbors.push(this.emptyIndex - 4);
            if (row < 3) neighbors.push(this.emptyIndex + 4);
            if (col > 0) neighbors.push(this.emptyIndex - 1);
            if (col < 3) neighbors.push(this.emptyIndex + 1);

            const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
            this.tiles[this.emptyIndex] = this.tiles[randomNeighbor];
            this.tiles[randomNeighbor] = null;
            this.emptyIndex = randomNeighbor;
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
        Store.saveGameRecord('puzzle', this.moves);
        alert(`축하합니다! ${this.moves}번 움직여서 완성했습니다.`);
    }
}
