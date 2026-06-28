# 🎯 QUICK REFERENCE CARD - BabyGrow Testing

```
╔══════════════════════════════════════════════════════════════════╗
║                    BABYGROW QUICK REFERENCE                      ║
║                  25 Januari 2026 - All Fixed ✅                  ║
╚══════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────┐
│                     🚀 START SERVER                             │
├─────────────────────────────────────────────────────────────────┤
│  cd C:\BabyGrow\mobile-app                                      │
│  npx expo start --port 8082                                     │
│                                                                 │
│  OR                                                             │
│                                                                 │
│  .\START-TESTING.ps1                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  🔑 TEST CREDENTIALS                            │
├─────────────────────────────────────────────────────────────────┤
│  Parent/User:                                                   │
│    Email:    user@babygrow.app                                  │
│    Password: user123                                            │
│                                                                 │
│  Admin/Kader:                                                   │
│    Email:    admin@babygrow.app                                 │
│    Password: admin123                                           │
│                                                                 │
│  Super Admin:                                                   │
│    Email:    superuser@babygrow.app                             │
│    Password: super123                                           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               ✅ WHAT WAS FIXED (3 Issues)                      │
├─────────────────────────────────────────────────────────────────┤
│  1. ✅ Carousel Onboarding                                      │
│     • 5 slides HD professional (3-color gradients)              │
│     • Logo circular with AI badge                               │
│     • Cheerful warming design                                   │
│     • Technology badges (START, IoT, AI, MBG, WHO)              │
│                                                                 │
│  2. ✅ Logo di Login Page                                       │
│     • Circular design 120x120                                   │
│     • Pink border 4px (#FF69B4)                                 │
│     • Emoji ⚖️ 60px (baby scale)                                │
│     • AI badge 40x40 positioned bottom-right                    │
│                                                                 │
│  3. ✅ Login Functionality                                      │
│     • Fixed navigation target: 'MainTabs' → 'UserTabs'          │
│     • Added Quick Login buttons                                 │
│     • Database with dummy users ready                           │
│     • Proper error handling                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  📱 TESTING STEPS                               │
├─────────────────────────────────────────────────────────────────┤
│  STEP 1: Start server (see command above)                      │
│  STEP 2: Scan QR code with Expo Go                             │
│  STEP 3: See onboarding (5 slides) - first launch only         │
│  STEP 4: Tap "Quick Login - User" button                       │
│  STEP 5: Verify navigate to UserTabs (4 tabs at bottom)        │
│  STEP 6: Test tab navigation (Beranda, Anak, Grafik, Profil)   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 🔍 TROUBLESHOOTING                              │
├─────────────────────────────────────────────────────────────────┤
│  PROBLEM: Onboarding tidak muncul                               │
│  FIX: Uninstall app → Reinstall (scan QR lagi)                 │
│  WHY: AsyncStorage 'onboarding_completed' = true               │
│                                                                 │
│  PROBLEM: Login gagal                                           │
│  FIX: Tap tombol "Quick Login - User"                          │
│  WHY: Quick login auto-fill credentials                         │
│                                                                 │
│  PROBLEM: QR tidak bisa discan                                  │
│  FIX: Tekan 't' di terminal untuk tunnel mode                   │
│  WHY: Firewall atau WiFi different network                      │
│                                                                 │
│  PROBLEM: App crash atau blank                                  │
│  FIX: Tekan 'r' di terminal untuk reload                        │
│  WHY: Metro bundler cache issue                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               📚 DOCUMENTATION FILES                            │
├─────────────────────────────────────────────────────────────────┤
│  FIX-COMPLETE-TESTING.md      Comprehensive testing guide      │
│  FIX-SUMMARY-COMPLETE.md      Detailed fix summary             │
│  VISUAL-FLOW-DIAGRAM.md       Visual app flow diagram          │
│  QUICK-LOGIN-GUIDE.ts         Test credentials reference       │
│  START-TESTING.ps1            Quick start script               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│            🎨 DESIGN SPECS (For Reference)                      │
├─────────────────────────────────────────────────────────────────┤
│  ONBOARDING COLORS (Gradients):                                 │
│    Slide 1: #FF1493 → #FF69B4 → #FFB6C1 (Pink)                │
│    Slide 2: #9B59B6 → #C471ED → #E8B5FF (Purple)              │
│    Slide 3: #3498DB → #5DADE2 → #85C1E2 (Blue)                │
│    Slide 4: #F39C12 → #F8B739 → #FECA57 (Orange)              │
│    Slide 5: #1ABC9C → #48C9B0 → #76D7C4 (Green)               │
│                                                                 │
│  LOGO SPECS:                                                    │
│    Circle: 120x120 (Login) / 140x140 (Onboarding)              │
│    Border: 4px solid #FF69B4                                    │
│    Background: white                                            │
│    Emoji: ⚖️ 60px/70px                                          │
│    AI Badge: 40x40, #FF1493 background, "AI" white text        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              🗂️ MODIFIED FILES (Summary)                        │
├─────────────────────────────────────────────────────────────────┤
│  src/screens/OnboardingScreen.tsx        547 lines             │
│    • Lines 28-78: Upgraded slide data (3-color gradients)      │
│    • Lines 230-265: Redesigned logo (circular + AI badge)      │
│    • Lines 425-495: Added professional styles                   │
│                                                                 │
│  src/screens/LoginScreen.tsx             510 lines             │
│    • Lines 106-120: Added circular logo with AI badge          │
│    • Lines 70-77: Fixed navigation (MainTabs → UserTabs)       │
│    • Lines 291-330: Added logo styles                           │
│                                                                 │
│  src/navigation/AppNavigatorRBAC.tsx     225 lines             │
│    • Removed Onboarding from Stack (use App.tsx flow)          │
│    • Cleaned up public routes                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│            ✅ VERIFICATION CHECKLIST                            │
├─────────────────────────────────────────────────────────────────┤
│  [ ] Server starts without errors                               │
│  [ ] QR code scannable                                          │
│  [ ] App loads on Expo Go                                       │
│  [ ] Onboarding shows 5 slides (first launch)                   │
│  [ ] Logo visible on LoginScreen                                │
│  [ ] Quick Login buttons work                                   │
│  [ ] Navigate to UserTabs after login                           │
│  [ ] Bottom navigation (4 tabs) visible                         │
│  [ ] Can switch between tabs                                    │
│  [ ] No crashes or blank screens                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               🎯 EXPECTED RESULTS                               │
├─────────────────────────────────────────────────────────────────┤
│  FIRST LAUNCH:                                                  │
│    Splash (2s) → Onboarding (5 slides) → Login → UserTabs      │
│                                                                 │
│  SUBSEQUENT LAUNCHES:                                           │
│    Splash (2s) → Login → UserTabs                              │
│                                                                 │
│  AFTER LOGIN:                                                   │
│    UserTabs with 4 tabs:                                        │
│      • 🏠 Beranda (Dashboard)                                   │
│      • 👶 Anak (Children list)                                  │
│      • 📊 Grafik (Growth charts)                                │
│      • 👤 Profil (Profile settings)                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              ⚡ QUICK COMMANDS                                  │
├─────────────────────────────────────────────────────────────────┤
│  Start:   npx expo start --port 8082                            │
│  Clear:   npx expo start --port 8082 -c                         │
│  Tunnel:  npx expo start --port 8082 --tunnel                   │
│  Help:    npx expo start --help                                 │
│                                                                 │
│  In Metro Bundler:                                              │
│    r = Reload app                                               │
│    t = Toggle tunnel                                            │
│    q = Quit server                                              │
│    ? = Show all commands                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│             💡 TIPS & TRICKS                                    │
├─────────────────────────────────────────────────────────────────┤
│  • Use Quick Login buttons untuk testing cepat                  │
│  • Shake HP untuk developer menu (reload, debug)                │
│  • Check console log di terminal untuk debug                    │
│  • Uninstall app untuk reset AsyncStorage & see onboarding      │
│  • Use tunnel mode jika QR tidak bisa discan                    │
└─────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════╗
║                    🎉 STATUS: READY TO TEST                      ║
║                   All 3 Issues Fixed ✅                          ║
╚══════════════════════════════════════════════════════════════════╝

Last Updated: 25 Januari 2026
Version: 2026.1.0
```
