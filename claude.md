# Projekt-Web - Dokumentation

## Projektübersicht
Statische Website für Projekt-Portfolio mit automatischer GitHub-Integration.

## Technologie-Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Styling**: CSS Custom Properties für Dark/Light Mode
- **Content**: Markdown für Blog-Posts
- **API**: GitHub REST API v3
- **Build**: Node.js Script
- **CI/CD**: GitHub Actions
- **Hosting**: GitHub Pages (später Custom Domain möglich)

## Ordnerstruktur

```
projekt-web/
├── index.html                 # Hauptseite (Projektübersicht + Blog)
├── project-template.html      # Template für Projektseiten
├── css/
│   ├── main.css              # Haupt-Styling + Theme-System
│   └── project.css           # Projekt-spezifisches Styling
├── js/
│   ├── theme.js              # Dark/Light Mode Management
│   ├── github-api.js         # GitHub API Wrapper
│   ├── markdown-parser.js    # Markdown zu HTML Konverter
│   ├── projects.js           # Projekt-Listen-Rendering
│   ├── blog.js               # Blog-System
│   └── project-page.js       # Projektseiten-Logik
├── blog/
│   └── posts/                # Markdown Blog-Posts
├── data/
│   ├── projects.json         # Projekt-Konfiguration
│   └── cache/                # Gecachte GitHub-Daten
├── projects/                  # Generierte Projektseiten
├── .github/workflows/
│   └── update-content.yml    # Auto-Update Action
└── build/
    └── build.js              # Build-Script
```

## Features

### ✅ Implementiert
- Automatische GitHub-Integration (Releases, README, Changelog)
- Dark/Light Mode mit System-Präferenz-Erkennung
- Markdown-basiertes Blog-System
- Responsive Design
- Template-basierte Projektseiten
- GitHub Actions für automatische Updates

### 🎯 Content auf Projektseiten
- Release Notes (neueste Version prominent)
- README mit automatischer Screenshot-Extraktion
- Changelog (aus CHANGELOG.md)
- Roadmap (aus ROADMAP.md oder Issues)
- Links zu Issues und Discussions
- Repository-Statistiken (Stars, Forks)

## Konfiguration

### Projekt hinzufügen
Eintrag in `data/projects.json`:
```json
{
  "id": "projekt-slug",
  "repo": "nicolettas-muggelbude/repo-name",
  "name": "Projekt-Name",
  "description": "Kurzbeschreibung",
  "featured": true
}
```

### Blog-Post erstellen
Neue Datei in `blog/posts/YYYY-MM-DD-titel.md`:
```markdown
---
title: "Post-Titel"
date: 2025-01-15
author: Nicole
tags: [tag1, tag2]
excerpt: "Kurzbeschreibung"
---

# Inhalt hier
```

## GitHub API Rate-Limits

- **Ohne Token**: 60 Requests/Stunde
- **Mit Token**: 5.000 Requests/Stunde
- **Lösung**: Caching via GitHub Action (nur bei Änderungen neu laden)

## Deployment

### GitHub Pages
1. Repository → Settings → Pages
2. Source: `main` branch, `/` root
3. URL: `https://nicolettas-muggelbude.github.io/projekt-web/`

### Custom Domain (später)
1. DNS CNAME: `www.deine-domain.de` → `nicolettas-muggelbude.github.io`
2. GitHub Settings → Custom Domain eintragen
3. HTTPS erzwingen

### Eigener Server
```bash
git clone https://github.com/nicolettas-muggelbude/projekt-web
# → In Webserver-Root kopieren
```

## Workflow

1. **Neues Projekt**: Eintrag in `data/projects.json` + Push
2. **Blog-Post**: Neue `.md` in `blog/posts/` + Push
3. **GitHub Action**: Läuft automatisch, cached GitHub-Daten
4. **Website**: Aktualisiert sich automatisch

## Wartung

- **Blog**: Einfach neue Markdown-Dateien erstellen
- **Projekte**: Nur `data/projects.json` pflegen
- **Content**: Kommt automatisch von GitHub
- **Kein manuelles Update nötig** (außer Blog)

## Browser-Kompatibilität

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- CSS Custom Properties erforderlich
- ES6 Modules erforderlich

## Lizenz

Noch nicht definiert - nach Bedarf hinzufügen.

## Changelog

### 2025-12-30 - Link-Handling & Code-Block-Fixes
- **Comprehensive Link-Handling**: Alle Repository-Datei-Links (claude.md, fragen.md, etc.) verlinken jetzt zu GitHub
- **Page Anchors**: ROADMAP.md und CHANGELOG.md verlinken zu Seiten-Ankerpunkten (#roadmap, #changelog)
- **External Links**: Alle externen Links öffnen in neuem Tab mit `target="_blank"`
- **Lightbox Navigation**: Verbesserte Sichtbarkeit der Prev/Next-Buttons mit dunkleren Hintergründen
- **CONTRIBUTING.md Links**: Korrekte Verlinkung zu GitHub
- **Changelog/Roadmap Version-Links**: Version-Tags (v0.2.0-beta, etc.) verlinken zu GitHub Releases statt 404
- **Cache-First Loading für Changelog/Roadmap**: Build-Script cached jetzt auch CHANGELOG.md und ROADMAP.md als HTML
  - Keine API Rate-Limit-Probleme beim lokalen Testen
  - Schnellere Ladezeiten
  - Konsistent mit README-Caching-Strategie

### 2025-12-29 - UTF-8 & Markdown-Parser Upgrade
- **UTF-8 Encoding Fix**: Korrekte Dekodierung von Base64-Inhalten (✓ statt â)
- **marked.js Integration**: Professioneller Markdown-Parser via CDN statt Simple-Parser
- **TextDecoder**: Implementierung für korrekte UTF-8-Dekodierung in `github-api.js`
- **README Language Variants**: Links zu README.en.md, README.de.md führen zu GitHub

### 2025-12-28 - Cache & Styling-Verbesserungen
- **Cache-First Loading**: Repository-Info, Releases und README aus Cache laden
- **data-project-id**: Fixer Projekt-ID-Identifier statt Extraktion aus Repo-Namen
- **Code-Block CSS-Fixes**:
  - `color: var(--text-primary)` für korrekte Textfarbe (statt lila)
  - Konsistente Border-Farbe `rgba(240, 246, 252, 0.15)` für bessere Sichtbarkeit
  - Release-Banner Background auf `var(--bg-card)` (statt `--bg-secondary`)
  - `.release-notes` bekommt alle `.release-body` Styles
- **Build-Script**: PROJECT_ID Platzhalter-Ersetzung
- **Template Updates**: Alle Projektseiten mit neuen Features regeneriert

### 2025-01-28 - Initial Setup
- Grundstruktur erstellt
- Dark/Light Mode implementiert
- GitHub API Integration
- Blog-System
- Projekt-Template
