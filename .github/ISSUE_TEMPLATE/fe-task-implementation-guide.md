# FE Task: Implementasi Manajemen Task & Integration Timesheet

## 1. Deskripsi
Membuat modul manajemen Task di sisi Frontend agar pengguna dapat mengelola tugas proyek dan memilihnya saat mencatat *timesheet*. Task bersifat unik untuk setiap proyek dan dibuat oleh pengguna (atau admin) untuk kemudian digunakan sebagai referensi saat mengisi *timesheet*.

## 2. Fitur Utama
1. **Halaman Daftar Task**: Menampilkan daftar task berdasarkan proyek yang dipilih.
2. **Create Task**: *Form* untuk membuat task baru dalam proyek tertentu.
3. **Integration (Select Task)**: Mengintegrasikan *dropdown* task ke dalam form pengisian *timesheet*.

---

## 3. Step-by-Step Implementasi

### A. Integrasi Backend (Task Management)
Gunakan endpoint berikut untuk manajemen data task:
- **`GET /v1/timesheet/tasks?project_id={id}`**: Mengambil daftar task untuk proyek tertentu.
- **`POST /v1/timesheet/tasks`**: Membuat task baru.
    - *Payload*: `{"project_id": 123, "name": "Review Document", "description": "..."}`

### B. Halaman Manajemen Task
1. **UI List**: Buat tabel atau kartu yang menampilkan daftar task aktif untuk proyek yang dipilih.
2. **UI Create**: Gunakan modal atau halaman terpisah dengan *form* yang mencakup:
   - Nama Task (Required)
   - Deskripsi (Optional)
   - Tombol "Simpan"

### C. Integrasi ke Form Timesheet (POST `/v1/timesheet/entries`)
Untuk memastikan data *timesheet* memiliki referensi task yang valid, ubah alur pengisian form:
1. **Fetch Data**: Saat proyek dipilih, ambil daftar task via `GET /v1/timesheet/tasks?project_id={id}`.
2. **UI Component**: Gunakan komponen *Dropdown/Select* (disarankan tipe *Searchable*).
3. **Payload Submission**:
   - Jika user memilih task dari list:
     ```json
     {
       "project_id": 123,
       "task_id": 45, 
       "duration_hours": 8,
       "date": "2026-05-10T10:00:00Z",
       "notes": "Menyelesaikan peninjauan dokumen."
     }
     ```
   - *Catatan*: Backend sekarang lebih fleksibel. Jika Anda mengirim `task_id`, backend akan langsung menautkannya.

---

## 4. Guidelines UI/UX
- **Uniqueness**: Task bersifat unik per proyek. Pastikan validasi nama task tidak duplikat di dalam satu proyek yang sama untuk menghindari kebingungan user.
- **Workflow**: Jika user sedang mencatat waktu namun task belum ada, berikan tombol "Tambah Task Baru" tepat di sebelah *dropdown* task agar user tidak kehilangan progres input *timesheet* mereka.
- **Empty State**: Tampilkan pesan "Belum ada task, silakan buat task baru" jika daftar kosong.

## 6. API Reference: Task CRUD
Berikut adalah daftar endpoint untuk mengelola Task:

### 1. Create Task
- **Endpoint**: `POST /v1/timesheet/tasks`
- **Payload**:
  ```json
  {
    "project_id": 123,
    "name": "Review Document",
    "description": "Meninjau dokumen proyek fase 1"
  }
  ```

### 2. List Tasks
- **Endpoint**: `GET /v1/timesheet/tasks?project_id={id}`
- **Response**: List of tasks for the specified project.

### 3. Update Task (Need implemented in Handler/Service if missing)
- **Endpoint**: `PUT /v1/timesheet/tasks/:id`
- **Payload**:
  ```json
  {
    "name": "Updated Task Name",
    "description": "Updated description"
  }
  ```

### 4. Delete Task (Need implemented in Handler/Service if missing)
- **Endpoint**: `DELETE /v1/timesheet/tasks/:id`

---
*Catatan untuk Backend: Jika endpoint Update/Delete belum tersedia di `timesheet_handler.go` dan `timesheet_service.go`, segera implementasikan agar Frontend dapat mengelola task sepenuhnya.*
