// Konfigurasi API kelompok lain yang dipanggil aplikasi.
// Isi URL di file .env (EXPO_PUBLIC_MITRA1_URL, EXPO_PUBLIC_MITRA2_URL),
// lalu sesuaikan nama, path endpoint, dan nama field yang ditampilkan.

export const MITRA = [
  {
    key: 'mitra1',
    nama: 'CekJajan (Kelompok MandaBita)',
    deskripsi: 'Informasi kandungan gula, garam, dan lemak jajanan anak',
    baseUrl: process.env.EXPO_PUBLIC_MITRA1_URL || '',
    path: '/products', // ganti sesuai endpoint GET dari kelompok mitra
    fieldJudul: ['name', 'nama', 'title', 'judul'],
    fieldKeterangan: ['description', 'deskripsi', 'summary', 'category', 'kategori'],
  },
  {
    key: 'mitra2',
    nama: 'Kelompok Mitra 2',
    deskripsi: 'Isi dengan layanan dari kelompok kedua',
    baseUrl: process.env.EXPO_PUBLIC_MITRA2_URL || '',
    path: '/items', // ganti sesuai endpoint GET dari kelompok mitra
    fieldJudul: ['name', 'nama', 'title', 'judul'],
    fieldKeterangan: ['description', 'deskripsi', 'summary', 'category', 'kategori'],
  },
];
