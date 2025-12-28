// Simple Markdown to HTML Parser
// Für Produktion: marked.js oder markdown-it verwenden

export function markdownToHtml(markdown) {
    if (!markdown) return '';

    let html = markdown;

    // Escaping für HTML (Sicherheit)
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    // Code Blocks (```)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang || 'text'}">${escapeHtml(code.trim())}</code></pre>`;
    });

    // Inline Code (`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');

    // Unordered Lists
    html = html.replace(/^\* (.+)$/gim, '<li>$1</li>');
    html = html.replace(/^- (.+)$/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Ordered Lists
    html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');

    // Horizontal Rules
    html = html.replace(/^---$/gim, '<hr>');
    html = html.replace(/^\*\*\*$/gim, '<hr>');

    // Line Breaks -> Paragraphs
    html = html.split('\n\n').map(para => {
        // Überspringe bereits gerenderte Block-Elemente
        if (para.match(/^<(h[1-6]|ul|ol|pre|blockquote|hr)/)) {
            return para;
        }
        if (para.trim()) {
            return `<p>${para.trim()}</p>`;
        }
        return '';
    }).join('\n');

    return html;
}

// Extrahiert Frontmatter aus Markdown (YAML-Format)
export function parseFrontmatter(markdown) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = markdown.match(frontmatterRegex);

    if (!match) {
        return {
            metadata: {},
            content: markdown
        };
    }

    const frontmatterText = match[1];
    const content = match[2];

    // Einfaches YAML Parsing (für komplexere Fälle: js-yaml verwenden)
    const metadata = {};
    frontmatterText.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
            let value = valueParts.join(':').trim();

            // Arrays erkennen [tag1, tag2]
            if (value.startsWith('[') && value.endsWith(']')) {
                value = value.slice(1, -1).split(',').map(v => v.trim());
            }

            // Strings ohne Quotes
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1);
            }

            metadata[key.trim()] = value;
        }
    });

    return { metadata, content };
}

// Extrahiert alle Bilder aus HTML
export function extractImages(html) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const images = tempDiv.querySelectorAll('img');
    return Array.from(images).map(img => ({
        src: img.src,
        alt: img.alt || 'Bild'
    }));
}

export default {
    markdownToHtml,
    parseFrontmatter,
    extractImages
};
