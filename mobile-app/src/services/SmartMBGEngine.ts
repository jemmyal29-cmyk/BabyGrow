/**
 * Smart MBG (Makan Bergizi Gratis) Engine
 * Decision Tree Logic based on Stunting Risk
 */

import { z } from 'zod';

// ==================== TYPES ====================

export type StuntingRiskLevel = 'normal' | 'at_risk' | 'stunted' | 'severely_stunted';

export interface ChildNutritionProfile {
  childId: string;
  ageMonths: number;
  gender: 'male' | 'female';
  heightForAgeZScore: number;
  weightForAgeZScore: number;
  weightForHeightZScore: number;
  riskLevel: StuntingRiskLevel;
}

export interface MBGRecipe {
  id: string;
  title: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ageRange: [number, number]; // [minMonths, maxMonths]
  protein: number; // grams
  calories: number;
  ingredients: string[];
  instructions: string[];
  isHighProtein: boolean;
  isMBGEligible: boolean;
  priority: number; // Higher = more recommended for stunting
}

// ==================== VALIDATION ====================

export const ChildNutritionSchema = z.object({
  childId: z.string(),
  ageMonths: z.number().min(0).max(60),
  gender: z.enum(['male', 'female']),
  heightForAgeZScore: z.number().min(-5).max(5),
  weightForAgeZScore: z.number().min(-5).max(5),
  weightForHeightZScore: z.number().min(-5).max(5),
  riskLevel: z.enum(['normal', 'at_risk', 'stunted', 'severely_stunted']),
});

// ==================== DECISION TREE ====================

export class SmartMBGEngine {
  private recipes: MBGRecipe[] = [];

  constructor() {
    this.initializeRecipes();
  }

  /**
   * Main Decision Tree Logic
   * Based on Jemi's Stunting Research
   */
  getRecommendedRecipes(profile: ChildNutritionProfile): MBGRecipe[] {
    // Validate input with default childId if missing
    const validated = ChildNutritionSchema.parse({
      ...profile,
      childId: profile.childId || 'unknown',
    }) as ChildNutritionProfile;

    // Decision Tree Branches
    if (validated.riskLevel === 'severely_stunted') {
      return this.getSevereStuntingProtocol(validated);
    } else if (validated.riskLevel === 'stunted') {
      return this.getStuntingProtocol(validated);
    } else if (validated.riskLevel === 'at_risk') {
      return this.getAtRiskProtocol(validated);
    } else {
      return this.getNormalProtocol(validated);
    }
  }

  /**
   * Severely Stunted: Intensive Nutrition Protocol
   * Priority: High Protein Animal-based Foods
   */
  private getSevereStuntingProtocol(profile: ChildNutritionProfile): MBGRecipe[] {
    return this.recipes
      .filter(recipe => 
        recipe.isMBGEligible &&
        recipe.isHighProtein &&
        recipe.protein >= 15 && // At least 15g protein
        this.isAgeAppropriate(recipe, profile.ageMonths)
      )
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10);
  }

  /**
   * Stunted: Enhanced Nutrition Protocol
   * Focus: High protein + diverse nutrients
   */
  private getStuntingProtocol(profile: ChildNutritionProfile): MBGRecipe[] {
    return this.recipes
      .filter(recipe =>
        recipe.isMBGEligible &&
        recipe.protein >= 10 &&
        this.isAgeAppropriate(recipe, profile.ageMonths)
      )
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 12);
  }

  /**
   * At Risk: Prevention Protocol
   * Focus: Balanced nutrition with protein boost
   */
  private getAtRiskProtocol(profile: ChildNutritionProfile): MBGRecipe[] {
    return this.recipes
      .filter(recipe =>
        recipe.isMBGEligible &&
        recipe.protein >= 8 &&
        this.isAgeAppropriate(recipe, profile.ageMonths)
      )
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 15);
  }

  /**
   * Normal: Maintenance Protocol
   * Focus: Balanced diet variety
   */
  private getNormalProtocol(profile: ChildNutritionProfile): MBGRecipe[] {
    return this.recipes
      .filter(recipe => this.isAgeAppropriate(recipe, profile.ageMonths))
      .slice(0, 20);
  }

  /**
   * Check if recipe is age-appropriate
   */
  private isAgeAppropriate(recipe: MBGRecipe, ageMonths: number): boolean {
    return ageMonths >= recipe.ageRange[0] && ageMonths <= recipe.ageRange[1];
  }

  /**
   * Get weekly meal plan
   */
  getWeeklyMealPlan(profile: ChildNutritionProfile): {
    day: number;
    meals: { breakfast: MBGRecipe; lunch: MBGRecipe; dinner: MBGRecipe; snack: MBGRecipe };
  }[] {
    const recipes = this.getRecommendedRecipes(profile);
    const breakfast = recipes.filter(r => r.category === 'breakfast');
    const lunch = recipes.filter(r => r.category === 'lunch');
    const dinner = recipes.filter(r => r.category === 'dinner');
    const snack = recipes.filter(r => r.category === 'snack');

    const plan = [];
    for (let day = 1; day <= 7; day++) {
      plan.push({
        day,
        meals: {
          breakfast: breakfast[day % breakfast.length],
          lunch: lunch[day % lunch.length],
          dinner: dinner[day % dinner.length],
          snack: snack[day % snack.length],
        },
      });
    }

    return plan;
  }

  /**
   * Initialize MBG Recipe Database
   * TODO: Load from backend API
   */
  private initializeRecipes() {
    this.recipes = [
      {
        id: 'mbg_001',
        title: 'Bubur Kacang Hijau + Telur Rebus',
        category: 'breakfast',
        ageRange: [6, 60],
        protein: 18,
        calories: 320,
        ingredients: [
          'Kacang hijau 50g',
          'Telur ayam 1 butir',
          'Santan 100ml',
          'Gula merah 1 sdm',
        ],
        instructions: [
          'Rebus kacang hijau hingga empuk',
          'Rebus telur, kupas, haluskan',
          'Campurkan telur ke bubur',
          'Tambahkan santan dan gula',
        ],
        isHighProtein: true,
        isMBGEligible: true,
        priority: 10,
      },
      {
        id: 'mbg_002',
        title: 'Sop Ayam Sayuran Lengkap',
        category: 'lunch',
        ageRange: [8, 60],
        protein: 22,
        calories: 380,
        ingredients: [
          'Daging ayam 100g',
          'Wortel 50g',
          'Kentang 50g',
          'Brokoli 30g',
          'Kaldu ayam 500ml',
        ],
        instructions: [
          'Rebus ayam hingga empuk',
          'Potong sayuran kecil-kecil',
          'Masak semua bahan dalam kaldu',
          'Haluskan sesuai usia anak',
        ],
        isHighProtein: true,
        isMBGEligible: true,
        priority: 10,
      },
      {
        id: 'mbg_003',
        title: 'Nasi Tim Ikan Salmon',
        category: 'dinner',
        ageRange: [8, 60],
        protein: 20,
        calories: 350,
        ingredients: [
          'Ikan salmon 80g',
          'Nasi putih 100g',
          'Bayam 30g',
          'Tomat 1 buah',
        ],
        instructions: [
          'Kukus ikan salmon',
          'Tim nasi dengan sayuran',
          'Campurkan ikan ke nasi tim',
          'Haluskan jika perlu',
        ],
        isHighProtein: true,
        isMBGEligible: true,
        priority: 9,
      },
      {
        id: 'mbg_004',
        title: 'Puding Susu Buah',
        category: 'snack',
        ageRange: [10, 60],
        protein: 8,
        calories: 150,
        ingredients: [
          'Susu UHT 200ml',
          'Agar-agar 1 bungkus',
          'Pisang 1 buah',
          'Alpukat 50g',
        ],
        instructions: [
          'Masak agar-agar dengan susu',
          'Potong buah kecil-kecil',
          'Tuang ke cetakan',
          'Dinginkan hingga set',
        ],
        isHighProtein: false,
        isMBGEligible: true,
        priority: 5,
      },
      {
        id: 'mbg_005',
        title: 'Telur Orak-Arik Keju',
        category: 'breakfast',
        ageRange: [12, 60],
        protein: 16,
        calories: 280,
        ingredients: [
          'Telur ayam 2 butir',
          'Keju cheddar 30g',
          'Susu 50ml',
          'Mentega 1 sdm',
        ],
        instructions: [
          'Kocok telur dengan susu',
          'Masak dengan mentega',
          'Tambahkan keju parut',
          'Aduk hingga matang',
        ],
        isHighProtein: true,
        isMBGEligible: true,
        priority: 9,
      },
    ];
  }
}

// ==================== SINGLETON INSTANCE ====================

export const mbgEngine = new SmartMBGEngine();

// ==================== HOOKS ====================

export function useMBGRecommendations(profile: ChildNutritionProfile) {
  return {
    recipes: mbgEngine.getRecommendedRecipes(profile),
    weeklyPlan: mbgEngine.getWeeklyMealPlan(profile),
  };
}
