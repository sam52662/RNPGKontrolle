import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

const StatusBadge = ({ status }) => {
  const config = {
    abgeschlossen: { bg: colors.success + '20', text: colors.success, label: 'Abgeschlossen' },
    offen: { bg: colors.warning + '20', text: colors.warning, label: 'Offen' },
    synced: { bg: colors.water + '20', text: colors.water, label: 'Synchronisiert' },
  };
  const c = config[status] || config.abgeschlossen;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
};

const KontrolleCard = ({ kontrolle, onPress }) => {
  const date = kontrolle.datum ? new Date(kontrolle.datum).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }) : 'Kein Datum';

  const hasVerstoss = kontrolle.artDesVerstosses && kontrolle.artDesVerstosses.trim().length > 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateIcon}>📅</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <StatusBadge status={kontrolle.synced ? 'synced' : 'abgeschlossen'} />
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>🗺️ Strecke</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {kontrolle.strecke || '—'}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>📍 Abschnitt</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {kontrolle.streckenabschnitt || '—'}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>🎣 Angler</Text>
          <Text style={styles.infoValue}>{kontrolle.kontrollierteAngler || '—'}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>☁️ Wetter</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{kontrolle.wetter || '—'}</Text>
        </View>
      </View>

      {hasVerstoss && (
        <View style={styles.verstossContainer}>
          <Text style={styles.verstossLabel}>⚠️ Verstoß:</Text>
          <Text style={styles.verstossText} numberOfLines={2}>
            {kontrolle.artDesVerstosses}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 7,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateIcon: {
    fontSize: 14,
  },
  date: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 2,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  verstossContainer: {
    backgroundColor: colors.error + '12',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  verstossLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.error,
    marginBottom: 2,
  },
  verstossText: {
    fontSize: 13,
    color: colors.text,
  },
});

export default KontrolleCard;
