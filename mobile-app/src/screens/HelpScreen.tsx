/**
 * Help & FAQ Screen - Panduan Multi-Bahasa
 * Visual: Parent FAQ (desainuiux.md)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Button, ScreenHeader } from '../components/common';
import { useAuth } from '../store/authStore';

type Language = 'id' | 'en' | 'zh' | 'ar' | 'ja';

interface HelpContent {
  title: string;
  subtitle: string;
  howToUse: string;
  features: {
    title: string;
    items: { text: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'] }[];
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
    howToUse:
      'Cara menggunakan BabyGrow: Masukkan data anak, pantau grafik, dan cek jadwal vaksin.',
    features: {
      title: 'Fitur Utama',
      items: [
        { text: 'Grafik Pertumbuhan - Monitor berat & tinggi badan', icon: 'chart-line' },
        { text: 'AI Analisis - Deteksi risiko stunting otomatis', icon: 'robot-outline' },
        { text: 'Jadwal Imunisasi - Pengingat vaksin lengkap', icon: 'needle' },
        { text: 'IoT Device - Ukur otomatis dengan timbangan digital', icon: 'bluetooth' },
        { text: 'Resep Bergizi - Rekomendasi makanan sehat', icon: 'food-apple' },
      ],
    },
    faq: [
      {
        question: 'Bagaimana cara menambah data anak?',
        answer:
          'Buka menu Anak → tombol + → isi nama, tanggal lahir, jenis kelamin. Isi juga tinggi & golongan darah orang tua bila ada agar perhitungan pertumbuhan lebih lengkap.',
      },
      {
        question: 'Bagaimana cara menyambungkan alat ukur?',
        answer:
          'Nyalakan alat, aktifkan Bluetooth HP, lalu di Beranda ketuk Ukur Otomatis. Tunggu hingga terhubung. Bluetooth = sambungan dekat ke alat; internet dipakai untuk menyimpan data ke akun.',
      },
      {
        question: 'Apakah data saya aman?',
        answer:
          'Ya. Data tersimpan di akun Anda dengan login aman. Jangan bagikan kata sandi.',
      },
      {
        question: 'Bagaimana cara input berat dan tinggi badan?',
        answer:
          'Pilih anak → Ukur Manual, atau pakai alat pintar / kamera AI. Aplikasi menghitung status menurut standar WHO otomatis.',
      },
      {
        question: 'Apakah AI bisa menggantikan dokter?',
        answer:
          'Tidak. AI dan kamera hanya alat bantu monitoring. Untuk diagnosis tetap konsultasi dokter atau petugas kesehatan.',
      },
    ],
    support:
      'Butuh bantuan lebih? Hubungi support@babygrow.app atau chat dengan AI Assistant',
  },
  en: {
    title: 'Help & FAQ',
    subtitle: 'Complete BabyGrow Guide',
    howToUse:
      'How to use BabyGrow: Input child data, monitor growth charts, and check vaccine schedules.',
    features: {
      title: 'Main Features',
      items: [
        { text: 'Growth Charts - Monitor weight & height', icon: 'chart-line' },
        { text: 'AI Analysis - Automatic stunting risk detection', icon: 'robot-outline' },
        { text: 'Immunization Schedule - Complete vaccine reminders', icon: 'needle' },
        { text: 'IoT Device - Auto-measure with digital scale', icon: 'bluetooth' },
        { text: 'Nutritious Recipes - Healthy food recommendations', icon: 'food-apple' },
      ],
    },
    faq: [
      {
        question: 'How to add child data?',
        answer:
          'Open "Children" menu → Click "+" button → Fill form (name, birthdate, gender) → Save',
      },
      {
        question: 'Is my data secure?',
        answer:
          'Yes! All data is end-to-end encrypted and stored on ISO 27001 certified servers.',
      },
      {
        question: 'How to input weight and height?',
        answer:
          'Select child → Click "Edit" or "Measure Now" → Enter weight (kg) and height (cm) → AI analyzes automatically',
      },
      {
        question: 'Can AI replace doctors?',
        answer:
          'No. AI is a monitoring tool. For diagnosis and treatment, always consult with a doctor.',
      },
    ],
    support:
      'Need more help? Contact support@babygrow.app or chat with AI Assistant',
  },
  zh: {
    title: '帮助与常见问题',
    subtitle: 'BabyGrow 完整指南',
    howToUse:
      '如何使用 BabyGrow：输入儿童数据、监测增长图表并查看疫苗接种计划。',
    features: {
      title: '主要功能',
      items: [
        { text: '生长图表 - 监测体重和身高', icon: 'chart-line' },
        { text: 'AI 分析 - 自动检测发育迟缓风险', icon: 'robot-outline' },
        { text: '免疫接种时间表 - 完整的疫苗提醒', icon: 'needle' },
        { text: '物联网设备 - 使用数字秤自动测量', icon: 'bluetooth' },
        { text: '营养食谱 - 健康食品推荐', icon: 'food-apple' },
      ],
    },
    faq: [
      {
        question: '如何添加儿童数据？',
        answer:
          '打开"儿童"菜单 → 点击"+"按钮 → 填写表格（姓名、出生日期、性别）→ 保存',
      },
      {
        question: '我的数据安全吗？',
        answer:
          '是的！所有数据都采用端到端加密，并存储在 ISO 27001 认证服务器上。',
      },
      {
        question: '如何输入体重和身高？',
        answer:
          '选择儿童 → 点击"编辑"或"立即测量" → 输入体重（公斤）和身高（厘米）→ AI 自动分析',
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
    howToUse:
      'كيفية استخدام BabyGrow: أدخل بيانات الطفل، وراقب مخططات النمو، وتحقق من جداول اللقاحات.',
    features: {
      title: 'الميزات الرئيسية',
      items: [
        { text: 'مخططات النمو - مراقبة الوزن والطول', icon: 'chart-line' },
        {
          text: 'تحليل الذكاء الاصطناعي - الكشف التلقائي عن مخاطر التقزم',
          icon: 'robot-outline',
        },
        { text: 'جدول التطعيم - تذكيرات اللقاحات الكاملة', icon: 'needle' },
        { text: 'جهاز إنترنت الأشياء - القياس التلقائي بالميزان الرقمي', icon: 'bluetooth' },
        { text: 'وصفات مغذية - توصيات الطعام الصحي', icon: 'food-apple' },
      ],
    },
    faq: [
      {
        question: 'كيفية إضافة بيانات الطفل؟',
        answer:
          'افتح قائمة "الأطفال" → انقر على زر "+" → املأ النموذج (الاسم، تاريخ الميلاد، الجنس) → احفظ',
      },
      {
        question: 'هل بياناتي آمنة؟',
        answer:
          'نعم! جميع البيانات مشفرة من طرف إلى طرف ومخزنة على خوادم معتمدة من ISO 27001.',
      },
      {
        question: 'كيفية إدخال الوزن والطول؟',
        answer:
          'اختر الطفل → انقر على "تحرير" أو "القياس الآن" → أدخل الوزن (كجم) والطول (سم) → سيحلل الذكاء الاصطناعي تلقائيًا',
      },
      {
        question: 'هل يمكن للذكاء الاصطناعي استبدال الأطباء؟',
        answer:
          'لا. الذكاء الاصطناعي هو أداة مراقبة. للتشخيص والعلاج، استشر دائمًا الطبيب.',
      },
    ],
    support:
      'هل تحتاج المزيد من المساعدة؟ اتصل بـ support@babygrow.app أو تحدث مع مساعد الذكاء الاصطناعي',
  },
  ja: {
    title: 'ヘルプとFAQ',
    subtitle: 'BabyGrow 完全ガイド',
    howToUse:
      'BabyGrow の使い方：子供のデータを入力し、成長チャートを監視し、ワクチン接種スケジュールを確認します。',
    features: {
      title: '主な機能',
      items: [
        { text: '成長チャート - 体重と身長を監視', icon: 'chart-line' },
        { text: 'AI分析 - 発育不全リスクの自動検出', icon: 'robot-outline' },
        { text: '予防接種スケジュール - 完全なワクチンリマインダー', icon: 'needle' },
        { text: 'IoTデバイス - デジタルスケールで自動測定', icon: 'bluetooth' },
        { text: '栄養レシピ - 健康的な食品の推奨', icon: 'food-apple' },
      ],
    },
    faq: [
      {
        question: '子供のデータを追加する方法は？',
        answer:
          '「子供」メニューを開く → 「+」ボタンをクリック → フォームに記入（名前、生年月日、性別）→ 保存',
      },
      {
        question: '私のデータは安全ですか？',
        answer:
          'はい！すべてのデータはエンドツーエンドで暗号化され、ISO 27001 認定サーバーに保存されます。',
      },
      {
        question: '体重と身長を入力する方法は？',
        answer:
          '子供を選択 → 「編集」または「今すぐ測定」をクリック → 体重（kg）と身長（cm）を入力 → AIが自動分析',
      },
      {
        question: 'AIは医師の代わりになりますか？',
        answer:
          'いいえ。AIは監視ツールです。診断と治療については、常に医師に相談してください。',
      },
    ],
    support:
      'さらにサポートが必要ですか？ support@babygrow.app に連絡するか、AIアシスタントとチャットしてください',
  },
};

const LANGUAGES = [
  { code: 'id' as Language, label: 'Indonesia' },
  { code: 'en' as Language, label: 'English' },
  { code: 'zh' as Language, label: '中文' },
  { code: 'ar' as Language, label: 'العربية' },
  { code: 'ja' as Language, label: '日本語' },
];

export default function HelpScreen({ navigation }: any) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('id');
  const content = HELP_CONTENT[selectedLanguage];
  const { isAuthenticated } = useAuth();

  const openAi = () => {
    if (!isAuthenticated) {
      Alert.alert('Login dulu', 'AI Assistant tersedia setelah login.');
      return;
    }
    navigation.navigate('AIAssistant');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader
        title={content.title}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Parent FAQ</Text>
          <Text style={styles.heroBody}>{content.subtitle}</Text>
        </View>

        <View style={styles.languageCard}>
          <Text style={styles.languageTitle}>Pilih Bahasa</Text>
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
                <Text
                  style={[
                    styles.languageLabel,
                    selectedLanguage === lang.code &&
                      styles.languageLabelActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionEyebrow}>Knowledge Base</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>{content.howToUse}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.features.title}</Text>
          {content.features.items.map((item, index) => (
            <View key={index} style={styles.featureItem}>
              <MaterialCommunityIcons
                name={item.icon}
                size={20}
                color={colors.primary.main}
              />
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAQ</Text>
          {content.faq.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <View style={styles.faqTop}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={colors.primary.main}
                />
              </View>
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.supportCard}>
          <View style={styles.supportIconWrap}>
            <MaterialCommunityIcons
              name="headset"
              size={28}
              color={colors.primary.onPrimary}
            />
          </View>
          <Text style={styles.supportHeading}>Still have questions?</Text>
          <Text style={styles.supportText}>{content.support}</Text>
          <Button
            title="Chat dengan AI"
            onPress={openAi}
            size="large"
            icon={
              <MaterialCommunityIcons
                name="robot-outline"
                size={18}
                color={colors.primary.onPrimary}
              />
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 90,
  },
  hero: { marginBottom: spacing.lg },
  heroTitle: {
    ...typography.styles.displayLg,
    fontSize: 32,
    lineHeight: 40,
    color: colors.text.onSurface,
    marginBottom: spacing.sm,
  },
  heroBody: {
    ...typography.styles.bodyMd,
    color: colors.text.onSurfaceVariant,
    maxWidth: '90%',
  },
  languageCard: {
    backgroundColor: colors.surface.lowest,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.diffusion,
  },
  languageTitle: {
    ...typography.styles.labelCaps,
    color: colors.text.secondary,
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
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border.divider,
    backgroundColor: colors.surface.lowest,
  },
  languageButtonActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.fixed,
  },
  languageLabel: {
    ...typography.styles.buttonText,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  languageLabelActive: {
    color: colors.primary.main,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionEyebrow: {
    ...typography.styles.labelCaps,
    color: colors.primary.main,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.styles.headlineLgMobile,
    fontSize: 20,
    color: colors.text.onSurface,
    marginBottom: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.surface.lowest,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.diffusion,
  },
  infoText: {
    ...typography.styles.bodyMd,
    color: colors.text.onSurface,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface.lowest,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
    ...shadows.diffusion,
  },
  featureText: {
    flex: 1,
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.onSurface,
  },
  faqItem: {
    backgroundColor: colors.surface.lowest,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
    ...shadows.diffusion,
  },
  faqTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  faqQuestion: {
    flex: 1,
    ...typography.styles.headlineLgMobile,
    fontSize: 18,
    color: colors.text.onSurface,
  },
  faqAnswer: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.onSurfaceVariant,
  },
  supportCard: {
    backgroundColor: 'rgba(182, 0, 89, 0.05)',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginTop: spacing.section,
    alignItems: 'center',
    gap: spacing.sm,
  },
  supportIconWrap: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.diffusion,
  },
  supportHeading: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
    textAlign: 'center',
  },
  supportText: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});
