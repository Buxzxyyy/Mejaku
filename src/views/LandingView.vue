<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  QrCode,
  ArrowRight,
  Sparkles,
  Smartphone,
  ShieldCheck,
  Users,
  Flame,
  Globe2,
  CheckCircle2,
  Clock,
  ChevronRight,
  ExternalLink,
} from 'lucide-vue-next'
import AppNavbar from '@/components/common/AppNavbar.vue'
import AppFooter from '@/components/common/AppFooter.vue'
import FoodCard from '@/components/common/FoodCard.vue'
import QrScannerModal from '@/components/common/QrScannerModal.vue'
import { FEATURED_LANDING_ITEMS } from '@/data/mockData'
import type { MenuItem } from '@/types'

const router = useRouter()
const showScanner = ref(false)

function handleSelectFood(item: MenuItem) {
  // Always navigate to the menu detail page
  router.push('/menu/nasi-campur-bali-agung')
}

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="landing-page">
    <AppNavbar :is-landing="true" />

    <!-- 1. HERO SECTION -->
    <section class="hero-section" aria-labelledby="hero-title">
      <div class="container-app hero-container">
        <!-- Left Hero Copy -->
        <div class="hero-copy animate-fade-up">
          <div class="hero-eyebrow">
            <Sparkles :size="15" class="eyebrow-icon animate-spin-slow" />
            <span>PINDAI. PESAN. NIKMATI.</span>
          </div>

          <h1 id="hero-title" class="font-display hero-h1">
            Pindai. Pesan. Nikmati.<br />
            <span class="gradient-text-accent">Langsung dari Mejamu</span>
          </h1>

          <p class="hero-desc">
            Pengalaman bersantap tanpa kios. Tanpa antre panjang di kasir, tanpa menunggu menu fisik, dan tanpa merepotkan staf. Nikmati hidangan kaki lima yang langsung tersaji di mejamu.
          </p>

          <!-- Hero Action Buttons -->
          <div class="hero-actions">
            <button
              type="button"
              class="btn-primary hero-btn-main animate-pulse-glow"
              @click="showScanner = true"
            >
              <QrCode :size="20" />
              <span>Pesan Sekarang</span>
            </button>

            <button
              type="button"
              class="btn-outline hero-btn-sub"
              @click="scrollToSection('cara-kerja')"
            >
              <span>Lihat Cara Kerjanya</span>
              <ArrowRight :size="16" />
            </button>
          </div>

          <!-- 3 Mini Feature Badges -->
          <div class="hero-perks-row">
            <div class="hero-perk-card">
              <span class="perk-label">Tidak perlu</span>
              <strong class="perk-value">Antre kasir</strong>
            </div>

            <div class="hero-perk-card">
              <span class="perk-label">Tidak perlu</span>
              <strong class="perk-value">Menu fisik</strong>
            </div>

            <div class="hero-perk-card">
              <span class="perk-label">Tidak perlu</span>
              <strong class="perk-value">Panggil pramusaji</strong>
            </div>
          </div>
        </div>

        <!-- Right Hero Media Composition with Dynamic Floating Elements -->
        <div class="hero-media-wrapper animate-fade-in">
          <!-- Ambient glowing background blob -->
          <div class="ambient-glow-blob" aria-hidden="true" />

          <div class="hero-media-frame">
            <img
              src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80"
              alt="Hidangan lezat di meja pujasera MejaKu"
              class="hero-img"
            />
            <div class="media-overlay-grad" />

            <!-- Floating Table Pin Card (Animated Float) -->
            <div class="floating-badge-table animate-float">
              <div class="pulse-dot" />
              <div>
                <div class="table-tag-venue">Jakarta Culinary Hall</div>
                <div class="table-tag-name">Meja A12 · Terverifikasi</div>
              </div>
            </div>

            <!-- Floating Speed Order Card (Animated Reverse Float) -->
            <div class="floating-badge-speed animate-float-reverse">
              <Clock :size="18" class="speed-icon" />
              <div>
                <span class="speed-title">Rata-rata Masak</span>
                <span class="speed-time">12–18 Menit Siap Saji</span>
              </div>
            </div>

            <!-- Live Order Activity Badge -->
            <div class="floating-badge-live-order">
              <Flame :size="16" class="live-flame-icon" />
              <span>Pesanan Populer: <strong>Nasi Campur Bali Agung</strong></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. CARA KERJA SECTION -->
    <section id="cara-kerja" class="how-section" aria-labelledby="how-title">
      <div class="container-app">
        <!-- Section Header -->
        <div class="section-header-center">
          <span class="section-eyebrow">TANPA KASIR, TANPA KERUMUNAN</span>
          <h2 id="how-title" class="font-display section-h2">
            Tiga Langkah Mudah untuk Menikmati Hidangan
          </h2>
          <p class="section-desc">
            Kami menyederhanakan proses agar kamu bisa fokus menikmati cita rasa.
          </p>
        </div>

        <!-- 3 Step Cards -->
        <div class="how-cards-grid">
          <!-- Step 01 -->
          <div class="how-card">
            <div class="how-card-top">
              <div class="how-icon-box">
                <QrCode :size="24" />
              </div>
              <span class="how-step-num font-display">01</span>
            </div>
            <h3 class="how-card-title">Pindai Kode QR di Meja</h3>
            <p class="how-card-desc">
              Cari stiker kode QR MejaKu di mejamu, lalu pindai dengan kamera ponsel. Tidak perlu mengunduh aplikasi.
            </p>
            <button
              type="button"
              class="how-card-cta"
              @click="showScanner = true"
            >
              <span>Mulai dari sini</span>
              <ChevronRight :size="16" />
            </button>
          </div>

          <!-- Step 02 -->
          <div class="how-card">
            <div class="how-card-top">
              <div class="how-icon-box">
                <Flame :size="24" />
              </div>
              <span class="how-step-num font-display">02</span>
            </div>
            <h3 class="how-card-title">Jelajahi & Sesuaikan Pesanan</h3>
            <p class="how-card-desc">
              Lihat foto makanan jelas, pilih level pedas, tambahkan ekstra, dan buat pesanan sesuai selera Anda.
            </p>
            <button
              type="button"
              class="how-card-cta"
              @click="router.push('/menu/nasi-campur-bali-agung')"
            >
              <span>Sesuaikan pesanan</span>
              <ChevronRight :size="16" />
            </button>
          </div>

          <!-- Step 03 -->
          <div class="how-card">
            <div class="how-card-top">
              <div class="how-icon-box">
                <ShieldCheck :size="24" />
              </div>
              <span class="how-step-num font-display">03</span>
            </div>
            <h3 class="how-card-title">Bayar & Nikmati</h3>
            <p class="how-card-desc">
              Selesaikan pembayaran dengan GoPay, OVO, ShopeePay, atau Kartu Kredit. Pesanan Anda akan langsung dikirim ke dapur penjual.
            </p>
            <button
              type="button"
              class="how-card-cta"
              @click="router.push('/menu/nasi-campur-bali-agung')"
            >
              <span>Pesanan langsung ke dapur</span>
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. FEATURED MENU SECTION -->
    <section id="menu-unggulan" class="featured-menu-section" aria-labelledby="featured-title">
      <div class="container-app">
        <!-- Section Header with Right Link -->
        <div class="featured-header-row">
          <div>
            <span class="section-eyebrow">SEGAR DARI MITRA KULINER</span>
            <h2 id="featured-title" class="font-display section-h2">
              Paling Banyak Dipesan di MejaKu
            </h2>
          </div>

          <button
            type="button"
            class="btn-outline btn-all-menu"
            @click="router.push('/menu/nasi-campur-bali-agung')"
          >
            <span>Lihat Semua Menu Pujasera</span>
            <ArrowRight :size="16" />
          </button>
        </div>

        <!-- 4 Grid Cards -->
        <div class="featured-grid">
          <FoodCard
            v-for="item in FEATURED_LANDING_ITEMS"
            :key="item.id"
            :item="item"
            @select="handleSelectFood"
            @add="handleSelectFood"
          />
        </div>
      </div>
    </section>

    <!-- 4. KEUNTUNGAN SECTION -->
    <section id="keuntungan" class="benefits-section" aria-labelledby="benefits-title">
      <div class="container-app">
        <div class="section-header-center">
          <span class="section-eyebrow">DIRANCANG UNTUK PELANGGAN MODERN</span>
          <h2 id="benefits-title" class="font-display section-h2">
            Pengalaman Kuliner Kaki Lima yang Lebih Baik
          </h2>
          <p class="section-desc">
            Baik bersantap sendiri, bersama rekan kerja, maupun keluarga, MejaKu membuat proses makan jadi lebih mudah.
          </p>
        </div>

        <!-- 4 White Cards -->
        <div class="benefits-grid">
          <!-- Card 1 -->
          <div class="benefit-card">
            <div class="benefit-icon-wrapper">
              <Clock :size="24" />
            </div>
            <h3 class="benefit-title">Tak Perlu Menunggu Pramusaji</h3>
            <p class="benefit-desc">
              Pindai kode QR dan langsung mulai memesan. Tak perlu lagi memanggil pramusaji yang sedang sibuk.
            </p>
          </div>

          <!-- Card 2 -->
          <div class="benefit-card">
            <div class="benefit-icon-wrapper">
              <Users :size="24" />
            </div>
            <h3 class="benefit-title">Pembayaran Bersama yang Praktis</h3>
            <p class="benefit-desc">
              Bagi tagihan dengan mudah atau biarkan setiap orang memindai, memesan, dan membayar makanannya sendiri. Tanpa perlu menghitung manual.
            </p>
          </div>

          <!-- Card 3 -->
          <div class="benefit-card">
            <div class="benefit-icon-wrapper">
              <Flame :size="24" />
            </div>
            <h3 class="benefit-title">Pesanan Langsung ke Mitra</h3>
            <p class="benefit-desc">
              Pesanan langsung masuk ke layar dapur gerai terkait sehingga meminimalkan kesalahan dan antrean lama.
            </p>
          </div>

          <!-- Card 4 -->
          <div class="benefit-card">
            <div class="benefit-icon-wrapper">
              <Globe2 :size="24" />
            </div>
            <h3 class="benefit-title">Dukungan Multibahasa</h3>
            <p class="benefit-desc">
              Menu kuliner lokal diterjemahkan otomatis ke bahasa Inggris, Mandarin, dan Korea. Cocok untuk wisatawan mancanegara.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. APP PREVIEW SECTION -->
    <section id="preview" class="preview-section" aria-labelledby="preview-title">
      <div class="container-app preview-container">
        <!-- Left: Phone Mockup Frame (340x680px) -->
        <div class="phone-mockup-wrapper animate-fade-in">
          <div class="phone-outer-frame">
            <div class="phone-speaker" />
            <div class="phone-screen">
              <!-- Status bar -->
              <div class="phone-status-bar">
                <span>09:41</span>
                <div class="phone-status-icons">📶 🔋</div>
              </div>

              <!-- Mini MejaKu screen UI inside phone -->
              <div class="phone-inner-content">
                <div class="phone-nav">
                  <div class="mini-logo">M</div>
                  <span class="mini-table">Meja 12 · Pujasera Sunset</span>
                </div>

                <div class="phone-dish-card">
                  <img
                    src="https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=400&q=80"
                    alt="Bakso Sapi Urat Super"
                    class="dish-thumb"
                  />
                  <div class="dish-meta">
                    <h4>Bakso Sapi Urat Super</h4>
                    <p>Kaldu tulang sapi asli, mi kuning, dan bawang goreng renyah.</p>
                    <div class="dish-price-row">
                      <span class="phone-price">Rp 24.000</span>
                      <button type="button" class="mini-add-btn">Tambah +</button>
                    </div>
                  </div>
                </div>

                <!-- Bottom Floating Cart Pill -->
                <div class="phone-cart-pill">
                  <div class="cart-pill-left">
                    <span class="badge-count">2</span>
                    <span>Lihat Keranjang</span>
                  </div>
                  <strong class="cart-pill-total">Rp 52.000</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Copy & Bullet Points -->
        <div class="preview-copy-col">
          <span class="section-eyebrow">TANPA PERLU INSTALASI</span>
          <h2 id="preview-title" class="font-display preview-h2">
            Dirancang untuk Peramban Ponselmu
          </h2>
          <p class="preview-desc">
            MejaKu berjalan dengan teknologi web ringan dan optimal. Pelanggan cukup memindai kode, memilih hidangan lokal favorit, lalu membayar tanpa memenuhi ponsel dengan aplikasi tambahan.
          </p>

          <ul class="preview-features-list">
            <li>
              <CheckCircle2 :size="20" class="feature-icon" />
              <span>Kompatibel langsung dengan Safari, Chrome, dan pemindai QR bawaan semua smartphone.</span>
            </li>
            <li>
              <CheckCircle2 :size="20" class="feature-icon" />
              <span>Dimuat kurang dari satu detik bahkan pada jaringan 4G pujasera yang padat.</span>
            </li>
            <li>
              <CheckCircle2 :size="20" class="feature-icon" />
              <span>Konfigurasi meja dan gerai otomatis terkunci akurat berdasarkan stiker QR mejamu.</span>
            </li>
          </ul>

          <div class="preview-cta-row">
            <button
              type="button"
              class="btn-primary"
              @click="router.push('/menu/nasi-campur-bali-agung')"
            >
              <span>Lihat Contoh Langsung</span>
              <ArrowRight :size="16" />
            </button>

            <button
              type="button"
              class="btn-outline"
              @click="showScanner = true"
            >
              <QrCode :size="18" />
              <span>Pindai QR Meja</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <AppFooter />

    <!-- Scanner modal -->
    <QrScannerModal v-model="showScanner" />
  </div>
</template>

<style scoped>
.landing-page {
  background-color: var(--bg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 1. HERO SECTION */
.hero-section {
  padding: 64px 0 96px 0;
  position: relative;
  overflow: hidden;
}

@media (min-width: 1024px) {
  .hero-section {
    padding: 84px 0 112px 0;
  }
}

.hero-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
  align-items: center;
}

@media (min-width: 1024px) {
  .hero-container {
    grid-template-columns: minmax(460px, 1fr) minmax(440px, 1.1fr);
    gap: 64px;
  }
}

@media (min-width: 1280px) {
  .hero-container {
    grid-template-columns: 560px 1fr;
    gap: 72px;
  }
}

.hero-copy {
  display: flex;
  flex-direction: column;
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 2px;
  margin-bottom: 16px;
}

.eyebrow-icon {
  color: var(--accent);
}

.animate-spin-slow {
  animation: spinSlow 8s linear infinite;
}

.gradient-text-accent {
  background: linear-gradient(135deg, #C2410C 0%, #EA580C 50%, #F59E0B 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-h1 {
  font-size: clamp(38px, 5.2vw, 68px);
  font-weight: 700;
  line-height: 1.08;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.hero-desc {
  font-size: clamp(16px, 1.7vw, 19px);
  line-height: 1.65;
  color: var(--text-secondary);
  margin-bottom: 36px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 44px;
}

.hero-btn-main {
  font-size: 17px;
  padding: 16px 32px;
}

.hero-btn-sub {
  font-size: 16px;
  padding: 14px 26px;
}

.hero-perks-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding-top: 32px;
  border-top: 1px solid var(--border);
}

.hero-perk-card {
  display: flex;
  flex-direction: column;
}

.perk-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.perk-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
}

/* Hero Media */
.hero-media-wrapper {
  position: relative;
  display: flex;
  justify-content: center;
}

.ambient-glow-blob {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  height: 90%;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.18) 0%, rgba(194, 65, 12, 0.08) 50%, transparent 70%);
  filter: blur(48px);
  z-index: 0;
  pointer-events: none;
}

.hero-media-frame {
  position: relative;
  width: 100%;
  max-width: 672px;
  aspect-ratio: 6 / 5;
  border-radius: var(--radius-hero);
  overflow: hidden;
  box-shadow: 0 28px 56px rgba(120, 53, 15, 0.14);
  border: 1.5px solid var(--border);
  z-index: 1;
}

.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-overlay-grad {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 45%, rgba(30, 41, 59, 0.6) 100%);
}

.floating-badge-table {
  position: absolute;
  top: 24px;
  left: 24px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: 12px 18px;
  border-radius: var(--radius-md);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(226, 212, 201, 0.8);
}

.pulse-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  background-color: var(--success);
  box-shadow: 0 0 0 4px rgba(21, 128, 61, 0.25);
  animation: pulseSuccess 2s infinite;
}

.table-tag-venue {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-tag-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
}

.floating-badge-speed {
  position: absolute;
  bottom: 24px;
  right: 24px;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: 12px 18px;
  border-radius: var(--radius-md);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(226, 212, 201, 0.8);
}

.speed-icon {
  color: var(--primary);
}

.speed-title {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}

.speed-time {
  font-size: 14px;
  font-weight: 800;
  color: var(--primary);
}

.floating-badge-live-order {
  position: absolute;
  bottom: 24px;
  left: 24px;
  background: rgba(30, 41, 59, 0.88);
  backdrop-filter: blur(8px);
  color: #FFFFFF;
  padding: 8px 14px;
  border-radius: var(--radius-full);
  font-size: 12px;
  display: none;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

@media (min-width: 640px) {
  .floating-badge-live-order {
    display: inline-flex;
  }
}

.live-flame-icon {
  color: #FB923C;
}

/* 2. HOW IT WORKS (CARA KERJA) */
.how-section {
  background-color: var(--surface-warm);
  padding: 108px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.section-header-center {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 60px auto;
}

.section-eyebrow {
  display: inline-block;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 2px;
  color: var(--accent);
  margin-bottom: 12px;
  text-transform: uppercase;
}

.section-h2 {
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 700;
  line-height: 1.1;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.section-desc {
  font-size: 17px;
  line-height: 1.6;
  color: var(--text-secondary);
}

.how-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .how-cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.how-card {
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 36px 30px;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s var(--ease-spring), box-shadow 0.25s ease;
}

.how-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 36px rgba(120, 53, 15, 0.08);
}

.how-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.how-icon-box {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  background-color: var(--primary-soft);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.how-step-num {
  font-size: 32px;
  font-weight: 700;
  color: #CBD5E1;
}

.how-card-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 14px;
  line-height: 1.3;
}

.how-card-desc {
  font-size: 15px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin-bottom: 28px;
  flex: 1;
}

.how-card-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--primary);
  font-size: 14px;
  font-weight: 700;
  transition: transform 0.15s ease;
  align-self: flex-start;
}

.how-card-cta:hover {
  transform: translateX(4px);
}

/* 3. FEATURED MENU */
.featured-menu-section {
  padding: 96px 0;
}

.featured-header-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 48px;
  flex-wrap: wrap;
}

.btn-all-menu {
  padding: 12px 24px;
  white-space: nowrap;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 24px;
}

@media (min-width: 640px) {
  .featured-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .featured-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 4. BENEFITS (KEUNTUNGAN) */
.benefits-section {
  background-color: var(--surface-warm);
  padding: 96px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.benefits-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 640px) {
  .benefits-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .benefits-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.benefit-card {
  background-color: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px 24px;
  transition: transform 0.25s var(--ease-spring);
}

.benefit-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(120, 53, 15, 0.06);
}

.benefit-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background-color: var(--primary-soft);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.benefit-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
  line-height: 1.35;
}

.benefit-desc {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* 5. APP PREVIEW */
.preview-section {
  padding: 96px 0;
}

.preview-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 56px;
  align-items: center;
}

@media (min-width: 960px) {
  .preview-container {
    grid-template-columns: 400px 1fr;
    gap: 72px;
  }
}

/* Phone Mockup Frame */
.phone-mockup-wrapper {
  display: flex;
  justify-content: center;
}

.phone-outer-frame {
  width: 320px;
  height: 640px;
  background-color: #0F172A;
  border-radius: 46px;
  padding: 12px;
  box-shadow: 0 32px 64px rgba(15, 23, 42, 0.22);
  border: 4px solid #334155;
  display: flex;
  flex-direction: column;
}

.phone-speaker {
  width: 70px;
  height: 6px;
  background-color: #334155;
  border-radius: var(--radius-full);
  margin: 4px auto 10px auto;
}

.phone-screen {
  background-color: var(--bg);
  flex: 1;
  border-radius: 36px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.phone-status-bar {
  display: flex;
  justify-content: space-between;
  padding: 10px 18px 6px 18px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
}

.phone-inner-content {
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.phone-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.mini-logo {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--primary);
  color: #FFFFFF;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mini-table {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-primary);
}

.phone-dish-card {
  background: #FFFFFF;
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: auto;
}

.dish-thumb {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.dish-meta {
  padding: 12px;
}

.dish-meta h4 {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}

.dish-meta p {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin-bottom: 10px;
}

.dish-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.phone-price {
  font-weight: 800;
  color: var(--primary);
  font-size: 14px;
}

.mini-add-btn {
  background: var(--primary-soft);
  color: var(--primary);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.phone-cart-pill {
  background: var(--primary);
  color: #FFFFFF;
  border-radius: var(--radius-full);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  box-shadow: 0 6px 16px rgba(194, 65, 12, 0.3);
}

.cart-pill-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
}

.badge-count {
  background: #FFFFFF;
  color: var(--primary);
  width: 18px;
  height: 18px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
}

.cart-pill-total {
  font-size: 13px;
  font-weight: 800;
}

/* Right Preview Copy */
.preview-copy-col {
  display: flex;
  flex-direction: column;
}

.preview-h2 {
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 700;
  line-height: 1.1;
  color: var(--text-primary);
  margin-bottom: 18px;
}

.preview-desc {
  font-size: 17px;
  line-height: 1.65;
  color: var(--text-secondary);
  margin-bottom: 28px;
}

.preview-features-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 36px;
}

.preview-features-list li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 15px;
  color: var(--text-primary);
  line-height: 1.5;
}

.feature-icon {
  color: var(--success);
  flex-shrink: 0;
  margin-top: 2px;
}

.preview-cta-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
</style>
