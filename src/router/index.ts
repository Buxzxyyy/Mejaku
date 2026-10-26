import { createRouter, createWebHistory } from 'vue-router'
import MenuView from '@/views/MenuView.vue'
import FoodDetailView from '@/views/FoodDetailView.vue'
import CheckoutView from '@/views/CheckoutView.vue'
import PaymentView from '@/views/PaymentView.vue'
import OrderConfirmationView from '@/views/OrderConfirmationView.vue'
import LandingView from '@/views/LandingView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'menu',
      component: MenuView,
      meta: { title: 'Buku Menu Digital — MejaKu' },
    },
    {
      path: '/menu',
      redirect: '/',
    },
    {
      path: '/pesan/:tableCode?',
      name: 'pesan-meja',
      component: MenuView,
      meta: { title: 'Pesan dari Meja — MejaKu' },
    },
    {
      path: '/landing',
      name: 'landing',
      component: LandingView,
      meta: { title: 'MejaKu — Solusi Pesan Kuliner Tanpa Antre' },
    },
    {
      path: '/menu/:slug',
      name: 'food-detail',
      component: FoodDetailView,
      meta: { title: 'Detail Hidangan — MejaKu' },
    },
    {
      path: '/checkout',
      name: 'checkout',
      component: CheckoutView,
      meta: { title: 'Selesaikan Pesananmu — MejaKu' },
    },
    {
      path: '/payment/:orderId?',
      name: 'payment',
      component: PaymentView,
      meta: { title: 'Pembayaran Pesanan — MejaKu' },
    },
    {
      path: '/orders/:orderId?/confirmation',
      name: 'confirmation',
      component: OrderConfirmationView,
      meta: { title: 'Pesanan Berhasil Disiapkan — MejaKu' },
    },
    // Fallback redirect to landing
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }
    return { top: 0, behavior: 'smooth' }
  },
})

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
})

export default router
