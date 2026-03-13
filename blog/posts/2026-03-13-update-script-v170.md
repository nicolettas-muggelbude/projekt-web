---
title: "Automatisiertes Linux-Update-Script v1.7.0 - Hooks & Automation"
date: 2026-03-13
author: Nicoletta
tags: [release, linux, automation, update-script, hooks]
excerpt: "v1.7.0 bringt ein vollständiges Hooks-System: Eigene Skripte vor und nach dem Update ausführen – automatisch, konfigurierbar."
---

# Linux-Update-Script v1.7.0: Hooks & Automation

**Großes Feature-Release!** 🎉 Mit v1.7.0 erhält das automatisierte
Linux-Update-Script ein lang gewünschtes Feature: ein vollständiges
**Hooks-System**. Eigene Skripte lassen sich jetzt automatisch
vor und nach dem Update-Prozess ausführen – vollständig konfigurierbar
und ohne Eingriff in das Haupt-Script.


## 🪝 Was sind Hooks?

Hooks sind Skripte, die das Update-Script zu definierten Zeitpunkten
**automatisch aufruft** – ähnlich wie Git-Hooks. Du schreibst ein
Bash-Skript, legst es an die richtige Stelle, und das Update-Script
kümmert sich um den Rest.


**Typische Anwendungsfälle:**

- 📸 Snapshot / Backup erstellen **bevor** Updates eingespielt werden
- 🔔 Benachrichtigung an Telegram / Gotify / Matrix senden
- 🧹 Cache leeren oder Services stoppen **vor** dem Update
- ✅ Services neu starten **nach** dem Update
- 📊 Update-Ergebnis in ein Monitoring-System schreiben


## 🛡️ Sicherheit

Das Hook-System ist **bewusst restriktiv** designed:

- ✅ Hooks müssen **ausführbar** sein (`chmod +x`)
- ✅ Hooks laufen mit **denselben Rechten** wie das Update-Script
- ✅ Fehler im Hook **brechen den Update-Prozess nicht** ab (konfigurierbar)
- ✅ Timeout verhindert hängende Hooks


## 🆙 Upgrade-Anleitung

```bash
cd ~/linux-update-script
git pull origin main
sudo ./install.sh
```

`install.sh` erstellt automatisch das Hooks-Verzeichnis und
legt Beispiel-Hooks an. Deine bestehende Config bleibt unberührt.


## 🎯 Fazit

v1.7.0 macht das Update-Script zur echten Automatisierungs-Plattform:

✅ **Flexibel** – eigene Logik ohne Script-Anpassung
✅ **Sicher** – Timeouts, Fehlerbehandlung, Berechtigungsprüfung
✅ **Konsistent** – gleiches Config-Modell wie v1.6.1

**Probiert es aus!** Welche Hooks baut ihr euch? 💬

---

## 🔗 Links

- [Vollständiges Changelog](https://muggelbude.it/projects/update-script.html#changelog)
- [Dokumentation](https://muggelbude.it/projects/update-script.html#readme)
- [GitHub Repository](https://github.com/nicolettas-muggelbude/Automatisiertes-Update-Script-fuer-Linux)

---

**Viel Spaß mit v1.7.0!** 🚀
