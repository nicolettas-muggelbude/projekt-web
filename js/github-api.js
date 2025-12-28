// GitHub API Wrapper
const GITHUB_API = 'https://api.github.com';
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minuten Cache

class GitHubAPI {
    constructor() {
        this.cache = new Map();
    }

    async fetch(url, options = {}) {
        // Prüfe Cache
        const cached = this.cache.get(url);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    ...options.headers
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`GitHub API Error: ${response.status}`);
            }

            const data = await response.json();

            // Cache speichern
            this.cache.set(url, {
                data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('GitHub API Fehler:', error);
            throw error;
        }
    }

    async getRepositoryInfo(repo) {
        return await this.fetch(`${GITHUB_API}/repos/${repo}`);
    }

    async getLatestRelease(repo) {
        return await this.fetch(`${GITHUB_API}/repos/${repo}/releases/latest`);
    }

    async getReleases(repo, perPage = 10) {
        return await this.fetch(`${GITHUB_API}/repos/${repo}/releases?per_page=${perPage}`);
    }

    async getReadme(repo) {
        try {
            const response = await fetch(`${GITHUB_API}/repos/${repo}/readme`, {
                headers: {
                    'Accept': 'application/vnd.github.raw'
                }
            });

            if (!response.ok) {
                return null;
            }

            return await response.text();
        } catch (error) {
            console.error('Fehler beim Laden des README:', error);
            return null;
        }
    }

    async getFileContent(repo, path) {
        try {
            const response = await this.fetch(`${GITHUB_API}/repos/${repo}/contents/${path}`);
            if (!response || !response.content) {
                return null;
            }
            // Base64 dekodieren
            return atob(response.content);
        } catch (error) {
            console.error(`Fehler beim Laden von ${path}:`, error);
            return null;
        }
    }

    async getChangelog(repo) {
        return await this.getFileContent(repo, 'CHANGELOG.md');
    }

    async getRoadmap(repo) {
        return await this.getFileContent(repo, 'ROADMAP.md');
    }

    async getIssueCount(repo) {
        const info = await this.getRepositoryInfo(repo);
        return info ? info.open_issues_count : 0;
    }
}

// Singleton Instance
const githubAPI = new GitHubAPI();

// Export einzelner Funktionen für einfache Nutzung
export async function getRepositoryInfo(repo) {
    return await githubAPI.getRepositoryInfo(repo);
}

export async function getLatestRelease(repo) {
    return await githubAPI.getLatestRelease(repo);
}

export async function getReleases(repo, perPage = 10) {
    return await githubAPI.getReleases(repo, perPage);
}

export async function getReadme(repo) {
    return await githubAPI.getReadme(repo);
}

export async function getChangelog(repo) {
    return await githubAPI.getChangelog(repo);
}

export async function getRoadmap(repo) {
    return await githubAPI.getRoadmap(repo);
}

export async function getIssueCount(repo) {
    return await githubAPI.getIssueCount(repo);
}

export default githubAPI;
