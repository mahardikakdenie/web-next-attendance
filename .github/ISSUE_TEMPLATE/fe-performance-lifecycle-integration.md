# Frontend Task: Integration of Performance Management & HR Lifecycle Templates

## 1. Executive Summary
Backend telah menyelesaikan implementasi API untuk modul **Performance Management** (KPI/OKR, Appraisal Cycles) dan **HR Lifecycle Templates**. Tugas Frontend adalah mengganti data *mock* dengan real API call, menangani state management, dan mengimplementasikan feedback UI untuk operasi CRUD.

---

## 2. Module A: Performance Goals (KPI/OKR)

### 2.1. Daftar Goal Saya (Employee View)
- **Endpoint:** `GET /api/v1/performance/goals/me`
- **UI Requirement:** 
    - Render dalam bentuk Card atau Progress List.
    - Gunakan Badge warna untuk `status`: 
        - `IN_PROGRESS`: Blue
        - `COMPLETED`: Green
        - `CANCELLED`: Red
- **Data Mapping:**
    - Tampilkan `current_progress` / `target_value` bersama `unit` (contoh: "80 / 100 %").

### 2.2. Update Progress (Quick Update)
- **Endpoint:** `PUT /api/v1/performance/goals/{id}/progress`
- **Payload:** `{ "current_progress": float }`
- **UX Hint:** 
    - Gunakan Slider atau Input Number pada modal detail goal.
    - Jika `current_progress >= target_value`, beri feedback visual bahwa status akan berubah menjadi `COMPLETED`.

### 2.3. Manajemen Goal Tim (Manager View)
- **Endpoint:** 
    - List Goal User: `GET /api/v1/performance/goals/user/{userId}`
    - Create Goal: `POST /api/v1/performance/goals`
- **Payload Create:**
    ```json
    {
      "user_id": number,
      "title": "string",
      "description": "string",
      "type": "KPI" | "OKR",
      "target_value": number,
      "unit": "string",
      "start_date": "YYYY-MM-DD",
      "end_date": "YYYY-MM-DD"
    }
    ```
- **Validation:** `start_date` tidak boleh lebih besar dari `end_date`.

---

## 3. Module B: Performance Appraisals & Cycles

### 3.1. Overview Siklus (Admin/Manager)
- **Endpoint:** `GET /api/v1/performance/cycles`
- **UI:** Dropdown selector di halaman Performance untuk memfilter Appraisal berdasarkan siklus yang aktif.

### 3.2. Monitoring Appraisal Tim
- **Endpoint:** `GET /api/v1/performance/appraisals/cycle/{cycleId}`
- **Response Format:**
    ```json
    {
      "data": [
        {
          "id": 1,
          "user_name": "John Doe",
          "self_score": 4.5,
          "manager_score": 0,
          "status": "SELF_REVIEW"
        }
      ]
    }
    ```

### 3.3. Self-Review Submission (Employee)
- **Endpoint:** `PUT /api/v1/performance/appraisals/{id}/self-review`
- **Payload:** `{ "self_score": float, "comments": string }`
- **UX Hint:** Tampilkan Form ini hanya jika Appraisal status adalah `PENDING` atau `SELF_REVIEW`.

---

## 4. Module C: HR Lifecycle Templates (Settings)

Halaman ini berada di bawah `Tenant Settings > Lifecycle`.

### 4.1. List & Filter Template
- **Endpoint:** `GET /api/v1/hr/lifecycle-templates`
- **Query Params:** `category` (`ONBOARDING`, `OFFBOARDING`, `ACTIVE`).
- **UI:** Gunakan tab untuk berpindah antar kategori.

### 4.2. Tambah Task Baru
- **Endpoint:** `POST /api/v1/hr/lifecycle-templates`
- **Payload:**
    ```json
    {
      "task_name": "string",
      "category": "ONBOARDING" | "OFFBOARDING"
    }
    ```

### 4.3. Hapus Template
- **Endpoint:** `DELETE /api/v1/hr/lifecycle-templates/{id}`
- **Warning:** Tampilkan konfirmasi dialog sebelum menghapus karena ini adalah template sistem.

---

## 5. Technical Specifications & Validation

### 5.1. Authentication
- Semua request wajib menyertakan header `Authorization: Bearer {token}`.
- Pastikan token di-refresh jika menerima error `401`.

### 5.2. State Management (Recommended)
- Gunakan **React Query / TanStack Query** untuk caching data goal dan appraisal.
- Lakukan `invalidatesQueries` pada key yang relevan setelah melakukan `POST`/`PUT`/`DELETE`.

### 5.3. Error Handling
- **403 Forbidden:** Munculkan toast "Anda tidak memiliki akses (Bukan Manager/Admin)".
- **400 Bad Request:** Tampilkan pesan error spesifik dari backend (contoh: "Target value must be positive").

---

## 6. Acceptance Criteria
- [ ] User dapat melihat progres KPI/OKR mereka sendiri.
- [ ] Manager dapat membuatkan Goal untuk bawahannya.
- [ ] Karyawan dapat mengirimkan Self-Score beserta komentar.
- [ ] HR/Admin dapat mengelola (Tambah/Hapus) template tugas Onboarding/Offboarding.
- [ ] Perubahan data tercermin secara instan (Optimistic UI update atau Refetch).

## 7. Resources
- **Postman/Swagger:** `http://localhost:8080/swagger/index.html`
- **Figma Design:** [Link to Design System Section Performance]
