# 🚨 EMERGENCY FIX - Execute All Repairs

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚨 EMERGENCY REPAIR: FIXING ALL RED ERRORS" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Error Summary Found:" -ForegroundColor White
Write-Host "  ❌ UserDashboardScreen.tsx: Duplicate 'user' declaration" -ForegroundColor Red
Write-Host "  ❌ BLEService.ts: Duplicate class definitions" -ForegroundColor Red
Write-Host "  ❌ OnboardingScreen.tsx: Duplicate StyleSheet.create" -ForegroundColor Red
Write-Host "  ❌ AppNavigatorRBAC.tsx: Missing 'id' prop in navigators" -ForegroundColor Red
Write-Host "  ❌ LoginScreen.tsx: colors.text.placeholder not found" -ForegroundColor Red
Write-Host "  ❌ HardwareHealthWidget.tsx: Missing 'withSpring' import" -ForegroundColor Red
Write-Host "  ❌ SmartMBGEngine.ts: Optional childId causing type errors" -ForegroundColor Red
Write-Host "  ❌ PairingModal.tsx: Using old BLEService methods" -ForegroundColor Red
Write-Host ""

Write-Host "🔧 Applying Fixes..." -ForegroundColor Green
Write-Host ""

# Fix 1: UserDashboardScreen.tsx - Remove duplicate user declaration
Write-Host "[1/8] Fixing UserDashboardScreen.tsx..." -ForegroundColor Yellow
$userDashContent = Get-Content "src\screens\UserDashboardScreen.tsx" -Raw
$userDashContent = $userDashContent -replace "const \{ user \} = useAuth\(\);\s+const \[pairingModalVisible, setPairingModalVisible\] = React\.useState\(false\);\s+const \{ user \} = useAuth\(\);", "const { user } = useAuth();`n  const [pairingModalVisible, setPairingModalVisible] = React.useState(false);"
$userDashContent = $userDashContent -replace "connected=\{mqttConnected\}", "isConnected={mqttConnected}"
Set-Content "src\screens\UserDashboardScreen.tsx" -Value $userDashContent
Write-Host "  ✅ Fixed duplicate user and connected prop" -ForegroundColor Green

# Fix 2: Check if babel.config.js has reanimated plugin
Write-Host "[2/8] Checking babel.config.js..." -ForegroundColor Yellow
if (Test-Path "babel.config.js") {
    $babelContent = Get-Content "babel.config.js" -Raw
    if ($babelContent -notmatch "react-native-reanimated/plugin") {
        Write-Host "  ⚠️  WARNING: babel.config.js missing reanimated plugin!" -ForegroundColor Yellow
        Write-Host "     Add this to plugins array: 'react-native-reanimated/plugin'" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ Reanimated plugin found" -ForegroundColor Green
    }
}

# Fix 3: Check dependencies
Write-Host "[3/8] Checking package.json dependencies..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
$missingDeps = @()
if (-not $packageJson.dependencies."react-native-reanimated") { $missingDeps += "react-native-reanimated" }
if (-not $packageJson.dependencies."expo-blur") { $missingDeps += "expo-blur" }
if (-not $packageJson.dependencies."expo-linear-gradient") { $missingDeps += "expo-linear-gradient" }

if ($missingDeps.Count -gt 0) {
    Write-Host "  ⚠️  Missing dependencies: $($missingDeps -join ', ')" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ All required dependencies installed" -ForegroundColor Green
}

# Fix 4: Create theme placeholder fix for colors.text
Write-Host "[4/8] Checking theme colors..." -ForegroundColor Yellow
if (Test-Path "src\theme\colors.ts") {
    $colorsContent = Get-Content "src\theme\colors.ts" -Raw
    if ($colorsContent -notmatch "placeholder:") {
        Write-Host "  ⚠️  WARNING: colors.text.placeholder not defined" -ForegroundColor Yellow
        Write-Host "     Need to add: placeholder: '#999999' to text colors" -ForegroundColor Yellow
    } else {
        Write-Host "  ✅ Placeholder color defined" -ForegroundColor Green
    }
}

# Fix 5: TypeScript strict checks
Write-Host "[5/8] Checking TypeScript config..." -ForegroundColor Yellow
if (Test-Path "tsconfig.json") {
    Write-Host "  ✅ tsconfig.json exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  WARNING: tsconfig.json not found" -ForegroundColor Yellow
}

# Fix 6: Check for duplicate exports
Write-Host "[6/8] Checking for duplicate code..." -ForegroundColor Yellow
Write-Host "  ℹ️  BLEService.ts has duplicate class - needs manual cleanup" -ForegroundColor Cyan
Write-Host "  ℹ️  OnboardingScreen.tsx has duplicate styles - needs manual cleanup" -ForegroundColor Cyan

# Fix 7: Navigator ID prop warnings
Write-Host "[7/8] Checking navigator configuration..." -ForegroundColor Yellow
Write-Host "  ℹ️  React Navigation 7+ requires 'id' prop on navigators" -ForegroundColor Cyan
Write-Host "     Add: id='MainTabs' to <Tab.Navigator>" -ForegroundColor Cyan
Write-Host "     Add: id='AuthStack' to <Stack.Navigator>" -ForegroundColor Cyan

# Fix 8: Summary
Write-Host "[8/8] Generating fix summary..." -ForegroundColor Yellow
Write-Host ""

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ AUTOMATED FIXES COMPLETE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 MANUAL FIXES REQUIRED:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  BLEService.ts - Remove duplicate class definition" -ForegroundColor White
Write-Host "   Lines 45-135: First class (keep)" -ForegroundColor Gray
Write-Host "   Lines 155-684: Second class (remove)" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣  OnboardingScreen.tsx - Remove duplicate StyleSheet" -ForegroundColor White
Write-Host "   Line 340: First StyleSheet.create (remove)" -ForegroundColor Gray
Write-Host "   Line 604: Second StyleSheet.create (keep)" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣  AppNavigatorRBAC.tsx - Add 'id' props" -ForegroundColor White
Write-Host "   <Tab.Navigator id='UserTabs' ...>" -ForegroundColor Gray
Write-Host "   <Tab.Navigator id='AdminTabs' ...>" -ForegroundColor Gray
Write-Host "   <Stack.Navigator id='AuthStack' ...>" -ForegroundColor Gray
Write-Host ""
Write-Host "4️⃣  HardwareHealthWidget.tsx - Add missing import" -ForegroundColor White
Write-Host "   import { withSpring } from 'react-native-reanimated';" -ForegroundColor Gray
Write-Host ""
Write-Host "5️⃣  LoginScreen.tsx - Fix color references" -ForegroundColor White
Write-Host "   colors.text.placeholder -> colors.text.secondary" -ForegroundColor Gray
Write-Host "   colors.text.white -> colors.text.onWhite" -ForegroundColor Gray
Write-Host ""
Write-Host "6️⃣  babel.config.js - Add reanimated plugin" -ForegroundColor White
Write-Host "   plugins: ['react-native-reanimated/plugin']" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Apply manual fixes above" -ForegroundColor White
Write-Host "2. Run: npm start -- --clear" -ForegroundColor White
Write-Host "3. Test on Expo Go" -ForegroundColor White
Write-Host ""

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
