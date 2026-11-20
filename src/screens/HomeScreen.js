import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, RefreshControl, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAllKontrollen } from '../services/storage';
import KontrolleCard from '../components/KontrolleCard';

const ICON_CLIPBOARD = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><rect x="10" y="8" width="28" height="34" rx="3" stroke="white" stroke-width="2.5"/><path d="M18 8v-2a2 2 0 014 0v0a2 2 0 002 2h0a2 2 0 002-2v0a2 2 0 014 0v2" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="22" x2="32" y2="22" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="16" y1="29" x2="32" y2="29" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M26 36l-8 0" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M22 15h4" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>')}`;

const ICON_FISH_CLIPBOARD = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect x="8" y="6" width="32" height="40" rx="3" stroke="white" stroke-width="2.5"/><path d="M16 6v-2a2 2 0 014 0v0a2 2 0 002 2h0a2 2 0 002-2v0a2 2 0 014 0v2" stroke="white" stroke-width="2.5" stroke-linecap="round"/><line x1="14" y1="20" x2="34" y2="20" stroke="white" stroke-width="2"/><line x1="14" y1="27" x2="28" y2="27" stroke="white" stroke-width="2"/><path d="M38 38 C44 32 56 34 58 40 C56 46 44 48 38 42 L34 44 L36 40 L34 36 Z" fill="white" fill-opacity="0.9"/><circle cx="54" cy="38" r="1.5" fill="#163d22"/></svg>')}`;

const ICON_CLOUD = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><path d="M36 34H14a8 8 0 010-16 8 8 0 0115.5-3A6 6 0 1136 34z" stroke="#5bc8f5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>')}`;

const ICON_WARNING = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><path d="M24 8L42 40H6L24 8z" stroke="#f5a623" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="24" y1="22" x2="24" y2="30" stroke="#f5a623" stroke-width="2.5" stroke-linecap="round"/><circle cx="24" cy="35" r="1.5" fill="#f5a623"/></svg>')}`;

const ICON_CHECK_CLIPBOARD = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><rect x="8" y="6" width="32" height="38" rx="3" stroke="white" stroke-width="2.5"/><path d="M18 6v-2a2 2 0 014 0v0a2 2 0 002 2h0a2 2 0 002-2v0a2 2 0 014 0v2" stroke="white" stroke-width="2.5" stroke-linecap="round"/><path d="M16 26l5 5 11-11" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>')}`;

const ICON_FISH_CLIPBOARD_GREEN = `data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20120%20120%22%3E%3Cdefs%3E%3CradialGradient%20id%3D%22g%22%20cx%3D%2250%25%22%20cy%3D%2250%25%22%20r%3D%2250%25%22%3E%3Cstop%20offset%3D%220%25%22%20stop-color%3D%22%230d3320%22%2F%3E%3Cstop%20offset%3D%22100%25%22%20stop-color%3D%22%23061510%22%2F%3E%3C%2FradialGradient%3E%3Cfilter%20id%3D%22n%22%3E%3CfeGaussianBlur%20stdDeviation%3D%222.5%22%20result%3D%22b%22%2F%3E%3CfeMerge%3E%3CfeMergeNode%20in%3D%22b%22%2F%3E%3CfeMergeNode%20in%3D%22SourceGraphic%22%2F%3E%3C%2FfeMerge%3E%3C%2Ffilter%3E%3C%2Fdefs%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%2258%22%20fill%3D%22url%28%23g%29%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%2256%22%20fill%3D%22none%22%20stroke%3D%22%233dba4e%22%20stroke-width%3D%222%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2260%22%20cy%3D%2260%22%20r%3D%2252%22%20fill%3D%22none%22%20stroke%3D%22%236eff8a%22%20stroke-width%3D%220.8%22%20opacity%3D%220.3%22%2F%3E%3Crect%20x%3D%2228%22%20y%3D%2222%22%20width%3D%2238%22%20height%3D%2252%22%20rx%3D%224%22%20fill%3D%22%230a2518%22%20stroke%3D%22%23b8f5cc%22%20stroke-width%3D%222.5%22%20filter%3D%22url%28%23n%29%22%2F%3E%3Crect%20x%3D%2242%22%20y%3D%2217%22%20width%3D%2216%22%20height%3D%2210%22%20rx%3D%223%22%20fill%3D%22%230a2518%22%20stroke%3D%22%23b8f5cc%22%20stroke-width%3D%222.2%22%2F%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2219%22%20r%3D%222.5%22%20fill%3D%22%230a2518%22%20stroke%3D%22%23b8f5cc%22%20stroke-width%3D%221.8%22%2F%3E%3Cpath%20d%3D%22M35%2038%20l4%204%20l7-7%22%20fill%3D%22none%22%20stroke%3D%22%23b8f5cc%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%2238%22%20x2%3D%2262%22%20y2%3D%2238%22%20stroke%3D%22%23b8f5cc%22%20stroke-width%3D%222.2%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M35%2051%20l4%204%20l7-7%22%20fill%3D%22none%22%20stroke%3D%22%23b8f5cc%22%20stroke-width%3D%222.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3Cline%20x1%3D%2250%22%20y1%3D%2251%22%20x2%3D%2262%22%20y2%3D%2251%22%20stroke%3D%22%23b8f5cc%22%20stroke-width%3D%222.2%22%20stroke-linecap%3D%22round%22%2F%3E%3Cpath%20d%3D%22M54%2068%20C62%2060%2082%2061%2085%2070%20C82%2079%2062%2080%2054%2072%20L48%2076%20L51%2070%20L48%2064%20Z%22%20fill%3D%22%23b8f5cc%22%20opacity%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2280%22%20cy%3D%2268%22%20r%3D%222%22%20fill%3D%22%230a2518%22%2F%3E%3Ccircle%20cx%3D%2280.5%22%20cy%3D%2267.5%22%20r%3D%220.7%22%20fill%3D%22%23b8f5cc%22%2F%3E%3Cpath%20d%3D%22M68%2062%20C70%2056%2076%2057%2074%2063%22%20fill%3D%22none%22%20stroke%3D%22%23b8f5cc%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E`;

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3dba4e" />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header (transparent — CSS lake-header div behind it) ── */}
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <View style={styles.headerLeft}>
              <View style={styles.appIconBox}>
                <Image source={{ uri: ICON_FISH_CLIPBOARD }} style={styles.appIconImg} />
              </View>
              <View style={styles.headerDivider} />
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

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Image source={{ uri: ICON_CLIPBOARD }} style={styles.statIconImg} />
            <Text style={[styles.statNum, { color: '#fff' }]}>{kontrollen.length}</Text>
            <Text style={styles.statLabel}>Gesamt</Text>
          </View>
          <View style={styles.statCard}>
            <Image source={{ uri: ICON_CLOUD }} style={styles.statIconImg} />
            <Text style={[styles.statNum, { color: '#5bc8f5' }]}>{synced}</Text>
            <Text style={styles.statLabel}>Synced</Text>
          </View>
          <View style={styles.statCard}>
            <Image source={{ uri: ICON_WARNING }} style={styles.statIconImg} />
            <Text style={[styles.statNum, { color: '#f5a623' }]}>{totalVerstoesse}</Text>
            <Text style={styles.statLabel}>Verstöße</Text>
          </View>
        </View>

        {/* ── CTA ── */}
        <View style={styles.ctaWrap}>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('KontrolleForm')} activeOpacity={0.85}>
            <View style={styles.ctaLeft}>
              <View style={styles.ctaIconBox}>
                <Image source={{ uri: ICON_CHECK_CLIPBOARD }} style={styles.ctaIconImg} />
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

        {/* ── Divider ── */}
        <View style={styles.divider}>
          <View style={styles.dividerBar} />
          <Text style={styles.dividerIcon}>🕐</Text>
          <Text style={styles.dividerText}>KONTROLLHISTORIE</Text>
          <View style={styles.dividerBar} />
        </View>

        {/* ── List / Empty ── */}
        {kontrollen.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyCircle}>
              <Image source={{ uri: ICON_FISH_CLIPBOARD_GREEN }} style={styles.emptyIconImg} />
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

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: 0 },

  header: {
    height: 170, backgroundColor: 'transparent', position: 'relative', overflow: 'visible',
  },
  headerInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 44, paddingHorizontal: 20, paddingBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  appIconBox: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
    padding: 8,
  },
  appIconImg: { width: 38, height: 38 },
  headerDivider: { width: 1.5, height: 40, backgroundColor: 'rgba(255,255,255,0.35)', marginHorizontal: 2 },
  appName: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 0.2 },
  appOrg: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  settingsBtn: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  settingsIcon: { fontSize: 20 },
  headerWave: {
    position: 'absolute', bottom: -18, left: -10, right: -10, height: 40,
    backgroundColor: '#163d22',
    borderTopLeftRadius: 999, borderTopRightRadius: 999,
  },

  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingTop: 22, paddingBottom: 4 },
  statCard: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    paddingVertical: 18, paddingHorizontal: 6,
  },
  statIconImg: { width: 32, height: 32, marginBottom: 8 },
  statNum: { fontSize: 28, fontWeight: '900', lineHeight: 32 },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: '500' },

  ctaWrap: { paddingHorizontal: 16, paddingTop: 16 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#3dba4e',
    borderRadius: 24, paddingVertical: 18, paddingHorizontal: 20,
    shadowColor: '#2d8f3a', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 18,
    elevation: 8,
  },
  ctaLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ctaIconBox: {
    width: 54, height: 54, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', padding: 10,
  },
  ctaIconImg: { width: 34, height: 34 },
  ctaTitle: { fontSize: 19, fontWeight: '900', color: '#fff', letterSpacing: 0.1 },
  ctaSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  ctaArrow: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaArrowText: { fontSize: 26, fontWeight: '700', color: '#fff', lineHeight: 32 },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8 },
  dividerBar: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.18)' },
  dividerIcon: { fontSize: 18 },
  dividerText: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5 },

  empty: { alignItems: 'center', paddingTop: 32, paddingHorizontal: 32 },
  emptyCircle: {
    width: 130, height: 130, borderRadius: 65,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    padding: 20,
  },
  emptyIconImg: { width: 80, height: 80 },
  emptyTitle: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 10 },
  emptyBody: { fontSize: 15, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 24 },

  bottomWaveWrap: { marginTop: 32, overflow: 'hidden' },
  bottomWave: {
    height: 60,
    backgroundColor: '#3dba4e',
    opacity: 0.15,
    borderTopLeftRadius: 999, borderTopRightRadius: 999,
  },
});

export default HomeScreen;
