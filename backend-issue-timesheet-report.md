# Report Masalah API Timesheet (Data Mismatch)

Kepada Tim Backend,

Kami menemukan ketidaksesuaian data antara endpoint saat melakukan input timesheet dan saat menarik laporan. Mohon bantuannya untuk melakukan pengecekan pada sisi backend agar data yang dikirimkan dapat disimpan dan ditampilkan kembali secara utuh.

## 1. Masalah Utama
Data yang dikirim melalui `POST /v1/timesheet/entries` tidak muncul atau tidak terpetakan dengan benar ketika dipanggil melalui `GET /v1/timesheet/me/report`.

### Payload POST `/v1/timesheet/entries` (Front-end mengirim):
```json
{
  "project_id": 123,
  "task_name": "Review Document",
  "duration_hours": 8,
  "date": "2026-05-10T10:00:00.000Z",
  "description": "Menyelesaikan peninjauan dokumen proyek."
}
```

### Hasil dari GET `/v1/timesheet/me/report` (Front-end menerima):
Ketika kami memeriksa respons dari endpoint laporan, beberapa field terlihat hilang atau kosong:
- Field `task_name` tidak muncul di list table laporan.
- Field `description` (detailed) tidak ada atau tidak sinkron dengan yang dikirimkan.

## 2. Pertanyaan untuk Tim Backend
1. Apakah field `task_name` dan `description` sudah disimpan di database pada table entries?
2. Apakah endpoint `GET /v1/timesheet/me/report` sudah mengambil data tersebut dari database?
3. Apakah ada proses transformasi data (mapping) di backend yang menyebabkan data tersebut tidak di-include dalam respons laporan?

## 3. Harapan
Kami berharap field berikut dapat tersedia dalam respons `GET /v1/timesheet/me/report` agar UI dapat menampilkannya dengan akurat:
- `task_name` (sesuai input "What are you working on")
- `description` (sesuai input "Detailed Description")

Mohon informasinya jika ada perubahan struktur endpoint yang perlu kami sesuaikan di sisi front-end. Terima kasih.
