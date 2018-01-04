function main() {
  import(/* webpackMode: 'eager' */ './src/shop-app.js');
}

if (!window.customElements || !('attachShadow' in Element.prototype)) {
  import(/* webpackChunkName: 'sd-ce-polyfill' */ './node_modules/@webcomponents/webcomponentsjs/webcomponents-sd-ce.js').then(main);
} else {
  main();
}
