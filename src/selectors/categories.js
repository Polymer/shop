/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import { createSelector } from '../../node_modules/reselect/es/index.js';
import { splitPathSelector } from './location.js';

const categoriesSelector = state => state.categories;

export const currentCategorySelector = createSelector(
  categoriesSelector,
  splitPathSelector,
  (categories, splitPath) => {
    if (['list', 'detail'].indexOf(splitPath[0]) !== -1) {
      // Empty object means categories are loading and category may exist, whereas
      // undefined means categories have loaded but category doesn't exist.
      return Object.values(categories).length === 0 ? {} : categories[splitPath[1]];
    } else {
      return null;
    }
  }
);

export const currentItemSelector = createSelector(
  currentCategorySelector,
  splitPathSelector,
  (category, splitPath) => {
    if (splitPath[0] === 'detail') {
      // Empty object means category is loading and item may exist, whereas
      // undefined means category has loaded but item doesn't exist.
      return !category || !category.items ? {} : category.items[splitPath[2]];
    } else {
      return null;
    }
  }
);
