/**
 * Provisionssimulation UI Functions
 * DOM updates and user interface management
 */

import { COMMISSION_RATES, SEGMENT_LABELS, REVERS_TIERS } from './_constants.js';
import { provisionState } from './_state.js';
import { formatCurrency, updateElement, getSegmentIcon } from './_helpers.js';
import { getTotalProduction, getCurrentReversTier, calculateCompanyCosts } from './_calculations.js';

/**
 * Update slider displays for all segments
 */
export const updateProvisionSliders = () => {
    Object.keys(provisionState.segments).forEach(segment => {
        const data = provisionState.segments[segment];
        updateElement(`${segment}NeugeschaeftValue`, formatCurrency(data.neugeschaeft));
        updateElement(`${segment}BestandValue`, formatCurrency(data.bestand));
        updateElement(`${segment}StornoValue`, `${data.storno}%`);
    });
};

/**
 * Update KPI displays with calculation results
 * @param {Object} results - Calculation results from calculateProvisions
 */
export const updateProvisionKPIs = (results) => {
    updateElement('provAlphaTotal', formatCurrency(results.alpha.total));
    updateElement('provBetaTotal', formatCurrency(results.beta.total));

    const delta = results.delta.total;
    updateElement('provDeltaTotal', (delta >= 0 ? '+' : '') + formatCurrency(delta));

    const deltaEl = document.getElementById('provDeltaIndicator');
    if (deltaEl) {
        deltaEl.className = 'provision-kpi-delta ' + (delta >= 0 ? 'positive' : 'negative');
        deltaEl.innerHTML = delta >= 0
            ? '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg> Mehrertrag'
            : '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg> Minderertrag';
    }

    if (results.alpha.total > 0) {
        const percent = ((results.delta.total / results.alpha.total) * 100).toFixed(1);
        updateElement('provDeltaPercent', (percent >= 0 ? '+' : '') + percent + '%');
    }
};

/**
 * Update the provision comparison table
 * @param {Object} results - Calculation results from calculateProvisions
 */
export const updateProvisionTable = (results) => {
    const tbody = document.getElementById('provisionRatesBody');
    if (!tbody) return;

    let html = '';
    Object.keys(provisionState.segments).forEach(segment => {
        const label = SEGMENT_LABELS[segment];
        const alphaRates = COMMISSION_RATES.alpha[segment];
        const betaRates = COMMISSION_RATES.beta[segment];
        const alphaResult = results.alpha[segment];
        const betaResult = results.beta[segment];
        const delta = betaResult.total - alphaResult.total;

        html += `
            <tr>
                <td>
                    <div class="segment-cell">
                        <div class="segment-icon ${segment}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                ${getSegmentIcon(segment)}
                            </svg>
                        </div>
                        ${label.name}
                    </div>
                </td>
                <td class="rate-cell alpha">${alphaRates.ap.toFixed(1)}% AP / ${alphaRates.bp.toFixed(1)}% BP</td>
                <td class="rate-cell beta">${betaRates.ap.toFixed(1)}% AP / ${betaRates.bp.toFixed(1)}% BP</td>
                <td class="rate-cell alpha">${formatCurrency(alphaResult.total)}</td>
                <td class="rate-cell beta">${formatCurrency(betaResult.total)}</td>
                <td class="delta-cell ${delta >= 0 ? 'positive' : 'negative'}">
                    ${delta >= 0 ? '+' : ''}${formatCurrency(delta)}
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = html;
};

/**
 * Update Revers tier display and progress indicator
 */
export const updateReversTier = () => {
    const totalProduction = getTotalProduction();
    const currentTier = getCurrentReversTier();
    const tierIndex = REVERS_TIERS.indexOf(currentTier);

    document.querySelectorAll('.revers-step').forEach((step, index) => {
        step.classList.remove('active', 'current');
        if (index <= tierIndex) step.classList.add('active');
        if (index === tierIndex) step.classList.add('current');
    });

    updateElement('reversTierInfo', `${currentTier.label} (${(currentTier.factor * 100).toFixed(0)}%)`);
    updateElement('totalProductionValue', formatCurrency(totalProduction));
};

/**
 * Update company cost displays
 */
export const updateCompanyCostDisplays = () => {
    const costs = calculateCompanyCosts();

    updateElement('companyAlphaCost', formatCurrency(costs.alpha.total));
    updateElement('companyBetaCost', formatCurrency(costs.beta.total));
    updateElement('companyCostDelta', (costs.delta >= 0 ? '+' : '') + formatCurrency(costs.delta));
    updateElement('companyCostDeltaLabel', costs.delta >= 0 ? 'Mehrkosten/Jahr' : 'Einsparung/Jahr');
    updateElement('companyMarginEffect', (costs.marginEffect >= 0 ? '+' : '') + costs.marginEffect + '%');

    updateElement('companyAlphaAP', formatCurrency(costs.alpha.ap));
    updateElement('companyBetaAP', formatCurrency(costs.beta.ap));
    updateElement('companyDeltaAP', formatCurrency(costs.beta.ap - costs.alpha.ap));

    updateElement('companyAlphaBP', formatCurrency(costs.alpha.bp));
    updateElement('companyBetaBP', formatCurrency(costs.beta.bp));
    updateElement('companyDeltaBP', formatCurrency(costs.beta.bp - costs.alpha.bp));

    updateElement('companyAlphaBonus', formatCurrency(costs.alpha.bonus));
    updateElement('companyBetaBonus', formatCurrency(costs.beta.bonus));
    updateElement('companyDeltaBonus', formatCurrency(costs.beta.bonus - costs.alpha.bonus));

    updateElement('companyAlphaTotal', '<strong>' + formatCurrency(costs.alpha.total) + '</strong>');
    updateElement('companyBetaTotal', '<strong>' + formatCurrency(costs.beta.total) + '</strong>');
    updateElement('companyTotalDelta', '<strong>' + formatCurrency(costs.delta) + '</strong>');

    updateElement('breakEvenGrowth', '+' + costs.breakEvenGrowth + '%');
    updateElement('breakEvenPremium', formatCurrency(costs.breakEvenPremium));
    updateElement('paybackPeriod', costs.paybackPeriod + ' Monate');

    return costs;
};
