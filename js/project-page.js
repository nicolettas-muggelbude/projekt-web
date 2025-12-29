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
        this.init();
    }

    async init() {
        try {
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

    async loadRepositoryInfo() {
        try {
            const info = await getRepositoryInfo(this.repo);
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
                const projectId = this.repo.split('/')[1].toLowerCase();
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

            const notesHtml = markdownToHtml(release.body || 'Keine Release-Notes verfügbar.');
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
                const projectId = this.repo.split('/')[1].toLowerCase();
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

        screenshots.forEach(img => {
            const figure = document.createElement('figure');
            figure.innerHTML = `
                <img src="${img.src}" alt="${img.alt || 'Screenshot'}" loading="lazy">
                <figcaption>${img.alt || 'Screenshot'}</figcaption>
            `;
            screenshotGrid.appendChild(figure);
        });
    }

    async loadReleases() {
        try {
            const releases = await getReleases(this.repo, 10);
            const releasesList = document.getElementById('releases-list');

            if (!releases || releases.length === 0 || !releasesList) {
                if (releasesList) {
                    releasesList.innerHTML = '<p>Keine Releases verfügbar.</p>';
                }
                return;
            }

            releasesList.innerHTML = '';

            releases.slice(0, 5).forEach(release => {
                const releaseEl = document.createElement('div');
                releaseEl.className = 'release-item';

                const date = new Date(release.published_at);
                const formattedDate = date.toLocaleDateString('de-DE');

                releaseEl.innerHTML = `
                    <div class="release-header">
                        <span class="version-tag">${release.tag_name}</span>
                        <h3>${release.name || release.tag_name}</h3>
                        <time datetime="${release.published_at}">${formattedDate}</time>
                    </div>
                    <div class="release-body">
                        ${markdownToHtml(release.body || 'Keine Release-Notes')}
                    </div>
                    <a href="${release.html_url}" target="_blank" class="release-link">
                        Auf GitHub ansehen →
                    </a>
                `;
                releasesList.appendChild(releaseEl);
            });
        } catch (error) {
            console.error('Fehler beim Laden der Releases:', error);
        }
    }

    async loadChangelog() {
        try {
            const changelog = await getChangelog(this.repo);
            const changelogContent = document.getElementById('changelog-content');

            if (!changelog || !changelogContent) {
                if (changelogContent) {
                    changelogContent.innerHTML = `
                        <p>Kein CHANGELOG.md gefunden.</p>
                        <p>Siehe <a href="#releases">Releases</a> für Versionshistorie.</p>
                    `;
                }
                return;
            }

            changelogContent.innerHTML = markdownToHtml(changelog);
        } catch (error) {
            console.error('Fehler beim Laden des Changelog:', error);
        }
    }

    async loadRoadmap() {
        try {
            const roadmap = await getRoadmap(this.repo);
            const roadmapContent = document.getElementById('roadmap-content');

            if (!roadmapContent) return;

            if (!roadmap) {
                roadmapContent.innerHTML = `
                    <p>Keine separate Roadmap verfügbar.</p>
                    <p>Geplante Features findest du in den
                    <a href="https://github.com/${this.repo}/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement" target="_blank">
                        Enhancement-Issues
                    </a>.</p>
                `;
                return;
            }

            roadmapContent.innerHTML = markdownToHtml(roadmap);
        } catch (error) {
            console.error('Fehler beim Laden der Roadmap:', error);
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
