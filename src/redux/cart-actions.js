// Add to cart from detail view.
// TODO: cartItemAdded
export function addCartItem(detail) {
  return (dispatch, getState) => {
    const state = getState();
    const cart = state.cart.slice(0);
    const i = findCartItemIndex(cart, detail.item.name, detail.size);
    if (i !== -1) {
      detail.quantity += cart[i].quantity;
    }
    updateCart(dispatch, cart, i, detail);
  };
}

// Update from cart view.
// TODO: consider renaming to something closer to UI action, such as cartItemQuantityUpdated
export function setCartItem(detail) {
  return (dispatch, getState) => {
    const state = getState();
    const cart = state.cart.slice(0);
    const i = findCartItemIndex(cart, detail.item.name, detail.size);
    updateCart(dispatch, cart, i, detail);

    // Replace with:
    // dispatch({
    //   type: 'CART_ITEM_QUANTITY_UPDATED',
    //   payload: {
    //     cartItemId,
    //     quantity
    //   }
    // })
  };
}

// Clear cart after successful checkout.
export function clearCart(detail) {
  return (dispatch) => {
    localStorage.removeItem('shop-cart-data');
    dispatch({
      type: '_cartChanged',
      cart: []
    });
  };
}

function findCartItemIndex(cart, name, size) {
  if (cart) {
    for (let i = 0; i < cart.length; ++i) {
      let entry = cart[i];
      if (entry.item.name === name && entry.size === size) {
        return i;
      }
    }
  }

  return -1;
}

function updateCart(dispatch, cart, i, detail) {
  // NOTE: cart is NOT from store - it is just as a helper
  if (detail.quantity === 0) {
    // Remove item from cart when the new quantity is 0.
    if (i !== -1) {
      cart.splice(i, 1);
    }
  } else {
    if (i !== -1) {
      cart.splice(i, 1, detail);
    } else {
      cart.push(detail);
    }
  }

  localStorage.setItem('shop-cart-data', JSON.stringify(cart));
  dispatch({
    // TODO: CART_DATA_RECEIVED
    type: '_cartChanged',
    cart
  });
}
