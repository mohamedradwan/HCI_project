import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent],
  template: `
    <app-nav-bar [(currentScreen)]="currentScreen"></app-nav-bar>

    <router-outlet (activate)="onActivate()"></router-outlet>
  `
})
export class AppComponent {
  currentScreen = signal('');
  private route = inject(ActivatedRoute);

  onActivate() {
    // Traverse down to the active child route
    let child = this.route.firstChild;
    while (child?.firstChild) {
      child = child.firstChild;
    }

    // Read the 'key' from the route data we set in Step 1
    // This is safe from minification
    child?.data.subscribe(data => {
      if (data['key']) {
        this.currentScreen.set(data['key']);
      }
    });
  }
}
