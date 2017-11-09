import { updateLocation, pushState } from './actions/location.js';
import { getLocationPathPart } from './helpers/location.js';

export function installLocation(store) {
  document.body.addEventListener('click', e => {
    if ((e.button !== 0) ||           // Left click only
        (e.metaKey || e.ctrlKey)) {   // No modifiers
      return;
    }
    let origin;
    if (window.location.origin) {
      origin = window.location.origin;
    } else {
      origin = window.location.protocol + '//' + window.location.host;
    }
    let anchor = e.composedPath().filter(n=>n.localName=='a')[0];
    if (anchor && anchor.href.indexOf(origin) === 0) {
      e.preventDefault();
      store.dispatch(pushState(anchor.href));
    }
  });

  function handleUrlChange() {
    store.dispatch(updateLocation(window.decodeURIComponent(window.location.pathname)));
  }
  window.addEventListener('popstate', handleUrlChange);
  handleUrlChange();

  store.subscribe(() => {
    const state = store.getState();
    const page = getLocationPathPart(state, 0) || 'home';
    switch (page) {
      case 'home':
        updateDocumentHead({
          title: 'Home'
        });
        return;
      case 'cart':
        updateDocumentHead({
          title: 'Your cart'
        });
        return;
      case 'checkout':
        updateDocumentHead({
          title: 'Checkout'
        });
        return;
    }
    const category = state.categories[getLocationPathPart(state, 1)];
    if (page === 'list') {
      updateDocumentHead({
        title: category.title,
        image: document.baseURI + category.image
      });
      return;
    }
    const item = category && category.items && category.items[getLocationPathPart(state, 2)];
    if (page === 'detail') {
      updateDocumentHead({
        title: item ? item.title : '',
        description: item ? item.description.substring(0, 100) : '',
        image: item ? document.baseURI + item.image : ''
      });
      return;
    }
  });
}

function updateDocumentHead(detail) {
  if (detail.title) {
    document.title = detail.title + ' - SHOP';
    // this._announce(detail.title + ', loaded');
    // Set open graph metadata
    setMeta('property', 'og:title', detail.title);
    setMeta('property', 'og:description', detail.description || document.title);
    setMeta('property', 'og:url', document.location.href);
    setMeta('property', 'og:image', detail.image || document.baseURI + 'images/shop-icon-128.png');
    // Set twitter card metadata
    setMeta('property', 'twitter:title', detail.title);
    setMeta('property', 'twitter:description', detail.description || document.title);
    setMeta('property', 'twitter:url', document.location.href);
    setMeta('property', 'twitter:image:src', detail.image || document.baseURI + 'images/shop-icon-128.png');
  }
}

function setMeta(attrName, attrValue, content) {
  let element = document.head.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attrName, attrValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content || '');
}
