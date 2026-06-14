import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("livrecafe_cart");

    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const saveCart = (newCart) => {
    localStorage.setItem("livrecafe_cart", JSON.stringify(newCart));
    setCartItems(newCart);
  };

  const addToCart = (product, quantity = 1) => {
    const existedProduct = cartItems.find((item) => item._id === product._id);

    let newCart;

    if (existedProduct) {
      newCart = cartItems.map((item) =>
        item._id === product._id
          ? {
              ...item,
              quantity: item.quantity + quantity
            }
          : item
      );
    } else {
      newCart = [
        ...cartItems,
        {
          ...product,
          quantity
        }
      ];
    }

    saveCart(newCart);
  };

  const increaseQuantity = (productId) => {
    const newCart = cartItems.map((item) =>
      item._id === productId
        ? {
            ...item,
            quantity: item.quantity + 1
          }
        : item
    );

    saveCart(newCart);
  };

  const decreaseQuantity = (productId) => {
    const newCart = cartItems
      .map((item) =>
        item._id === productId
          ? {
              ...item,
              quantity: item.quantity - 1
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    saveCart(newCart);
  };

  const removeFromCart = (productId) => {
    const newCart = cartItems.filter((item) => item._id !== productId);
    saveCart(newCart);
  };

  const clearCart = () => {
    localStorage.removeItem("livrecafe_cart");
    setCartItems([]);
  };

  const totalTypes = cartItems.length;

  const totalQuantity = cartItems.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        totalTypes,
        totalQuantity,
        totalAmount
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}