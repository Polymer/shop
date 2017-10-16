/**
 * Usage:
 *   node scripts/dedup_assets.js
 */

const fs = require('fs');
const pushManifestPath = 'build/es6-unbundled/push-manifest.json';
const pushManifest = require(`../${pushManifestPath}`);
const newManifest = {};

// Dedup assets already pushed by shell -
// https://github.com/Polymer/polymer-build/issues/260
const shell = 'src/shop-app.html';
const shellAssets = pushManifest[shell];

Object.keys(pushManifest).forEach((fragment) => {
  const fragmentAssets = pushManifest[fragment];
  newManifest[fragment] = {};

  Object.keys(fragmentAssets).forEach((asset) => {
    if (!shellAssets[asset]) {
      newManifest[fragment][asset] = fragmentAssets[asset];
    }
  });
});

// Shell assets should not be deduped with itself!
newManifest[shell] = shellAssets;

fs.writeFileSync(pushManifestPath, JSON.stringify(newManifest, null, 2));
