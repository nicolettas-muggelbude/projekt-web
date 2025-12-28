---
title: "Automatische GitHub-Integration einrichten"
date: 2025-01-15
author: Nicole
tags: [tutorial, github, automation]
excerpt: "Wie ich meine Portfolio-Website automatisch mit GitHub-Daten synchronisiere, ohne Backend oder Datenbank."
---

# Automatische GitHub-Integration

Eine der coolsten Features meiner Portfolio-Website ist die automatische Integration mit GitHub. Keine manuellen Updates mehr - alles kommt direkt von der Quelle!

## Das Problem

Traditionelle Portfolio-Websites haben ein Problem:
- Man muss **manuell** Projekt-Informationen pflegen
- README-Änderungen müssen **doppelt** gemacht werden
- Release-Notes müssen **kopiert** werden
- **Inkonsistenzen** sind vorprogrammiert

## Die Lösung: GitHub API

Die [GitHub REST API](https://docs.github.com/en/rest) bietet alles was wir brauchen:

```javascript
// Repository-Informationen
GET /repos/{owner}/{repo}

// Neuestes Release
GET /repos/{owner}/{repo}/releases/latest

// README-Inhalt
GET /repos/{owner}/{repo}/readme

// Datei-Inhalte (CHANGELOG, ROADMAP)
GET /repos/{owner}/{repo}/contents/{path}
```

## Implementierung

### 1. API-Wrapper erstellen

```javascript
const GITHUB_API = 'https://api.github.com';

async function getRepositoryInfo(repo) {
    const response = await fetch(`${GITHUB_API}/repos/${repo}`);
    return await response.json();
}

async function getLatestRelease(repo) {
    const response = await fetch(`${GITHUB_API}/repos/${repo}/releases/latest`);
    return await response.json();
}
```

### 2. Daten anzeigen

```javascript
const info = await getRepositoryInfo('username/project');
console.log(`Stars: ${info.stargazers_count}`);
console.log(`Forks: ${info.forks_count}`);

const release = await getLatestRelease('username/project');
console.log(`Version: ${release.tag_name}`);
```

### 3. Markdown rendern

GitHub liefert README und Release-Notes in Markdown. Mit einem einfachen Parser wird daraus HTML:

```javascript
import { markdownToHtml } from './markdown-parser.js';

const readme = await getReadme('username/project');
const html = markdownToHtml(readme);
document.getElementById('readme').innerHTML = html;
```

## Rate Limits beachten

GitHub begrenzt API-Anfragen:
- **60 Requests/Stunde** ohne Authentifizierung
- **5.000 Requests/Stunde** mit Token

### Lösung: Caching

```javascript
class GitHubAPI {
    constructor() {
        this.cache = new Map();
    }

    async fetch(url) {
        // Prüfe Cache
        const cached = this.cache.get(url);
        if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
            return cached.data;
        }

        // Lade von API
        const response = await fetch(url);
        const data = await response.json();

        // Speichere im Cache
        this.cache.set(url, { data, timestamp: Date.now() });

        return data;
    }
}
```

## GitHub Actions für Build

Für noch bessere Performance: Build-Script, das regelmäßig läuft und Daten als JSON speichert:

```yaml
name: Update Content
on:
  schedule:
    - cron: '0 */6 * * *'  # Alle 6 Stunden

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: node build/build.js
      - name: Commit
        run: |
          git add data/cache
          git commit -m "Update cache"
          git push
```

## Vorteile

✅ **Single Source of Truth** - GitHub ist die Quelle
✅ **Immer aktuell** - Änderungen erscheinen automatisch
✅ **Kein Backend nötig** - Rein statische Website
✅ **Einfach zu hosten** - GitHub Pages, Netlify, etc.

## Fazit

Die GitHub API macht es super einfach, Portfolio-Websites automatisch aktuell zu halten. Kein manuelles Copy-Paste mehr!

Den kompletten Code findet ihr in meinem [Portfolio-Repository](https://github.com/nicolettas-muggelbude/projekt-web).

**Happy Coding!**
Nicole
