import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  StatusBar, RefreshControl, Alert, Image,
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

  useFocusEffect(
    useCallback(() => {
      loadKontrollen();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadKontrollen();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Kontrolle löschen',
      'Möchten Sie diese Kontrolle wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await deleteKontrolle(id);
            loadKontrollen();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>🎣 RNPG Kontrolle</Text>
            <Text style={styles.headerSubtitle}>Pachtgemeinschaft Kurpfalz e.V.</Text>
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{kontrollen.length}</Text>
            <Text style={styles.statLabel}>Gesamt</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {kontrollen.filter(k => k.synced).length}
            </Text>
            <Text style={styles.statLabel}>Synchronisiert</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {kontrollen.filter(k => k.artDesVerstosses && k.artDesVerstosses.trim()).length}
            </Text>
            <Text style={styles.statLabel}>Verstöße</Text>
          </View>
        </View>
      </View>

      {/* Start Button */}
      <View style={styles.startContainer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.navigate('KontrolleForm')}
          activeOpacity={0.85}
        >
          <Text style={styles.startButtonIcon}>🎣</Text>
          <Text style={styles.startButtonText}>Kontrolle starten</Text>
          <Text style={styles.startButtonArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* History */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📋 Kontrollhistorie</Text>
        {kontrollen.length > 0 && (
          <Text style={styles.sectionCount}>{kontrollen.length} Einträge</Text>
        )}
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={kontrollen.length === 0 ? styles.emptyContainer : styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {kontrollen.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌊</Text>
            <Text style={styles.emptyTitle}>Noch keine Kontrollen</Text>
            <Text style={styles.emptyText}>
              Starten Sie Ihre erste Fischereikontrolle mit dem Button oben.
            </Text>
          </View>
        ) : (
          kontrollen.map((kontrolle) => (
            <KontrolleCard
              key={kontrolle.id}
              kontrolle={kontrolle}
              onPress={() => navigation.navigate('KontrolleDetail', { kontrolleId: kontrolle.id })}
            />
          ))
        )}
        <View style={styles.listBottom} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  settingsButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  settingsIcon: {
    fontSize: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.accentLight,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  startContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  startButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  startButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  startButtonText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  startButtonArrow: {
    fontSize: 20,
    color: colors.primaryDark,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  sectionCount: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '500',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  listBottom: {
    height: 20,
  },
});

export default HomeScreen;
