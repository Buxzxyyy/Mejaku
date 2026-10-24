import type { MenuItem, TableInfo } from '@/types'

export const DEFAULT_TABLE: TableInfo = {
  tableNumber: 'A12',
  floor: 2,
  venue: 'Warung Bali Dwi',
  area: 'Area Meja Utama',
  isVerified: true,
}

export const MAIN_MENU_ITEM: MenuItem = {
  id: 'menu-ncb-01',
  slug: 'nasi-campur-bali-agung',
  name: 'Nasi Campur Bali Agung',
  merchant: 'Warung Bali Dwi',
  merchantBadge: 'ANDALAN',
  rating: 4.9,
  reviewsCount: 350,
  basePrice: 58000,
  category: 'makanan-utama',
  badge: 'ANDALAN CHEF 🔥',
  description:
    'Nikmati sajian khas Bali autentik dalam satu piring: sate lilit tuna, ayam betutu suwir yang dimasak perlahan, kulit renyah, lawar kacang panjang, kacang sangrai, dan Sambal Matah racikan tangan. Disajikan dengan nasi melati hangat beraroma pandan.',
  image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
  gallery: [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
  ],
  portions: [
    {
      id: 'regular',
      name: 'Porsi Biasa',
      description: 'Ukuran porsi standar',
      price: 0,
    },
    {
      id: 'jumbo',
      name: 'Porsi Jumbo',
      description: 'Daging dua kali lebih banyak',
      price: 15000,
    },
  ],
  spices: [
    {
      id: 'none',
      name: 'Biasa (Tidak Pedas)',
    },
    {
      id: 'medium',
      name: 'Sedang (Direkomendasikan)',
      emoji: '🌶️',
      badge: 'Direkomendasikan',
    },
    {
      id: 'extra',
      name: 'Pedas Gila (Ekstra Pedas!)',
      emoji: '🔥🌶️',
    },
  ],
  addons: [
    {
      id: 'extra-sambal',
      name: 'Ekstra Sambal Matah',
      price: 5000,
    },
    {
      id: 'extra-sate-lilit',
      name: 'Tambahkan Sate Lilit Tuna (1 buah)',
      price: 8000,
    },
    {
      id: 'extra-kulit-ayam',
      name: 'Kulit Ayam Bali Renyah',
      price: 12000,
    },
  ],
  dietaryNotes:
    'Mengandung makanan laut (Sate Lilit Tuna), ayam, dan kacang sangrai. Diolah dengan minyak kelapa asli Bali. Pilihan bebas gluten tersedia sesuai permintaan. Tinggi protein (sekitar 38 g protein).',
}

export const ALL_MENU_ITEMS: MenuItem[] = [
  MAIN_MENU_ITEM,
  {
    id: 'menu-sate-01',
    slug: 'sate-ayam-bumbu-bali',
    name: 'Sate Ayam Bumbu Bali',
    merchant: 'Warung Bali Dwi',
    merchantBadge: 'ANDALAN',
    badge: 'WAJIB COBA 🔥',
    category: 'sate-bakaran',
    rating: 4.8,
    reviewsCount: 280,
    basePrice: 32000,
    description: '10 tusuk sate ayam empuk dibakar arang kelapa dengan baluran bumbu plecing Bali legit dan lontong daun hangat.',
    image: 'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
    ],
    portions: [
      { id: 'regular', name: 'Porsi Biasa (10 Tusuk)', description: 'Standar dengan lontong', price: 0 },
      { id: 'jumbo', name: 'Porsi Jumbo (15 Tusuk)', description: 'Ekstra sate', price: 15000 },
    ],
    spices: [
      { id: 'mild', name: 'Manis Gurih' },
      { id: 'medium', name: 'Sedang 🌶️' },
      { id: 'spicy', name: 'Pedas Cabai Rawit 🔥' },
    ],
    addons: [
      { id: 'extra-lontong', name: 'Ekstra Lontong Daun', price: 5000 },
      { id: 'extra-sambal', name: 'Ekstra Bumbu Kacang Bali', price: 4000 },
    ],
    dietaryNotes: 'Ayam segar bersertifikasi halal, dibakar menggunakan arang alami.',
  },
  {
    id: 'rec-01',
    slug: 'tuna-sate-lilit-bali',
    name: 'Tuna Sate Lilit Serai Bali',
    merchant: 'Warung Bali Dwi',
    merchantBadge: 'ANDALAN',
    badge: 'KHAS BALI',
    category: 'sate-bakaran',
    rating: 4.9,
    reviewsCount: 160,
    basePrice: 35000,
    description: '5 tusuk sate lilit daging tuna segar racikan bumbu base genep Bali dengan batang serai wangi aromatik.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1529563021893-cc83c992d75d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    ],
    portions: [{ id: 'regular', name: '5 Tusuk Serai', description: 'Porsi standar', price: 0 }],
    spices: [{ id: 'medium', name: 'Sedang 🌶️' }],
    addons: [{ id: 'sambal-matah', name: 'Ekstra Sambal Matah', price: 5000 }],
    dietaryNotes: 'Bahan dasar ikan tuna segar dan kelapa parut sangrai kaya omega 3.',
  },
  {
    id: 'menu-nasgor-01',
    slug: 'nasi-goreng-spesial-bali',
    name: 'Nasi Goreng Spesial Bali',
    merchant: 'Warung Bali Dwi',
    merchantBadge: 'ANDALAN',
    badge: 'FAVORIT',
    category: 'makanan-utama',
    rating: 4.8,
    reviewsCount: 310,
    basePrice: 28000,
    description: 'Nasi goreng harum wajan besi dengan racikan bumbu khas Bali, suwiran ayam betutu, dan telur mata sapi.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    ],
    portions: [
      { id: 'regular', name: 'Porsi Biasa', description: 'Ukuran porsi standar', price: 0 },
      { id: 'jumbo', name: 'Porsi Jumbo', description: 'Nasi & topping ekstra', price: 10000 },
    ],
    spices: [
      { id: 'mild', name: 'Tidak Pedas' },
      { id: 'medium', name: 'Sedang 🌶️' },
      { id: 'pedas-gila', name: 'Pedas Gila 🔥' },
    ],
    addons: [
      { id: 'telur-mata-sapi', name: 'Telur Mata Sapi', price: 6000 },
      { id: 'kerupuk', name: 'Kerupuk Kulit Renyah', price: 4000 },
    ],
    dietaryNotes: 'Disajikan hangat langsung dari wajan panas.',
  },
  {
    id: 'rec-02',
    slug: 'bebek-betutu-goreng-sambal-matah',
    name: 'Bebek Betutu Goreng Sambal Matah',
    merchant: 'Warung Bali Dwi',
    merchantBadge: 'ANDALAN',
    badge: 'CRISPY & PEDAS 🔥',
    category: 'makanan-utama',
    rating: 4.8,
    reviewsCount: 220,
    basePrice: 48000,
    description: 'Bebek bumbu betutu rempah yang diungkep empuk lalu digoreng garing keemasan dengan sambal matah segar.',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    ],
    portions: [
      { id: 'paha', name: 'Bagian Paha', description: 'Tekstur lembut berlemak', price: 0 },
      { id: 'dada', name: 'Bagian Dada', description: 'Daging padat melimpah', price: 2000 },
    ],
    spices: [
      { id: 'medium', name: 'Sedang 🌶️' },
      { id: 'pedas-pol', name: 'Pedas Matah Nampol 🔥' },
    ],
    addons: [
      { id: 'nasi-hangat', name: 'Nasi Putih Pulen', price: 6000 },
      { id: 'lalapan', name: 'Ekstra Plecing Kangkung', price: 5000 },
    ],
    dietaryNotes: 'Daging bebek segar diungkep bumbu rempah base genep tradisional.',
  },
  {
    id: 'menu-soto-01',
    slug: 'soto-ayam-rempah-bali',
    name: 'Soto Ayam Rempah Bali',
    merchant: 'Warung Bali Dwi',
    merchantBadge: 'ANDALAN',
    badge: 'HANGAT & NIKMAT',
    category: 'hidangan-berkuah',
    rating: 4.9,
    reviewsCount: 195,
    basePrice: 38000,
    description: 'Kuah kaldu ayam kuning kaya rempah aromatik daun jeruk & kunyit, dengan suwiran ayam melimpah, tauge, dan telur rebus.',
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    ],
    portions: [
      { id: 'regular', name: 'Porsi Ayam Suwir', description: 'Standar lengkap', price: 0 },
      { id: 'extra-chicken', name: 'Porsi Ekstra Ayam', description: 'Ayam 2x lebih banyak', price: 8000 },
    ],
    spices: [
      { id: 'original', name: 'Kuah Rempah Hangat' },
      { id: 'sambal-rebus', name: 'Tambah Sambal Rawit Merah 🌶️' },
    ],
    addons: [
      { id: 'nasi-putih', name: 'Nasi Putih Pulen', price: 6000 },
      { id: 'ekstra-telur', name: 'Ekstra Telur Rebus', price: 4000 },
    ],
    dietaryNotes: 'Kaldu bening rempah tanpa santan berat, sangat menyegarkan dan ringan di lambung.',
  },
  {
    id: 'rec-03',
    slug: 'bakwan-jagung-renyah',
    name: 'Bakwan Jagung Renyah (3 pcs)',
    merchant: 'Warung Bali Dwi',
    merchantBadge: 'ANDALAN',
    badge: 'GURIH RENYAH',
    category: 'kudapan-snack',
    rating: 4.7,
    reviewsCount: 140,
    basePrice: 18000,
    description: 'Perkedel jagung manis pipil renyah keemasan dengan irisan daun seledri dan cocolan sambal kecap pedas manis.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    ],
    portions: [{ id: 'regular', name: 'Porsi 3 Pcs', description: 'Standar camilan', price: 0 }],
    spices: [{ id: 'mild', name: 'Manis Gurih' }, { id: 'pedas', name: 'Cabai Rawit Iris' }],
    addons: [{ id: 'sambal-kecap', name: 'Ekstra Sambal Kecap', price: 2000 }],
    dietaryNotes: 'Vegetarian friendly, digoreng dalam minyak bersih berkualitas.',
  },
  {
    id: 'menu-cendol-01',
    slug: 'es-cendol-durian-gula-kelapa',
    name: 'Es Cendol Durian Gula Kelapa',
    merchant: 'Warung Bali Dwi',
    merchantBadge: 'ANDALAN',
    badge: 'MANIS SEGAR',
    category: 'minuman-dessert',
    rating: 4.9,
    reviewsCount: 420,
    basePrice: 22000,
    description: 'Bulir cendol pandan alami, santan kelapa murni gurih, siraman gula aren Bali kental, dan topping daging durian medan asli.',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    ],
    portions: [
      { id: 'regular', name: 'Gelas Reguler', description: 'Ukuran gelas 16 oz', price: 0 },
      { id: 'large', name: 'Mangkok Spesial Jumbo', description: 'Ukuran mangkuk besar', price: 7000 },
    ],
    spices: [
      { id: 'normal-sweet', name: 'Manis Sedang (Gula Aren Asli)' },
      { id: 'less-sweet', name: 'Sedikit Manis (Less Sugar)' },
    ],
    addons: [
      { id: 'extra-durian', name: 'Ekstra Daging Durian Asli', price: 10000 },
      { id: 'nangka', name: 'Irisan Nangka Manis', price: 4000 },
    ],
    dietaryNotes: 'Pewarna hijau alami dari daun suji dan pandan wangi.',
  },
  {
    id: 'rec-04',
    slug: 'es-kelapa-jeruk-segar',
    name: 'Es Kelapa Jeruk Segar',
    merchant: 'Warung Bali Dwi',
    merchantBadge: 'ANDALAN',
    badge: 'SEGAR ALAMI 🌴',
    category: 'minuman-dessert',
    rating: 4.8,
    reviewsCount: 180,
    basePrice: 18000,
    description: 'Air kelapa muda alami berpadu perasan jeruk murni segar dengan kerukan daging kelapa muda yang lembut.',
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    ],
    portions: [
      { id: 'gelas', name: 'Gelas Dingin (16 oz)', description: 'Ukuran pas', price: 0 },
      { id: 'jumbo', name: 'Gelas Jumbo (22 oz)', description: 'Puas menyegarkan', price: 5000 },
    ],
    spices: [
      { id: 'normal-sweet', name: 'Manis Pas' },
      { id: 'less-sugar', name: 'Less Sugar / Alami' },
    ],
    addons: [{ id: 'selasih', name: 'Biji Selasih', price: 3000 }],
    dietaryNotes: '100% kelapa asli dan jeruk peras tanpa pengawet.',
  },
]

export const RECOMMENDATIONS_DETAIL_ITEMS: MenuItem[] = ALL_MENU_ITEMS.slice(1, 5)
export const FEATURED_LANDING_ITEMS: MenuItem[] = ALL_MENU_ITEMS.slice(1, 5)

// Category definitions for navigation
export interface MenuCategory {
  id: string
  name: string
  icon: string
}

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: 'all', name: 'Semua Menu', icon: '🍽️' },
  { id: 'makanan-utama', name: 'Makanan Utama', icon: '🍛' },
  { id: 'sate-bakaran', name: 'Sate & Bakaran', icon: '🍢' },
  { id: 'hidangan-berkuah', name: 'Hidangan Berkuah', icon: '🍲' },
  { id: 'kudapan-snack', name: 'Kudapan & Snack', icon: '🥟' },
  { id: 'minuman-dessert', name: 'Minuman & Penutup', icon: '🍹' },
]

export function getMenuItemBySlug(slug?: string): MenuItem {
  if (!slug) return MAIN_MENU_ITEM
  const found = ALL_MENU_ITEMS.find((item) => item.slug === slug || item.id === slug)
  return found || MAIN_MENU_ITEM
}
