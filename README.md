# JejakTumbuh App (React Native / Expo)

Aplikasi mobile untuk orang tua memantau tumbuh kembang anak: mencatat berat dan tinggi badan,
melihat status gizi otomatis (standar WHO), membaca artikel gizi, tumbuh kembang, dan kesehatan
gigi anak, serta mencari posyandu, puskesmas, atau dokter gigi anak.
Bagian dari Tugas Besar TST x PAWM 2026, tema Health & Wellbeing.

## Akun demo

| Email | Password |
|---|---|
| demo@jejaktumbuh.id | demo12345 |

## Cara menjalankan

1. Pasang Node.js (versi LTS) dan aplikasi **Expo Go** di HP.
2. Di folder proyek:
   ```bash
   npm install
   npx expo start
   ```
3. Pindai QR code yang muncul memakai kamera HP (iPhone) atau aplikasi Expo Go (Android).
4. Login memakai akun demo di atas, atau daftar akun baru.

URL API diatur di file `.env`:

```
EXPO_PUBLIC_API_URL=https://jejaktumbuh.stei.fun/api
EXPO_PUBLIC_MITRA1_URL=   # API kelompok lain 1
EXPO_PUBLIC_MITRA2_URL=   # API kelompok lain 2
```

Setelah mengubah `.env`, jalankan ulang dengan `npx expo start --clear`.

## Layar dan navigasi

Navigasi memakai **Stack** (login, detail, form) dan **Bottom Tab** (4 tab utama).

| Layar | Jenis | Isi |
|---|---|---|
| Login, Daftar | Stack | form dengan validasi email dan password |
| Beranda | Tab | info dari API kelompok mitra, daftar artikel dengan filter kategori |
| Anakku | Tab | daftar profil anak milik akun yang login |
| Cari Layanan | Tab | daftar fasilitas kesehatan dengan filter jenis |
| Akun | Tab | profil orang tua, daftar API yang terhubung, keluar |
| Detail Artikel, Detail Layanan, Data Mitra | Stack | detail dari daftar |
| Detail Anak | Stack | status gizi terakhir, grafik berat, riwayat pengukuran, saran tempat periksa |
| Tambah Profil Anak, Tambah Pengukuran | Stack | form dengan validasi |

**Validasi form:** email harus valid, password minimal 8 karakter, tanggal berformat TTTT-BB-HH
dan tidak di masa depan, berat 1 sampai 50 kg, tinggi 40 sampai 150 cm.

## ApiService.js

`src/services/ApiService.js` memanggil:

1. **Microservice JejakTumbuh sendiri** (`https://jejaktumbuh.stei.fun/api`):
   `/auth/...` (daftar, login), `/children`, `/measurements` (growth-service),
   `/articles`, `/facilities` (recommendation-service).
2. **API kelompok lain**, dikonfigurasi di `src/config/mitra.js`, ditampilkan di Beranda
   (kartu "Info dari kelompok mitra").
