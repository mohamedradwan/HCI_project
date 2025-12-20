// settings.component.ts
import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api';
import { NgClass, NgIf } from '@angular/common';
import * as L from 'leaflet';

// Custom marker icon to fix default icon issue
const customIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [NavBarComponent, ButtonComponent, ReactiveFormsModule, NgClass, NgIf],
    templateUrl: './settings.component.html',
    styles: [`
        #map {
          height: 100%;
          width: 100%;
          display: block;
          z-index: 1;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `]
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

    // PayPal settings
    paypalEmail = signal<string | null>(null);
    isLinkingPayPal = signal(false);
    newPayPalEmail = signal('');

    // Address/Location settings
    userAddress = signal<string | null>(null);
    userLatitude = signal<number | null>(null);
    userLongitude = signal<number | null>(null);

    // Map Modal signals
    showMapModal = signal(false);
    isLoadingAddress = signal(false);
    tempAddress = signal<string>('');
    tempLat = signal<number | null>(null);
    tempLng = signal<number | null>(null);

    private map: L.Map | undefined;
    private marker: L.Marker | undefined;

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
                this.paypalEmail.set(user.paypalEmail || null);
                this.userAddress.set(user.address || null);
                this.userLatitude.set(user.latitude || null);
                this.userLongitude.set(user.longitude || null);
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

    // PayPal methods
    linkPayPal() {
        const email = this.newPayPalEmail().trim();
        if (!email) {
            this.errorMessage.set('Please enter a PayPal email');
            return;
        }

        // Basic email validation
        if (!email.includes('@')) {
            this.errorMessage.set('Please enter a valid email address');
            return;
        }

        this.isLinkingPayPal.set(true);
        this.errorMessage.set('');

        const userId = this.authService.getCurrentUserId();
        if (!userId) return;

        this.apiService.updatePayPalEmail(userId, email).subscribe({
            next: () => {
                this.paypalEmail.set(email);
                this.newPayPalEmail.set('');
                this.isLinkingPayPal.set(false);
                this.successMessage.set('PayPal account linked successfully!');
            },
            error: (err) => {
                this.errorMessage.set(err.error?.error || 'Failed to link PayPal');
                this.isLinkingPayPal.set(false);
            }
        });
    }

    unlinkPayPal() {
        if (!confirm('Are you sure you want to unlink your PayPal account?')) {
            return;
        }

        const userId = this.authService.getCurrentUserId();
        if (!userId) return;

        this.apiService.updatePayPalEmail(userId, null).subscribe({
            next: () => {
                this.paypalEmail.set(null);
                this.successMessage.set('PayPal account unlinked');
            },
            error: (err) => {
                this.errorMessage.set(err.error?.error || 'Failed to unlink PayPal');
            }
        });
    }

    maskEmail(email: string): string {
        const [local, domain] = email.split('@');
        const maskedLocal = local.substring(0, 2) + '***';
        return `${maskedLocal}@${domain}`;
    }

    // Map Modal Methods
    openMapModal() {
        this.showMapModal.set(true);
        // Initialize map after modal is visible
        setTimeout(() => {
            this.initMap();
        }, 100);
    }

    closeMapModal() {
        this.showMapModal.set(false);
        if (this.map) {
            this.map.remove();
            this.map = undefined;
            this.marker = undefined;
        }
    }

    private initMap(): void {
        if (this.map) return;

        // Default: Cairo coordinates or user's current location
        let lat = this.userLatitude() || 30.0444;
        let lng = this.userLongitude() || 31.2357;

        this.map = L.map('map').setView([lat, lng], 13);

        L.control.zoom({ position: 'bottomright' }).addTo(this.map);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);

        this.map.on('click', (e: L.LeafletMouseEvent) => {
            this.updateMarker(e.latlng.lat, e.latlng.lng);
        });

        // Place initial marker
        if (this.userLatitude() && this.userLongitude()) {
            this.placeMarker(this.userLatitude()!, this.userLongitude()!);
            this.map.setView([this.userLatitude()!, this.userLongitude()!], 15);
        } else if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                if (this.map && !this.marker) {
                    this.map.setView([position.coords.latitude, position.coords.longitude], 15);
                }
            });
        }
    }

    private placeMarker(lat: number, lng: number): void {
        if (!this.map) return;

        if (this.marker) {
            this.map.removeLayer(this.marker);
        }

        this.marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
    }

    private async updateMarker(lat: number, lng: number) {
        if (!this.map) return;

        this.placeMarker(lat, lng);
        this.isLoadingAddress.set(true);

        try {
            // Reverse geocoding
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await response.json();

            if (data && data.address) {
                const addr = data.address;
                const street = addr.road || addr.pedestrian || addr.street || '';
                const houseNumber = addr.house_number || '';
                const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || '';
                const city = addr.city || addr.town || addr.village || addr.county || '';

                let displayParts: string[] = [];
                if (houseNumber && street) displayParts.push(`${houseNumber} ${street}`);
                else if (street) displayParts.push(street);
                if (neighborhood) displayParts.push(neighborhood);
                if (city) displayParts.push(city);

                const address = displayParts.length > 0 ? displayParts.join(', ') : data.display_name;

                this.tempAddress.set(address);
                this.tempLat.set(lat);
                this.tempLng.set(lng);
            } else {
                this.tempAddress.set(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                this.tempLat.set(lat);
                this.tempLng.set(lng);
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            this.tempAddress.set(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            this.tempLat.set(lat);
            this.tempLng.set(lng);
        } finally {
            this.isLoadingAddress.set(false);
        }
    }

    confirmLocation() {
        const lat = this.tempLat();
        const lng = this.tempLng();
        const address = this.tempAddress();

        if (lat && lng && address) {
            this.saveUserLocation(lat, lng, address);
            this.closeMapModal();
        }
    }

    private saveUserLocation(lat: number, lng: number, address: string): void {
        const userId = this.authService.getCurrentUserId();
        if (!userId) return;

        this.apiService.updateAddress(userId, lat, lng, address).subscribe({
            next: () => {
                this.userAddress.set(address);
                this.userLatitude.set(lat);
                this.userLongitude.set(lng);
                this.successMessage.set('Location updated successfully!');
                setTimeout(() => this.successMessage.set(''), 3000);
            },
            error: (err) => {
                console.error('Error updating location:', err);
                this.errorMessage.set('Failed to update location.');
            }
        });
    }
}
