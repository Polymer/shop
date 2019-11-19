import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './google-pay-button.js'
import './payment-request-button.js'
import './shop-button.js';
import './shop-common-styles.js';
import './shop-form-styles.js';
import config from './shop-configuration.js';

class ShopCart extends PolymerElement {
  static get template() {
    return html`
    <style include="shop-common-styles shop-button shop-form-styles">

      .list {
        margin: 40px 0;
      }

      .checkout-box {
        font-weight: bold;
        text-align: center;
      }

      .subtotal {
        margin: 0 0 0 24px;
      }

      .buy-buttons {
        width: 80%;
        max-width: 400px;
        margin: 40px auto 20px;
        padding: 20px;
      }

      .buy-buttons > * {
        margin-bottom: 4px;
        width: 100%;
      }

      @media (max-width: 767px) {

        .subtotal {
          margin: 0 0 0 24px;
        }

      }

    </style>

    <div class="main-frame">
      <div class="subsection" visible$="[[!_hasItems]]">
        <p class="empty-cart">Your <iron-icon icon="shopping-cart"></iron-icon> is empty.</p>
      </div>
      <div class="subsection" visible$="[[_hasItems]]">
        <header>
          <h1>Your Cart</h1>
          <span>([[_getPluralizedQuantity(cart.length)]])</span>
        </header>
        <div class="list">
          <dom-repeat items="[[cart]]" as="entry">
            <template>
              <shop-cart-item entry="[[entry]]"></shop-cart-item>
            </template>
          </dom-repeat>
        </div>
        <div class="checkout-box">
          Total: <span class="subtotal">[[_formatTotal(total)]]</span>
        </div>

        <div class="buy-buttons">
          <google-pay-button id="googlePayButton"
            environment="[[config.googlepay.environment]]"
            allowed-payment-methods="[[config.googlepay.allowedPaymentMethods]]"
            merchant-info="[[config.googlepay.merchantInfo]]"
            shipping-address-required="[[config.googlepay.shippingAddressRequired]]"
            appearance="[[config.googlepay.appearance]]"
            on-payment-data-result="[[_onGooglePayPaymentDataResult]]"
            on-payment-authorized="[[config.googlepay.onPaymentAuthorized]]"
          ></google-pay-button>
          <payment-request-button id="paymentRequestButton"
            payment-methods="[[config.paymentrequest.paymentMethods]]"
            shipping-options="[[config.paymentrequest.shippingOptions]]"
            request-shipping="[[config.paymentrequest.requestShipping]]"
            on-payment-data-result="[[_onPaymentRequestPaymentDataResult]]"
          ></payment-request-button>

          <shop-button>
            <a href="/checkout">Checkout</a>
          </shop-button>
        </div>
      </div>
    </div>
    `;
  }

  static get is() { return 'shop-cart'; }

  static get properties() {
    return {

      config: {
        type: Object,
        value: () => config,
      },

      total: Number,

      cart: {
        type: Array,
        observer: '_cartChanged',
      },

      visible: {
        type: Boolean,
        observer: '_visibleChanged'
      },

      _hasItems: {
        type: Boolean,
        computed: '_computeHasItem(cart.length)'
      }

    }

  }

  constructor() {
    super();

    this._onGooglePayPaymentDataResult = this._onGooglePayPaymentDataResult.bind(this);
    this._onPaymentRequestPaymentDataResult = this._onPaymentRequestPaymentDataResult.bind(this);
  }

  _formatTotal(total) {
    return isNaN(total) ? '' : '$' + total.toFixed(2);
  }

  _computeHasItem(cartLength) {
    return cartLength > 0;
  }

  _getPluralizedQuantity(quantity) {
    return quantity + ' ' + (quantity === 1 ? 'item' : 'items');
  }

  _visibleChanged(visible) {
    if (visible) {
      // Notify the section's title
      this.dispatchEvent(new CustomEvent('change-section', {
        bubbles: true, composed: true, detail: { title: 'Your cart' }}));
    }
  }

  _onGooglePayPaymentDataResult(paymentResponse) {
    this.config.googlepay.onPaymentDataResponse.bind(this)(paymentResponse, {
      items: this.cart,
      type: 'cart',
      method: 'google-pay',
    });
  }

  _onPaymentRequestPaymentDataResult(paymentResponse) {
    this.config.googlepay.onPaymentDataResponse.bind(this)(paymentResponse, {
      items: this.cart,
      type: 'cart',
      method: 'payment-request',
    });
  }

  _getGooglePayTransactionInfo() {
    if (this.cart) {
      return {
        totalPriceStatus: 'FINAL',
        totalPriceLabel: 'Total',
        currencyCode: 'USD',
        countryCode: 'US',
        displayItems: this.cart.map(i => ({
          label: `${i.item.title} x ${i.quantity}`,
          type: 'LINE_ITEM',
          price: (i.item.price * i.quantity).toFixed(2),
        })),
      };
    }
    return null;
  }

  _getPaymentRequestDetails() {
    if (this.cart) {
      return {
        total: {
          label: 'Total',
          amount: {
            currency: 'USD',
          },
        },
        displayItems: this.cart.map(i => ({
          label: `${i.item.title} x ${i.quantity}`,
          type: 'LINE_ITEM',
          amount: {
            currency: 'USD',
            value: (i.item.price * i.quantity).toFixed(2),
          }
        })),
      };
    }
    return null;
  }

  _cartChanged() {
    this.$.googlePayButton.transactionInfo = this._getGooglePayTransactionInfo();
    this.$.paymentRequestButton.details = this._getPaymentRequestDetails();
  }

}

customElements.define(ShopCart.is, ShopCart);
