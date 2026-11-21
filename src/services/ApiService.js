// ApiService: semua pemanggilan API dari aplikasi JejakTumbuh.
// 1. Microservice JejakTumbuh sendiri (growth-service + recommendation-service lewat gateway)
// 2. API kelompok lain (lihat src/config/mitra.js)

import { MITRA } from '../config/mitra';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://jejaktumbuh.stei.fun/api';

async function request(baseUrl, path, { method = 'GET', body, token, timeout = 15000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(baseUrl + path, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (_) {
      data = { message: text };
    }
    if (!res.ok) {
      throw new Error(pesanError(data, res.status));
    }
    return data;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Server tidak merespons. Periksa koneksi internet.');
    if (e.message === 'Network request failed') throw new Error('Tidak bisa terhubung ke server.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// Ubah pesan error PocketBase menjadi kalimat yang mudah dibaca
function pesanError(data, status) {
  if (data && data.data && typeof data.data === 'object') {
    const first = Object.entries(data.data)[0];
    if (first) {
      const [field, info] = first;
      if (field === 'email' && info.code === 'validation_not_unique') return 'Email sudah terdaftar.';
      if (info && info.message) return `${field}: ${info.message}`;
    }
  }
  if (status === 400 && data && data.message === 'Failed to authenticate.') return 'Email atau password salah.';
  if (status === 401 || status === 403) return 'Sesi login habis. Silakan login ulang.';
  return (data && data.message) || `Terjadi kesalahan (kode ${status}).`;
}

const own = (path, opts) => request(API_URL, path, opts);
const q = (s) => encodeURIComponent(s);

// ---------- Akun (growth-service) ----------
export function register({ name, email, password }) {
  return own('/auth/records', {
    method: 'POST',
    body: { name, email, password, passwordConfirm: password },
  });
}

export function login(email, password) {
  return own('/auth/auth-with-password', {
    method: 'POST',
    body: { identity: email, password },
  }); // -> { token, record }
}

// ---------- Profil anak (growth-service, wajib login) ----------
export async function getChildren(token) {
  const data = await own('/children?sort=-created&perPage=50', { token });
  return data.items;
}

export function createChild(token, { name, birthDate, sex }) {
  return own('/children', {
    method: 'POST',
    token,
    body: { name, birth_date: `${birthDate} 00:00:00.000Z`, sex },
  });
}

export function deleteChild(token, id) {
  return own(`/children/${id}`, { method: 'DELETE', token });
}

// ---------- Pengukuran + status gizi (growth-service, wajib login) ----------
export async function getMeasurements(token, childId) {
  const data = await own(
    `/measurements?filter=${q(`child='${childId}'`)}&sort=-measured_at&perPage=100`,
    { token }
  );
  return data.items;
}

export function createMeasurement(token, { childId, measuredAt, weightKg, heightCm }) {
  return own('/measurements', {
    method: 'POST',
    token,
    body: {
      child: childId,
      measured_at: `${measuredAt} 00:00:00.000Z`,
      weight_kg: weightKg,
      height_cm: heightCm,
    },
  });
}

// ---------- Artikel & fasilitas (recommendation-service, publik) ----------
export async function getArticles(category) {
  const filter = category ? `&filter=${q(`category='${category}'`)}` : '';
  const data = await own(`/articles?sort=-created&perPage=50${filter}`);
  return data.items;
}

export function getArticle(id) {
  return own(`/articles/${id}`);
}

export async function getFacilities(type) {
  const filter = type ? `&filter=${q(`type='${type}'`)}` : '';
  const data = await own(`/facilities?sort=name&perPage=50${filter}`);
  return data.items;
}

// ---------- API kelompok lain ----------
function ambilField(obj, kandidat) {
  for (const k of kandidat) {
    if (obj && obj[k] != null && obj[k] !== '') return String(obj[k]);
  }
  return '';
}

// Ambil data dari satu kelompok mitra, lalu seragamkan bentuknya
export async function getMitraData(key) {
  const m = MITRA.find((x) => x.key === key);
  if (!m || !m.baseUrl) throw new Error('URL API belum diisi di file .env');
  const data = await request(m.baseUrl, m.path);
  const list = Array.isArray(data) ? data : data.items || data.data || data.results || [];
  return list.slice(0, 10).map((item, i) => ({
    id: String(item.id ?? i),
    judul: ambilField(item, m.fieldJudul) || `Data ${i + 1}`,
    keterangan: ambilField(item, m.fieldKeterangan),
  }));
}

export { MITRA };
