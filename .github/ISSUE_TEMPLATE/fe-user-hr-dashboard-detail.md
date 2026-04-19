 Subject: [Update BE] API Employee Behavioral DNA & Analytics Ready for Integration

  Halo Tim FE,

  Implementasi Backend untuk fitur Employee DNA Profile (Deep Dive) di HR Dashboard sudah selesai.
  Endpoint ini sekarang sudah tersedia di server development dan siap untuk diintegrasikan ke komponen
  HrDashboard.tsx.

  API Details
   - Endpoint: GET /api/v1/dashboards/hr/employee-dna/{user_id}
   - Method: GET
   - Auth: Require Bearer Token & X-Tenant-ID
   - Role Access: SuperAdmin, Admin, HR

  Key Features for FE Integration:
   1. Radar Metrics (0-100): Data sudah di-calculate di server mencakup Punctuality, Overtime
      Efficiency, Leave Regularity, Productivity Index, dan Compliance Rate. Cocok untuk langsung
      dipetakan ke Chart Radar.
   2. Punctuality DNA:
       - arrival_consistency: Dihitung berdasarkan Standar Deviasi waktu Clock-In (makin kecil
         deviasi, makin tinggi skor konsistensinya).
       - avg_clock_in & avg_clock_out: Format string "HH:mm".
   3. Automated Insights: Array string berisi pesan analisis perilaku (misal: "Karyawan sangat
      konsisten...", "Waspada burnout...", dll) yang bisa langsung di-render di bagian Insights
      section.
   4. Performance Score: Skor agregat (single value) untuk indikator performa umum di header modal.

  Documentation
  Dokumentasi Swagger terbaru sudah di-update. Silakan cek di /swagger/index.html untuk melihat detail
  skema respons lengkapnya.

  Status Task
   - [x] Endpoint Created
   - [x] Swagger Documentation Updated
   - [x] Unit Test Metrics Logic Passed
   - [x] Response Time Optimized (< 300ms)

  Silakan tim FE melanjutkan integrasi ke fungsi setSelectedEmployee atau modal terkait. Jika ada
  kendala terkait mapping data, langsung kabari saya ya.

  Terima kasih! 🚀
