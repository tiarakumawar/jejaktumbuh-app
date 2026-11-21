// Layar artikel, fasilitas kesehatan, dan data kelompok mitra
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, Text, View } from 'react-native';
import * as Api from '../services/ApiService';
import { Card, Chip, C, Empty, ErrorBox, Loading, s } from '../components/ui';

export const KATEGORI = { gizi: 'Gizi', tumbuh_kembang: 'Tumbuh Kembang', gigi: 'Kesehatan Gigi' };
export const JENIS = {
  posyandu: 'Posyandu',
  puskesmas: 'Puskesmas',
  klinik_tumbuh_kembang: 'Klinik Tumbuh Kembang',
  dokter_gigi_anak: 'Dokter Gigi Anak',
  rumah_sakit: 'Rumah Sakit',
};

// Ambil data dengan status loading/error dan bisa ditarik untuk refresh
export function useLoad(fn, deps) {
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
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);
  return { data, error, refreshing, reload: () => load(true) };
}

// ---------- Tab Beranda: artikel + data mitra ----------
export function BerandaScreen({ navigation }) {
  const [kategori, setKategori] = useState('');
  const { data, error, refreshing, reload } = useLoad(() => Api.getArticles(kategori), [kategori]);

  const header = (
    <View>
      <Text style={s.h2}>Info dari kelompok mitra</Text>
      <Text style={[s.muted, { marginBottom: 10 }]}>Data diambil langsung dari API kelompok lain</Text>
      {Api.MITRA.map((m) => (
        <Card key={m.key} onPress={() => navigation.navigate('Mitra', { key: m.key, nama: m.nama })}>
          <Text style={[s.body, { fontWeight: '700' }]}>{m.nama}</Text>
          <Text style={s.muted}>{m.deskripsi}</Text>
        </Card>
      ))}
      <Text style={[s.h2, { marginTop: 8 }]}>Artikel untuk orang tua</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
        <Chip label="Semua" active={!kategori} onPress={() => setKategori('')} />
        {Object.entries(KATEGORI).map(([k, v]) => (
          <Chip key={k} label={v} active={kategori === k} onPress={() => setKategori(k)} />
        ))}
      </ScrollView>
    </View>
  );

  if (error && !data) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return <Loading />;
  return (
    <FlatList
      style={s.screen}
      contentContainerStyle={s.content}
      data={data}
      keyExtractor={(a) => a.id}
      ListHeaderComponent={header}
      ListEmptyComponent={<Empty text="Belum ada artikel di kategori ini." />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} />}
      renderItem={({ item }) => (
        <Card onPress={() => navigation.navigate('ArtikelDetail', { id: item.id, title: item.title })}>
          <View style={[s.badge, { backgroundColor: C.primaryLight, marginBottom: 6 }]}>
            <Text style={[s.badgeText, { color: C.primary }]}>{KATEGORI[item.category]}</Text>
          </View>
          <Text style={[s.body, { fontWeight: '700' }]}>{item.title}</Text>
          <Text style={[s.muted, { marginTop: 4 }]}>{item.summary}</Text>
        </Card>
      )}
    />
  );
}

export function ArtikelDetailScreen({ route }) {
  const { data, error, reload } = useLoad(() => Api.getArticle(route.params.id), [route.params.id]);
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!data) return <Loading />;
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <View style={[s.badge, { backgroundColor: C.primaryLight, marginBottom: 8 }]}>
        <Text style={[s.badgeText, { color: C.primary }]}>{KATEGORI[data.category]}</Text>
      </View>
      <Text style={s.h1}>{data.title}</Text>
      <Text style={[s.body, { marginTop: 14 }]}>{data.content}</Text>
      <Text style={[s.muted, { marginTop: 20 }]}>Sumber: {data.source}</Text>
    </ScrollView>
  );
}

// ---------- Tab Layanan: fasilitas kesehatan ----------
export function LayananScreen({ navigation, route }) {
  const [jenis, setJenis] = useState(route.params?.jenis || '');
  useEffect(() => {
    if (route.params?.jenis !== undefined) setJenis(route.params.jenis);
  }, [route.params?.jenis]);
  const { data, error, refreshing, reload } = useLoad(() => Api.getFacilities(jenis), [jenis]);

  return (
    <View style={s.screen}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, paddingHorizontal: 16, paddingVertical: 12 }}>
        <Chip label="Semua" active={!jenis} onPress={() => setJenis('')} />
        {Object.entries(JENIS).map(([k, v]) => (
          <Chip key={k} label={v} active={jenis === k} onPress={() => setJenis(k)} />
        ))}
      </ScrollView>
      {error && !data ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : !data ? (
        <Loading />
      ) : (
        <FlatList
          contentContainerStyle={[s.content, { paddingTop: 0 }]}
          data={data}
          keyExtractor={(f) => f.id}
          ListEmptyComponent={<Empty text="Belum ada fasilitas untuk jenis ini." />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} />}
          renderItem={({ item }) => (
            <Card onPress={() => navigation.navigate('FasilitasDetail', { item })}>
              <Text style={[s.muted, { color: C.primary, fontWeight: '700' }]}>{JENIS[item.type]}</Text>
              <Text style={[s.body, { fontWeight: '700' }]}>{item.name}</Text>
              <Text style={s.muted}>{item.address}, {item.city}</Text>
              <Text style={[s.muted, { marginTop: 4 }]}>{item.schedule}</Text>
            </Card>
          )}
        />
      )}
    </View>
  );
}

export function FasilitasDetailScreen({ route }) {
  const f = route.params.item;
  const baris = [
    ['Jenis', JENIS[f.type]],
    ['Alamat', `${f.address}, ${f.city}`],
    ['Layanan', f.services],
    ['Jadwal', f.schedule],
    ['Telepon', f.phone || '-'],
    ['Koordinat', f.latitude ? `${f.latitude}, ${f.longitude}` : '-'],
  ];
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Text style={s.h1}>{f.name}</Text>
      <Card style={{ marginTop: 14 }}>
        {baris.map(([k, v]) => (
          <View key={k} style={{ marginBottom: 10 }}>
            <Text style={s.muted}>{k}</Text>
            <Text style={s.body}>{v}</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

// ---------- Data dari API kelompok lain ----------
export function MitraScreen({ route }) {
  const { key } = route.params;
  const m = Api.MITRA.find((x) => x.key === key);
  const { data, error, refreshing, reload } = useLoad(() => Api.getMitraData(key), [key]);
  return (
    <FlatList
      style={s.screen}
      contentContainerStyle={s.content}
      data={data || []}
      keyExtractor={(x) => x.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={reload} />}
      ListHeaderComponent={
        <View style={{ marginBottom: 12 }}>
          <Text style={s.muted}>{m.deskripsi}</Text>
          <Text style={[s.hint, { marginTop: 4 }]}>Sumber: {m.baseUrl ? m.baseUrl + m.path : 'belum diatur'}</Text>
          {error ? <Text style={[s.error, { marginTop: 10 }]}>{error}</Text> : null}
          {!data && !error ? <Loading /> : null}
        </View>
      }
      renderItem={({ item }) => (
        <Card>
          <Text style={[s.body, { fontWeight: '700' }]}>{item.judul}</Text>
          {item.keterangan ? <Text style={s.muted}>{item.keterangan}</Text> : null}
        </Card>
      )}
    />
  );
}
