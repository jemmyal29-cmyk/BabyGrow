/**
 * Help & FAQ Screen - Panduan Multi-Bahasa
 * 5 Languages: Indonesian, English, Mandarin, Arabic, Japanese
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius } from '../theme';

type Language = 'id' | 'en' | 'zh' | 'ar' | 'ja';

interface HelpContent {
  title: string;
  subtitle: string;
  howToUse: string;
  features: {
    title: string;
    items: string[];
  };
  faq: {
    question: string;
    answer: string;
  }[];
  support: string;
}

const HELP_CONTENT: Record<Language, HelpContent> = {
  id: {
    title: 'Bantuan & FAQ',
    subtitle: 'Panduan Lengkap BabyGrow',
    howToUse: 'Cara menggunakan BabyGrow: Masukkan data anak, pantau grafik, dan cek jadwal vaksin.',
    features: {
      title: 'Fitur Utama',
      items: [
        '📊 Grafik Pertumbuhan - Monitor berat & tinggi badan',
        '🤖 AI Analisis - Deteksi risiko stunting otomatis',
        '💉 Jadwal Imunisasi - Pengingat vaksin lengkap',
        '📱 IoT Device - Ukur otomatis dengan timbangan digital',
        '🥗 Resep Bergizi - Rekomendasi makanan sehat',
      ],
    },
    faq: [
      {
        question: 'Bagaimana cara menambah data anak?',
        answer: 'Buka menu "Anak" → Klik tombol "+" → Isi formulir (nama, tanggal lahir, jenis kelamin) → Simpan',
      },
      {
        question: 'Apakah data saya aman?',
        answer: 'Ya! Semua data dienkripsi end-to-end dan tersimpan di server bersertifikat ISO 27001.',
      },
      {
        question: 'Bagaimana cara input berat dan tinggi badan?',
        answer: 'Pilih anak → Klik "Edit" atau "Ukur Sekarang" → Masukkan BB (kg) dan TB (cm) → AI akan analisis otomatis',
      },
      {
        question: 'Apakah AI bisa menggantikan dokter?',
        answer: 'Tidak. AI adalah alat bantu monitoring. Untuk diagnosis dan pengobatan, tetap konsultasi dengan dokter.',
      },
    ],
    support: 'Butuh bantuan lebih? Hubungi support@babygrow.app atau chat dengan AI Assistant',
  },
  en: {
    title: 'Help & FAQ',
    subtitle: 'Complete BabyGrow Guide',
    howToUse: 'How to use BabyGrow: Input child data, monitor growth charts, and check vaccine schedules.',
    features: {
      title: 'Main Features',
      items: [
        '📊 Growth Charts - Monitor weight & height',
        '🤖 AI Analysis - Automatic stunting risk detection',
        '💉 Immunization Schedule - Complete vaccine reminders',
        '📱 IoT Device - Auto-measure with digital scale',
        '🥗 Nutritious Recipes - Healthy food recommendations',
      ],
    },
    faq: [
      {
        question: 'How to add child data?',
        answer: 'Open "Children" menu → Click "+" button → Fill form (name, birthdate, gender) → Save',
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes! All data is end-to-end encrypted and stored on ISO 27001 certified servers.',
      },
      {
        question: 'How to input weight and height?',
        answer: 'Select child → Click "Edit" or "Measure Now" → Enter weight (kg) and height (cm) → AI analyzes automatically',
      },
      {
        question: 'Can AI replace doctors?',
        answer: 'No. AI is a monitoring tool. For diagnosis and treatment, always consult with a doctor.',
      },
    ],
    support: 'Need more help? Contact support@babygrow.app or chat with AI Assistant',
  },
  zh: {
    title: '帮助与常见问题',
    subtitle: 'BabyGrow 完整指南',
    howToUse: '如何使用 BabyGrow：输入儿童数据、监测增长图表并查看疫苗接种计划。',
    features: {
      title: '主要功能',
      items: [
        '📊 生长图表 - 监测体重和身高',
        '🤖 AI 分析 - 自动检测发育迟缓风险',
        '💉 免疫接种时间表 - 完整的疫苗提醒',
        '📱 物联网设备 - 使用数字秤自动测量',
        '🥗 营养食谱 - 健康食品推荐',
      ],
    },
    faq: [
      {
        question: '如何添加儿童数据？',
        answer: '打开"儿童"菜单 → 点击"+"按钮 → 填写表格（姓名、出生日期、性别）→ 保存',
      },
      {
        question: '我的数据安全吗？',
        answer: '是的！所有数据都采用端到端加密，并存储在 ISO 27001 认证服务器上。',
      },
      {
        question: '如何输入体重和身高？',
        answer: '选择儿童 → 点击"编辑"或"立即测量" → 输入体重（公斤）和身高（厘米）→ AI 自动分析',
      },
      {
        question: 'AI 能代替医生吗？',
        answer: '不能。AI 是监测工具。对于诊断和治疗，请务必咨询医生。',
      },
    ],
    support: '需要更多帮助？请联系 support@babygrow.app 或与 AI 助手聊天',
  },
  ar: {
    title: 'المساعدة والأسئلة الشائعة',
    subtitle: 'دليل BabyGrow الكامل',
    howToUse: 'كيفية استخدام BabyGrow: أدخل بيانات الطفل، وراقب مخططات النمو، وتحقق من جداول اللقاحات.',
    features: {
      title: 'الميزات الرئيسية',
      items: [
        '📊 مخططات النمو - مراقبة الوزن والطول',
        '🤖 تحليل الذكاء الاصطناعي - الكشف التلقائي عن مخاطر التقزم',
        '💉 جدول التطعيم - تذكيرات اللقاحات الكاملة',
        '📱 جهاز إنترنت الأشياء - القياس التلقائي بالميزان الرقمي',
        '🥗 وصفات مغذية - توصيات الطعام الصحي',
      ],
    },
    faq: [
      {
        question: 'كيفية إضافة بيانات الطفل؟',
        answer: 'افتح قائمة "الأطفال" → انقر على زر "+" → املأ النموذج (الاسم، تاريخ الميلاد، الجنس) → احفظ',
      },
      {
        question: 'هل بياناتي آمنة؟',
        answer: 'نعم! جميع البيانات مشفرة من طرف إلى طرف ومخزنة على خوادم معتمدة من ISO 27001.',
      },
      {
        question: 'كيفية إدخال الوزن والطول؟',
        answer: 'اختر الطفل → انقر على "تحرير" أو "القياس الآن" → أدخل الوزن (كجم) والطول (سم) → سيحلل الذكاء الاصطناعي تلقائيًا',
      },
      {
        question: 'هل يمكن للذكاء الاصطناعي استبدال الأطباء؟',
        answer: 'لا. الذكاء الاصطناعي هو أداة مراقبة. للتشخيص والعلاج، استشر دائمًا الطبيب.',
      },
    ],
    support: 'هل تحتاج المزيد من المساعدة؟ اتصل بـ support@babygrow.app أو تحدث مع مساعد الذكاء الاصطناعي',
  },
  ja: {
    title: 'ヘルプとFAQ',
    subtitle: 'BabyGrow 完全ガイド',
    howToUse: 'BabyGrow の使い方：子供のデータを入力し、成長チャートを監視し、ワクチン接種スケジュールを確認します。',
    features: {
      title: '主な機能',
      items: [
        '📊 成長チャート - 体重と身長を監視',
        '🤖 AI分析 - 発育不全リスクの自動検出',
        '💉 予防接種スケジュール - 完全なワクチンリマインダー',
        '📱 IoTデバイス - デジタルスケールで自動測定',
        '🥗 栄養レシピ - 健康的な食品の推奨',
      ],
    },
    faq: [
      {
        question: '子供のデータを追加する方法は？',
        answer: '「子供」メニューを開く → 「+」ボタンをクリック → フォームに記入（名前、生年月日、性別）→ 保存',
      },
      {
        question: '私のデータは安全ですか？',
        answer: 'はい！すべてのデータはエンドツーエンドで暗号化され、ISO 27001 認定サーバーに保存されます。',
      },
      {
        question: '体重と身長を入力する方法は？',
        answer: '子供を選択 → 「編集」または「今すぐ測定」をクリック → 体重（kg）と身長（cm）を入力 → AIが自動分析',
      },
      {
        question: 'AIは医師の代わりになりますか？',
        answer: 'いいえ。AIは監視ツールです。診断と治療については、常に医師に相談してください。',
      },
    ],
    support: 'さらにサポートが必要ですか？ support@babygrow.app に連絡するか、AIアシスタントとチャットしてください',
  },
};

const LANGUAGES = [
  { code: 'id' as Language, label: '🇮🇩 Indonesia', name: 'Bahasa Indonesia' },
  { code: 'en' as Language, label: '🇬🇧 English', name: 'English' },
  { code: 'zh' as Language, label: '🇨🇳 中文', name: 'Mandarin' },
  { code: 'ar' as Language, label: '🇸🇦 العربية', name: 'Arabic' },
  { code: 'ja' as Language, label: '🇯🇵 日本語', name: 'Japanese' },
];

export default function HelpScreen({ navigation }: any) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('id');
  const content = HELP_CONTENT[selectedLanguage];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{content.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Selector */}
        <View style={styles.languageCard}>
          <Text style={styles.languageTitle}>🌐 Pilih Bahasa / Select Language</Text>
          <View style={styles.languageGrid}>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageButton,
                  selectedLanguage === lang.code && styles.languageButtonActive,
                ]}
                onPress={() => setSelectedLanguage(lang.code)}
              >
                <Text style={[
                  styles.languageLabel,
                  selectedLanguage === lang.code && styles.languageLabelActive,
                ]}>
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* How to Use */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 {content.subtitle}</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>{content.howToUse}</Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.features.title}</Text>
          {content.features.items.map((item, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ FAQ</Text>
          {content.faq.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        {/* Support */}
        <View style={styles.supportCard}>
          <Text style={styles.supportIcon}>💬</Text>
          <Text style={styles.supportText}>{content.support}</Text>
          <TouchableOpacity 
            style={styles.aiButton}
            onPress={() => navigation.navigate('AIAssistant')}
            activeOpacity={0.7}
          >
            <Text style={styles.aiButtonText}>🤖 Chat dengan AI</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary.main,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.neutral.white,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  languageCard: {
    backgroundColor: colors.background.paper,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
  },
  languageTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray800,
    marginBottom: spacing.sm,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  languageButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.neutral.gray300,
    backgroundColor: colors.background.paper,
  },
  languageButtonActive: {
    borderColor: colors.primary.main,
    backgroundColor: '#FFF0F5',
  },
  languageLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray700,
  },
  languageLabelActive: {
    color: colors.primary.main,
    fontWeight: typography.fontWeight.semiBold,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray800,
    marginBottom: spacing.sm,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  infoText: {
    fontSize: typography.fontSize.md,
    color: colors.neutral.gray700,
    lineHeight: 22,
  },
  featureItem: {
    backgroundColor: colors.background.paper,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary.main,
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray700,
    lineHeight: 20,
  },
  faqItem: {
    backgroundColor: colors.background.paper,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  faqQuestion: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.neutral.gray800,
    marginBottom: spacing.xs,
  },
  faqAnswer: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray600,
    lineHeight: 20,
  },
  supportCard: {
    backgroundColor: '#FFF0F5',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  supportIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  supportText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray700,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  aiButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  aiButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
});
