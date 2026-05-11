 ---

  📋 Frontend Task: Dynamic Sidebar & Billing Health Integration

  📌 Context
  Sistem navigasi (Sidebar) dan proteksi akses kini sepenuhnya dikendalikan oleh Backend secara dinamis. Frontend tidak perlu lagi melakukan pengecekan manual (if role === 'admin') untuk menampilkan menu.
  Selain itu, sistem keamanan baru mewajibkan penanganan status akun (Suspended/Overdue) secara real-time.

  ---

  🎯 Task 1: Dynamic Sidebar Implementation
  Ganti struktur sidebar yang statis menjadi dinamis berdasarkan hak akses dan paket langganan.

   - API Endpoint: GET /api/v1/menus/me
   - Data Structure:

    1   [
    2     {
    3       "key": "workforce-group",
    4       "label": "Workforce Management",
    5       "icon": "Users",
    6       "children": [
    7         { "label": "Staff Directory", "path": "/employees", "icon": "Users" },
    8         { "label": "Attendance Logs", "path": "/attendances", "icon": "Calendar" }
    9       ]
   10     }
   11   ]
   - Requirements:
     1. Recursive Rendering: Gunakan fungsi rekursif untuk merender menu dan sub-menu (children).
     2. Icon Mapping: Petakan string icon (misal: "Users", "ShieldCheck") ke library icon yang digunakan (Lucide React / HeroIcons).
     3. Auto-Refresh: Panggil ulang endpoint ini jika menerima notifikasi SSE dengan tipe subscription atau system.

  ---

  🎯 Task 2: Billing Health & Blocking Overlay
  Implementasikan proteksi akses jika pembayaran menunggak atau akun dihentikan.

   - API Endpoint: GET /api/v1/users/me
   - New Data Fields:

    1   {
    2     "billing_health": {
    3       "has_unpaid_invoice": true,
    4       "days_until_due": 3,
    5       "lock_website": false,
    6       "warning_message": "Tagihan jatuh tempo dalam 3 hari!"
    7     },
    8     "tenant": {
    9       "is_suspended": false,
   10       "suspended_reason": ""
   11     }
   12   }
   - Requirements:
     1. Global Warning Banner: Jika billing_health.warning_message ada, tampilkan banner kuning di bagian atas dashboard.
     2. The "Lock" Mechanism: Jika billing_health.lock_website adalah true ATAU tenant.is_suspended adalah true:
        - Tampilkan Full-page Overlay Modal yang tidak bisa di-close.
        - Tampilkan pesan alasan dari suspended_reason atau warning_message.
        - Sediakan tombol "Pay Now" (ke menu Billing) atau "Contact Support".

  ---

  🎯 Task 3: Secure SSE Connection (Fixing Pending)
  Pastikan koneksi notifikasi real-time stabil dan tidak terblokir middleware frontend.

   - Endpoint: /api/v1/notifications/stream
   - Implementation:
     1. Bypass Security Headers: Pastikan middleware Next.js/Proxy tidak mengecek X-Timestamp dan X-Request-ID khusus untuk jalur /stream.
     2. Query Parameter Fallback: Jika browser menolak custom header pada SSE, gunakan parameter URL:

   1      const url = `/api/v1/notifications/stream?ts=${timestamp}&req_id=${reqID}&sig=${signature}`;
   2      new EventSource(url);
     3. Instant Connect: Backend kini mengirim event connected di awal. Jika dalam 2 detik FE belum menerima event ini, lakukan retry otomatis.

  ---

  🎯 Task 4: Superadmin Management Updates
  Update form manajemen tenant untuk mengontrol paket langganan secara akurat.

   - Endpoint: PUT /api/v1/superadmin/tenants/:id
   - Payload Baru:

   1   {
   2     "name": "Update Nama",
   3     "plan_id": 4,           // ID paket (1-4)
   4     "is_suspended": true,
   5     "suspended_reason": "Melanggar TOS"
   6   }
   - Sync Note: Mengubah plan_id di sini akan otomatis memperbarui tabel subscriptions di backend secara atomik.

  ---

  🛠️ Definition of Done (DoD)
   - [ ] Sidebar hanya menampilkan menu yang diizinkan oleh Role & Plan.
   - [ ] Website terkunci otomatis saat status Tenant menjadi Suspended.
   - [ ] Notifikasi muncul secara real-time tanpa status Pending lama di Network Tab.
   - [ ] Perubahan Paket di Superadmin langsung tercermin di profil User /me.

  ---
