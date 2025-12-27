/**
 * Distribution Functions for Risikoscoring Module
 * Generates and manipulates score distributions
 */

import { measureEffects } from './_constants.js';
import { distributionData, selectedMeasures, setDistributionData } from './_state.js';

/**
 * Generates a normal distribution with outliers
 * @param {number} total - Total number of items to distribute
 * @param {number} mean - Mean value of the distribution
 * @param {number} stdDev - Standard deviation
 * @returns {number[]} Array of 100 bins with distribution counts
 */
export const generateDistribution = (total, mean, stdDev) => {
    const distribution = new Array(100).fill(0);
    for (let i = 0; i < total; i++) {
        let score;
        do {
            const u1 = Math.random(), u2 = Math.random();
            const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            score = mean + z0 * stdDev;
            if (Math.random() < 0.05) score += (Math.random() - 0.5) * 20;
        } while (score < 0 || score > 100);
        distribution[Math.min(99, Math.max(0, Math.floor(score)))]++;
    }
    if (mean < 60) {
        for (let i = 20; i < 25; i++) distribution[i] = Math.floor(distribution[i] * 0.7);
        for (let i = 15; i < 20; i++) distribution[i] = Math.floor(distribution[i] * 1.1);
    }
    return distribution;
};

/**
 * Combines multiple silo distributions into one
 * @param {string[]} silos - Array of silo names to combine
 * @returns {number[]} Combined distribution array
 */
export const combineDistributions = (silos) => {
    const combined = new Array(100).fill(0);
    silos.forEach(silo => distributionData[silo]?.forEach((count, index) => { combined[index] += count; }));
    return combined;
};

/**
 * Initializes distribution data for all silo types
 */
export const initializeDistributionData = () => {
    const data = {
        'ao': generateDistribution(500, 78, 7),
        'grossmakler': generateDistribution(2000, 62, 10),
        'kleinmakler': generateDistribution(11800, 52, 12),
        'autohaus': generateDistribution(100, 35, 13)
    };
    data['makler'] = combineDistributions(['grossmakler', 'kleinmakler']);
    data['alle'] = combineDistributions(['ao', 'grossmakler', 'kleinmakler', 'autohaus']);
    setDistributionData(data);
};

/**
 * Applies improvement measures to a distribution
 * @param {number[]} originalDist - Original distribution array
 * @returns {number[]} Modified distribution after applying measures
 */
export const applyMeasuresToDistribution = (originalDist) => {
    const newDist = new Array(100).fill(0);
    originalDist.forEach((count, score) => {
        if (count === 0) return;
        const level = score >= 80 ? 'a' : score >= 60 ? 'b' : score >= 40 ? 'c' : 'd';
        let totalImprovement = selectedMeasures.reduce((sum, m) => sum + (measureEffects[m]?.[level] ?? 0), 0);
        if (score >= 80) totalImprovement *= Math.max(0.3, 1 - ((score - 80) / 20) * 0.7);
        const newBin = Math.min(99, Math.max(0, Math.floor(Math.min(95, score + totalImprovement))));
        newDist[newBin] += count;
    });
    return newDist;
};
