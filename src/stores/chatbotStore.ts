import { defineStore } from 'pinia'
import { ref } from 'vue'

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
  const isOpen = ref(false)
  const isTyping = ref(false)
  const unreadCount = ref(1)

  const messages = ref<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: 'Halo! Saya **MejaKu Support 🤖🍲**, asisten cerdas MejaKu di Jakarta Culinary Hall. Mau rekomendasi makanan, bantuan bayar via QRIS, atau butuh pramusaji ke Meja A12? Silakan pilih atau tanyakan langsung!',
      timestamp: 'Baru saja',
      quickReplies: [
        '🌶️ Rekomendasi makanan pedas',
        '💳 Cara bayar pakai QRIS',
        '👨‍🍳 Panggil pramusaji ke Meja A12',
        '🌾 Ada menu bebas gluten?',
        '⏱️ Berapa lama pesanan dimasak?',
      ],
    },
  ])

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

    // Generate intelligent AI reply based on intent
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
    }, 750)
  }

  function generateAiReply(query: string): {
    text: string
    quickReplies?: string[]
    action?: ChatMessage['action']
  } {
    const q = query.toLowerCase()

    if (q.includes('pramusaji') || q.includes('panggil') || q.includes('pelayan') || q.includes('staf')) {
      return {
        text: '🛎️ **Pramusaji Sedang Dipanggil!**\nPermintaan bantuan telah diteruskan ke stasiun kerja hall kuliner. Pramusaji kami (**Mas Budi**) sedang menuju **Meja A12 (Lantai 2)** dalam 1–2 menit.',
        quickReplies: ['Terima kasih!', 'Minta tisu & sendok tambahan', 'Status pesanan saya'],
      }
    }

    if (q.includes('qris') || q.includes('bayar') || q.includes('transfer') || q.includes('gopay') || q.includes('ovo')) {
      return {
        text: '💳 **Panduan Pembayaran QRIS MejaKu:**\n1. Buka aplikasi bank (BCA mobile, Livin\', BRImo, BNI) atau e-wallet (GoPay, OVO, DANA, ShopeePay).\n2. Pilih menu **Scan / Bayar / QRIS**.\n3. Arahkan kamera ke kode QR di layar pembayaran MejaKu.\n4. Pastikan nominal tepat **Rp 72.600** lalu masukkan PIN.\n\nStatus pembayaran akan terverifikasi otomatis dalam beberapa detik tanpa perlu unggah struk!',
        quickReplies: ['Coba Bayar Sekarang', 'Bagaimana jika saldo terpotong tapi status pending?'],
        action: {
          type: 'link',
          label: 'Buka Halaman Pembayaran',
          url: '/payment/MJK-72600-BA',
        },
      }
    }

    if (q.includes('pedas') || q.includes('sambal') || q.includes('rekomendasi')) {
      return {
        text: '🌶️ **Rekomendasi Spesial Pedas & Gurih:**\n1. **Nasi Campur Bali Agung (Rp 58.000)** — Disajikan dengan Sate Lilit Tuna & Sambal Matah racikan tangan pedas segar!\n2. **Nasi Goreng Gila Jakarta (Rp 28.000)** — Pilihan pedas gila cabai rawit dengan tumisan sosis & telur berlimpah.\n3. **Sate Ayam Madura Spesial (Rp 32.000)** — Bumbu kacang kental legit dipadu cabai rawit pedas nikmat.',
        quickReplies: ['Pesan Nasi Campur Bali', 'Lihat Menu Lengkap', 'Apakah sambal bisa dipisah?'],
        action: {
          type: 'view_menu',
          label: 'Lihat Nasi Campur Bali Agung',
          url: '/menu/nasi-campur-bali-agung',
        },
      }
    }

    if (q.includes('pisah') || q.includes('catatan') || q.includes('alergi') || q.includes('gluten')) {
      return {
        text: '📝 **Preferensi & Catatan Dapur:**\nTentu bisa! Di halaman Checkout, Anda dapat mengisi kolom **Catatan Khusus (hingga 150 karakter)** seperti *"Sambal dipisah"* atau *"Tanpa kacang karena alergi"*.\n\nKoki di Warung Bali Dwi akan membaca catatan ini sebelum meracik hidangan.',
        quickReplies: ['Lanjut ke Checkout', 'Menu lain yang ramah alergi'],
        action: {
          type: 'link',
          label: 'Buka Keranjang Checkout',
          url: '/checkout',
        },
      }
    }

    if (q.includes('lama') || q.includes('estimasi') || q.includes('waktu') || q.includes('masak')) {
      return {
        text: '⏱️ **Estimasi Waktu Penyajian:**\nRata-rata waktu masak di Warung Bali Dwi adalah **15–20 menit**. Anda dapat memantau pergerakan dapur secara real-time di layar *Konfirmasi Pesanan* kami setelah pembayaran berhasil.',
        quickReplies: ['Cek Status Pesanan', 'Panggil pramusaji ke Meja A12'],
        action: {
          type: 'link',
          label: 'Lacak Timeline Pesanan',
          url: '/orders/MJK-72600-BA/confirmation',
        },
      }
    }

    // Default friendly assistant fallback
    return {
      text: `Terima kasih atas pertanyaannya! Untuk bantuan seputar menu, kustomisasi pesanan, atau konfirmasi di **Meja A12**, Anda dapat menggunakan opsi cepat di bawah atau memberi tahu staf kami langsung.`,
      quickReplies: [
        '👨‍🍳 Panggil pramusaji ke Meja A12',
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
    openChat,
    closeChat,
    toggleChat,
    sendMessage,
  }
})
