/**
 * Guide Screen — panduan awam, tanpa jargon teknis
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';
import { Button, ScreenHeader } from '../components/common';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type GuideBlock = {
  id: string;
  title: string;
  summary: string;
  steps: string[];
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
};

const GUIDES: GuideBlock[] = [
  {
    id: 'start',
    title: 'Mulai Pakai BabyGrow',
    summary: 'Dari daftar sampai siap memantau anak.',
    icon: 'rocket-launch-outline',
    steps: [
      'Daftar akun orang tua, atau masuk jika sudah punya akun.',
      'Setelah masuk, tambahkan data anak di menu Anak.',
      'Isi juga tinggi & golongan darah orang tua bila ada — membantu perkiraan pertumbuhan.',
      'Catat pengukuran pertama: manual, alat pintar, atau kamera AI.',
    ],
  },
  {
    id: 'child',
    title: 'Data Anak & Orang Tua',
    summary: 'Apa saja yang perlu diisi.',
    icon: 'account-child',
    steps: [
      'Buka Anak → tombol + → isi nama, tanggal lahir, jenis kelamin.',
      'Opsional: berat & tinggi saat lahir.',
      'Isi tinggi ayah & ibu untuk perkiraan tinggi dewasa anak.',
      'Isi golongan darah orang tua untuk melihat kemungkinan golongan darah anak.',
    ],
  },
  {
    id: 'measure-manual',
    title: 'Ukur Manual (tanpa alat)',
    summary: 'Pakai meteran & timbangan biasa di rumah.',
    icon: 'scale-bathroom',
    steps: [
      'Pilih anak yang akan diukur.',
      'Buka Ukur Manual dari Beranda.',
      'Timbang anak (kg) dan ukur tinggi berdiri/berbaring (cm).',
      'Simpan — aplikasi otomatis menghitung status menurut standar WHO.',
    ],
  },
  {
    id: 'iot',
    title: 'Ukur Otomatis (Alat Pintar)',
    summary: 'Cara menyambungkan alat BabyGrow — bahasa sederhana.',
    icon: 'bluetooth',
    steps: [
      'Siapkan alat BabyGrow dan hidupkan (lampu indikator menyala).',
      'Aktifkan Bluetooth di HP Anda.',
      'Di Beranda, ketuk Ukur Otomatis.',
      'Tunggu hingga HP menemukan alat (biasanya tertulis BabyGrow).',
      'Jika muncul “Terhubung”, letakkan anak di alat sesuai panduan petugas.',
      'Angka tinggi/berat akan muncul di HP. Pastikan anak tenang agar hasil akurat.',
      'Catatan: Bluetooth = sambungan dekat (HP & alat berdekatan). Wi‑Fi/internet dipakai agar data ikut tersimpan ke akun Anda.',
    ],
  },
  {
    id: 'ai-vision',
    title: 'Ukur dengan Kamera (AI Vision)',
    summary: 'Estimasi tinggi dari foto — bantu skrining, bukan pengganti alat ukur.',
    icon: 'camera-outline',
    steps: [
      'Pilih anak aktif di Beranda.',
      'Buka AI Vision, izinkan akses kamera.',
      'Posisikan anak tegak di samping alat ukur / dinding yang jelas.',
      'Ambil foto, tunggu hasil estimasi tinggi.',
      'Simpan jika hasil masuk akal. Untuk keputusan medis, tetap ukur dengan alat standar.',
    ],
  },
  {
    id: 'chart',
    title: 'Membaca Grafik Pertumbuhan',
    summary: 'Pahami kurva WHO dengan mudah.',
    icon: 'chart-line',
    steps: [
      'Buka menu Grafik atau detail anak.',
      'Titik di grafik = hasil pengukuran Anda.',
      'Jika posisi jauh di bawah garis normal, sistem menandai risiko — bawa ke petugas/puskesmas.',
      'Ukur secara berkala agar tren terlihat jelas.',
    ],
  },
  {
    id: 'mbg',
    title: 'Resep MBG (Makanan Bergizi)',
    summary: 'Ide menu lengkap dengan cara memasak.',
    icon: 'food-apple-outline',
    steps: [
      'Buka Resep MBG dari Beranda.',
      'Pilih resep sesuai usia anak.',
      'Ikuti daftar bahan dan langkah memasak berurutan.',
      'Sesuaikan tekstur (halus/cincang) dengan usia anak.',
    ],
  },
  {
    id: 'petugas',
    title: 'Panduan untuk Petugas / Perawat',
    summary: 'Akun petugas puskesmas atau posyandu.',
    icon: 'badge-account-horizontal-outline',
    steps: [
      'Masuk dengan akun petugas yang sudah disiapkan institusi Anda.',
      'Di dashboard, lihat ringkasan balita, pengukuran hari ini, dan risiko stunting.',
      'Cari nama anak atau orang tua, buka detail, bantu ukur di lapangan.',
      'Ekspor data bila diperlukan untuk laporan.',
      'Bantu orang tua menyambungkan alat dan menjelaskan hasil dengan bahasa sederhana.',
    ],
  },
  {
    id: 'akun',
    title: 'Keamanan Akun',
    summary: 'Jaga data keluarga Anda.',
    icon: 'shield-lock-outline',
    steps: [
      'Gunakan kata sandi minimal 8 karakter.',
      'Jika lupa, gunakan Lupa Password di layar masuk.',
      'Jangan bagikan akun petugas kepada orang tua.',
      'Keluar (logout) setelah memakai perangkat bersama.',
    ],
  },
];

const FAQ = [
  {
    q: 'Kenapa tidak bisa masuk setelah daftar?',
    a: 'Cek email untuk tautan konfirmasi (jika diminta). Pastikan email & kata sandi benar. Masih gagal? Hubungi petugas yang mengelola aplikasi di fasilitas Anda.',
  },
  {
    q: 'Apakah perlu internet?',
    a: 'Ya untuk masuk dan menyimpan data ke akun. Beberapa pengukuran bisa menunggu sebentar lalu ikut tersimpan saat HP online kembali.',
  },
  {
    q: 'Apa bedanya Bluetooth dan internet pada alat?',
    a: 'Bluetooth menyambungkan HP ke alat di dekat Anda (seperti earphone). Internet dipakai agar hasil pengukuran ikut tersimpan di akun BabyGrow Anda.',
  },
  {
    q: 'AI Vision sudah akurat?',
    a: 'AI Vision memberi estimasi tinggi dari kamera sebagai bantuan awal. Untuk keputusan klinis, gunakan pengukuran manual atau alat standar bersama petugas kesehatan.',
  },
  {
    q: 'Siapa yang punya akun petugas?',
    a: 'Akun petugas/perawat disiapkan oleh fasilitas kesehatan Anda. Orang tua memakai daftar publik; petugas memakai akun yang diberikan institusi.',
  },
];

export default function GuideScreen({ navigation }: any) {
  const [openId, setOpenId] = useState<string | null>('start');

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  const goBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScreenHeader title="Panduan BabyGrow" onBack={goBack} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Wajib Dibaca</Text>
          </View>
          <Text style={styles.heroTitle}>Cara memakai BabyGrow</Text>
          <Text style={styles.heroBody}>
            Panduan sederhana untuk orang tua dan petugas — tanpa istilah teknis
            yang membingungkan.
          </Text>
        </View>

        {GUIDES.map((g) => {
          const open = openId === g.id;
          return (
            <TouchableOpacity
              key={g.id}
              style={styles.block}
              activeOpacity={0.85}
              onPress={() => toggle(g.id)}
            >
              <View style={styles.blockHead}>
                <View style={styles.blockIcon}>
                  <MaterialCommunityIcons
                    name={g.icon}
                    size={20}
                    color={colors.primary.main}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.blockTitle}>{g.title}</Text>
                  <Text style={styles.blockSummary}>{g.summary}</Text>
                </View>
                <MaterialCommunityIcons
                  name={open ? 'chevron-up' : 'chevron-down'}
                  size={22}
                  color={colors.primary.main}
                />
              </View>
              {open
                ? g.steps.map((s, i) => (
                    <View key={i} style={styles.stepRow}>
                      <Text style={styles.stepNum}>{i + 1}</Text>
                      <Text style={styles.stepText}>{s}</Text>
                    </View>
                  ))
                : null}
            </TouchableOpacity>
          );
        })}

        <Text style={styles.faqTitle}>Pertanyaan Umum</Text>
        {FAQ.map((f) => (
          <View key={f.q} style={styles.faqCard}>
            <Text style={styles.faqQ}>{f.q}</Text>
            <Text style={styles.faqA}>{f.a}</Text>
          </View>
        ))}

        <Button title="Mengerti" onPress={goBack} size="large" fullWidth />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  content: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 100,
    gap: spacing.md,
  },
  heroCard: {
    backgroundColor: colors.primary.fixed,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.diffusion,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  heroBadgeText: {
    ...typography.styles.labelCaps,
    color: colors.text.inverse,
  },
  heroTitle: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
    marginBottom: spacing.xs,
  },
  heroBody: {
    ...typography.styles.bodyMd,
    color: colors.text.secondary,
  },
  block: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.diffusion,
  },
  blockHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  blockIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary.fixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockTitle: {
    ...typography.styles.buttonText,
    color: colors.text.onSurface,
  },
  blockSummary: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  stepRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 24,
    backgroundColor: colors.primary.main,
    color: colors.text.inverse,
    fontFamily: typography.fontFamily.bold,
    fontSize: 12,
  },
  stepText: {
    flex: 1,
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  faqTitle: {
    ...typography.styles.headlineLgMobile,
    color: colors.text.onSurface,
    marginTop: spacing.sm,
  },
  faqCard: {
    backgroundColor: colors.surface.lowest,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  faqQ: {
    ...typography.styles.buttonText,
    color: colors.primary.main,
    marginBottom: 4,
  },
  faqA: {
    ...typography.styles.bodyMd,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
});
