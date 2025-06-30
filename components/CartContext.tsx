import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: string;
  imageUrl?: string;
  quantity: number;
  restaurant?: string;
  category?: string[];
  description?: string;
  veg?: boolean;
  rating?: number;
};

// New Order type
export type Order = {
  orderId: string;
  items: CartItem[];
  paid: boolean;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  orders: Order[];
  addOrder: () => void;
  markOrderPaid: () => void;
  markAllOrdersPaid: () => void;
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === id);
      if (exists) {
        return prev
          .map((i) => (i.id === id ? { ...i, quantity } : i))
          .filter((i) => i.quantity > 0);
      } else if (quantity > 0) {
        // Find the item in unpaid orders to get all its details
        const unpaidItem = orders
          .filter(order => !order.paid)
          .flatMap(order => order.items)
          .find(i => i.id === id);
        if (unpaidItem) {
          return [...prev, { ...unpaidItem, quantity }];
        }
      }
      return prev;
    });
  };

  const addOrder = () => {
    if (cart.length > 0) {
      setOrders((prev) => [
        ...prev,
        {
          orderId: `${Date.now()}-${Math.random()}`,
          items: cart,
          paid: false,
        },
      ]);
      setCart([]);
    }
  };

  // Mark the latest unpaid order as paid
  const markOrderPaid = () => {
    setOrders((prev) => {
      // Find the last unpaid order
      const idx = [...prev].reverse().findIndex((order) => !order.paid);
      if (idx === -1) return prev;
      const realIdx = prev.length - 1 - idx;
      const updated = [...prev];
      updated[realIdx] = { ...updated[realIdx], paid: true };
      return updated;
    });
  };

  // Mark all unpaid orders as paid and merge them into a single order
  const markAllOrdersPaid = () => {
    setOrders((prev) => {
      const paidOrders = prev.filter((order) => order.paid);
      const unpaidOrders = prev.filter((order) => !order.paid);

      if (unpaidOrders.length === 0) {
        return prev;
      }

      const allItemsFromUnpaid = unpaidOrders.flatMap((order) => order.items);

      const combinedItems = Object.values(
        allItemsFromUnpaid.reduce((acc, item) => {
          if (acc[item.id]) {
            acc[item.id].quantity += item.quantity;
          } else {
            acc[item.id] = { ...item };
          }
          return acc;
        }, {} as { [id: string]: CartItem })
      );

      const newPaidOrder: Order = {
        orderId: `${Date.now()}-${Math.random()}`,
        items: combinedItems,
        paid: true,
      };

      return [...paidOrders, newPaidOrder];
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, orders, addOrder, markOrderPaid, markAllOrdersPaid, setCart }}>
      {children}
    </CartContext.Provider>
  );
}; 