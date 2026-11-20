import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllKontrollen } from '../services/storage';
import KontrolleCard from '../components/KontrolleCard';

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
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4caf50" />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header with lake scene ── */}
        <View style={styles.header}>
          {/* Lake photo simulation via layered gradients */}
          <View style={styles.headerBg}>
            <View style={styles.headerSky} />
            <View style={styles.headerForest} />
            <View style={styles.headerWater} />
            <View style={styles.headerFog} />
          </View>

          <View style={styles.headerContent}>
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <View style={styles.appIconBox}>
                  <Text style={styles.appIconText}>📋</Text>
                </View>
                <View style={styles.dividerLine} />
                <View>
                  <Text style={styles.appName}>RNPG Kontrolle</Text>
                  <Text style={styles.appOrg}>Pachtgemeinschaft Kurpfalz e.V.</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
                <Text style={styles.settingsIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Wave transition */}
          <View style={styles.headerWave} />
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          {[
            { value: kontrollen.length, label: 'Gesamt',  icon: '📋', color: '#fff' },
            { value: synced,            label: 'Synced',  icon: '☁️', color: '#5bc8f5' },
            { value: totalVerstoesse,   label: 'Verstöße',icon: '⚠️', color: '#f5a623' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── CTA ── */}
        <View style={styles.ctaWrap}>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('KontrolleForm')} activeOpacity={0.85}>
            <View style={styles.ctaLeft}>
              <View style={styles.ctaIconBox}>
                <Text style={styles.ctaIconText}>✅</Text>
              </View>
              <View>
                <Text style={styles.ctaTitle}>Kontrolle starten</Text>
                <Text style={styles.ctaSub}>Neue Fischereikontrolle erfassen</Text>
              </View>
            </View>
            <View style={styles.ctaArrow}>
              <Text style={styles.ctaArrowText}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── History divider ── */}
        <View style={styles.divider}>
          <View style={styles.dividerBar} />
          <Text style={styles.dividerIcon}>🕐</Text>
          <Text style={styles.dividerText}>KONTROLLHISTORIE</Text>
          <View style={styles.dividerBar} />
        </View>

        {/* ── List ── */}
        {kontrollen.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyCircle}>
              <Text style={styles.emptyEmoji}>🐟</Text>
            </View>
            <Text style={styles.emptyTitle}>Noch keine Kontrollen</Text>
            <Text style={styles.emptyBody}>Starten Sie Ihre erste Fischereikontrolle{'\n'}mit dem Button oben.</Text>
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

        {/* Bottom wave decoration */}
        <View style={styles.bottomWave} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const DARK_GREEN = '#0d2b1a';
const MID_GREEN  = '#1a4a2e';
const LIGHT_GREEN = '#2d7a3a';
const BRIGHT_GREEN = '#3dba4e';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: 0 },

  // ── Header ──────────────────────────────────────────────
  header: { height: 180, overflow: 'hidden', position: 'relative' },
  headerBg: { ...StyleSheet.absoluteFillObject },
  headerSky: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 90,
    backgroundColor: '#1a3d20',
  },
  headerForest: {
    position: 'absolute', top: 55, left: 0, right: 0, height: 70,
    backgroundColor: '#0f2a14',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 40,
  },
  headerWater: {
    position: 'absolute', top: 90, left: 0, right: 0, bottom: 0,
    backgroundColor: '#152e1c',
    opacity: 0.9,
  },
  headerFog: {
    position: 'absolute', top: 70, left: 0, right: 0, height: 40,
    backgroundColor: '#2a5535',
    opacity: 0.3,
  },
  headerContent: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    paddingTop: 44, paddingHorizontal: 20,
    justifyContent: 'flex-start',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  appIconBox: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  appIconText: { fontSize: 26 },
  dividerLine: { width: 1.5, height: 36, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 2 },
  appName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
  appOrg: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  settingsBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  settingsIcon: { fontSize: 20 },
  headerWave: {
    position: 'absolute', bottom: -1, left: 0, right: 0, height: 32,
    backgroundColor: 'transparent',
    borderTopLeftRadius: 999, borderTopRightRadius: 999,
  },

  // ── Stats ────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 4,
  },
  statCard: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 16,
  },
  statIcon:  { fontSize: 22, marginBottom: 6 },
  statNum:   { fontSize: 28, fontWeight: '900', lineHeight: 32 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: '500' },

  // ── CTA ──────────────────────────────────────────────────
  ctaWrap: { paddingHorizontal: 16, paddingTop: 16 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: BRIGHT_GREEN,
    borderRadius: 22, paddingVertical: 18, paddingHorizontal: 20,
    shadowColor: BRIGHT_GREEN, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 18,
    elevation: 8,
  },
  ctaLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ctaIconBox: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaIconText: { fontSize: 28 },
  ctaTitle: { fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: 0.1 },
  ctaSub:   { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  ctaArrow: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaArrowText: { fontSize: 24, fontWeight: '700', color: '#fff', lineHeight: 30 },

  // ── Divider ──────────────────────────────────────────────
  divider: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8,
  },
  dividerBar: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  dividerIcon: { fontSize: 16 },
  dividerText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1.5 },

  // ── Empty ────────────────────────────────────────────────
  empty: { alignItems: 'center', paddingTop: 32, paddingHorizontal: 32 },
  emptyCircle: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  emptyEmoji: { fontSize: 52 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 10 },
  emptyBody:  { fontSize: 15, color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 24 },

  // ── Bottom wave ──────────────────────────────────────────
  bottomWave: {
    height: 60, marginTop: 32,
    backgroundColor: 'rgba(61,186,78,0.12)',
    borderTopLeftRadius: 999, borderTopRightRadius: 999,
    marginHorizontal: -20,
  },
});

export default HomeScreen;
