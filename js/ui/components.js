export function renderButton({ label, variant = 'primary', attrs = '', tag = 'button' }) {
    return `<${tag} class="button button--${variant}" ${attrs}>${label}</${tag}>`;
}

export function renderBadge(label, variant = '') {
    const variantClass = variant ? ` badge--${variant}` : '';
    return `<span class="badge${variantClass}">${label}</span>`;
}

export function renderChip(label, active = false) {
    return `<span class="chip${active ? ' active' : ''}">${label}</span>`;
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
