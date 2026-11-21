// Layar Login dan Daftar, dengan validasi form
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Button, C, Field, s } from '../components/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Shell({ children }) {
  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[s.content, { paddingTop: 72 }]} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: C.white, fontSize: 28, fontWeight: '800' }}>JT</Text>
          </View>
          <Text style={[s.h1, { marginTop: 12 }]}>JejakTumbuh</Text>
          <Text style={s.muted}>Pantau tumbuh kembang si kecil</Text>
        </View>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!email.trim()) e.email = 'Email wajib diisi.';
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Format email tidak valid.';
    if (!password) e.password = 'Password wajib diisi.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e) {
      setServerError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <Field label="Email" value={email} onChangeText={setEmail} error={errors.email}
        placeholder="nama@email.com" autoCapitalize="none" keyboardType="email-address" />
      <Field label="Password" value={password} onChangeText={setPassword} error={errors.password}
        placeholder="Minimal 8 karakter" secureTextEntry />
      {serverError ? <Text style={[s.error, { marginBottom: 12 }]}>{serverError}</Text> : null}
      <Button title="Masuk" onPress={submit} loading={loading} />
      <Pressable onPress={() => navigation.navigate('Register')} style={{ marginTop: 18, alignItems: 'center' }}>
        <Text style={s.muted}>Belum punya akun? <Text style={{ color: C.primary, fontWeight: '700' }}>Daftar</Text></Text>
      </Pressable>
      <Text style={[s.hint, { textAlign: 'center', marginTop: 24 }]}>
        Akun demo: demo@jejaktumbuh.id / demo12345
      </Text>
    </Shell>
  );
}

export function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  function validate() {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Nama minimal 2 huruf.';
    if (!EMAIL_RE.test(form.email.trim())) e.email = 'Format email tidak valid.';
    if (form.password.length < 8) e.password = 'Password minimal 8 karakter.';
    if (form.confirm !== form.password) e.confirm = 'Konfirmasi password tidak sama.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password });
    } catch (e) {
      setServerError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell>
      <Field label="Nama orang tua" value={form.name} onChangeText={set('name')} error={errors.name} placeholder="Nama lengkap" />
      <Field label="Email" value={form.email} onChangeText={set('email')} error={errors.email}
        placeholder="nama@email.com" autoCapitalize="none" keyboardType="email-address" />
      <Field label="Password" value={form.password} onChangeText={set('password')} error={errors.password}
        placeholder="Minimal 8 karakter" secureTextEntry />
      <Field label="Ulangi password" value={form.confirm} onChangeText={set('confirm')} error={errors.confirm} secureTextEntry />
      {serverError ? <Text style={[s.error, { marginBottom: 12 }]}>{serverError}</Text> : null}
      <Button title="Daftar" onPress={submit} loading={loading} />
      <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 18, alignItems: 'center' }}>
        <Text style={s.muted}>Sudah punya akun? <Text style={{ color: C.primary, fontWeight: '700' }}>Masuk</Text></Text>
      </Pressable>
    </Shell>
  );
}
