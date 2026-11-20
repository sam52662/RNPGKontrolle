import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { getGithubToken, setGithubToken, getExistingFiles } from '../services/githubSync';
import { getAllKontrollen } from '../services/storage';
import { exportToLocalXlsx } from '../services/githubSync';
import { colors } from '../theme/colors';

const SettingsScreen = ({ navigation }) => {
  const [token, setToken] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [tokenSaved, setTokenSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    const t = await getGithubToken();
    if (t) {
      setToken(t);
      setTokenInput(t.slice(0, 8) + '•'.repeat(Math.max(0, t.length - 8)));
      setTokenSaved(true);
    }
  };

  const handleSaveToken = async () => {
    const trimmed = tokenInput.trim();
    if (!trimmed || trimmed.includes('•')) {
      Alert.alert('Token eingeben', 'Bitte geben Sie einen neuen GitHub Token ein.');
      return;
    }
    await setGithubToken(trimmed);
    setToken(trimmed);
    setTokenSaved(true);
    setTokenInput(trimmed.slice(0, 8) + '•'.repeat(Math.max(0, trimmed.length - 8)));
    Alert.alert('✅ Token gespeichert');
  };

  const handleTestConnection = async () => {
    const t = await getGithubToken();
    if (!t) { Alert.alert('Kein Token', 'Bitte zuerst Token speichern.'); return; }
    setTesting(true);
    setTestResult(null);
    try {
      const result = await getExistingFiles(t);
      setFiles(result);
      setTestResult({ success: true, message: `Verbindung OK — ${result.length} Datei(en) gefunden` });
    } catch (e) {
      setTestResult({ success: false, message: e.message || 'Verbindung fehlgeschlagen' });
    }
    setTesting(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const kontrollen = await getAllKontrollen();
      if (kontrollen.length === 0) {
        Alert.alert('Keine Daten', 'Es gibt noch keine Kontrollen zum Exportieren.');
        setExporting(false);
        return;
      }
      await exportToLocalXlsx(kontrollen);
    } catch (e) {
      Alert.alert('Export Fehler', e.message || 'Export fehlgeschlagen.');
    }
    setExporting(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Einstellungen</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* GitHub Token */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔑 GitHub Konfiguration</Text>
          <Text style={styles.sectionDesc}>
            Erstellen Sie einen Personal Access Token auf GitHub (Settings → Developer Settings → Personal Access Tokens) mit dem Scope "repo".
          </Text>

          <Text style={styles.label}>GitHub Token</Text>
          <TextInput
            style={styles.input}
            value={tokenInput}
            onChangeText={(v) => { setTokenInput(v); setTokenSaved(false); }}
            placeholder="ghp_xxxxxxxxxxxx"
            placeholderTextColor={colors.textLight}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={false}
          />

          <TouchableOpacity style={styles.button} onPress={handleSaveToken}>
            <Text style={styles.buttonIcon}>💾</Text>
            <Text style={styles.buttonText}>Token speichern</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buttonOutline, testing && styles.buttonDisabled]}
            onPress={handleTestConnection}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.buttonIcon}>🔗</Text>
            )}
            <Text style={styles.buttonOutlineText}>Verbindung testen</Text>
          </TouchableOpacity>

          {testResult && (
            <View style={[styles.resultBox, { borderColor: testResult.success ? colors.success : colors.error }]}>
              <Text style={[styles.resultText, { color: testResult.success ? colors.success : colors.error }]}>
                {testResult.success ? '✅' : '❌'} {testResult.message}
              </Text>
            </View>
          )}

          {files.length > 0 && (
            <View style={styles.fileList}>
              <Text style={styles.fileListTitle}>📁 Dateien im Repository:</Text>
              {files.map((f) => (
                <Text key={f.name} style={styles.fileName}>• {f.name}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Repository Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Repository Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Repository</Text>
            <Text style={styles.infoValue}>sam52662/RNPGKontrolle</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Branch</Text>
            <Text style={styles.infoValue}>main</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Template</Text>
            <Text style={styles.infoValue}>Protokoll_Fischereiaufsicht.xlsx</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Zeilen pro Datei</Text>
            <Text style={styles.infoValue}>9 (Zeilen 12–20)</Text>
          </View>
        </View>

        {/* Export */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📤 Export</Text>
          <Text style={styles.sectionDesc}>
            Alle lokalen Kontrollen als Excel-Datei exportieren und teilen.
          </Text>
          <TouchableOpacity
            style={[styles.button, exporting && styles.buttonDisabled]}
            onPress={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator size="small" color={colors.primaryDark} />
            ) : (
              <Text style={styles.buttonIcon}>📊</Text>
            )}
            <Text style={styles.buttonText}>Excel exportieren & teilen</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🐟 Über die App</Text>
          <Text style={styles.aboutText}>
            RNPG Kontrolle — Fischereikontrolle App{'\n'}
            Pachtgemeinschaft Kurpfalz e.V.{'\n\n'}
            Die App ermöglicht die digitale Erfassung von Fischereikontrollen gemäß dem offiziellen Protokoll der Fischereiaufsicht und synchronisiert die Daten automatisch mit GitHub.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  scroll: { flex: 1 },
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
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  buttonText: { fontSize: 15, fontWeight: 'bold', color: colors.primaryDark },
  buttonIcon: { fontSize: 16 },
  buttonOutline: {
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 10,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  buttonOutlineText: { fontSize: 15, fontWeight: 'bold', color: colors.primary },
  buttonDisabled: { opacity: 0.6 },
  resultBox: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  resultText: { fontSize: 14, fontWeight: '500' },
  fileList: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
  },
  fileListTitle: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 8 },
  fileName: { fontSize: 13, color: colors.text, marginBottom: 4 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: { fontSize: 13, color: colors.textLight, fontWeight: '500' },
  infoValue: { fontSize: 13, color: colors.text, fontWeight: '600', flex: 1, textAlign: 'right' },
  aboutText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default SettingsScreen;
