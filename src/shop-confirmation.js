import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import './shop-button.js';
import './shop-image.js';

class ShopConfirmation extends PolymerElement {
  static get template() {
    return html`
    <style include="shop-common-styles shop-button">

      :host {
        display: block;
        @apply --layout-horizontal;
        @apply --layout-center-justified;
        padding: 0 20px;
      }

      shop-button {
        margin-top: 65px;
      }
    </style>

    <div>
      <h1>Order Received</h1>
      <p>Congratulations, on your purchase. The order has been received and is being processed.</p>
      <p><em>This is for demo purposes only. You have not been charged, the order is not being processed.</em></p>
      <shop-button>
        <a href="/">Continue Shopping</a>
      </shop-button>
    </div>
`;
  }

  static get is() { return 'shop-confirmation'; }

  static get properties() { return {

    visible: {
      type: Boolean,
      observer: '_visibleChanged'
    }

  }}

  _visibleChanged(visible) {
    if (visible) {
      this.dispatchEvent(new CustomEvent('change-section', {
        bubbles: true, composed: true, detail: {title: 'Confirmation'}}));
    }
  }
}

customElements.define(ShopConfirmation.is, ShopConfirmation);
