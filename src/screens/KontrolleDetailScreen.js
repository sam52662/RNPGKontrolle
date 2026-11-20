import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { getKontrolleById, getAllKontrollen, deleteKontrolle } from '../services/storage';
import { syncKontrolleToGithub, getGithubToken } from '../services/githubSync';
import { colors } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DetailRow = ({ icon, label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{String(value)}</Text>
      </View>
    </View>
  );
};

const KontrolleDetailScreen = ({ route, navigation }) => {
  const { kontrolleId } = route.params;
  const [kontrolle, setKontrolle] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadKontrolle();
  }, []);

  const loadKontrolle = async () => {
    const k = await getKontrolleById(kontrolleId);
    setKontrolle(k);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const token = await getGithubToken();
      if (!token) {
        Alert.alert('Token fehlt', 'Bitte zuerst GitHub Token in den Einstellungen konfigurieren.', [
          { text: 'Einstellungen', onPress: () => navigation.navigate('Settings') },
          { text: 'Abbrechen', style: 'cancel' },
        ]);
        setSyncing(false);
        return;
      }
      const result = await syncKontrolleToGithub(kontrolle, token);
      const all = await getAllKontrollen();
      const updated = all.map(k =>
        k.id === kontrolle.id ? { ...k, synced: true, syncedFile: result.fileName } : k
      );
      await AsyncStorage.setItem('rnpg_kontrollen', JSON.stringify(updated));
      setKontrolle(prev => ({ ...prev, synced: true, syncedFile: result.fileName }));
      Alert.alert('✅ Synchronisiert', `Gespeichert in: ${result.fileName}`);
    } catch (e) {
      Alert.alert('Fehler', e.message || 'Synchronisierung fehlgeschlagen.');
    }
    setSyncing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Kontrolle löschen',
      'Möchten Sie diese Kontrolle wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await deleteKontrolle(kontrolleId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  if (!kontrolle) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const formattedDate = kontrolle.datum
    ? new Date(kontrolle.datum).toLocaleDateString('de-DE', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
      })
    : 'Kein Datum';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Kontrolle</Text>
          <Text style={styles.headerDate}>{formattedDate}</Text>
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status */}
        <View style={styles.statusCard}>
          <View style={[styles.statusDot, { backgroundColor: kontrolle.synced ? colors.success : colors.warning }]} />
          <Text style={styles.statusText}>
            {kontrolle.synced
              ? `Synchronisiert${kontrolle.syncedFile ? ` → ${kontrolle.syncedFile}` : ''}`
              : 'Noch nicht synchronisiert'}
          </Text>
        </View>

        {/* Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Allgemein</Text>
          <DetailRow icon="👤" label="Kontrolleur" value={kontrolle.kontrolleur} />
          <DetailRow icon="🛤️" label="Strecke" value={kontrolle.strecke} />
          <DetailRow icon="📍" label="Streckenabschnitt" value={kontrolle.streckenabschnitt} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎣 Kontrolle</Text>
          <DetailRow icon="👥" label="Kontrollierte Angler" value={kontrolle.kontrollierteAngler} />
          <DetailRow icon="⚠️" label="Art des Verstoßes" value={kontrolle.artDesVerstosses} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌤️ Wetter & Ufer</Text>
          <DetailRow icon="☁️" label="Wetter" value={kontrolle.wetter} />
          <DetailRow icon="🗑️" label="Ufer vermüllt" value={kontrolle.uferVermullt} />
          <DetailRow icon="🌿" label="Ufer Sonstiges" value={kontrolle.uferSonstiges} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Zusatz</Text>
          <DetailRow icon="💧" label="Besonderheiten Gewässer" value={kontrolle.besonderheitenGewaesser} />
          <DetailRow icon="💬" label="Bemerkungen" value={kontrolle.bemerkungen} />
        </View>

        {!kontrolle.synced && (
          <TouchableOpacity
            style={[styles.syncButton, syncing && styles.buttonDisabled]}
            onPress={handleSync}
            disabled={syncing}
            activeOpacity={0.85}
          >
            {syncing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.syncIcon}>☁️</Text>
            )}
            <Text style={styles.syncText}>Mit GitHub synchronisieren</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  headerDate: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  deleteButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  deleteIcon: { fontSize: 20 },
  scroll: { flex: 1 },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
    padding: 14,
    gap: 10,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 16,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  detailIcon: { fontSize: 16, marginTop: 1 },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 11, color: colors.textLight, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  detailValue: { fontSize: 15, color: colors.text, fontWeight: '500' },
  syncButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  syncIcon: { fontSize: 20 },
  syncText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  buttonDisabled: { opacity: 0.6 },
});

export default KontrolleDetailScreen;
