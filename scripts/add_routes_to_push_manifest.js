/**
 * Usage:
 *   node scripts/add_routes_to_push_manifest.js
 */

const fs = require('fs');
const pushManifestPath = 'build/es6-unbundled/push-manifest.json';
const pushManifest = require(`../${pushManifestPath}`);

const navigateRequestPreloads = {
  "bower_components/webcomponentsjs/webcomponents-loader.js": {
    "type": "script",
    "weight": 1
  }
};

pushManifest['/'] = Object.assign({
    "src/shop-app.html": {
      "type": "document",
      "weight": 1
    }
  },
  pushManifest['src/shop-app.html'],
  navigateRequestPreloads);
pushManifest['/list/.*'] = Object.assign({
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
pushManifest['/detail/.*'] = Object.assign({
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
pushManifest['/cart'] = Object.assign({
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
pushManifest['/checkout'] = Object.assign({
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

fs.writeFileSync(pushManifestPath, JSON.stringify(pushManifest, null, 2));
