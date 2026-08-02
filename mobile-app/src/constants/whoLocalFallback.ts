/**
 * WHO LMS local fallback tables (offline / circuit breaker).
 * WFA & HFA: keyed by age months (sparse + linear interpolate).
 * WFH: keyed by length/height cm — CDC/WHO Weight-for-Length files.
 */

export type WhoGender = 'male' | 'female';
export type WhoIndicatorCode = 'wfa' | 'hfa' | 'wfh';

export interface WhoLmsPoint {
  /** Box-Cox power (skewness) */
  L: number;
  /** Median */
  M: number;
  /** Coefficient of variation */
  S: number;
}

export type WhoLmsTable = Readonly<Record<number, WhoLmsPoint>>;

export const WHO_WFA_BOYS: WhoLmsTable = {
  0: { L: 0.3487, M: 3.3464, S: 0.14602 },
  1: { L: 0.3487, M: 4.4709, S: 0.13395 },
  3: { L: 0.3487, M: 6.3762, S: 0.11727 },
  6: { L: 0.3487, M: 7.934, S: 0.11316 },
  12: { L: 0.3487, M: 9.6479, S: 0.11727 },
  24: { L: 0.3487, M: 12.2064, S: 0.11568 },
  36: { L: 0.3487, M: 14.3248, S: 0.11053 },
  48: { L: 0.3487, M: 16.3095, S: 0.10468 },
  60: { L: 0.3487, M: 18.2953, S: 0.10014 },
};

export const WHO_WFA_GIRLS: WhoLmsTable = {
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

export const WHO_HFA_BOYS: WhoLmsTable = {
  0: { L: 1, M: 49.8842, S: 0.03795 },
  1: { L: 1, M: 54.7244, S: 0.03557 },
  3: { L: 1, M: 61.4292, S: 0.03486 },
  6: { L: 1, M: 67.6236, S: 0.03497 },
  12: { L: 1, M: 75.7488, S: 0.036 },
  24: { L: 1, M: 87.0761, S: 0.0372 },
  36: { L: 1, M: 96.1086, S: 0.03788 },
  48: { L: 1, M: 103.3174, S: 0.03836 },
  60: { L: 1, M: 109.9337, S: 0.03883 },
};

export const WHO_HFA_GIRLS: WhoLmsTable = {
  0: { L: 1, M: 49.1477, S: 0.0379 },
  1: { L: 1, M: 53.6872, S: 0.03498 },
  3: { L: 1, M: 59.8029, S: 0.03402 },
  6: { L: 1, M: 65.7311, S: 0.03443 },
  12: { L: 1, M: 74.0248, S: 0.03564 },
  24: { L: 1, M: 85.7311, S: 0.03684 },
  36: { L: 1, M: 95.1379, S: 0.0375 },
  48: { L: 1, M: 101.5384, S: 0.03797 },
  60: { L: 1, M: 108.4454, S: 0.03844 },
};

/** CDC/WHO Weight-for-Length LMS — keyed by cm */
export const WHO_WFH_BOYS: WhoLmsTable = {
  45: { L: -0.3521, M: 2.441, S: 0.09182 },
  46: { L: -0.3521, M: 2.6077, S: 0.09124 },
  48: { L: -0.3521, M: 2.948, S: 0.09007 },
  50: { L: -0.3521, M: 3.3278, S: 0.0889 },
  52: { L: -0.3521, M: 3.762, S: 0.08771 },
  54: { L: -0.3521, M: 4.2693, S: 0.08651 },
  56: { L: -0.3521, M: 4.8338, S: 0.08535 },
  58: { L: -0.3521, M: 5.418, S: 0.0843 },
  60: { L: -0.3521, M: 5.9907, S: 0.08342 },
  62: { L: -0.3521, M: 6.5251, S: 0.08279 },
  64: { L: -0.3521, M: 7.0255, S: 0.08236 },
  66: { L: -0.3521, M: 7.5034, S: 0.08215 },
  68: { L: -0.3521, M: 7.9674, S: 0.08214 },
  70: { L: -0.3521, M: 8.4227, S: 0.08229 },
  72: { L: -0.3521, M: 8.8697, S: 0.08254 },
  74: { L: -0.3521, M: 9.2974, S: 0.08283 },
  76: { L: -0.3521, M: 9.7033, S: 0.08307 },
  78: { L: -0.3521, M: 10.0827, S: 0.08318 },
  80: { L: -0.3521, M: 10.4475, S: 0.08308 },
  82: { L: -0.3521, M: 10.8321, S: 0.08273 },
  84: { L: -0.3521, M: 11.2651, S: 0.08215 },
  86: { L: -0.3521, M: 11.7444, S: 0.08145 },
  88: { L: -0.3521, M: 12.2382, S: 0.08082 },
  90: { L: -0.3521, M: 12.7209, S: 0.08041 },
  92: { L: -0.3521, M: 13.191, S: 0.08025 },
  94: { L: -0.3521, M: 13.6572, S: 0.08034 },
  96: { L: -0.3521, M: 14.1325, S: 0.08067 },
  98: { L: -0.3521, M: 14.6316, S: 0.08122 },
  100: { L: -0.3521, M: 15.1637, S: 0.08198 },
  102: { L: -0.3521, M: 15.7276, S: 0.08292 },
  104: { L: -0.3521, M: 16.3204, S: 0.08397 },
  106: { L: -0.3521, M: 16.9401, S: 0.0851 },
  108: { L: -0.3521, M: 17.5885, S: 0.08629 },
  110: { L: -0.3521, M: 18.2689, S: 0.08755 },
};

export const WHO_WFH_GIRLS: WhoLmsTable = {
  45: { L: -0.3833, M: 2.4607, S: 0.09029 },
  46: { L: -0.3833, M: 2.6306, S: 0.09037 },
  48: { L: -0.3833, M: 2.9741, S: 0.09052 },
  50: { L: -0.3833, M: 3.3518, S: 0.09068 },
  52: { L: -0.3833, M: 3.7911, S: 0.09085 },
  54: { L: -0.3833, M: 4.2875, S: 0.09102 },
  56: { L: -0.3833, M: 4.8162, S: 0.09118 },
  58: { L: -0.3833, M: 5.3507, S: 0.0913 },
  60: { L: -0.3833, M: 5.8742, S: 0.09136 },
  62: { L: -0.3833, M: 6.3738, S: 0.09135 },
  64: { L: -0.3833, M: 6.8501, S: 0.09126 },
  66: { L: -0.3833, M: 7.3076, S: 0.0911 },
  68: { L: -0.3833, M: 7.7448, S: 0.0909 },
  70: { L: -0.3833, M: 8.163, S: 0.09068 },
  72: { L: -0.3833, M: 8.5679, S: 0.09043 },
  74: { L: -0.3833, M: 8.9601, S: 0.09018 },
  76: { L: -0.3833, M: 9.3337, S: 0.08992 },
  78: { L: -0.3833, M: 9.7015, S: 0.08965 },
  80: { L: -0.3833, M: 10.0891, S: 0.0894 },
  82: { L: -0.3833, M: 10.514, S: 0.08918 },
  84: { L: -0.3833, M: 10.9767, S: 0.08903 },
  86: { L: -0.3833, M: 11.4684, S: 0.08895 },
  88: { L: -0.3833, M: 11.972, S: 0.08896 },
  90: { L: -0.3833, M: 12.4723, S: 0.08906 },
  92: { L: -0.3833, M: 12.9681, S: 0.08923 },
  94: { L: -0.3833, M: 13.4643, S: 0.08948 },
  96: { L: -0.3833, M: 13.9676, S: 0.08981 },
  98: { L: -0.3833, M: 14.4848, S: 0.09021 },
  100: { L: -0.3833, M: 15.0267, S: 0.09069 },
  102: { L: -0.3833, M: 15.6046, S: 0.09125 },
  104: { L: -0.3833, M: 16.2229, S: 0.09186 },
  106: { L: -0.3833, M: 16.8814, S: 0.09254 },
  108: { L: -0.3833, M: 17.5839, S: 0.09326 },
  110: { L: -0.3833, M: 18.3324, S: 0.09401 },
};

function pickTable(
  indicator: WhoIndicatorCode,
  gender: WhoGender
): WhoLmsTable {
  if (indicator === 'wfa') {
    return gender === 'male' ? WHO_WFA_BOYS : WHO_WFA_GIRLS;
  }
  if (indicator === 'hfa') {
    return gender === 'male' ? WHO_HFA_BOYS : WHO_HFA_GIRLS;
  }
  return gender === 'male' ? WHO_WFH_BOYS : WHO_WFH_GIRLS;
}

/** Linear interpolate L/M/S between nearest table keys */
export function interpolateLms(
  key: number,
  table: WhoLmsTable
): WhoLmsPoint | null {
  const keys = Object.keys(table)
    .map(Number)
    .sort((a, b) => a - b);
  if (keys.length === 0) return null;

  if (table[key]) return table[key];

  let lower = keys[0];
  let upper = keys[keys.length - 1];

  if (key <= lower) return table[lower];
  if (key >= upper) return table[upper];

  for (let i = 0; i < keys.length - 1; i += 1) {
    if (key >= keys[i] && key <= keys[i + 1]) {
      lower = keys[i];
      upper = keys[i + 1];
      break;
    }
  }

  const a = table[lower];
  const b = table[upper];
  if (!a || !b) return null;
  if (lower === upper) return a;

  const t = (key - lower) / (upper - lower);
  return {
    L: a.L + (b.L - a.L) * t,
    M: a.M + (b.M - a.M) * t,
    S: a.S + (b.S - a.S) * t,
  };
}

/**
 * Resolve LMS from local tables.
 * @param lookupKey age_months (wfa/hfa) or length_cm (wfh)
 */
export function lookupLocalWhoLms(
  indicator: WhoIndicatorCode,
  gender: WhoGender,
  lookupKey: number
): WhoLmsPoint | null {
  const table = pickTable(indicator, gender);
  const clamped =
    indicator === 'wfh'
      ? Math.max(45, Math.min(110, lookupKey))
      : Math.max(0, Math.min(60, lookupKey));
  return interpolateLms(clamped, table);
}
