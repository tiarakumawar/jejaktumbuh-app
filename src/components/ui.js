// Komponen tampilan yang dipakai ulang di banyak layar
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export const C = {
  primary: '#2F855A',
  primaryLight: '#E8F5EE',
  text: '#1F2933',
  muted: '#6B7785',
  border: '#DDE3E8',
  bg: '#F6F8F7',
  white: '#FFFFFF',
  danger: '#C53030',
  dangerLight: '#FDECEC',
  warn: '#B7791F',
  warnLight: '#FFF6E5',
};

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }) {
  const outline = variant === 'outline';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.btn,
        outline ? s.btnOutline : s.btnPrimary,
        (pressed || disabled) && { opacity: 0.7 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={outline ? C.primary : C.white} />
      ) : (
        <Text style={[s.btnText, outline && { color: C.primary }]}>{title}</Text>
      )}
    </Pressable>
  );
}

// Kolom isian dengan label dan pesan error di bawahnya
export function Field({ label, error, hint, ...props }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#9AA5B1"
        style={[s.input, error && { borderColor: C.danger }]}
        {...props}
      />
      {error ? <Text style={s.error}>{error}</Text> : hint ? <Text style={s.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Chip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipActive]}>
      <Text style={[s.chipText, active && { color: C.white }]}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style, onPress }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [s.card, pressed && { opacity: 0.85 }, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[s.card, style]}>{children}</View>;
}

export function Loading() {
  return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={C.primary} />
    </View>
  );
}

export function ErrorBox({ message, onRetry }) {
  return (
    <View style={s.center}>
      <Text style={[s.error, { textAlign: 'center', marginBottom: 12 }]}>{message}</Text>
      {onRetry && <Button title="Coba lagi" variant="outline" onPress={onRetry} />}
    </View>
  );
}

export function Empty({ text }) {
  return <Text style={[s.hint, { textAlign: 'center', marginTop: 32 }]}>{text}</Text>;
}

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  h1: { fontSize: 22, fontWeight: '700', color: C.text },
  h2: { fontSize: 17, fontWeight: '700', color: C.text },
  body: { fontSize: 15, color: C.text, lineHeight: 22 },
  muted: { fontSize: 13, color: C.muted },
  label: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: C.border, borderRadius: 10, backgroundColor: C.white,
    paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: C.text,
  },
  error: { color: C.danger, fontSize: 13, marginTop: 4 },
  hint: { color: C.muted, fontSize: 13, marginTop: 4 },
  btn: { borderRadius: 10, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  btnPrimary: { backgroundColor: C.primary },
  btnOutline: { borderWidth: 1.5, borderColor: C.primary, backgroundColor: C.white },
  btnText: { color: C.white, fontWeight: '700', fontSize: 15 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
    borderColor: C.border, backgroundColor: C.white, marginRight: 8,
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 13, color: C.text, fontWeight: '600' },
  card: {
    backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: C.border,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
});
