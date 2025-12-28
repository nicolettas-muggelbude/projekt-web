# Projekt-Web Portfolio

Meine persönliche Portfolio-Website mit automatischer GitHub-Integration.

## Features

- **Automatische Projekt-Integration** - Alle Infos kommen direkt von GitHub
- **Blog-System** - Markdown-basierte Blog-Posts
- **Dark/Light Mode** - Automatische Theme-Erkennung + manueller Toggle
- **Responsive Design** - Funktioniert auf allen Geräten
- **Keine Datenbank** - Rein statisch, einfach zu hosten

## Quick Start

### 1. Repository klonen

```bash
git clone https://github.com/nicolettas-muggelbude/projekt-web.git
cd projekt-web
```

### 2. Projekte konfigurieren

Bearbeite `data/projects.json`:

```json
{
  "projects": [
    {
      "id": "mein-projekt",
      "repo": "nicolettas-muggelbude/mein-projekt",
      "name": "Mein Projekt",
      "description": "Beschreibung",
      "featured": true
    }
  ]
}
```

### 3. Lokal testen

Einfach mit einem lokalen Webserver öffnen:

```bash
# Mit Python
python -m http.server 8000

# Mit Node.js
npx serve

# Mit PHP
php -S localhost:8000
```

Dann Browser öffnen: `http://localhost:8000`

### 4. Blog-Post schreiben

Erstelle eine neue Datei in `blog/posts/`:

```markdown
---
title: "Mein erster Post"
date: 2025-01-28
author: Nicole
tags: [web, tutorial]
excerpt: "Eine kurze Zusammenfassung"
---

# Überschrift

Dein Content hier...
```

### 5. Build ausführen (optional)

Für gecachte GitHub-Daten und generierte Projektseiten:

```bash
# Dependencies installieren
npm install marked js-yaml

# Build ausführen
node build/build.js
```

## Deployment

### GitHub Pages (empfohlen)

1. Repository → Settings → Pages
2. Source: `main` branch, `/` (root)
3. Fertig! URL: `https://nicolettas-muggelbude.github.io/projekt-web/`

### Custom Domain

1. DNS CNAME: `www.deine-domain.de` → `nicolettas-muggelbude.github.io`
2. GitHub Settings → Custom Domain eintragen
3. "Enforce HTTPS" aktivieren

### Andere Hosting-Optionen

- **Netlify**: Repository verbinden, automatisches Deployment
- **Vercel**: Gleich wie Netlify
- **Eigener Server**: Einfach Dateien kopieren

## Struktur

```
projekt-web/
├── index.html              # Hauptseite
├── css/                    # Styles
├── js/                     # JavaScript-Module
├── blog/                   # Blog-Posts (Markdown)
├── data/
│   ├── projects.json       # Projekt-Konfiguration
│   └── cache/              # Gecachte GitHub-Daten
├── projects/               # Generierte Projektseiten
└── .github/workflows/      # GitHub Actions
```

## Workflow

1. **Neues Projekt**: Eintrag in `data/projects.json` + Push
2. **Blog-Post**: Neue `.md` in `blog/posts/` + Push
3. **GitHub Action**: Läuft automatisch, cached Daten
4. **Website**: Aktualisiert sich automatisch

## Konfiguration

### GitHub Token (optional)

Für höhere API-Limits:

1. GitHub → Settings → Developer Settings → Personal Access Tokens
2. Token mit `public_repo` Berechtigung erstellen
3. Als Repository Secret `GITHUB_TOKEN` hinzufügen

### Content-Typen

Jede Projektseite zeigt automatisch:
- Release Notes (neueste Version)
- README (mit Screenshots)
- Changelog (aus `CHANGELOG.md`)
- Roadmap (aus `ROADMAP.md`)
- Links zu Issues, Discussions, Pull Requests

## Anpassung

### Farben ändern

Bearbeite CSS-Variablen in `css/main.css`:

```css
:root {
    --accent: #0066cc;        /* Primärfarbe */
    --bg-primary: #ffffff;    /* Hintergrund */
    --text-primary: #1a1a1a;  /* Textfarbe */
}
```

### Layout anpassen

- `css/main.css` - Hauptseite
- `css/project.css` - Projektseiten
- `project-template.html` - Projektseiten-Template

## Browser-Kompatibilität

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Benötigt CSS Custom Properties und ES6 Modules.

## Lizenz

MIT - Du kannst dieses Projekt frei verwenden und anpassen.

## Support

Bei Fragen oder Problemen:
- [Issues](https://github.com/nicolettas-muggelbude/projekt-web/issues)
- [Discussions](https://github.com/nicolettas-muggelbude/projekt-web/discussions)

## Credits

Entwickelt von Nicole | [GitHub](https://github.com/nicolettas-muggelbude)
