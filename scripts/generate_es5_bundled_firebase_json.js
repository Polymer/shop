const fs = require('fs');
const pushManifest = require('../build/es6-bundled/push-manifest.json');
const result = {
  "hosting": {
    "public": "build/es5-bundled",
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

pushManifest[''] = Object.assign({},
  pushManifest['src/shop-app.html'],
  {
    "src/shop-app.html": {
      "type": "document",
      "weight": 1
    },
    "bower_components/webcomponentsjs/webcomponents-loader.js": {
      "type": "script",
      "weight": 1
    },
    "bower_components/webcomponentsjs/custom-elements-es5-adapter.js": {
      "type": "script",
      "weight": 1
    }
  });
pushManifest['list/**'] = Object.assign({},
  pushManifest['src/shop-app.html'],
  pushManifest['src/shop-list.html'],
  {
    "src/shop-app.html": {
      "type": "document",
      "weight": 1
    },
    "src/shop-list.html": {
      "type": "document",
      "weight": 1
    },
    "bower_components/webcomponentsjs/webcomponents-loader.js": {
      "type": "script",
      "weight": 1
    },
    "bower_components/webcomponentsjs/custom-elements-es5-adapter.js": {
      "type": "script",
      "weight": 1
    }
  });
pushManifest['detail/**'] = Object.assign({},
  pushManifest['src/shop-app.html'],
  pushManifest['src/shop-detail.html'],
  {
    "src/shop-app.html": {
      "type": "document",
      "weight": 1
    },
    "src/shop-detail.html": {
      "type": "document",
      "weight": 1
    },
    "bower_components/webcomponentsjs/webcomponents-loader.js": {
      "type": "script",
      "weight": 1
    },
    "bower_components/webcomponentsjs/custom-elements-es5-adapter.js": {
      "type": "script",
      "weight": 1
    }
  });
pushManifest['cart'] = Object.assign({},
  pushManifest['src/shop-app.html'],
  pushManifest['src/shop-cart.html'],
  {
    "src/shop-app.html": {
      "type": "document",
      "weight": 1
    },
    "src/shop-cart.html": {
      "type": "document",
      "weight": 1
    },
    "bower_components/webcomponentsjs/webcomponents-loader.js": {
      "type": "script",
      "weight": 1
    },
    "bower_components/webcomponentsjs/custom-elements-es5-adapter.js": {
      "type": "script",
      "weight": 1
    }
  });
pushManifest['checkout'] = Object.assign({},
  pushManifest['src/shop-app.html'],
  pushManifest['src/shop-checkout.html'],
  {
    "src/shop-app.html": {
      "type": "document",
      "weight": 1
    },
    "src/shop-checkout.html": {
      "type": "document",
      "weight": 1
    },
    "bower_components/webcomponentsjs/webcomponents-loader.js": {
      "type": "script",
      "weight": 1
    },
    "bower_components/webcomponentsjs/custom-elements-es5-adapter.js": {
      "type": "script",
      "weight": 1
    }
  });

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

