---
title: "Automatisiertes Linux-Update-Script v1.6.0 & v1.6.1 - Sicherer, smarter, benutzerfreundlicher"
date: 2026-01-26
author: Nicoletta
tags: [release, linux, automation, update-script]
excerpt: "Zwei neue Major-Releases des Linux-Update-Scripts bringen XDG-Konformität, NVIDIA Secure Boot Support, kritische Bugfixes und ein revolutionäres Hybrid-Config-System. Endlich: AUTO_REBOOT funktioniert!"
---

# Linux-Update-Script v1.6.0 & v1.6.1: Sicherer, smarter, benutzerfreundlicher

**Große Neuigkeiten!** 🎉 Das automatisierte Linux-Update-Script hat gleich **zwei neue Versionen** erhalten: v1.6.0 mit grundlegenden Verbesserungen und v1.6.1 als kritisches Bugfix-Release.

Zusammen bilden diese Releases das **größte Update seit v1.5.0** - mit Fokus auf **Sicherheit**, **Benutzerfreundlichkeit** und **Zuverlässigkeit**.

---

## 🚀 v1.6.0 - XDG-Konformität & NVIDIA Secure Boot

**Release-Datum:** 25. Januar 2026
**Codename:** "Safe & Sound"

Version 1.6.0 bringt fundamentale Verbesserungen für alle Linux-User - besonders für **NVIDIA-Grafikkarten-Besitzer** und alle, die **Standards** lieben.

### Die wichtigsten Features:

#### 1. ✅ XDG-Konformität - Config-Dateien am richtigen Ort

**Endlich!** Die Config-Datei liegt jetzt dort, wo sie nach Linux-Standards hingehört:

```
Neu: ~/.config/linux-update-script/config.conf
Alt: ~/linux-update-script/config.conf (deprecated)
```

**Features:**
- ✅ Automatische Migration beim ersten Start
- ✅ Alte Config wird als `.migrated` gesichert
- ✅ Keine manuelle Aktion nötig

**Warum ist das wichtig?**
XDG Base Directory ist der **Linux-Standard** für User-Configs. Deine `.config/` wird automatisch von Backup-Tools mitgesichert, und alles ist an einem zentralen Ort.

#### 2. 🖥️ NVIDIA-Kernel-Kompatibilitätsprüfung

**Schluss mit dem "schwarzen Bildschirm" nach Kernel-Updates!**

Das Script prüft **vor** jedem Kernel-Update, ob deine NVIDIA-Treiber kompatibel sind.

**Features:**
- ✅ Automatische NVIDIA-Treiber-Erkennung
- ✅ DKMS-Status-Prüfung vor dem Update
- ✅ **Secure Boot Support** mit MOK-Signierung
- ✅ **Kernel-Hold-Mechanismus** (sicherer Default)
- ✅ **Power-User-Modus** für Experten

**Wie funktioniert's?**

Wenn ein neuer Kernel verfügbar ist:
1. Script prüft, ob NVIDIA-Treiber installiert sind
2. Prüft DKMS-Modul-Kompatibilität
3. Bei Secure Boot: Prüft MOK-Signierung
4. Bei Problemen: **Hält Kernel zurück** oder warnt den User

**Für NVIDIA-User ein Game-Changer!**

#### 3. 📧 Benutzerfreundliche Defaults

**"Einfach Enter drücken = alles funktioniert"**

Das Install-Script ist jetzt **noch einfacher**:

- E-Mail-Benachrichtigung: **JA** (Default)
- `mailutils` & `dma` werden automatisch installiert
- Test-Benachrichtigungen direkt nach Installation
- Kein Rätselraten mehr!

---

## 🐛 v1.6.1 - Kritische Bugfixes & Hybrid-Config

**Release-Datum:** 25. Januar 2026
**Codename:** "Actually Working Now"

Kurz nach v1.6.0 folgte ein **kritisches Bugfix-Release**, das drei gravierende Probleme behebt - und ein revolutionäres Config-System einführt.

### Die wichtigsten Fixes:

#### 1. 🔧 AUTO_REBOOT funktioniert jetzt endlich!

**Das Problem:**
- `AUTO_REBOOT=true` in config.conf wurde ignoriert
- System startete nie automatisch neu, trotz Konfiguration
- Log zeigte: `AUTO_REBOOT ist deaktiviert (aktueller Wert: false)`

**Die Ursache:**
- Config-Datei wurde nicht geladen (falsche Pfade bei sudo)
- XDG-Pfad `~/.config/` zeigte bei sudo auf `/root/.config/` statt `/home/user/.config/`
- Cron-Jobs hatten keine `$SUDO_USER` Variable → Config nicht gefunden

**Die Lösung:**
→ **Hybrid-Config-System** (siehe unten)

**Betroffene User:**
Alle, die `AUTO_REBOOT=true` gesetzt hatten oder Cron-Jobs nutzen.

#### 2. 🐧 Linux Mint Upgrade Support

**Das Problem:**
- Linux Mint nutzt `mintupgrade` statt `do-release-upgrade`
- Script versuchte falsche Upgrade-Methode
- Upgrade-Check schlug fehl

**Die Lösung:**

Neuer 4-Schritt-Workflow für Mint:
1. `mintupgrade check` - Prüfung auf neue Version
2. `mintupgrade --dry-run` - Abhängigkeiten prüfen
3. `mintupgrade download` - Pakete herunterladen
4. `mintupgrade upgrade` - Upgrade durchführen

**Betroffene User:**
Alle Linux Mint Benutzer.

#### 3. ✅ Dry-Run für alle Distributionen

**Das Problem:**
- Nur Mint hatte Dry-Run-Checks vor Upgrades
- Andere Distributionen upgradeten ohne Konflikt-Prüfung

**Die Lösung:**

Dry-Run implementiert für:
- **Linux Mint:** `mintupgrade --dry-run`
- **Debian/Ubuntu:** `do-release-upgrade -c -f DistUpgradeViewNonInteractive`
- **Fedora:** `dnf system-upgrade download --assumeno`
- **openSUSE:** `zypper dup --dry-run --no-confirm`
- **Arch/Solus:** N/A (Rolling Release)

**Vorteil:**
Upgrade-Konflikte werden **vor** dem Upgrade erkannt!

---

## 🔀 Das neue Hybrid-Config-System

**Das war das größte Problem von v1.6.0** - und v1.6.1 löst es elegant.

### Das Problem:

**Situation 1: Cron-Jobs**
- Cron läuft als root → keine `$SUDO_USER` Variable
- Config in `~/.config/` nicht erreichbar
- → Script lief mit Defaults, ignorierte Config

**Situation 2: Multi-User**
- Verschiedene User brauchen verschiedene Präferenzen
- Eine globale Config = alle gleich
- → Power-User unzufrieden

**Situation 3: XDG vs. System**
- XDG-Standard (`~/.config/`) vs. System-Config (`/etc/`)
- → Kompromiss nötig

### Die Lösung: Hybrid-Ansatz

```
Priorität 1: System-Config
  → /etc/linux-update-script/config.conf
  → Funktioniert immer (auch Cron)
  → Standard für alle User

Priorität 2: User-Override (optional)
  → ~/.config/linux-update-script/config.conf
  → Nur bei manuellem sudo-Aufruf
  → Überschreibt System-Config

Priorität 3: Legacy-Fallback
  → ./config.conf (Script-Verzeichnis)
  → Deprecated, wird in v2.0.0 entfernt
```

### Verwendung:

**Cron-Job (als root):**
```bash
0 3 * * * /pfad/zu/update.sh
→ Verwendet: /etc/linux-update-script/config.conf
```

**Manueller Aufruf (mit sudo):**
```bash
sudo ./update.sh
→ Verwendet: /etc/... + ~/.config/... Override
```

### Multi-User Beispiel:

**User1 mit persönlichen Präferenzen:**
```bash
sudo ./update.sh
→ /etc/config.conf (AUTO_REBOOT=false)
→ ~/.config/override (AUTO_REBOOT=true)
→ Ergebnis: AUTO_REBOOT=true ✅
```

**User2 ohne Override:**
```bash
sudo ./update.sh
→ /etc/config.conf (AUTO_REBOOT=false)
→ Ergebnis: AUTO_REBOOT=false ✅
```

### Vorteile:

✅ **Cron-sicher** - Funktioniert ohne `$SUDO_USER`
✅ **Multi-User** - Jeder User eigene Präferenzen
✅ **Power-User** - Persönliche Overrides möglich
✅ **Automatisch** - install.sh macht alles
✅ **Abwärtskompatibel** - Legacy-Config als Fallback

**Das ist genial!** 🚀

---

## 📊 Statistik

**Version 1.6.0:**
- Neue XDG-Config-Location
- NVIDIA Secure Boot Support
- Kernel-Hold-Mechanismus
- Bessere Defaults im Installer

**Version 1.6.1:**
- 2 Dateien geändert (update.sh, install.sh)
- +150 / -80 Zeilen Code
- 1 neue Funktion (`load_config()`)
- 19 neue Sprachmeldungen
- ShellCheck: 0 Fehler, 0 Warnungen

**Zusammen:**
- 3 kritische Bugs gefixt
- 1 neues Config-System
- 100% benutzerfreundlicher

---

## 🆙 Upgrade-Anleitung

### Von älteren Versionen:

```bash
cd ~/linux-update-script
git pull origin main

# Config neu erstellen (empfohlen!)
sudo ./install.sh
```

**Wichtig:**
- `install.sh` erstellt automatisch `/etc/linux-update-script/config.conf`
- Deine alte Config wird automatisch migriert
- Optional: User-Override in `~/.config/linux-update-script/config.conf`

### Erste Installation:

```bash
git clone https://github.com/nicolettas-muggelbude/Automatisiertes-Update-Script-fuer-Linux.git
cd Automatisiertes-Update-Script-fuer-Linux
sudo ./install.sh
```

**Fertig!** ✅

---

## 🧪 Testing erwünscht

Bitte testet diese Features und meldet Bugs:

- [ ] Linux Mint Upgrade-Check
- [ ] AUTO_REBOOT mit Kernel-Update
- [ ] Cron-Job Ausführung
- [ ] Multi-User Szenarien
- [ ] NVIDIA Secure Boot Workflow

→ [Issues & Bug Reports](https://github.com/nicolettas-muggelbude/Automatisiertes-Update-Script-fuer-Linux/issues)

---

## 🎯 Fazit

Version 1.6.0 und 1.6.1 sind **Meilenstein-Releases**:

✅ **Sicherer** - NVIDIA Secure Boot, Dry-Run-Checks
✅ **Smarter** - Hybrid-Config-System, XDG-Standard
✅ **Benutzerfreundlicher** - Automatische Migration, bessere Defaults
✅ **Zuverlässiger** - AUTO_REBOOT funktioniert endlich!

**Probiert es aus und gebt Feedback!** 💬

---

## 🔗 Links

- [GitHub Repository](https://github.com/nicolettas-muggelbude/Automatisiertes-Update-Script-fuer-Linux)
- [Vollständiges Changelog](https://github.com/nicolettas-muggelbude/Automatisiertes-Update-Script-fuer-Linux/blob/main/CHANGELOG.md)
- [Dokumentation](https://github.com/nicolettas-muggelbude/Automatisiertes-Update-Script-fuer-Linux/blob/main/README.md)

---

**Viel Erfolg mit v1.6.1!** 🚀

**P.S.:** Wenn ihr Bugs findet, bitte [Issue erstellen](https://github.com/nicolettas-muggelbude/Automatisiertes-Update-Script-fuer-Linux/issues)!
