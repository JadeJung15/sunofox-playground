export function renderSectionHead({ kicker, title, meta = '' }) {
    return `
        <div class="minimal-section-head ui-section-head">
            <div>
                <span class="minimal-kicker">${kicker}</span>
                <h2>${title}</h2>
            </div>
            ${meta ? `<span class="minimal-text-meta">${meta}</span>` : ''}
        </div>
    `;
}

export function renderEmptyState({ title, description, actionLabel = '', actionHash = '' }) {
    const actionMarkup = actionLabel && actionHash
        ? `<button class="btn-secondary ui-empty-action" onclick="location.hash='${actionHash}'">${actionLabel}</button>`
        : '';

    return `
        <div class="ui-empty-state">
            <strong>${title}</strong>
            <span>${description}</span>
            ${actionMarkup}
        </div>
    `;
}
