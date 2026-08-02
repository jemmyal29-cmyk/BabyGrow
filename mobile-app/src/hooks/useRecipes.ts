/**
 * Recipes domain — Supabase `recipes` table (MBG catalog)
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/SupabaseClient';

export const RECIPES_QUERY_KEY = ['recipes'] as const;

export interface RecipeRow {
  id: string;
  slug: string;
  title: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  age_min_months: number;
  age_max_months: number;
  calories: number;
  protein_g: number;
  fat_g: number | null;
  carbs_g: number | null;
  ingredients: string[];
  instructions: string[];
  is_high_protein: boolean;
  is_mbg_eligible: boolean;
  priority: number;
  created_at: string;
}

export function useRecipes() {
  return useQuery({
    queryKey: RECIPES_QUERY_KEY,
    queryFn: async (): Promise<RecipeRow[]> => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('priority', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as RecipeRow[];
    },
  });
}
