import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Api from '../services/ApiService';

const AuthContext = createContext(null);
const KEY = 'jejaktumbuh_auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null); // { token, user }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((s) => s && setAuth(JSON.parse(s)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function simpan(data) {
    setAuth(data);
    try {
      if (data) await AsyncStorage.setItem(KEY, JSON.stringify(data));
      else await AsyncStorage.removeItem(KEY);
    } catch (_) {}
  }

  async function login(email, password) {
    const res = await Api.login(email, password);
    await simpan({ token: res.token, user: res.record });
  }

  async function register(form) {
    await Api.register(form);
    await login(form.email, form.password);
  }

  const logout = () => simpan(null);

  return (
    <AuthContext.Provider value={{ auth, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
