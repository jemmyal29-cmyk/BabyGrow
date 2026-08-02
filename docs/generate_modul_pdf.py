#!/usr/bin/env python3
"""Generate professional BabyGrow learning-module PDF (SMA audience)."""

from __future__ import annotations

from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parent
FONT = (
    REPO
    / "mobile-app/node_modules/@expo-google-fonts/plus-jakarta-sans"
)
MONO = Path(
    "/Users/user/Library/Python/3.9/lib/python/site-packages/"
    "matplotlib/mpl-data/fonts/ttf/DejaVuSansMono.ttf"
)

# Brand (desainuiux / theme)
PINK = (182, 0, 89)          # #b60059
PINK_SOFT = (255, 217, 225)  # #ffd9e1
PINK_MID = (255, 177, 196)   # #ffb1c4
INK = (28, 28, 30)
MUTED = (90, 90, 95)
RULE = (226, 226, 228)
WHITE = (255, 255, 255)
BG_SOFT = (249, 249, 249)
CODE_BG = (243, 243, 244)


class ModulPDF(FPDF):
    def __init__(self) -> None:
        super().__init__(format="A4", unit="mm")
        self.set_auto_page_break(auto=True, margin=18)
        self.set_margins(18, 16, 18)
        reg = FONT / "400Regular/PlusJakartaSans_400Regular.ttf"
        med = FONT / "500Medium/PlusJakartaSans_500Medium.ttf"
        sem = FONT / "600SemiBold/PlusJakartaSans_600SemiBold.ttf"
        bold = FONT / "700Bold/PlusJakartaSans_700Bold.ttf"
        # fpdf only allows style "" / "B" / "I" — use separate families for weights
        self.add_font("PJS", "", str(reg))
        self.add_font("PJS", "B", str(bold))
        self.add_font("PJSM", "", str(med))
        self.add_font("PJSS", "", str(sem))
        self.add_font("Mono", "", str(MONO))
        self._chapter = ""

    def header(self) -> None:
        if self.page_no() <= 1:
            return
        self.set_font("PJSM", "", 8)
        self.set_text_color(*MUTED)
        self.cell(0, 6, "BabyGrow  ·  Modul Pembelajaran SMA", align="L")
        self.set_xy(18, 10)
        self.cell(self.epw, 6, self._chapter[:48], align="R")
        self.set_draw_color(*PINK_MID)
        self.set_line_width(0.3)
        self.line(18, 16, 18 + self.epw, 16)
        self.ln(8)

    def footer(self) -> None:
        if self.page_no() <= 1:
            return
        self.set_y(-14)
        self.set_draw_color(*RULE)
        self.line(18, self.get_y(), 18 + self.epw, self.get_y())
        self.ln(2)
        self.set_font("PJS", "", 8)
        self.set_text_color(*MUTED)
        self.cell(self.epw / 2, 6, "UIGM · Proyek Akademik 2026", align="L")
        self.cell(self.epw / 2, 6, str(self.page_no()), align="R")

    # —— helpers ——
    def chapter_title(self, number: str, title: str) -> None:
        self._chapter = f"Bab {number}"
        self.add_page()
        # accent bar
        y = self.get_y()
        self.set_fill_color(*PINK)
        self.rect(18, y, 3.2, 14, style="F")
        self.set_xy(24, y)
        self.set_font("PJS", "B", 11)
        self.set_text_color(*PINK)
        self.cell(0, 6, f"BAB {number}")
        self.ln(7)
        self.set_x(24)
        self.set_font("PJS", "B", 18)
        self.set_text_color(*INK)
        self.multi_cell(self.epw - 6, 8, title)
        self.ln(4)
        self.set_draw_color(*PINK_SOFT)
        self.set_line_width(1.2)
        self.line(18, self.get_y(), 18 + 42, self.get_y())
        self.ln(8)

    def h2(self, text: str) -> None:
        self.ln(3)
        self.set_font("PJSS", "", 12)
        self.set_text_color(*PINK)
        self.multi_cell(self.epw, 7, text)
        self.set_text_color(*INK)
        self.ln(1.5)

    def h3(self, text: str) -> None:
        self.ln(2)
        self.set_font("PJSS", "", 10.5)
        self.set_text_color(*INK)
        self.multi_cell(self.epw, 6, text)
        self.ln(1)

    def p(self, text: str) -> None:
        self.set_font("PJS", "", 10)
        self.set_text_color(*INK)
        self.multi_cell(self.epw, 5.4, text)
        self.ln(1.5)

    def bullet(self, text: str, indent: float = 0) -> None:
        x0 = 18 + indent
        self.set_x(x0)
        self.set_font("PJS", "B", 10)
        self.set_text_color(*PINK)
        self.cell(4, 5.4, "•")
        self.set_font("PJS", "", 10)
        self.set_text_color(*INK)
        self.multi_cell(self.epw - indent - 4, 5.4, text)
        self.ln(0.6)

    def numbered(self, n: int, text: str) -> None:
        self.set_font("PJSS", "", 10)
        self.set_text_color(*PINK)
        self.cell(7, 5.4, f"{n}.")
        self.set_font("PJS", "", 10)
        self.set_text_color(*INK)
        self.multi_cell(self.epw - 7, 5.4, text)
        self.ln(0.8)

    def callout(self, label: str, text: str, kind: str = "tip") -> None:
        if kind == "penting":
            bg, accent = (255, 236, 240), PINK
        elif kind == "coba":
            bg, accent = (236, 245, 255), (30, 90, 160)
        else:
            bg, accent = PINK_SOFT, PINK
        self.ln(2)
        x, y = 18, self.get_y()
        self.set_font("PJS", "", 9.5)
        lines = self.multi_cell(self.epw - 10, 5, text, dry_run=True, output="LINES")
        h = 5 + 3 + len(lines) * 5 + 6
        if y + h > self.page_break_trigger:
            self.add_page()
            y = self.get_y()
        self.set_fill_color(*bg)
        self.set_draw_color(*accent)
        self.set_line_width(0.4)
        self.rect(x, y, self.epw, h, style="FD")
        self.set_xy(x + 4, y + 3)
        self.set_font("PJSS", "", 9)
        self.set_text_color(*accent)
        self.cell(0, 5, label.upper())
        self.set_xy(x + 4, y + 8)
        self.set_font("PJS", "", 9.5)
        self.set_text_color(*INK)
        self.multi_cell(self.epw - 10, 5, text)
        self.set_y(y + h + 2)

    def code_block(self, text: str) -> None:
        self.ln(1)
        lines = text.strip("\n").split("\n")
        line_h = 4.4
        h = len(lines) * line_h + 6
        y = self.get_y()
        if y + h > self.page_break_trigger:
            self.add_page()
            y = self.get_y()
        self.set_fill_color(*CODE_BG)
        self.rect(18, y, self.epw, h, style="F")
        self.set_xy(20, y + 3)
        self.set_font("Mono", "", 8)
        self.set_text_color(50, 50, 55)
        for line in lines:
            self.set_x(20)
            self.cell(self.epw - 4, line_h, line[:110])
            self.ln(line_h)
        self.ln(3)
        self.set_text_color(*INK)

    def formula(self, text: str) -> None:
        self.ln(1)
        y = self.get_y()
        self.set_fill_color(*BG_SOFT)
        self.set_draw_color(*PINK_MID)
        self.set_line_width(0.5)
        self.rect(18, y, self.epw, 12, style="FD")
        self.set_xy(18, y + 3)
        self.set_font("PJSM", "", 11)
        self.set_text_color(*INK)
        self.cell(self.epw, 6, text, align="C")
        self.set_y(y + 14)

    def table(self, headers: list[str], rows: list[list[str]], widths: list[float] | None = None) -> None:
        self.ln(1)
        n = len(headers)
        if widths is None:
            w = self.epw / n
            widths = [w] * n
        # header
        self.set_fill_color(*PINK)
        self.set_text_color(*WHITE)
        self.set_font("PJSS", "", 8.5)
        for i, h in enumerate(headers):
            self.cell(widths[i], 7, f"  {h}", border=0, fill=True)
        self.ln()
        self.set_font("PJS", "", 8.5)
        self.set_text_color(*INK)
        for r_i, row in enumerate(rows):
            if self.get_y() + 8 > self.page_break_trigger:
                self.add_page()
                self.set_fill_color(*PINK)
                self.set_text_color(*WHITE)
                self.set_font("PJSS", "", 8.5)
                for i, h in enumerate(headers):
                    self.cell(widths[i], 7, f"  {h}", border=0, fill=True)
                self.ln()
                self.set_font("PJS", "", 8.5)
                self.set_text_color(*INK)
            bg = BG_SOFT if r_i % 2 == 0 else WHITE
            self.set_fill_color(*bg)
            max_h = 7.0
            for i, cell in enumerate(row):
                lines = self.multi_cell(widths[i] - 2, 4.5, cell, dry_run=True, output="LINES")
                max_h = max(max_h, len(lines) * 4.5 + 2.5)
            x0 = self.get_x()
            y0 = self.get_y()
            for i, cell in enumerate(row):
                self.set_xy(x0 + sum(widths[:i]), y0)
                self.set_fill_color(*bg)
                self.rect(x0 + sum(widths[:i]), y0, widths[i], max_h, style="F")
                self.set_xy(x0 + sum(widths[:i]) + 1, y0 + 1.2)
                self.set_text_color(*INK)
                self.multi_cell(widths[i] - 2, 4.5, cell)
            self.set_xy(x0, y0 + max_h)
        self.ln(4)

    def cover(self) -> None:
        self.add_page()
        # full bleed top band
        self.set_fill_color(*PINK)
        self.rect(0, 0, 210, 95, style="F")
        self.set_fill_color(*PINK_SOFT)
        self.rect(0, 95, 210, 8, style="F")

        self.set_xy(18, 28)
        self.set_font("PJSM", "", 11)
        self.set_text_color(*PINK_SOFT)
        self.cell(0, 6, "MODUL PEMBELAJARAN TEKNOLOGI")

        self.set_xy(18, 42)
        self.set_font("PJS", "B", 32)
        self.set_text_color(*WHITE)
        self.cell(0, 12, "BabyGrow")

        self.set_xy(18, 56)
        self.set_font("PJS", "", 13)
        self.set_text_color(*WHITE)
        self.multi_cell(
            170,
            7,
            "Sistem Pemantauan Pertumbuhan Balita\nberbasis Mobile, Cloud, IoT & AI",
        )

        self.set_xy(18, 118)
        self.set_font("PJSS", "", 14)
        self.set_text_color(*INK)
        self.multi_cell(170, 8, "Panduan belajar untuk siswa SMA / SMK")

        self.set_xy(18, 136)
        self.set_font("PJS", "", 10.5)
        self.set_text_color(*MUTED)
        self.multi_cell(
            170,
            6,
            "Memahami fitur aplikasi, struktur database, rumus WHO,\n"
            "framework (Expo, React Native, Supabase), cara pakai\n"
            "setiap teknologi, serta alur deploy ke Android.",
        )

        # meta cards
        y = 175
        cards = [
            ("Versi", "2.0 · Juli 2026"),
            ("Level", "SMA / SMK · Informatika"),
            ("Proyek", "UIGM · Akademik"),
        ]
        cw = 56
        for i, (k, v) in enumerate(cards):
            x = 18 + i * (cw + 4)
            self.set_fill_color(*BG_SOFT)
            self.rect(x, y, cw, 22, style="F")
            self.set_xy(x + 4, y + 4)
            self.set_font("PJSM", "", 8)
            self.set_text_color(*PINK)
            self.cell(0, 4, k.upper())
            self.set_xy(x + 4, y + 11)
            self.set_font("PJSS", "", 10)
            self.set_text_color(*INK)
            self.cell(0, 5, v)

        self.set_xy(18, 260)
        self.set_font("PJS", "", 9)
        self.set_text_color(*MUTED)
        self.cell(0, 5, "Brand color  #b60059  ·  Tipografi  Plus Jakarta Sans")

def build() -> Path:
    pdf = ModulPDF()
    pdf.cover()

    # —— Cara pakai ——
    pdf._chapter = "Pengantar"
    pdf.add_page()
    pdf.set_font("PJS", "B", 16)
    pdf.set_text_color(*INK)
    pdf.cell(0, 8, "Cara memakai modul ini")
    pdf.ln(12)
    pdf.p(
        "Modul ini disusun seperti buku pelajaran singkat. Bacalah bab berurutan. "
        "Setiap bab punya tujuan belajar, penjelasan konsep, contoh, dan tip praktis."
    )
    pdf.h3("Urutan belajar yang disarankan")
    for i, t in enumerate(
        [
            "Bab 1–2: paham masalah & gambaran teknologi.",
            "Bab 3: pelajari framework satu per satu (inti coding).",
            "Bab 4–5: hubungkan ke fitur & database nyata.",
            "Bab 6: rumus kesehatan (matematika terapan).",
            "Bab 7–9: IoT, AI, file proyek, setup & deploy.",
            "Kerjakan latihan di akhir untuk mengecek pemahaman.",
        ],
        1,
    ):
        pdf.numbered(i, t)
    pdf.callout(
        "Untuk siswa SMA",
        "Tidak perlu hafal semua nama library. Fokus: apa fungsinya, di file mana, "
        "dan bagaimana alur datanya dari layar HP sampai database.",
        "tip",
    )

    # —— BAB 1 ——
    pdf.chapter_title("01", "Mengapa BabyGrow ada?")
    pdf.p(
        "Stunting adalah kondisi tinggi badan anak jauh di bawah standar usianya. "
        "Di Indonesia, pemantauan pertumbuhan balita sering masih manual dan terlambat. "
        "BabyGrow membantu orang tua dan petugas mencatat tinggi–berat, menghitung "
        "status menurut standar WHO, serta memberi peringatan dini."
    )
    pdf.h2("Apa yang dilakukan aplikasi?")
    for t in [
        "Mencatat pengukuran tinggi & berat balita.",
        "Menghitung z-score WHO (TB/U, BB/U, BB/TB).",
        "Menandai risiko stunting dengan bahasa yang mudah.",
        "Menyambungkan alat ukur pintar (Bluetooth / internet).",
        "Memberi resep MBG dan bantuan AI (chat & vision).",
    ]:
        pdf.bullet(t)
    pdf.h2("Dua peran pengguna")
    pdf.table(
        ["Di layar aplikasi", "Di database", "Tugas utama"],
        [
            ["Orang Tua", "ROLE_USER", "Pantau anak sendiri"],
            ["Petugas / Perawat", "ROLE_ADMIN", "Lihat data kolektif + laporan"],
        ],
        [55, 45, 74],
    )
    pdf.callout(
        "Penting",
        "Nama ROLE_USER / ROLE_ADMIN hanya untuk developer. Di UI selalu tulis "
        "“Orang Tua” atau “Petugas/Perawat”.",
        "penting",
    )

    # —— BAB 2 ——
    pdf.chapter_title("02", "Arsitektur & tech stack")
    pdf.p(
        "Bayangkan aplikasi seperti restoran: layar HP adalah ruang makan (UI), "
        "dapur adalah logika & layanan, gudang adalah database cloud."
    )
    pdf.code_block(
        """┌──────────────────────────────┐
│  Aplikasi Expo (HP / Web)    │  ← React Native + TypeScript
│  Layar · Navigasi · State    │
└──────────────┬───────────────┘
               │ HTTPS
┌──────────────▼───────────────┐
│  Supabase                    │  ← Auth + PostgreSQL + RLS
└──────┬───────────────┬───────┘
   BLE │               │ MQTT
┌──────▼────┐   ┌──────▼───────┐
│ ESP32     │   │ Broker MQTT  │
└───────────┘   └──────────────┘
               │
        ┌──────▼───────┐
        │ Google Gemini│  ← Chat & AI Vision
        └──────────────┘"""
    )
    pdf.h2("Daftar teknologi (ingat fungsi, bukan sekadar nama)")
    pdf.table(
        ["Teknologi", "Peran singkat", "Versi proyek"],
        [
            ["Expo + React Native", "Membangun aplikasi mobile lintas platform", "Expo 54 · RN 0.81"],
            ["TypeScript", "JavaScript + tipe agar lebih aman", "5.9"],
            ["React Navigation", "Pindah antar layar + tab role", "v7"],
            ["Zustand", "State login / anak yang aktif", "4.x"],
            ["TanStack Query", "Ambil & cache data dari cloud", "5.x"],
            ["Zod + RHF", "Validasi form (nama, tanggal, dll.)", "terbaru"],
            ["Supabase", "Akun, database, keamanan baris (RLS)", "JS SDK"],
            ["BLE + MQTT", "Alat ukur → HP → cloud", "ble-plx · paho"],
            ["Gemini AI", "Chat & estimasi tinggi dari foto", "API"],
            ["EAS Build", "Membangun file APK Android", "Expo cloud"],
        ],
        [42, 90, 42],
    )
    pdf.callout(
        "Analogi SMA",
        "Expo = “cetakan proyek siap pakai”. React Native = “bahasa UI HP”. "
        "Supabase = “akun + spreadsheet pintar di internet”. RLS = “aturan siapa "
        "boleh lihat baris data mana”.",
        "tip",
    )

    # —— BAB 3 ——
    pdf.chapter_title("03", "Framework & cara pakainya")
    pdf.p(
        "Bab ini paling penting untuk praktik. Setiap framework dijelaskan: apa itu, "
        "kenapa dipakai di BabyGrow, di mana filenya, dan cara memakai singkat."
    )

    pdf.h2("3.1 Expo")
    pdf.p(
        "Expo adalah platform di atas React Native. Kamu tidak perlu langsung "
        "mengutak-atik Android Studio untuk mulai. Perintah utama ada di folder mobile-app/."
    )
    pdf.code_block(
        """cd mobile-app
npm install
npx expo start          # QR code / web / emulator
npx expo start --web    # uji di browser
npx expo start --clear  # bersihkan cache jika aneh"""
    )
    pdf.bullet("File konfigurasi: app.json (nama app, ikon, izin kamera/Bluetooth).")
    pdf.bullet("Build toko/APK: eas.json + perintah eas build (lihat Bab 9).")
    pdf.callout(
        "Coba sendiri",
        "Jalankan npx expo start lalu tekan w untuk web. Pastikan .env sudah diisi "
        "dari .env.example agar login cloud berfungsi.",
        "coba",
    )

    pdf.h2("3.2 React Native + TypeScript")
    pdf.p(
        "Setiap layar adalah komponen React (file .tsx). State lokal pakai useState; "
        "efek samping (ambil data) pakai useEffect. TypeScript menandai tipe data "
        "agar typo lebih cepat ketahuan."
    )
    pdf.code_block(
        """// pola umum sebuah layar
export default function ContohScreen() {
  const [nama, setNama] = useState('');
  return (
    <View>
      <Text>{nama}</Text>
    </View>
  );
}"""
    )
    pdf.bullet("Layar ada di src/screens/ — contoh UserDashboardScreen.tsx.")
    pdf.bullet("Komponen ulang-pakai di src/components/common/.")
    pdf.bullet("Warna & font brand di src/theme/ (primary #b60059, Plus Jakarta Sans).")

    pdf.h2("3.3 React Navigation + RBAC")
    pdf.p(
        "RBAC = Role-Based Access Control: menu berbeda menurut peran. "
        "File kunci: src/navigation/AppNavigatorRBAC.tsx."
    )
    pdf.numbered(1, "Belum login → Auth stack (Login, Register, …).")
    pdf.numbered(2, "ROLE_USER → UserTabs (Beranda, Anak, Ukur, Resep, Profil).")
    pdf.numbered(3, "ROLE_ADMIN → AdminTabs (Dashboard petugas, Data, …).")
    pdf.callout(
        "Tip",
        "Kalau setelah login menu salah, cek role di tabel profiles dan isi authStore.",
        "tip",
    )

    pdf.h2("3.4 Zustand (state auth)")
    pdf.p(
        "Zustand menyimpan data yang banyak layar butuhkan, misalnya user & token. "
        "File: src/store/authStore.ts — fungsi login, logout, restore session."
    )
    pdf.code_block(
        """// konsep pemakaian
const user = useAuthStore(s => s.user);
const logout = useAuthStore(s => s.logout);
await logout();"""
    )

    pdf.h2("3.5 TanStack Query (data server)")
    pdf.p(
        "Query = “ambil data dari Supabase lalu cache”. Mutasi = “ubah data lalu "
        "segarkan daftar”. Hooks di src/hooks/ misalnya useChildren, useMeasurements, "
        "useRecipes, useAdminDashboard."
    )
    pdf.bullet("Keuntungan: loading/error otomatis, tidak perlu fetch berulang manual.")
    pdf.bullet("Setelah ukur baru, invalidate query agar grafik & beranda ikut update.")

    pdf.h2("3.6 React Hook Form + Zod")
    pdf.p(
        "Form panjang (tambah anak, edit profil) memakai RHF. Schema Zod memastikan "
        "nama tidak kosong, tanggal valid, dll. sebelum disimpan."
    )

    pdf.h2("3.7 Supabase (backend)")
    pdf.p(
        "Supabase menggantikan backend custom untuk auth & database. Client JS: "
        "@supabase/supabase-js. URL & anon key dari .env (EXPO_PUBLIC_SUPABASE_*)."
    )
    pdf.numbered(1, "Auth: signUp / signInWithPassword / signOut / resetPassword.")
    pdf.numbered(2, "Database: from('children').select() · insert · update.")
    pdf.numbered(3, "RLS: PostgreSQL memfilter baris menurut auth.uid() & role.")
    pdf.code_block(
        """const { data, error } = await supabase
  .from('children')
  .select('*')
  .eq('parent_id', userId);"""
    )
    pdf.callout(
        "Penting keamanan",
        "Jangan pernah commit Service Role key. Di aplikasi mobile hanya pakai anon key. "
        "Keamanan utama ada di RLS, bukan di menyembunyikan URL.",
        "penting",
    )

    pdf.h2("3.8 BLE, MQTT, Gemini (ringkas)")
    pdf.bullet("BLE (react-native-ble-plx): scan & connect alat dekat HP — BLEService.ts.")
    pdf.bullet("MQTT (paho-mqtt): pesan sensor lewat WebSocket — MQTTService.ts.")
    pdf.bullet("Gemini: chat & vision — GeminiAIService.ts + EXPO_PUBLIC_GEMINI_API_KEY.")
    pdf.p("Detail IoT & AI di Bab 7. Detail rumus di Bab 6.")

    # —— BAB 4 ——
    pdf.chapter_title("04", "Fitur aplikasi (alur pengguna)")
    pdf.h2("4.1 Alur pertama kali")
    pdf.numbered(1, "SplashScreen — logo & brand.")
    pdf.numbered(2, "Onboarding 5 slide (OnboardingScreen + assets/images/onboarding/).")
    pdf.numbered(3, "Login / Daftar. Key selesai onboarding: @babygrow/onboarding_done_v4 di App.tsx.")

    pdf.h2("4.2 Fitur orang tua")
    pdf.table(
        ["Fitur", "Yang dipelajari", "File utama"],
        [
            ["Beranda", "Ringkas status & z-score", "UserDashboardScreen.tsx"],
            ["Data anak", "CRUD + data ortu lokal", "Children / Add / Detail"],
            ["Ukur manual", "Input → WHO → simpan", "ManualMeasurementScreen"],
            ["Pairing alat", "Bluetooth awam", "PairingModal · BLEService"],
            ["AI Vision", "Estimasi tinggi foto", "AIVisionStadiometerScreen"],
            ["Grafik", "Tren vs WHO", "GrowthScreen · GrowthChart"],
            ["Resep MBG", "Bahan & langkah masak", "RecipeListScreen"],
            ["AI Chat", "Tanya tumbuh kembang", "AIAssistantScreen"],
            ["Panduan", "Bahasa awam", "Guide · Help"],
        ],
        [40, 70, 64],
    )

    pdf.h2("4.3 Fitur petugas")
    pdf.bullet("Dashboard statistik: AdminDashboardScreen + useAdminDashboard.")
    pdf.bullet("Pencarian semua balita, export CSV (csvExport.ts).")
    pdf.bullet("Health check cloud/alat: SystemHealthService.ts.")

    # —— BAB 5 ——
    pdf.chapter_title("05", "Struktur database")
    pdf.p("Sumber kebenaran: mobile-app/supabase/schema.sql dan seed.sql.")
    pdf.h2("5.1 ERD logis")
    pdf.code_block(
        """auth.users  ──1:1──►  profiles (role)
                          │
                          │ 1:N
                          ▼
                       children
                          │ 1:N
                          ▼
                     measurements

who_standards   ← parameter LMS WHO (referensi)
recipes         ← katalog MBG"""
    )
    pdf.h2("5.2 Tabel inti")
    pdf.table(
        ["Tabel", "Isi penting"],
        [
            ["profiles", "id=user, email, full_name, role, lokasi petugas"],
            ["children", "parent_id, name, gender, date_of_birth, birth_tb/bb"],
            ["measurements", "height_cm, weight_kg, z_score_*, stunting_risk, source"],
            ["who_standards", "L, M, S per usia / gender / indikator"],
            ["recipes", "bahan[], langkah[], kalori, rentang usia"],
        ],
        [45, 129],
    )
    pdf.h2("5.3 Kolom measurements yang wajib dipahami")
    pdf.table(
        ["Kolom", "Arti"],
        [
            ["z_score_hfa", "Tinggi menurut usia (utama untuk stunting)"],
            ["z_score_wfa", "Berat menurut usia"],
            ["z_score_wfh", "Berat menurut tinggi"],
            ["stunting_risk", "normal | at_risk | stunted | severe"],
            ["source", "manual | ble | mqtt | ai_vision"],
        ],
        [45, 129],
    )
    pdf.h2("5.4 RLS (keamanan baris)")
    pdf.p(
        "RLS = aturan di database: orang tua hanya melihat anak miliknya; "
        "petugas bisa melihat lebih luas sesuai policy. Perbaikan recursion login: "
        "fix-login-rls.sql (fungsi is_admin)."
    )
    pdf.callout(
        "Catatan desain",
        "Tinggi/berat/golongan darah orang tua disimpan di perangkat "
        "(parentalMetricsStorage.ts), belum wajib jadi kolom di Supabase.",
        "tip",
    )

    # —— BAB 6 ——
    pdf.chapter_title("06", "Rumus & contoh hitung")
    pdf.h2("6.1 Usia dalam bulan")
    pdf.p(
        "WHO memakai usia dalam bulan untuk memilih baris LMS. "
        "Fungsi: calculateAgeInMonths() di zScoreCalculator.ts."
    )

    pdf.h2("6.2 Z-score metode LMS (WHO)")
    pdf.formula("Z  =  ((X / M) ^ L  −  1)  /  (L × S)")
    pdf.table(
        ["Simbol", "Arti"],
        [
            ["X", "Nilai ukur (tinggi cm atau berat kg)"],
            ["L", "Lambda (Box-Cox) dari tabel WHO"],
            ["M", "Median referensi untuk usia itu"],
            ["S", "Koefisien variasi"],
            ["Z", "Berapa jauh dari median (satuan SD)"],
        ],
        [28, 146],
    )
    pdf.p("Jika L mendekati 0, bentuk disederhanakan menjadi Z ≈ (X − M) / (M × S).")
    pdf.h3("Contoh pemahaman (bukan angka klinis resmi)")
    pdf.p(
        "Anak usia tertentu punya M tinggi = 85 cm. Diukur X = 80 cm. "
        "Jika hasil Z ≈ −2,1 maka tingginya sekitar 2 SD di bawah median → "
        "masuk zona stunted menurut aturan aplikasi."
    )

    pdf.h2("6.3 Klasifikasi risiko (kode BabyGrow)")
    pdf.table(
        ["Kondisi Z (TB/U)", "Level", "Arti untuk siswa"],
        [
            ["Z ≥ −1", "normal", "Pertumbuhan oke"],
            ["−2 ≤ Z < −1", "at_risk", "Perlu dipantau"],
            ["−3 ≤ Z < −2", "stunted", "Indikasi stunting"],
            ["Z < −3", "severe", "Stunting berat"],
        ],
        [50, 40, 84],
    )
    pdf.callout(
        "Penting",
        "Angka di app untuk skrining & edukasi. Keputusan medis tetap ke tenaga kesehatan.",
        "penting",
    )

    pdf.h2("6.4 Tinggi dewasa mid-parental (Tanner)")
    pdf.formula("Laki-laki:  (Tayah + Tibu + 13) / 2")
    pdf.formula("Perempuan: (Tayah + Tibu − 13) / 2")
    pdf.p("Kisaran tipikal: hasil ± 8,5 cm. File: parentalGrowth.ts.")
    pdf.h3("Contoh latihan")
    pdf.p("Ayah 170 cm, ibu 155 cm, anak laki-laki → (170+155+13)/2 = 169 cm. Kisaran ≈ 160,5–177,5 cm.")

    pdf.h2("6.5 Golongan darah ABO (edukasi)")
    pdf.p(
        "Dari golongan ibu & ayah, daftar kemungkinan anak (tanpa Rh). "
        "Contoh: O×O → O; A×B → O/A/B/AB. Fungsi: possibleChildBloodTypes()."
    )

    # —— BAB 7 ——
    pdf.chapter_title("07", "IoT & AI — cara kerja")
    pdf.h2("7.1 Bluetooth Low Energy (BLE)")
    pdf.p(
        "Seperti menyambungkan earphone: HP dan alat harus dekat. "
        "Firmware alat: ESP32_BLE_Firmware.ino. Di app: BLEService + PairingModal."
    )
    pdf.callout(
        "Catatan perangkat",
        "BLE penuh biasanya butuh development/preview build (EAS), bukan Expo Go biasa.",
        "tip",
    )

    pdf.h2("7.2 MQTT")
    pdf.p(
        "MQTT = protokol pesan ringan. Alat/broker mengirim topik sensor; app berlangganan "
        "lewat WebSocket (EXPO_PUBLIC_MQTT_WS_URL). Setelah data masuk, "
        "MeasurementSyncService menghitung WHO lalu menyimpan ke Supabase."
    )

    pdf.h2("7.3 Alur pengukuran end-to-end")
    pdf.code_block(
        """Input: Manual / BLE / MQTT / AI Vision
   → MeasurementSyncService
       · usia bulan
       · ambil LMS (who_standards → fallback lokal)
       · hitung z_score_hfa / wfa / wfh
       · tentukan stunting_risk
       · INSERT measurements
   → UI refresh (React Query)"""
    )

    pdf.h2("7.4 Google Gemini")
    pdf.bullet("Chat: AIAssistantScreen — konteks tumbuh kembang.")
    pdf.bullet("Vision: foto anak → estimasi tinggi (skrining, bukan alat klinis).")
    pdf.bullet("Butuh EXPO_PUBLIC_GEMINI_API_KEY + internet.")

    # —— BAB 8 ——
    pdf.chapter_title("08", "Peta file proyek")
    pdf.p("Hafalkan “peta”, bukan semua baris kode.")
    pdf.table(
        ["Lokasi", "Isi"],
        [
            ["mobile-app/App.tsx", "Splash → onboarding → navigator"],
            ["src/navigation/", "RBAC tabs & stack"],
            ["src/screens/", "Semua layar UI"],
            ["src/components/", "Tombol, modal, chart, dll."],
            ["src/services/", "BLE, MQTT, Sync, Gemini, Health"],
            ["src/hooks/", "React Query hooks"],
            ["src/store/", "Zustand auth/child"],
            ["src/utils/", "z-score, parental, CSV, alert"],
            ["src/theme/", "Warna, font, spacing brand"],
            ["supabase/*.sql", "Schema, seed, RLS, demo user"],
            ["ESP32_BLE_Firmware.ino", "Firmware alat ukur"],
            ["docs/", "Modul pembelajaran (MD + PDF)"],
        ],
        [58, 116],
    )

    # —— BAB 9 ——
    pdf.chapter_title("09", "Setup lokal & deploy")
    pdf.h2("9.1 Persiapan database")
    pdf.numbered(1, "Buat project di Supabase.")
    pdf.numbered(2, "Jalankan schema.sql lalu seed.sql di SQL Editor.")
    pdf.numbered(3, "Opsional: seed-demo-users, reset-demo-passwords, promote-admin, fix-login-rls.")
    pdf.p("Demo (setelah reset password): parent@babygrow.local / Parent1234 · admin@babygrow.local / Admin1234")

    pdf.h2("9.2 Menjalankan app lokal")
    pdf.code_block(
        """cd mobile-app
cp .env.example .env
# isi SUPABASE_URL, SUPABASE_ANON_KEY, MQTT_*, GEMINI_*
npm install
npx expo start"""
    )

    pdf.h2("9.3 Deploy Android (EAS)")
    pdf.code_block(
        """cd mobile-app
eas login
./scripts/eas-set-secrets.sh
eas build --platform android --profile preview --non-interactive"""
    )
    pdf.table(
        ["Profile", "Kegunaan"],
        [
            ["development", "Dev client + BLE native"],
            ["preview", "APK uji internal (demo)"],
            ["production", "Rilis lebih luas"],
        ],
        [45, 129],
    )
    pdf.p("Panduan lengkap: mobile-app/EAS-BUILD.md")

    # —— Latihan ——
    pdf.chapter_title("10", "Latihan & kunci jawaban")
    pdf.h2("Soal")
    for i, t in enumerate(
        [
            "Jelaskan perbedaan BLE dan MQTT dengan analogi sehari-hari.",
            "Sebutkan 3 tanggung jawab Expo dalam proyek BabyGrow.",
            "Hitung mid-parental laki-laki: ayah 172 cm, ibu 158 cm. Berapa kisaran ±8,5?",
            "Jika z TB/U = −2,4, level stunting_risk apa menurut tabel Bab 6?",
            "File mana yang memutuskan UserTabs vs AdminTabs?",
            "Mengapa aplikasi mobile hanya boleh memakai anon key Supabase?",
            "Sebutkan 4 nilai source pada measurements.",
        ],
        1,
    ):
        pdf.numbered(i, t)

    pdf.h2("Kunci singkat")
    pdf.bullet("1. BLE = bicara jarak dekat seperti earphone; MQTT = kirim pesan lewat internet/broker.")
    pdf.bullet("2. Menjalankan dev server, mengelola config native (app.json), memudahkan build EAS.")
    pdf.bullet("3. (172+158+13)/2 = 171,5 cm → kisaran 163–180 cm.")
    pdf.bullet("4. stunted.")
    pdf.bullet("5. AppNavigatorRBAC.tsx (+ role di authStore).")
    pdf.bullet("6. Anon key aman dipakai bersama RLS; service role terlalu berkuasa jika bocor di HP.")
    pdf.bullet("7. manual, ble, mqtt, ai_vision.")

    # —— Glosarium ——
    pdf._chapter = "Glosarium"
    pdf.add_page()
    pdf.set_font("PJS", "B", 16)
    pdf.set_text_color(*INK)
    pdf.cell(0, 8, "Glosarium singkat")
    pdf.ln(12)
    pdf.table(
        ["Istilah", "Arti sederhana"],
        [
            ["API", "Cara program minta data ke layanan lain"],
            ["SDK", "Kumpulan alat/library resmi untuk suatu platform"],
            ["RLS", "Aturan baris database per pengguna"],
            ["Z-score", "Jarak ke rata-rata dalam satuan simpangan baku"],
            ["LMS", "Metode WHO: Lambda, Mu, Sigma"],
            ["MBG", "Makan Bergizi Gratis (konteks resep)"],
            ["APK", "File pemasang aplikasi Android"],
            ["Webhook/WSS", "Kanal komunikasi real-time (di sini MQTT via WSS)"],
        ],
        [40, 134],
    )
    pdf.ln(6)
    pdf.callout(
        "Penutup",
        "Modul v2.0 mencerminkan kode aktual di repositori BabyGrow. "
        "Pelajari bersama README.md dan praktik langsung di folder mobile-app/.",
        "tip",
    )

    out = ROOT / "MODUL-PEMBELAJARAN-BABYGROW.pdf"
    pdf.output(str(out))
    return out


if __name__ == "__main__":
    path = build()
    print(f"Wrote {path} ({path.stat().st_size} bytes)")
