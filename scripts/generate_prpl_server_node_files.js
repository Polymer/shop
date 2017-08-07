/**
 * Usage:
 *   node scripts/generate_prpl_server_node_files.js
 */
const fs = require('fs');

const packageJson = {
  "scripts": {
    "start": "prpl-server --host 0.0.0.0 --https-redirect"
  },
  "engines": {
    "node": ">=6.0.0"
  },
  "dependencies": {
    "prpl-server": "^0.7.0"
  }
};

fs.writeFileSync('build/package.json', JSON.stringify(packageJson, null, 2));

const appYaml = `
runtime: nodejs
env: flex
manual_scaling:
  instances: 1
`;

fs.writeFileSync('build/app.yaml', appYaml);

