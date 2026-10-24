import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useOrderStore } from '@/stores/orderStore'

export interface ChatMessage {
  id: string
  sender: 'bot' | 'user'
  text: string
  timestamp: string
  quickReplies?: string[]
  action?: {
    type: 'link' | 'call_waiter' | 'view_menu'
    label: string
    url?: string
  }
}

export const useChatbotStore = defineStore('chatbot', () => {
  const orderStore = useOrderStore()

  const isOpen = ref(false)
  const isTyping = ref(false)
  const unreadCount = ref(1)

  const currentTable = computed(() => orderStore.table.tableNumber || 'A12')
  const currentFloor = computed(() => orderStore.table.floor || 1)

  function createInitialMessage(table: string): ChatMessage {
    return {
      id: 'msg-1',
      sender: 'bot',
      text: `Halo! Saya **MejaKu Support 🤖🍲**, asisten cerdas MejaKu. Mau rekomendasi makanan, bantuan bayar via QRIS, atau butuh pramusaji ke **Meja ${table}**? Silakan pilih opsi cepat di bawah atau tanyakan langsung!`,
      timestamp: 'Baru saja',
      quickReplies: [
        `👨‍🍳 Panggil pramusaji ke Meja ${table}`,
        '🌶️ Rekomendasi makanan pedas',
        '💳 Panduan bayar pakai QRIS',
        '🌾 Ada menu bebas gluten?',
        '⏱️ Berapa lama estimasi masak?',
      ],
    }
  }

  const messages = ref<ChatMessage[]>([createInitialMessage(currentTable.value)])

  // Synchronize initial message when table changes in store
  watch(
    () => orderStore.table.tableNumber,
    (newTable) => {
      if (!newTable) return
      if (messages.value.length === 1 && messages.value[0].id === 'msg-1') {
        messages.value[0] = createInitialMessage(newTable)
      }
    }
  )

  function openChat(initialPrompt?: string) {
    isOpen.value = true
    unreadCount.value = 0
    if (initialPrompt) {
      sendMessage(initialPrompt)
    }
  }

  function closeChat() {
    isOpen.value = false
  }

  function toggleChat() {
    isOpen.value = !isOpen.value
    if (isOpen.value) {
      unreadCount.value = 0
    }
  }

  async function sendMessage(userText: string) {
    if (!userText.trim()) return

    const now = new Date()
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

    // Add user message
    messages.value.push({
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: timeStr,
    })

    // Simulate typing indicator
    isTyping.value = true

    // Generate intelligent AI reply based on intent & active table
    const reply = generateAiReply(userText)

    setTimeout(() => {
      isTyping.value = false
      messages.value.push({
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: reply.text,
        timestamp: timeStr,
        quickReplies: reply.quickReplies,
        action: reply.action,
      })
    }, 650)
  }

  function generateAiReply(query: string): {
    text: string
    quickReplies?: string[]
    action?: ChatMessage['action']
  } {
    const q = query.toLowerCase()
    const table = currentTable.value
    const floor = currentFloor.value

    if (
      q.includes('pramusaji') ||
      q.includes('panggil') ||
      q.includes('pelayan') ||
      q.includes('staf') ||
      q.includes('waiter')
    ) {
      return {
        text: `🛎️ **Pramusaji Sedang Dipanggil!**\nPermintaan bantuan telah diteruskan ke stasiun kerja hall pujasera. Pramusaji kami (**Mas Budi**) sedang menuju **Meja ${table} (Lantai ${floor})** dalam 1–2 menit.`,
        quickReplies: ['Terima kasih!', 'Minta tisu & sendok tambahan', 'Status pesanan saya'],
      }
    }

    if (
      q.includes('link') ||
      q.includes('ai') ||
      q.includes('github') ||
      q.includes('source') ||
      q.includes('aplikasi') ||
      q.includes('web')
    ) {
      return {
        text: `🤖 **Tentang MejaKu AI & Aplikasi:**\nMejaKu adalah sistem pemesanan kuliner berbasis web (*Progressive Web App*) yang terhubung langsung dengan kode QR di **Meja ${table}** tanpa perlu download aplikasi!\n\nRepository & dokumentasi resmi dapat dilihat di GitHub Buxzxyyy/Mejaku. Anda juga dapat langsung menjelajahi buku menu digital kami sekarang.`,
        quickReplies: [`👨‍🍳 Panggil pramusaji ke Meja ${table}`, 'Lihat Daftar Menu', '💳 Panduan bayar QRIS'],
        action: {
          type: 'view_menu',
          label: 'Buka Buku Menu Digital',
          url: '/',
        },
      }
    }

    if (
      q.includes('qris') ||
      q.includes('bayar') ||
      q.includes('transfer') ||
      q.includes('gopay') ||
      q.includes('ovo') ||
      q.includes('bca') ||
      q.includes('dana')
    ) {
      return {
        text: `💳 **Panduan Pembayaran QRIS MejaKu:**\n1. Buka aplikasi bank (BCA, Livin', BRImo, BNI) atau e-wallet (GoPay, OVO, DANA, ShopeePay).\n2. Pilih menu **Scan / Bayar / QRIS**.\n3. Arahkan kamera ponsel ke kode QR di layar pembayaran pesanan **Meja ${table}**.\n4. Konfirmasi pembayaran dan masukkan PIN Anda.\n\nStatus pembayaran akan terverifikasi otomatis dalam beberapa detik tanpa perlu unggah struk!`,
        quickReplies: ['Menuju Halaman Pembayaran', 'Bagaimana jika saldo terpotong tapi pending?'],
        action: {
          type: 'link',
          label: 'Buka Halaman Pembayaran',
          url: '/payment/MJK-72600-BA',
        },
      }
    }

    if (
      q.includes('pedas') ||
      q.includes('sambal') ||
      q.includes('rekomendasi') ||
      q.includes('populer') ||
      q.includes('enak')
    ) {
      return {
        text: `🌶️ **Rekomendasi Spesial MejaKu untuk Meja ${table}:**\n1. **Nasi Campur Bali Agung (Rp 58.000)** — Disajikan dengan Sate Lilit Tuna & Sambal Matah racikan tangan pedas segar!\n2. **Bebek Betutu Goreng Sambal Matah (Rp 48.000)** — Gurih bumbu rempah khas Bali ungkep empuk.\n3. **Sate Ayam Bumbu Bali (Rp 32.000)** — 10 tusuk sate empuk berlumur bumbu plecing arang kelapa.`,
        quickReplies: ['Pesan Nasi Campur Bali', `👨‍🍳 Panggil pramusaji ke Meja ${table}`, 'Lihat Menu Lengkap'],
        action: {
          type: 'view_menu',
          label: 'Lihat Nasi Campur Bali Agung',
          url: '/menu/nasi-campur-bali-agung',
        },
      }
    }

    if (
      q.includes('pisah') ||
      q.includes('catatan') ||
      q.includes('alergi') ||
      q.includes('gluten') ||
      q.includes('kacang')
    ) {
      return {
        text: `📝 **Preferensi & Catatan Dapur:**\nTentu bisa! Di halaman Checkout, Anda dapat mengisi kolom **Catatan Khusus** seperti *"Sambal dipisah"* atau *"Tanpa kacang karena alergi"*.\n\nKoki di Warung Bali Dwi akan membaca catatan ini sebelum meracik hidangan untuk **Meja ${table}**.`,
        quickReplies: ['Lanjut ke Checkout', 'Menu lain yang ramah alergi'],
        action: {
          type: 'link',
          label: 'Buka Keranjang Checkout',
          url: '/checkout',
        },
      }
    }

    if (
      q.includes('lama') ||
      q.includes('estimasi') ||
      q.includes('waktu') ||
      q.includes('masak') ||
      q.includes('kapan')
    ) {
      return {
        text: `⏱️ **Estimasi Waktu Penyajian:**\nRata-rata waktu masak di Warung Bali Dwi adalah **15–20 menit**. Pesanan akan diantar langsung oleh staf ke **Meja ${table}** begitu siap. Anda juga dapat memantau pergerakan dapur secara real-time di layar konfirmasi.`,
        quickReplies: ['Cek Status Pesanan', `👨‍🍳 Panggil pramusaji ke Meja ${table}`],
        action: {
          type: 'link',
          label: 'Lacak Timeline Pesanan',
          url: '/orders/MJK-72600-BA/confirmation',
        },
      }
    }

    // Default friendly assistant fallback
    return {
      text: `Terima kasih atas pertanyaannya! Untuk bantuan seputar menu, kustomisasi pesanan, atau konfirmasi di **Meja ${table}**, Anda dapat menggunakan opsi cepat di bawah atau memberi tahu staf kami langsung.`,
      quickReplies: [
        `👨‍🍳 Panggil pramusaji ke Meja ${table}`,
        '🍛 Rekomendasi menu terpopuler',
        '💳 Panduan bayar QRIS',
      ],
    }
  }

  return {
    isOpen,
    isTyping,
    unreadCount,
    messages,
    currentTable,
    currentFloor,
    openChat,
    closeChat,
    toggleChat,
    sendMessage,
  }
})
