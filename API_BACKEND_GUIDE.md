# Panduan Integrasi API Backend MejaKu

Dokumen ini merupakan panduan teknis integrasi antara frontend MejaKu (Vue 3 + Vite + TypeScript) dengan backend Laravel. Dokumen ini mencakup konfigurasi environment, arsitektur endpoint, struktur payload request dan response, penanganan error, serta panduan migrasi database.

---

## 1. Arsitektur Komunikasi

Frontend MejaKu dirancang sebagai aplikasi client tunggal (*Single Page Application*) yang berkomunikasi dengan REST API Laravel secara stateless.
- **Base URL API**: `http://127.0.0.1:8000/api` (dalam mode pengembangan lokal)
- **Format Pertukaran Data**: JSON (`application/json`)
- **Header Standar**:
  ```http
  Accept: application/json
  Content-Type: application/json
  X-Idempotency-Key: <UUID v4 unik setiap transaksi checkout>
  ```

---

## 2. Konfigurasi Environment Backend (.env)

Berikut adalah variabel lingkungan utama yang diperlukan pada file `.env` di backend Laravel agar seluruh fitur MejaKu beroperasi secara penuh:

```env
APP_NAME=MejaKu
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

# Pengaturan Basis Data (SQLite)
DB_CONNECTION=sqlite

# Pengaturan AI Chatbot (Groq API)
GROQ_API_KEY=gsk_...
GROQ_MODEL=qwen/qwen3.8-27b
GROQ_MAX_TOKENS=512

# Pengaturan Tarif MejaKu
MEJAKU_SERVICE_FEE=3000
MEJAKU_TAX_RATE=0.10

# Pengaturan Pembayaran Midtrans Snap QRIS
# Jika dikosongkan, backend beroperasi dalam mode simulasi transaksi lokal.
MIDTRANS_SERVER_KEY=Mid-server-...
MIDTRANS_CLIENT_KEY=Mid-client-...
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true

# Akun Awal Dashboard Admin
ADMIN_NAME="Administrator"
ADMIN_EMAIL="admin@mejaku.local"
ADMIN_PASSWORD="admin123"
```

---

## 3. Spesifikasi Endpoint API Publik MejaKu

### 3.1. Katalog Menu & Hidangan

#### GET `/api/menu`
Mengambil seluruh daftar menu hidangan yang aktif berserta relasi porsi (*portions*), opsi pedas (*spices*), dan pelengkap (*addons*).

- **Method**: `GET`
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Nasi Campur Bali Agung",
        "slug": "nasi-campur-bali-agung",
        "category": "makanan-utama",
        "base_price": 58000,
        "description": "Nasi campur khas Bali dengan lauk lengkap dan bumbu rempah.",
        "image_url": "https://...",
        "is_available": true,
        "average_rating": 4.9,
        "rating_count": 128,
        "merchant": {
          "id": 1,
          "name": "Warung Bali Dwi"
        },
        "portions": [
          { "id": 1, "name": "Biasa", "price": 0 },
          { "id": 2, "name": "Jumbo", "price": 15000 }
        ],
        "spices": [
          { "id": 1, "name": "Tidak Pedas" },
          { "id": 2, "name": "Sedang" },
          { "id": 3, "name": "Pedas" }
        ],
        "addons": [
          { "id": 1, "name": "Ekstra Sambal Matah", "price": 5000 },
          { "id": 2, "name": "Sate Lilit Tuna", "price": 8000 }
        ]
      }
    ]
  }
  ```

#### GET `/api/menu/{slugOrId}`
Mengambil detail satu menu hidangan berdasarkan slug atau ID numerik.

#### GET `/api/menu/{id}/reviews`
Mengambil ulasan dan testimoni pelanggan asli untuk hidangan tertentu.
- **Method**: `GET`
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "customer_name": "Budi Santoso",
        "rating": 5,
        "review": "Sambal matahnya sangat segar dan porsi jumbo sangat mengenyangkan.",
        "created_at": "2026-10-25T10:15:00.000000Z"
      }
    ]
  }
  ```

#### POST `/api/menu/{id}/rate`
Menyimpan ulasan dan rating pelanggan baru ke dalam basis data.
- **Method**: `POST`
- **Payload Request**:
  ```json
  {
    "rating": 5,
    "review": "Rasa autentik, bumbu meresap sempurna.",
    "customer_name": "Pelanggan Meja A12"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Terima kasih atas ulasan Anda.",
    "data": {
      "average_rating": 4.9,
      "rating_count": 129
    }
  }
  ```

---

### 3.2. Verifikasi Meja

#### GET `/api/tables/{code}`
Digunakan ketika pelanggan memindai QR code atau memasukkan nomor meja secara manual.
- **Method**: `GET`
- **Parameter**: `code` (contoh: `A12`, `B01`)
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "code": "A12",
      "floor": "Lantai 2",
      "location": "Jakarta Culinary Hall",
      "area": "Pujasera Utama Blok B",
      "status": "available"
    }
  }
  ```
- **Response Meja Tidak Ditemukan (404 Not Found)**:
  ```json
  {
    "success": false,
    "message": "Meja tidak ditemukan atau sedang tidak aktif."
  }
  ```

---

### 3.3. Transaksi & Pesanan

#### POST `/api/orders`
Membuat pesanan baru langsung ke dapur backend.
- **Method**: `POST`
- **Header Wajib**: `X-Idempotency-Key: <UUID>`
- **Payload Request**:
  ```json
  {
    "table_code": "A12",
    "delivery_type": "dine_in",
    "notes": "Tolong sambal dipisah.",
    "promo_code": "HEMAT10",
    "items": [
      {
        "menu_item_id": 1,
        "portion_id": 2,
        "spice_level_id": 3,
        "addon_ids": [1, 2],
        "quantity": 1,
        "notes": ""
      }
    ]
  }
  ```
- **Response Sukses (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Pesanan berhasil dibuat.",
    "data": {
      "order_number": "MJK-85100-AB",
      "subtotal": 81000,
      "service_fee": 3000,
      "tax": 8100,
      "discount": 10000,
      "total": 82100,
      "payment_status": "pending",
      "preparation_status": "received",
      "created_at": "2026-10-25T14:20:00.000000Z"
    }
  }
  ```

#### GET `/api/orders/{orderNumber}`
Mengambil detail status pesanan secara lengkap untuk halaman pembayaran (`PaymentView`) dan konfirmasi status penyajian (`OrderConfirmationView`).
- **Method**: `GET`
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "order_number": "MJK-85100-AB",
      "table": {
        "code": "A12",
        "floor": "Lantai 2",
        "location": "Jakarta Culinary Hall",
        "area": "Pujasera Utama Blok B"
      },
      "delivery_type": "dine_in",
      "notes": "Tolong sambal dipisah.",
      "items": [
        {
          "menu_item": {
            "id": 1,
            "name": "Nasi Campur Bali Agung",
            "image": null
          },
          "portion": { "id": 2, "name": "Jumbo", "price": 15000 },
          "spice_level": { "id": 3, "name": "Pedas" },
          "addons": [
            { "id": 1, "name": "Ekstra Sambal Matah", "price": 5000 },
            { "id": 2, "name": "Sate Lilit Tuna", "price": 8000 }
          ],
          "quantity": 1,
          "unit_price": 81000,
          "line_total": 81000
        }
      ],
      "subtotal": 81000,
      "service_fee": 3000,
      "tax": 8100,
      "discount": 10000,
      "total": 82100,
      "payment_status": "pending",
      "preparation_status": "received",
      "created_at": "2026-10-25T14:20:00.000000Z"
    }
  }
  ```

---

### 3.4. Pembayaran (Midtrans Snap & QRIS)

#### POST `/api/payments/{orderNumber}`
Membuat sesi transaksi pembayaran ke Midtrans atau simulator demo QRIS.
- **Method**: `POST`
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "snap_token": "7b8e5c3e-48a1-432d-98e3-...",
      "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/vtweb/...",
      "qr_string": "00020101021226670016ID.CO.MIDTRANS5204581253033605802ID...",
      "expiry_time": "2026-10-25 14:35:00"
    }
  }
  ```

#### GET `/api/payments/{orderNumber}/status`
Melakukan polling status verifikasi pembayaran pesanan.
- **Method**: `GET`
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "order_number": "MJK-85100-AB",
      "payment_status": "paid",
      "settlement_time": "2026-10-25T14:22:15.000000Z"
    }
  }
  ```

---

### 3.5. AI Assistant & Chatbot

#### POST `/api/chat`
Menghubungkan asisten cerdas MejaKu dengan LLM (Groq AI Model `qwen/qwen3.8-27b`) yang telah dibekali dengan konteks menu dan merchant terkini dari database.
- **Method**: `POST`
- **Payload Request**:
  ```json
  {
    "message": "Apakah ada rekomendasi makanan pedas untuk meja A12?",
    "table": "A12"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "reply": "Untuk Meja A12, rekomendasi menu pedas favorit adalah Nasi Campur Bali Agung dengan level Pedas dan ekstra Sambal Matah segar.",
      "model": "qwen/qwen3.8-27b"
    }
  }
  ```

---

## 4. Panduan Menjalankan Backend Laravel

1. **Pindah ke Direktori Backend**:
   ```bash
   cd /home/archara/Documents/kodingan/Tugas/WebLanjutan/backend
   ```

2. **Instalasi Dependensi PHP & Composer**:
   ```bash
   composer install
   ```

3. **Migrasi Database & Pengisian Data Awal (Seeder)**:
   ```bash
   php artisan migrate:fresh --seed
   ```
   *Perintah ini akan membuat skema tabel SQLite dan mengisi data master hidangan, meja A12, varian porsi, serta ulasan pelanggan awal.*

4. **Menjalankan Server Backend**:
   ```bash
   php artisan serve --host=127.0.0.1 --port=8000
   ```

---

## 5. Ringkasan Kepatuhan Frontend MejaKu

Seluruh implementasi di frontend MejaKu telah disesuaikan agar:
1. Tidak ada ketergantungan pada data palsu atau dummy offline.
2. Pembuatan dan hidrasi order selalu bersumber dari backend riil.
3. Chatbot terintegrasi dengan model AI aktual backend.
4. Ulasan dan rating hidangan tersimpan dan terbaca langsung dari database SQLite backend.
5. Format visual dan kode sepenuhnya bebas dari karakter emoji untuk menjaga standar profesionalitas sistem.
