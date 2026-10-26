<script setup lang="ts">
import { ShieldCheck, Heart } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

withDefaults(
  defineProps<{
    isPaymentScreen?: boolean
    compact?: boolean
  }>(),
  {
    isPaymentScreen: false,
    compact: false,
  }
)
</script>

<template>
  <footer class="footer-root" role="contentinfo">
    <div class="container-app footer-content">
      <!-- Payment Security Banner if on payment screen -->
      <div v-if="isPaymentScreen" class="payment-security-bar">
        <ShieldCheck :size="18" class="shield-icon" />
        <span>Pembayaran aman · Bantuan setiap hari 09.00–22.00 WIB</span>
      </div>

      <!-- Main Columns -->
      <div class="footer-grid">
        <!-- Brand & Description Column -->
        <div class="brand-column">
          <RouterLink to="/" class="footer-brand" aria-label="Beranda MejaKu">
            <div class="logo-box">
              <span class="logo-m font-display">M</span>
            </div>
            <span class="brand-name font-display">MejaKu</span>
          </RouterLink>

          <p class="brand-desc">
            Mengubah pujasera lokal, pusat kuliner, dan pedagang kaki lima menjadi pusat bersantap digital yang cepat, modern, dan menyenangkan.
          </p>

          <div class="halal-badge">
            <span>Solusi Kuliner Pujasera Indonesia</span>
          </div>
        </div>

        <!-- Links Columns -->
        <div class="links-columns">
          <!-- Produk -->
          <div class="link-group">
            <h4 class="link-heading">Produk</h4>
            <ul class="link-list">
              <li><RouterLink to="/" class="footer-link">Pindai & Pesan</RouterLink></li>
              <li><a href="#dapur" class="footer-link">Aplikasi Dapur Mitra</a></li>
              <li><a href="#analitik" class="footer-link">Dasbor Analitik</a></li>
              <li><a href="#studi-kasus" class="footer-link">Studi Kasus</a></li>
            </ul>
          </div>

          <!-- Perusahaan -->
          <div class="link-group">
            <h4 class="link-heading">Perusahaan</h4>
            <ul class="link-list">
              <li><a href="#tentang" class="footer-link">Tentang Kami</a></li>
              <li><a href="#mitra" class="footer-link">Mitra Kuliner</a></li>
              <li><a href="#karier" class="footer-link">Karier</a></li>
              <li><a href="#berita" class="footer-link">Ruang Berita</a></li>
            </ul>
          </div>

          <!-- Bantuan -->
          <div class="link-group">
            <h4 class="link-heading">Bantuan</h4>
            <ul class="link-list">
              <li><a href="#bantuan-mitra" class="footer-link">Bantuan Mitra</a></li>
              <li><a href="#keamanan" class="footer-link">Keamanan & API</a></li>
              <li><a href="#faq" class="footer-link">FAQ Pelanggan</a></li>
              <li><a href="#kontak" class="footer-link">Hubungi Bantuan</a></li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Giant Decorative Watermark in Lobster Two -->
      <div class="watermark-container" aria-hidden="true">
        <span class="footer-watermark font-display">MejaKu</span>
      </div>

      <!-- Divider -->
      <div class="footer-divider" />

      <!-- Bottom Legal Bar -->
      <div class="footer-bottom">
        <p class="copyright-text">
          © 2026 PT MejaKu Global Kuliner. Dibuat dengan cinta di Jakarta.
        </p>

        <div class="legal-links">
          <a href="#privasi" class="legal-link">Kebijakan Privasi</a>
          <span class="legal-dot">·</span>
          <a href="#syarat" class="legal-link">Syarat Layanan</a>
          <span class="legal-dot">·</span>
          <a href="#perjanjian" class="legal-link">Perjanjian Mitra</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-root {
  background-color: var(--footer-bg);
  color: #94A3B8;
  position: relative;
  overflow: hidden;
  padding-top: 72px;
  padding-bottom: 40px;
  margin-top: auto;
}

.footer-content {
  position: relative;
  z-index: 2;
}

.payment-security-bar {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #E2E8F0;
  padding: 10px 20px;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 48px;
}

.shield-icon {
  color: #4ADE80;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
  margin-bottom: 40px;
}

@media (min-width: 960px) {
  .footer-grid {
    grid-template-columns: 420px 1fr;
    gap: 80px;
  }
}

.brand-column {
  display: flex;
  flex-direction: column;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.logo-box {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background-color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-m {
  color: #FFFFFF;
  font-weight: 700;
  font-size: 24px;
}

.brand-name {
  font-size: 30px;
  font-weight: 700;
  color: #FFFFFF;
}

.brand-desc {
  font-size: 15px;
  line-height: 1.65;
  color: #94A3B8;
  margin-bottom: 24px;
  max-width: 380px;
}

.halal-badge {
  display: inline-flex;
  font-size: 12px;
  font-weight: 600;
  color: #CBD5E1;
  background: rgba(255, 255, 255, 0.05);
  padding: 6px 14px;
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 255, 255, 0.08);
  align-self: flex-start;
}

.links-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 32px;
}

.link-group {
  display: flex;
  flex-direction: column;
}

.link-heading {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 700;
  color: #FFFFFF;
  margin-bottom: 18px;
  letter-spacing: 0.5px;
}

.link-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link {
  font-size: 14px;
  color: #94A3B8;
  transition: color 0.15s ease, transform 0.15s ease;
  display: inline-block;
}

.footer-link:hover {
  color: #FFFFFF;
  transform: translateX(3px);
}

/* Giant Low-Contrast Watermark */
.watermark-container {
  overflow: hidden;
  display: flex;
  justify-content: center;
  user-select: none;
  pointer-events: none;
  margin: 10px 0 -30px 0;
}

.footer-watermark {
  font-size: clamp(80px, 16vw, 180px);
  font-weight: 700;
  line-height: 0.8;
  color: rgba(255, 255, 255, 0.035);
  letter-spacing: -4px;
  white-space: nowrap;
}

.footer-divider {
  height: 1px;
  background-color: var(--footer-divider);
  margin-bottom: 28px;
}

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13px;
}

.copyright-text {
  color: #64748B;
  margin: 0;
}

.legal-links {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.legal-link {
  color: #94A3B8;
  transition: color 0.15s ease;
}

.legal-link:hover {
  color: #FFFFFF;
  text-decoration: underline;
}

.legal-dot {
  color: #475569;
}
</style>
