export function renderButton({ label, variant = 'primary', attrs = '', tag = 'button' }) {
    return `<${tag} class="button button--${variant}" ${attrs}>${label}</${tag}>`;
}

export function renderBadge(label) {
    return `<span class="badge">${label}</span>`;
}

export function renderChip(label) {
    return `<span class="chip">${label}</span>`;
}

export function renderSectionHead({ eyebrow, title, description = '', meta = '' }) {
    return `
        <div class="section-head">
            <div>
                ${eyebrow ? `<span class="eyebrow">${eyebrow}</span>` : ''}
                <h2>${title}</h2>
                ${description ? `<p>${description}</p>` : ''}
            </div>
            ${meta || ''}
        </div>
    `;
}
