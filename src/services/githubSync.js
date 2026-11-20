import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// GitHub configuration - set these in the app settings
const GITHUB_REPO = 'sam52662/RNPGKontrolle';
const GITHUB_BRANCH = 'main';
const TEMPLATE_FILENAME = 'Protokoll_Fischereiaufsicht.xlsx';
// Data rows in template: rows 12-20 (0-indexed: 11-19), that's 9 rows
const DATA_ROW_START = 11; // 0-indexed row 12
const DATA_ROW_END = 19;   // 0-indexed row 20
const MAX_ROWS_PER_FILE = 9;

// Column mapping (0-indexed): A=0, B=1, ..., L=11
const COL_DATUM = 0;           // A
const COL_STRECKE = 1;         // B
const COL_ABSCHNITT = 2;       // C
const COL_ANGLER = 3;          // D
const COL_VERSTOSS = 4;        // E
const COL_WETTER = 5;          // F
const COL_UFER_VERMULLT = 6;   // G
const COL_UFER_SONSTIGES = 7;  // H
const COL_BESONDERHEITEN = 8;  // I (merged I+J)
const COL_BEMERKUNGEN = 10;    // K (merged K+L)

export const getGithubToken = async () => {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  return await AsyncStorage.getItem('github_token');
};

export const setGithubToken = async (token) => {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  await AsyncStorage.setItem('github_token', token);
};

const githubApiRequest = async (path, method = 'GET', body = null, token) => {
  const headers = {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };
  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API error: ${response.status}`);
  }
  return response.json();
};

const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export const getExistingFiles = async (token) => {
  try {
    const contents = await githubApiRequest('', 'GET', null, token);
    return contents
      .filter(f => f.name.endsWith('.xlsx'))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch (e) {
    return [];
  }
};

const downloadFileFromGithub = async (fileInfo, token) => {
  const response = await fetch(fileInfo.download_url, {
    headers: { 'Authorization': `token ${token}` },
  });
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

const getTemplateFromGithub = async (token) => {
  try {
    const fileInfo = await githubApiRequest(TEMPLATE_FILENAME, 'GET', null, token);
    const data = await downloadFileFromGithub(fileInfo, token);
    return { data, sha: fileInfo.sha };
  } catch (e) {
    return null;
  }
};

const countUsedRows = (wb) => {
  const ws = wb.Sheets[wb.SheetNames[0]];
  let count = 0;
  for (let row = DATA_ROW_START; row <= DATA_ROW_END; row++) {
    const cellAddr = XLSX.utils.encode_cell({ r: row, c: COL_DATUM });
    if (ws[cellAddr] && ws[cellAddr].v) count++;
  }
  return count;
};

const writeKontrolleToWorksheet = (ws, rowIndex, kontrolle) => {
  const setValue = (col, value) => {
    const addr = XLSX.utils.encode_cell({ r: rowIndex, c: col });
    ws[addr] = { v: value, t: typeof value === 'number' ? 'n' : 's' };
    if (!ws['!ref']) ws['!ref'] = addr;
    else {
      const ref = XLSX.utils.decode_range(ws['!ref']);
      const cell = XLSX.utils.decode_cell(addr);
      ref.e.r = Math.max(ref.e.r, cell.r);
      ref.e.c = Math.max(ref.e.c, cell.c);
      ws['!ref'] = XLSX.utils.encode_range(ref);
    }
  };
  setValue(COL_DATUM, kontrolle.datum || '');
  setValue(COL_STRECKE, kontrolle.strecke || '');
  setValue(COL_ABSCHNITT, kontrolle.streckenabschnitt || '');
  setValue(COL_ANGLER, kontrolle.kontrollierteAngler || '');
  setValue(COL_VERSTOSS, kontrolle.artDesVerstosses || '');
  setValue(COL_WETTER, kontrolle.wetter || '');
  setValue(COL_UFER_VERMULLT, kontrolle.uferVermullt || '');
  setValue(COL_UFER_SONSTIGES, kontrolle.uferSonstiges || '');
  setValue(COL_BESONDERHEITEN, kontrolle.besonderheitenGewaesser || '');
  setValue(COL_BEMERKUNGEN, kontrolle.bemerkungen || '');
};

const generateFileName = (index) => {
  const pad = String(index).padStart(3, '0');
  return `Protokoll_Fischereiaufsicht_${pad}.xlsx`;
};

export const syncKontrolleToGithub = async (kontrolle, token) => {
  if (!token) throw new Error('Kein GitHub Token konfiguriert');

  // Get all existing xlsx files
  const existingFiles = await getExistingFiles(token);

  // Find the template or most recent file
  let targetFileName;
  let targetFileSha;
  let targetRowIndex;
  let workbookData;

  const templateInfo = await githubApiRequest(TEMPLATE_FILENAME, 'GET', null, token).catch(() => null);

  if (existingFiles.length === 0 || !templateInfo) {
    throw new Error('Template-Datei nicht im Repository gefunden');
  }

  // Check numbered files for available rows
  const numberedFiles = existingFiles.filter(f => f.name !== TEMPLATE_FILENAME);

  let foundSlot = false;
  for (const fileInfo of numberedFiles.reverse()) {
    const data = await downloadFileFromGithub(fileInfo, token);
    const wb = XLSX.read(data, { type: 'array' });
    const usedRows = countUsedRows(wb);
    if (usedRows < MAX_ROWS_PER_FILE) {
      targetFileName = fileInfo.name;
      targetFileSha = fileInfo.sha;
      targetRowIndex = DATA_ROW_START + usedRows;
      workbookData = { wb, data };
      foundSlot = true;
      break;
    }
  }

  if (!foundSlot) {
    // Create new file from template
    const templateData = await downloadFileFromGithub(templateInfo, token);
    const wb = XLSX.read(templateData, { type: 'array' });
    targetRowIndex = DATA_ROW_START;
    targetFileName = generateFileName(numberedFiles.length + 1);
    targetFileSha = null;
    workbookData = { wb };
  }

  // Write kontrolle to workbook
  const ws = workbookData.wb.Sheets[workbookData.wb.SheetNames[0]];
  writeKontrolleToWorksheet(ws, targetRowIndex, kontrolle);

  // Export to base64
  const wbArray = XLSX.write(workbookData.wb, { bookType: 'xlsx', type: 'array' });
  const base64Content = arrayBufferToBase64(wbArray.buffer);

  // Push to GitHub
  const commitBody = {
    message: `Kontrolle hinzugefügt: ${kontrolle.datum || new Date().toLocaleDateString('de-DE')} - ${kontrolle.strecke || 'unbekannte Strecke'}`,
    content: base64Content,
    branch: GITHUB_BRANCH,
  };
  if (targetFileSha) commitBody.sha = targetFileSha;

  await githubApiRequest(targetFileName, 'PUT', commitBody, token);
  return { fileName: targetFileName, rowIndex: targetRowIndex - DATA_ROW_START + 1 };
};

export const exportToLocalXlsx = async (kontrollen) => {
  const templateInfo = await XLSX.utils.aoa_to_sheet([
    ['Protokoll Fischereiaufsicht'],
    [],
    ['Datum', 'Strecke', 'Streckenabschnitt', 'Kontrollierte Angler', 'Art des Verstoßes',
     'Wetter', 'Ufer Vermüllt', 'Ufer Sonstiges', 'Besonderheiten Gewässer', 'Bemerkungen'],
    ...kontrollen.map(k => [
      k.datum, k.strecke, k.streckenabschnitt, k.kontrollierteAngler,
      k.artDesVerstosses, k.wetter, k.uferVermullt, k.uferSonstiges,
      k.besonderheitenGewaesser, k.bemerkungen,
    ]),
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, templateInfo, 'Protokoll Fischereiaufsicht');
  const wbArray = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const base64 = arrayBufferToBase64(wbArray.buffer);
  const fileUri = FileSystem.documentDirectory + 'export_fischereiprotokoll.xlsx';
  await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    dialogTitle: 'Protokoll exportieren',
  });
};
