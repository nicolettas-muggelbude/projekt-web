// Blog System
import { parseFrontmatter, markdownToHtml } from './markdown-parser.js';

class BlogManager {
    constructor() {
        this.posts = [];
        this.container = document.getElementById('blog-posts');
        this.init();
    }

    async init() {
        try {
            await this.loadPosts();
            this.renderPosts();
        } catch (error) {
            console.error('Fehler beim Laden der Blog-Posts:', error);
            this.showError('Blog-Posts konnten nicht geladen werden.');
        }
    }

    async loadPosts() {
        try {
            // Blog-Index laden (wird vom Build-Script generiert)
            const response = await fetch('blog/blog-index.json');

            if (!response.ok) {
                console.warn('blog-index.json nicht gefunden, versuche Fallback...');
                this.posts = [];
                return;
            }

            const data = await response.json();

            // Nach Datum sortieren (neueste zuerst)
            this.posts = data.posts.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });
        } catch (error) {
            console.warn('Blog-Index konnte nicht geladen werden:', error);
            this.posts = [];
        }
    }

    renderPosts() {
        if (!this.container) {
            console.warn('Blog-Posts Container nicht gefunden');
            return;
        }

        if (this.posts.length === 0) {
            this.container.innerHTML = `
                <div class="blog-post">
                    <h3>Noch keine Blog-Posts</h3>
                    <p class="excerpt">
                        Blog-Posts werden in <code>blog/posts/</code> als Markdown-Dateien erstellt.
                        Nach dem nächsten Build erscheinen sie hier automatisch.
                    </p>
                </div>
            `;
            return;
        }

        this.container.innerHTML = '';

        // Zeige die neuesten 5 Posts auf der Hauptseite
        const displayPosts = this.posts.slice(0, 5);

        displayPosts.forEach(post => {
            const postElement = this.createPostElement(post);
            this.container.appendChild(postElement);
        });

        // "Alle Posts anzeigen" Link wenn mehr als 5 Posts
        if (this.posts.length > 5) {
            const moreLink = document.createElement('div');
            moreLink.style.textAlign = 'center';
            moreLink.style.marginTop = 'var(--spacing-md)';
            moreLink.innerHTML = '<a href="blog.html" class="btn">Alle Blog-Posts anzeigen →</a>';
            this.container.appendChild(moreLink);
        }
    }

    createPostElement(post) {
        const article = document.createElement('article');
        article.className = 'blog-post';

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

        article.innerHTML = `
            <h3><a href="blog/posts/${post.slug}.html">${post.title}</a></h3>
            <div class="post-meta">
                <time datetime="${post.date}">${formattedDate}</time>
                ${post.author ? `<span>von ${post.author}</span>` : ''}
            </div>
            ${post.excerpt ? `<p class="excerpt">${post.excerpt}</p>` : ''}
            ${tagsHtml}
            <a href="blog/posts/${post.slug}.html" class="read-more">Weiterlesen →</a>
        `;

        return article;
    }

    showError(message) {
        if (this.container) {
            this.container.innerHTML = `<p class="error">${message}</p>`;
        }
    }
}

// Initialisieren nur wenn auf Hauptseite
if (document.getElementById('blog-posts')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new BlogManager();
        });
    } else {
        new BlogManager();
    }
}

export default BlogManager;
