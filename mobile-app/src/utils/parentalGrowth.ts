/**
 * Parental growth & blood-type helpers (user-friendly calculations)
 * Mid-parental height (Tanner) + Mendelian ABO possibilities
 */

export type BloodType = 'A' | 'B' | 'AB' | 'O';
export type BloodTypeInput = BloodType | '';

/** Target tinggi dewasa perkiraan (cm) — rumus Tanner mid-parental */
export function midParentalHeightCm(
  motherCm: number,
  fatherCm: number,
  gender: 'male' | 'female'
): number {
  const mid =
    gender === 'male'
      ? (fatherCm + motherCm + 13) / 2
      : (fatherCm + motherCm - 13) / 2;
  return Math.round(mid * 10) / 10;
}

/** Kisaran normal ±8.5 cm sekitar target dewasa */
export function adultHeightRangeCm(target: number): { min: number; max: number } {
  return {
    min: Math.round((target - 8.5) * 10) / 10,
    max: Math.round((target + 8.5) * 10) / 10,
  };
}

/**
 * Perkiraan berat ideal kasar anak (kg) dari tinggi saat ini —
 * pendekatan BMI sehat usia dini ~15–16 (bukan diagnosis).
 */
export function estimatedHealthyWeightKg(heightCm: number): {
  low: number;
  mid: number;
  high: number;
} {
  if (!heightCm || heightCm < 40) {
    return { low: 0, mid: 0, high: 0 };
  }
  const m = heightCm / 100;
  const mid = 15.5 * m * m;
  return {
    low: Math.round(14 * m * m * 10) / 10,
    mid: Math.round(mid * 10) / 10,
    high: Math.round(17 * m * m * 10) / 10,
  };
}

/** Kemungkinan golongan darah anak dari orang tua (ABO sederhana, tanpa Rh) */
export function possibleChildBloodTypes(
  mother: BloodType,
  father: BloodType
): BloodType[] {
  const map: Record<string, BloodType[]> = {
    'O+O': ['O'],
    'O+A': ['O', 'A'],
    'A+O': ['O', 'A'],
    'O+B': ['O', 'B'],
    'B+O': ['O', 'B'],
    'O+AB': ['A', 'B'],
    'AB+O': ['A', 'B'],
    'A+A': ['O', 'A'],
    'A+B': ['O', 'A', 'B', 'AB'],
    'B+A': ['O', 'A', 'B', 'AB'],
    'A+AB': ['A', 'B', 'AB'],
    'AB+A': ['A', 'B', 'AB'],
    'B+B': ['O', 'B'],
    'B+AB': ['A', 'B', 'AB'],
    'AB+B': ['A', 'B', 'AB'],
    'AB+AB': ['A', 'B', 'AB'],
  };
  const key = `${mother}+${father}`;
  return map[key] ?? ['A', 'B', 'AB', 'O'];
}

export function formatBloodList(types: BloodType[]): string {
  return types.join(', ');
}

export interface ParentalMetricsInput {
  motherHeightCm?: number;
  fatherHeightCm?: number;
  motherWeightKg?: number;
  fatherWeightKg?: number;
  motherBlood?: BloodTypeInput;
  fatherBlood?: BloodTypeInput;
  childBlood?: BloodTypeInput;
}

export interface ParentalInsight {
  adultHeightTarget?: number;
  adultHeightRange?: { min: number; max: number };
  possibleBlood?: BloodType[];
  summary: string;
}

export function buildParentalInsight(
  gender: 'male' | 'female' | undefined,
  input: ParentalMetricsInput
): ParentalInsight | null {
  const parts: string[] = [];
  let adultHeightTarget: number | undefined;
  let adultHeightRange: { min: number; max: number } | undefined;
  let possibleBlood: BloodType[] | undefined;

  if (
    gender &&
    input.motherHeightCm &&
    input.fatherHeightCm &&
    input.motherHeightCm > 100 &&
    input.fatherHeightCm > 100
  ) {
    adultHeightTarget = midParentalHeightCm(
      input.motherHeightCm,
      input.fatherHeightCm,
      gender
    );
    adultHeightRange = adultHeightRangeCm(adultHeightTarget);
    parts.push(
      `Perkiraan tinggi dewasa: ±${adultHeightTarget} cm (kisaran ${adultHeightRange.min}–${adultHeightRange.max} cm).`
    );
  }

  if (input.motherBlood && input.fatherBlood) {
    possibleBlood = possibleChildBloodTypes(
      input.motherBlood as BloodType,
      input.fatherBlood as BloodType
    );
    parts.push(
      `Golongan darah anak yang mungkin: ${formatBloodList(possibleBlood)}.`
    );
    if (input.childBlood && !possibleBlood.includes(input.childBlood as BloodType)) {
      parts.push(
        'Catatan: golongan darah anak yang diisi di luar kombinasi tipikal orang tua — harap dicek ulang.'
      );
    }
  }

  if (parts.length === 0) return null;
  return {
    adultHeightTarget,
    adultHeightRange,
    possibleBlood,
    summary: parts.join(' '),
  };
}
