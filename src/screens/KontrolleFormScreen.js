import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, StatusBar, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { saveKontrolle, generateId } from '../services/storage';
import { syncKontrolleToGithub, getGithubToken } from '../services/githubSync';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WETTER_OPTIONS = ['Sonnig', 'Bewölkt', 'Regnerisch', 'Neblig', 'Windig', 'Gewitter'];
const UFER_OPTIONS = ['Ja', 'Nein', 'Leicht'];

const Section = ({ title, icon, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const Field = ({ label, required, children }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}{required && <Text style={styles.req}> *</Text>}</Text>
    {children}
  </View>
);

const Chips = ({ options, value, onChange }) => (
  <View style={styles.chips}>
    {options.map(opt => (
      <TouchableOpacity
        key={opt}
        style={[styles.chip, value === opt && styles.chipActive]}
        onPress={() => onChange(value === opt ? '' : opt)}
        activeOpacity={0.75}
      >
        <Text style={[styles.chipText, value === opt && styles.chipTextActive]}>{opt}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const KontrolleFormScreen = ({ navigation }) => {
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState({
    datum: new Date().toISOString().split('T')[0],
    datum_display: new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    kontrolleur: '', strecke: '', streckenabschnitt: '',
    kontrollierteAngler: '', artDesVerstosses: '', wetter: '',
    uferVermullt: '', uferSonstiges: '', besonderheitenGewaesser: '', bemerkungen: '',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleDateInput = (text) => {
    const digits = text.replace(/\D/g, '');
    let display = digits;
    if (digits.length > 2) display = digits.slice(0, 2) + '.' + digits.slice(2);
    if (digits.length > 4) display = display.slice(0, 6) + '.' + display.slice(6);
    set('datum_display', display);
    if (digits.length === 8) set('datum', `${digits.slice(4)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`);
  };

  const validate = () => {
    if (!form.datum) { Alert.alert('Pflichtfeld', 'Bitte Datum eingeben.'); return false; }
    if (!form.strecke.trim()) { Alert.alert('Pflichtfeld', 'Bitte Strecke eingeben.'); return false; }
    return true;
  };

  const handleSave = async (syncToGithub = false) => {
    if (!validate()) return;
    setSaving(true);
    const kontrolle = {
      ...form, id: generateId(), createdAt: new Date().toISOString(), synced: false,
      kontrollierteAngler: form.kontrollierteAngler ? parseInt(form.kontrollierteAngler, 10) : '',
    };
    const saved = await saveKontrolle(kontrolle);
    if (!saved) { Alert.alert('Fehler', 'Speichern fehlgeschlagen.'); setSaving(false); return; }

    if (syncToGithub) {
      setSyncing(true);
      try {
        const token = await getGithubToken();
        if (!token) {
          Alert.alert('Token fehlt', 'Bitte GitHub Token in Einstellungen konfigurieren.', [
            { text: 'Einstellungen', onPress: () => navigation.navigate('Settings') },
          ]);
          setSaving(false); setSyncing(false); return;
        }
        const result = await syncKontrolleToGithub(kontrolle, token);
        const all = await (await import('../services/storage')).getAllKontrollen();
        const updated = all.map(k => k.id === kontrolle.id ? { ...k, synced: true, syncedFile: result.fileName } : k);
        await AsyncStorage.setItem('rnpg_kontrollen', JSON.stringify(updated));
        Alert.alert('Synchronisiert', `Gespeichert in: ${result.fileName}`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } catch (e) {
        Alert.alert('Sync-Fehler', e.message || 'Fehlgeschlagen.', [
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Neue Kontrolle</Text>
          <Text style={styles.headerSub}>Fischereiaufsicht</Text>
        </View>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <Section title="Allgemeine Angaben" icon="📋">
          <Field label="Datum" required>
            <TextInput style={styles.input} value={form.datum_display} onChangeText={handleDateInput}
              placeholder="TT.MM.JJJJ" placeholderTextColor="rgba(255,255,255,0.25)" keyboardType="numeric" maxLength={10} />
          </Field>
          <Field label="Kontrolleur">
            <TextInput style={styles.input} value={form.kontrolleur} onChangeText={v => set('kontrolleur', v)}
              placeholder="Name des Kontrolleurs" placeholderTextColor="rgba(255,255,255,0.25)" autoCapitalize="words" />
          </Field>
        </Section>

        <Section title="Strecke & Abschnitt" icon="🗺️">
          <Field label="Strecke" required>
            <TextInput style={styles.input} value={form.strecke} onChangeText={v => set('strecke', v)}
              placeholder="z.B. Neckar Abschnitt Nord" placeholderTextColor="rgba(255,255,255,0.25)" autoCapitalize="words" />
          </Field>
          <Field label="Genauer Streckenabschnitt">
            <TextInput style={styles.input} value={form.streckenabschnitt} onChangeText={v => set('streckenabschnitt', v)}
              placeholder="z.B. Brücke bis Schleuse" placeholderTextColor="rgba(255,255,255,0.25)" autoCapitalize="words" />
          </Field>
        </Section>

        <Section title="Kontrolldetails" icon="🎣">
          <Field label="Kontrollierte Angler">
            <TextInput style={styles.input} value={String(form.kontrollierteAngler)} onChangeText={v => set('kontrollierteAngler', v.replace(/[^0-9]/g, ''))}
              placeholder="Anzahl" placeholderTextColor="rgba(255,255,255,0.25)" keyboardType="numeric" />
          </Field>
          <Field label="Art des Verstoßes">
            <TextInput style={[styles.input, styles.inputMulti]} value={form.artDesVerstosses} onChangeText={v => set('artDesVerstosses', v)}
              placeholder="Beschreibung des Verstoßes (falls vorhanden)" placeholderTextColor="rgba(255,255,255,0.25)"
              multiline numberOfLines={3} textAlignVertical="top" />
          </Field>
        </Section>

        <Section title="Wetter & Ufer" icon="🌤️">
          <Field label="Wetter">
            <Chips options={WETTER_OPTIONS} value={form.wetter} onChange={v => set('wetter', v)} />
          </Field>
          <Field label="Aussehen Ufer — Vermüllt">
            <Chips options={UFER_OPTIONS} value={form.uferVermullt} onChange={v => set('uferVermullt', v)} />
          </Field>
          <Field label="Aussehen Ufer — Sonstiges">
            <TextInput style={[styles.input, styles.inputMulti]} value={form.uferSonstiges} onChangeText={v => set('uferSonstiges', v)}
              placeholder="Sonstige Beobachtungen am Ufer" placeholderTextColor="rgba(255,255,255,0.25)" multiline numberOfLines={2} textAlignVertical="top" />
          </Field>
        </Section>

        <Section title="Zusatzinformationen" icon="📝">
          <Field label="Besonderheiten Gewässer">
            <TextInput style={[styles.input, styles.inputMulti]} value={form.besonderheitenGewaesser} onChangeText={v => set('besonderheitenGewaesser', v)}
              placeholder="Auffälligkeiten am Gewässer" placeholderTextColor="rgba(255,255,255,0.25)" multiline numberOfLines={3} textAlignVertical="top" />
          </Field>
          <Field label="Bemerkungen">
            <TextInput style={[styles.input, styles.inputMulti]} value={form.bemerkungen} onChangeText={v => set('bemerkungen', v)}
              placeholder="Weitere Bemerkungen" placeholderTextColor="rgba(255,255,255,0.25)" multiline numberOfLines={3} textAlignVertical="top" />
          </Field>
        </Section>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.btnSave, isLoading && styles.btnDisabled]} onPress={() => handleSave(false)} disabled={isLoading} activeOpacity={0.82}>
            {saving && !syncing ? <ActivityIndicator color="#1a3a20" size="small" /> : <Text style={styles.btnSaveIcon}>💾</Text>}
            <Text style={styles.btnSaveText}>Lokal speichern</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnSync, isLoading && styles.btnDisabled]} onPress={() => handleSave(true)} disabled={isLoading} activeOpacity={0.82}>
            {syncing ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnSyncIcon}>✅</Text>}
            <Text style={styles.btnSyncText}>Abgeschlossen & Sync</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    backgroundColor: '#1a4a2e',
    paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 1 },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingBottom: 20 },

  // Sections
  section: {
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)',
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5 },

  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.45)', marginBottom: 7, textTransform: 'uppercase', letterSpacing: 0.6 },
  req: { color: '#ff6b6b' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#fff',
  },
  inputMulti: { minHeight: 80, paddingTop: 12 },

  // Chips
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipActive: { backgroundColor: '#C8A84B', borderColor: '#C8A84B' },
  chipText: { fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  chipTextActive: { color: '#1a3a20', fontWeight: '700' },

  // Buttons
  actions: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  btnSave: {
    backgroundColor: '#C8A84B', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#C8A84B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  btnSaveIcon: { fontSize: 20 },
  btnSaveText: { fontSize: 16, fontWeight: '800', color: '#1a3a20' },
  btnSync: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  btnSyncIcon: { fontSize: 20 },
  btnSyncText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  btnDisabled: { opacity: 0.55 },
});

export default KontrolleFormScreen;
