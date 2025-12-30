// Project Page Logic
import {
    getRepositoryInfo,
    getLatestRelease,
    getReleases,
    getReadme,
    getChangelog,
    getRoadmap
} from './github-api.js';
import { markdownToHtml } from './markdown-parser.js';

class ProjectPage {
    constructor(repoName) {
        this.repo = repoName;
        this.screenshots = [];
        this.currentScreenshot = 0;
        this.init();
    }

    async init() {
        try {
            this.createLightbox();
            await Promise.all([
                this.loadRepositoryInfo(),
                this.loadLatestRelease(),
                this.loadReadme(),
                this.loadReleases(),
                this.loadChangelog(),
                this.loadRoadmap()
            ]);
        } catch (error) {
            console.error('Fehler beim Laden der Projekt-Daten:', error);
        }
    }

    createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.id = 'screenshot-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Schließen">×</button>
                <button class="lightbox-prev" aria-label="Vorheriges">‹</button>
                <img src="" alt="">
                <button class="lightbox-next" aria-label="Nächstes">›</button>
                <div class="lightbox-caption"></div>
            </div>
        `;
        document.body.appendChild(lightbox);

        // Event Listeners
        lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
        lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.prevScreenshot());
        lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.nextScreenshot());
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) this.closeLightbox();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeLightbox();
            if (e.key === 'ArrowLeft') this.prevScreenshot();
            if (e.key === 'ArrowRight') this.nextScreenshot();
        });
    }

    openLightbox(index) {
        this.currentScreenshot = index;
        const lightbox = document.getElementById('screenshot-lightbox');
        const img = lightbox.querySelector('img');
        const caption = lightbox.querySelector('.lightbox-caption');

        img.src = this.screenshots[index].src;
        img.alt = this.screenshots[index].alt;
        caption.textContent = this.screenshots[index].alt || 'Screenshot';

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox() {
        const lightbox = document.getElementById('screenshot-lightbox');
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    prevScreenshot() {
        if (this.screenshots.length === 0) return;
        this.currentScreenshot = (this.currentScreenshot - 1 + this.screenshots.length) % this.screenshots.length;
        this.openLightbox(this.currentScreenshot);
    }

    nextScreenshot() {
        if (this.screenshots.length === 0) return;
        this.currentScreenshot = (this.currentScreenshot + 1) % this.screenshots.length;
        this.openLightbox(this.currentScreenshot);
    }

    async loadRepositoryInfo() {
        try {
            // Versuche zuerst Cache zu laden
            let info = null;
            try {
                const container = document.querySelector('.project-content');
                const projectId = container?.dataset.projectId || this.repo.split('/')[1].toLowerCase();
                const cacheResponse = await fetch(`../data/cache/projects/${projectId}.json`);
                if (cacheResponse.ok) {
                    const cached = await cacheResponse.json();
                    if (cached.repoInfo) {
                        info = {
                            stargazers_count: cached.repoInfo.stars,
                            forks_count: cached.repoInfo.forks,
                            open_issues_count: cached.repoInfo.openIssues
                        };
                        console.log('Repository-Info aus Cache geladen');
                    }
                }
            } catch (cacheError) {
                console.log('Cache nicht verfügbar, lade von API...');
            }

            // Falls kein Cache, von API laden
            if (!info) {
                info = await getRepositoryInfo(this.repo);
            }

            if (!info) return;

            // Statistiken aktualisieren
            const starsEl = document.getElementById('stars');
            const forksEl = document.getElementById('forks');
            const issuesEl = document.getElementById('open-issues');

            if (starsEl) starsEl.textContent = info.stargazers_count;
            if (forksEl) forksEl.textContent = info.forks_count;
            if (issuesEl) issuesEl.textContent = `${info.open_issues_count} offen`;
        } catch (error) {
            console.error('Fehler beim Laden der Repository-Infos:', error);
        }
    }

    async loadLatestRelease() {
        try {
            const section = document.getElementById('latest-release');

            // Versuche zuerst Cache zu laden
            let release = null;
            try {
                const container = document.querySelector('.project-content');
                const projectId = container?.dataset.projectId || this.repo.split('/')[1].toLowerCase();
                const cacheResponse = await fetch(`../data/cache/projects/${projectId}.json`);
                if (cacheResponse.ok) {
                    const cached = await cacheResponse.json();
                    if (cached.latestRelease) {
                        release = {
                            tag_name: cached.latestRelease.tagName,
                            name: cached.latestRelease.name,
                            body: cached.latestRelease.body,
                            published_at: cached.latestRelease.publishedAt,
                            html_url: cached.latestRelease.htmlUrl
                        };
                        console.log('Release aus Cache geladen');
                    }
                }
            } catch (cacheError) {
                console.log('Cache nicht verfügbar, lade von API...');
            }

            // Falls kein Cache, von API laden
            if (!release) {
                release = await getLatestRelease(this.repo);
            }

            if (!release) {
                if (section) section.style.display = 'none';
                return;
            }

            let notesHtml = markdownToHtml(release.body || 'Keine Release-Notes verfügbar.');

            // Seiten-Anker
            notesHtml = notesHtml.replace(/href="[^"]*ROADMAP\.md"/gi, 'href="#roadmap"');
            notesHtml = notesHtml.replace(/href="[^"]*CHANGELOG\.md"/gi, 'href="#changelog"');
            notesHtml = notesHtml.replace(/href="[^"]*README\.md"/gi, 'href="#readme"');

            // Alle anderen .md Dateien → GitHub
            notesHtml = notesHtml.replace(/href="([^"#]*\.(md|MD))"/gi, (match, filename) => {
                if (filename.startsWith('#')) return match;
                const cleanFilename = filename.replace(/^\.\.?\//, '');
                return `href="https://github.com/${this.repo}/blob/main/${cleanFilename}" target="_blank"`;
            });

            // Externe Links → neuer Tab
            notesHtml = notesHtml.replace(/href="(https?:\/\/[^"]+)"/gi, (match, url) => {
                if (match.includes('target=')) return match;
                return `href="${url}" target="_blank" rel="noopener noreferrer"`;
            });

            const notesEl = document.getElementById('latest-release-notes');
            if (notesEl) notesEl.innerHTML = notesHtml;

            // Version und Datum aktualisieren
            const versionEl = document.querySelector('.version-tag');
            const dateEl = document.querySelector('.release-date');
            const titleEl = document.querySelector('.release-banner h3');

            if (versionEl) versionEl.textContent = release.tag_name;
            if (dateEl) {
                const date = new Date(release.published_at);
                dateEl.textContent = `Veröffentlicht am ${date.toLocaleDateString('de-DE')}`;
            }
            if (titleEl) titleEl.textContent = release.name || release.tag_name;
        } catch (error) {
            console.error('Fehler beim Laden des neuesten Releases:', error);
            const section = document.getElementById('latest-release');
            if (section) section.style.display = 'none';
        }
    }

    async loadReadme() {
        try {
            const readmeContent = document.querySelector('.readme-content');
            const loadingEl = document.getElementById('readme-loading');

            if (loadingEl) loadingEl.style.display = 'none';

            // Versuche zuerst Cache zu laden (enthält bereits HTML)
            let readmeHtml = null;
            try {
                const container = document.querySelector('.project-content');
                const projectId = container?.dataset.projectId || this.repo.split('/')[1].toLowerCase();
                const cacheResponse = await fetch(`../data/cache/projects/${projectId}.json`);
                if (cacheResponse.ok) {
                    const cached = await cacheResponse.json();
                    readmeHtml = cached.readmeHtml || null;
                    console.log('README HTML aus Cache geladen');
                }
            } catch (cacheError) {
                console.log('Cache nicht verfügbar, lade von API...');
            }

            // Falls kein Cache, von API laden und parsen
            if (!readmeHtml) {
                const readme = await getReadme(this.repo);
                if (readme) {
                    readmeHtml = markdownToHtml(readme);
                }
            }

            if (!readmeHtml || !readmeContent) {
                if (readmeContent) {
                    readmeContent.innerHTML = '<p>README nicht verfügbar.</p>';
                }
                return;
            }

            // 1. Ersetze Seiten-Ankerpunkte (bleiben auf der Seite)
            readmeHtml = readmeHtml.replace(/href="[^"]*ROADMAP\.md"/gi, 'href="#roadmap"');
            readmeHtml = readmeHtml.replace(/href="[^"]*CHANGELOG\.md"/gi, 'href="#changelog"');

            // 2. Alle anderen .md Dateien und LICENSE führen zu GitHub
            readmeHtml = readmeHtml.replace(/href="([^"#]*\.(md|MD))"/gi, (match, filename) => {
                // Überspringe bereits ersetzte Anker-Links
                if (filename.startsWith('#')) return match;
                // Entferne ./ oder ../ am Anfang
                const cleanFilename = filename.replace(/^\.\.?\//, '');
                return `href="https://github.com/${this.repo}/blob/main/${cleanFilename}" target="_blank"`;
            });

            // LICENSE (ohne .md Endung)
            const licenseUrl = `https://github.com/${this.repo}/blob/main/LICENSE`;
            readmeHtml = readmeHtml.replace(/href="[^"#]*LICENSE[^"]*"/gi, (match) => {
                if (match.includes('target=')) return match; // bereits ersetzt
                return `href="${licenseUrl}" target="_blank"`;
            });

            // 3. Alle verbleibenden externen Links (http/https) bekommen target="_blank"
            readmeHtml = readmeHtml.replace(/href="(https?:\/\/[^"]+)"/gi, (match, url) => {
                if (match.includes('target=')) return match; // bereits ersetzt
                return `href="${url}" target="_blank" rel="noopener noreferrer"`;
            });

            readmeContent.innerHTML = readmeHtml;

            // Screenshots extrahieren
            this.extractScreenshots(readmeHtml);
        } catch (error) {
            console.error('Fehler beim Laden des README:', error);
            const readmeContent = document.querySelector('.readme-content');
            if (readmeContent) {
                readmeContent.innerHTML = '<p class="error">README konnte nicht geladen werden.</p>';
            }
        }
    }

    extractScreenshots(html) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const images = tempDiv.querySelectorAll('img');

        const screenshotGrid = document.getElementById('screenshot-grid');
        const screenshotsSection = document.getElementById('screenshots');

        // Filtere nur echte Screenshots (keine Badges, Logos, Icons)
        const screenshots = Array.from(images).filter(img => {
            const src = img.src.toLowerCase();
            const alt = (img.alt || '').toLowerCase();

            // Ausschließen: Badges von shields.io, GitHub Actions, etc.
            if (src.includes('shields.io') || src.includes('badge')) return false;

            // Ausschließen: Logos und Icons (klein oder im Namen)
            if (alt.includes('logo') || alt.includes('icon') || src.includes('/icon')) return false;
            if (alt.includes('badge') || alt === 'tipels') return false;

            // Ausschließen: Sehr kleine Bilder (< 200px breit)
            const width = parseInt(img.getAttribute('width')) || 999;
            if (width < 200) return false;

            // Einschließen: Explizite Screenshots
            if (src.includes('screenshot') || alt.includes('screenshot')) return true;
            if (src.includes('/docs/') || src.includes('/assets/screenshots/')) return true;

            // Einschließen: Große Bilder (> 400px)
            if (width > 400) return true;

            return false;
        });

        if (!screenshotGrid || screenshots.length === 0) {
            if (screenshotsSection) screenshotsSection.style.display = 'none';
            return;
        }

        screenshotGrid.innerHTML = '';

        // Screenshots für Lightbox speichern
        this.screenshots = screenshots.map(img => ({
            src: img.src,
            alt: img.alt || 'Screenshot'
        }));

        screenshots.forEach((img, index) => {
            const figure = document.createElement('figure');
            figure.innerHTML = `
                <a href="#" data-screenshot-index="${index}">
                    <img src="${img.src}" alt="${img.alt || 'Screenshot'}" loading="lazy">
                </a>
                <figcaption>${img.alt || 'Screenshot'}</figcaption>
            `;

            // Click-Handler für Lightbox
            const link = figure.querySelector('a');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.openLightbox(index);
            });

            screenshotGrid.appendChild(figure);
        });
    }

    async loadReleases() {
        try {
            const releases = await getReleases(this.repo, 10);
            const releasesList = document.getElementById('releases-list');
            const releasesSection = document.getElementById('releases');

            if (!releases || releases.length === 0) {
                if (releasesSection) releasesSection.style.display = 'none';
                return;
            }

            if (!releasesList) return;

            releasesList.innerHTML = '';

            releases.slice(0, 5).forEach(release => {
                const releaseEl = document.createElement('div');
                releaseEl.className = 'release-item';

                const date = new Date(release.published_at);
                const formattedDate = date.toLocaleDateString('de-DE');

                // Markdown parsen und Links ersetzen
                let bodyHtml = markdownToHtml(release.body || 'Keine Release-Notes');

                // Seiten-Anker
                bodyHtml = bodyHtml.replace(/href="[^"]*ROADMAP\.md"/gi, 'href="#roadmap"');
                bodyHtml = bodyHtml.replace(/href="[^"]*CHANGELOG\.md"/gi, 'href="#changelog"');
                bodyHtml = bodyHtml.replace(/href="[^"]*README\.md"/gi, 'href="#readme"');

                // Alle anderen .md Dateien → GitHub
                bodyHtml = bodyHtml.replace(/href="([^"#]*\.(md|MD))"/gi, (match, filename) => {
                    if (filename.startsWith('#')) return match;
                    const cleanFilename = filename.replace(/^\.\.?\//, '');
                    return `href="https://github.com/${this.repo}/blob/main/${cleanFilename}" target="_blank"`;
                });

                // Externe Links → neuer Tab
                bodyHtml = bodyHtml.replace(/href="(https?:\/\/[^"]+)"/gi, (match, url) => {
                    if (match.includes('target=')) return match;
                    return `href="${url}" target="_blank" rel="noopener noreferrer"`;
                });

                releaseEl.innerHTML = `
                    <div class="release-header">
                        <span class="version-tag">${release.tag_name}</span>
                        <h3>${release.name || release.tag_name}</h3>
                        <time datetime="${release.published_at}">${formattedDate}</time>
                    </div>
                    <div class="release-body">
                        ${bodyHtml}
                    </div>
                    <a href="${release.html_url}" target="_blank" class="release-link">
                        Auf GitHub ansehen →
                    </a>
                `;
                releasesList.appendChild(releaseEl);
            });
        } catch (error) {
            console.error('Fehler beim Laden der Releases:', error);
            const releasesSection = document.getElementById('releases');
            if (releasesSection) releasesSection.style.display = 'none';
        }
    }

    async loadChangelog() {
        try {
            const changelogContent = document.getElementById('changelog-content');
            const changelogSection = document.getElementById('changelog');

            // Versuche zuerst Cache zu laden (enthält bereits HTML)
            let changelogHtml = null;
            try {
                const container = document.querySelector('.project-content');
                const projectId = container?.dataset.projectId || this.repo.split('/')[1].toLowerCase();
                const cacheResponse = await fetch(`../data/cache/projects/${projectId}.json`);
                if (cacheResponse.ok) {
                    const cached = await cacheResponse.json();
                    changelogHtml = cached.changelogHtml || null;
                    if (changelogHtml) {
                        console.log('CHANGELOG HTML aus Cache geladen');
                    }
                }
            } catch (cacheError) {
                console.log('Cache nicht verfügbar, lade von API...');
            }

            // Falls kein Cache, von API laden und parsen
            if (!changelogHtml) {
                const changelog = await getChangelog(this.repo);
                if (!changelog) {
                    // Kein Changelog vorhanden - Sektion verstecken
                    if (changelogSection) changelogSection.style.display = 'none';
                    return;
                }
                changelogHtml = markdownToHtml(changelog);
            }

            if (!changelogContent) return;

            // Link-Replacements für Changelog
            // 1a. Compare-Links mit HEAD zu Commits umwandeln (z.B. /compare/v0.2.0...HEAD -> /commits/main)
            changelogHtml = changelogHtml.replace(
                /href="https:\/\/github\.com\/([^\/]+\/[^\/]+)\/compare\/[^"]+\.\.\.HEAD"/gi,
                (match, repo) => `href="https://github.com/${repo}/commits/main" target="_blank"`
            );

            // 1b. Compare-Links zu Release-Links umwandeln (z.B. /compare/v1.4.0...v1.5.0 -> /releases/tag/v1.5.0)
            changelogHtml = changelogHtml.replace(
                /href="https:\/\/github\.com\/([^\/]+\/[^\/]+)\/compare\/[^"]+\.\.\.v?(\d+\.\d+\.\d+[^"]*)"/gi,
                (match, repo, version) => {
                    // Füge 'v' hinzu falls nicht vorhanden
                    const versionTag = version.startsWith('v') ? version : 'v' + version;
                    return `href="https://github.com/${repo}/releases/tag/${versionTag}" target="_blank"`;
                }
            );

            // 2. Relative Version-Tags (z.B. v0.2.0-beta, 0.2.0) zu GitHub Releases
            changelogHtml = changelogHtml.replace(/href="(v?\d+\.\d+\.\d+[^"]*)"/gi, (match, version) => {
                // Überspringe bereits vollständige URLs
                if (version.startsWith('http')) return match;
                if (version.startsWith('#')) return match;
                return `href="https://github.com/${this.repo}/releases/tag/${version}" target="_blank"`;
            });

            // 2. Alle .md Dateien zu GitHub
            changelogHtml = changelogHtml.replace(/href="([^"#]*\.(md|MD))"/gi, (match, filename) => {
                if (filename.startsWith('#')) return match;
                if (filename.startsWith('http')) return match;
                const cleanFilename = filename.replace(/^\.\.?\//, '');
                return `href="https://github.com/${this.repo}/blob/main/${cleanFilename}" target="_blank"`;
            });

            // 3. Alle externen Links bekommen target="_blank"
            changelogHtml = changelogHtml.replace(/href="(https?:\/\/[^"]+)"/gi, (match, url) => {
                if (match.includes('target=')) return match;
                return `href="${url}" target="_blank" rel="noopener noreferrer"`;
            });

            changelogContent.innerHTML = changelogHtml;
        } catch (error) {
            console.error('Fehler beim Laden des Changelog:', error);
            const changelogSection = document.getElementById('changelog');
            if (changelogSection) changelogSection.style.display = 'none';
        }
    }

    async loadRoadmap() {
        try {
            const roadmapContent = document.getElementById('roadmap-content');
            const roadmapSection = document.getElementById('roadmap');

            // Versuche zuerst Cache zu laden (enthält bereits HTML)
            let roadmapHtml = null;
            try {
                const container = document.querySelector('.project-content');
                const projectId = container?.dataset.projectId || this.repo.split('/')[1].toLowerCase();
                const cacheResponse = await fetch(`../data/cache/projects/${projectId}.json`);
                if (cacheResponse.ok) {
                    const cached = await cacheResponse.json();
                    roadmapHtml = cached.roadmapHtml || null;
                    if (roadmapHtml) {
                        console.log('ROADMAP HTML aus Cache geladen');
                    }
                }
            } catch (cacheError) {
                console.log('Cache nicht verfügbar, lade von API...');
            }

            // Falls kein Cache, von API laden und parsen
            if (!roadmapHtml) {
                const roadmap = await getRoadmap(this.repo);
                if (!roadmap) {
                    // Keine Roadmap vorhanden - Sektion verstecken
                    if (roadmapSection) roadmapSection.style.display = 'none';
                    return;
                }
                roadmapHtml = markdownToHtml(roadmap);
            }

            if (!roadmapContent) return;

            // Link-Replacements für Roadmap
            // 1a. Compare-Links mit HEAD zu Commits umwandeln
            roadmapHtml = roadmapHtml.replace(
                /href="https:\/\/github\.com\/([^\/]+\/[^\/]+)\/compare\/[^"]+\.\.\.HEAD"/gi,
                (match, repo) => `href="https://github.com/${repo}/commits/main" target="_blank"`
            );

            // 1b. Compare-Links zu Release-Links umwandeln
            roadmapHtml = roadmapHtml.replace(
                /href="https:\/\/github\.com\/([^\/]+\/[^\/]+)\/compare\/[^"]+\.\.\.v?(\d+\.\d+\.\d+[^"]*)"/gi,
                (match, repo, version) => {
                    const versionTag = version.startsWith('v') ? version : 'v' + version;
                    return `href="https://github.com/${repo}/releases/tag/${versionTag}" target="_blank"`;
                }
            );

            // 2. Relative Version-Tags zu GitHub Releases
            roadmapHtml = roadmapHtml.replace(/href="(v?\d+\.\d+\.\d+[^"]*)"/gi, (match, version) => {
                if (version.startsWith('http')) return match;
                if (version.startsWith('#')) return match;
                return `href="https://github.com/${this.repo}/releases/tag/${version}" target="_blank"`;
            });

            // 2. Alle .md Dateien zu GitHub
            roadmapHtml = roadmapHtml.replace(/href="([^"#]*\.(md|MD))"/gi, (match, filename) => {
                if (filename.startsWith('#')) return match;
                if (filename.startsWith('http')) return match;
                const cleanFilename = filename.replace(/^\.\.?\//, '');
                return `href="https://github.com/${this.repo}/blob/main/${cleanFilename}" target="_blank"`;
            });

            // 3. Alle externen Links bekommen target="_blank"
            roadmapHtml = roadmapHtml.replace(/href="(https?:\/\/[^"]+)"/gi, (match, url) => {
                if (match.includes('target=')) return match;
                return `href="${url}" target="_blank" rel="noopener noreferrer"`;
            });

            roadmapContent.innerHTML = roadmapHtml;
        } catch (error) {
            console.error('Fehler beim Laden der Roadmap:', error);
            const roadmapSection = document.getElementById('roadmap');
            if (roadmapSection) roadmapSection.style.display = 'none';
        }
    }
}

// Automatisch Repository aus data-attribute oder URL extrahieren
function initProjectPage() {
    const container = document.querySelector('.project-content');
    if (!container) return;

    // Repository-Name aus data-attribute oder global gesetzt
    const repo = container.dataset.repo || window.PROJECT_REPO;

    if (!repo) {
        console.error('Kein Repository konfiguriert. Setze data-repo Attribut oder window.PROJECT_REPO');
        return;
    }

    new ProjectPage(repo);
}

// Initialisieren
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProjectPage);
} else {
    initProjectPage();
}

export default ProjectPage;
