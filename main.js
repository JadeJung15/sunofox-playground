class LottoGenerator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: grid;
          gap: 2rem;
          text-align: center;
          color: var(--text-color);
        }

        .title {
          font-size: 2rem;
          font-weight: 700;
        }

        .numbers {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .number {
          display: grid;
          place-content: center;
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          background-color: var(--number-bg);
          color: var(--text-color);
          font-size: 1.5rem;
          font-weight: 500;
          transition: background-color 0.3s, color 0.3s;
        }

        button {
          padding: 1rem 2rem;
          border: none;
          border-radius: 0.5rem;
          background-color: var(--accent-color);
          color: var(--btn-text);
          font-size: 1.25rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s ease-in-out, transform 0.1s;
        }

        button:hover {
          background-color: var(--accent-hover);
        }

        button:active {
          transform: scale(0.98);
        }
      </style>
      <h1 class="title">Lotto Number Generator</h1>
      <div class="numbers"></div>
      <button id="generate-btn">Generate Numbers</button>
    `;

    this.shadowRoot.getElementById('generate-btn').addEventListener('click', () => this.generateNumbers());
    this.generateNumbers();
  }

  generateNumbers() {
    const numbersContainer = this.shadowRoot.querySelector('.numbers');
    numbersContainer.innerHTML = '';
    const numbers = new Set();

    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    
    sortedNumbers.forEach((number, index) => {
      const numberElement = document.createElement('div');
      numberElement.classList.add('number');
      numberElement.textContent = number;
      // Add a slight delay for animation effect
      numberElement.style.opacity = '0';
      numberElement.style.transition = 'opacity 0.3s ease-out';
      numbersContainer.appendChild(numberElement);
      
      setTimeout(() => {
        numberElement.style.opacity = '1';
      }, index * 100);
    });
  }
}

customElements.define('lotto-generator', LottoGenerator);
