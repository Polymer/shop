import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';

class ShopAbout extends PolymerElement {
  static get template() {
    return html`
    <h1>About Shop</h1>

    <p>Shop is a demo.</p>
    `;
  }
  static get is() { return 'shop-about'; }

  static get properties() { return {

    visible: {
      type: Boolean,
      observer: '_visibleChanged'
    }

  }}

  _visibleChanged(visible) {
    if (visible) {
      // Notify the category and the page's title
      this.dispatchEvent(new CustomEvent('change-section', {
        bubbles: true, composed: true, detail: {
          category: 'about',
          title: 'About Shop'
        }}));
    }
  }

}

customElements.define(ShopAbout.is, ShopAbout);
