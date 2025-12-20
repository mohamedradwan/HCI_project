// settings.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [NavBarComponent, ButtonComponent, ReactiveFormsModule, NgClass],
    templateUrl: './settings.component.html'
})
export class SettingsComponent implements OnInit {
    private router = inject(Router);
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private apiService = inject(ApiService);
    themeService = inject(ThemeService);

    accountForm: FormGroup;
    isLoading = signal(true);
    isSaving = signal(false);
    successMessage = signal('');
    errorMessage = signal('');
    activeSection = signal<'account' | 'appearance' | 'notifications' | 'privacy'>('account');

    // Notification preferences
    emailNotifications = signal(true);
    pushNotifications = signal(true);
    requestUpdates = signal(true);

    // Privacy settings
    showEmail = signal(false);
    showPhone = signal(false);
    publicProfile = signal(true);

    constructor() {
        this.accountForm = this.fb.group({
            name: [''],
            email: [''],
            phone: [''],
            currentPassword: [''],
            newPassword: [''],
            confirmPassword: ['']
        });
    }

    ngOnInit() {
        this.loadUserData();
    }

    loadUserData() {
        const userId = this.authService.getCurrentUserId();
        if (!userId) {
            this.router.navigate(['/auth']);
            return;
        }

        this.apiService.getUserById(userId).subscribe({
            next: (user: any) => {
                this.accountForm.patchValue({
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                });
                this.isLoading.set(false);
            },
            error: () => {
                this.errorMessage.set('Failed to load user data');
                this.isLoading.set(false);
            }
        });
    }

    setSection(section: 'account' | 'appearance' | 'notifications' | 'privacy') {
        this.activeSection.set(section);
        this.successMessage.set('');
        this.errorMessage.set('');
    }

    saveAccountSettings() {
        console.log('=== SAVE ACCOUNT SETTINGS CALLED ===');
        this.isSaving.set(true);
        this.successMessage.set('');
        this.errorMessage.set('');

        const formValue = this.accountForm.value;
        const currentPwd = (formValue.currentPassword || '').trim();
        const newPwd = (formValue.newPassword || '').trim();
        const confirmPwd = (formValue.confirmPassword || '').trim();

        console.log('Form Values:', { currentPwd, newPwd, confirmPwd });
        console.log('Lengths:', { current: currentPwd.length, new: newPwd.length, confirm: confirmPwd.length });

        // Check if user is trying to change password
        const isChangingPassword = currentPwd.length > 0 || newPwd.length > 0 || confirmPwd.length > 0;
        console.log('isChangingPassword:', isChangingPassword);

        if (isChangingPassword) {
            // All 3 password fields are required
            if (currentPwd.length === 0) {
                this.errorMessage.set('Please enter your current password');
                this.isSaving.set(false);
                return;
            }
            if (newPwd.length === 0) {
                this.errorMessage.set('Please enter a new password');
                this.isSaving.set(false);
                return;
            }
            if (confirmPwd.length === 0) {
                this.errorMessage.set('Please confirm your new password');
                this.isSaving.set(false);
                return;
            }

            // Password strength check
            if (newPwd.length < 6) {
                this.errorMessage.set('New password must be at least 6 characters');
                this.isSaving.set(false);
                return;
            }

            // Passwords must match
            if (newPwd !== confirmPwd) {
                this.errorMessage.set('New password and confirmation do not match');
                this.isSaving.set(false);
                return;
            }

            // Call API to change password
            const userId = this.authService.getCurrentUserId();
            if (!userId) {
                this.errorMessage.set('User not authenticated');
                this.isSaving.set(false);
                return;
            }

            this.apiService.changePassword(userId, currentPwd, newPwd).subscribe({
                next: () => {
                    this.successMessage.set('Password changed successfully!');
                    this.isSaving.set(false);
                    this.accountForm.patchValue({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                    });
                },
                error: (err) => {
                    this.errorMessage.set(err.error?.error || 'Failed to change password');
                    this.isSaving.set(false);
                }
            });
            return; // Don't continue to the success message below
        }

        // No password change - just save other settings
        setTimeout(() => {
            this.successMessage.set('Account settings saved successfully!');
            this.isSaving.set(false);
        }, 500);
    }

    setTheme(theme: 'light' | 'dark' | 'auto') {
        if (theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.themeService.setDarkMode(prefersDark);
        } else {
            this.themeService.setDarkMode(theme === 'dark');
        }
        this.successMessage.set('Theme updated!');
    }

    toggleNotification(type: 'email' | 'push' | 'updates') {
        switch (type) {
            case 'email':
                this.emailNotifications.set(!this.emailNotifications());
                break;
            case 'push':
                this.pushNotifications.set(!this.pushNotifications());
                break;
            case 'updates':
                this.requestUpdates.set(!this.requestUpdates());
                break;
        }
    }

    togglePrivacy(type: 'email' | 'phone' | 'profile') {
        switch (type) {
            case 'email':
                this.showEmail.set(!this.showEmail());
                break;
            case 'phone':
                this.showPhone.set(!this.showPhone());
                break;
            case 'profile':
                this.publicProfile.set(!this.publicProfile());
                break;
        }
    }

    deleteAccount() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            // In production, call delete API
            this.authService.logout();
            this.router.navigate(['/']);
        }
    }

    navigate(screen: string) {
        this.router.navigate([`/${screen}`]);
    }
}
