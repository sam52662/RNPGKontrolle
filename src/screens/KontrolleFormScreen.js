import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { saveKontrolle, generateId } from '../services/storage';
import { syncKontrolleToGithub, getGithubToken } from '../services/githubSync';
import { colors } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WETTER_OPTIONS = ['Sonnig', 'Bewölkt', 'Regnerisch', 'Neblig', 'Windig', 'Gewitter'];
const UFER_OPTIONS = ['Ja', 'Nein', 'Leicht'];

const FormField = ({ label, icon, children, required }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>
      {icon} {label}{required && <Text style={styles.required}> *</Text>}
    </Text>
    {children}
  </View>
);

const SelectButtons = ({ options, value, onChange, style }) => (
  <View style={[styles.selectRow, style]}>
    {options.map((opt) => (
      <TouchableOpacity
        key={opt}
        style={[styles.selectButton, value === opt && styles.selectButtonActive]}
        onPress={() => onChange(value === opt ? '' : opt)}
        activeOpacity={0.7}
      >
        <Text style={[styles.selectButtonText, value === opt && styles.selectButtonTextActive]}>
          {opt}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const KontrolleFormScreen = ({ navigation }) => {
  const scrollRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [form, setForm] = useState({
    datum: new Date().toISOString().split('T')[0],
    kontrolleur: '',
    strecke: '',
    streckenabschnitt: '',
    kontrollierteAngler: '',
    artDesVerstosses: '',
    wetter: '',
    uferVermullt: '',
    uferSonstiges: '',
    besonderheitenGewaesser: '',
    bemerkungen: '',
  });

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const formatDateDisplay = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
  };

  const handleDateInput = (text) => {
    // Allow typing dd.mm.yyyy and auto-convert
    const digits = text.replace(/\D/g, '');
    if (digits.length <= 8) {
      let formatted = digits;
      if (digits.length > 2) formatted = digits.slice(0, 2) + '.' + digits.slice(2);
      if (digits.length > 4) formatted = formatted.slice(0, 6) + '.' + formatted.slice(6);
      setField('datum_display', formatted);
      if (digits.length === 8) {
        const iso = `${digits.slice(4)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
        setField('datum', iso);
      }
    }
  };

  const validate = () => {
    if (!form.datum) { Alert.alert('Pflichtfeld', 'Bitte geben Sie ein Datum ein.'); return false; }
    if (!form.strecke.trim()) { Alert.alert('Pflichtfeld', 'Bitte geben Sie eine Strecke ein.'); return false; }
    return true;
  };

  const handleSave = async (syncToGithub = false) => {
    if (!validate()) return;
    setSaving(true);

    const kontrolle = {
      ...form,
      id: generateId(),
      createdAt: new Date().toISOString(),
      synced: false,
      kontrollierteAngler: form.kontrollierteAngler ? parseInt(form.kontrollierteAngler, 10) : '',
    };

    const saved = await saveKontrolle(kontrolle);
    if (!saved) {
      Alert.alert('Fehler', 'Kontrolle konnte nicht gespeichert werden.');
      setSaving(false);
      return;
    }

    if (syncToGithub) {
      setSyncing(true);
      try {
        const token = await getGithubToken();
        if (!token) {
          Alert.alert(
            'GitHub Token fehlt',
            'Bitte konfigurieren Sie zunächst Ihren GitHub Token in den Einstellungen.',
            [{ text: 'OK', onPress: () => navigation.navigate('Settings') }]
          );
          setSaving(false);
          setSyncing(false);
          return;
        }
        const result = await syncKontrolleToGithub(kontrolle, token);
        // Mark as synced
        const all = await (await import('../services/storage')).getAllKontrollen();
        const updated = all.map(k => k.id === kontrolle.id ? { ...k, synced: true, syncedFile: result.fileName } : k);
        await AsyncStorage.setItem('rnpg_kontrollen', JSON.stringify(updated));
        Alert.alert('✅ Synchronisiert', `Gespeichert in: ${result.fileName}\nZeile: ${result.rowIndex}`, [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } catch (e) {
        Alert.alert('Sync-Fehler', e.message || 'GitHub Synchronisierung fehlgeschlagen.', [
          { text: 'Trotzdem speichern', onPress: () => navigation.goBack() },
          { text: 'Abbrechen', style: 'cancel' },
        ]);
      }
      setSyncing(false);
    } else {
      navigation.goBack();
    }
    setSaving(false);
  };

  const isLoading = saving || syncing;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Neue Kontrolle</Text>
          <Text style={styles.headerSubtitle}>Fischereiaufsicht</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Section: Allgemein */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Allgemeine Angaben</Text>

          <FormField label="Datum" icon="📅" required>
            <TextInput
              style={styles.input}
              value={form.datum_display !== undefined ? form.datum_display : formatDateDisplay(form.datum)}
              onChangeText={handleDateInput}
              placeholder="TT.MM.JJJJ"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
              maxLength={10}
            />
          </FormField>

          <FormField label="Kontrolleur" icon="👤">
            <TextInput
              style={styles.input}
              value={form.kontrolleur}
              onChangeText={(v) => setField('kontrolleur', v)}
              placeholder="Name des Kontrolleurs"
              placeholderTextColor={colors.textLight}
              autoCapitalize="words"
            />
          </FormField>
        </View>

        {/* Section: Strecke */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗺️ Strecke & Abschnitt</Text>

          <FormField label="Strecke" icon="🛤️" required>
            <TextInput
              style={styles.input}
              value={form.strecke}
              onChangeText={(v) => setField('strecke', v)}
              placeholder="z.B. Neckar Abschnitt Nord"
              placeholderTextColor={colors.textLight}
              autoCapitalize="words"
            />
          </FormField>

          <FormField label="Genauer Streckenabschnitt" icon="📍">
            <TextInput
              style={styles.input}
              value={form.streckenabschnitt}
              onChangeText={(v) => setField('streckenabschnitt', v)}
              placeholder="z.B. Brücke bis Schleuse"
              placeholderTextColor={colors.textLight}
              autoCapitalize="words"
            />
          </FormField>
        </View>

        {/* Section: Kontrolle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎣 Kontrolldetails</Text>

          <FormField label="Kontrollierte Angler" icon="👥">
            <TextInput
              style={styles.input}
              value={String(form.kontrollierteAngler)}
              onChangeText={(v) => setField('kontrollierteAngler', v.replace(/[^0-9]/g, ''))}
              placeholder="Anzahl"
              placeholderTextColor={colors.textLight}
              keyboardType="numeric"
            />
          </FormField>

          <FormField label="Art des Verstoßes" icon="⚠️">
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={form.artDesVerstosses}
              onChangeText={(v) => setField('artDesVerstosses', v)}
              placeholder="Beschreibung des Verstoßes (falls vorhanden)"
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </FormField>
        </View>

        {/* Section: Wetter & Ufer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🌤️ Wetter & Ufer</Text>

          <FormField label="Wetter" icon="☁️">
            <SelectButtons
              options={WETTER_OPTIONS}
              value={form.wetter}
              onChange={(v) => setField('wetter', v)}
            />
            {!WETTER_OPTIONS.includes(form.wetter) && (
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                value={WETTER_OPTIONS.includes(form.wetter) ? '' : form.wetter}
                onChangeText={(v) => setField('wetter', v)}
                placeholder="Sonstiges Wetter..."
                placeholderTextColor={colors.textLight}
              />
            )}
          </FormField>

          <FormField label="Aussehen Ufer — Vermüllt" icon="🗑️">
            <SelectButtons
              options={UFER_OPTIONS}
              value={form.uferVermullt}
              onChange={(v) => setField('uferVermullt', v)}
            />
          </FormField>

          <FormField label="Aussehen Ufer — Sonstiges" icon="🌿">
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={form.uferSonstiges}
              onChangeText={(v) => setField('uferSonstiges', v)}
              placeholder="Sonstige Beobachtungen am Ufer"
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </FormField>
        </View>

        {/* Section: Zusatz */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Zusatzinformationen</Text>

          <FormField label="Besonderheiten Gewässer" icon="💧">
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={form.besonderheitenGewaesser}
              onChangeText={(v) => setField('besonderheitenGewaesser', v)}
              placeholder="Auffälligkeiten am Gewässer"
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </FormField>

          <FormField label="Bemerkungen" icon="💬">
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={form.bemerkungen}
              onChangeText={(v) => setField('bemerkungen', v)}
              placeholder="Weitere Bemerkungen"
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </FormField>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.buttonDisabled]}
            onPress={() => handleSave(false)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {saving && !syncing ? (
              <ActivityIndicator color={colors.primaryDark} size="small" />
            ) : (
              <Text style={styles.saveButtonIcon}>💾</Text>
            )}
            <Text style={styles.saveButtonText}>Lokal speichern</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.syncButton, isLoading && styles.buttonDisabled]}
            onPress={() => handleSave(true)}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {syncing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.syncButtonIcon}>✅</Text>
            )}
            <Text style={styles.syncButtonText}>Abgeschlossen & Sync</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    padding: 16,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: 12,
  },
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  selectButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonIcon: {
    fontSize: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  syncButton: {
    backgroundColor: colors.primary,
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
  syncButtonIcon: {
    fontSize: 20,
  },
  syncButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default KontrolleFormScreen;
