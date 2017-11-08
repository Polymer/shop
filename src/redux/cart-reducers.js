import { store, installReducers } from './store.js';

installReducers({
  // Cart initialization/update from another window.
  // TODO: rename to cart
  _cartChanged(state, action) {
    const cart = action.cart;
    return {
      ...state,
      cart
    };
  },

  // CART_ITEM_QUANTITY_UPDATED(state, action) {
  //   const cart = state.cart;
  //   const itemId = action.payload.itemId;
  //   const newItem = {
  //     itemId,
  //     quantity: action.payload.quantity,
  //     size: action.payload.size,
  //   };
  //   let newCart = cart;

  //   if (action.payload.quantity === 0) {
  //     // Remove item from cart when the new quantity is 0.
  //     newCart = {...cart, [itemId]: undefined}
  //   } else {
  //     if (i !== -1) {
  //       newCart = {...cart, [itemId]: newItem}
  //     } else {
  //       newCart = {...cart, [itemId]: newItem}
  //     }
  //   }

  //   // Above code may need to be duplicated in action creator to update localStorage.
  //   localStorage.setItem('shop-cart-data', JSON.stringify(cart));

  //   return {
  //     ...state,
  //     cart: newCart
  //   }
  // }
});

function initCart() {
  store.dispatch({
    type: '_cartChanged',
    cart: getLocalCartData()
  });
}
window.addEventListener('storage', initCart);
initCart();

function getLocalCartData() {
  const localCartData = localStorage.getItem('shop-cart-data');
  try {
    return JSON.parse(localCartData) || [];
  } catch (e) {
    return [];
  }
}
