import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [cartId, setCartId] = useState(null);

  const createNewCart = async () => {
    const response = await axios.post('http://localhost:1323/carts');
    setCartId(response.data.id);
  };

  const addToCart = async (productId) => {
    if (!cartId) await createNewCart();
    await axios.post(`http://localhost:1323/carts/${cartId}/products`, {
      product_id: productId,
    });
    fetchCart();
  };

  const fetchCart = useCallback(async () => {
    if (cartId) {
      const response = await axios.get(`http://localhost:1323/carts/${cartId}`);
      setCart(response.data.products);
    }
  }, [cartId]);

  const removeFromCart = async (productId) => {
    if (!cartId) return;

    try {
      await axios.delete(
        `http://localhost:1323/carts/${cartId}/products/${productId}`
      );
      fetchCart();
    } catch (error) {
      console.error('Error removing product:', error);
    }
  };

  useEffect(() => {
    if (cartId) fetchCart();
  }, [cartId, fetchCart]);

  const value = useMemo(
    () => ({ cart, addToCart, removeFromCart, cartId, fetchCart }),
    [cart, addToCart, removeFromCart, cartId, fetchCart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useCart = () => useContext(CartContext);
