// paypal-button.component.ts
import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';

declare var paypal: any;

@Component({
    selector: 'app-paypal-button',
    standalone: true,
    template: `
    <div #paypalContainer class="paypal-button-container"></div>
    @if (isLoading) {
      <div class="flex items-center justify-center py-4">
        <div class="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        <span class="ml-2 text-slate-600 dark:text-slate-400">Loading PayPal...</span>
      </div>
    }
    @if (errorMessage) {
      <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
        {{ errorMessage }}
      </div>
    }
  `,
    styles: [`
    .paypal-button-container {
      min-height: 45px;
    }
  `]
})
export class PaypalButtonComponent implements AfterViewInit, OnDestroy {
    @ViewChild('paypalContainer') paypalContainer!: ElementRef;

    @Input() amount: number = 10;
    @Input() currency: string = 'USD';
    @Input() description: string = 'Task Payment';

    @Output() paymentSuccess = new EventEmitter<any>();
    @Output() paymentError = new EventEmitter<any>();
    @Output() paymentCancelled = new EventEmitter<void>();

    isLoading = true;
    errorMessage = '';
    private paypalButtons: any;

    // PayPal Sandbox Client ID
    private clientId = 'AbWkBJ6ku_3v_yjmi45XAegNbbNl5iPkmPya0mbn-mzf8ISkRZTav2i6KiTRAtXo7bAMlP0Wr4HECHq3';

    ngAfterViewInit() {
        this.loadPayPalScript();
    }

    ngOnDestroy() {
        // Clean up if needed
    }

    private loadPayPalScript() {
        // Check if PayPal script is already loaded
        if (typeof paypal !== 'undefined') {
            this.renderButtons();
            return;
        }

        // Load PayPal SDK
        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${this.clientId}&currency=${this.currency}`;
        script.onload = () => this.renderButtons();
        script.onerror = () => {
            this.isLoading = false;
            this.errorMessage = 'Failed to load PayPal. Please try again.';
        };
        document.body.appendChild(script);
    }

    private renderButtons() {
        this.isLoading = false;

        this.paypalButtons = paypal.Buttons({
            // Style the buttons
            style: {
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'paypal'
            },

            // Create the order
            createOrder: (data: any, actions: any) => {
                return actions.order.create({
                    purchase_units: [{
                        description: this.description,
                        amount: {
                            currency_code: this.currency,
                            value: this.amount.toFixed(2)
                        }
                    }]
                });
            },

            // Capture the payment
            onApprove: async (data: any, actions: any) => {
                try {
                    const order = await actions.order.capture();
                    console.log('Payment successful:', order);
                    this.paymentSuccess.emit({
                        orderId: order.id,
                        status: order.status,
                        payerEmail: order.payer?.email_address,
                        amount: this.amount
                    });
                } catch (error) {
                    console.error('Payment capture error:', error);
                    this.paymentError.emit(error);
                }
            },

            // Handle cancellation
            onCancel: () => {
                console.log('Payment cancelled');
                this.paymentCancelled.emit();
            },

            // Handle errors
            onError: (err: any) => {
                console.error('PayPal error:', err);
                this.errorMessage = 'Payment failed. Please try again.';
                this.paymentError.emit(err);
            }
        });

        this.paypalButtons.render(this.paypalContainer.nativeElement);
    }
}
