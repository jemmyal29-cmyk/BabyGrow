# TESTING SCRIPT
# Test if OnboardingScreen changes caused Metro crash

Set-Location C:\BabyGrow\mobile-app

Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "🔍 DIAGNOSTIC TEST" -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if main App.tsx works
Write-Host "1. Checking App.tsx..." -ForegroundColor Green
node -e "try { require('./App.tsx'); console.log('✅ App.tsx loads'); } catch(e) { console.log('❌ Error:', e.message); }"

Write-Host ""

# Step 2: Try React Native CLI directly
Write-Host "2. Testing bare Metro Bundler..." -ForegroundColor Green
npx react-native start --port 8082 --verbose
