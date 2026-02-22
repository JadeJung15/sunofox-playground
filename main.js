// Lotto Generator Component
class LottoGenerator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          text-align: center;
        }
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
        }
        .numbers {
          display: flex;
          gap: 0.8rem;
          justify-content: center;
          flex-wrap: wrap;
          min-height: 4.5rem;
        }
        .number {
          display: grid;
          place-content: center;
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          background: var(--number-bg);
          color: var(--text-color);
          font-size: 1.25rem;
          font-weight: 700;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          opacity: 0;
          transform: translateY(20px);
          animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes popIn {
          to { opacity: 1; transform: translateY(0); }
        }
        button {
          padding: 1rem 2.5rem;
          border: none;
          border-radius: 2rem;
          background: linear-gradient(135deg, var(--accent-color), var(--accent-hover));
          color: var(--btn-text);
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }
        button:active {
          transform: translateY(1px);
        }
        /* Ball colors based on standard lotto ranges (optional aesthetic) */
        .number:nth-child(n) { border: 2px solid transparent; }
      </style>
      <div class="container">
        <div class="numbers"></div>
        <button id="generate-btn">번호 생성하기</button>
      </div>
    `;

    this.shadowRoot.getElementById('generate-btn').addEventListener('click', () => this.generateNumbers());
    this.generateNumbers();
  }

  generateNumbers() {
    const numbersContainer = this.shadowRoot.querySelector('.numbers');
    numbersContainer.innerHTML = '';
    const numbers = new Set();
    while (numbers.size < 6) numbers.add(Math.floor(Math.random() * 45) + 1);

    [...numbers].sort((a, b) => a - b).forEach((num, i) => {
      const el = document.createElement('div');
      el.className = 'number';
      el.textContent = num;
      el.style.animationDelay = `${i * 0.1}s`;
      numbersContainer.appendChild(el);
    });
  }
}

// Coin Flipper Component
class CoinFlipper extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; text-align: center; }
        .coin-container {
          perspective: 1000px;
          width: 150px;
          height: 150px;
          margin: 0 auto 1.5rem;
          cursor: pointer;
        }
        .coin {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .side {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-weight: 900;
          font-size: 2rem;
          backface-visibility: hidden;
          box-shadow: inset 0 0 20px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.2);
          border: 10px solid rgba(255,255,255,0.2);
        }
        .front { background: #FFD700; color: #B8860B; transform: rotateY(0deg); }
        .back { background: #C0C0C0; color: #696969; transform: rotateY(180deg); }
        
        button {
          padding: 0.8rem 2rem;
          border: none;
          border-radius: 2rem;
          background: var(--text-color);
          color: var(--bg-color);
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }
        button:hover { opacity: 0.9; transform: scale(1.05); }
      </style>
      <div class="coin-container" id="coin-container">
        <div class="coin" id="coin">
          <div class="side front">앞</div>
          <div class="side back">뒤</div>
        </div>
      </div>
      <button id="flip-btn">동전 던지기</button>
      <div id="result" style="margin-top:1rem; font-weight:bold; min-height:1.5em;"></div>
    `;

    this.shadowRoot.getElementById('flip-btn').addEventListener('click', () => this.flipCoin());
    this.shadowRoot.getElementById('coin-container').addEventListener('click', () => this.flipCoin());
  }

  flipCoin() {
    const coin = this.shadowRoot.getElementById('coin');
    const resultText = this.shadowRoot.getElementById('result');
    const isHeads = Math.random() < 0.5;
    const rotations = 5 + Math.random() * 5; // Random spins between 5 and 10
    const rotateY = isHeads ? rotations * 360 : (rotations * 360) + 180;
    
    coin.style.transition = 'none';
    coin.style.transform = 'rotateY(0deg)';
    
    // Force reflow
    void coin.offsetWidth;

    coin.style.transition = 'transform 3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    coin.style.transform = `rotateY(${rotateY}deg)`;
    
    resultText.textContent = '두구두구...';
    
    setTimeout(() => {
      resultText.textContent = isHeads ? '앞면!' : '뒷면!';
    }, 3000);
  }
}

// Decision Maker Component
class DecisionMaker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; text-align: center; }
        .result-box {
          font-size: 2.5rem;
          font-weight: 900;
          min-height: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-color);
          margin-bottom: 1.5rem;
          text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        button {
          padding: 1rem 2rem;
          border: none;
          border-radius: 1rem;
          background: var(--text-color);
          color: var(--bg-color);
          font-weight: 700;
          cursor: pointer;
          font-size: 1rem;
          transition: 0.2s;
        }
        button:hover { transform: scale(1.05); }
        .sub-text { opacity: 0.7; margin-top: 1rem; font-size: 0.9rem; }
      </style>
      <div class="result-box" id="decision-result">?</div>
      <button id="decide-btn">결정 내려줘!</button>
      <div class="sub-text">YES or NO</div>
    `;

    this.shadowRoot.getElementById('decide-btn').addEventListener('click', () => this.makeDecision());
  }

  makeDecision() {
    const resultBox = this.shadowRoot.getElementById('decision-result');
    const options = ['YES!', 'NO', '글쎄...', '무조건 고!', '절대 안돼', '다시 생각해보세요'];
    let count = 0;
    const maxCount = 20;
    
    const interval = setInterval(() => {
      resultBox.textContent = options[Math.floor(Math.random() * options.length)];
      resultBox.style.transform = `scale(${0.9 + Math.random() * 0.2})`;
      count++;
      if (count >= maxCount) {
        clearInterval(interval);
        const finalDecision = Math.random() < 0.5 ? 'YES!' : 'NO'; // Weight towards simple Yes/No for final
        resultBox.textContent = finalDecision;
        resultBox.style.transform = 'scale(1.2)';
        resultBox.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        resultBox.style.color = finalDecision === 'YES!' ? '#4CAF50' : '#F44336';
      }
    }, 50);
  }
}

customElements.define('lotto-generator', LottoGenerator);
customElements.define('coin-flipper', CoinFlipper);
customElements.define('decision-maker', DecisionMaker);
