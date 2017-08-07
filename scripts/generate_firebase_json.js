/**
 * Usage:
 *   node scripts/generate_firebase_json.js
 *   node scripts/generate_firebase_json.js es6 unbundled
 *   node scripts/generate_firebase_json.js es5 bundled
 */
const esVersion = process.argv[2] || 'es6';
const bundleOption = process.argv[3] || 'bundled';
const variation = `${esVersion}-${bundleOption}`;


const fs = require('fs');
const pushManifest = require(`../build/${variation}/push-manifest.json`);
const result = {
  "hosting": {
    "public": `build/${variation}`,
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "trailingSlash": false,
    "headers": []
  }
};

const navigateRequestPreloads = {};
navigateRequestPreloads["bower_components/webcomponentsjs/webcomponents-loader.js"] = {
  "type": "script",
  "weight": 1
};
if (esVersion === 'es5') {
  navigateRequestPreloads["bower_components/webcomponentsjs/custom-elements-es5-adapter.js"] = {
    "type": "script",
    "weight": 1
  };
}

pushManifest[''] = Object.assign({
    "src/shop-app.html": {
      "type": "document",
      "weight": 1
    }
  },
  pushManifest['src/shop-app.html'],
  navigateRequestPreloads);
pushManifest['list/**'] = Object.assign({
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
pushManifest['detail/**'] = Object.assign({
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
pushManifest['cart'] = Object.assign({
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
pushManifest['checkout'] = Object.assign({
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

for (let src in pushManifest) {
  const value = Object.keys(pushManifest[src]).map((path) => {
    return `</${path}>;rel=preload;as=${pushManifest[src][path].type}`;
  }).join(',');
  if (value) {
    result.hosting.headers.push({
      'source': `/${src}`,
      'headers': [{
        'key': 'Link',
        'value': value
      }]
    });
  }
}

fs.writeFileSync('firebase.json', JSON.stringify(result, null, 2));

