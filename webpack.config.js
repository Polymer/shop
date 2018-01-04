const path = require('path');
const webpack = require('webpack');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

module.exports = {
  entry: './boot.js',
  plugins: [
    new MinifyPlugin(),
    new WorkboxPlugin({
      globDirectory: '.',
      globPatterns: ['build/*.js', 'images/*', 'manifest.json', 'index.html'],
      globIgnores: ['build/sd-ce-polyfill.js'],
      swDest: 'build/service-worker.js',
      modifyUrlPrefix: {
        'build/': ''
      },
      navigateFallback: 'index.html',
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /sd-ce-polyfill\.js/,
          handler: 'staleWhileRevalidate',
          options: {
            cache: {
              name: 'sd-ce-polyfill-cache'
            }
          }
        },
        {
          urlPattern: /\/data\/images\/.*/,
          handler: 'cacheFirst',
          options: {
            cache: {
              maxEntries: 200,
              name: 'items-cache'
            }
          }
        },
        {
          urlPattern: /\/data\/.*json/,
          handler: 'staleWhileRevalidate',
          options: {
            cache: {
              maxEntries: 100,
              name: 'data-cache'
            }
          }
        }
      ]
    })
  ],
  output: {
    filename: 'shop-app.js',
    chunkFilename: '[name].js',
    path: path.resolve(__dirname, 'build')
  }
};
