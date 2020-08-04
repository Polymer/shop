/**
 * @license
 * Copyright (c) 2020 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import copy from 'rollup-plugin-copy';

const babelConfig = {
  babelrc: false,
  ...{
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            ie: '11',
          },
        },
      ],
    ],
  },
};

const minifyHTMLLiteralsConfig = {
  options: {
    minifyOptions: {
      removeAttributeQuotes: false
    }
  }
}

const filesizeConfig = {
  showGzippedSize: true,
  showBrotliSize: false,
  showMinifiedSize: false,
};

const copyConfig = {
  targets: [
    { src: 'node_modules/@webcomponents', dest: 'build-modnomod/node_modules' },
    { src: 'node_modules/systemjs/dist/s.min.js', dest: 'build-modnomod/node_modules/systemjs/dist' },
    { src: 'images', dest: 'build-modnomod' },
    { src: 'data', dest: 'build-modnomod' },
    { src: 'index-modnomod.html', dest: 'build-modnomod', rename: 'index.html' },
  ],
};

const configs = [
  // The main JavaScript bundle for modern browsers that support
  // JavaScript modules and other ES2015+ features.
  {
    input: 'src/components/shop-app.js',
    output: {
      dir: 'build-modnomod/src/components',
      format: 'es',
    },
    plugins: [
      minifyHTML(minifyHTMLLiteralsConfig),
      resolve()
    ],
    preserveEntrySignatures: false,
  },
  // The main JavaScript bundle for older browsers that don't support
  // JavaScript modules or ES2015+.
  {
    input: ['src/components/shop-app.js'],
    output: {
      dir: 'build-modnomod/nomodule/src/components',
      format: 'systemjs',
    },
    plugins: [
      minifyHTML(minifyHTMLLiteralsConfig),
      commonjs({ include: ['node_modules/**'] }),
      babel(babelConfig),
      resolve(),
      copy(copyConfig),
    ],
    preserveEntrySignatures: false,
  },
  // Babel polyfills for older browsers that don't support ES2015+.
  {
    input: 'src/babel-polyfills-nomodule.js',
    output: {
      file: 'build-modnomod/nomodule/src/babel-polyfills-nomodule.js',
      format: 'iife',
    },
    plugins: [commonjs({ include: ['node_modules/**'] }), resolve()],
  },
];

for (const config of configs) {
  if (process.env.NODE_ENV !== 'development') {
    config.plugins.push(terser());
  }
  config.plugins.push(filesize(filesizeConfig));
}

export default configs;
