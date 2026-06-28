# 🔐 BabyGrow - Login Credentials

## ✅ Status: Login FIXED!
Login screen sudah diperbaiki dan menggunakan authStore dengan benar.

---

## 👤 Test Accounts

### 1️⃣ Parent Account (Regular User)
```
Email: parent@test.com
Password: parent123
Role: ROLE_USER
```
**Akses:**
- Dashboard Orang Tua
- Tambah/Edit Data Anak
- Ukur Pertumbuhan (Manual & AI Vision)
- Lihat Grafik Pertumbuhan
- Resep Makanan MBG
- AI Assistant

---

### 2️⃣ Admin Account (Puskesmas/Kader)
```
Email: admin@puskesmas.id
Password: admin123
Role: ROLE_ADMIN
```
**Akses:**
- Dashboard Admin
- Monitor Semua Anak di Wilayah
- Statistik Stunting
- Laporan Posyandu
- Manajemen User

---

## 🚀 Quick Login di Aplikasi

Di layar login, ada tombol **"Login Cepat (Demo)"** untuk testing:

1. **Tap "👤 Parent"** → Auto login sebagai parent@test.com
2. **Tap "👨‍⚕️ Admin"** → Auto login sebagai admin@puskesmas.id

---

## 🔧 Technical Details

### Authentication Flow:
1. **Input** → Email + Password
2. **Validation** → Check against mock database
3. **Success** → Save to Zustand + AsyncStorage
4. **Navigation** → Auto redirect by AppNavigatorRBAC
   - Parent → UserTabs (Dashboard)
   - Admin → AdminTabs (Dashboard)

### Mock Database Location:
`mobile-app/src/store/authStore.ts` → `mockAuthenticate()` function

### Add More Users:
Edit `mockUsers` object in `authStore.ts`:
```typescript
'newemail@test.com': {
  password: 'password123',
  user: {
    id: 'user_003',
    email: 'newemail@test.com',
    name: 'New User',
    role: 'ROLE_USER',
    avatar: '👨',
    phone: '+628123456789',
  },
},
```

---

## 📝 Testing Checklist

✅ Input email & password manual
✅ Click "Masuk" button
✅ Quick login buttons
✅ Remember Me checkbox
✅ Show/Hide password toggle
✅ Validation error messages
✅ Success notification
✅ Auto navigation after login
✅ Logout functionality
✅ Persist auth state (reload app)

---

## ⚡ Troubleshooting

### Problem: "Email atau password salah"
**Solution:** 
- Pastikan email lowercase: `parent@test.com` (bukan `Parent@test.com`)
- Password case-sensitive: `parent123`

### Problem: Stuck di login screen
**Solution:**
- Check Metro bundler still running
- Reload app (shake phone → Reload)
- Clear AsyncStorage: Settings → Clear Data

### Problem: Auto logout setelah reload
**Solution:**
- Zustand persist error → Restart app completely
- Check AsyncStorage permissions

---

## 🎯 Next Steps

Setelah login berhasil, Anda akan masuk ke:

**Parent (ROLE_USER):**
- 🏠 **Beranda** → Quick actions & overview
- 👶 **Anak** → List data anak
- 📊 **Grafik** → Growth charts
- 👤 **Profil** → Settings & logout

**Admin (ROLE_ADMIN):**
- 📊 **Dashboard** → Statistics & monitoring
- 👥 **Kelola Anak** → All children data
- 📈 **Laporan** → Reports & analytics
- ⚙️ **Pengaturan** → System settings

---

**Updated:** January 25, 2026
**Status:** ✅ WORKING
