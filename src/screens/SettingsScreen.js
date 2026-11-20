import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { getGithubToken, setGithubToken, getExistingFiles } from '../services/githubSync';
import { getAllKontrollen } from '../services/storage';
import { exportToLocalXlsx } from '../services/githubSync';

const SettingsScreen = ({ navigation }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [tokenSaved, setTokenSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => { loadToken(); }, []);

  const loadToken = async () => {
    const t = await getGithubToken();
    if (t) { setTokenInput(t.slice(0, 8) + '•'.repeat(Math.max(0, t.length - 8))); setTokenSaved(true); }
  };

  const handleSaveToken = async () => {
    const trimmed = tokenInput.trim();
    if (!trimmed || trimmed.includes('•')) { Alert.alert('Token eingeben', 'Bitte neuen GitHub Token eingeben.'); return; }
    await setGithubToken(trimmed);
    setTokenSaved(true);
    setTokenInput(trimmed.slice(0, 8) + '•'.repeat(Math.max(0, trimmed.length - 8)));
    Alert.alert('Token gespeichert');
  };

  const handleTest = async () => {
    const t = await getGithubToken();
    if (!t) { Alert.alert('Kein Token', 'Bitte zuerst Token speichern.'); return; }
    setTesting(true); setTestResult(null);
    try {
      const result = await getExistingFiles(t);
      setFiles(result);
      setTestResult({ ok: true, msg: `Verbindung OK — ${result.length} Datei(en) gefunden` });
    } catch (e) {
      setTestResult({ ok: false, msg: e.message || 'Verbindung fehlgeschlagen' });
    }
    setTesting(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const kontrollen = await getAllKontrollen();
      if (!kontrollen.length) { Alert.alert('Keine Daten', 'Noch keine Kontrollen zum Exportieren.'); setExporting(false); return; }
      await exportToLocalXlsx(kontrollen);
    } catch (e) { Alert.alert('Export Fehler', e.message || 'Fehlgeschlagen.'); }
    setExporting(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Einstellungen</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* GitHub Token */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionIcon}>🔑</Text>
            <Text style={styles.sectionTitle}>GitHub Konfiguration</Text>
          </View>
          <Text style={styles.desc}>Personal Access Token mit Scope <Text style={styles.code}>repo</Text> oder Contents read+write (Fine-grained).</Text>
          <Text style={styles.label}>GitHub Token</Text>
          <TextInput
            style={styles.input}
            value={tokenInput}
            onChangeText={v => { setTokenInput(v); setTokenSaved(false); }}
            placeholder="github_pat_... oder ghp_..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            autoCapitalize="none" autoCorrect={false}
          />
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSaveToken}>
              <Text style={styles.btnPrimaryText}>💾 Speichern</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnOutline, testing && styles.btnDisabled]} onPress={handleTest} disabled={testing}>
              {testing ? <ActivityIndicator size="small" color="#C8A84B" /> : <Text style={styles.btnOutlineText}>🔗 Testen</Text>}
            </TouchableOpacity>
          </View>
          {testResult && (
            <View style={[styles.result, testResult.ok ? styles.resultOk : styles.resultErr]}>
              <Text style={[styles.resultText, { color: testResult.ok ? '#4cd97b' : '#ff6b6b' }]}>
                {testResult.ok ? '✅ ' : '❌ '}{testResult.msg}
              </Text>
            </View>
          )}
          {files.length > 0 && (
            <View style={styles.fileList}>
              <Text style={styles.fileListTitle}>Dateien im Repository:</Text>
              {files.map(f => <Text key={f.name} style={styles.fileName}>• {f.name}</Text>)}
            </View>
          )}
        </View>

        {/* Repo Info */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionIcon}>ℹ️</Text>
            <Text style={styles.sectionTitle}>Repository Info</Text>
          </View>
          {[
            ['Repository', 'sam52662/RNPGKontrolle'],
            ['Branch', 'main'],
            ['Template', 'Protokoll_Fischereiaufsicht.xlsx'],
            ['Zeilen pro Datei', '9 (Zeilen 12–20)'],
          ].map(([k, v]) => (
            <View key={k} style={styles.infoRow}>
              <Text style={styles.infoKey}>{k}</Text>
              <Text style={styles.infoVal}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Export */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionIcon}>📤</Text>
            <Text style={styles.sectionTitle}>Export</Text>
          </View>
          <Text style={styles.desc}>Alle lokalen Kontrollen als Excel-Datei exportieren und teilen.</Text>
          <TouchableOpacity style={[styles.btnPrimary, exporting && styles.btnDisabled]} onPress={handleExport} disabled={exporting}>
            {exporting ? <ActivityIndicator size="small" color="#1a3a20" /> : <Text style={styles.btnPrimaryText}>📊 Excel exportieren & teilen</Text>}
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionIcon}>🐟</Text>
            <Text style={styles.sectionTitle}>Über die App</Text>
          </View>
          <Text style={styles.about}>RNPG Kontrolle — Fischereikontrolle App{'\n'}Pachtgemeinschaft Kurpfalz e.V.{'\n\n'}Digitale Erfassung von Fischereikontrollen gemäß offiziellem Protokoll der Fischereiaufsicht mit automatischer GitHub-Synchronisierung.</Text>
        </View>

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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: '#fff', textAlign: 'center' },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  section: {
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.09)', padding: 16,
  },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)' },
  sectionIcon: { fontSize: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.4 },
  desc: { fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 20, marginBottom: 14 },
  code: { color: '#C8A84B', fontFamily: 'monospace' },
  label: { fontSize: 11, fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#fff',
    marginBottom: 12, fontFamily: 'monospace',
  },
  btnRow: { flexDirection: 'row', gap: 10 },
  btnPrimary: {
    flex: 1, backgroundColor: '#C8A84B', borderRadius: 12, padding: 13,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#C8A84B', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 4,
  },
  btnPrimaryText: { fontSize: 14, fontWeight: '800', color: '#1a3a20' },
  btnOutline: {
    flex: 1, borderWidth: 1.5, borderColor: 'rgba(200,168,75,0.4)', borderRadius: 12, padding: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  btnOutlineText: { fontSize: 14, fontWeight: '700', color: '#C8A84B' },
  btnDisabled: { opacity: 0.55 },
  result: { borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 8 },
  resultOk: { backgroundColor: 'rgba(39,174,96,0.08)', borderColor: 'rgba(39,174,96,0.20)' },
  resultErr: { backgroundColor: 'rgba(231,76,60,0.08)', borderColor: 'rgba(231,76,60,0.20)' },
  resultText: { fontSize: 13, fontWeight: '600' },
  fileList: { marginTop: 10, padding: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10 },
  fileListTitle: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  fileName: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  infoKey: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  infoVal: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '600', maxWidth: '55%', textAlign: 'right' },
  about: { fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 22 },
});

export default SettingsScreen;
