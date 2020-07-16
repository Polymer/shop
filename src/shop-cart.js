import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@google-pay/button-element';
import './payment-request-button.js';
import './shop-button.js';
import './shop-common-styles.js';
import './shop-form-styles.js';
import { getGooglePayConfig, getPaymentRequestConfig } from './shop-configuration.js';

const googlepayConfig = getGooglePayConfig();
const paymentrequestConfig = getPaymentRequestConfig();

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

      google-pay-button {
        height: 40px;
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
            class="fill"
            environment="[[googlepayConfig.environment]]"
            payment-request="[[googlepayConfig.paymentRequest]]"
            button-type="[[googlepayConfig.appearance.buttonType]]"
            button-color="[[googlepayConfig.appearance.buttonColor]]"
            existing-payment-method-required="[[googlepayConfig.existingPaymentMethodRequired]]"
            on-load-payment-data="[[_onGooglePayPaymentDataResult]]"
            on-payment-authorized="[[googlepayConfig.onPaymentAuthorized]]"
            on-payment-data-changed="[[_onGooglePayPaymentDataChanged]]"
          ></google-pay-button>
          <payment-request-button id="paymentRequestButton"
            payment-methods="[[paymentrequestConfig.paymentMethods]]"
            shipping-options="[[paymentrequestConfig.shippingOptions]]"
            request-shipping="[[paymentrequestConfig.requestShipping]]"
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

      googlepayConfig: {
        type: Object,
        value: () => googlepayConfig,
      },

      paymentrequestConfig: {
        type: Object,
        value: () => paymentrequestConfig,
      },

      total: Number,

      cart: Array,

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

  static get observers() { return [
    '_refreshDetails(cart, total)',
  ]}

  constructor() {
    super();

    this._onGooglePayPaymentDataResult = this._onGooglePayPaymentDataResult.bind(this);
    this._onGooglePayPaymentDataChanged = this._onGooglePayPaymentDataChanged.bind(this);
    this._onPaymentRequestPaymentDataResult = this._onPaymentRequestPaymentDataResult.bind(this);
    this._onPaymentRequestShippingOptionChange = this._onPaymentRequestShippingOptionChange.bind(this);
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
    this.googlepayConfig.onLoadPaymentData.bind(this)(paymentResponse, {
      items: this.cart,
      type: 'cart',
      method: 'google-pay',
    });
  }

  _onPaymentRequestPaymentDataResult(paymentResponse) {
    this.paymentrequestConfig.onPaymentDataResponse.bind(this)(paymentResponse, {
      items: this.cart,
      type: 'cart',
      method: 'payment-request',
    });
  }

  _getGooglePayTransactionInfo(shippingOption) {
    if (this.cart) {
      const paymentRequest = this.googlepayConfig.buildPaymentRequest(this.cart.map(i => ({
        label: `${i.item.title} x ${i.quantity}`,
        type: 'LINE_ITEM',
        price: (i.item.price * i.quantity).toFixed(2),
      })), shippingOption);

      return paymentRequest.transactionInfo;
    }
    return null;
  }

  _onGooglePayPaymentDataChanged(paymentData) {
    if (paymentData.shippingOptionData.id) {
      const shippingOption = this.googlepayConfig.shippingOptions.find(option => option.id === paymentData.shippingOptionData.id);
      if (shippingOption) {
        const transactionInfo = this._getGooglePayTransactionInfo(shippingOption);

        return {
          newTransactionInfo: transactionInfo,
        };
      }
    }
    return {};
  }

  _getPaymentRequestDetails(shippingOption) {
    if (this.cart) {
      return this.paymentrequestConfig.getTransactionInfo(this.cart.map(i => ({
        label: `${i.item.title} x ${i.quantity}`,
        type: 'LINE_ITEM',
        amount: {
          currency: 'USD',
          value: (i.item.price * i.quantity).toFixed(2),
        }
      })), shippingOption);
    }
    return null;
  }

  _onPaymentRequestShippingOptionChange(event) {
    const shippingOption = this.$.paymentRequestButton.shippingOptions.find(option => option.id === event.detail.paymentRequest.shippingOption);
    event.detail.event.updateWith({
      ...this._getPaymentRequestDetails(shippingOption),
      shippingOptions: this.$.paymentRequestButton.shippingOptions.map(option => ({
        ...option,
        selected: option.id === event.detail.paymentRequest.shippingOption,
      })),
    });
  }

  _refreshDetails() {
    this.$.googlePayButton.paymentRequest.transactionInfo = this._getGooglePayTransactionInfo();
    this.$.paymentRequestButton.details = this._getPaymentRequestDetails();

    this.$.paymentRequestButton.removeEventListener('shippingoptionchange', this._onPaymentRequestShippingOptionChange);
    this.$.paymentRequestButton.addEventListener('shippingoptionchange', this._onPaymentRequestShippingOptionChange);
  }

}

customElements.define(ShopCart.is, ShopCart);
