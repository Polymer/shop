import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import loadScript from './load-script.js';

class GooglePayButton extends PolymerElement {

  static get template() {
    return html`
    <style>
      :host {
        display: inline-block;
      }
    </style>

    <div id="container">
    </div>
    `;
  }

  static get is() { return 'google-pay-button'; }

  static get properties() {
    return {
      environment: {
        type: String,
        value: 'TEST',
      },
      version: {
        type: Object,
        value: {
          major: 2,
          minor: 0,
        }
      },
      emailRequired: Boolean,
      existingPaymentMethodRequired: Boolean,
      merchantInfo: Object,
      allowedPaymentMethods: Array,
      shippingAddressRequired: Boolean,
      shippingOptionParameters: Object,
      onPaymentDataChanged: Function,
      onPaymentAuthorized: Function,
      onPaymentDataResult: Function,
      onError: Function,
      onReadyToPayChange: Function,
      appearance: {
        type: Object,
        value: {
          buttonColor: 'default',
          buttonType: 'long',
        }
      },
      transactionInfo: Object,
    };
  }

  static get observers() { return [
    '_propertiesChanged(allowedPaymentMethods)'
  ]}

  constructor() {
    super();

    this._handleClick = this._handleClick.bind(this);
  }

  ready() {
    super.ready();

    this._initializeButton();
  }

  _getClientConfig() {
    const { environment, onPaymentDataChanged, onPaymentAuthorized } = this;
    const clientConfig = {
      environment: environment || defaultProperties.environment,
    };

    if (onPaymentDataChanged || onPaymentAuthorized) {
      clientConfig.paymentDataCallbacks = {};

      if (onPaymentDataChanged) {
        clientConfig.paymentDataCallbacks.onPaymentDataChanged = (...args) => {
          const result = onPaymentDataChanged(...args, this._paymentRequest);
          return result || {};
        };
      }

      if (onPaymentAuthorized) {
        clientConfig.paymentDataCallbacks.onPaymentAuthorized = (...args) => {
          const result = onPaymentAuthorized(...args, this._paymentRequest);
          return result || {};
        }
      }
    }

    return clientConfig;
  }

  _buildPaymentRequest(request = {}) {
    const paymentRequest = {
      apiVersion: this.version.major,
      apiVersionMinor: this.version.minor,
      merchantInfo: this.merchantInfo,
      allowedPaymentMethods: this.allowedPaymentMethods,
      emailRequired: request.emailRequired,
      shippingAddressRequired: request.shippingAddressRequired,
    };

    const callbackIntents = [];

    if (request.onPaymentDataChanged) {
      callbackIntents.push('SHIPPING_ADDRESS');

      if (request.shippingOptionParameters) {
        callbackIntents.push('SHIPPING_OPTION');
      }
    }

    if (request.onPaymentAuthorized) {
      callbackIntents.push('PAYMENT_AUTHORIZATION');
    }

    if (callbackIntents.length) {
      paymentRequest.callbackIntents = callbackIntents;
    }

    if (request.shippingOptionParameters) {
      paymentRequest.shippingOptionParameters = request.shippingOptionParameters;
      paymentRequest.shippingOptionRequired = true;
    }

    if (request.transactionInfo) {
      paymentRequest.transactionInfo = request.transactionInfo;

      const { displayItems } = request.transactionInfo;
      if (displayItems && !paymentRequest.transactionInfo.totalPrice) {
        const total = displayItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
        paymentRequest.transactionInfo.totalPrice = total.toFixed(2);
      }
    }

    return paymentRequest;
  }

  _initializeButton() {
    return loadScript('https://pay.google.com/gp/p/js/pay.js')
      .then(() => {
        this._client = new google.payments.api.PaymentsClient(this._getClientConfig());
        return this._client;
      })
      .then(client => client.isReadyToPay(this._buildPaymentRequest({})))
      .then(readyToPayResponse => {
        let isReadyToPay = false;

        if ((this.existingPaymentMethodRequired && readyToPayResponse.paymentMethodPresent && readyToPayResponse.result)
          || (!this.existingPaymentMethodRequired && readyToPayResponse.result)) {
          const appearance = this.appearance;
          const button = this._client.createButton({
            buttonColor: appearance.buttonColor,
            buttonType: appearance.buttonType,
            onClick: this._handleClick,
          });

          this._copyGPayStyles();
          const container = this.shadowRoot.getElementById('container');

          if (container.firstChild) {
            container.firstChild.remove();
          }

          if (appearance.width || appearance.height) {
            const buttonStyle = {};
            const containerStyle = {};

            const gPayButton = button.querySelector('button');
            if (appearance.width) {
              buttonStyle.width = '100%';
              containerStyle.width = appearance.width;
            }
            if (appearance.height) {
              buttonStyle.height = appearance.height;
              containerStyle.height = appearance.height;
            }

            Object.assign(gPayButton.style, buttonStyle);
            Object.assign(container.style, containerStyle);
          }

          container.appendChild(button);

          isReadyToPay = true;
        }

        if (this.onReadyToPayChange) {
          this.onReadyToPayChange(isReadyToPay);
        }

        return isReadyToPay;
      })
      .catch(error => {
        console.error(error);
      });
  }

  _propertiesChanged() {
    this._initializeButton();
  }

  _handleClick() {
    const paymentRequest = this._buildPaymentRequest(this);
    this._paymentRequest = paymentRequest;

    this._client.loadPaymentData(paymentRequest)
      .then(paymentResponse => {
        if (this.onPaymentDataResult) {
          this.onPaymentDataResult(paymentResponse);
        }
      })
      .catch(error => {
        if (this.onError) {
          this.onError(error);
        }
        console.log('Error', { error, paymentRequest });
      });
  }

  // workaround to get css styles into component
  _copyGPayStyles() {
    const styles = document.querySelectorAll('head > style');
    const gPayStyles = Array.from(styles).filter(s => s.innerText.indexOf('.gpay-button') !== -1);

    gPayStyles.forEach(s => {
      const style = document.createElement('style');
      style.innerText = s.innerText;
      this.shadowRoot.appendChild(style);
    });
  }
}

customElements.define(GooglePayButton.is, GooglePayButton);
