# Switch back to Full Navigator

# ============================================
# SWITCH TO FULL NAVIGATOR (WITH ALL FEATURES)
# ============================================
Write-Host "Switching to FULL navigator (with all screens)..." -ForegroundColor Yellow

$appTsxContent = @'
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigator />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
'@

Set-Content -Path "C:\BabyGrow\mobile-app\App.tsx" -Value $appTsxContent
Write-Host "✅ Switched to Full Navigator!" -ForegroundColor Green
Write-Host "Now restart Metro: cd C:\BabyGrow\mobile-app; npx expo start --clear" -ForegroundColor Cyan
