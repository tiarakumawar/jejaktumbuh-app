// Tab Akun: profil orang tua, status koneksi API, dan logout
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import * as Api from '../services/ApiService';
import { Button, Card, s } from '../components/ui';

export function AkunScreen() {
  const { auth, logout } = useAuth();
  const u = auth.user;
  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <Card>
        <Text style={s.muted}>Nama</Text>
        <Text style={[s.body, { fontWeight: '700', marginBottom: 8 }]}>{u.name || '-'}</Text>
        <Text style={s.muted}>Email</Text>
        <Text style={s.body}>{u.email}</Text>
      </Card>
      <Card>
        <Text style={[s.body, { fontWeight: '700', marginBottom: 6 }]}>Layanan yang terhubung</Text>
        <Text style={s.muted}>JejakTumbuh API</Text>
        <Text style={[s.body, { marginBottom: 8 }]}>{Api.API_URL}</Text>
        {Api.MITRA.map((m) => (
          <View key={m.key} style={{ marginBottom: 8 }}>
            <Text style={s.muted}>{m.nama}</Text>
            <Text style={s.body}>{m.baseUrl ? m.baseUrl + m.path : 'belum diatur'}</Text>
          </View>
        ))}
      </Card>
      <Button title="Keluar" variant="outline" onPress={logout} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}
