# MejaKu — Spesifikasi Desain untuk AI Coding

Dokumen ini adalah acuan implementasi website MejaKu berdasarkan lima layar Figma yang dipilih. Fokus: reproduksi visual, konten berbahasa Indonesia, komponen reusable, dan alur pemesanan yang konsisten.

## 1. Cara menggunakan dokumen ini

Berikan dokumen ini **bersama kelima gambar referensi** kepada AI coding. Gunakan prompt pada bagian 14. Gambar menjadi acuan komposisi; nilai hasil inspeksi Figma di bawah menjadi acuan warna, font, ukuran, dan konten.

**Status spesifikasi:**
- **Teramati:** tampilan desktop, warna, font, ukuran, teks, dan nominal dari Figma.
- **Rekomendasi implementasi:** route, breakpoint, state interaktif, struktur komponen, validasi, dan integrasi. Bagian ini bukan perilaku yang telah dibuktikan oleh prototipe Figma.
- Tidak ada desain mobile terpisah, kontrak API, gateway pembayaran, atau aset foto final yang dikonfirmasi dalam referensi ini.

### Sumber desain

Figma: `https://www.figma.com/design/ORHerNoMS60AzS34Z81lFs` — halaman `0:1`.

| Layar | Node Figma | Ukuran referensi | Gambar lokal |
|---|---|---|---|
| Landing | `1:1023` | 1440 × 4563 px | `.figma/imports/1_1023.png` |
| Detail makanan | `1:2` | 1440 × 2622 px | `.figma/imports/1_2.png` |
| Checkout | `1:197` | 1440 × 1804 px | `.figma/imports/1_197.png` |
| Pembayaran | `1:583` | 1440 × 2048 px | `.figma/imports/1_583.png` |
| Konfirmasi pesanan | `1:408` | 1440 × 1749 px | `.figma/imports/1_408.png` |

Path tersebut adalah screenshot keseluruhan layar, **bukan foto makanan untuk dipakai sebagai isi UI**. Jangan menjadikan screenshot sebagai satu gambar halaman; bangun HTML dan komponen nyata.

## 2. Konsep produk dan arah visual

MejaKu adalah layanan pemesanan makanan pujasera melalui kode QR meja: pelanggan memindai, memilih makanan dan opsi, memeriksa pesanan, membayar, kemudian melihat status penyiapan dan pengantaran ke meja.

Karakter visual: hangat, ramah, lokal, dan modern. Gunakan latar krem, aksen jingga bata, heading dekoratif, teks sans-serif yang ringan dibaca, kartu putih dengan sudut membulat, serta footer navy gelap. Pertahankan ruang kosong yang lapang. Hindari tema hitam penuh, gradient mencolok, glassmorphism, atau tampilan dashboard generik.

Semua UI utama menggunakan bahasa Indonesia. Format harga mengikuti rupiah tanpa desimal: `Rp 72.600`. Jangan mengganti copy menjadi bahasa Inggris atau mengubah nama makanan.

## 3. Design tokens

### Warna teramati

| Token yang disarankan | Nilai | Penggunaan |
|---|---|---|
| `background` | `#FAF6F0` | Latar utama dan navbar |
| `surface` | `#FFFFFF` | Kartu, input, panel |
| `surface-warm` | `#F5ECE1` | Band bagian landing, catatan, blok meja |
| `primary` | `#C2410C` | Tombol utama, harga, logo, pilihan aktif |
| `accent` | `#F97316` | Aksen ikon dan badge landing |
| `text-primary` | `#1E293B` | Heading, teks utama, latar footer |
| `text-secondary` | `#64748B` | Deskripsi dan breadcrumb |
| `text-muted` | `#8190A6` | Teks sekunder transaksi/footer |
| `slate-mid` | `#4A5D77` | Variasi teks sekunder |
| `border` | `#E2D4C9` | Outline hangat dan divider |
| `footer-divider` | `#334155` | Garis pemisah footer |
| `primary-soft` | `#FFF4EC` | Pilihan aktif dan pemberitahuan jingga |
| `success-soft` | `#ECFDF3` | Badge aman/terverifikasi |
| `success` | `#15803D` | Status sukses dan ikon check |
| `warning-soft` | `#FFF7E8` | Batas waktu pembayaran |
| `warning` | `#B45309` | Teks warning |
| `warning-border` | `#F1C58A` | Border panel deadline |
| `gold` | `#F59E0B` | Aksen kecil landing |

### Tipografi teramati

- **Lobster Two**, weight **700 / Bold**: logo, heading utama, heading section, heading ringkasan, watermark footer.
- **Urbanist**, weights **400, 500, 600, 700, 800**: seluruh body, navigation, input, badge, harga, dan tombol.
- Muat font tersebut, jangan menggantinya dengan serif atau sans-serif generik saat tersedia.

| Elemen | Font / ukuran desktop | Line-height |
|---|---|---|
| Hero landing | Lobster Two 700, 72 px | 1.05 |
| Heading section landing | Lobster Two 700, 48 px | 1.10 |
| Heading detail | Lobster Two 700, 48 px | 1.10 |
| Heading checkout | Lobster Two 700, 44 px | 1.10 |
| Heading pembayaran | Lobster Two 700, 46 px | 1.10 |
| Heading konfirmasi | Lobster Two 700, 48 px | 1.10 |
| Heading rekomendasi | Lobster Two 700, 40 px | Natural |
| Heading ringkasan | Lobster Two 700, 28 px | Natural |
| Logo navbar | Lobster Two 700, 28 px | Natural |
| Harga utama detail | Urbanist 800, 32 px | Natural |
| Body hero | Urbanist 400, 20 px | 1.60 |
| Deskripsi section | Urbanist 400, 18 px | 1.50 |
| Body utama transaksi | Urbanist 400, 16 px | 1.50 |
| Nama kartu menu | Urbanist 700, 18 px | Natural |
| Harga kartu menu | Urbanist 800, 20 px | Natural |
| Navigation | Urbanist 600, 15 px | Natural |
| Body kecil / metadata | Urbanist 400–700, 12–14 px | 1.40–1.50 |
| Eyebrow section | Urbanist 800, 14 px | Natural; tracking 2 px |
| Watermark footer landing/detail | Lobster Two 700, 180 px | 0.80; tracking −4 px |
| Watermark footer transaksi | Lobster Two 700, 154 px | 0.80; tracking −4 px |

Heading dekoratif hanya untuk judul, bukan paragraf, form, atau semua tombol. Eyebrow umumnya uppercase.

### Geometri dan ruang

- Lebar acuan desktop: **1440 px**; konten utama **1280 px**, margin kiri-kanan **80 px**.
- Implementasikan container fluid `max-width: 1280px` yang terpusat, bukan canvas absolut 1440 px.
- Navbar: **88 px** di landing, **80 px** di layar lainnya.
- Padding section landing umumnya **96 px** atas/bawah. Hero **72 px** atas/bawah.
- Grid menu landing: **4 kolom**, gap **24 px**, setiap kartu **296 × 399 px**.
- Grid rekomendasi detail: 4 kolom dalam container 1280 px, gap **32 px**. Distribusikan kolom agar tidak overflow.
- Kolom detail makanan: kiri **624 px**, kanan **576 px**, gap **80 px**.
- Layout transaksi: kiri **800 px**, kanan **432 px**, gap **48 px**.
- Gap kartu transaksi vertikal **20–24 px**. Padding kartu umumnya sekitar **24–28 px**; sesuaikan gambar.
- Radius kartu utama **24 px**; kartu tutorial **28 px**; hero image **32 px**; kontrol/input **10–16 px**; tombol pill **100 px / 9999 px**.
- Tombol landing: padding **14 px 28 px**, tinggi teramati sekitar **47 px**.
- Outline umum **1 px**. Tombol outline landing **1.5 px**.
- Shadow ringkasan transaksi: `0 10px 28px rgba(120, 53, 15, 0.071)`. Landing dan detail tidak memiliki efek shadow teramati.
- Tinggi total layar adalah acuan pembandingan screenshot, **bukan fixed height halaman**. Konten harus dapat tumbuh tanpa terpotong.

## 4. Komponen bersama

### Navbar

- Logo di kiri: kotak jingga bata bersudut membulat dengan huruf **M** putih, lalu wordmark **MejaKu** berwarna primary.
- Badge logo: 40 × 40 px di landing; 36 × 36 px pada halaman lain.
- Navigation: `Cara Kerja`, `Hidangan Unggulan`, `Keuntungan Kami`, `Mitra Kuliner`, `Harga`.
- Pembayaran dan konfirmasi tidak menampilkan `Harga` pada referensi.
- Link aktif `Hidangan Unggulan` berwarna primary pada layar pemesanan.
- CTA kanan: `Jadi Mitra` di landing, `Gabung Jadi Mitra` pada layar lain, sebagai tombol outline pill. Pertahankan ruang CTA sesuai screenshot meski tampilan thumbnail kurang jelas.
- Tidak ada bukti navbar sticky; gunakan normal document flow sebagai default.

### Footer

Footer full-width `#1E293B`: brand dan deskripsi di kiri, tiga kolom link di kanan, watermark MejaKu besar berkontras rendah di tengah bawah, kemudian divider dan bar legal.

Deskripsi: “Mengubah pujasera lokal, pusat kuliner, dan pedagang kaki lima menjadi pusat bersantap digital yang cepat, modern, dan menyenangkan.”

- **Produk:** Pindai & Pesan; Aplikasi Dapur Mitra; Dasbor Analitik; Studi Kasus.
- **Perusahaan:** Tentang Kami; Mitra Kuliner; Karier; Ruang Berita.
- **Bantuan:** Bantuan Mitra; Keamanan & API; FAQ Pelanggan; Hubungi Bantuan.
- Copyright: `© 2026 PT MejaKu Global Kuliner. Dibuat dengan cinta di Jakarta.`
- Legal landing/detail/checkout: Kebijakan Privasi; Syarat Layanan; Perjanjian Mitra.
- Pada transaksi terdapat variasi/jumlah link footer lebih pendek; gunakan gambar masing-masing sebagai acuan, bukan memperluas tinggi footer secara tidak perlu.
- Footer pembayaran memiliki badge: `Pembayaran aman · Bantuan setiap hari 09.00–22.00 WIB`.

### Primitive reusable

`Button`, `Badge`, `Breadcrumbs`, `SectionHeading`, `FoodCard`, `QuantityStepper`, `RadioCard`, `ChoiceChip`, `AddonCheckbox`, `PriceBreakdown`, `OrderSummary`, `Notice`, `HelpCallout`, dan `OrderTimeline`.

Gunakan ikon outline konsisten untuk QR, tas belanja, kunci, meja, lokasi, check, jam, panah, dan bantuan. Jangan mencampur banyak gaya ikon. Emoji yang merupakan bagian copy referensi boleh dipertahankan.

## 5. Layar Landing

Route yang disarankan: `/`.

### Struktur desktop teramati

| Section | Awal Y | Tinggi |
|---|---:|---:|
| Navbar | 0 | 88 |
| Hero | 88 | 820 |
| Cara kerja | 908 | 766 |
| Featured menu | 1674 | 713 |
| Keuntungan | 2387 | 710 |
| App preview | 3097 | 872 |
| Footer | 3969 | 594 |

### Hero

Layout dua kolom: copy kiri 560 px, media kanan 672 × 560 px, gap 48 px. Media berada di tengah vertikal dan radius 32 px.

- Eyebrow: `Pindai. Pesan. Nikmati.`
- H1: `Pindai. Pesan. Nikmati.\nLangsung dari Mejamu`. Ikuti wrapping alami pada gambar; jangan memaksa satu baris.
- Deskripsi: “Pengalaman bersantap tanpa kios. Tanpa antre panjang di kasir, tanpa menunggu menu fisik, dan tanpa merepotkan staf. Nikmati hidangan kaki lima yang langsung tersaji di mejamu.”
- Primary: `Pesan Sekarang`; secondary outline: `Lihat Cara Kerjanya`.
- Tiga kartu kecil: `Tidak perlu / Antre kasir`, `Tidak perlu / Menu fisik`, `Tidak perlu / Panggil pramusaji`.

### Cara kerja

Band krem lebih gelap `surface-warm`. Heading terpusat:
- Eyebrow `TANPA KASIR, TANPA KERUMUNAN`.
- Judul `Tiga Langkah Mudah untuk Menikmati Hidangan`.
- Deskripsi `Kami menyederhanakan proses agar kamu bisa fokus menikmati cita rasa.`

Tiga kartu putih sama lebar, sekitar 411 × 360 px, gap 24 px. Masing-masing memiliki ikon, nomor 01–03, judul, deskripsi, dan strip CTA bawah.

1. **Pindai Kode QR di Meja** — “Cari stiker kode QR MejaKu di mejamu, lalu pindai dengan kamera ponsel. Tidak perlu mengunduh aplikasi.” CTA `Mulai dari sini`.
2. **Jelajahi & Sesuaikan Pesanan** — “Lihat foto makanan jelas, pilih level pedas, tambahkan ekstra, dan buat pesanan sesuai selera Anda.” CTA `Sesuaikan pesanan`.
3. **Bayar & Nikmati** — “Selesaikan pembayaran dengan GoPay, OVO, ShopeePay, atau Kartu Kredit. Pesanan Anda akan langsung dikirim ke dapur penjual.” CTA `Pesanan langsung ke dapur`.

### Featured menu

- Eyebrow `SEGAR DARI MITRA KULINER`.
- Judul `Paling Banyak Dipesan di MejaKu`.
- CTA outline kanan `Lihat Semua Menu Pujasera`.
- Empat kartu dengan media di atas, merchant, badge kecil, nama, harga, dan tombol soft-orange `+ Tambahkan ke Pesanan`.

| Nama | Merchant | Badge | Harga |
|---|---|---|---:|
| Sate Ayam Madura Spesial | Warung Bali Dwi | WAJIB COBA 🔥 | Rp 32.000 |
| Nasi Goreng Gila Jakarta | Warung Bali Dwi | FAVORIT LOKAL | Rp 28.000 |
| Soto Betawi Daging Sapi | Warung Bali Dwi | HANGAT & NIKMAT | Rp 45.000 |
| Es Cendol Durian Klasik | Warung Bali Dwi | MANIS MENYEGARKAN | Rp 22.000 |

### Keuntungan

Band `surface-warm`, heading terpusat:
- Eyebrow `DIRANCANG UNTUK PELANGGAN MODERN`.
- Judul `Pengalaman Kuliner Kaki Lima yang Lebih Baik`.
- Deskripsi “Baik bersantap sendiri, bersama rekan kerja, maupun keluarga, MejaKu membuat proses makan jadi lebih mudah.”

Empat kartu putih dengan ikon dan copy:
- **Tak Perlu Menunggu Pramusaji:** “Pindai kode QR dan langsung mulai memesan. Tak perlu lagi memanggil pramusaji yang sedang sibuk.”
- **Pembayaran Bersama yang Praktis:** “Bagi tagihan dengan mudah atau biarkan setiap orang memindai, memesan, dan membayar makanannya sendiri. Tanpa perlu menghitung manual.”
- **Pesanan Langsung ke Mitra:** “Pesanan langsung masuk ke layar dapur gerai terkait sehingga meminimalkan kesalahan.”
- **Dukungan Multibahasa:** “Menu kuliner lokal diterjemahkan otomatis ke bahasa Inggris, Mandarin, dan Korea. Cocok untuk wisatawan mancanegara.”

### App preview

- Mockup ponsel kiri 340 × 680 px, bingkai slate radius 48 px; layar dalam 316 × 656 px, radius 38 px.
- Isi preview: `09:41`, logo MejaKu, `Meja 12 · Pujasera Sunset`, `Bakso Sapi Urat Super`, deskripsi kaldu tulang sapi/mi/bawang goreng, `Rp 24.000`, `Tambah +`, keranjang `2`, `Lihat Keranjang`, `Rp 52.000`.
- Copy kanan: eyebrow `TANPA PERLU INSTALASI`; judul `Dirancang untuk Peramban Ponselmu`.
- Deskripsi: “MejaKu berjalan dengan teknologi web ringan dan optimal. Pelanggan cukup memindai kode, memilih hidangan lokal favorit, lalu membayar tanpa memenuhi ponsel dengan aplikasi tambahan.”
- Bullet: kompatibel dengan Safari, Chrome, dan pemindai QR bawaan; dimuat kurang dari satu detik pada jaringan 4G pujasera tidak stabil; menu dikonfigurasi berdasarkan lokasi QR meja.
- CTA `Presentasi Kemitraan` dan `Lihat Contoh Langsung`.
- Preview ponsel adalah ilustrasi pemasaran, **bukan state keranjang transaksi utama**.

## 6. Layar Detail Makanan

Route yang disarankan: `/menu/nasi-campur-bali-agung`.

- Breadcrumb: `Beranda > Warung Bali Dwi > Nasi Campur Bali Agung`.
- Grid dimulai sekitar Y=145 px. Gallery kiri 624 px; panel kanan 576 px.
- Gallery: satu gambar besar bersudut membulat, lalu lima thumbnail; thumbnail aktif memakai outline primary. Pada referensi media ini tampak abu-abu/placeholder.
- Merchant badge `👨‍🍳 WARUNG BALI DWI · ANDALAN`; rating `4.9 (350+ ulasan)` di sisi kanan.
- H1 `Nasi Campur Bali Agung`; harga dasar **Rp 58.000**.
- Deskripsi: “Nikmati sajian khas Bali autentik dalam satu piring: sate lilit tuna, ayam betutu suwir yang dimasak perlahan, kulit renyah, lawar kacang panjang, kacang sangrai, dan Sambal Matah racikan tangan. Disajikan dengan nasi melati hangat beraroma pandan.”

### Konfigurasi produk

**Pilih Ukuran Porsi** — radio-card, hanya satu pilihan:
- `Porsi Biasa` — `Ukuran porsi standar`, tambahan Rp 0; aktif pada referensi.
- `Porsi Jumbo` — `+ Rp 15.000 (Daging dua kali lebih banyak)`.

**Tingkat Kepedasan** — pilihan tunggal berbentuk chip, dapat wrap:
- `Biasa (Tidak Pedas)`.
- `Sedang (Direkomendasikan) 🌶️` — aktif pada referensi.
- `Pedas Gila (Ekstra Pedas!) 🔥🌶️`.

**Tambahkan Pelengkap** — checkbox independen:
- `Ekstra Sambal Matah` — **+ Rp 5.000**, terpilih.
- `Tambahkan Sate Lilit Tuna (1 buah)` — **+ Rp 8.000**.
- `Kulit Ayam Bali Renyah` — **+ Rp 12.000**.

Bar aksi: stepper `− 1 +` dan CTA primary `Tambahkan ke Pesanan Meja · Rp 63.000`.

Catatan panel hangat: heading `🌾 Bahan & Catatan Diet`; copy “Mengandung makanan laut (Sate Lilit Tuna), ayam, dan kacang sangrai. Diolah dengan minyak kelapa. Pilihan bebas gluten tersedia sesuai permintaan. Tinggi protein (sekitar 38 g protein).” Ini copy referensi, bukan validasi nutrisi independen.

### Rekomendasi

Mulai section sekitar Y=1306 px; heading `LENGKAPI HIDANGANMU / Mungkin Kamu Juga Suka`. Empat kartu:
- Tuna Sate Lilit Bali — Rp 35.000 — MANIS & GURIH.
- Soto Betawi Daging — Rp 45.000 — HANGAT & NIKMAT.
- Nasi Goreng Gila — Rp 28.000 — FAVORIT LOKAL.
- Es Cendol Durian — Rp 22.000 — MANIS MENYEGARKAN.

Semua merchant `Warung Bali Dwi`, CTA `+ Tambahkan ke Pesanan`. Footer mulai Y=2028 px.

## 7. Layar Checkout

Route yang disarankan: `/checkout`.

- Breadcrumb `Beranda > Warung Bali Dwi > Nasi Campur Bali Agung > Pembayaran`.
- Eyebrow `Sedikit Lagi, Pesanan Siap`.
- H1 `Selesaikan Pesananmu`.
- Deskripsi “Periksa pesananmu, pilih cara penerimaan, lalu bayar dengan aman. Segar dari Warung Bali Dwi.”
- Badge hijau `Pembayaran aman` pada sisi kanan heading.
- Grid mulai Y=289 px: kiri 800 px, kanan 432 px, gap 48 px. Footer mulai Y=1248 px.

### Kiri: tiga kartu langkah

1. **Periksa pesananmu**
   - Subteks `Disiapkan Warung Bali Dwi · Estimasi 20–25 menit`.
   - Area media/ruang item di kiri seperti gambar, detail di tengah, harga di kanan.
   - Merchant `Warung Bali Dwi · Andalan`; item `Nasi Campur Bali Agung`, Rp 63.000.
   - Chip `Porsi Biasa`, `Sedang 🌶️`, `+ Ekstra Sambal Matah`.
   - Link `Ubah pilihan`; stepper quantity 1 di kanan bawah.
2. **Pilih cara menerima pesanan**
   - Subteks `Santap di meja atau kirim ke alamat terdekat`.
   - Radio-card `Santap di Meja`, copy `Kami akan mengantarkannya langsung kepadamu`, badge `Tercepat` — aktif.
   - Radio-card `Pengantaran`, copy `Ke alamat terdekat` — tidak aktif.
   - Blok `Mejamu / Meja A12 · Jakarta Culinary Hall`, badge hijau `Kode QR terverifikasi`.
3. **Tambahkan catatan**
   - Subteks `Beri tahu dapur tentang preferensi atau kebutuhan diet`.
   - Textarea placeholder `Contoh: Sambal dipisah. Tanpa kacang karena alergi.`
   - Counter `0 / 150`.

### Kanan: ringkasan

- Kartu putih, outline hangat, shadow ringan.
- Heading `Ringkasan Pesanan`, badge `1 menu`.
- Item `Nasi Campur Bali Agung`; `1 × Porsi Biasa · Sedang · Ekstra sambal`.
- Input `Kode promo` dan tombol `Gunakan`.
- Breakdown: Subtotal Rp 63.000; Biaya layanan meja Rp 3.000; Pajak (10%) Rp 6.600.
- Total **Rp 72.600**.
- CTA `Buat Pesanan · Rp 72.600` dengan ikon kunci.
- Subteks `Pembayaran aman · Tanpa biaya tersembunyi`.
- Notice `Siap dalam 20–25 menit / Kami akan memberi tahu saat pesananmu keluar dari dapur.`
- Bantuan `Butuh bantuan untuk pesananmu? / Hubungi Bantuan MejaKu`.

## 8. Layar Pembayaran

Route yang disarankan: `/payment/:orderId`.

- Breadcrumb `Beranda > Warung Bali Dwi > Pesanan > Pembayaran`.
- H1 `Selesaikan Pembayaranmu`.
- Deskripsi “Pilih metode pembayaran yang paling nyaman. Pesanan akan langsung diteruskan ke dapur setelah pembayaran terverifikasi.”
- Panel deadline kanan, ukuran 360 × 115 px, radius 18 px, warna warning-soft: `BATAS WAKTU PEMBAYARAN`, `Hari ini, 13:00 WIB`, `Selesaikan dalam`, timer **00 : 18 : 42**.
- Grid mulai Y=300 px; kolom 800/432 px, gap 48 px. Footer mulai Y=1460 px.

### Panel pilih metode

Heading `Pilih Metode Pembayaran`, subteks `Semua transaksi diproses melalui koneksi aman dan terenkripsi.`, badge `Pembayaran Aman`.

Tiga radio-card horizontal:
1. **QRIS**, badge `TERPILIH`, copy `Scan dari semua aplikasi bank & e-wallet` — aktif.
2. **Transfer Bank / VA**, copy `BCA, Mandiri, BNI, BRI, dan bank lainnya`.
3. **Dompet Digital**, badge `INSTAN`, copy `GoPay, OVO, DANA, dan ShopeePay`.

### Panel QRIS

- Header `Bayar dengan QRIS`, copy `Pindai kode QR berikut dari aplikasi pilihanmu.`, badge `QRIS OTOMATIS`.
- QR di kiri; caption `QR berlaku hingga 13:00 WIB`.
- Kanan QR: `Total Pembayaran`, **Rp 72.600**, `Pastikan nominal yang tampil di aplikasi sama.`
- Bar kode: `KODE PEMBAYARAN`, **MJK72600BA**, tombol `Salin`.
- Logo/chip `DAPAT DIBAYAR MELALUI`: BCA mobile, Livin’, BRImo, GoPay, DANA.
- Blok hangat **Langkah Pembayaran**:
  1. `Buka aplikasi bank atau dompet digital` — pilih menu Bayar, Scan, atau QRIS pada halaman utama aplikasi.
  2. `Pindai kode QR dan periksa detail` — pastikan merchant MejaKu dan total Rp 72.600 sesuai.
  3. `Konfirmasi pembayaran` — masukkan PIN, kembali ke halaman ini, lalu cek pembayaran.
- Notice hijau: `Pembayaran diverifikasi otomatis. MejaKu tidak pernah meminta PIN, OTP, atau kata sandi akunmu.`
- Help callout `Ada kendala saat melakukan pembayaran?`, copy bantuan tanpa meminta data rahasia, action `Chat Bantuan`.

### Kanan

- `Ringkasan Pesanan`, badge `1 Menu`.
- Nomor pesanan **#MJK-72600-BA**, badge `Meja A12`.
- Produk/configuration sama dengan checkout, merchant Warung Bali Dwi.
- `Subtotal Makanan` Rp 63.000; `Biaya Pelayanan Meja` Rp 3.000; `Pajak PB1 (10%)` Rp 6.600; `Total Pembayaran` **Rp 72.600**.
- Notice `Menunggu Pembayaran / Status akan diperbarui otomatis setelah transaksi berhasil.`
- Primary `Saya Sudah Bayar · Cek Pembayaran`.
- Secondary outline `Konfirmasi Pembayaran Manual`.
- Copy `Jangan tutup halaman ini sebelum status pembayaran berhasil dikonfirmasi.`
- Notice `Pesananmu tetap tersimpan / Jika transaksi tertunda, kamu bisa membuka kembali pesanan ini dari riwayat MejaKu.`

**Keamanan:** gambar QR referensi tidak membuktikan payload pembayaran valid. Untuk produksi, QR, deadline, VA, status, dan nominal wajib berasal dari backend/gateway. Jangan menganggap klik “Saya Sudah Bayar” sebagai bukti pembayaran.

## 9. Layar Konfirmasi Pesanan

Route yang disarankan: `/orders/:orderId/confirmation`.

- Breadcrumb `Beranda > Warung Bali Dwi > Pesanan Berhasil`.
- H1 `Makananmu Sedang Disiapkan!`.
- Deskripsi “Terima kasih! Pembayaran berhasil diverifikasi. Koki di Warung Bali Dwi telah menerima pesananmu dan sedang mulai meracik hidangan segar.”
- Badge kanan `No. Pesanan: #MJK-72600-BA`.
- Grid mulai Y=302 px: kiri 800 px, kanan 432 px. Footer mulai Y=1211 px.

### Kiri

Kartu **Status Pesanan Langsung**, subteks `Estimasi siap saji dalam 20–25 menit · Diperbarui otomatis`.

Timeline vertikal empat langkah, lingkaran status dan connector:
1. **Pesanan Diterima & Terbayar** — completed/hijau. Copy: `Sistem kami berhasil memverifikasi pembayaran Anda via QRIS pada pukul 12:40 WIB.`
2. **Sedang Disiapkan di Dapur** — current/jingga bata. Copy: `Koki Warung Bali Dwi sedang memasak Nasi Campur Bali Agung pesananmu hangat-hangat.`
3. **Siap Disajikan / Dikirim** — pending/abu-abu. Copy: `Makanan akan segera diantarkan langsung ke Meja A12 oleh pramusaji hall kuliner.`
4. **Pesanan Selesai** — pending/abu-abu. Copy: `Selamat menikmati hidangan lezat Anda di Jakarta Culinary Hall!`

Kartu **Detail Pengantaran Meja**:
- `Pastikan Anda tetap duduk di meja yang sesuai dengan sistem QR kami.`
- Badge hijau `Sesuai QR Meja`.
- Panel hangat dengan ikon QR: `Meja Terpilih Anda`, **Meja A12 · Lantai 2**, `Jakarta Culinary Hall, Pujasera Utama Blok B`.

Help callout: `Ada kendala atau instruksi tambahan untuk dapur?` dan `Hubungi bantuan langsung mitra atau pramusaji melalui fitur Bantuan MejaKu.`

### Kanan

- Primary `Lacak Pesanan Langsung`.
- Secondary `Kembali ke Beranda Kuliner`.
- Kartu `Ringkasan Hidangan`, badge `1 Menu`.
- Thumbnail makanan kecil, nama/configuration sama seperti sebelumnya.
- Breakdown sama; label akhir `Total Terbayar` **Rp 72.600**.
- Footer kartu `Metode Pembayaran: QRIS Otomatis`.

## 10. Data dan perhitungan yang wajib konsisten

Gunakan satu sumber state untuk konfigurasi, quantity, harga, dan pesanan di seluruh alur. Jangan hardcode total berbeda di setiap halaman.

```ts
const exampleOrder = {
  id: 'MJK-72600-BA',
  paymentCode: 'MJK72600BA',
  merchant: 'Warung Bali Dwi',
  venue: 'Jakarta Culinary Hall',
  table: 'A12',
  floor: 2,
  area: 'Pujasera Utama Blok B',
  fulfillment: 'dine_in',
  paymentMethod: 'qris',
  quantity: 1,
  item: {
    name: 'Nasi Campur Bali Agung',
    basePrice: 58000,
    portion: 'regular',
    portionSurcharge: 0,
    spice: 'medium',
    addons: [{ id: 'extra-sambal', name: 'Ekstra Sambal Matah', price: 5000 }],
  },
  serviceFee: 3000,
  taxRate: 0.10,
  note: '',
};
```

```text
unitPrice = basePrice + portionSurcharge + sum(selectedAddonPrices)
subtotal = unitPrice × quantity
tax = round((subtotal + serviceFee) × 0.10)
total = subtotal + serviceFee + tax

Contoh: (58.000 + 5.000) × 1 = 63.000
Pajak: (63.000 + 3.000) × 10% = 6.600
Total: 63.000 + 3.000 + 6.600 = 72.600
```

Perhitungan ini mereproduksi nominal referensi, **bukan penetapan kebijakan pajak legal atau tarif dinamis produksi**. Kebijakan service fee, diskon, ongkir, dan pajak produksi harus dikonfirmasi backend/product owner. Jangan otomatis mengasumsikan service fee per item.

Simpan nilai sebagai integer rupiah. Untuk formatter gunakan locale `id-ID`, nol digit desimal, dan hasil tampilan `Rp 72.600`. ID pesanan dan payment code adalah data contoh, bukan template ID produksi.

## 11. Interaksi — rekomendasi implementasi

Interaksi berikut dianjurkan agar hasil tidak hanya berupa screenshot statis. Ini spesifikasi implementasi, bukan interaksi Figma yang telah diuji.

- Navigation landing menggunakan anchor ke section; `Lihat Cara Kerjanya` menuju cara kerja.
- Gallery mengubah media aktif; selected thumbnail memiliki outline primary.
- Portion/spice single-select; add-on multi-select; total CTA berubah langsung.
- Stepper quantity minimal 1; decrement disabled saat 1. Gunakan validasi maksimal dari stok bila backend tersedia.
- Tambahkan pesanan membawa konfigurasi yang sama ke checkout. `Ubah pilihan` membuka detail dengan pilihan sebelumnya.
- Catatan maksimal 150 karakter dengan counter aktual.
- Promo harus menampilkan state kosong/loading/valid/invalid. Jangan memberikan diskon palsu; gunakan mock yang jelas atau response backend.
- Pilihan pengantaran memerlukan form alamat dan ongkir yang **belum didesain**. Pada implementasi demo minimal, jelaskan bahwa opsi ini belum tersedia atau buat state tambahan yang diberi label pengembangan; jangan diam-diam menagih ongkir.
- CTA checkout membuat order satu kali, memiliki loading, mencegah double submit, lalu menuju pembayaran.
- Timer berasal dari `expiresAt`; hitung ulang dari waktu aktual agar refresh tidak mereset deadline.
- Salin kode menggunakan clipboard dan feedback singkat.
- Metode selain QRIS memerlukan panel tambahan; detail VA/nomor rekening belum tersedia. Jangan mengarang nomor bank.
- State pembayaran: `pending`, `checking`, `paid`, `failed`, `expired`. Jika belum ada backend, gunakan adapter mock dan penanda **Mode Demo**; jangan mengklaim transaksi sungguhan.
- “Saya Sudah Bayar” memeriksa status, tidak langsung menetapkan `paid` di produksi.
- Konfirmasi manual adalah fallback yang perlu kontrak backend; tidak boleh melewati verifikasi pembayaran.
- State dapur: `received`, `preparing`, `ready`, `completed`; halaman contoh berada pada `preparing`.
- `Lacak Pesanan Langsung` dapat fokus/scroll ke timeline dalam scope lima layar ini; halaman tracking tambahan tidak disediakan.
- Persist cart/order demo dengan storage lokal tanpa data rahasia; jangan menyimpan PIN, OTP, atau token sensitif.
- Help/mitra/legal link memerlukan tujuan yang dikonfirmasi. Hindari tombol mati; sediakan dialog informatif untuk fitur di luar scope demo.
- Route langsung payment/confirmation tanpa order perlu empty state atau redirect terjelaskan.

## 12. Responsive dan aksesibilitas — rekomendasi

Referensi hanya desktop 1440 px. Adaptasi berikut menjaga hierarki, bukan mengklaim ukuran mobile dari Figma.

### Breakpoint yang disarankan

- **Desktop ≥1200 px:** container maksimal 1280 px; padding responsif menuju 80 px pada viewport 1440 px; dua kolom detail/transaksi; menu 4 kolom.
- **Tablet 768–1199 px:** padding 24–40 px; menu/benefit 2 kolom; layout detail/transaksi boleh menjadi satu kolom bila ruang tidak cukup. Jangan mempertahankan fixed 800+432 px.
- **Mobile <768 px:** padding 16–20 px; heading display 32–40 px, hero sekitar 40–48 px; hero satu kolom; section padding sekitar 48–64 px; kartu tutorial satu kolom.
- Menu mobile dapat 1 kolom atau 2 kolom jika teks tetap terbaca. Default satu kolom pada layar sempit.
- Navbar mobile memakai logo dan menu collapsible yang dapat diakses; tetap sediakan CTA mitra di menu.
- Ringkasan pesanan mengikuti form pada urutan baca mobile. Panel deadline tetap dekat heading pembayaran.
- Radio/chip/payment cards wrap atau stack; CTA full-width; jangan memotong label panjang.
- Footer stack dan watermark mengecil mengikuti viewport. QR tetap cukup besar dan tidak terdistorsi.
- Hindari horizontal scroll pada viewport 360 px. Sticky CTA mobile opsional, tidak wajib dan tidak boleh menutup isi.

### Aksesibilitas

- Semantic `header`, `nav`, `main`, `section`, `footer`; satu H1 per halaman.
- Gunakan elemen button/link/input/radio/checkbox asli, bukan div clickable saja.
- Fieldset/legend untuk opsi porsi, pedas, penerimaan, dan metode pembayaran.
- Label eksplisit untuk textarea/promo; placeholder bukan pengganti label.
- Focus ring terlihat, keyboard navigation, `aria-expanded` untuk menu mobile.
- Area klik kontrol minimal sekitar 44 × 44 px, terutama stepper dan checkbox.
- Status selain warna juga memakai teks/ikon. Loading/error/payment update memakai live region yang sesuai.
- Alt text foto makanan; ikon dekoratif di-hide dari accessibility tree.
- Hormati `prefers-reduced-motion`; hindari animasi besar yang tidak ada di referensi.
- Audit kontras teks footer/metadata. Jika terlalu rendah, naikkan kontras tanpa mengubah hierarki atau palet utama secara drastis.

## 13. Aset, ambiguitas, dan keputusan yang belum dikonfirmasi

1. **Foto:** hero/menu/gallery pada screenshot banyak tampil abu-abu; layer Figma juga menggunakan image hash berulang. Jangan mengasumsikan foto tiap makanan tersedia. Pertahankan placeholder berukuran benar sampai aset final tersedia. Jika memakai foto contoh, beri tahu bahwa foto bukan aset asli dan jangan mengubah rasio/layout.
2. **QR:** visual QR adalah contoh, bukan QR pembayaran produksi. Gunakan payload gateway untuk pembayaran nyata; QR demo tidak boleh menagih pengguna.
3. **Metode bayar:** landing menyebut Kartu Kredit, sedangkan layar pembayaran hanya QRIS, Bank/VA, Dompet Digital. Pertahankan copy visual referensi, tetapi jangan menjanjikan dukungan kartu kredit pada implementasi transaksi tanpa konfirmasi.
4. **Meja berbeda:** phone preview landing memakai Meja 12/Pujasera Sunset; transaksi memakai A12/Jakarta Culinary Hall. Preview bukan sesi pengguna yang sama.
5. **Waktu:** timer pembayaran/deadline dan waktu konfirmasi 12:40 WIB adalah snapshot yang tidak sepenuhnya berurutan. Pertahankan angka untuk mode reproduksi screenshot; untuk alur live, gunakan timestamp konsisten dari order.
6. **Terminologi:** checkout memakai `Biaya layanan meja` dan `Pajak (10%)`; payment/confirmation memakai `Biaya Pelayanan Meja` dan `Pajak PB1 (10%)`. Sumber data tetap sama meskipun label presentasi berbeda.
7. **Delivery, promo, manual payment, support, partner, legal:** tampilan atau integrasi lanjut belum tersedia. Jangan mengarang fitur produksi, kontak, kebijakan, atau data rekening.
8. **Klaim pemasaran:** dukungan multibahasa, split bill, performa kurang dari satu detik, dan nutrisi merupakan copy desain. Tidak berarti fitur/benchmark tersebut sudah diimplementasikan atau diverifikasi.
9. **Backend dan stack:** tidak ditentukan oleh desain. Ikuti stack yang sudah ada; bila proyek kosong, React + TypeScript dan CSS/Tailwind adalah rekomendasi, bukan keharusan.

## 14. Prompt siap pakai untuk AI coding

Salin prompt berikut dan sertakan `design.md` serta lima gambar referensi:

```text
Implementasikan website MejaKu berdasarkan design.md dan kelima screenshot referensi.

Tujuan: reproduksi visual desktop yang setia pada referensi, responsive pada mobile,
dan alur demo yang konsisten dari detail makanan → checkout → pembayaran → konfirmasi.
Gunakan stack proyek yang sudah ada. Jika belum ada stack, pilih React + TypeScript
dengan CSS/Tailwind. Jangan melakukan rewrite konfigurasi proyek tanpa kebutuhan.

Prioritas visual:
- Latar #FAF6F0, primary #C2410C, footer #1E293B.
- Heading dan logo Lobster Two Bold; UI/body Urbanist.
- Container 1280px pada viewport 1440px, kartu rounded, outline hangat, ruang lapang.
- Ikuti susunan section, proporsi grid, copy Indonesia, dan format rupiah di design.md.
- Bangun UI sebagai komponen semantic; jangan menjadikan screenshot satu gambar halaman.
- Pertahankan placeholder media bila aset asli belum tersedia. Jangan mengarang aset final.

Buat tepat lima layar utama:
1. / — landing MejaKu lengkap hingga footer.
2. /menu/nasi-campur-bali-agung — detail, gallery, porsi, pedas, add-on, quantity.
3. /checkout — pemeriksaan pesanan, penerimaan, catatan, promo, ringkasan.
4. /payment/:orderId — metode bayar, QRIS, timer, ringkasan, cek pembayaran.
5. /orders/:orderId/confirmation — timeline status, meja, ringkasan terbayar.

Gunakan komponen reusable dan satu sumber state pesanan. Data contoh harus menghasilkan:
harga dasar 58000 + ekstra sambal 5000 = subtotal 63000;
service fee 3000; pajak 10% dari subtotal+service = 6600; total = 72600.
Perubahan opsi/quantity harus diperbarui konsisten di semua layar.

Jika backend/gateway belum tersedia, pisahkan adapter mock dari UI dan beri label Mode Demo.
Jangan menganggap klik cek pembayaran sebagai transaksi sungguhan. Jangan membuat nomor VA,
QR pembayaran nyata, kontak support, diskon, atau status paid produksi tanpa sumber backend.
Sediakan loading/error/empty/expired state yang relevan dan validasi catatan 150 karakter.

Responsive: desktop dua kolom, tablet menyesuaikan, mobile stack tanpa horizontal overflow.
Pastikan keyboard/focus, label form, kontras, dan touch target tetap dapat diakses.

Urutan kerja:
1. Periksa struktur proyek dan semua referensi.
2. Siapkan tokens, font, shared navbar/footer, primitive komponen.
3. Implementasikan lima halaman lengkap, tanpa menambahkan halaman utama di luar scope.
4. Sambungkan state/navigasi/demo adapter, tandai fitur belum memiliki backend.
5. Bandingkan screenshot pada viewport 1440px dan uji mobile 390px serta 360px.
6. Jalankan pemeriksaan TypeScript, lint, dan test yang tersedia.

Laporkan layar yang selesai, hasil pengujian, serta aset/integrasi yang belum tersedia.
Jangan menyebut reproduksi pixel-perfect jika belum dibandingkan dengan gambar referensi.
```

## 15. Acceptance checklist

- [ ] Lima layar tersedia, masing-masing lengkap hingga footer.
- [ ] Navbar, heading, card, whitespace, dan footer mengikuti screenshot masing-masing.
- [ ] Lobster Two dan Urbanist dimuat; warna primary/krem/navy sesuai token.
- [ ] Desktop 1440 px memakai proporsi 1280 px container dan grid referensi.
- [ ] Landing memuat hero, tiga langkah, empat menu, empat benefit, phone preview, footer.
- [ ] Detail memuat lima thumbnail, pilihan porsi/pedas, tiga add-on, stepper, diet note, empat rekomendasi.
- [ ] Checkout memuat tiga langkah, textarea 150 karakter, promo, ringkasan dan bantuan.
- [ ] Pembayaran memuat deadline, tiga metode, QRIS, kode bayar, petunjuk, status dan action.
- [ ] Konfirmasi memuat empat langkah timeline, detail meja, action dan ringkasan terbayar.
- [ ] Nominal default 58.000 / 63.000 / 3.000 / 6.600 / 72.600 konsisten.
- [ ] Nomor contoh `#MJK-72600-BA`, payment code `MJK72600BA`, dan meja A12 tidak tertukar.
- [ ] Pilihan/quantity/note bertahan saat berpindah halaman dan tidak membuat total stale.
- [ ] Pembayaran demo jelas berbeda dari produksi; tidak ada bypass verifikasi produksi.
- [ ] Media placeholder tidak rusak, QR tidak terdistorsi, foto tidak dipakai dari screenshot halaman.
- [ ] Tidak ada teks clipping, elemen overlap, horizontal overflow, atau tombol tanpa feedback.
- [ ] Mobile 360/390 px dan tablet dapat digunakan; desktop tidak kehilangan whitespace utama.
- [ ] Keyboard navigation, label form, focus ring, loading/error state berfungsi.
- [ ] Integrasi/aset yang belum tersedia dilaporkan, bukan diklaim selesai.
