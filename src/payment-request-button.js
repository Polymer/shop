import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import Settings from './settings.js';

const emptyPaymentDetails = {
  total: {
    label: 'Total',
    amount: {
      currency: 'USD',
      value: '0.00',
    },
  },
};

class PaymentRequestButton extends PolymerElement {

  static get template() {
    return html`
    <style>
      :host {
        display: none;
      }

      button {
        background-color: #fff;
        color: var(--app-primary-color);
        border: 2px solid #000;
        width: 100%;
        padding: 8px 44px;
        font-size: 14px;
        font-weight: 500;
        display: block;
        text-transform: uppercase;
      }

      button:focus {
        background-color: #c5cad3;
      }

      button:active {
        background-color: #000;
        color: #fff;
      }
    </style>

    <button on-click="_handleClick">Buy Now</button>
    `;
  }

  static get is() { return 'payment-request-button'; }

  static get properties() {
    return {
      paymentMethods: Array,
      details: Object,
      shippingOptions: Array,
      requestShipping: Boolean,
      onPaymentDataChanged: Function,
      onPaymentAuthorized: Function,
      onPaymentDataResult: Function,
      onError: Function,
      onCanMakePaymentChange: Function,
    };
  }

  constructor() {
    super();

    this._handleClick = this._handleClick.bind(this);
  }

  ready() {
    super.ready();

    if (window.PaymentRequest && Settings.get('pr') === '1') {
      this._initializeButton();
    }
  }

  _buildPaymentRequest(paymentDetails = emptyPaymentDetails, options = null) {
    return new PaymentRequest(this.paymentMethods, paymentDetails, options);
  }

  _initializeButton() {
    const paymentRequest = this._buildPaymentRequest();
    paymentRequest.canMakePayment()
      .then(canMakePayment => {
        if (canMakePayment) {
          this.style.display = 'block';
        }

        if (this.onCanMakePaymentChange) {
          this.onCanMakePaymentChange(canMakePayment);
        }
      });
  }

  _handleClick() {
    const details = this.details;

    if (!details.total.amount.value && details.displayItems) {
      const total = details.displayItems.reduce((sum, item) => sum + parseFloat(item.amount.value), 0);
      details.total.amount.value = total.toFixed(2);
    }

    const paymentRequest = this._buildPaymentRequest({
      shippingOptions: this.shippingOptions,
      ...details,
    }, {
      requestShipping: this.requestShipping,
    });

    paymentRequest.addEventListener('shippingoptionchange', event => {
      this.dispatchEvent(new CustomEvent('shippingoptionchange', {
        bubbles: true, composed: true, detail: {
          paymentRequest,
          event,
        }}));
    });

    return paymentRequest.show()
      .then(paymentResponse => {
        if (this.onPaymentDataResult) {
          this.onPaymentDataResult(paymentResponse);
        }
        paymentResponse.complete();
      })
      .catch(error => {
        if (this.onError) {
          this.onError(error);
        }
        console.log('Error', { error, paymentRequest });
      });
  }
}

customElements.define(PaymentRequestButton.is, PaymentRequestButton);
