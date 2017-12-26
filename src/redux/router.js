import { store, installReducers } from './store.js';
import { loadCategory } from './categories-actions.js';
import { findCategory } from './helpers.js';

installReducers({
  // window.location changed
  _pathChanged(state, action) {
    return {
      ...state,
      page: action.page,
      categoryName: action.categoryName,
      itemName: action.itemName,
      checkoutState: 'init',
      failure: false
    };
  }
});

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
    window.history.pushState({}, '', anchor.href);
    handleUrlChange();
  }
});

function handleUrlChange() {
  store.dispatch(changePath(window.decodeURIComponent(window.location.pathname)));
}
window.addEventListener('popstate', handleUrlChange);
handleUrlChange();

export function pushState(href) {
  return dispatch => {
    window.history.pushState({}, '', href);
    dispatch(changePath(window.decodeURIComponent(window.location.pathname)));
  }
}

function changePath(path) {
  return (dispatch, getState) => {
    const state = getState();
    const pathParts = path.slice(1).split('/');
    const page = pathParts[0];
    const categoryName = pathParts[1];
    const itemName = pathParts[2];
    const category = findCategory(state.categories, categoryName);
    loadCategory(category, dispatch);
    dispatch({
      type: '_pathChanged',
      page,
      categoryName,
      itemName
    });
  };
}
