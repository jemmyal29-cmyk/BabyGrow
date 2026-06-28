# 🦄 INSTALL UNICORN DEPENDENCIES - PowerShell Script

Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🦄 BABYGROW UNICORN SYSTEM 2026 - INSTALLATION" -ForegroundColor Magenta
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📦 Installing Unicorn-Grade Dependencies..." -ForegroundColor Yellow
Write-Host ""

# Navigate to mobile-app directory
Set-Location -Path ".\mobile-app"

Write-Host "🔧 Step 1: Installing State Management (Zustand)" -ForegroundColor Cyan
npm install zustand@^5.0.2

Write-Host ""
Write-Host "⚡ Step 2: Installing Performance Libraries" -ForegroundColor Cyan
npm install @shopify/flash-list@^1.8.0
npm install react-native-reanimated@~4.2.0
npm install react-native-gesture-handler@~2.22.0

Write-Host ""
Write-Host "🎨 Step 3: Installing UI/UX Enhancement" -ForegroundColor Cyan
npm install @shopify/react-native-skia@^2.0.0
npm install react-native-svg@^16.11.0
npm install expo-blur@~15.0.0
npm install expo-camera@~17.0.0
npm install react-native-maps@^2.4.2

Write-Host ""
Write-Host "✅ Step 4: Installing Validation (Zod)" -ForegroundColor Cyan
npm install zod@^3.24.1
npm install react-hook-form@^7.54.2
npm install @hookform/resolvers@^3.10.0

Write-Host ""
Write-Host "🚀 Step 5: Installing Additional Tools" -ForegroundColor Cyan
npm install @tanstack/react-query@^5.66.3
npm install expo-haptics@~15.0.0
npm install react-native-mmkv@^3.4.0

Write-Host ""
Write-Host "🧪 Step 6: Installing Dev Dependencies" -ForegroundColor Cyan
npm install --save-dev eslint@^9.20.0
npm install --save-dev @typescript-eslint/eslint-plugin@^8.20.0
npm install --save-dev @typescript-eslint/parser@^8.20.0
npm install --save-dev jest@^29.7.0
npm install --save-dev @testing-library/react-native@^12.9.0

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✅ INSTALLATION COMPLETE!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure TypeScript Strict Mode" -ForegroundColor White
Write-Host "   → Update tsconfig.json" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Setup Reanimated Plugin" -ForegroundColor White
Write-Host "   → Add to babel.config.js: ['react-native-reanimated/plugin']" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Clear Metro Cache" -ForegroundColor White
Write-Host "   → Run: npm start -- --clear" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Test New Features" -ForegroundColor White
Write-Host "   → Zustand stores ready in src/store/" -ForegroundColor Gray
Write-Host "   → 3D Design system in src/theme/unicorn.ts" -ForegroundColor Gray
Write-Host "   → Validation schemas in src/utils/validation.ts" -ForegroundColor Gray
Write-Host ""

Write-Host "🎯 Key Features Enabled:" -ForegroundColor Cyan
Write-Host "  ✅ Zustand State Management (with persist)" -ForegroundColor Green
Write-Host "  ✅ Flash List (60fps rendering)" -ForegroundColor Green
Write-Host "  ✅ Reanimated v3 (smooth animations)" -ForegroundColor Green
Write-Host "  ✅ Skia Graphics (advanced charts)" -ForegroundColor Green
Write-Host "  ✅ Glassmorphism (blur effects)" -ForegroundColor Green
Write-Host "  ✅ Zod Validation (zero-error inputs)" -ForegroundColor Green
Write-Host "  ✅ React Query (server state)" -ForegroundColor Green
Write-Host ""

Write-Host "📖 Documentation:" -ForegroundColor Yellow
Write-Host "  → UNICORN-ROADMAP.md" -ForegroundColor White
Write-Host "  → PROGRESS-REPORT.md" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Ready to build Unicorn-grade app!" -ForegroundColor Magenta
Write-Host ""

# Return to root
Set-Location -Path ".."

Write-Host "Press Enter to continue..." -ForegroundColor Gray
Read-Host
