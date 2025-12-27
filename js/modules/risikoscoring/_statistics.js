/**
 * Statistics Functions for Risikoscoring Module
 * Estimates and calculates various metrics
 */

/**
 * Estimates Neugeschäft (new business) based on score
 * @param {number} score - Performance score
 * @returns {number} Estimated new business value
 */
export const estimateNeugeschaeft = (score) => score >= 80 ? 1500000 + Math.random() * 500000 : score >= 60 ? 400000 + Math.random() * 400000 : score >= 40 ? 200000 + Math.random() * 200000 : 50000 + Math.random() * 150000;

/**
 * Estimates Bestand (existing portfolio) based on score
 * @param {number} score - Performance score
 * @returns {number} Estimated portfolio value
 */
export const estimateBestand = (score) => score >= 80 ? 6000000 + Math.random() * 2000000 : score >= 60 ? 2000000 + Math.random() * 2000000 : score >= 40 ? 1000000 + Math.random() * 1000000 : 500000 + Math.random() * 500000;

/**
 * Estimates Storno (cancellation rate) based on score
 * @param {number} score - Performance score
 * @returns {number} Estimated cancellation rate percentage
 */
export const estimateStorno = (score) => score >= 80 ? 3 + Math.random() * 2 : score >= 60 ? 8 + Math.random() * 4 : score >= 40 ? 15 + Math.random() * 5 : 25 + Math.random() * 10;

/**
 * Estimates cross-selling ratio based on score
 * @param {number} score - Performance score
 * @returns {number} Estimated cross-selling ratio
 */
export const estimateCrossSelling = (score) => score >= 80 ? 3 + Math.random() : score >= 60 ? 2 + Math.random() * 0.8 : score >= 40 ? 1.3 + Math.random() * 0.4 : 1 + Math.random() * 0.2;

/**
 * Estimates combined ratio based on score and silo type
 * @param {number} score - Performance score
 * @param {string} siloType - Type of silo (ao, grossmakler, etc.)
 * @returns {number} Estimated combined ratio
 */
export const estimateCombinedRatio = (score, siloType) => {
    if (siloType === 'ao') return 85 + Math.random() * 10;
    if (siloType === 'grossmakler') return 100 + Math.random() * 14;
    if (siloType === 'kleinmakler') return 111 + Math.random() * 14;
    if (siloType === 'autohaus') return 128 + Math.random() * 14;
    return score >= 80 ? 85 + Math.random() * 10 : score >= 60 ? 100 + Math.random() * 15 : score >= 40 ? 115 + Math.random() * 15 : 130 + Math.random() * 20;
};

/**
 * Estimates Ertrag (profit) based on score and silo type
 * @param {number} score - Performance score
 * @param {string} siloType - Type of silo
 * @returns {number} Estimated profit value
 */
export const estimateErtrag = (score, siloType) => {
    if (siloType === 'ao') return score >= 80 ? 4500 + Math.random() * 1000 : score >= 60 ? 3500 + Math.random() * 1000 : 2500 + Math.random() * 1000;
    if (siloType === 'grossmakler') return score >= 80 ? -3000 - Math.random() * 1000 : score >= 60 ? -4500 - Math.random() * 1000 : -6000 - Math.random() * 2000;
    if (siloType === 'kleinmakler') return score >= 80 ? -3500 - Math.random() * 1000 : score >= 60 ? -5000 - Math.random() * 1000 : -6500 - Math.random() * 1500;
    if (siloType === 'autohaus') return score >= 80 ? -35000 - Math.random() * 10000 : score >= 60 ? -45000 - Math.random() * 10000 : -55000 - Math.random() * 10000;
    return -5000 - Math.random() * 1000;
};

/**
 * Calculates comprehensive statistics from a distribution
 * @param {number[]} distribution - Distribution array
 * @param {string|null} siloType - Type of silo for specific calculations
 * @returns {Object} Statistics object with various metrics
 */
export const calculateStats = (distribution, siloType = null) => {
    if (!distribution?.length) return { total: 0, average: 0, avgNeugeschaeft: 0, avgBestand: 0, avgCombinedRatio: 0, avgErtrag: 0, avgStorno: 0, avgCrossSelling: 0, levels: { a: 0, b: 0, c: 0, d: 0 } };

    let total = 0, weightedSum = 0, neuSum = 0, bestandSum = 0, crSum = 0, ertragSum = 0, stornoSum = 0, csSum = 0;
    const levels = { a: 0, b: 0, c: 0, d: 0 };

    distribution.forEach((count, bin) => {
        total += count;
        weightedSum += count * bin;
        if (bin >= 80) levels.a += count; else if (bin >= 60) levels.b += count; else if (bin >= 40) levels.c += count; else levels.d += count;
        for (let i = 0; i < count; i++) {
            neuSum += estimateNeugeschaeft(bin);
            bestandSum += estimateBestand(bin);
            crSum += estimateCombinedRatio(bin, siloType);
            ertragSum += estimateErtrag(bin, siloType);
            stornoSum += estimateStorno(bin);
            csSum += estimateCrossSelling(bin);
        }
    });

    return { total, average: total > 0 ? weightedSum / total : 0, avgNeugeschaeft: total > 0 ? neuSum / total : 0, avgBestand: total > 0 ? bestandSum / total : 0, avgCombinedRatio: total > 0 ? crSum / total : 0, avgErtrag: total > 0 ? ertragSum / total : 0, avgStorno: total > 0 ? stornoSum / total : 0, avgCrossSelling: total > 0 ? csSum / total : 0, levels };
};
