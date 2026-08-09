/**
 * Fallback copy for AI Assistant — ramah awam, tanpa jargon backend
 */

export type FallbackLang = 'id' | 'en' | 'zh' | 'ar' | 'ja' | 'es';

const pick = (
  map: Partial<Record<FallbackLang, string>> & { id: string },
  lang: FallbackLang
): string => map[lang] || map.id;

export const FALLBACK_GREETING: Record<FallbackLang, string> = {
  id:
    'Selamat datang di Asisten BabyGrow!\n\n' +
    'Saya membantu memahami pertumbuhan anak (standar WHO), nutrisi, cara pakai alat ukur, dan pertanyaan umum.\n' +
    'Saran AI bersifat pendukung — keputusan medis tetap ke dokter/petugas kesehatan.',
  en:
    'Welcome to BabyGrow Assistant!\n\n' +
    'I can help with WHO growth guidance, nutrition, device setup, and development questions.\n' +
    'AI insight is supportive — always consult a clinician for medical decisions.',
  zh: '欢迎使用 BabyGrow！我可以协助成长分析与营养建议。医疗决策请咨询专业人员。',
  ar: 'مرحباً بك في BabyGrow! يمكنني المساعدة في تحليل النمو والتغذية. استشر مختصاً للقرارات الطبية.',
  ja: 'BabyGrowへようこそ！成長分析や栄養の質問をサポートします。医療判断は医師へ。',
  es: '¡Bienvenido a BabyGrow! Puedo ayudar con análisis de crecimiento y nutrición.',
};

export const FALLBACK_DATA_MISSING =
  '**Data belum lengkap**\n\n' +
  'Untuk analisis pertumbuhan dibutuhkan profil anak dan minimal satu pengukuran.\n\n' +
  '1. Pilih anak aktif di Beranda / menu Anak\n' +
  '2. Simpan pengukuran (manual / alat / kamera AI)\n' +
  '3. Pengukuran offline juga dihitung — AI bisa membacanya meski belum sync cloud';

export const FALLBACK_NUTRITION =
  '**Panduan nutrisi singkat**\n\n' +
  '• Seimbangkan karbohidrat, protein, sayur & buah\n' +
  '• Utamakan protein + zat besi & kalsium\n' +
  '• 3 makan utama + 2 camilan bergizi; batasi gula\n\n' +
  'Lihat menu Resep MBG untuk cara memasak langkah demi langkah.';

export const FALLBACK_IOT_HELP =
  '**Cara pakai alat ukur pintar (sederhana)**\n\n' +
  '1. Nyalakan alat BabyGrow\n' +
  '2. Aktifkan Bluetooth di HP\n' +
  '3. Di Beranda ketuk Ukur Otomatis, tunggu hingga terhubung\n' +
  '4. Letakkan anak tenang di alat; angka muncul di HP\n' +
  '5. Jika gagal, gunakan Ukur Manual\n\n' +
  'Bluetooth = sambungan dekat ke alat. Internet = menyimpan data ke akun Anda.';

export const FALLBACK_NAVIGATION =
  '**Menu BabyGrow**\n\n' +
  '• Beranda — status anak & pintasan\n' +
  '• Anak — profil balita\n' +
  '• Grafik — tren pertumbuhan\n' +
  '• Profil — akun & panduan\n\n' +
  'Petugas/perawat melihat dashboard kolektif setelah masuk dengan akun fasilitas.';

export const FALLBACK_PRIVACY =
  '**Privasi**\n\n' +
  'Data tersimpan aman di akun Anda. Jangan bagikan kata sandi.\n' +
  'Reset password tersedia di login/profil. AI tidak menggantikan diagnosis dokter.';

/** Legacy stub kept for AIAssistantService import stability */
export const FALLBACK_ZAKI_EXAMPLE_REMOVED = '';

export function fallbackGreeting(lang: FallbackLang = 'id'): string {
  return pick(FALLBACK_GREETING, lang);
}

export function fallbackLoginHelp(lang: FallbackLang = 'id'): string {
  return pick(
    {
      id:
        'Masuk BabyGrow dengan **email + kata sandi**.\n\n' +
        '• Belum punya akun? Ketuk **Daftar** (untuk orang tua).\n' +
        '• Akun petugas/perawat diberikan oleh fasilitas kesehatan Anda.\n' +
        '• Lupa kata sandi? Gunakan **Lupa password** di layar masuk.',
      en:
        'BabyGrow login uses **email + password**.\n\n' +
        '• New parent account: use **Register**.\n' +
        '• Staff accounts are provided by your health facility.\n' +
        '• Forgot password? Use reset on the login screen.',
    },
    lang
  );
}

export function fallbackStuntingExplain(lang: FallbackLang = 'id'): string {
  return pick(
    {
      id:
        '**Stunting** = tinggi anak lebih pendek dari standar usia (WHO).\n\n' +
        'BabyGrow menghitung skor pertumbuhan otomatis dari tinggi & berat.\n' +
        'Jika muncul risiko, konsultasikan ke petugas/puskesmas — jangan panik, pantau berkala.',
      en:
        '**Stunting** means height is below the WHO standard for age.\n' +
        'BabyGrow computes growth scores from height & weight. Seek care if risk appears.',
    },
    lang
  );
}

export function fallbackGeneric(lang: FallbackLang = 'id'): string {
  return pick(
    {
      id:
        'Saya siap membantu. Coba tanya: cara ukur anak, baca grafik, resep MBG, atau pairing alat.',
      en: 'I can help with measuring, charts, MBG recipes, or connecting your device.',
    },
    lang
  );
}

export function fallbackAdmin(lang: FallbackLang = 'id'): string {
  return pick(
    {
      id:
        '**Untuk petugas/perawat**\n\n' +
        '• Dashboard menampilkan ringkasan balita & risiko stunting\n' +
        '• Cari nama anak/orang tua, buka detail, bantu ukur di lapangan\n' +
        '• Ekspor data bila diperlukan untuk laporan\n' +
        '• Akun petugas diberikan fasilitas kesehatan — bukan lewat daftar publik orang tua',
      en:
        '**For health staff**\n\n' +
        'Use the dashboard for toddler summaries, search, field measurement, and export. Staff accounts are issued by your facility.',
    },
    lang
  );
}

export function fallbackImmunization(lang: FallbackLang = 'id'): string {
  return pick(
    {
      id:
        '**Imunisasi**\n\n' +
        'Ikuti jadwal imunisasi nasional sesuai usia anak. BabyGrow fokus pada pertumbuhan (tinggi/berat). ' +
        'Untuk jadwal vaksin detail, konsultasikan ke puskesmas/posyandu setempat.',
      en:
        'Follow the national immunization schedule for your child’s age. For vaccine details, consult your local clinic.',
    },
    lang
  );
}

export function fallbackIoTEmergency(lang: FallbackLang = 'id'): string {
  return pick(
    {
      id:
        '**Alat tidak terhubung?**\n\n' +
        '1. Pastikan alat menyala\n' +
        '2. Bluetooth HP aktif, dekatkan ke alat\n' +
        '3. Ketuk Ukur Otomatis lagi\n' +
        '4. Jika tetap gagal, pakai Ukur Manual agar data tetap tercatat',
      en:
        'Power on the device, enable Bluetooth, retry pairing. If it still fails, use Manual Measure.',
    },
    lang
  );
}

export function fallbackProfileSettings(lang: FallbackLang = 'id'): string {
  return pick(
    {
      id:
        '**Profil & pengaturan**\n\n' +
        'Di menu Profil Anda bisa melihat data akun, reset kata sandi, membuka panduan, dan keluar dari aplikasi.',
      en:
        'In Profile you can view account info, reset password, open guides, and sign out.',
    },
    lang
  );
}

export function fallbackStandard(lang: FallbackLang = 'id'): string {
  return pick(
    {
      id:
        'BabyGrow memakai standar pertumbuhan WHO untuk tinggi dan berat menurut usia. ' +
        'Hasil di aplikasi membantu skrining — keputusan medis tetap ke tenaga kesehatan.',
      en:
        'BabyGrow uses WHO growth standards. Results support screening — clinical decisions remain with health professionals.',
    },
    lang
  );
}
