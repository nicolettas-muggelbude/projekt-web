// Theme Management für Dark/Light Mode
class ThemeManager {
    constructor() {
        this.theme = this.getInitialTheme();
        this.init();
    }

    getInitialTheme() {
        // 1. Prüfe ob User bereits eine Präferenz gespeichert hat
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme;

        // 2. Nutze System-Präferenz
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        // 3. Fallback: Light Mode
        return 'light';
    }

    init() {
        // Theme anwenden
        this.applyTheme(this.theme);

        // Toggle Button erstellen
        this.createToggleButton();

        // System-Theme-Änderungen überwachen
        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', (e) => {
                // Nur wenn User keine manuelle Präferenz hat
                if (!localStorage.getItem('theme')) {
                    this.theme = e.matches ? 'dark' : 'light';
                    this.applyTheme(this.theme);
                }
            });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.updateToggleIcon(theme);
    }

    createToggleButton() {
        const button = document.createElement('button');
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Theme umschalten');
        button.innerHTML = this.theme === 'dark' ? '☀️' : '🌙';

        button.addEventListener('click', () => this.toggle());

        document.body.appendChild(button);
        this.toggleButton = button;
    }

    updateToggleIcon(theme) {
        if (this.toggleButton) {
            this.toggleButton.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    toggle() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.theme);
        localStorage.setItem('theme', this.theme);
    }
}

// Initialisieren sobald DOM bereit ist
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ThemeManager();
    });
} else {
    new ThemeManager();
}

export default ThemeManager;
