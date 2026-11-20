# RNPG Kontrolle

React Native App für die digitale Fischereikontrolle der Pachtgemeinschaft Kurpfalz e.V.

## Features

- **Kontrolle starten** — Formular mit allen Feldern des offiziellen Fischereiprotokolls
- **Kontrollhistorie** — Alle Kontrollen übersichtlich auf der Startseite
- **GitHub Sync** — Automatisches Zurückschreiben in die Excel-Vorlage auf GitHub
- **Neue Dateien** — Automatisch neue Excel-Datei wenn Zeilen 12–20 voll sind
- **Export** — Lokaler Excel-Export zum Teilen

## Felder (gemäß Protokoll Fischereiaufsicht)

| Feld | Beschreibung |
|------|-------------|
| Datum | Kontrolldatum |
| Strecke | Kontrollierte Strecke |
| Genauer Streckenabschnitt | Exakter Abschnitt |
| Kontrollierte Angler | Anzahl |
| Art des Verstoßes | Beschreibung Verstoß |
| Wetter | Wetterbedingungen |
| Aussehen Ufer — Vermüllt | Ja/Nein/Leicht |
| Aussehen Ufer — Sonstiges | Weitere Beobachtungen |
| Besonderheiten Gewässer | Auffälligkeiten |
| Bemerkungen | Weitere Bemerkungen |

## Setup

```bash
npm install
npm run android   # Android
npm run ios       # iOS (macOS erforderlich)
npm run web       # Browser
```

## GitHub Sync konfigurieren

1. GitHub Personal Access Token erstellen (scope: `repo`)
2. In der App: Einstellungen → GitHub Token eingeben
3. Verbindung testen
4. Bei "Abgeschlossen & Sync" wird die Kontrolle direkt in `Protokoll_Fischereiaufsicht_001.xlsx` etc. geschrieben

## Excel-Logik

- Template: `Protokoll_Fischereiaufsicht.xlsx` (Zeilen 12–20 = 9 Einträge)
- Volle Datei → neue Datei `Protokoll_Fischereiaufsicht_002.xlsx` etc.
- Keine zusätzlichen Zeilen werden hinzugefügt

---
*Pachtgemeinschaft Kurpfalz e.V. — Märkischer Straße 59, 68229 Mannheim*
