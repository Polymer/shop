const shippingOptions = [
  {
    id: 'free',
    label: 'Free shipping',
    description: 'Arrives in 5 to 7 days',
    price: 0,
  },
  {
    id: 'express',
    label: 'Express shipping',
    description: '$5.00 - Arrives in 1 to 3 days',
    price: 5,
  },
];

const paymentRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: [
    {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['MASTERCARD', 'VISA'],
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          'gateway': 'stripe',
          'stripe:version': '2018-10-31',
          'stripe:publishableKey': 'pk_test_MNKMwKAvgdo2yKOhIeCOE6MZ00yS3mWShu',
        },
      },
    },
  ],
  merchantInfo: {
    merchantId: '17613812255336763067',
    merchantName: 'Demo Merchant',
  },
  transactionInfo: {
    totalPriceStatus: 'FINAL',
    totalPriceLabel: 'Total',
    totalPrice: '0',
    currencyCode: 'USD',
    countryCode: 'US',
  },
  callbackIntents: ['PAYMENT_AUTHORIZATION', 'SHIPPING_OPTION'],
  shippingAddressRequired: true,
  shippingOptionRequired: true,
  shippingOptionParameters: {
    defaultSelectedOptionId: shippingOptions[0].id,
    shippingOptions: shippingOptions.map(o => ({
      id: o.id,
      label: o.label,
      description: o.description,
    })),
  },
};

function buildGooglePayPaymentRequest(displayItems, shippingOption) {
  const opt = shippingOption || shippingOptions[0];
  const items = [...displayItems, {
    label: opt.label,
    price: opt.price.toFixed(2),
    type: 'SHIPPING_OPTION',
  }];

  return {
    ...paymentRequest,
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPriceLabel: 'Total',
      currencyCode: 'USD',
      countryCode: 'US',
      displayItems: items,
      totalPrice: items.reduce((total, item) => total + Number(item.price), 0).toFixed(2),
    },
  };
}

function getPaymentRequestTransactionInfo(displayItems, shippingOption) {
  const opt = shippingOption || config.paymentrequest.shippingOptions[0];
  const items = [...displayItems, {
    label: opt.label,
    amount: opt.amount,
    type: 'SHIPPING_OPTION',
  }];

  return {
    total: {
      label: 'Total',
      amount: {
        currency: 'USD',
        value: items.reduce((total, item) => total + Number(item.amount.value), 0).toFixed(2),
      },
    },
    displayItems: items,
  };
}

const config = {
  googlepay: {
    environment: 'TEST',
    existingPaymentMethodRequired: false,
    appearance: {
      buttonColor: 'default',
      buttonType: 'long',
    },
    paymentRequest,
    shippingOptions,
    onLoadPaymentData: function (paymentResponse, context) {
      console.log('Success', paymentResponse);
      this.dispatchEvent(new CustomEvent('payment-selected', {
        bubbles: true,
        composed: true,
        detail: {
          paymentResponse,
          context: typeof context === 'function' ? context() : context,
        }
      }));
    },
    onPaymentAuthorized: function () { return { transactionState: 'SUCCESS'}; },
    buildPaymentRequest: buildGooglePayPaymentRequest,
  },
  paymentrequest: {
    paymentMethods: [
      {
        supportedMethods: 'basic-card',
        data: {
          supportedNetworks: ['visa', 'mastercard', 'amex'],
        },
      },
    ],
    shippingOptions: shippingOptions.map((option, index) => ({
      id: option.id,
      label: option.label,
      amount: {
        currency: 'USD',
        value: option.price.toFixed(2),
      },
      selected: index === 0,
    })),
    requestShipping: true,
    onPaymentDataResponse: function (paymentResponse, context) {
      console.log('Success', paymentResponse);
      this.dispatchEvent(new CustomEvent('payment-selected', {
        bubbles: true,
        composed: true,
        detail: {
          paymentResponse,
          context: typeof context === 'function' ? context() : context,
        }
      }));
    },
    getTransactionInfo: getPaymentRequestTransactionInfo,
  },
};

function getGooglePayConfig() {
  return {
    ...config.googlepay,
  };
}

function getPaymentRequestConfig() {
  return {
    ...config.paymentrequest,
  };
}

export {
  getGooglePayConfig,
  getPaymentRequestConfig,
};
