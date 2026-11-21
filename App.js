// JejakTumbuh: aplikasi pemantauan tumbuh kembang anak
// Navigasi: Stack (login, detail, form) + Bottom Tab (Beranda, Anakku, Layanan, Akun)
import React from 'react';
import { Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen, RegisterScreen } from './src/screens/auth';
import {
  ArtikelDetailScreen, BerandaScreen, FasilitasDetailScreen, LayananScreen, MitraScreen,
} from './src/screens/info';
import {
  AnakDetailScreen, AnakkuScreen, TambahAnakScreen, TambahPengukuranScreen,
} from './src/screens/anak';
import { AkunScreen } from './src/screens/akun';
import { C, Loading } from './src/components/ui';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Ikon tab sederhana berupa huruf, supaya tidak butuh paket ikon tambahan
function TabIcon({ label, focused }) {
  return (
    <View style={{
      width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
      backgroundColor: focused ? C.primary : C.primaryLight,
    }}>
      <Text style={{ color: focused ? C.white : C.primary, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: C.primary,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tab.Screen name="Beranda" component={BerandaScreen}
        options={{ tabBarIcon: (p) => <TabIcon label="B" {...p} /> }} />
      <Tab.Screen name="Anakku" component={AnakkuScreen}
        options={{ tabBarIcon: (p) => <TabIcon label="A" {...p} /> }} />
      <Tab.Screen name="Layanan" component={LayananScreen}
        options={{ title: 'Cari Layanan', tabBarIcon: (p) => <TabIcon label="L" {...p} /> }} />
      <Tab.Screen name="Akun" component={AkunScreen}
        options={{ tabBarIcon: (p) => <TabIcon label="K" {...p} /> }} />
    </Tab.Navigator>
  );
}

function Root() {
  const { auth, loading } = useAuth();
  if (loading) return <Loading />;
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: C.primary, headerBackTitle: 'Kembali' }}>
      {auth ? (
        <>
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="ArtikelDetail" component={ArtikelDetailScreen} options={{ title: 'Artikel' }} />
          <Stack.Screen name="FasilitasDetail" component={FasilitasDetailScreen} options={{ title: 'Detail Layanan' }} />
          <Stack.Screen name="Mitra" component={MitraScreen} options={({ route }) => ({ title: route.params.nama })} />
          <Stack.Screen name="AnakDetail" component={AnakDetailScreen} options={({ route }) => ({ title: route.params.child.name })} />
          <Stack.Screen name="TambahAnak" component={TambahAnakScreen} options={{ title: 'Tambah Profil Anak' }} />
          <Stack.Screen name="TambahPengukuran" component={TambahPengukuranScreen} options={{ title: 'Tambah Pengukuran' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Root />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
