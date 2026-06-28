/**
 * BabyGrow Zustand Stores - Unicorn Grade State Management
 * Performance-first dengan persist middleware
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== AUTH STORE ====================

export interface AuthState {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'parent' | 'admin' | 'super_user';
    avatar?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (user: AuthState['user']) => void;
  logout: () => void;
  updateUser: (data: Partial<AuthState['user']>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user) => set({ user, isAuthenticated: true }),
      
      logout: () => set({ user: null, isAuthenticated: false }),
      
      updateUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
      })),
      
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'babygrow-auth',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ==================== CHILD STORE ====================

export interface Child {
  id: string;
  name: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  birthWeight?: number;
  birthHeight?: number;
  photo?: string;
  latestMeasurement?: {
    weight: number;
    height: number;
    date: string;
    zScores: {
      wfa: number;
      hfa: number;
      wfh: number;
    };
    stuntingRisk: 'normal' | 'at_risk' | 'stunted' | 'severe';
  };
}

export interface ChildState {
  children: Child[];
  selectedChildId: string | null;
  
  // Computed
  selectedChild: () => Child | null;
  
  // Actions
  addChild: (child: Child) => void;
  updateChild: (id: string, data: Partial<Child>) => void;
  deleteChild: (id: string) => void;
  selectChild: (id: string) => void;
  updateLatestMeasurement: (childId: string, measurement: Child['latestMeasurement']) => void;
}

export const useChildStore = create<ChildState>()(
  persist(
    (set, get) => ({
      children: [],
      selectedChildId: null,

      selectedChild: () => {
        const state = get();
        return state.children.find(c => c.id === state.selectedChildId) || null;
      },

      addChild: (child) => set((state) => ({
        children: [...state.children, child],
        selectedChildId: child.id,
      })),

      updateChild: (id, data) => set((state) => ({
        children: state.children.map(c =>
          c.id === id ? { ...c, ...data } : c
        ),
      })),

      deleteChild: (id) => set((state) => ({
        children: state.children.filter(c => c.id !== id),
        selectedChildId: state.selectedChildId === id ? null : state.selectedChildId,
      })),

      selectChild: (id) => set({ selectedChildId: id }),

      updateLatestMeasurement: (childId, measurement) => set((state) => ({
        children: state.children.map(c =>
          c.id === childId ? { ...c, latestMeasurement: measurement } : c
        ),
      })),
    }),
    {
      name: 'babygrow-children',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ==================== MBG STORE (Makan Bergizi Gratis) ====================

export interface MBGRecipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  ageRange: { min: number; max: number }; // months
  nutrition: {
    calories: number;
    protein: number;
    iron: number;
    calcium: number;
    vitamin_a: number;
  };
  ingredients: string[];
  instructions: string[];
  prepTime: number; // minutes
  cookTime: number;
  servings: number;
  tags: string[];
  forStunting: boolean; // Prioritas untuk anak berisiko stunting
}

export interface MealPlan {
  date: string;
  breakfast?: MBGRecipe;
  lunch?: MBGRecipe;
  dinner?: MBGRecipe;
  snacks: MBGRecipe[];
}

export interface MBGState {
  recipes: MBGRecipe[];
  mealPlans: { [childId: string]: MealPlan[] }; // 7-day plans
  favorites: string[]; // recipe IDs
  
  // Actions
  setRecipes: (recipes: MBGRecipe[]) => void;
  addToFavorites: (recipeId: string) => void;
  removeFromFavorites: (recipeId: string) => void;
  setMealPlan: (childId: string, plans: MealPlan[]) => void;
  generateMealPlan: (childId: string, stuntingRisk: string) => MealPlan[];
}

export const useMBGStore = create<MBGState>()(
  persist(
    (set, get) => ({
      recipes: [],
      mealPlans: {},
      favorites: [],

      setRecipes: (recipes) => set({ recipes }),

      addToFavorites: (recipeId) => set((state) => ({
        favorites: [...state.favorites, recipeId],
      })),

      removeFromFavorites: (recipeId) => set((state) => ({
        favorites: state.favorites.filter(id => id !== recipeId),
      })),

      setMealPlan: (childId, plans) => set((state) => ({
        mealPlans: { ...state.mealPlans, [childId]: plans },
      })),

      generateMealPlan: (childId, stuntingRisk) => {
        const state = get();
        const recipes = state.recipes;
        
        // Decision Tree: Prioritas high protein + iron jika stunting
        const priorityRecipes = stuntingRisk !== 'normal'
          ? recipes.filter(r => r.forStunting)
          : recipes;

        // Generate 7-day meal plan
        const plans: MealPlan[] = [];
        for (let day = 0; day < 7; day++) {
          const date = new Date();
          date.setDate(date.getDate() + day);
          
          plans.push({
            date: date.toISOString().split('T')[0],
            breakfast: priorityRecipes.find(r => r.category === 'breakfast'),
            lunch: priorityRecipes.find(r => r.category === 'lunch'),
            dinner: priorityRecipes.find(r => r.category === 'dinner'),
            snacks: priorityRecipes.filter(r => r.category === 'snack').slice(0, 2),
          });
        }

        return plans;
      },
    }),
    {
      name: 'babygrow-mbg',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ==================== AI VISION STORE ====================

export interface HeightMeasurement {
  id: string;
  childId: string;
  imageUri: string;
  analyzedHeight: number | null;
  confidence: number | null;
  status: 'pending' | 'analyzing' | 'success' | 'error';
  errorMessage?: string;
  createdAt: string;
  manualCorrection?: number;
}

export interface AIVisionState {
  measurements: HeightMeasurement[];
  isAnalyzing: boolean;
  
  // Actions
  startAnalysis: (measurement: HeightMeasurement) => void;
  completeAnalysis: (id: string, height: number, confidence: number) => void;
  failAnalysis: (id: string, error: string) => void;
  addManualCorrection: (id: string, height: number) => void;
}

export const useAIVisionStore = create<AIVisionState>()(
  persist(
    (set) => ({
      measurements: [],
      isAnalyzing: false,

      startAnalysis: (measurement) => set((state) => ({
        measurements: [...state.measurements, measurement],
        isAnalyzing: true,
      })),

      completeAnalysis: (id, height, confidence) => set((state) => ({
        measurements: state.measurements.map(m =>
          m.id === id
            ? { ...m, analyzedHeight: height, confidence, status: 'success' as const }
            : m
        ),
        isAnalyzing: false,
      })),

      failAnalysis: (id, error) => set((state) => ({
        measurements: state.measurements.map(m =>
          m.id === id
            ? { ...m, status: 'error' as const, errorMessage: error }
            : m
        ),
        isAnalyzing: false,
      })),

      addManualCorrection: (id, height) => set((state) => ({
        measurements: state.measurements.map(m =>
          m.id === id
            ? { ...m, manualCorrection: height }
            : m
        ),
      })),
    }),
    {
      name: 'babygrow-ai-vision',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ==================== APP STATE STORE ====================

export interface AppState {
  theme: 'light' | 'dark';
  language: 'id' | 'en';
  notifications: boolean;
  offlineQueue: any[];
  lastSync: string | null;
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: 'id' | 'en') => void;
  toggleNotifications: () => void;
  addToOfflineQueue: (action: any) => void;
  clearOfflineQueue: () => void;
  updateLastSync: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'light',
      language: 'id',
      notifications: true,
      offlineQueue: [],
      lastSync: null,

      setTheme: (theme) => set({ theme }),
      
      setLanguage: (lang) => set({ language: lang }),
      
      toggleNotifications: () => set((state) => ({
        notifications: !state.notifications,
      })),

      addToOfflineQueue: (action) => set((state) => ({
        offlineQueue: [...state.offlineQueue, action],
      })),

      clearOfflineQueue: () => set({ offlineQueue: [] }),

      updateLastSync: () => set({ lastSync: new Date().toISOString() }),
    }),
    {
      name: 'babygrow-app',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ==================== SELECTOR HOOKS (Performance) ====================

// Auth selectors
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useUserRole = () => useAuthStore((state) => state.user?.role);

// Child selectors
export const useSelectedChild = () => useChildStore((state) => state.selectedChild());
export const useChildrenCount = () => useChildStore((state) => state.children.length);

// MBG selectors
export const useFavoriteRecipes = () => {
  const recipes = useMBGStore((state) => state.recipes);
  const favorites = useMBGStore((state) => state.favorites);
  return recipes.filter(r => favorites.includes(r.id));
};

// AI Vision selectors
export const useLatestMeasurement = () => {
  const measurements = useAIVisionStore((state) => state.measurements);
  return measurements[measurements.length - 1] || null;
};
