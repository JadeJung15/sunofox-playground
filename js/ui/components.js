export function renderButton({ label, variant = 'primary', className = '', attrs = '', tag = 'button' }) {
    const classes = `ui-button ui-button--${variant} ${className}`.trim();
    return `<${tag} class="${classes}" ${attrs}>${label}</${tag}>`;
}

export function renderBadge(label, variant = 'soft') {
    return `<span class="ui-badge ui-badge--${variant}">${label}</span>`;
}

export function renderChip(label, variant = 'soft') {
    return `<span class="ui-chip ui-chip--${variant}">${label}</span>`;
}

export function renderSectionHeader({ eyebrow, title, description = '', meta = '' }) {
    return `
        <div class="ui-section-header">
            <div class="ui-stack ui-stack--xs">
                ${eyebrow ? `<span class="ui-eyebrow">${eyebrow}</span>` : ''}
                <h2>${title}</h2>
                ${description ? `<p class="ui-section-copy">${description}</p>` : ''}
            </div>
            ${meta ? `<div class="ui-section-meta">${meta}</div>` : ''}
        </div>
    `;
}

export function renderStatCard({ label, value, caption = '' }) {
    return `
        <article class="ui-stat-card">
            <small>${label}</small>
            <strong>${value}</strong>
            ${caption ? `<span>${caption}</span>` : ''}
        </article>
    `;
}

export function renderEmptyState({ title, description = '', action = '' }) {
    return `
        <div class="ui-empty-state">
            <strong>${title}</strong>
            ${description ? `<p>${description}</p>` : ''}
            ${action ? `<div class="ui-empty-action">${action}</div>` : ''}
        </div>
    `;
}
