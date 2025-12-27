/**
 * Provisionssimulation Calculation Functions
 * Core business logic for commission calculations
 */

import { COMMISSION_RATES, REVERS_TIERS } from './_constants.js';
import { provisionState } from './_state.js';
import { updateProvisionKPIs, updateProvisionTable } from './_ui.js';

/**
 * Calculate total production across all segments
 * @returns {number} Total production value
 */
export const getTotalProduction = () =>
    Object.values(provisionState.segments).reduce((sum, seg) => sum + seg.neugeschaeft + seg.bestand, 0);

/**
 * Get the current Revers tier based on total production
 * @returns {Object} Current tier object with min, max, factor, and label
 */
export const getCurrentReversTier = () => {
    const totalProduction = getTotalProduction();
    return REVERS_TIERS.find(tier => totalProduction >= tier.min && totalProduction < tier.max)
        ?? REVERS_TIERS[REVERS_TIERS.length - 1];
};

/**
 * Calculate provisions for both Alpha and Beta models
 * @returns {Object} Calculation results including totals and deltas
 */
export const calculateProvisions = () => {
    const tier = getCurrentReversTier();
    const results = { alpha: {}, beta: {} };

    ['alpha', 'beta'].forEach(model => {
        let totalAP = 0;
        let totalBP = 0;

        Object.keys(provisionState.segments).forEach(segment => {
            const segData = provisionState.segments[segment];
            const rates = COMMISSION_RATES[model][segment];

            const ap = (segData.neugeschaeft * rates.ap / 100) * tier.factor;
            const effectiveBestand = segData.bestand * (1 - segData.storno / 100);
            const bp = (effectiveBestand * rates.bp / 100) * provisionState.years;

            totalAP += ap;
            totalBP += bp;
            results[model][segment] = { ap, bp, total: ap + bp };
        });

        results[model].totalAP = totalAP;
        results[model].totalBP = totalBP;
        results[model].total = totalAP + totalBP;
    });

    results.delta = {
        totalAP: results.beta.totalAP - results.alpha.totalAP,
        totalBP: results.beta.totalBP - results.alpha.totalBP,
        total: results.beta.total - results.alpha.total
    };

    updateProvisionKPIs(results);
    updateProvisionTable(results);
    return results;
};

/**
 * Calculate company-level costs for both models
 * @returns {Object} Company cost analysis
 */
export const calculateCompanyCosts = () => {
    const agentCount = parseInt(document.getElementById('companyAgentCount')?.value ?? 150);
    const avgProduction = parseInt(document.getElementById('companyAvgProduction')?.value ?? 800000);
    const migrationRate = parseInt(document.getElementById('companyMigrationRate')?.value ?? 30) / 100;

    const alphaRates = { ap: 0.018, bp: 0.004, bonus: 0.002 };
    const betaRates = { ap: 0.014, bp: 0.008, bonus: 0.003 };

    const totalProduction = agentCount * avgProduction;

    const alphaAP = totalProduction * alphaRates.ap * 0.4;
    const alphaBP = totalProduction * alphaRates.bp * 0.6 * 3;
    const alphaBonus = totalProduction * alphaRates.bonus;
    const alphaTotal = alphaAP + alphaBP + alphaBonus;

    const betaAgents = agentCount * migrationRate;
    const betaProduction = betaAgents * avgProduction;
    const remainingAlphaProduction = totalProduction - betaProduction;

    const betaAP = betaProduction * betaRates.ap * 0.4;
    const betaBP = betaProduction * betaRates.bp * 0.6 * 3;
    const betaBonus = betaProduction * betaRates.bonus;
    const remainingAlphaAP = remainingAlphaProduction * alphaRates.ap * 0.4;
    const remainingAlphaBP = remainingAlphaProduction * alphaRates.bp * 0.6 * 3;
    const remainingAlphaBonus = remainingAlphaProduction * alphaRates.bonus;

    const betaTotalAP = betaAP + remainingAlphaAP;
    const betaTotalBP = betaBP + remainingAlphaBP;
    const betaTotalBonus = betaBonus + remainingAlphaBonus;
    const implementationCost = 250000;
    const betaTotal = betaTotalAP + betaTotalBP + betaTotalBonus + implementationCost;

    const delta = betaTotal - alphaTotal;

    return {
        agentCount,
        avgProduction,
        migrationRate,
        totalProduction,
        alpha: { ap: alphaAP, bp: alphaBP, bonus: alphaBonus, total: alphaTotal },
        beta: { ap: betaTotalAP, bp: betaTotalBP, bonus: betaTotalBonus, total: betaTotal },
        implementationCost,
        delta,
        marginEffect: ((delta / totalProduction) * 100).toFixed(2),
        breakEvenGrowth: Math.max(0, (delta / totalProduction) * 100 / 0.02).toFixed(0),
        breakEvenPremium: delta / 0.05,
        paybackPeriod: Math.ceil(implementationCost / (Math.abs(delta) / 12))
    };
};
