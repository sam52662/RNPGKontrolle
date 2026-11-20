import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'rnpg_kontrollen';

export const saveKontrolle = async (kontrolle) => {
  try {
    const existing = await getAllKontrollen();
    const updated = [kontrolle, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    console.error('Error saving Kontrolle:', e);
    return false;
  }
};

export const getAllKontrollen = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading Kontrollen:', e);
    return [];
  }
};

export const getKontrolleById = async (id) => {
  const all = await getAllKontrollen();
  return all.find((k) => k.id === id) || null;
};

export const deleteKontrolle = async (id) => {
  try {
    const existing = await getAllKontrollen();
    const updated = existing.filter((k) => k.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return true;
  } catch (e) {
    return false;
  }
};

export const generateId = () => {
  return `k_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
