import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { getKontrolleById, getAllKontrollen, deleteKontrolle } from '../services/storage';
import { syncKontrolleToGithub, getGithubToken } from '../services/githubSync';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Row = ({ icon, label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{String(value)}</Text>
      </View>
    </View>
  );
};

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const KontrolleDetailScreen = ({ route, navigation }) => {
  const { kontrolleId } = route.params;
  const [kontrolle, setKontrolle] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => setKontrolle(await getKontrolleById(kontrolleId));

  const handleSync = async () => {
    setSyncing(true);
    try {
      const token = await getGithubToken();
      if (!token) {
        Alert.alert('Token fehlt', 'Bitte GitHub Token konfigurieren.', [
          { text: 'Einstellungen', onPress: () => navigation.navigate('Settings') },
          { text: 'Abbrechen', style: 'cancel' },
        ]);
        setSyncing(false); return;
      }
      const result = await syncKontrolleToGithub(kontrolle, token);
      const all = await getAllKontrollen();
      const updated = all.map(k => k.id === kontrolle.id ? { ...k, synced: true, syncedFile: result.fileName } : k);
      await AsyncStorage.setItem('rnpg_kontrollen', JSON.stringify(updated));
      setKontrolle(p => ({ ...p, synced: true, syncedFile: result.fileName }));
      Alert.alert('Synchronisiert', `Gespeichert in: ${result.fileName}`);
    } catch (e) {
      Alert.alert('Fehler', e.message || 'Synchronisierung fehlgeschlagen.');
    }
    setSyncing(false);
  };

  const handleDelete = () => {
    Alert.alert('Löschen', 'Kontrolle wirklich löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      { text: 'Löschen', style: 'destructive', onPress: async () => { await deleteKontrolle(kontrolleId); navigation.goBack(); } },
    ]);
  };

  if (!kontrolle) return (
    <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color="#C8A84B" />
    </View>
  );

  const dateStr = kontrolle.datum
    ? new Date(kontrolle.datum).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    : 'Kein Datum';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Kontrolle</Text>
          <Text style={styles.headerSub}>{dateStr}</Text>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status pill */}
        <View style={[styles.statusPill, kontrolle.synced ? styles.pillSynced : styles.pillLocal]}>
          <View style={[styles.dot, { backgroundColor: kontrolle.synced ? '#4cd97b' : '#C8A84B' }]} />
          <Text style={[styles.pillText, { color: kontrolle.synced ? '#4cd97b' : '#C8A84B' }]}>
            {kontrolle.synced ? `Synchronisiert${kontrolle.syncedFile ? ' → ' + kontrolle.syncedFile : ''}` : 'Noch nicht synchronisiert'}
          </Text>
        </View>

        <Section title="📋 Allgemein">
          <Row icon="👤" label="Kontrolleur" value={kontrolle.kontrolleur} />
          <Row icon="🛤️" label="Strecke" value={kontrolle.strecke} />
          <Row icon="📍" label="Streckenabschnitt" value={kontrolle.streckenabschnitt} />
        </Section>
        <Section title="🎣 Kontrolle">
          <Row icon="👥" label="Kontrollierte Angler" value={kontrolle.kontrollierteAngler} />
          <Row icon="⚠️" label="Art des Verstoßes" value={kontrolle.artDesVerstosses} />
        </Section>
        <Section title="🌤️ Wetter & Ufer">
          <Row icon="☁️" label="Wetter" value={kontrolle.wetter} />
          <Row icon="🗑️" label="Ufer vermüllt" value={kontrolle.uferVermullt} />
          <Row icon="🌿" label="Ufer Sonstiges" value={kontrolle.uferSonstiges} />
        </Section>
        <Section title="📝 Zusatz">
          <Row icon="💧" label="Besonderheiten Gewässer" value={kontrolle.besonderheitenGewaesser} />
          <Row icon="💬" label="Bemerkungen" value={kontrolle.bemerkungen} />
        </Section>

        {!kontrolle.synced && (
          <TouchableOpacity style={[styles.syncBtn, syncing && styles.btnDisabled]} onPress={handleSync} disabled={syncing} activeOpacity={0.82}>
            {syncing ? <ActivityIndicator color="#1a3a20" size="small" /> : <Text style={styles.syncIcon}>☁️</Text>}
            <Text style={styles.syncText}>Mit GitHub synchronisieren</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    backgroundColor: '#1a4a2e', paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 1 },
  deleteBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  deleteText: { fontSize: 20 },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 16,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 14, borderWidth: 1,
  },
  pillSynced: { backgroundColor: 'rgba(39,174,96,0.08)', borderColor: 'rgba(39,174,96,0.20)' },
  pillLocal: { backgroundColor: 'rgba(200,168,75,0.08)', borderColor: 'rgba(200,168,75,0.20)' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { fontSize: 13, fontWeight: '600' },
  section: {
    marginHorizontal: 16, marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', padding: 16,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.5)',
    marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
    textTransform: 'uppercase', letterSpacing: 0.6,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  rowIcon: { fontSize: 16, marginTop: 1 },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 10, color: 'rgba(255,255,255,0.35)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  rowValue: { fontSize: 15, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  syncBtn: {
    marginHorizontal: 16, marginTop: 20,
    backgroundColor: '#C8A84B', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#C8A84B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  syncIcon: { fontSize: 20 },
  syncText: { fontSize: 16, fontWeight: '800', color: '#1a3a20' },
  btnDisabled: { opacity: 0.55 },
});

export default KontrolleDetailScreen;
