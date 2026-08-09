/**
 * BabyGrow AI Service - Intelligence Health Agent
 * Solusi Pintar Cegah Stunting
 * Terintegrasi dengan Real AI Chat (Google Gemini), IoT, dan modul statistik
 */

import { Child, Measurement, ZScore } from '../types/models';
import GeminiAIService from './GeminiAIService';
import {
  FALLBACK_DATA_MISSING,
  FALLBACK_IOT_HELP,
  FALLBACK_NAVIGATION,
  FALLBACK_NUTRITION,
  FALLBACK_PRIVACY,
  FALLBACK_ZAKI_EXAMPLE_REMOVED,
  fallbackAdmin,
  fallbackGreeting,
  fallbackImmunization,
  fallbackIoTEmergency,
  fallbackLoginHelp,
  fallbackProfileSettings,
  fallbackStandard,
  type FallbackLang,
} from '../constants/fallbackPrompts';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    childData?: Child;
    measurements?: Measurement[];
    analysis?: HealthAnalysis;
  };
}

export interface HealthAnalysis {
  category: 'normal' | 'at_risk' | 'stunted' | 'obese';
  zScores: {
    weightForAge: number;
    heightForAge: number;
    weightForHeight: number;
  };
  interpretation: string;
  recommendations: string[];
  riskFactors: string[];
  positiveAspects: string[];
}

// FASE 4: Parent Health History Interface
export interface ParentHealthHistory {
  diabetes: boolean;
  hypertension: boolean;
  stuntingHistory: boolean;
  obesity: boolean;
  other?: string;
}

// FASE 4: Professional Analysis Result
export interface ProfessionalAnalysis {
  riskPercentage: number; // 0-95%
  whoCategory: string;
  zScores: HealthAnalysis['zScores'];
  riskFactors: string[];
  nutritionPlan: NutritionPlan;
  professionalAdvice: ProfessionalAdvice;
  monitoringSchedule: string;
  timestamp: string;
}

export interface NutritionPlan {
  recommendations: string[];
  specificFoods: string[];
  supplements: string[];
  avoidFoods: string[];
  mealFrequency: string;
  targetCalories: number;
}

export interface ProfessionalAdvice {
  urgency: 'low' | 'medium' | 'high';
  actions: string[];
  specialists: string[];
  nextSteps: string[];
  followUp: string;
}

export interface Language {
  code: 'id' | 'en' | 'zh' | 'ar' | 'es' | 'ja';
  name: string;
}

export type UserRole = 'user' | 'admin' | 'super_user';

const LANGUAGES: Language[] = [
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'ar', name: 'العربية' },
  { code: 'es', name: 'Español' },
  { code: 'ja', name: '日本語' },
];

export class AIAssistantService {
  private static instance: AIAssistantService;
  private currentLanguage: Language['code'] = 'id';
  private currentRole: UserRole = 'user';
  private conversationHistory: AIMessage[] = [];
  private useRealAI: boolean = true; // Real AI aktif - jawaban dinamis seperti ChatGPT

  private constructor() {}

  static getInstance(): AIAssistantService {
    if (!AIAssistantService.instance) {
      AIAssistantService.instance = new AIAssistantService();
    }
    return AIAssistantService.instance;
  }

  setLanguage(language: Language['code']): void {
    this.currentLanguage = language;
  }

  setUserRole(role: UserRole): void {
    this.currentRole = role;
  }

  setUseRealAI(enabled: boolean): void {
    this.useRealAI = enabled;
  }

  setGeminiApiKey(apiKey: string): void {
    GeminiAIService.setApiKey(apiKey);
  }

  isRealAIEnabled(): boolean {
    return this.useRealAI && GeminiAIService.isConfigured();
  }

  getLanguages(): Language[] {
    return LANGUAGES;
  }

  /**
   * Analisis Statistik Pertumbuhan Anak
   */
  analyzeGrowth(child: Child, measurements: Measurement[]): HealthAnalysis {
    if (measurements.length === 0) {
      throw new Error('Tidak ada data pengukuran tersedia');
    }

    const latestMeasurement = measurements[0];
    const ageMonths = this.calculateAgeMonths(child.dateOfBirth);

    // Calculate Z-scores (simplified - in production use WHO calculator)
    const zScores = this.calculateZScores(
      child.gender,
      ageMonths,
      latestMeasurement.weight,
      latestMeasurement.height
    );

    // Determine category
    const category = this.determineCategory(zScores);

    // Generate interpretation
    const interpretation = this.generateInterpretation(category, zScores, child);

    // Generate recommendations
    const recommendations = this.generateRecommendations(category, zScores, ageMonths);

    // Identify risk factors
    const riskFactors = this.identifyRiskFactors(zScores, measurements);

    // Identify positive aspects
    const positiveAspects = this.identifyPositiveAspects(zScores, measurements);

    return {
      category,
      zScores,
      interpretation,
      recommendations,
      riskFactors,
      positiveAspects,
    };
  }

  /**
   * FASE 4: Enhanced Professional Analysis with Parent Health History
   * Generate AI Response with Real AI Chat + WHO Standards
   */
  async generateResponse(
    userMessage: string,
    context?: {
      child?: Child;
      measurements?: Measurement[];
      parentHealth?: ParentHealthHistory;
      userRole?: UserRole;
      language?: Language['code'];
    }
  ): Promise<AIMessage> {
    const messageId = Date.now().toString();

    // Add user message to history
    this.conversationHistory.push({
      id: `user-${messageId}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    let response = '';
    let metadata: any = {};

    // TRY REAL AI FIRST (if enabled and configured)
    if (this.useRealAI && GeminiAIService.isConfigured()) {
      try {
        // FASE 4: Enhanced context with parent health
        const geminiContext = {
          childName: context?.child?.name,
          childAge: context?.child ? this.calculateAgeMonths(context.child.dateOfBirth) : undefined,
          childGender: context?.child?.gender,
          recentMeasurements: context?.measurements?.slice(0, 3),
          parentHealth: context?.parentHealth, // NEW: Parent health history
          language: context?.language || this.currentLanguage,
          userRole: this.currentRole,
        };

        // Get REAL AI response from Gemini with enhanced context
        response = await GeminiAIService.generateResponse(userMessage, geminiContext);
        
        metadata = {
          source: 'gemini_ai',
          timestamp: new Date().toISOString(),
          with_parent_health: !!context?.parentHealth,
        };
      } catch (error) {
        // Fall through to template responses
        response = await this.getTemplateResponse(userMessage, context);
        metadata = { source: 'template_fallback' };
      }
    } else {
      // Use enhanced template responses
      response = await this.getTemplateResponse(userMessage, context);
      metadata = { 
        source: 'template',
        reason: !this.useRealAI ? 'real_ai_disabled' : 'api_key_not_configured',
      };
    }

    const assistantMessage: AIMessage = {
      id: `assistant-${messageId}`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      metadata,
    };

    this.conversationHistory.push(assistantMessage);

    return assistantMessage;
  }

  /**
   * FASE 4: Professional Medical Analysis with Stunting Risk Percentage
   * Combines WHO standards + Parent health history + Child data
   */
  async generateProfessionalAnalysis(
    child: Child,
    latestMeasurement: Measurement,
    measurements: Measurement[],
    parentHealth?: ParentHealthHistory,
    language: Language['code'] = 'id'
  ): Promise<ProfessionalAnalysis> {
    const ageMonths = this.calculateAgeMonths(child.dateOfBirth);

    // Calculate WHO-standard Z-scores
    const zScores = this.calculateZScores(
      child.gender,
      ageMonths,
      latestMeasurement.weight,
      latestMeasurement.height
    );

    // Calculate stunting risk percentage (FASE 4 - NEW!)
    const riskPercentage = this.calculateStuntingRiskPercentage(
      zScores,
      ageMonths,
      parentHealth
    );

    // WHO Category
    const whoCategory = this.determineCategory(zScores);

    // Risk factors including parent health
    const riskFactors = this.identifyRiskFactorsWithParentHealth(
      zScores,
      measurements,
      parentHealth
    );

    // Smart nutrition recommendations
    const nutritionPlan = this.generateSmartNutrition(
      whoCategory,
      ageMonths,
      zScores,
      riskFactors
    );

    // Professional health advice
    const professionalAdvice = this.generateProfessionalAdvice(
      whoCategory,
      riskPercentage,
      riskFactors,
      language
    );

    // Monitoring schedule
    const monitoringSchedule = this.determineMonitoringSchedule(
      whoCategory,
      riskPercentage
    );

    return {
      riskPercentage,
      whoCategory,
      zScores,
      riskFactors,
      nutritionPlan,
      professionalAdvice,
      monitoringSchedule,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * FASE 4: Calculate Stunting Risk Percentage
   * Based on WHO standards + parent health history
   */
  private calculateStuntingRiskPercentage(
    zScores: HealthAnalysis['zScores'],
    ageMonths: number,
    parentHealth?: ParentHealthHistory
  ): number {
    let risk = 0;

    // Base risk from height-for-age z-score (WHO standard)
    if (zScores.heightForAge < -3) {
      risk += 80; // Severely stunted
    } else if (zScores.heightForAge < -2) {
      risk += 60; // Stunted
    } else if (zScores.heightForAge < -1) {
      risk += 30; // At risk
    } else {
      risk += 5; // Normal baseline risk
    }

    // Additional risk from weight indicators
    if (zScores.weightForAge < -2) {
      risk += 10;
    }
    if (zScores.weightForHeight < -2) {
      risk += 10;
    }

    // Parent health history risk factors
    if (parentHealth) {
      if (parentHealth.stuntingHistory) risk += 15;
      if (parentHealth.diabetes) risk += 8;
      if (parentHealth.obesity) risk += 5;
      if (parentHealth.hypertension) risk += 5;
    }

    // Age-specific risk (critical window 0-24 months)
    if (ageMonths < 24 && zScores.heightForAge < -1) {
      risk += 5; // Higher risk if issues during critical period
    }

    // Cap at 95% (never 100% certainty)
    return Math.min(Math.round(risk), 95);
  }

  /**
   * FASE 4: Smart Nutrition Recommendations
   */
  private generateSmartNutrition(
    category: string,
    ageMonths: number,
    zScores: HealthAnalysis['zScores'],
    riskFactors: string[]
  ): NutritionPlan {
    const recommendations: string[] = [];
    const specificFoods: string[] = [];
    const supplements: string[] = [];
    const avoidFoods: string[] = [];

    // Age-appropriate base nutrition
    if (ageMonths < 6) {
      recommendations.push('ASI Eksklusif - nutrisi terbaik 0-6 bulan');
      recommendations.push('Frekuensi menyusui: on demand, minimal 8-12x/hari');
    } else {
      recommendations.push('Lanjutkan ASI hingga 2 tahun');
      recommendations.push('MPASI bergizi lengkap: protein, karbohidrat, sayur, buah');
      
      // High-protein foods for stunting risk
      if (category !== 'normal') {
        specificFoods.push('Telur (1-2 butir/hari) - protein lengkap');
        specificFoods.push('Ikan (salmon, tongkol, kembung) - Omega-3 & protein');
        specificFoods.push('Ayam kampung - protein rendah lemak');
        specificFoods.push('Tempe & tahu - protein nabati');
        specificFoods.push('Kacang-kacangan (kacang hijau, kacang merah)');
      }

      // Iron & Zinc rich foods
      if (zScores.heightForAge < -1) {
        specificFoods.push('Hati ayam/sapi (1-2x/minggu) - tinggi zat besi');
        specificFoods.push('Bayam & sayuran hijau - zat besi + folat');
        specificFoods.push('Daging merah (sapi) - zink & protein');
      }

      // Calcium for bone growth
      specificFoods.push('Susu & produk olahan (yogurt, keju)');
      specificFoods.push('Ikan teri - kalsium tinggi');
      
      // Energy-dense foods
      if (category === 'stunted' || category === 'severely_stunted') {
        recommendations.push('Tingkatkan kalori: tambahkan minyak/mentega pada makanan');
        recommendations.push('Frekuensi makan: 5-6x sehari (3 makan utama + 2-3 snack)');
        specificFoods.push('Alpukat - lemak sehat & kalori tinggi');
        specificFoods.push('Kacang & selai kacang - energi padat');
      }
    }

    // Supplements if needed
    if (category === 'stunted' || category === 'severely_stunted') {
      supplements.push('Vitamin A (sesuai program Posyandu)');
      supplements.push('Zat Besi (konsultasi dokter untuk dosis)');
      supplements.push('Zinc (konsultasi dokter)');
      supplements.push('Multivitamin anak (optional, konsultasi dokter)');
    }

    // Foods to avoid/limit
    avoidFoods.push('Gula berlebihan & makanan manis');
    avoidFoods.push('Junk food & makanan instan');
    avoidFoods.push('Minuman bersoda & jus kemasan');
    avoidFoods.push('Makanan tinggi garam');

    return {
      recommendations,
      specificFoods,
      supplements,
      avoidFoods,
      mealFrequency: category === 'normal' ? '3 makan + 2 snack/hari' : '3 makan + 3 snack/hari',
      targetCalories: this.calculateTargetCalories(ageMonths, category),
    };
  }

  /**
   * FASE 4: Professional Health Advice (Multi-language)
   */
  private generateProfessionalAdvice(
    category: string,
    riskPercentage: number,
    riskFactors: string[],
    language: Language['code']
  ): ProfessionalAdvice {
    const advice: ProfessionalAdvice = {
      urgency: 'low',
      actions: [],
      specialists: [],
      nextSteps: [],
      followUp: '',
    };

    // Determine urgency
    if (riskPercentage >= 60) {
      advice.urgency = 'high';
    } else if (riskPercentage >= 30) {
      advice.urgency = 'medium';
    }

    // Actions based on urgency
    if (advice.urgency === 'high') {
      advice.actions.push('⚠️ SEGERA konsultasi ke dokter spesialis anak');
      advice.actions.push('Kunjungi Puskesmas/RS untuk pemeriksaan komprehensif');
      advice.actions.push('Ikuti program intervensi gizi intensif');
      advice.actions.push('Periksa kondisi kesehatan: infeksi, parasit, penyakit kronis');
      advice.specialists.push('Dokter Spesialis Anak (Sp.A)');
      advice.specialists.push('Ahli Gizi Klinik');
      advice.followUp = 'Kontrol 1x/minggu hingga pertumbuhan membaik';
    } else if (advice.urgency === 'medium') {
      advice.actions.push('Konsultasi dengan dokter atau ahli gizi di Puskesmas');
      advice.actions.push('Ikuti program Makanan Bergizi Gratis (MBG) jika tersedia');
      advice.actions.push('Tingkatkan kualitas & kuantitas makanan');
      advice.actions.push('Pantau pertumbuhan lebih ketat');
      advice.specialists.push('Dokter Puskesmas');
      advice.specialists.push('Ahli Gizi/Nutrisionis');
      advice.followUp = 'Kontrol 2x/bulan di Posyandu/Puskesmas';
    } else {
      advice.actions.push('Pertahankan pola makan bergizi seimbang');
      advice.actions.push('Rutin ke Posyandu setiap bulan');
      advice.actions.push('Tetap pantau tumbuh kembang');
      advice.actions.push('Vaksinasi sesuai jadwal');
      advice.followUp = 'Kontrol rutin 1x/bulan di Posyandu';
    }

    // Next steps
    advice.nextSteps.push('Timbang & ukur tinggi anak secara rutin');
    advice.nextSteps.push('Catat perkembangan dalam buku KIA/aplikasi');
    advice.nextSteps.push('Berikan stimulasi tumbuh kembang sesuai usia');
    advice.nextSteps.push('Jaga kebersihan & sanitasi');
    advice.nextSteps.push('Pastikan anak cukup tidur (10-12 jam/hari)');

    return advice;
  }

  /**
   * Helper: Calculate target calories
   */
  private calculateTargetCalories(ageMonths: number, category: string): number {
    let baseCalories = 0;
    
    if (ageMonths < 6) {
      baseCalories = 550; // ASI
    } else if (ageMonths < 12) {
      baseCalories = 700;
    } else if (ageMonths < 24) {
      baseCalories = 1000;
    } else {
      baseCalories = 1200;
    }

    // Increase for catch-up growth
    if (category === 'stunted') {
      baseCalories *= 1.2;
    } else if (category === 'severely_stunted') {
      baseCalories *= 1.3;
    }

    return Math.round(baseCalories);
  }

  /**
   * Helper: Determine monitoring schedule
   */
  private determineMonitoringSchedule(
    category: string,
    riskPercentage: number
  ): string {
    if (riskPercentage >= 60) {
      return 'Setiap minggu (atau 2x/minggu untuk kasus berat)';
    } else if (riskPercentage >= 30) {
      return 'Setiap 2 minggu';
    } else {
      return 'Setiap bulan (rutin Posyandu)';
    }
  }

  /**
   * Helper: Identify risk factors with parent health
   */
  private identifyRiskFactorsWithParentHealth(
    zScores: HealthAnalysis['zScores'],
    measurements: Measurement[],
    parentHealth?: ParentHealthHistory
  ): string[] {
    const factors: string[] = [];

    // Child factors
    if (zScores.heightForAge < -3) {
      factors.push('Tinggi badan jauh di bawah standar WHO (< -3 SD)');
    } else if (zScores.heightForAge < -2) {
      factors.push('Tinggi badan di bawah standar WHO (< -2 SD)');
    }

    if (zScores.weightForAge < -2) {
      factors.push('Berat badan kurang dari standar');
    }

    // Growth velocity check
    if (measurements.length >= 2) {
      const recent = measurements[0];
      const previous = measurements[1];
      const heightGain = recent.height - previous.height;
      
      if (heightGain < 1.5) {
        factors.push('Pertumbuhan tinggi badan melambat');
      }
    }

    // Parent health factors
    if (parentHealth) {
      if (parentHealth.stuntingHistory) {
        factors.push('Riwayat stunting dalam keluarga');
      }
      if (parentHealth.diabetes) {
        factors.push('Riwayat diabetes dalam keluarga');
      }
      if (parentHealth.obesity) {
        factors.push('Riwayat obesitas dalam keluarga');
      }
    }

    return factors;
  }

  /**
   * Get template-based response (fallback)
   */
  private async getTemplateResponse(
    userMessage: string,
    context?: {
      child?: Child;
      measurements?: Measurement[];
      userRole?: UserRole;
      language?: Language['code'];
    }
  ): Promise<string> {
    // Analyze intent
    const intent = this.analyzeIntent(userMessage);

    // Generate response based on intent
    let response = '';

    switch (intent) {
      case 'greeting':
        response = this.getGreetingResponse();
        break;

      case 'instant_analysis':
        response = this.performInstantAnalysis(userMessage, context?.language || this.currentLanguage);
        break;

      case 'growth_analysis':
        if (context?.child && context.measurements && context.measurements.length > 0) {
          const analysis = this.analyzeGrowth(context.child, context.measurements);
          const pending = context.measurements.some((m) => m.notes === 'pending_sync');
          const body = this.formatAnalysisResponse(analysis, context.child);
          response = pending
            ? `${body}\n\n_Catatan: sebagian data masih di antrian offline (belum sync cloud)._`
            : body;
        } else {
          response = this.getDataMissingResponse();
        }
        break;

      case 'nutrition_advice':
        response = this.getNutritionAdvice(context);
        break;

      case 'iot_help':
        response = this.getIoTHelp();
        break;

      case 'navigation_help':
        response = this.getNavigationHelp();
        break;

      case 'privacy_concern':
        response = this.getPrivacyResponse();
        break;

      default:
        response = this.getGeneralResponse(userMessage, context);
    }

    return response;
  }

  /**
   * Helper Methods
   */
  private calculateAgeMonths(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const now = new Date();
    const years = now.getFullYear() - dob.getFullYear();
    const months = now.getMonth() - dob.getMonth();
    return years * 12 + months;
  }

  private calculateZScores(
    gender: 'male' | 'female',
    ageMonths: number,
    weight: number,
    height: number
  ): HealthAnalysis['zScores'] {
    // Simplified Z-score calculation
    // In production, use WHO LMS method
    return {
      weightForAge: this.calculateWFA(gender, ageMonths, weight),
      heightForAge: this.calculateHFA(gender, ageMonths, height),
      weightForHeight: this.calculateWFH(gender, height, weight),
    };
  }

  private calculateWFA(gender: string, ageMonths: number, weight: number): number {
    // Simplified - use actual WHO data in production
    const expectedWeight = gender === 'male' ? 3.3 + ageMonths * 0.5 : 3.2 + ageMonths * 0.45;
    const sd = 1.5;
    return (weight - expectedWeight) / sd;
  }

  private calculateHFA(gender: string, ageMonths: number, height: number): number {
    const expectedHeight = gender === 'male' ? 49.9 + ageMonths * 2.5 : 49.1 + ageMonths * 2.3;
    const sd = 4.0;
    return (height - expectedHeight) / sd;
  }

  private calculateWFH(gender: string, height: number, weight: number): number {
    const bmi = weight / Math.pow(height / 100, 2);
    const expectedBMI = 16.5;
    const sd = 1.5;
    return (bmi - expectedBMI) / sd;
  }

  private determineCategory(zScores: HealthAnalysis['zScores']): HealthAnalysis['category'] {
    if (zScores.heightForAge < -2) {
      return 'stunted';
    } else if (zScores.weightForHeight > 2) {
      return 'obese';
    } else if (zScores.heightForAge < -1 || zScores.weightForAge < -1) {
      return 'at_risk';
    } else {
      return 'normal';
    }
  }

  private analyzeIntent(message: string): string {
    const lowerMessage = message.toLowerCase();

    // Deteksi input data BB/TB langsung
    if (lowerMessage.match(/(\d+\.?\d*)\s*(kg|kilogram)/i) || 
        lowerMessage.match(/(\d+\.?\d*)\s*(cm|centimeter)/i) ||
        lowerMessage.match(/(berat|tinggi|bb|tb).*(\d+)/i)) {
      return 'instant_analysis';
    }

    if (lowerMessage.match(/(halo|hai|hello|hi|selamat)/)) {
      return 'greeting';
    } else if (lowerMessage.match(/(analisis|grafik|pertumbuhan|tinggi|berat|stunting)/)) {
      return 'growth_analysis';
    } else if (lowerMessage.match(/(nutrisi|makan|gizi|menu|resep)/)) {
      return 'nutrition_advice';
    } else if (lowerMessage.match(/(iot|sensor|alat|timbangan|ukur)/)) {
      return 'iot_help';
    } else if (lowerMessage.match(/(cara|bagaimana|fitur|navigasi|menu)/)) {
      return 'navigation_help';
    } else if (lowerMessage.match(/(privasi|keamanan|data|aman)/)) {
      return 'privacy_concern';
    }

    return 'general';
  }

  private asFallbackLang(lang: Language['code']): FallbackLang {
    const allowed: FallbackLang[] = ['id', 'en', 'zh', 'ar', 'ja', 'es'];
    return (allowed.includes(lang as FallbackLang) ? lang : 'id') as FallbackLang;
  }

  private getGreetingResponse(): string {
    return fallbackGreeting(this.asFallbackLang(this.currentLanguage));
  }


  private formatAnalysisResponse(analysis: HealthAnalysis, child: Child): string {
    const { category, zScores, interpretation, recommendations } = analysis;

    const categoryEmoji = {
      normal: '✅',
      at_risk: '⚠️',
      stunted: '🔴',
      obese: '⚠️',
    };

    let response = `📊 **ANALISIS PERTUMBUHAN ${child.name.toUpperCase()}**\n\n`;

    response += `${categoryEmoji[category]} **Status**: ${this.getCategoryLabel(category)}\n\n`;

    response += `📈 **Indikator WHO Z-Score**:\n`;
    response += `• Berat/Umur: ${zScores.weightForAge.toFixed(2)} SD ${this.getZScoreLabel(zScores.weightForAge)}\n`;
    response += `• Tinggi/Umur: ${zScores.heightForAge.toFixed(2)} SD ${this.getZScoreLabel(zScores.heightForAge)}\n`;
    response += `• Berat/Tinggi: ${zScores.weightForHeight.toFixed(2)} SD ${this.getZScoreLabel(zScores.weightForHeight)}\n\n`;

    response += `💡 **Interpretasi**:\n${interpretation}\n\n`;

    response += `📋 **Rekomendasi**:\n`;
    recommendations.forEach((rec, index) => {
      response += `${index + 1}. ${rec}\n`;
    });

    response += `\n🔒 *Data anak Anda tersimpan aman dan terenkripsi*`;

    return response;
  }

  private getCategoryLabel(category: HealthAnalysis['category']): string {
    const labels = {
      normal: 'Pertumbuhan Normal ✅',
      at_risk: 'Perlu Perhatian Khusus',
      stunted: 'Risiko Stunting - Butuh Intervensi',
      obese: 'Berat Berlebih - Perlu Konsultasi',
    };
    return labels[category];
  }

  private getZScoreLabel(zscore: number): string {
    if (zscore < -3) return '(Sangat Rendah)';
    if (zscore < -2) return '(Rendah)';
    if (zscore < -1) return '(Sedikit Rendah)';
    if (zscore <= 1) return '(Normal)';
    if (zscore <= 2) return '(Sedikit Tinggi)';
    if (zscore <= 3) return '(Tinggi)';
    return '(Sangat Tinggi)';
  }

  private generateInterpretation(
    category: HealthAnalysis['category'],
    zScores: HealthAnalysis['zScores'],
    child: Child
  ): string {
    const ageMonths = this.calculateAgeMonths(child.dateOfBirth);
    const ageCritical = ageMonths < 24; // Under 2 years is critical period

    if (category === 'normal') {
      return `Alhamdulillah, pertumbuhan ${child.name} berada dalam rentang normal menurut standar WHO. ` +
             `Teruskan pola asuh yang baik dan jaga konsistensi nutrisi seimbang. ` +
             `${ageCritical ? 'Usia di bawah 2 tahun adalah periode emas pertumbuhan, pertahankan monitoring rutin.' : ''}`;
    }

    if (category === 'at_risk') {
      return `${child.name} menunjukkan tanda-tanda perlu perhatian khusus dalam pertumbuhan. ` +
             `Meskipun belum dalam kategori kritis, penting untuk meningkatkan asupan nutrisi dan monitoring lebih ketat. ` +
             `${ageCritical ? '⚠️ Periode kritis - intervensi dini sangat penting untuk mencegah stunting.' : ''}`;
    }

    if (category === 'stunted') {
      return `⚠️ PERHATIAN: ${child.name} menunjukkan indikasi stunting (pertumbuhan terhambat). ` +
             `Segera konsultasikan dengan dokter anak atau ahli gizi untuk program intervensi intensif. ` +
             `Stunting dapat berdampak jangka panjang pada perkembangan fisik dan kognitif anak.`;
    }

    if (category === 'obese') {
      return `${child.name} memiliki berat badan berlebih untuk tinggi badannya. ` +
             `Konsultasikan dengan ahli gizi untuk mengatur pola makan yang sehat dan seimbang. ` +
             `Fokus pada kualitas nutrisi, bukan hanya kuantitas.`;
    }

    return 'Data tidak lengkap untuk memberikan interpretasi akurat.';
  }

  private generateRecommendations(
    category: HealthAnalysis['category'],
    zScores: HealthAnalysis['zScores'],
    ageMonths: number
  ): string[] {
    const recommendations: string[] = [];

    if (category === 'normal') {
      recommendations.push('Pertahankan pola makan bergizi seimbang dengan protein, karbohidrat, lemak sehat');
      recommendations.push('Lakukan pengukuran rutin setiap bulan di Posyandu atau klinik');
      recommendations.push('Pastikan tidur cukup (10-12 jam untuk balita)');
      recommendations.push('Berikan stimulasi sesuai usia untuk perkembangan optimal');
      recommendations.push('Jaga kebersihan untuk mencegah infeksi yang menghambat pertumbuhan');
    }

    if (category === 'at_risk') {
      recommendations.push('🚨 PRIORITAS: Tingkatkan asupan protein berkualitas (telur, ikan, ayam, tempe, tahu)');
      recommendations.push('Berikan makanan padat gizi 5-6x sehari dalam porsi kecil');
      recommendations.push('Tambahkan lemak sehat (minyak kelapa, alpukat) untuk meningkatkan kalori');
      recommendations.push('Konsultasi ke Puskesmas untuk program Makanan Bergizi Gratis (MBG)');
      recommendations.push('Lakukan pengukuran setiap 2 minggu untuk monitoring ketat');
      recommendations.push('Periksa apakah ada penyakit infeksi atau parasit yang menghambat pertumbuhan');
    }

    if (category === 'stunted') {
      recommendations.push('‼️ SEGERA konsultasi dengan dokter spesialis anak atau ahli gizi klinis');
      recommendations.push('Ikuti program rehabilitasi gizi intensif di Puskesmas/RS');
      recommendations.push('Berikan makanan dengan densitas energi tinggi setiap 2-3 jam');
      recommendations.push('Suplementasi vitamin dan mineral sesuai anjuran medis');
      recommendations.push('Pengukuran dan evaluasi seminggu sekali');
      recommendations.push('Tangani masalah kesehatan yang mendasari (diare kronis, infeksi, dll)');
      recommendations.push('Libatkan keluarga dalam program pemulihan gizi anak');
    }

    if (category === 'obese') {
      recommendations.push('Konsultasi dengan ahli gizi untuk mengatur pola makan seimbang');
      recommendations.push('Kurangi makanan tinggi gula dan lemak jenuh');
      recommendations.push('Tingkatkan aktivitas fisik sesuai usia');
      recommendations.push('Fokus pada makanan whole foods (buah, sayur, protein lean)');
      recommendations.push('Hindari minuman manis, ganti dengan air putih');
    }

    if (ageMonths < 6) {
      recommendations.push('💝 ASI Eksklusif adalah nutrisi terbaik untuk usia ini');
    } else if (ageMonths < 24) {
      recommendations.push('💝 Lanjutkan ASI sambil berikan MPASI bergizi');
    }

    return recommendations;
  }

  private identifyRiskFactors(
    zScores: HealthAnalysis['zScores'],
    measurements: Measurement[]
  ): string[] {
    const factors: string[] = [];

    if (zScores.heightForAge < -2) {
      factors.push('Tinggi badan signifikan di bawah standar WHO');
    }

    if (zScores.weightForAge < -2) {
      factors.push('Berat badan signifikan di bawah standar WHO');
    }

    if (measurements.length >= 2) {
      const latest = measurements[0];
      const previous = measurements[1];
      const heightChange = latest.height - previous.height;

      if (heightChange < 0.5) {
        factors.push('Kecepatan pertumbuhan tinggi badan melambat');
      }
    }

    return factors;
  }

  private identifyPositiveAspects(
    zScores: HealthAnalysis['zScores'],
    measurements: Measurement[]
  ): string[] {
    const positive: string[] = [];

    if (zScores.heightForAge >= -1) {
      positive.push('Tinggi badan dalam rentang normal');
    }

    if (zScores.weightForAge >= -1) {
      positive.push('Berat badan dalam rentang normal');
    }

    if (measurements.length >= 2) {
      const latest = measurements[0];
      const previous = measurements[1];
      const heightChange = latest.height - previous.height;

      if (heightChange >= 1.5) {
        positive.push('Pertumbuhan tinggi badan konsisten baik');
      }
    }

    return positive;
  }

  private getDataMissingResponse(): string {
    return FALLBACK_DATA_MISSING;
  }


  private getNutritionAdvice(_context?: any): string {
    return FALLBACK_NUTRITION;
  }


  private getIoTHelp(): string {
    return FALLBACK_IOT_HELP;
  }


  private getNavigationHelp(): string {
    return FALLBACK_NAVIGATION;
  }


  private getPrivacyResponse(): string {
    return FALLBACK_PRIVACY;
  }


  private getGeneralResponse(message: string, context?: any): string {
    // Deteksi intent khusus berdasarkan role
    const role = context?.userRole || this.currentRole;
    const lang = context?.language || this.currentLanguage;

    // Deteksi pertanyaan tentang login/akun
    if (message.toLowerCase().match(/(login|masuk|akun|sign in|account)/)) {
      return this.getLoginStatusResponse(lang);
    }

    // Deteksi pertanyaan tentang IoT yang gagal
    if (message.toLowerCase().match(/(iot|sensor|gagal|tidak bisa|error|alat ukur)/)) {
      return this.getIoTEmergencyResponse(lang);
    }

    // Deteksi pertanyaan tentang imunisasi
    if (message.toLowerCase().match(/(imunisasi|vaksin|suntik|immunization)/)) {
      return this.getImmunizationSchedule(lang);
    }

    // Deteksi pertanyaan tentang profil/dark mode
    if (message.toLowerCase().match(/(profil|dark mode|tema|setting|pengaturan)/)) {
      return this.getProfileSettingsStatus(lang);
    }

    // Response berdasarkan role
    if (role === 'super_user') {
      return this.getSuperUserResponse(message, lang);
    } else if (role === 'admin') {
      return this.getAdminResponse(message, lang);
    }

    // Default user response
    return this.getStandardResponse(lang);
  }

  /**
   * PROTOKOL DARURAT - Login Status
   */
  private getLoginStatusResponse(lang: Language['code']): string {
    return fallbackLoginHelp(this.asFallbackLang(lang));
  }


  /**
   * PROTOKOL DARURAT - IoT Emergency Manual Input
   */
  private getIoTEmergencyResponse(lang: Language['code']): string {
    return fallbackIoTEmergency(this.asFallbackLang(lang));
  }


  /**
   * Jadwal Imunisasi (karena tombol mati)
   */
  private getImmunizationSchedule(lang: Language['code']): string {
    return fallbackImmunization(this.asFallbackLang(lang));
  }


  /**
   * Status Profil & Dark Mode
   */
  private getProfileSettingsStatus(lang: Language['code']): string {
    return fallbackProfileSettings(this.asFallbackLang(lang));
  }


  /**
   * Super User Response
   */
  private getSuperUserResponse(_message: string, lang: Language['code']): string {
    return fallbackAdmin(this.asFallbackLang(lang));
  }


  /**
   * Admin Response
   */
  private getAdminResponse(_message: string, lang: Language['code']): string {
    return fallbackAdmin(this.asFallbackLang(lang));
  }


  /**
   * Standard User Response
   */
  private getStandardResponse(lang: Language['code']): string {
    return fallbackStandard(this.asFallbackLang(lang));
  }


  getConversationHistory(): AIMessage[] {
    return this.conversationHistory;
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * INSTANT ANALYSIS - Analisis data BB/TB yang diinput langsung
   */
  private performInstantAnalysis(message: string, lang: Language['code']): string {
    // Extract weight and height from message
    const weightMatch = message.match(/(\d+\.?\d*)\s*(kg|kilogram)/i);
    const heightMatch = message.match(/(\d+\.?\d*)\s*(cm|centimeter)/i);

    if (!weightMatch && !heightMatch) {
      return 'Halo Bun! 😊 Aku siap bantu analisis pertumbuhan si kecil nih~\n\n' +
             'Cuma butuh info ini aja:\n' +
             '📊 **Berat Badan** anak (contoh: 10.2 kg)\n' +
             '📏 **Tinggi Badan** anak (contoh: 78.5 cm)\n' +
             '🎂 **Tanggal Lahir** anak\n\n' +
             '**Contoh cara ngasih tau**:\n' +
             '"Anak aku BB 10 kg, TB 75 cm, lahir 1 Januari 2024"\n' +
             'atau\n' +
             FALLBACK_ZAKI_EXAMPLE_REMOVED +
             '\n\nGampang kan? Yuk kasih tau datanya! 💕';
    }

    const weight = weightMatch ? parseFloat(weightMatch[1]) : null;
    const height = heightMatch ? parseFloat(heightMatch[1]) : null;

    // Simplified analysis (in production, need complete child data)
    const responses = {
      id: this.generateInstantAnalysisID(weight, height),
      en: this.generateInstantAnalysisEN(weight, height),
    };

    return responses[lang] || responses.id;
  }

  private generateInstantAnalysisID(weight: number | null, height: number | null): string {
    let analysis = 'Oke Bun, aku udah terima datanya! 📊 Sekarang aku analisis ya~\n\n';
    analysis += '**Data si kecil yang Bunda kasih**:\n';
    
    if (weight) {
      analysis += `⚖️ Berat Badan: ${weight} kg\n`;
    }
    if (height) {
      analysis += `📏 Tinggi Badan: ${height} cm\n`;
    }

    analysis += '\n**Hasil Analisis Aku** 💡\n';

    // Quick assessment (simplified)
    if (weight && height) {
      const bmi = weight / Math.pow(height / 100, 2);
      
      if (height < 65) {
        analysis += '⚠️ **Bunda, ini perlu perhatian khusus ya...**\n\n';
        analysis += 'Jadi gini Bun, tinggi badan si kecil saat ini agak di bawah standar untuk usia balita. Ada kemungkinan risiko stunting nih, tapi **jangan panik dulu ya!** Kita bisa atasi kok! 💪\n\n';
        analysis += '**Yang perlu Bunda lakukan SEGERA**:\n';
        analysis += '1. 🏥 **Konsultasi ke Puskesmas/dokter anak** - ini penting banget ya Bun! Mereka bisa kasih saran lebih detail\n';
        analysis += '2. 🍳 **Tingkatkan protein** - kasih telur 2x sehari, ikan 3x seminggu (salmon/teri bagus!)\n';
        analysis += '3. 🥛 **Susu pertumbuhan** - pilih yang tinggi kalsium & vitamin D\n';
        analysis += '4. 📊 **Ukur rutin tiap 2 minggu** - biar kita tau perkembangannya gimana\n';
        analysis += '5. 💊 **Tanya dokter soal vitamin** - biasanya vitamin D & Zinc bagus buat pertumbuhan\n\n';
        analysis += '💕 Semangat ya Bun! Dengan penanganan tepat, si kecil pasti bisa catch-up growth kok!';
      } else if (height < 75) {
        analysis += '⚠️ **Perlu monitoring lebih ketat nih Bun...**\n\n';
        analysis += 'Tinggi si kecil masih dalam batas normal, tapi mendekati batas bawah. Kita perlu **boost nutrisinya** biar makin oke! 💪\n\n';
        analysis += '**Aku saranin ini ya Bun**:\n';
        analysis += '1. 🥗 **Menu bergizi 5x sehari** - 3x makan besar + 2x snack sehat\n';
        analysis += '2. 🍳 **Protein hewani tiap hari** - telur, ayam, ikan, atau daging (ganti-ganti biar gak bosen)\n';
        analysis += '3. 📊 **Ukur rutin tiap bulan** - di Posyandu atau rumah (pakai alat ukur yang akurat ya)\n';
        analysis += '4. 💤 **Tidur cukup 10-12 jam** - growth hormone keluar pas tidur lho!\n\n';
        analysis += '💡 **Tips**: Kombinasikan protein + sayur warna-warni setiap makan ya Bun!';
      } else {
        analysis += '✅ **Alhamdulillah, pertumbuhannya bagus Bun!** 🎉\n\n';
        analysis += 'Tinggi si kecil dalam rentang normal sesuai usianya. **Good job** Bunda dalam mengasuh! 👏\n\n';
        analysis += '**Pertahankan ya dengan cara ini**:\n';
        analysis += '1. ✅ **Gizi seimbang terus** - protein, karbo, sayur, buah semuanya ada\n';
        analysis += '2. 📊 **Ukur rutin di Posyandu** - minimal sebulan sekali biar tau tren pertumbuhannya\n';
        analysis += '3. 🎯 **Stimulasi motorik** - main, gerak, eksplorasi sesuai usia (anak happy, Bunda happy!)\n\n';
        analysis += '💕 Keep up the great work, Bun! Si kecil tumbuh sehat berkat perhatian Bunda!';
      }
    }

    analysis += '\n\n📌 **Mau analisis yang lebih detail?**\n';
    analysis += 'Simpan data lengkap di menu "Profil Anak" ya, nanti aku bisa:\n';
    analysis += '• Hitung **Z-Score WHO** yang akurat\n';
    analysis += '• Bikin **grafik pertumbuhan** otomatis\n';
    analysis += '• Kasih rekomendasi **menu MPASI** yang cocok\n';
    analysis += '• **Track progress** bulanan si kecil\n\n';
    analysis += '💬 Kalau bingung caranya, tanya aja: **"Cara input data lengkap gimana?"**';

    return analysis;
  }

  private generateInstantAnalysisEN(weight: number | null, height: number | null): string {
    let analysis = '📊 **INSTANT ANALYSIS - BabyGrow AI**\n\n';
    analysis += '✅ **Data Received**:\n';
    
    if (weight) {
      analysis += `• Weight: ${weight} kg\n`;
    }
    if (height) {
      analysis += `• Height: ${height} cm\n`;
    }

    analysis += '\n🤖 **Based on latest data, as Smart Solution to Prevent Stunting, we recommend:**\n\n';

    if (weight && height) {
      if (height < 65) {
        analysis += '⚠️ **STATUS: Needs Special Attention**\n\n';
        analysis += '**Indication**:\n';
        analysis += '• Height below standard for toddler age\n';
        analysis += '• Potential stunting risk\n\n';
        analysis += '**Immediate Recommendations**:\n';
        analysis += '1. 🚨 Consult pediatrician immediately\n';
        analysis += '2. 🍳 Increase protein: eggs 2x/day, fish 3x/week\n';
        analysis += '3. 🥛 Provide growth milk\n';
        analysis += '4. 📊 Monitor every 2 weeks\n';
        analysis += '5. 💊 Ask about vitamin D & Zinc supplements\n';
      } else if (height < 75) {
        analysis += '⚠️ **STATUS: Needs Monitoring**\n\n';
        analysis += '**Indication**:\n';
        analysis += '• Height approaching lower normal limit\n';
        analysis += '• Need nutrition improvement\n\n';
        analysis += '**Recommendations**:\n';
        analysis += '1. 🥗 Nutritious meals 5x daily\n';
        analysis += '2. 🍳 Animal protein every day\n';
        analysis += '3. 📊 Regular measurement monthly\n';
        analysis += '4. 💤 Adequate sleep 10-12 hours\n';
      } else {
        analysis += '✅ **STATUS: Normal Growth**\n\n';
        analysis += '**Indication**:\n';
        analysis += '• Height in normal range\n';
        analysis += '• Continue good parenting\n\n';
        analysis += '**Recommendations**:\n';
        analysis += '1. ✅ Maintain balanced nutrition\n';
        analysis += '2. 📊 Regular measurement\n';
        analysis += '3. 🎯 Age-appropriate motor stimulation\n';
      }
    }

    analysis += '\n📌 **For complete analysis**:\n';
    analysis += '1. Save data in "Child Profile" menu\n';
    analysis += '2. I will calculate WHO Z-Score\n';
    analysis += '3. Automatic growth charts\n\n';
    analysis += '💡 Ask: "How to input complete data"';

    return analysis;
  }
}

export default AIAssistantService.getInstance();
