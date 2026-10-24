# MejaKu — Platform Pemesanan Makanan Pujasera dari Meja Lewat QR

> Website pemesanan makanan pujasera / food court modern berbasis web tanpa perlu unduh aplikasi. Pelanggan cukup memindai kode QR di meja, memilih hidangan & preferensi rasa, memeriksa pesanan, membayar via QRIS, dan memantau status pesanan hingga disajikan langsung ke meja.

---

## 🚀 Fitur Utama & 5 Layar Lengkap

1. **Layar Landing (`/`)**
   - **Hero Section**: Heading dekoratif *Lobster Two*, deskripsi, tombol *Pesan Sekarang* & *Lihat Cara Kerjanya*, serta 3 kartu mini (*Tanpa antre kasir, Tanpa menu fisik, Tanpa panggil pramusaji*).
   - **Simulasi Kamera Scanner QR**: Modal interaktif dengan animasi laser scanner dan tombol stiker meja simulasi (Meja A12, Meja B07, Meja C15) yang langsung mengarahkan ke menu.
   - **Tiga Langkah Cara Kerja**: 01 Pindai QR, 02 Jelajahi & Sesuaikan, 03 Bayar & Nikmati.
   - **Menu Unggulan**: Sate Ayam Madura, Nasi Goreng Gila Jakarta, Soto Betawi Daging Sapi, Es Cendol Durian.
   - **Keuntungan Kami**: Tak perlu tunggu pramusaji, pembayaran praktis, pesanan langsung ke mitra dapur, dukungan multibahasa.
   - **Phone Mockup Preview**: Ilustrasi aplikasi di peramban ponsel.
   - **Footer Lengkap**: Kolom Produk, Perusahaan, Bantuan, watermark besar *MejaKu*, copyright, dan legal bar.

2. **Layar Detail Makanan (`/menu/nasi-campur-bali-agung`)**
   - **Galeri Foto Interaktif**: 1 foto utama resolusi tinggi + 5 thumbnail foto yang dapat diklik untuk berganti foto secara halus.
   - **Pilihan Porsi**: Radio card tunggal (*Porsi Biasa* +Rp 0, *Porsi Jumbo* +Rp 15.000).
   - **Tingkat Kepedasan**: Chip pilihan (*Biasa*, *Sedang 🌶️*, *Pedas Gila 🔥🌶️*).
   - **Pelengkap Tambahan**: Checkbox mandiri (*Ekstra Sambal Matah* +Rp 5.000, *Sate Lilit Tuna* +Rp 8.000, *Kulit Ayam Renyah* +Rp 12.000).
   - **Quantity Stepper**: Stepper minus/plus dengan animasi bump & guard minimal 1.
   - **Kalkulasi Harga Real-time**: Tombol *Tambahkan ke Pesanan Meja* langsung menghitung `Rp 63.000` (atau sesuai opsi terpilih).
   - **Catatan Diet & Bahan**: Panel hangat alergen dan komposisi makanan.
   - **Rekomendasi Menu**: 4 hidangan pelengkap yang dapat dipilih.

3. **Layar Checkout (`/checkout`)**
   - **Langkah 1 (Periksa Pesanan)**: Ringkasan produk dengan chip kustomisasi, tombol *Ubah pilihan* yang membawa kembali ke halaman detail dengan state tersimpan, dan quantity stepper.
   - **Langkah 2 (Penerimaan Pesanan)**: *Santap di Meja* dengan badge terverifikasi Meja A12 (Jakarta Culinary Hall Lantai 2). Opsi pengantaran menampilkan penjelasan informatif bahwa fitur kurir belum tersedia di MVP.
   - **Langkah 3 (Catatan Khusus)**: Textarea dengan counter karakter reaktif `0 / 150`.
   - **Input Kupon Promo**: Validasi kode kupon (coba ketik `MEJAKUHEMAT` untuk diskon Rp 10.000).
   - **Ringkasan Biaya**: Rincian Subtotal, Biaya layanan meja (Rp 3.000), Pajak 10% (Rp 6.600), dan Total (Rp 72.600).
   - **Pencegahan Double Submit**: Tombol *Buat Pesanan* memiliki loading state dan proteksi duplikasi.

4. **Layar Pembayaran (`/payment/:orderId`)**
   - **Timer Batas Waktu**: Hitung mundur aktif (18 menit 42 detik) yang terus berjalan secara real-time.
   - **Metode Pembayaran**: 3 pilihan (QRIS Otomatis [aktif], Transfer Bank / VA, Dompet Digital).
   - **Panel QRIS**: Visual QR code SVG dengan logo MejaKu di tengah, nominal Rp 72.600, bar kode pembayaran `#MJK72600BA` dengan tombol *Salin* ke clipboard beserta feedback tersalin.
   - **Petunjuk Pembayaran**: 3 langkah transfer aman.
   - **Simulasi Pengecekan**: Tombol *Saya Sudah Bayar · Cek Pembayaran* dengan animasi loading verifikasi gateway realistis menuju halaman konfirmasi.
   - **Konfirmasi Manual**: Modal input referensi transfer bank.

5. **Layar Konfirmasi & Status Pesanan (`/orders/:orderId/confirmation`)**
   - **Animasi Confetti**: Perayaan konfeti visual saat halaman terbuka.
   - **Timeline Status Dapur 4 Tahap**:
     1. *Pesanan Diterima & Terbayar* (Selesai/Hijau)
     2. *Sedang Disiapkan di Dapur* (Aktif/Jingga Berdenyut)
     3. *Siap Disajikan / Dikirim*
     4. *Pesanan Selesai*
   - **Toolbar Simulasi Live Dapur**: Tombol interaktif untuk menguji perubahan status dapur dari tahap 1 hingga tahap 4 secara real-time!
   - **Detail Pengantaran Meja**: Konfirmasi Meja A12 Lantai 2 Jakarta Culinary Hall.
   - **Ringkasan Terbayar**: Rincian tagihan lunas dan metode pembayaran QRIS.

---

## 🎨 Design Tokens & Tipografi

- **Latar Belakang**: `#FAF6F0` (Krem hangat)
- **Primary / Aksen Utama**: `#C2410C` (Terracotta / Jingga bata)
- **Accent**: `#F97316`
- **Surface**: `#FFFFFF` (Putih)
- **Surface Warm**: `#F5ECE1`
- **Text Primary**: `#1E293B`
- **Footer**: `#1E293B`
- **Tipografi**:
  - Heading, Brand, Watermark: **Lobster Two (700 Bold)**
  - Body, Badges, Prices, Inputs: **Urbanist (400, 500, 600, 700, 800)**

---

## 🛠️ Menjalankan Proyek

### 1. Menjalankan Server Pengembangan (Dev)
```bash
npm run dev
```
Aplikasi akan aktif di `http://localhost:5173/`.

### 2. Menjalankan Validasi & Pengujian Unit
```bash
npm test
```
Menjalankan suite pengujian perhitungan harga, kupon promo, limit karakter catatan, dan state machine status pembayaran & dapur.

### 3. Membangun Bundle Produksi (Build)
```bash
npm run build
```

---

## 📱 Responsivitas
- **Desktop (≥1200px)**: Tata letak dua kolom (624px/576px pada detail, 800px/432px pada transaksi), container fluid 1280px.
- **Tablet (768px – 1199px)**: Grid responsif 2 kolom, padding proporsional.
- **Mobile (<768px / 360px – 390px)**: Tata letak kartu stack vertikal tanpa horizontal overflow, drawer navigasi hamburger, kontrol sentuh minimal 44×44px.
