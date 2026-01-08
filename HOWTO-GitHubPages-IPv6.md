# HOWTO: GitHub Pages + IPv6 AAAA

Kurz: Dieses HOWTO zeigt Optionen, um fuer eine GitHub Pages Seite IPv6 (AAAA) fuer die eigene Domain bereitzustellen oder IPv6-Fallback-Probleme zu vermeiden.

1 - Hintergrund
- GitHub Pages liefert fuer Custom Domains nicht immer AAAA-Records. Fehlt AAAA, versuchen Clients IPv6 und koennen in Zeitueberschreitungen haengen.

2 - Optionen
- Frage deinen DNS-Provider, ob AAAA bereitgestellt werden kann.
- Cloudflare: aktiviere Cloudflare (Proxy) — Cloudflare spricht IPv6 mit Clients und verbindet zu GitHub per IPv4.
- CDN/Reverse-Proxy: setze einen Anbieter ein, der IPv6 unterstuetzt.

3 - Tests
- dig +short AAAA example.com
- curl -6 -I https://example.com/images/og-image.png
- curl -4 -I https://example.com/images/og-image.png

4 - Empfehlung
- Cloudflare Proxy ist die einfachste Kurzloesung, wenn der DNS-Provider keine AAAA-Records liefert.
