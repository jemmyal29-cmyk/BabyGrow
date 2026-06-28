# Quick Switch untuk Testing
# Gunakan script ini jika masih error

# ============================================
# SWITCH TO SIMPLE NAVIGATOR (NO ERRORS)
# ============================================
Write-Host "Switching to SIMPLE navigator (guaranteed no errors)..." -ForegroundColor Yellow

$appTsxContent = @'
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigatorSimple from './src/navigation/AppNavigatorSimple';

export default function App() {
  return (
    <SafeAreaProvider>
      <AppNavigatorSimple />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
'@

Set-Content -Path "C:\BabyGrow\mobile-app\App.tsx" -Value $appTsxContent
Write-Host "✅ Switched to Simple Navigator!" -ForegroundColor Green
Write-Host "Now restart Metro: cd C:\BabyGrow\mobile-app; npx expo start --clear" -ForegroundColor Cyan
