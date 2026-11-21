// Layar profil anak, riwayat pengukuran, dan form tambah data (wajib login)
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Api from '../services/ApiService';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Chip, C, Empty, ErrorBox, Field, Loading, s } from '../components/ui';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const hariIni = () => new Date().toISOString().slice(0, 10);
const tgl = (str) => (str || '').slice(0, 10);

function usiaTeks(birth) {
  const b = new Date(tgl(birth) + 'T00:00:00Z');
  const bulan = Math.floor((Date.now() - b.getTime()) / 86400000 / 30.4375);
  if (bulan < 12) return `${bulan} bulan`;
  return `${Math.floor(bulan / 12)} tahun ${bulan % 12} bulan`;
}

function validTanggal(str) {
  if (!DATE_RE.test(str)) return false;
  const d = new Date(str + 'T00:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === str;
}

// Warna status gizi: hijau normal, kuning perlu perhatian, merah perlu periksa
function warnaStatus(status) {
  if (!status) return { bg: C.primaryLight, fg: C.primary };
  if (/normal/.test(status) && !/lebih/.test(status)) return { bg: C.primaryLight, fg: C.primary };
  if (/sangat|kurang|pendek/.test(status)) return { bg: C.dangerLight, fg: C.danger };
  return { bg: C.warnLight, fg: C.warn };
}

function Badge({ text }) {
  const w = warnaStatus(text);
  return (
    <View style={[s.badge, { backgroundColor: w.bg, marginRight: 6, marginTop: 4 }]}>
      <Text style={[s.badgeText, { color: w.fg }]}>{text}</Text>
    </View>
  );
}

// Ambil ulang data setiap kali layar dibuka
function useFocusLoad(fn) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async (isRefresh) => {
    if (isRefresh) setRefreshing(true);
    setError('');
    try {
      setData(await fn());
    } catch (e) {
      setError(e.message);
    } finally {
      setRefreshing(false);
    }
  }, [fn]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  return { data, error, refreshing, reload: () => load(true) };
}

// ---------- Tab Anakku ----------
export function AnakkuScreen({ navigation }) {
  const { auth } = useAuth();
  const fn = useCallback(() => Api.getChildren(auth.token), [auth.token]);
  const { data, error, refreshing, reload } = useFocusLoad(fn);

  if (error && !data) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return <Loading />;
  return (
    <FlatList
      style={s.screen}
      contentContainerStyle={s.content}
      data={data}
      keyExtractor={(c) => c.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} />}
      ListHeaderComponent={
        <Button title="+ Tambah profil anak" onPress={() => navigation.navigate('TambahAnak')} style={{ marginBottom: 16 }} />
      }
      ListEmptyComponent={<Empty text="Belum ada profil anak. Tambahkan dulu untuk mulai mencatat pertumbuhan." />}
      renderItem={({ item }) => (
        <Card onPress={() => navigation.navigate('AnakDetail', { child: item })}>
          <Text style={[s.body, { fontWeight: '700' }]}>{item.name}</Text>
          <Text style={s.muted}>
            {item.sex === 'L' ? 'Laki-laki' : 'Perempuan'} · {usiaTeks(item.birth_date)}
          </Text>
        </Card>
      )}
    />
  );
}

export function TambahAnakScreen({ navigation }) {
  const { auth } = useAuth();
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [sex, setSex] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (name.trim().length < 2) e.name = 'Nama anak minimal 2 huruf.';
    if (!validTanggal(birthDate)) e.birthDate = 'Gunakan format TTTT-BB-HH, contoh 2024-05-17.';
    else if (birthDate > hariIni()) e.birthDate = 'Tanggal lahir tidak boleh di masa depan.';
    if (!sex) e.sex = 'Pilih jenis kelamin.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await Api.createChild(auth.token, { name: name.trim(), birthDate, sex });
      navigation.goBack();
    } catch (e) {
      setServerError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Field label="Nama anak" value={name} onChangeText={setName} error={errors.name} placeholder="Nama panggilan" />
      <Field label="Tanggal lahir" value={birthDate} onChangeText={setBirthDate} error={errors.birthDate}
        placeholder="2024-05-17" hint="Format TTTT-BB-HH" keyboardType="numbers-and-punctuation" maxLength={10} />
      <Text style={s.label}>Jenis kelamin</Text>
      <View style={[s.row, { marginBottom: 4 }]}>
        <Chip label="Laki-laki" active={sex === 'L'} onPress={() => setSex('L')} />
        <Chip label="Perempuan" active={sex === 'P'} onPress={() => setSex('P')} />
      </View>
      {errors.sex ? <Text style={s.error}>{errors.sex}</Text> : null}
      {serverError ? <Text style={[s.error, { marginTop: 12 }]}>{serverError}</Text> : null}
      <Button title="Simpan" onPress={submit} loading={loading} style={{ marginTop: 20 }} />
    </ScrollView>
  );
}

// Grafik batang sederhana berat badan dari pengukuran terlama ke terbaru
function GrafikBerat({ items }) {
  const data = [...items].reverse().slice(-8);
  if (data.length < 2) return null;
  const max = Math.max(...data.map((m) => m.weight_kg));
  return (
    <Card>
      <Text style={[s.body, { fontWeight: '700', marginBottom: 10 }]}>Perkembangan berat badan (kg)</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120 }}>
        {data.map((m) => (
          <View key={m.id} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: C.muted }}>{m.weight_kg}</Text>
            <View style={{ width: 18, height: (m.weight_kg / max) * 90, backgroundColor: C.primary, borderRadius: 4, marginTop: 2 }} />
            <Text style={{ fontSize: 9, color: C.muted, marginTop: 4 }}>{m.age_months} bln</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function AnakDetailScreen({ navigation, route }) {
  const { auth } = useAuth();
  const { child } = route.params;
  const fn = useCallback(() => Api.getMeasurements(auth.token, child.id), [auth.token, child.id]);
  const { data, error, refreshing, reload } = useFocusLoad(fn);

  function hapus() {
    Alert.alert('Hapus profil anak?', `Data ${child.name} dan semua riwayat pengukurannya akan dihapus.`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive',
        onPress: async () => {
          try {
            await Api.deleteChild(auth.token, child.id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Gagal', e.message);
          }
        },
      },
    ]);
  }

  if (error && !data) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return <Loading />;
  const terbaru = data[0];

  return (
    <FlatList
      style={s.screen}
      contentContainerStyle={s.content}
      data={data}
      keyExtractor={(m) => m.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} />}
      ListHeaderComponent={
        <View>
          <Text style={s.muted}>
            {child.sex === 'L' ? 'Laki-laki' : 'Perempuan'} · lahir {tgl(child.birth_date)} · {usiaTeks(child.birth_date)}
          </Text>
          {terbaru ? (
            <Card style={{ marginTop: 12 }}>
              <Text style={[s.body, { fontWeight: '700' }]}>Status gizi terakhir ({tgl(terbaru.measured_at)})</Text>
              <View style={[s.row, { flexWrap: 'wrap', marginTop: 4 }]}>
                <Badge text={`BB/U: ${terbaru.status_bb_u}`} />
                <Badge text={`TB/U: ${terbaru.status_tb_u}`} />
              </View>
              {terbaru.perlu_periksa ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={s.body}>Disarankan memeriksakan anak ke posyandu atau puskesmas terdekat.</Text>
                  <Button title="Cari tempat periksa" variant="outline" style={{ marginTop: 10 }}
                    onPress={() => navigation.navigate('Tabs', { screen: 'Layanan', params: { jenis: 'puskesmas' } })} />
                </View>
              ) : (
                <Text style={[s.muted, { marginTop: 8 }]}>Pertumbuhan sesuai standar. Tetap timbang rutin setiap bulan.</Text>
              )}
            </Card>
          ) : null}
          <Button title="+ Tambah pengukuran" style={{ marginVertical: 12 }}
            onPress={() => navigation.navigate('TambahPengukuran', { child })} />
          <GrafikBerat items={data} />
          <Text style={[s.h2, { marginBottom: 8 }]}>Riwayat pengukuran</Text>
        </View>
      }
      ListEmptyComponent={<Empty text="Belum ada data pengukuran." />}
      ListFooterComponent={<Button title="Hapus profil anak" variant="outline" onPress={hapus} style={{ marginTop: 20 }} />}
      renderItem={({ item }) => (
        <Card>
          <Text style={[s.body, { fontWeight: '700' }]}>
            {tgl(item.measured_at)} · usia {item.age_months} bulan
          </Text>
          <Text style={s.muted}>Berat {item.weight_kg} kg · Tinggi {item.height_cm} cm</Text>
          <View style={[s.row, { flexWrap: 'wrap' }]}>
            <Badge text={item.status_bb_u} />
            <Badge text={item.status_tb_u} />
          </View>
        </Card>
      )}
    />
  );
}

export function TambahPengukuranScreen({ navigation, route }) {
  const { auth } = useAuth();
  const { child } = route.params;
  const [measuredAt, setMeasuredAt] = useState(hariIni());
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const angka = (v) => Number(String(v).replace(',', '.'));

  function validate() {
    const e = {};
    if (!validTanggal(measuredAt)) e.measuredAt = 'Gunakan format TTTT-BB-HH.';
    else if (measuredAt > hariIni()) e.measuredAt = 'Tanggal tidak boleh di masa depan.';
    else if (measuredAt < tgl(child.birth_date)) e.measuredAt = 'Tanggal tidak boleh sebelum tanggal lahir anak.';
    const w = angka(weight);
    if (!weight) e.weight = 'Berat badan wajib diisi.';
    else if (isNaN(w) || w < 1 || w > 50) e.weight = 'Berat badan harus antara 1 dan 50 kg.';
    const h = angka(height);
    if (!height) e.height = 'Tinggi badan wajib diisi.';
    else if (isNaN(h) || h < 40 || h > 150) e.height = 'Tinggi badan harus antara 40 dan 150 cm.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const hasil = await Api.createMeasurement(auth.token, {
        childId: child.id, measuredAt, weightKg: angka(weight), heightCm: angka(height),
      });
      Alert.alert('Tersimpan', `Berat: ${hasil.status_bb_u}\nTinggi: ${hasil.status_tb_u}`);
      navigation.goBack();
    } catch (e) {
      setServerError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={[s.muted, { marginBottom: 14 }]}>Untuk {child.name}. Status gizi dihitung otomatis oleh server berdasarkan standar WHO.</Text>
      <Field label="Tanggal pengukuran" value={measuredAt} onChangeText={setMeasuredAt} error={errors.measuredAt}
        hint="Format TTTT-BB-HH" keyboardType="numbers-and-punctuation" maxLength={10} />
      <Field label="Berat badan (kg)" value={weight} onChangeText={setWeight} error={errors.weight}
        placeholder="contoh 9,5" keyboardType="decimal-pad" />
      <Field label="Tinggi / panjang badan (cm)" value={height} onChangeText={setHeight} error={errors.height}
        placeholder="contoh 78,2" keyboardType="decimal-pad" />
      {serverError ? <Text style={[s.error, { marginBottom: 12 }]}>{serverError}</Text> : null}
      <Button title="Simpan pengukuran" onPress={submit} loading={loading} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}
