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

      {/* Hero Header with gradient */}
      <View style={styles.hero}>
        <View style={styles.heroOverlay} />

        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>🎣</Text>
            </View>
            <View>
              <Text style={styles.appTitle}>RNPG Kontrolle</Text>
              <Text style={styles.appSub}>Pachtgemeinschaft Kurpfalz e.V.</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.settingsEmoji}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Stats glass cards */}
        <View style={styles.statsRow}>
          {[
            { value: kontrollen.length, label: 'Gesamt', icon: '📋' },
            { value: synced, label: 'Synced', icon: '☁️' },
            { value: totalVerstoesse, label: 'Verstöße', icon: '⚠️' },
          ].map((s, i) => (
            <View key={i} style={styles.statGlass}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* CTA Button */}
      <View style={styles.ctaWrapper}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('KontrolleForm')}
          activeOpacity={0.88}
        >
          <View style={styles.ctaInner}>
            <View style={styles.ctaLeft}>
              <View style={styles.ctaIconWrap}>
                <Text style={styles.ctaIcon}>🎣</Text>
              </View>
              <View>
                <Text style={styles.ctaTitle}>Kontrolle starten</Text>
                <Text style={styles.ctaSub}>Neue Fischereikontrolle erfassen</Text>
              </View>
            </View>
            <View style={styles.ctaArrow}>
              <Text style={styles.ctaArrowText}>→</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* History section */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Kontrollhistorie</Text>
        {kontrollen.length > 0 && (
          <View style={styles.historyBadge}>
            <Text style={styles.historyBadgeText}>{kontrollen.length}</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={kontrollen.length === 0 ? styles.emptyWrap : styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {kontrollen.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrap}>
              <Text style={styles.emptyEmoji}>🌊</Text>
            </View>
            <Text style={styles.emptyTitle}>Noch keine Kontrollen</Text>
            <Text style={styles.emptyText}>Starten Sie Ihre erste Fischereikontrolle mit dem Button oben.</Text>
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
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // Hero
  hero: {
    paddingTop: 44,
    paddingBottom: 24,
    paddingHorizontal: 20,
    background: 'linear-gradient(160deg, #1a4a2e 0%, #0d2b18 100%)',
    backgroundColor: '#1a4a2e',
    position: 'relative',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    top: -60, right: -60,
    width: 220, height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(200,168,75,0.10)',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoIcon: {
    width: 44, height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(200,168,75,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(200,168,75,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 22 },
  appTitle: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  appSub: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 1 },
  settingsBtn: {
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  settingsEmoji: { fontSize: 18 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statGlass: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  statIcon: { fontSize: 18, marginBottom: 4 },
  statValue: { fontSize: 24, fontWeight: '800', color: '#C8A84B', lineHeight: 28 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.6 },

  // CTA
  ctaWrapper: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    backgroundColor: '#0f2318',
  },
  ctaButton: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#C8A84B',
    shadowColor: '#C8A84B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  ctaLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  ctaIconWrap: {
    width: 46, height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaIcon: { fontSize: 24 },
  ctaTitle: { fontSize: 17, fontWeight: '800', color: '#1a3a20', letterSpacing: 0.2 },
  ctaSub: { fontSize: 12, color: 'rgba(26,58,32,0.65)', marginTop: 2 },
  ctaArrow: {
    width: 34, height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(26,58,32,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaArrowText: { fontSize: 18, fontWeight: 'bold', color: '#1a3a20' },

  // History header
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#0f2318',
  },
  historyTitle: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5 },
  historyBadge: {
    backgroundColor: 'rgba(200,168,75,0.20)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  historyBadgeText: { fontSize: 12, fontWeight: '700', color: '#C8A84B' },

  // List
  list: { flex: 1, backgroundColor: 'transparent' },
  listContent: { paddingBottom: 20 },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIconWrap: {
    width: 80, height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.75)', marginBottom: 8 },
  emptyText: { fontSize: 14, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 22 },
});

export default HomeScreen;
