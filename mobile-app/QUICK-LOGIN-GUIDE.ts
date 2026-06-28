/**
 * QUICK LOGIN GUIDE - BabyGrow Testing
 * 
 * CARA LOGIN:
 * 1. Buka aplikasi
 * 2. Skip Onboarding (jika ada)
 * 3. Di LoginScreen, tap tombol "Quick Test"
 * 4. Atau manual:
 *    Email: user@babygrow.app
 *    Password: user123
 */

// ===== LOGIN CREDENTIALS =====

export const TEST_USERS = {
  parent: {
    email: 'user@babygrow.app',
    password: 'user123',
    role: 'user' as const,
    fullName: 'Ibu Sari Rahayu'
  },
  admin: {
    email: 'admin@babygrow.app',
    password: 'admin123',
    role: 'admin' as const,
    fullName: 'Dr. Ahmad Kader'
  }
};

// ===== QUICK LOGIN BUTTONS =====
// Sudah ada di LoginScreen.tsx:
// - Tap "Quick Login - Test User"
// - Tap "Quick Login - Admin"

// ===== MANUAL LOGIN =====
// Email: user@babygrow.app
// Password: user123

// ===== TROUBLESHOOTING =====
// Jika login gagal:
// 1. Clear cache: npx expo start -c
// 2. Clear AsyncStorage (hapus app data)
// 3. Check console untuk error messages

export default TEST_USERS;
