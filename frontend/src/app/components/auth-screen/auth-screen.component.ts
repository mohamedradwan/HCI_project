// auth-screen.component.ts
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NgIf, NgClass } from '@angular/common';
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
  selector: 'app-auth-screen',
  standalone: true,
  imports: [ButtonComponent, ReactiveFormsModule, NgIf, NgClass],
  templateUrl: './auth-screen.component.html',
  styles: [`
    #signup-map {
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
export class AuthScreenComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLogin = signal(true);
  authForm: FormGroup;
  errorMessage = signal('');
  isLoading = signal(false);

  // Address signals
  selectedAddress = signal<string | null>(null);
  selectedLatitude = signal<number | null>(null);
  selectedLongitude = signal<number | null>(null);
  showMapModal = signal(false);

  constructor() {
    // Login mode starts with minimal validation
    this.authForm = this.fb.group({
      name: [''],
      phone: [''],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      paypalEmail: ['']
    });
  }

  toggleMode(): void {
    this.isLogin.set(!this.isLogin());
    this.errorMessage.set('');

    if (!this.isLogin()) {
      // Signup mode - add all validators
      this.authForm.get('name')?.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(50)]);
      this.authForm.get('phone')?.setValidators([Validators.required, Validators.pattern(/^[0-9]{10,15}$/)]);
      this.authForm.get('email')?.setValidators([Validators.required, Validators.email]);
      this.authForm.get('password')?.setValidators([Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)]);
    } else {
      // Login mode - minimal validators (just required)
      this.authForm.get('name')?.clearValidators();
      this.authForm.get('phone')?.clearValidators();
      this.authForm.get('email')?.setValidators([Validators.required]);
      this.authForm.get('password')?.setValidators([Validators.required]);
    }
    this.authForm.get('name')?.updateValueAndValidity();
    this.authForm.get('phone')?.updateValueAndValidity();
    this.authForm.get('email')?.updateValueAndValidity();
    this.authForm.get('password')?.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    if (!this.authForm.valid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const formValue = this.authForm.value;

      if (this.isLogin()) {
        // Login
        await this.authService.loginWithCredentials(
          formValue.email,
          formValue.password
        );
      } else {
        // Register
        await this.authService.register(
          formValue.name,
          formValue.email,
          formValue.phone,
          formValue.password,
          formValue.paypalEmail || undefined,
          this.selectedLatitude() || undefined,
          this.selectedLongitude() || undefined,
          this.selectedAddress() || undefined
        );
      }

      // Navigate to home on success
      this.router.navigate(['/home']);

    } catch (error: any) {
      console.error('Auth error:', error);
      this.errorMessage.set(
        error.error?.message ||
        error.message ||
        'An error occurred. Please try again.'
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  navigateBack(): void {
    this.router.navigate(['/']);
  }

  getPasswordStrength(): { level: number; label: string; color: string } {
    const password = this.authForm.get('password')?.value || '';

    if (!password) {
      return { level: 0, label: '', color: '' };
    }

    let score = 0;

    // Length checks
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Complexity checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // Map score to levels
    if (score <= 2) {
      return { level: 1, label: 'Weak', color: 'bg-red-500' };
    } else if (score <= 4) {
      return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
    } else if (score <= 5) {
      return { level: 3, label: 'Good', color: 'bg-blue-500' };
    } else {
      return { level: 4, label: 'Strong', color: 'bg-green-500' };
    }
  }

  // Map modal state
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;
  tempAddress = signal<string | null>(null);
  tempLat = signal<number | null>(null);
  tempLng = signal<number | null>(null);
  isLoadingAddress = signal(false);

  // Opens the map picker modal
  openAddressModal(): void {
    this.showMapModal.set(true);
    // Initialize map after modal is visible
    setTimeout(() => {
      this.initMap();
    }, 100);
  }

  closeMapModal(): void {
    this.showMapModal.set(false);
    if (this.map) {
      this.map.remove();
      this.map = undefined;
      this.marker = undefined;
    }
    this.tempAddress.set(null);
    this.tempLat.set(null);
    this.tempLng.set(null);
  }

  private initMap(): void {
    if (this.map) return;

    // Default: Cairo center
    const lat = 30.0444;
    const lng = 31.2357;

    this.map = L.map('signup-map').setView([lat, lng], 12);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.updateMarker(e.latlng.lat, e.latlng.lng);
    });

    // Try to center on user's location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        if (this.map) {
          this.map.setView([position.coords.latitude, position.coords.longitude], 14);
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
        const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || '';
        const city = addr.city || addr.town || addr.village || addr.county || '';

        let displayParts: string[] = [];
        if (street) displayParts.push(street);
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

  confirmLocation(): void {
    if (this.tempAddress() && this.tempLat() && this.tempLng()) {
      this.selectedAddress.set(this.tempAddress());
      this.selectedLatitude.set(this.tempLat());
      this.selectedLongitude.set(this.tempLng());
      this.closeMapModal();
    }
  }
}
