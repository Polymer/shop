/**
 * Usage:
 *   node scripts/add_routes_to_push_manifest.js
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
  pushManifest['src/shop-app.html'],
  pushManifest['src/shop-checkout.html'],
  navigateRequestPreloads);

fs.writeFileSync(pushManifestPath, JSON.stringify(newManifest, null, 2));
