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

  steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Details' },
    { number: 3, title: 'Location & Time' },
    { number: 4, title: 'Review' }
  ];

  categories = ['Transportation', 'Home Repairs', 'Tutoring', 'Delivery', 'Cleaning', 'Other Services'];

  progressWidth = computed(() => ((this.currentStep() - 1) / (this.steps.length - 1)) * 100);

  constructor() {
    this.requestForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      budget: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      location: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
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

  nextStep(): void {
    if (this.currentStep() < 4) {
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
    const step = this.currentStep();
    let fieldsToValidate: string[] = [];

    switch (step) {
      case 1:
        fieldsToValidate = ['title', 'category'];
        break;
      case 2:
        fieldsToValidate = ['description', 'budget'];
        break;
      case 3:
        fieldsToValidate = ['location', 'date', 'time'];
        break;
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
      this.errorMessage.set('Please log in to create a request');
      this.router.navigate(['/auth']);
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const formValue = this.requestForm.value;

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
      next: (response) => {
        console.log('Request created:', response);
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Error creating request:', error);
        this.errorMessage.set('Failed to create request. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }

  navigate(screen: string): void {
    this.router.navigate([`/${screen}`]);
  }
}
