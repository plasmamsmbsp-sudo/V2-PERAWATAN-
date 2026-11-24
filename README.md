# 🌴 Realisasi Perawatan Kebun — PT Kencana Agri
**Powered BY Plasma Wanggarasi**

Aplikasi web & Android APK minimalis untuk input realisasi perawatan kebun, pemakaian material (pupuk & racun), serta rekapitulasi harian dan bulanan yang terhubung ke Google Spreadsheets.

## Struktur File
- `index.html` — Tampilan minimalis dengan splash screen logo resmi Kencana & voiceover pembuka.
- `style.css` — Tema warna hijau tua (`#056839`), kuning terang (`#FFF200`), dan emas (`#A6891B`) sesuai identitas logo Kencana.
- `app.js` — Manajemen database PT, Afdeling, Blok, Jenis Pekerjaan, Satuan Item (`Ha`/`Pokok`/`Kg`/dll.), Material 1 & 2 (Pupuk & Racun), Asisten, Mandor, serta rekap harian/bulanan & sync Google Sheets.
- `logo-kencana.png` — Logo resmi Kencana.
- `package.json`, `capacitor.config.json`, `.github/workflows/build-apk.yml` — Konfigurasi build otomatis Android `.apk`.