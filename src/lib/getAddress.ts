/**
 * Fungsi untuk mendapatkan alamat lengkap dari koordinat
 * Menggunakan OpenStreetMap Nominatim API (Gratis)
 */
export async function getAddressFromCoords(lat: number, lon: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'Accept-Language': 'id-ID', // Meminta hasil dalam Bahasa Indonesia
          'User-Agent': 'HRIS-App' // Nominatim mewajibkan User-Agent yang jelas
        }
      }
    );

    if (!response.ok) throw new Error("Gagal mengambil data alamat");

    const data = await response.json();
    
    // Kembalikan field 'display_name' yang berisi alamat lengkap
    return data.display_name || "Alamat tidak ditemukan";
  } catch (error) {
    console.error("Reverse Geocoding Error:", error);
    return "Gagal memproses alamat";
  }
}
