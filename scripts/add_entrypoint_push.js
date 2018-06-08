/**
 * Usage:
 *   node scripts/add_entrypoint_push.js
 */

const fs = require('fs');
const pushManifestPath = 'build/es6-unbundled/push-manifest.json';
const pushManifest = require(`../${pushManifestPath}`);
const newManifest = {};

const navigateRequestPreloads = {
  "bower_components/webcomponentsjs/webcomponents-loader.js": {
    "type": "script",
    "weight": 1
  }
};

newManifest['/'] = Object.assign({
    "src/shop-app.html": {
      "type": "document",
      "weight": 1
    }
  },
  pushManifest['/'],
  pushManifest['src/shop-app.html'],
  navigateRequestPreloads);
newManifest['/list/.*'] = Object.assign({
    "src/shop-app.html": {
      "type": "document",
      "weight": 1
    },
    "src/shop-list.html": {
      "type": "document",
      "weight": 1
    }
  },
  pushManifest['/list/.*'],
  pushManifest['src/shop-app.html'],
  pushManifest['src/shop-list.html'],
  navigateRequestPreloads);
newManifest['/detail/.*'] = Object.assign({
    "src/shop-app.html": {
      "type": "document",
      "weight": 1
    },
    "src/shop-detail.html": {
      "type": "document",
      "weight": 1
    }
  },
  pushManifest['/detail/.*'],
  pushManifest['src/shop-app.html'],
  pushManifest['src/shop-detail.html'],
  navigateRequestPreloads);
newManifest['/cart'] = Object.assign({
    "src/shop-app.html": {
      "type": "document",
      "weight": 1
    },
    "src/shop-cart.html": {
      "type": "document",
      "weight": 1
    }
  },
  pushManifest['/cart'],
  pushManifest['src/shop-app.html'],
  pushManifest['src/shop-cart.html'],
  navigateRequestPreloads);
newManifest['/checkout'] = Object.assign({
    "src/shop-app.html": {
      "type": "document",
      "weight": 1
    },
    "src/shop-checkout.html": {
      "type": "document",
      "weight": 1
    }
  },
  pushManifest['/checkout'],
  pushManifest['src/shop-app.html'],
  pushManifest['src/shop-checkout.html'],
  navigateRequestPreloads);

// Dedup assets already pushed by shell -
// https://github.com/Polymer/polymer-build/issues/260
const dedupedLazyResourcesAssets = {};
const lazyResourcesAssets = pushManifest['src/lazy-resources.html'];
Object.keys(lazyResourcesAssets).forEach((asset) => {
  if (!newManifest['/'][asset]) {
    dedupedLazyResourcesAssets[asset] = lazyResourcesAssets[asset];
  }
});
newManifest['src/lazy-resources.html'] = dedupedLazyResourcesAssets;

fs.writeFileSync(pushManifestPath, JSON.stringify(newManifest, null, 2));
