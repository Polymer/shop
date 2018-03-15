module.exports = {
  "globDirectory": "dist/",
  "globPatterns": [
    "**/*.{html,js}"
  ],
  "swDest": "dist/service-worker.js",
  "navigateFallback": "index.html",
  "clientsClaim": true,
  "skipWaiting": true,
  "runtimeCaching":  [
    {
      "urlPattern": new RegExp('/data/'),
      "handler": "networkFirst"
    },
    {
      "urlPattern": new RegExp('/images/'),
      "handler": "staleWhileRevalidate"
    },
    {
      "urlPattern": new RegExp('/webcomponentsjs/'),
      "handler": "staleWhileRevalidate"
    }
  ]
};
