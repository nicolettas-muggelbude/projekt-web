#!/usr/bin/env node

/**
 * Build Script für Portfolio-Website
 *
 * Funktionen:
 * 1. Lädt GitHub-Daten für alle Projekte
 * 2. Cached die Daten als JSON
 * 3. Generiert HTML-Seiten für jedes Projekt
 * 4. Erstellt Blog-Index aus Markdown-Dateien
 */

const fs = require('fs').promises;
const path = require('path');

// GitHub API Base
const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// Farben für Console-Output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// GitHub API Fetch mit Token
async function githubFetch(url) {
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };

    if (GITHUB_TOKEN) {
        headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`GitHub API Error: ${response.status} - ${url}`);
    }

    return await response.json();
}

// Projekt-Daten laden und cachen
async function buildProjectCache(project) {
    log(`\n📦 Verarbeite: ${project.name}`, 'blue');

    const cache = {
        repo: project.repo,
        name: project.name,
        description: project.description,
        lastUpdate: new Date().toISOString()
    };

    try {
        // Repository Info
        log('  ⬇️  Lade Repository-Informationen...');
        const repoInfo = await githubFetch(`${GITHUB_API}/repos/${project.repo}`);
        if (repoInfo) {
            cache.repoInfo = {
                stars: repoInfo.stargazers_count,
                forks: repoInfo.forks_count,
                openIssues: repoInfo.open_issues_count,
                description: repoInfo.description,
                homepage: repoInfo.homepage,
                topics: repoInfo.topics
            };
            log(`  ✓ Stars: ${repoInfo.stargazers_count}, Forks: ${repoInfo.forks_count}`, 'green');
        }

        // Latest Release
        log('  ⬇️  Lade neuestes Release...');
        const latestRelease = await githubFetch(`${GITHUB_API}/repos/${project.repo}/releases/latest`);
        if (latestRelease) {
            cache.latestRelease = {
                tagName: latestRelease.tag_name,
                name: latestRelease.name,
                body: latestRelease.body,
                publishedAt: latestRelease.published_at,
                htmlUrl: latestRelease.html_url
            };
            log(`  ✓ Version: ${latestRelease.tag_name}`, 'green');
        } else {
            log('  ⚠ Kein Release gefunden', 'yellow');
        }

        // Speichere Cache
        const cacheDir = path.join(__dirname, '..', 'data', 'cache', 'projects');
        await fs.mkdir(cacheDir, { recursive: true });

        const cacheFile = path.join(cacheDir, `${project.id}.json`);
        await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2));

        log(`  ✓ Cache gespeichert`, 'green');

        return cache;
    } catch (error) {
        log(`  ✗ Fehler: ${error.message}`, 'red');
        return null;
    }
}

// Projekt-HTML-Seite generieren
async function generateProjectPage(project) {
    log(`\n🔨 Generiere HTML-Seite für: ${project.name}`, 'blue');

    try {
        // Template laden
        const templatePath = path.join(__dirname, '..', 'project-template.html');
        let template = await fs.readFile(templatePath, 'utf-8');

        // Platzhalter ersetzen
        template = template.replace(/\{\{PROJECT_NAME\}\}/g, project.name);
        template = template.replace(/\{\{PROJECT_DESCRIPTION\}\}/g, project.description || '');
        template = template.replace(/\{\{REPO_NAME\}\}/g, project.repo);

        // Speichere Projektseite
        const projectsDir = path.join(__dirname, '..', 'projects');
        await fs.mkdir(projectsDir, { recursive: true });

        const outputPath = path.join(projectsDir, `${project.id}.html`);
        await fs.writeFile(outputPath, template);

        log(`  ✓ Seite erstellt: projects/${project.id}.html`, 'green');
    } catch (error) {
        log(`  ✗ Fehler: ${error.message}`, 'red');
    }
}

// Blog-Index aus Markdown-Dateien erstellen
async function buildBlogIndex() {
    log(`\n📝 Erstelle Blog-Index...`, 'blue');

    try {
        const postsDir = path.join(__dirname, '..', 'blog', 'posts');

        // Prüfe ob Ordner existiert
        try {
            await fs.access(postsDir);
        } catch {
            log('  ⚠ Kein blog/posts Ordner gefunden', 'yellow');
            return;
        }

        const files = await fs.readdir(postsDir);
        const mdFiles = files.filter(f => f.endsWith('.md'));

        if (mdFiles.length === 0) {
            log('  ⚠ Keine Markdown-Dateien gefunden', 'yellow');
            return;
        }

        const posts = [];

        for (const file of mdFiles) {
            const filePath = path.join(postsDir, file);
            const content = await fs.readFile(filePath, 'utf-8');

            // Frontmatter extrahieren (einfaches Parsing)
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
            if (!frontmatterMatch) continue;

            const frontmatter = {};
            frontmatterMatch[1].split('\n').forEach(line => {
                const [key, ...valueParts] = line.split(':');
                if (key && valueParts.length > 0) {
                    let value = valueParts.join(':').trim();

                    // Arrays [tag1, tag2]
                    if (value.startsWith('[') && value.endsWith(']')) {
                        value = value.slice(1, -1).split(',').map(v => v.trim());
                    }

                    // Strings ohne Quotes
                    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    }

                    frontmatter[key.trim()] = value;
                }
            });

            // Slug aus Dateinamen
            const slug = file.replace('.md', '');

            posts.push({
                slug,
                title: frontmatter.title || 'Untitled',
                date: frontmatter.date || '',
                author: frontmatter.author || '',
                tags: frontmatter.tags || [],
                excerpt: frontmatter.excerpt || ''
            });

            log(`  ✓ ${frontmatter.title}`, 'green');
        }

        // Nach Datum sortieren
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Blog-Index speichern
        const indexPath = path.join(__dirname, '..', 'blog', 'blog-index.json');
        await fs.writeFile(indexPath, JSON.stringify({ posts }, null, 2));

        log(`  ✓ Blog-Index erstellt: ${posts.length} Posts`, 'green');
    } catch (error) {
        log(`  ✗ Fehler: ${error.message}`, 'red');
    }
}

// Main Build Funktion
async function build() {
    log('\n🚀 Starte Build-Prozess...\n', 'blue');

    try {
        // Projekte laden
        const projectsPath = path.join(__dirname, '..', 'data', 'projects.json');
        const projectsData = JSON.parse(await fs.readFile(projectsPath, 'utf-8'));
        const projects = projectsData.projects || [];

        log(`📋 ${projects.length} Projekte gefunden\n`, 'blue');

        // Projekt-Caches und Seiten erstellen
        for (const project of projects) {
            await buildProjectCache(project);
            await generateProjectPage(project);
        }

        // Blog-Index erstellen
        await buildBlogIndex();

        log('\n✅ Build erfolgreich abgeschlossen!\n', 'green');
    } catch (error) {
        log(`\n❌ Build fehlgeschlagen: ${error.message}\n`, 'red');
        process.exit(1);
    }
}

// Script ausführen
build();
