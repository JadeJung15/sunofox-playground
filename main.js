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
        }

        .title {
          font-size: 2rem;
          font-weight: 700;
        }

        .numbers {
          display: flex;
          gap: 1rem;
        }

        .number {
          display: grid;
          place-content: center;
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          background-color: oklch(85% 0.15 248.33);
          font-size: 1.5rem;
          font-weight: 500;
        }

        button {
          padding: 1rem 2rem;
          border: none;
          border-radius: 0.5rem;
          background-color: oklch(56.71% 0.224 248.33);
          color: oklch(98.11% 0.0106 248.33);
          font-size: 1.25rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.2s ease-in-out;
        }

        button:hover {
          background-color: oklch(50% 0.2 248.33);
        }
      </style>
      <h1 class="title">Lotto Number Generator</h1>
      <div class="numbers"></div>
      <button>Generate Numbers</button>
    `;

    this.shadowRoot.querySelector('button').addEventListener('click', () => this.generateNumbers());
    this.generateNumbers();
  }

  generateNumbers() {
    const numbersContainer = this.shadowRoot.querySelector('.numbers');
    numbersContainer.innerHTML = '';
    const numbers = new Set();

    while (numbers.size < 6) {
      numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    for (const number of [...numbers].sort((a, b) => a - b)) {
      const numberElement = document.createElement('div');
      numberElement.classList.add('number');
      numberElement.textContent = number;
      numbersContainer.appendChild(numberElement);
    }
  }
}

customElements.define('lotto-generator', LottoGenerator);
