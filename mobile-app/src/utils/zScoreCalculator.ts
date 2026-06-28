/**
 * WHO Z-Score Calculator
 * Based on WHO Child Growth Standards (2006)
 * Uses LMS Method: Z = ((value/M)^L - 1) / (L*S)
 */

import { ZScore } from '../types/models';

// WHO Reference Data Structure
interface WHOReference {
  L: number; // Lambda (power in Box-Cox transformation)
  M: number; // Mu (median)
  S: number; // Sigma (coefficient of variation)
}

// Simplified WHO reference data (should be loaded from JSON file in production)
// This is sample data - full dataset contains values for each month/day
const WHO_WEIGHT_FOR_AGE_BOYS: { [month: number]: WHOReference } = {
  0: { L: 0.3487, M: 3.3464, S: 0.14602 },
  1: { L: 0.3487, M: 4.4709, S: 0.13395 },
  3: { L: 0.3487, M: 6.3762, S: 0.11727 },
  6: { L: 0.3487, M: 7.9340, S: 0.11316 },
  12: { L: 0.3487, M: 9.6479, S: 0.11727 },
  24: { L: 0.3487, M: 12.2064, S: 0.11568 },
  36: { L: 0.3487, M: 14.3248, S: 0.11053 },
  48: { L: 0.3487, M: 16.3095, S: 0.10468 },
  60: { L: 0.3487, M: 18.2953, S: 0.10014 },
};

const WHO_HEIGHT_FOR_AGE_BOYS: { [month: number]: WHOReference } = {
  0: { L: 1, M: 49.8842, S: 0.03795 },
  1: { L: 1, M: 54.7244, S: 0.03557 },
  3: { L: 1, M: 61.4292, S: 0.03486 },
  6: { L: 1, M: 67.6236, S: 0.03497 },
  12: { L: 1, M: 75.7488, S: 0.03600 },
  24: { L: 1, M: 87.0761, S: 0.03720 },
  36: { L: 1, M: 96.1086, S: 0.03788 },
  48: { L: 1, M: 103.3174, S: 0.03836 },
  60: { L: 1, M: 109.9337, S: 0.03883 },
};

// Similar structures for girls (simplified)
const WHO_WEIGHT_FOR_AGE_GIRLS: { [month: number]: WHOReference } = {
  0: { L: 0.3809, M: 3.2322, S: 0.14171 },
  1: { L: 0.3809, M: 4.1873, S: 0.13724 },
  3: { L: 0.3809, M: 5.8458, S: 0.12619 },
  6: { L: 0.3809, M: 7.2115, S: 0.12402 },
  12: { L: 0.3809, M: 8.9481, S: 0.12274 },
  24: { L: 0.3809, M: 11.4858, S: 0.11774 },
  36: { L: 0.3809, M: 13.8947, S: 0.11402 },
  48: { L: 0.3809, M: 16.0901, S: 0.10955 },
  60: { L: 0.3809, M: 18.2668, S: 0.10562 },
};

const WHO_HEIGHT_FOR_AGE_GIRLS: { [month: number]: WHOReference } = {
  0: { L: 1, M: 49.1477, S: 0.03790 },
  1: { L: 1, M: 53.6872, S: 0.03498 },
  3: { L: 1, M: 59.8029, S: 0.03402 },
  6: { L: 1, M: 65.7311, S: 0.03443 },
  12: { L: 1, M: 74.0248, S: 0.03564 },
  24: { L: 1, M: 85.7311, S: 0.03684 },
  36: { L: 1, M: 95.1379, S: 0.03750 },
  48: { L: 1, M: 101.5384, S: 0.03797 },
  60: { L: 1, M: 108.4454, S: 0.03844 },
};

/**
 * Calculate Z-score using WHO LMS method
 */
function calculateZScore(
  value: number,
  reference: WHOReference
): number {
  const { L, M, S } = reference;
  
  if (L === 0 || L === 1) {
    // Simplified calculation when L = 1
    return (value - M) / (M * S);
  }
  
  // Full LMS formula
  return (Math.pow(value / M, L) - 1) / (L * S);
}

/**
 * Interpolate reference values for exact age
 */
function interpolateReference(
  ageMonths: number,
  referenceData: { [month: number]: WHOReference }
): WHOReference {
  const months = Object.keys(referenceData).map(Number).sort((a, b) => a - b);
  
  // Find surrounding months
  let lowerMonth = months[0];
  let upperMonth = months[months.length - 1];
  
  for (let i = 0; i < months.length - 1; i++) {
    if (ageMonths >= months[i] && ageMonths <= months[i + 1]) {
      lowerMonth = months[i];
      upperMonth = months[i + 1];
      break;
    }
  }
  
  // If exact match
  if (referenceData[ageMonths]) {
    return referenceData[ageMonths];
  }
  
  // Linear interpolation
  const lower = referenceData[lowerMonth];
  const upper = referenceData[upperMonth];
  const ratio = (ageMonths - lowerMonth) / (upperMonth - lowerMonth);
  
  return {
    L: lower.L + (upper.L - lower.L) * ratio,
    M: lower.M + (upper.M - lower.M) * ratio,
    S: lower.S + (upper.S - lower.S) * ratio,
  };
}

/**
 * Get percentile from Z-score
 */
function zScoreToPercentile(zscore: number): number {
  // Approximation using cumulative distribution function
  const t = 1 / (1 + 0.2316419 * Math.abs(zscore));
  const d = 0.3989423 * Math.exp(-zscore * zscore / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  
  return zscore > 0 ? (1 - p) * 100 : p * 100;
}

/**
 * Categorize Z-score
 */
function categorizeZScore(zscore: number): ZScore['category'] {
  if (zscore < -3) return 'severely_low';
  if (zscore < -2) return 'low';
  if (zscore > 3) return 'severely_high';
  if (zscore > 2) return 'high';
  return 'normal';
}

/**
 * Calculate Weight-for-Age Z-score
 */
export function calculateWeightForAge(
  weightKg: number,
  ageMonths: number,
  gender: 'male' | 'female'
): ZScore {
  const referenceData = gender === 'male' 
    ? WHO_WEIGHT_FOR_AGE_BOYS 
    : WHO_WEIGHT_FOR_AGE_GIRLS;
    
  const reference = interpolateReference(ageMonths, referenceData);
  const zscore = calculateZScore(weightKg, reference);
  const percentile = zScoreToPercentile(zscore);
  const category = categorizeZScore(zscore);
  
  return {
    value: weightKg,
    zscore: Math.round(zscore * 100) / 100,
    percentile: Math.round(percentile * 10) / 10,
    category,
  };
}

/**
 * Calculate Height-for-Age Z-score
 */
export function calculateHeightForAge(
  heightCm: number,
  ageMonths: number,
  gender: 'male' | 'female'
): ZScore {
  const referenceData = gender === 'male' 
    ? WHO_HEIGHT_FOR_AGE_BOYS 
    : WHO_HEIGHT_FOR_AGE_GIRLS;
    
  const reference = interpolateReference(ageMonths, referenceData);
  const zscore = calculateZScore(heightCm, reference);
  const percentile = zScoreToPercentile(zscore);
  const category = categorizeZScore(zscore);
  
  return {
    value: heightCm,
    zscore: Math.round(zscore * 100) / 100,
    percentile: Math.round(percentile * 10) / 10,
    category,
  };
}

/**
 * Calculate Weight-for-Height Z-score
 * Note: This is simplified. Full implementation requires height-specific tables
 */
export function calculateWeightForHeight(
  weightKg: number,
  heightCm: number,
  gender: 'male' | 'female'
): ZScore {
  // Simplified calculation using BMI approximation
  // In production, use proper WHO weight-for-height tables
  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  
  // Approximate reference (this should come from WHO tables)
  const reference: WHOReference = {
    L: 0,
    M: gender === 'male' ? 16.5 : 16.0,
    S: 0.10,
  };
  
  const zscore = calculateZScore(bmi, reference);
  const percentile = zScoreToPercentile(zscore);
  const category = categorizeZScore(zscore);
  
  return {
    value: weightKg,
    zscore: Math.round(zscore * 100) / 100,
    percentile: Math.round(percentile * 10) / 10,
    category,
  };
}

/**
 * Calculate age in months from date of birth
 */
export function calculateAgeInMonths(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  
  const yearsDiff = now.getFullYear() - dob.getFullYear();
  const monthsDiff = now.getMonth() - dob.getMonth();
  const daysDiff = now.getDate() - dob.getDate();
  
  let totalMonths = yearsDiff * 12 + monthsDiff;
  
  // Adjust if day hasn't occurred yet this month
  if (daysDiff < 0) {
    totalMonths -= 1;
  }
  
  return totalMonths;
}

/**
 * Determine stunting risk based on height-for-age z-score
 */
export function determineStuntingRisk(heightForAgeZScore: number): {
  level: 'normal' | 'at_risk' | 'stunted' | 'severely_stunted';
  description: string;
} {
  if (heightForAgeZScore >= -1) {
    return {
      level: 'normal',
      description: 'Pertumbuhan normal',
    };
  } else if (heightForAgeZScore >= -2) {
    return {
      level: 'at_risk',
      description: 'Berisiko stunting (perlu monitoring ketat)',
    };
  } else if (heightForAgeZScore >= -3) {
    return {
      level: 'stunted',
      description: 'Stunting (memerlukan intervensi)',
    };
  } else {
    return {
      level: 'severely_stunted',
      description: 'Stunting berat (memerlukan intervensi segera)',
    };
  }
}

export default {
  calculateWeightForAge,
  calculateHeightForAge,
  calculateWeightForHeight,
  calculateAgeInMonths,
  determineStuntingRisk,
};
