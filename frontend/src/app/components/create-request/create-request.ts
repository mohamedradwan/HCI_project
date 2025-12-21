import { Component, inject, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { ApiService } from '../../services/api';
import { AuthService } from '../../services/auth.service';
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
  selector: 'app-create-request',
  standalone: true,
  imports: [NavBarComponent, ButtonComponent, ReactiveFormsModule, NgFor, NgIf, NgClass],
  templateUrl: './create-request.component.html',
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
export class CreateRequestComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private map: L.Map | undefined;
  private marker: L.Marker | undefined;

  currentStep = signal(1);
  mode = signal<'request' | 'offering' | null>(null);
  requestForm: FormGroup;
  isSubmitting = signal(false);
  errorMessage = signal('');

  // Address-related signals
  selectedAddress = signal<{
    display: string;
    street?: string;
    city?: string;
    country?: string;
    coordinates: string;
  } | null>(null);
  isLoadingAddress = signal(false);

  steps = computed(() => {
    const baseSteps = [
      { number: 1, title: 'I want to...' }
    ];
    
    if (this.mode() === 'request') {
      return [
        ...baseSteps,
        { number: 2, title: 'Basic Info' },
        { number: 3, title: 'Details' },
        { number: 4, title: 'Location & Time' },
        { number: 5, title: 'Review' }
      ];
    } else if (this.mode() === 'offering') {
      return [
        ...baseSteps,
        { number: 2, title: 'Service Details' },
        { number: 3, title: 'Price & Describe' },
        { number: 4, title: 'Review' }
      ];
    }
    return baseSteps;
  });

  categories = ['Transportation', 'Home Repairs', 'Tutoring', 'Delivery', 'Cleaning', 'Other Services'];

  progressWidth = computed(() => {
    const totalSteps = this.steps().length;
    if (totalSteps <= 1) return 0;
    return ((this.currentStep() - 1) / (totalSteps - 1)) * 100;
  });

  pageTitle = computed(() => {
    if (this.currentStep() === 1) return 'Choose Action';
    return this.mode() === 'request' ? 'Create Service Request' : 'Post Service Offering';
  });

  pageDescription = computed(() => {
    if (this.currentStep() === 1) return 'Would you like to request help or offer your services?';
    return this.mode() === 'request' ? 'Fill in the details to post your request' : 'Fill in the details to offer your service';
  });

  constructor() {
    this.requestForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      budget: [''], // Will add/remove validator based on mode
      location: [''], // Mode-specific
      date: [''], // Request-only
      time: [''], // Request-only
      urgent: [false]
    });

    effect(() => {
      const isOpen = this.isMapModalOpen();
      if (isOpen) {
        setTimeout(() => {
          this.initMap();
        }, 150);
      } else {
        if (this.map) {
          this.map.remove();
          this.map = undefined;
          this.marker = undefined;
        }
      }
    });
  }

  isMapModalOpen = signal(false);

  openMapModal(): void {
    this.isMapModalOpen.set(true);
  }

  closeMapModal(): void {
    this.isMapModalOpen.set(false);
  }

  confirmLocation(): void {
    const addr = this.selectedAddress();
    if (addr) {
      this.requestForm.patchValue({
        location: addr.display
      });
    }
    this.closeMapModal();
  }

  setMode(mode: 'request' | 'offering'): void {
    this.mode.set(mode);
    const budgetControl = this.requestForm.get('budget');
    const locationControl = this.requestForm.get('location');
    const dateControl = this.requestForm.get('date');
    const timeControl = this.requestForm.get('time');

    if (mode === 'request') {
      budgetControl?.setValidators([Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]);
      locationControl?.setValidators([Validators.required]);
      dateControl?.setValidators([Validators.required]);
      timeControl?.setValidators([Validators.required]);
    } else {
      budgetControl?.setValidators([Validators.required]); // For offering, it's the price string
      locationControl?.clearValidators();
      dateControl?.clearValidators();
      timeControl?.clearValidators();
    }
    
    budgetControl?.updateValueAndValidity();
    locationControl?.updateValueAndValidity();
    dateControl?.updateValueAndValidity();
    timeControl?.updateValueAndValidity();
    
    this.nextStep();
  }

  nextStep(): void {
    const totalSteps = this.steps().length;
    if (this.currentStep() < totalSteps) {
      if (!this.validateCurrentStep()) {
        return;
      }
      this.currentStep.update(v => v + 1);
    } else {
      this.submitRequest();
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      if (this.currentStep() === 2) {
        this.mode.set(null);
      }
      this.currentStep.update(v => v - 1);
      this.errorMessage.set('');
    }
  }

  private initMap(): void {
    if (this.map) return;

    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    this.map = L.map('map', {
      zoomControl: false
    }).setView([30.0444, 31.2357], 13);

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Use a beautiful map style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.updateMarker(e.latlng.lat, e.latlng.lng);
    });

    // Restore previous marker if exists
    const addr = this.selectedAddress();
    if (addr && addr.coordinates) {
      const [lat, lng] = addr.coordinates.split(',').map((s: string) => parseFloat(s.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        this.placeMarker(lat, lng);
        this.map.setView([lat, lng], 15);
      }
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
      // Reverse geocoding using OpenStreetMap Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en'
          }
        }
      );
      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;
        const street = addr.road || addr.pedestrian || addr.street || '';
        const houseNumber = addr.house_number || '';
        const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || '';
        const city = addr.city || addr.town || addr.village || addr.county || '';
        const country = addr.country || '';

        let displayParts: string[] = [];
        if (houseNumber && street) displayParts.push(`${houseNumber} ${street}`);
        else if (street) displayParts.push(street);
        if (neighborhood) displayParts.push(neighborhood);
        if (city) displayParts.push(city);

        this.selectedAddress.set({
          display: displayParts.length > 0 ? displayParts.join(', ') : data.display_name,
          street: street ? `${houseNumber} ${street}`.trim() : undefined,
          city: city || undefined,
          country: country || undefined,
          coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
      } else {
        this.selectedAddress.set({
          display: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      this.selectedAddress.set({
        display: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      });
    } finally {
      this.isLoadingAddress.set(false);
    }
  }

  validateCurrentStep(): boolean {
    if (this.currentStep() === 1) return this.mode() !== null;

    const step = this.currentStep();
    const mode = this.mode();
    let fieldsToValidate: string[] = [];

    if (mode === 'request') {
      switch (step) {
        case 2: fieldsToValidate = ['title', 'category']; break;
        case 3: fieldsToValidate = ['description', 'budget']; break;
        case 4: fieldsToValidate = ['location', 'date', 'time']; break;
      }
    } else {
      switch (step) {
        case 2: fieldsToValidate = ['title', 'category']; break;
        case 3: fieldsToValidate = ['description', 'budget']; break; // budget is price here
      }
    }

    let isValid = true;
    fieldsToValidate.forEach(field => {
      const control = this.requestForm.get(field);
      if (control && control.invalid) {
        control.markAsTouched();
        isValid = false;
      }
    });

    if (!isValid) {
      this.errorMessage.set('Please fill in all required fields');
    } else {
      this.errorMessage.set('');
    }

    return isValid;
  }

  submitRequest(): void {
    if (!this.requestForm.valid) {
      this.errorMessage.set('Please complete all fields');
      return;
    }

    const userId = this.authService.getCurrentUserId();
    if (!userId) {
      this.errorMessage.set('Please log in to proceed');
      this.router.navigate(['/auth']);
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const formValue = this.requestForm.value;

    if (this.mode() === 'request') {
      this.apiService.createRequest({
        title: formValue.title,
        category: formValue.category,
        description: formValue.description,
        budget: formValue.budget,
        location: formValue.location,
        date: formValue.date,
        time: formValue.time,
        urgent: formValue.urgent
      }).subscribe({
        next: () => this.router.navigate(['/home']),
        error: () => this.handleError()
      });
    } else {
      this.apiService.createServiceOffering(userId, {
        title: formValue.title,
        category: formValue.category,
        description: formValue.description,
        price: formValue.budget // Form field is budget, but it's price for offering
      }).subscribe({
        next: () => this.router.navigate(['/admin-dashboard']),
        error: () => this.handleError()
      });
    }
  }

  private handleError(): void {
    this.errorMessage.set('Submission failed. Please try again.');
    this.isSubmitting.set(false);
  }

  navigate(screen: string): void {
    this.router.navigate([`/${screen}`]);
  }
}
