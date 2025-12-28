// Mobile Navigation Handler
class NavigationManager {
    constructor() {
        this.hamburger = document.querySelector('.hamburger');
        this.nav = document.querySelector('nav');
        this.overlay = document.querySelector('.nav-overlay');
        this.navLinks = document.querySelectorAll('nav a');

        if (this.hamburger && this.nav && this.overlay) {
            this.init();
        }
    }

    init() {
        // Hamburger Button Click
        this.hamburger.addEventListener('click', () => this.toggleMenu());

        // Overlay Click (Menu schließen)
        this.overlay.addEventListener('click', () => this.closeMenu());

        // Navigation Links Click (Menu schließen)
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });

        // ESC Taste (Menu schließen)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.nav.classList.contains('active')) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        const isActive = this.nav.classList.contains('active');

        if (isActive) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.nav.classList.add('active');
        this.hamburger.classList.add('active');
        this.overlay.classList.add('active');
        this.hamburger.setAttribute('aria-expanded', 'true');

        // Verhindere Scrollen wenn Menu offen
        document.body.style.overflow = 'hidden';
    }

    closeMenu() {
        this.nav.classList.remove('active');
        this.hamburger.classList.remove('active');
        this.overlay.classList.remove('active');
        this.hamburger.setAttribute('aria-expanded', 'false');

        // Erlaube Scrollen wieder
        document.body.style.overflow = '';
    }
}

// Initialisieren
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new NavigationManager();
    });
} else {
    new NavigationManager();
}

export default NavigationManager;
