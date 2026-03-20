async function loadAllPosts() {
    const container = document.getElementById('blog-posts');
    try {
        const response = await fetch('blog/blog-index.json');
        if (!response.ok) throw new Error('blog-index.json nicht gefunden');
        const data = await response.json();

        const posts = data.posts.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (posts.length === 0) {
            container.innerHTML = '<p>Noch keine Blog-Posts vorhanden.</p>';
            return;
        }

        container.innerHTML = '';
        posts.forEach(post => {
            const date = new Date(post.date);
            const formattedDate = date.toLocaleDateString('de-DE', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
            const tagsHtml = post.tags && post.tags.length > 0
                ? `<div class="post-tags">${post.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`
                : '';

            const article = document.createElement('article');
            article.className = 'blog-post';
            article.innerHTML = `
                <h3><a href="blog/posts/${post.slug}.html">${post.title}</a></h3>
                <div class="post-meta">
                    <time datetime="${post.date}">${formattedDate}</time>
                    ${post.author ? `<span>von ${post.author}</span>` : ''}
                </div>
                ${post.excerpt ? `<p class="excerpt">${post.excerpt}</p>` : ''}
                ${tagsHtml}
                <a href="blog/posts/${post.slug}.html" class="read-more">Weiterlesen &rarr;</a>
            `;
            container.appendChild(article);
        });
    } catch (error) {
        container.innerHTML = '<p class="error">Blog-Posts konnten nicht geladen werden.</p>';
        console.error(error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllPosts);
} else {
    loadAllPosts();
}
