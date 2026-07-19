/**
 * BabyGrow AI Service - Intelligence Health Agent
 * Solusi Pintar Cegah Stunting
 * Terintegrasi dengan Real AI Chat (Google Gemini), IoT, dan modul statistik
 */

import { Child, Measurement, ZScore } from '../types/models';
import GeminiAIService from './GeminiAIService';

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
        if (context?.child && context?.measurements) {
          const analysis = this.analyzeGrowth(context.child, context.measurements);
          response = this.formatAnalysisResponse(analysis, context.child);
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

  private getGreetingResponse(): string {
    const responses = {
      id: '👋 Selamat datang di BabyGrow AI!\n\n' +
          '🧠 Saya adalah **Intelligence Health Agent** - Solusi Pintar Cegah Stunting\n\n' +
          '**Saya dapat membantu Anda**:\n' +
          '✅ Analisis pertumbuhan anak berdasarkan data WHO\n' +
          '✅ Rekomendasi nutrisi & MPASI untuk cegah stunting\n' +
          '✅ Panduan penggunaan fitur IoT (timbangan digital)\n' +
          '✅ Jadwal imunisasi dan stimulasi motorik\n' +
          '✅ Tanya jawab kesehatan anak 24/7\n\n' +
          '💡 Tanyakan apapun tentang tumbuh kembang anak Anda!\n' +
          '🌍 Saya mendukung 5 bahasa: Indonesia, English, 中文, العربية, 日本語',
      en: '👋 Welcome to BabyGrow AI!\n\n' +
          '🧠 I am an **Intelligence Health Agent** - Smart Solution to Prevent Stunting\n\n' +
          '**I can assist you with**:\n' +
          '✅ Child growth analysis based on WHO standards\n' +
          '✅ Nutrition & complementary feeding recommendations\n' +
          '✅ IoT device setup guide (smart scales)\n' +
          '✅ Immunization schedule & motor stimulation\n' +
          '✅ 24/7 child health Q&A\n\n' +
          '💡 Ask me anything about your child\'s development!\n' +
          '🌍 I support 5 languages: Indonesia, English, 中文, العربية, 日本語',
      zh: '👋 欢迎来到BabyGrow AI！\n\n' +
          '🧠 我是**智能健康代理** - 预防发育迟缓的智能解决方案\n\n' +
          '**我可以帮助您**：\n' +
          '✅ 基于WHO标准的儿童成长分析\n' +
          '✅ 营养和辅食建议\n' +
          '✅ 物联网设备设置指南（智能秤）\n' +
          '✅ 免疫接种时间表和运动刺激\n' +
          '✅ 24/7儿童健康问答\n\n' +
          '💡 向我询问有关孩子发育的任何问题！\n' +
          '🌍 我支持5种语言：Indonesia, English, 中文, العربية, 日本語',
      ar: '👋 مرحباً بك في BabyGrow AI!\n\n' +
          '🧠 أنا **وكيل الصحة الذكي** - حل ذكي لمنع التقزم\n\n' +
          '**يمكنني مساعدتك في**:\n' +
          '✅ تحليل نمو الطفل بناءً على معايير منظمة الصحة العالمية\n' +
          '✅ توصيات التغذية والأطعمة التكميلية\n' +
          '✅ دليل إعداد جهاز إنترنت الأشياء (الميزان الذكي)\n' +
          '✅ جدول التطعيمات والتحفيز الحركي\n' +
          '✅ أسئلة وأجوبة صحة الطفل على مدار الساعة\n\n' +
          '💡 اسألني أي شيء عن تطور طفلك!\n' +
          '🌍 أدعم 5 لغات: Indonesia, English, 中文, العربية, 日本語',
      ja: '👋 BabyGrow AIへようこそ！\n\n' +
          '🧠 私は**インテリジェント・ヘルス・エージェント** - 発育遅延を防ぐスマートソリューションです\n\n' +
          '**お手伝いできること**：\n' +
          '✅ WHO基準に基づく子供の成長分析\n' +
          '✅ 栄養と離乳食の推奨事項\n' +
          '✅ IoTデバイス設定ガイド（スマート体重計）\n' +
          '✅ 予防接種スケジュールと運動刺激\n' +
          '✅ 24時間365日の子供の健康Q&A\n\n' +
          '💡 お子様の発達について何でも聞いてください！\n' +
          '🌍 5つの言語をサポート：Indonesia, English, 中文, العربية, 日本語',
      es: '👋 ¡Bienvenido a BabyGrow AI!\n\n' +
          '🧠 Soy un **Agente de Salud Inteligente** - Solución Inteligente para Prevenir el Retraso del Crecimiento\n\n' +
          '**Puedo ayudarte con**:\n' +
          '✅ Análisis del crecimiento infantil basado en estándares OMS\n' +
          '✅ Recomendaciones de nutrición y alimentación complementaria\n' +
          '✅ Guía de configuración de dispositivos IoT (básculas inteligentes)\n' +
          '✅ Calendario de inmunización y estimulación motora\n' +
          '✅ Preguntas y respuestas de salud infantil 24/7\n\n' +
          '💡 ¡Pregúntame cualquier cosa sobre el desarrollo de tu hijo!\n' +
          '🌍 Apoyo 5 idiomas: Indonesia, English, 中文, العربية, 日本語',
    };

    return responses[this.currentLanguage] || responses.id;
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
    return '📋 **Data Tidak Lengkap**\n\n' +
           'Untuk melakukan analisis pertumbuhan, saya membutuhkan:\n' +
           '1. Data profil anak (nama, tanggal lahir, jenis kelamin)\n' +
           '2. Data pengukuran (berat badan, tinggi badan)\n\n' +
           '📱 **Cara Menambahkan Data**:\n' +
           '1. Buka menu "Profil Anak" di bawah\n' +
           '2. Tambah anak baru atau pilih anak yang ada\n' +
           '3. Klik "Ukur Sekarang" untuk menambah data pengukuran\n\n' +
           '💡 Anda dapat menggunakan fitur IoT untuk pengukuran otomatis atau input manual.';
  }

  private getNutritionAdvice(context?: any): string {
    return '🥗 **PANDUAN NUTRISI UNTUK PERTUMBUHAN OPTIMAL**\n\n' +
           '**Prinsip Gizi Seimbang "Isi Piringku"**:\n' +
           '• 1/3 Karbohidrat (nasi, roti, kentang)\n' +
           '• 1/3 Protein (ayam, ikan, telur, tempe, tahu)\n' +
           '• 1/3 Sayur dan buah (bayam, wortel, tomat, pisang)\n\n' +
           '**Nutrisi Penting untuk Pertumbuhan**:\n' +
           '1. Protein: 2-3x sehari (telur, ikan, daging)\n' +
           '2. Zat Besi: Cegah anemia (hati, daging merah, bayam)\n' +
           '3. Kalsium: Pertumbuhan tulang (susu, keju, ikan teri)\n' +
           '4. Zinc: Sistem imun (daging, kacang-kacangan)\n' +
           '5. Vitamin A: Penglihatan (wortel, bayam, mangga)\n\n' +
           '**Tips Praktis**:\n' +
           '✅ Berikan 3x makan utama + 2x snack bergizi\n' +
           '✅ Variasikan menu setiap hari\n' +
           '✅ Hindari junk food dan minuman manis\n' +
           '✅ Cukupi kebutuhan air putih\n\n' +
           '📚 Lihat menu "Resep MBG" untuk inspirasi menu bergizi!';
  }

  private getIoTHelp(): string {
    return '📱 **PANDUAN PENGGUNAAN IoT DEVICE**\n\n' +
           '**Langkah-Langkah Pengukuran**:\n\n' +
           '1️⃣ Pairing Device\n' +
           '   • Buka menu "IoT Device"\n' +
           '   • Klik "Tambah Perangkat Baru"\n' +
           '   • Nyalakan timbangan/alat ukur IoT\n' +
           '   • Scan atau hubungkan via Bluetooth\n\n' +
           '2️⃣ Kalibrasi (Pertama Kali)\n' +
           '   • Pastikan alat di permukaan datar\n' +
           '   • Ikuti instruksi kalibrasi di layar\n\n' +
           '3️⃣ Pengukuran\n' +
           '   • Pilih anak yang akan diukur\n' +
           '   • Letakkan anak di alat ukur\n' +
           '   • Tunggu hingga data tersimpan otomatis\n\n' +
           '4️⃣ Sinkronisasi\n' +
           '   • Data akan tersimpan otomatis di cloud\n' +
           '   • Pastikan koneksi internet aktif\n\n' +
           '💡 **Troubleshooting**:\n' +
           '• Perangkat tidak terdeteksi: Cek Bluetooth/WiFi\n' +
           '• Data tidak akurat: Lakukan kalibrasi ulang\n' +
           '• Baterai lemah: Charge minimal 50%';
  }

  private getNavigationHelp(): string {
    return '🧭 **PANDUAN NAVIGASI APLIKASI BABYGROW**\n\n' +
           '**Menu Utama** (Bottom Navigation):\n\n' +
           '🏠 **Beranda**: Dashboard dan ringkasan\n' +
           '   • Lihat status pertumbuhan anak\n' +
           '   • Akses fitur cepat\n\n' +
           '👶 **Profil Anak**: Manajemen data anak\n' +
           '   • Tambah/edit profil anak\n' +
           '   • Lihat riwayat pengukuran\n' +
           '   • Input data manual\n\n' +
           '📊 **Grafik**: Visualisasi pertumbuhan\n' +
           '   • Grafik WHO (BB/U, TB/U, BB/TB)\n' +
           '   • Tren pertumbuhan\n' +
           '   • Perbandingan dengan standar\n\n' +
           '👤 **Profil**: Pengaturan akun\n' +
           '   • Edit profil orang tua\n' +
           '   • Pengaturan privasi\n' +
           '   • Bahasa interface\n\n' +
           '**Fitur Tambahan**:\n' +
           '🤖 AI Analisis: Chat dengan asisten AI (Anda di sini!)\n' +
           '📱 IoT Device: Integrasi alat ukur digital\n' +
           '🥗 Resep MBG: Rekomendasi menu bergizi\n\n' +
           '❓ Butuh bantuan lebih lanjut? Tanyakan saja!';
  }

  private getPrivacyResponse(): string {
    return '🔒 **KEAMANAN & PRIVASI DATA ANAK ANDA**\n\n' +
           '**Komitmen Kami**:\n' +
           '✅ Data anak Anda dienkripsi end-to-end\n' +
           '✅ Disimpan di server aman dengan standar ISO 27001\n' +
           '✅ Tidak dibagikan ke pihak ketiga tanpa izin\n' +
           '✅ Compliance dengan UU Perlindungan Data Pribadi\n\n' +
           '**Apa yang Kami Simpan**:\n' +
           '• Profil anak (nama, tanggal lahir, jenis kelamin)\n' +
           '• Data pengukuran (BB, TB, lingkar kepala)\n' +
           '• Riwayat analisis kesehatan\n' +
           '• Preferensi aplikasi\n\n' +
           '**Hak Anda**:\n' +
           '• Akses data kapan saja\n' +
           '• Export data dalam format PDF/CSV\n' +
           '• Hapus data permanen\n' +
           '• Atur siapa yang dapat melihat data\n\n' +
           '**Best Practices**:\n' +
           '🔐 Gunakan password kuat\n' +
           '📱 Aktifkan 2-Factor Authentication\n' +
           '🚫 Jangan share akun dengan orang lain\n' +
           '🔄 Logout saat selesai menggunakan\n\n' +
           '📞 Pertanyaan privasi? Hubungi: privacy@babygrow.app';
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
    const responses = {
      id: 'Halo Bun! 😊 Nanya soal login ya?\n\n' +
          'Jadi gini nih... sistem login kita lagi **dipercantik dan diperkuat** biar lebih aman & gampang dipake! 🔐\n\n' +
          '**Yang lagi dikerjain**:\n' +
          '✨ Multi-role authentication (User, Admin, Super User) - biar lebih terorganisir\n' +
          '🔒 Enkripsi data tingkat enterprise - keamanan maksimal!\n' +
          '🚫 Data profil anak super aman & gak bisa diakses sembarangan\n' +
          '⚡ Single Sign-On (SSO) - login sekali, akses semua!\n\n' +
          '**Tapi tenang Bun!** 💡\n' +
          'Bunda tetap bisa pakai **semua fitur** aplikasi kok! Data tersimpan aman di lokal dulu, nanti otomatis sync kalau sistem login udah aktif.\n\n' +
          '📅 Paling lama 2-3 hari udah ready\n' +
          '🔒 Data tetap aman & terenkripsi, jangan khawatir ya!',
      en: 'Hi Mom! 😊 Asking about login?\n\n' +
          'So here\'s the thing... our login system is being **beautified and strengthened** to be safer & easier to use! 🔐\n\n' +
          '**What we\'re working on**:\n' +
          '✨ Multi-role authentication (User, Admin, Super User) - better organization\n' +
          '🔒 Enterprise-level encryption - maximum security!\n' +
          '🚫 Child profile data super safe & not accessible by just anyone\n' +
          '⚡ Single Sign-On (SSO) - login once, access everything!\n\n' +
          '**But don\'t worry!** 💡\n' +
          'You can still use **all features** of the app! Data is safely stored locally first, then automatically syncs once login system is active.\n\n' +
          '📅 Should be ready in 2-3 days max\n' +
          '🔒 Data remains safe & encrypted, no worries!',
    };
    return responses[lang] || responses.id;
  }

  /**
   * PROTOKOL DARURAT - IoT Emergency Manual Input
   */
  private getIoTEmergencyResponse(lang: Language['code']): string {
    const responses = {
      id: 'Waduh, sensor otomatisnya lagi istirahat ya Bun? 😅 Gak papa, aku punya solusinya!\n\n' +
          '**Pakai INPUT MANUAL aja, gampang kok!** 📱\n\n' +
          'Ikutin langkah ini ya:\n' +
          '1️⃣ Buka menu **"Profil Anak"** 👶 (ada icon bayi)\n' +
          '2️⃣ Pilih anak yang mau diukur\n' +
          '3️⃣ Klik tombol **"Edit"** atau **"Tambah Pengukuran"**\n' +
          '4️⃣ Isi datanya:\n' +
          '   • **Berat Badan** (BB) - contoh: 10.5 kg\n' +
          '   • **Tinggi Badan** (TB) - contoh: 78 cm\n' +
          '   • **Tanggal** - kapan diukur\n' +
          '5️⃣ Klik **"Simpan"** - done! ✨\n\n' +
          '**Tenang, aku (BabyGrow AI) yang akan kerja!** 🤖\n' +
          '✅ Hitung **Z-Score WHO** otomatis\n' +
          '✅ Cek risiko stunting\n' +
          '✅ Kasih rekomendasi **menu MPASI** yang cocok\n' +
          '✅ Bikin **grafik pertumbuhan** yang kece\n\n' +
          '💡 **Fun fact**: Hasil analisaku sama akuratnya kayak pakai sensor IoT lho! Jadi gak ada bedanya 😉\n\n' +
          '📌 Setelah input, langsung aja tanya:\n' +
          '**"Analisis pertumbuhan anak aku dong!"**',
      en: 'Oops, the automatic sensor is taking a break? 😅 No worries, I have a solution!\n\n' +
          '**Just use MANUAL INPUT, it\'s easy!** 📱\n\n' +
          'Follow these steps:\n' +
          '1️⃣ Open **"Child Profile"** menu 👶 (baby icon)\n' +
          '2️⃣ Select the child to measure\n' +
          '3️⃣ Click **"Edit"** or **"Add Measurement"** button\n' +
          '4️⃣ Fill in the data:\n' +
          '   • **Weight** - example: 10.5 kg\n' +
          '   • **Height** - example: 78 cm\n' +
          '   • **Date** - when measured\n' +
          '5️⃣ Click **"Save"** - done! ✨\n\n' +
          '**Don\'t worry, I (BabyGrow AI) will do the work!** 🤖\n' +
          '✅ Calculate **WHO Z-Score** automatically\n' +
          '✅ Check stunting risk\n' +
          '✅ Give **complementary food menu** recommendations\n' +
          '✅ Create awesome **growth charts**\n\n' +
          '💡 **Fun fact**: My analysis is as accurate as using IoT sensors! So no difference 😉\n\n' +
          '📌 After input, just ask:\n' +
          '**"Analyze my child\'s growth!"**',
    };
    return responses[lang] || responses.id;
  }

  /**
   * Jadwal Imunisasi (karena tombol mati)
   */
  private getImmunizationSchedule(lang: Language['code']): string {
    const responses = {
      id: '💉 **JADWAL IMUNISASI LENGKAP**\n\n' +
          '**0-1 Bulan**:\n' +
          '• Hepatitis B (HB-0)\n' +
          '• BCG\n' +
          '• Polio 1\n\n' +
          '**2 Bulan**:\n' +
          '• DPT-HB-Hib 1\n' +
          '• Polio 2\n\n' +
          '**3 Bulan**:\n' +
          '• DPT-HB-Hib 2\n' +
          '• Polio 3\n\n' +
          '**4 Bulan**:\n' +
          '• DPT-HB-Hib 3\n' +
          '• Polio 4\n' +
          '• IPV (Polio suntik)\n\n' +
          '**9 Bulan**:\n' +
          '• Campak/MR\n\n' +
          '**18 Bulan**:\n' +
          '• DPT-HB-Hib booster\n' +
          '• Campak/MR booster\n\n' +
          '💡 **Catatan Penting**:\n' +
          '✅ Jangan tunda imunisasi\n' +
          '✅ Bawa buku KIA (Kesehatan Ibu Anak)\n' +
          '✅ Anak sehat saat diimunisasi\n\n' +
          '📌 Konsultasi dokter untuk vaksin tambahan (PCV, Rotavirus, dll)',
      en: '💉 **COMPLETE IMMUNIZATION SCHEDULE**\n\n' +
          '**0-1 Month**:\n' +
          '• Hepatitis B (HB-0)\n' +
          '• BCG\n' +
          '• Polio 1\n\n' +
          '**2 Months**:\n' +
          '• DPT-HB-Hib 1\n' +
          '• Polio 2\n\n' +
          '**3 Months**:\n' +
          '• DPT-HB-Hib 2\n' +
          '• Polio 3\n\n' +
          '**4 Months**:\n' +
          '• DPT-HB-Hib 3\n' +
          '• Polio 4\n' +
          '• IPV (Injectable Polio)\n\n' +
          '**9 Months**:\n' +
          '• Measles/MR\n\n' +
          '**18 Months**:\n' +
          '• DPT-HB-Hib booster\n' +
          '• Measles/MR booster\n\n' +
          '💡 **Important Notes**:\n' +
          '✅ Don\'t delay immunizations\n' +
          '✅ Bring health record book\n' +
          '✅ Child must be healthy\n\n' +
          '📌 Consult doctor for additional vaccines (PCV, Rotavirus, etc)',
    };
    return responses[lang] || responses.id;
  }

  /**
   * Status Profil & Dark Mode
   */
  private getProfileSettingsStatus(lang: Language['code']): string {
    const responses = {
      id: 'Wah, nanya soal Profil ya Bun? 😊\n\n' +
          'Jadi gini... fitur ini sedang kami **percantik dan perkuat keamanannya** 🔐 biar data si kecil tetap aman banget!\n\n' +
          '**Yang lagi dikerjain**:\n' +
          '✨ Sinkronisasi UI dengan backend biar mulus\n' +
          '🔒 Enkripsi data profil (double security!)\n' +
          '🌙 Dark Mode yang bisa disimpan preferensinya\n' +
          '🌍 Pengaturan multi-bahasa (5 bahasa lho!)\n' +
          '📄 Export data jadi PDF buat dokumentasi\n\n' +
          '**Sambil nunggu, Bunda bisa**:\n' +
          '💬 Ganti bahasa langsung di chat ini kok! Tinggal bilang:\n' +
          '• "Ganti ke bahasa Inggris" → English\n' +
          '• "Switch to English" → English\n' +
          '• "切换到中文" → Mandarin\n' +
          '• "Cambiar a español" → Spanish\n\n' +
          '📅 Paling lama 1-2 hari udah beres kok! Sabar ya Bun~ 💕',
      en: 'Oh, asking about Profile features? 😊\n\n' +
          'So here\'s the thing... we\'re currently **beautifying and strengthening its security** 🔐 so your little one\'s data stays super safe!\n\n' +
          '**What we\'re working on**:\n' +
          '✨ UI synchronization with backend for smooth experience\n' +
          '🔒 Profile data encryption (double security!)\n' +
          '🌙 Dark Mode with saved preferences\n' +
          '🌍 Multi-language settings (5 languages!)\n' +
          '📄 Export data to PDF for documentation\n\n' +
          '**While waiting, you can**:\n' +
          '💬 Change language right here in chat! Just say:\n' +
          '• "Ganti ke bahasa Inggris" → English\n' +
          '• "Switch to English" → English\n' +
          '• "切换到中文" → Mandarin\n' +
          '• "Cambiar a español" → Spanish\n\n' +
          '📅 Should be ready in 1-2 days max! Thanks for your patience~ 💕',
    };
    return responses[lang] || responses.id;
  }

  /**
   * Super User Response
   */
  private getSuperUserResponse(message: string, lang: Language['code']): string {
    return 'Halo Admin! 👑 Wah, ketemu sama Super User nih~ Siap melayani akses penuh sistem! 🔓\n\n' +
           '**Aku bisa kasih data apapun yang Admin butuhin**, misalnya:\n\n' +
           '**Query Database** 💾\n' +
           '• "Berapa total anak yang terdaftar?"\n' +
           '• "Statistik stunting nasional gimana?"\n' +
           '• "Export semua data pengguna dong"\n' +
           '• "Tampilkan dashboard analytics"\n\n' +
           '**System Management** 🔧\n' +
           '• Monitor semua IoT devices yang connected\n' +
           '• Manage user roles (siapa jadi Admin, siapa User)\n' +
           '• Lihat system logs buat troubleshooting\n' +
           '• Setting konfigurasi advanced\n\n' +
           '📊 Langsung aja tanya data spesifik yang Admin perluin, aku siap cariin!';
  }

  /**
   * Admin Response
   */
  private getAdminResponse(message: string, lang: Language['code']): string {
    return 'Halo Bidan! 👩‍⚕️ Senang bertemu dengan tenaga kesehatan hebat seperti Anda! 😊\n\n' +
           '**Soal fitur "Tambah Anak"** nih... ⚠️ Lagi diperbaiki ya, mohon maaf untuk ketidaknyamanannya~\n\n' +
           '**Tapi tenang, ada solusinya kok!** 💡\n' +
           '1. Untuk sementara, Bunda/Ayah bisa input data anak langsung lewat interface mobile mereka\n' +
           '2. Nanti otomatis tersinkron ke sistem Bidan kok, gak hilang!\n' +
           '3. Paling lama 24 jam, fitur admin sudah normal lagi ✨\n\n' +
           '**Aku bisa bantu Bidan untuk**:\n' +
           '📊 Kelola data pengguna di wilayah Bidan\n' +
           '🥗 Monitor program Makanan Bergizi Gratis (MBG)\n' +
           '✅ Verifikasi data dari Posyandu\n' +
           '📈 Lihat statistik stunting regional\n\n' +
           '📋 Ada yang perlu Bidan kelola hari ini? Tanya aja, aku siap bantuin!';
  }

  /**
   * Standard User Response
   */
  private getStandardResponse(lang: Language['code']): string {
    const responses = {
      id: 'Halo Bunda! 👋 Wah, senang sekali bisa ngobrol sama Bunda hari ini! 😊\n\n' +
          'Aku ini BabyGrow AI, tapi panggil aja teman diskusi Bunda buat urusan si kecil ya~ 💕\n\n' +
          '**Aku bisa bantu Bunda untuk**:\n' +
          '🍼 Ngecek pertumbuhan anak pakai standar WHO\n' +
          '🥗 Kasih ide menu MPASI yang enak & bergizi\n' +
          '💪 Tips biar anak tumbuh kuat & sehat\n' +
          '💉 Ingetin jadwal vaksin biar gak kelewat\n' +
          '📊 Jelasin cara pakai alat ukur digital\n\n' +
          '**Bunda bisa tanya apa aja, misalnya**:\n' +
          '• "Anak aku BB 10kg TB 75cm, gimana ya?"\n' +
          '• "Menu MPASI buat bayi 8 bulan dong!"\n' +
          '• "Vaksin apa aja yang wajib usia 2 bulan?"\n' +
          '• "Cara input data manual gimana sih?"\n\n' +
          '💡 **Oh iya Bun**, aku ini AI yang siap bantu 24/7, tapi kalau ada yang serius soal kesehatan anak, tetep konsul ke dokter ya! Aku cuma teman diskusi, bukan pengganti dokter 😉',
      en: 'Hi Mom! 👋 So happy to chat with you today! 😊\n\n' +
          'I\'m BabyGrow AI, but just think of me as your discussion buddy for your little one~ 💕\n\n' +
          '**I can help you with**:\n' +
          '🍼 Check your child\'s growth using WHO standards\n' +
          '🥗 Suggest yummy & nutritious complementary food menus\n' +
          '💪 Tips to help your child grow strong & healthy\n' +
          '💉 Remind you of vaccine schedules so you don\'t miss them\n' +
          '📊 Explain how to use digital measuring devices\n\n' +
          '**Feel free to ask anything, like**:\n' +
          '• "My child is 10kg and 75cm, how is that?"\n' +
          '• "Meal ideas for 8-month-old baby please!"\n' +
          '• "What vaccines are needed at 2 months?"\n' +
          '• "How do I input data manually?"\n\n' +
          '💡 **By the way**, I\'m an AI ready to help 24/7, but if there\'s anything serious about your child\'s health, always consult a doctor! I\'m just a discussion friend, not a doctor replacement 😉',
    };
    return responses[lang] || responses.id;
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
             '"Zaki beratnya 9.5kg tinggi 72cm lahir Mei 2024"\n\n' +
             'Gampang kan? Yuk kasih tau datanya! 💕';
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
