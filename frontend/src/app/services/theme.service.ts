import { Injectable, signal, effect } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private readonly THEME_KEY = '5alasly-theme';

    isDarkMode = signal(false);

    constructor() {
        // Load saved preference or system preference
        const saved = localStorage.getItem(this.THEME_KEY);
        if (saved) {
            this.isDarkMode.set(saved === 'dark');
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.isDarkMode.set(prefersDark);
        }

        // Apply theme on changes
        effect(() => {
            this.applyTheme(this.isDarkMode());
        });
    }

    toggle(): void {
        this.isDarkMode.update(v => !v);
    }

    setDarkMode(isDark: boolean): void {
        this.isDarkMode.set(isDark);
    }

    private applyTheme(isDark: boolean): void {
        const html = document.documentElement;
        if (isDark) {
            html.classList.add('dark');
            localStorage.setItem(this.THEME_KEY, 'dark');
        } else {
            html.classList.remove('dark');
            localStorage.setItem(this.THEME_KEY, 'light');
        }
    }
}
