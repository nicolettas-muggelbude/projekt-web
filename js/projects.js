// Projects List für Hauptseite
import { getRepositoryInfo, getLatestRelease } from './github-api.js';

class ProjectsManager {
    constructor() {
        this.projects = [];
        this.container = document.getElementById('project-grid');
        this.init();
    }

    async init() {
        try {
            await this.loadProjects();
            await this.renderProjects();
        } catch (error) {
            console.error('Fehler beim Laden der Projekte:', error);
            this.showError('Projekte konnten nicht geladen werden.');
        }
    }

    async loadProjects() {
        try {
            const response = await fetch('data/projects.json');
            const data = await response.json();
            this.projects = data.projects || [];
        } catch (error) {
            console.error('Fehler beim Laden von projects.json:', error);
            this.projects = [];
        }
    }

    async renderProjects() {
        if (!this.container) {
            console.warn('Project-Grid Container nicht gefunden');
            return;
        }

        if (this.projects.length === 0) {
            this.container.innerHTML = '<p class="loading">Keine Projekte konfiguriert.</p>';
            return;
        }

        this.container.innerHTML = '<p class="loading">Lade Projekte...</p>';

        const projectCards = await Promise.all(
            this.projects.map(project => this.createProjectCard(project))
        );

        this.container.innerHTML = '';
        projectCards.forEach(card => {
            if (card) {
                this.container.appendChild(card);
            }
        });

        // Owner-Avatar laden und anzeigen
        this.loadOwnerAvatar();
    }

    async loadOwnerAvatar() {
        if (this.projects.length === 0) return;

        const avatarImg = document.getElementById('owner-avatar');
        if (!avatarImg) return;

        try {
            // Direkt von GitHub-User laden (kein API-Limit für Avatar-URLs)
            const username = 'nicolettas-muggelbude';
            avatarImg.src = `https://github.com/${username}.png?size=120`;
            avatarImg.style.display = 'block';
        } catch (error) {
            console.error('Fehler beim Laden des Owner-Avatars:', error);
        }
    }

    async createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';

        try {
            // Versuche zuerst gecachte Daten zu laden
            let repoInfo = null;
            let latestRelease = null;

            try {
                const cacheResponse = await fetch(`data/cache/projects/${project.id}.json`);
                if (cacheResponse.ok) {
                    const cached = await cacheResponse.json();
                    repoInfo = cached.repoInfo ? {
                        stargazers_count: cached.repoInfo.stars,
                        forks_count: cached.repoInfo.forks,
                        open_issues_count: cached.repoInfo.openIssues,
                        description: cached.repoInfo.description,
                        owner: { avatar_url: '' }
                    } : null;
                    latestRelease = cached.latestRelease ? {
                        tag_name: cached.latestRelease.tagName,
                        name: cached.latestRelease.name
                    } : null;
                }
            } catch (cacheError) {
                console.log('Cache nicht verfügbar, lade von API...');
            }

            // Falls Cache nicht funktioniert, von API laden
            if (!repoInfo) {
                [repoInfo, latestRelease] = await Promise.all([
                    getRepositoryInfo(project.repo),
                    getLatestRelease(project.repo)
                ]);
            }

            if (!repoInfo) {
                console.warn(`Repository ${project.repo} nicht gefunden`);
                return null;
            }

            // Release Info
            let releaseHtml = '';
            if (latestRelease) {
                releaseHtml = `
                    <div class="card-release">
                        <span class="version-tag">${latestRelease.tag_name}</span>
                        <span class="card-release-name">${latestRelease.name || latestRelease.tag_name}</span>
                    </div>
                `;
            }

            // Icon: logoUrl direkt, oder aus /assets/icons/, oder Emoji-Fallback
            let iconHtml = '';
            if (project.logoUrl) {
                iconHtml = `<img src="${project.logoUrl}" alt="${project.name}" class="project-icon project-icon--logo">`;
            } else if (project.icon) {
                const iconUrl = `https://raw.githubusercontent.com/${project.repo}/main/assets/icons/${project.icon}`;
                iconHtml = `<img src="${iconUrl}" alt="${project.name}" class="project-icon">`;
            } else {
                iconHtml = `<span class="project-icon-emoji">📦</span>`;
            }

            card.innerHTML = `
                <div class="project-header">
                    ${iconHtml}
                    <h3>${project.name}</h3>
                </div>
                <div class="card-section">
                    <span class="card-section-label">📌 Was ist es?</span>
                    <p>${project.description || repoInfo.description || 'Keine Beschreibung verfügbar'}</p>
                </div>
                <div class="card-section">
                    ${releaseHtml}
                </div>
                <div class="card-section">
                    <span class="card-section-label">📈 Wie ist die Entwicklung?</span>
                    <div class="meta">
                        <span>⭐ ${repoInfo.stargazers_count}</span>
                        <span>🍴 ${repoInfo.forks_count}</span>
                        <span>📝 ${repoInfo.open_issues_count} Issues</span>
                    </div>
                </div>
                <a href="projects/${project.id}.html" class="btn">Mehr Details →</a>
            `;

            return card;
        } catch (error) {
            console.error(`Fehler beim Laden von ${project.repo}:`, error);

            // Fallback ohne GitHub-Daten
            card.innerHTML = `
                <h3>${project.name}</h3>
                <p>${project.description || 'Beschreibung nicht verfügbar'}</p>
                <p class="error">GitHub-Daten konnten nicht geladen werden.</p>
                <a href="https://github.com/${project.repo}" target="_blank" class="btn">
                    Auf GitHub ansehen →
                </a>
            `;

            return card;
        }
    }

    showError(message) {
        if (this.container) {
            this.container.innerHTML = `<p class="error">${message}</p>`;
        }
    }
}

// Initialisieren
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ProjectsManager();
    });
} else {
    new ProjectsManager();
}

export default ProjectsManager;
