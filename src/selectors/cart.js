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

const cartSelector = state => state.cart;

export const numItemsSelector = createSelector(
  cartSelector,
  cart => {
    if (cart) {
      return Object.values(cart).reduce((total, entry) => {
        return total + entry.quantity;
      }, 0);
    }

    return 0;
  }
)

export const totalSelector = createSelector(
  cartSelector,
  cart => {
    if (cart) {
      return Object.values(cart).reduce((total, entry) => {
        return total + entry.quantity * entry.item.price;
      }, 0);
    }

    return 0;
  }
)
