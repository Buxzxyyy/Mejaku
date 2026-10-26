export interface MenuCategory {
  id: string
  name: string
  icon?: string
}

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: 'all', name: 'Semua Menu' },
  { id: 'makanan-utama', name: 'Makanan Utama' },
  { id: 'sate-bakaran', name: 'Sate & Bakaran' },
  { id: 'hidangan-berkuah', name: 'Hidangan Berkuah' },
  { id: 'kudapan-snack', name: 'Kudapan & Snack' },
  { id: 'minuman-dessert', name: 'Minuman & Penutup' },
]
