const defaultSettings = {
  gp: '1',
  pr: '1',
};
const localSettings = {};

function parseQuery(queryString) {
  const query = {};
  const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split('=');
      query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return query;
}

export default class Settings {
  static get(key) {
    let value;
    if (window.sessionStorage) {
      value = window.sessionStorage.getItem(key);
    } else {
      value = localSettings[key];
    }

    if (value === null || value === undefined) {
      value = defaultSettings[key];
    }

    return value;
  }

  static set(key, value) {
    if (window.sessionStorage) {
      window.sessionStorage.setItem(key, value);
    } else {
      localSettings[key] = value;
    }
  }
}

(function initialize() {
  const keys = Object.keys(defaultSettings);
  const query = parseQuery(window.location.search);

  keys.forEach(k => {
    if (k in query) {
      Settings.set(k, query[k]);
    }
  });
})();
