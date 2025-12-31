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

        // README
        log('  ⬇️  Lade README...');
        try {
            const readmeResponse = await fetch(`${GITHUB_API}/repos/${project.repo}/readme`, {
                headers: {
                    'Accept': 'application/vnd.github.raw',
                    ...(GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {})
                }
            });
            if (readmeResponse.ok) {
                const { marked } = await import('marked');
                let readmeMarkdown = await readmeResponse.text();

                // Relative Bild-Pfade in Markdown in absolute GitHub URLs umwandeln
                readmeMarkdown = readmeMarkdown.replace(
                    /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
                    `![$1](https://raw.githubusercontent.com/${project.repo}/main/$2)`
                );

                // Relative Bild-Pfade in HTML img Tags umwandeln
                readmeMarkdown = readmeMarkdown.replace(
                    /<img\s+([^>]*\s+)?src="(?!https?:\/\/)([^"]+)"([^>]*)>/g,
                    `<img $1src="https://raw.githubusercontent.com/${project.repo}/main/$2"$3>`
                );

                // Als HTML cachen für bessere Performance und Konsistenz
                cache.readmeHtml = marked(readmeMarkdown);
                log(`  ✓ README geladen und in HTML konvertiert`, 'green');
            } else {
                log('  ⚠ Kein README gefunden', 'yellow');
            }
        } catch (error) {
            log(`  ⚠ README konnte nicht geladen werden: ${error.message}`, 'yellow');
        }

        // CHANGELOG
        log('  ⬇️  Lade CHANGELOG...');
        try {
            const changelogResponse = await fetch(`${GITHUB_API}/repos/${project.repo}/contents/CHANGELOG.md`, {
                headers: {
                    'Accept': 'application/vnd.github.raw',
                    ...(GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {})
                }
            });
            if (changelogResponse.ok) {
                const { marked } = await import('marked');
                const changelogMarkdown = await changelogResponse.text();
                cache.changelogHtml = marked(changelogMarkdown);
                log(`  ✓ CHANGELOG geladen und in HTML konvertiert`, 'green');
            } else {
                log('  ⚠ Kein CHANGELOG gefunden', 'yellow');
            }
        } catch (error) {
            log(`  ⚠ CHANGELOG konnte nicht geladen werden: ${error.message}`, 'yellow');
        }

        // ROADMAP
        log('  ⬇️  Lade ROADMAP...');
        try {
            const roadmapResponse = await fetch(`${GITHUB_API}/repos/${project.repo}/contents/ROADMAP.md`, {
                headers: {
                    'Accept': 'application/vnd.github.raw',
                    ...(GITHUB_TOKEN ? { 'Authorization': `token ${GITHUB_TOKEN}` } : {})
                }
            });
            if (roadmapResponse.ok) {
                const { marked } = await import('marked');
                const roadmapMarkdown = await roadmapResponse.text();
                cache.roadmapHtml = marked(roadmapMarkdown);
                log(`  ✓ ROADMAP geladen und in HTML konvertiert`, 'green');
            } else {
                log('  ⚠ Kein ROADMAP gefunden', 'yellow');
            }
        } catch (error) {
            log(`  ⚠ ROADMAP konnte nicht geladen werden: ${error.message}`, 'yellow');
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
        template = template.replace(/\{\{PROJECT_ID\}\}/g, project.id);

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
                excerpt: frontmatter.excerpt || '',
                content: content.replace(/^---\n[\s\S]*?\n---\n/, '') // Content ohne Frontmatter
            });

            log(`  ✓ ${frontmatter.title}`, 'green');
        }

        // Nach Datum sortieren
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Blog-Index speichern
        const indexPath = path.join(__dirname, '..', 'blog', 'blog-index.json');
        await fs.writeFile(indexPath, JSON.stringify({
            posts: posts.map(p => ({ ...p, content: undefined })) // Content nicht im Index
        }, null, 2));

        log(`  ✓ Blog-Index erstellt: ${posts.length} Posts`, 'green');

        return posts; // Posts mit Content zurückgeben für HTML-Generierung
    } catch (error) {
        log(`  ✗ Fehler: ${error.message}`, 'red');
        return [];
    }
}

// Blog-Post HTML-Seiten generieren
async function generateBlogPostPages(posts) {
    if (!posts || posts.length === 0) {
        log('  ⚠ Keine Posts zum Generieren', 'yellow');
        return;
    }

    log(`\n📄 Generiere Blog-Post HTML-Seiten...`, 'blue');

    try {
        const { marked } = await import('marked');

        // Template laden
        const templatePath = path.join(__dirname, '..', 'blog-post-template.html');
        const template = await fs.readFile(templatePath, 'utf-8');

        for (const post of posts) {
            let html = template;

            // Datum formatieren
            const date = new Date(post.date);
            const formattedDate = date.toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Tags HTML
            let tagsHtml = '';
            if (post.tags && post.tags.length > 0) {
                const tagsList = post.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
                tagsHtml = `<div class="post-tags">${tagsList}</div>`;
            }

            // Author HTML
            const authorHtml = post.author ? `<span>von ${post.author}</span>` : '';

            // Markdown zu HTML
            let contentHtml = marked(post.content || '');

            // GitHub @mentions mit Avatar und Profil-Link
            contentHtml = contentHtml.replace(
                /@([a-zA-Z0-9_-]+)/g,
                (match, username) => {
                    // Avatar und Name als separate Links
                    return `<a href="https://github.com/${username}" target="_blank" rel="noopener noreferrer" class="user-avatar-link"><img src="https://github.com/${username}.png" width="16" height="16" alt="@${username}" class="user-avatar" loading="lazy"></a><a href="https://github.com/${username}" target="_blank" rel="noopener noreferrer" class="user-mention">@${username}</a>`;
                }
            );

            // Alle externen Links bekommen target="_blank"
            contentHtml = contentHtml.replace(
                /<a href="(https?:\/\/[^"]+)"([^>]*)>/gi,
                (match, url, rest) => {
                    // Wenn target schon gesetzt ist, nicht ändern
                    if (rest.includes('target=')) return match;
                    // Überspringe user-mention Links
                    if (rest.includes('user-mention')) return match;
                    return `<a href="${url}" target="_blank" rel="noopener noreferrer"${rest}>`;
                }
            );

            // Platzhalter ersetzen
            html = html.replace(/\{\{POST_TITLE\}\}/g, post.title);
            html = html.replace(/\{\{POST_EXCERPT\}\}/g, post.excerpt || post.title);
            html = html.replace(/\{\{POST_DATE\}\}/g, post.date);
            html = html.replace(/\{\{POST_DATE_FORMATTED\}\}/g, formattedDate);
            html = html.replace(/\{\{POST_AUTHOR\}\}/g, authorHtml);
            html = html.replace(/\{\{POST_TAGS\}\}/g, tagsHtml);
            html = html.replace(/\{\{POST_CONTENT\}\}/g, contentHtml);
            html = html.replace(/\{\{POST_SLUG\}\}/g, post.slug);

            // Speichern
            const outputPath = path.join(__dirname, '..', 'blog', 'posts', `${post.slug}.html`);
            await fs.writeFile(outputPath, html);

            log(`  ✓ ${post.title}`, 'green');
        }

        log(`  ✓ ${posts.length} Blog-Post Seiten erstellt`, 'green');
    } catch (error) {
        log(`  ✗ Fehler: ${error.message}`, 'red');
    }
}

// Sitemap.xml generieren für SEO
async function generateSitemap(projects, posts) {
    log(`\n🗺️  Generiere Sitemap.xml...`, 'blue');

    try {
        const baseUrl = 'https://muggelbude.it';
        const now = new Date().toISOString().split('T')[0];

        let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Hauptseite
        sitemap += '  <url>\n';
        sitemap += `    <loc>${baseUrl}/</loc>\n`;
        sitemap += `    <lastmod>${now}</lastmod>\n`;
        sitemap += '    <changefreq>weekly</changefreq>\n';
        sitemap += '    <priority>1.0</priority>\n';
        sitemap += '  </url>\n';

        // Blog-Posts
        if (posts && posts.length > 0) {
            for (const post of posts) {
                sitemap += '  <url>\n';
                sitemap += `    <loc>${baseUrl}/blog/posts/${post.slug}.html</loc>\n`;
                sitemap += `    <lastmod>${post.date || now}</lastmod>\n`;
                sitemap += '    <changefreq>monthly</changefreq>\n';
                sitemap += '    <priority>0.8</priority>\n';
                sitemap += '  </url>\n';
            }
        }

        // Projekt-Seiten
        if (projects && projects.length > 0) {
            for (const project of projects) {
                sitemap += '  <url>\n';
                sitemap += `    <loc>${baseUrl}/projects/${project.id}.html</loc>\n`;
                sitemap += `    <lastmod>${now}</lastmod>\n`;
                sitemap += '    <changefreq>monthly</changefreq>\n';
                sitemap += '    <priority>0.7</priority>\n';
                sitemap += '  </url>\n';
            }
        }

        sitemap += '</urlset>';

        // Sitemap speichern
        const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
        await fs.writeFile(sitemapPath, sitemap);

        log(`  ✓ Sitemap.xml erstellt mit ${1 + (posts?.length || 0) + (projects?.length || 0)} URLs`, 'green');
    } catch (error) {
        log(`  ✗ Fehler: ${error.message}`, 'red');
    }
}

// RSS Feed generieren für Blog
async function generateRssFeed(posts) {
    log(`\n📡 Generiere RSS Feed...`, 'blue');

    try {
        const baseUrl = 'https://muggelbude.it';
        const now = new Date().toUTCString();

        let rss = '<?xml version="1.0" encoding="UTF-8"?>\n';
        rss += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
        rss += '  <channel>\n';
        rss += '    <title>Nicolettas-Muggelbude Blog</title>\n';
        rss += '    <link>https://muggelbude.it/</link>\n';
        rss += '    <description>Portfolio &amp; Blog von Nicoletta - Linux, Automation, Entwicklung</description>\n';
        rss += '    <language>de</language>\n';
        rss += `    <lastBuildDate>${now}</lastBuildDate>\n`;
        rss += `    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>\n`;

        // Blog-Posts
        if (posts && posts.length > 0) {
            for (const post of posts) {
                const pubDate = new Date(post.date).toUTCString();
                const link = `${baseUrl}/blog/posts/${post.slug}.html`;

                rss += '    <item>\n';
                rss += `      <title>${escapeXml(post.title)}</title>\n`;
                rss += `      <link>${link}</link>\n`;
                rss += `      <guid>${link}</guid>\n`;
                rss += `      <pubDate>${pubDate}</pubDate>\n`;
                if (post.author) {
                    rss += `      <author>noreply@muggelbude.it (${post.author})</author>\n`;
                }
                if (post.excerpt) {
                    rss += `      <description>${escapeXml(post.excerpt)}</description>\n`;
                }
                // Tags als categories
                if (post.tags && post.tags.length > 0) {
                    post.tags.forEach(tag => {
                        rss += `      <category>${escapeXml(tag)}</category>\n`;
                    });
                }
                rss += '    </item>\n';
            }
        }

        rss += '  </channel>\n';
        rss += '</rss>';

        const feedPath = path.join(__dirname, '..', 'feed.xml');
        await fs.writeFile(feedPath, rss);

        log(`  ✓ RSS Feed erstellt mit ${posts?.length || 0} Posts`, 'green');
    } catch (error) {
        log(`  ✗ Fehler: ${error.message}`, 'red');
    }
}

// XML Escape Helper
function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// HTML-Sitemap generieren für Besucher
async function generateHtmlSitemap(projects, posts) {
    log(`\n📄 Generiere HTML-Sitemap...`, 'blue');

    try {
        let html = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Sitemap - Übersicht aller Seiten auf Nicolettas-Muggelbude">
    <title>Sitemap | Nicolettas-Muggelbude</title>
    <link rel="stylesheet" href="css/styles.css">

    <!-- Theme Setup -->
    <script>
        (function() {
            const theme = localStorage.getItem('theme') ||
                         (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            document.documentElement.setAttribute('data-theme', theme);
        })();
    </script>
</head>
<body>
    <header>
        <div class="container">
            <h1>Nicolettas-Muggelbude</h1>
            <button class="hamburger" aria-label="Menu" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <nav>
                <a href="index.html#projekte">Projekte</a>
                <a href="index.html#blog">Blog</a>
                <a href="https://github.com/nicolettas-muggelbude" target="_blank">GitHub</a>
            </nav>
        </div>
    </header>

    <div class="nav-overlay"></div>

    <main>
        <div class="container">
            <h1>Sitemap</h1>
            <p style="color: var(--text-secondary); margin-bottom: 2rem;">Übersicht aller Seiten auf dieser Website</p>

            <section style="margin-bottom: 3rem;">
                <h2 style="margin-bottom: 1rem;">Hauptseite</h2>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 0.5rem;">
                        <a href="index.html" style="color: var(--accent); text-decoration: none; font-weight: 500;">
                            🏠 Startseite - Portfolio & Blog
                        </a>
                    </li>
                </ul>
            </section>

            <section style="margin-bottom: 3rem;">
                <h2 style="margin-bottom: 1rem;">Blog-Beiträge (${posts?.length || 0})</h2>
                <ul style="list-style: none; padding: 0;">`;

        // Blog-Posts
        if (posts && posts.length > 0) {
            for (const post of posts) {
                const date = new Date(post.date).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                html += `
                    <li style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
                        <a href="blog/posts/${post.slug}.html" style="color: var(--accent); text-decoration: none; font-weight: 600; font-size: 1.1rem;">
                            📝 ${post.title}
                        </a>
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.25rem;">
                            ${date}
                        </div>
                        ${post.excerpt ? `<div style="color: var(--text-secondary); margin-top: 0.5rem;">${post.excerpt}</div>` : ''}
                    </li>`;
            }
        }

        html += `
                </ul>
            </section>

            <section style="margin-bottom: 3rem;">
                <h2 style="margin-bottom: 1rem;">Projekte (${projects?.length || 0})</h2>
                <ul style="list-style: none; padding: 0;">`;

        // Projekte
        if (projects && projects.length > 0) {
            for (const project of projects) {
                html += `
                    <li style="margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
                        <a href="projects/${project.id}.html" style="color: var(--accent); text-decoration: none; font-weight: 600; font-size: 1.1rem;">
                            🚀 ${project.name}
                        </a>
                        ${project.description ? `<div style="color: var(--text-secondary); margin-top: 0.5rem;">${project.description}</div>` : ''}
                    </li>`;
            }
        }

        html += `
                </ul>
            </section>
        </div>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2025 Nicoletta | <a href="https://github.com/nicolettas-muggelbude" target="_blank">GitHub</a></p>
        </div>
    </footer>

    <script type="module" src="js/theme.js"></script>
    <script type="module" src="js/navigation.js"></script>
</body>
</html>`;

        const htmlSitemapPath = path.join(__dirname, '..', 'sitemap.html');
        await fs.writeFile(htmlSitemapPath, html);

        log(`  ✓ HTML-Sitemap erstellt mit ${1 + (posts?.length || 0) + (projects?.length || 0)} Seiten`, 'green');
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

        // Blog-Index erstellen und HTML-Seiten generieren
        const posts = await buildBlogIndex();
        await generateBlogPostPages(posts);

        // Sitemap.xml generieren
        await generateSitemap(projects, posts);

        // HTML-Sitemap generieren
        await generateHtmlSitemap(projects, posts);

        // RSS Feed generieren
        await generateRssFeed(posts);

        log('\n✅ Build erfolgreich abgeschlossen!\n', 'green');
    } catch (error) {
        log(`\n❌ Build fehlgeschlagen: ${error.message}\n`, 'red');
        process.exit(1);
    }
}

// Script ausführen
build();
