---
title: "apt-get vs. apt - Welches Kommando für Scripts?"
date: 2025-12-30
author: Nicoletta
tags: [linux, debian, ubuntu, best-practices]
excerpt: "Eine häufige Frage: Ist apt-get veraltet? Warum nutzen wir es im Update-Script statt apt?"
---

# apt-get vs. apt - Welches Kommando für Scripts?

Eine interessante Frage aus der [Community-Diskussion](https://github.com/nicolettas-muggelbude/Automatisiertes-Update-Script-fuer-Linux/discussions/2):

## Die Frage

**mrtoadie** fragte am 9. November 2025:

> "Soweit ich weiß ist `apt-get` veraltet und wurde durch `apt` ersetzt. Kann das ein Ubuntu / Debian Versteher bestätigen?"

## Meine Antwort

**Nein, apt-get ist NICHT veraltet!** Hier die wichtigen Unterschiede:

### apt-get - Für Scripts & Automation

- **Stabile API**: Garantiert backwards-kompatibel
- **Vorhersehbares Verhalten**: Perfekt für Scripts
- **Keine Überraschungen**: Output-Format ändert sich nicht
- **Offiziell empfohlen**: "For scripting, apt-get should be preferred"

**Verwendung:**
```bash
# In Scripts (wie unserem Update-Script)
apt-get update
apt-get upgrade -y
apt-get dist-upgrade -y
```

### apt - Für interaktive Nutzung

- **Schönere Ausgabe**: Fortschrittsbalken, Farben
- **Benutzerfreundlich**: Bessere Lesbarkeit im Terminal
- **Moderne Features**: Kombiniert apt-get und apt-cache
- **Für Menschen**: Nicht für Scripts gedacht

**Verwendung:**
```bash
# Im Terminal (manuell)
apt update
apt upgrade
apt search package
```

## Warum nutzt das Update-Script apt-get?

Unser [Automatisiertes Update-Script](https://github.com/nicolettas-muggelbude/Automatisiertes-Update-Script-fuer-Linux) ist für **Automation** gedacht:

✅ **Stabile API** - Script funktioniert auch in Jahren noch
✅ **Logging** - Parsebarer Output für Logfiles
✅ **Backwards-Kompatibilität** - Läuft auf alten und neuen Systemen
✅ **Best Practice** - Folgt offiziellen Debian/Ubuntu-Empfehlungen

## Fazit

- **apt-get** für Scripts, Cron-Jobs, Automation → ✓
- **apt** für manuelle Terminal-Nutzung → ✓
- Beide sind aktiv maintained und haben ihre Berechtigung!

## Community-Feedback

**mrtoadie** antwortete:

> "okay, **wow!** Danke für die ausführliche Erklärung. Dann habe ich nichts gesagt und alles ist gut."

Genau solche Fragen zeigen, wie wichtig Community-Austausch ist! 🎯

---

**Quellen:**
- [Debian Wiki: apt vs. apt-get](https://wiki.debian.org/Apt)
- [Ubuntu Manpage: apt](https://manpages.ubuntu.com/manpages/focal/man8/apt.8.html)
- [Original Discussion #2](https://github.com/nicolettas-muggelbude/Automatisiertes-Update-Script-fuer-Linux/discussions/2)

**Hast du auch Fragen zum Update-Script?**
→ [Starte eine Discussion auf GitHub](https://github.com/nicolettas-muggelbude/Automatisiertes-Update-Script-fuer-Linux/discussions)
