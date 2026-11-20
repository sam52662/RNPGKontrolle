import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, RefreshControl, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllKontrollen, deleteKontrolle } from '../services/storage';
import KontrolleCard from '../components/KontrolleCard';
import { colors } from '../theme/colors';

const HomeScreen = ({ navigation }) => {
  const [kontrollen, setKontrollen] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadKontrollen = async () => {
    const data = await getAllKontrollen();
    setKontrollen(data);
  };

  useFocusEffect(useCallback(() => { loadKontrollen(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadKontrollen();
    setRefreshing(false);
  };

  const totalVerstoesse = kontrollen.filter(k => k.artDesVerstosses && k.artDesVerstosses.trim()).length;
  const synced = kontrollen.filter(k => k.synced).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerGlass}>
          <View style={styles.headerTop}>
            <View style={styles.logoWrap}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🎣</Text>
              </View>
              <View>
                <Text style={styles.appName}>RNPG Kontrolle</Text>
                <Text style={styles.appOrg}>Pachtgemeinschaft Kurpfalz e.V.</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.settingsCircle} onPress={() => navigation.navigate('Settings')}>
              <Text style={styles.settingsEmoji}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { value: kontrollen.length, label: 'Gesamt', icon: '📋', color: '#7ec8a0' },
              { value: synced,            label: 'Synced',  icon: '☁️', color: '#6ab4f5' },
              { value: totalVerstoesse,   label: 'Verstöße',icon: '⚠️', color: '#f5b942' },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statEmoji}>{s.icon}</Text>
                <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLbl}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* CTA */}
      <View style={styles.ctaZone}>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('KontrolleForm')} activeOpacity={0.85}>
          <View style={styles.ctaLeft}>
            <View style={styles.ctaIconBox}>
              <Text style={styles.ctaIconEmoji}>🎣</Text>
            </View>
            <View>
              <Text style={styles.ctaTitle}>Kontrolle starten</Text>
              <Text style={styles.ctaSub}>Neue Fischereikontrolle erfassen</Text>
            </View>
          </View>
          <View style={styles.ctaChevron}>
            <Text style={styles.ctaChevronText}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* History label */}
      <View style={styles.histRow}>
        <View style={styles.histLine} />
        <View style={styles.histPill}>
          <Text style={styles.histLabel}>KONTROLLHISTORIE</Text>
          {kontrollen.length > 0 && <Text style={styles.histCount}>{kontrollen.length}</Text>}
        </View>
        <View style={styles.histLine} />
      </View>

      {/* List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={kontrollen.length === 0 ? styles.emptyWrap : styles.listPad}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C8A84B" />}
        showsVerticalScrollIndicator={false}
      >
        {kontrollen.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyRing}>
              <View style={styles.emptyInner}>
                <Text style={styles.emptyEmoji}>🌊</Text>
              </View>
            </View>
            <Text style={styles.emptyTitle}>Noch keine Kontrollen</Text>
            <Text style={styles.emptyBody}>Starten Sie Ihre erste Fischereikontrolle mit dem Button oben.</Text>
          </View>
        ) : (
          kontrollen.map(k => (
            <KontrolleCard
              key={k.id}
              kontrolle={k}
              onPress={() => navigation.navigate('KontrolleDetail', { kontrolleId: k.id })}
            />
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const G = {
  glass: 'rgba(255,255,255,0.07)',
  glassBorder: 'rgba(255,255,255,0.13)',
  gold: '#C8A84B',
  white75: 'rgba(255,255,255,0.75)',
  white45: 'rgba(255,255,255,0.45)',
  white25: 'rgba(255,255,255,0.25)',
  white10: 'rgba(255,255,255,0.10)',
  dark: 'rgba(5,15,10,0.55)',
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },

  // ── Header ──────────────────────────────────────────────
  header: { paddingTop: 48, paddingHorizontal: 16, paddingBottom: 0 },
  headerGlass: {
    backgroundColor: 'rgba(10,30,16,0.72)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: G.glassBorder,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(200,168,75,0.18)',
    borderWidth: 1.5, borderColor: 'rgba(200,168,75,0.4)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: G.gold, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  logoEmoji: { fontSize: 24 },
  appName: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  appOrg: { fontSize: 11, color: G.white45, marginTop: 1, letterSpacing: 0.2 },
  settingsCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: G.glass, borderWidth: 1, borderColor: G.glassBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  settingsEmoji: { fontSize: 18 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16, borderWidth: 1, borderColor: G.glassBorder,
    paddingVertical: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6,
  },
  statEmoji: { fontSize: 20, marginBottom: 4 },
  statNum: { fontSize: 26, fontWeight: '900', lineHeight: 30 },
  statLbl: { fontSize: 9, color: G.white45, marginTop: 3, textTransform: 'uppercase', letterSpacing: 1 },

  // ── CTA ─────────────────────────────────────────────────
  ctaZone: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 2 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: G.gold,
    borderRadius: 22, paddingVertical: 16, paddingHorizontal: 18,
    shadowColor: G.gold, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 18,
    elevation: 8,
  },
  ctaLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  ctaIconBox: {
    width: 50, height: 50, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaIconEmoji: { fontSize: 26 },
  ctaTitle: { fontSize: 17, fontWeight: '800', color: '#1a3318', letterSpacing: 0.1 },
  ctaSub: { fontSize: 12, color: 'rgba(26,51,24,0.65)', marginTop: 2 },
  ctaChevron: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(26,51,24,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaChevronText: { fontSize: 22, fontWeight: '700', color: '#1a3318', lineHeight: 28 },

  // ── History divider ──────────────────────────────────────
  histRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8, gap: 10 },
  histLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  histPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(10,30,16,0.65)',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  histLabel: { fontSize: 10, fontWeight: '700', color: G.white45, letterSpacing: 1.2 },
  histCount: {
    fontSize: 11, fontWeight: '800', color: G.gold,
    backgroundColor: 'rgba(200,168,75,0.15)',
    paddingHorizontal: 7, paddingVertical: 1, borderRadius: 8,
  },

  // ── List ────────────────────────────────────────────────
  list: { flex: 1, backgroundColor: 'transparent' },
  listPad: { paddingTop: 4 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },

  // Empty state
  empty: { alignItems: 'center', paddingTop: 20 },
  emptyRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(10,30,16,0.5)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12,
  },
  emptyInner: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: G.white75, marginBottom: 10, letterSpacing: 0.2 },
  emptyBody: { fontSize: 14, color: G.white45, textAlign: 'center', lineHeight: 22 },
});

export default HomeScreen;
