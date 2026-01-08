OG Image  IPv6 / Curl-Timeout Diagnose

Kurzbefund
- Beim Testen wurde die Datei https://muggelbude.it/images/og-image.png per IPv4 erfolgreich erreicht (HTTP 200).
- Es wurden keine AAAA-(IPv6)-DNS-Einträge für muggelbude.it gefunden. Bei reinen IPv6-Versuchen tritt daher eine Auflösungs- bzw. Verbindungs-Fehlermeldung auf.

Ursache
- Manche Clients bzw. Umgebungen versuchen zuerst IPv6. Wenn keine AAAA-Einträge existieren, kann das wie ein Timeout oder Verbindungsfehler aussehen, bevor auf IPv4 zurückgefallen wird.

Empfehlungen
1. Wenn du IPv6 für die Domain unterstützen möchtest, lege AAAA-Einträge bei deinem DNS-Provider an, die auf die IPv6-Adressen deines Hosters/CDN zeigen. Prüfe die Hosting-/CDN-Dokumentation für korrekte IPv6-Konfiguration.
2. Wenn du keine IPv6-Unterstützung brauchst, ist keine Aktion notwendig  die Datei ist über IPv4 erreichbar. Bei automatisierten Tools kannst du curl -4 verwenden, um IPv4 zu forcieren.

Nützliche Tests (in WSL oder Linux)


Weitere Hinweise
- Wenn du GitHub Pages oder ein CDN nutzt, lies die dortige Anleitung für IPv6-/AAAA-Unterstützung. Falls du möchtest, kann ich einen kurzen Howto für GitHub Pages in dieses Repo ergänzen.

Autor: Automatisch angelegt  kurze Anleitung zur Behebung von Curl-Timeouts bei fehlender IPv6-Unterstützung.
