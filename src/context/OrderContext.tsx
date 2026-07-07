import { createContext, useState, type ReactNode } from "react";
import {
  seedOrders,
  type TestOrder,
  type OrderItem,
  type OrderStatus,
  type ItemStatus,
} from "@/data/orderData";

interface SampleEntry {
  itemId: string;
  sampleType: string;
  container: string;
}

interface OrderContextType {
  orders: TestOrder[];
  addOrder: (order: TestOrder) => void;
  updateOrder: (id: string, updates: Partial<TestOrder>) => void;
  addItemToOrder: (orderId: string, item: OrderItem) => void;
  removeItemFromOrder: (orderId: string, itemId: string) => void;
  updateItem: (orderId: string, itemId: string, updates: Partial<OrderItem>) => void;
  collectSamples: (orderId: string, samples: SampleEntry[]) => void;
  assignItem: (orderId: string, itemId: string, scientistId: string, scientistName: string) => void;
  updateItemStatus: (orderId: string, itemId: string, status: ItemStatus) => void;
  cancelOrder: (orderId: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const OrderContext = createContext<OrderContextType>({
  orders: [],
  addOrder: () => {},
  updateOrder: () => {},
  addItemToOrder: () => {},
  removeItemFromOrder: () => {},
  updateItem: () => {},
  collectSamples: () => {},
  assignItem: () => {},
  updateItemStatus: () => {},
  cancelOrder: () => {},
});

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<TestOrder[]>(seedOrders);

  const updateOrders = (fn: (prev: TestOrder[]) => TestOrder[]) =>
    setOrders(fn);

  const addOrder = (order: TestOrder) =>
    updateOrders(prev => [order, ...prev]);

  const updateOrder = (id: string, updates: Partial<TestOrder>) =>
    updateOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));

  const addItemToOrder = (orderId: string, item: OrderItem) =>
    updateOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, items: [...o.items, item] } : o)
    );

  const removeItemFromOrder = (orderId: string, itemId: string) =>
    updateOrders(prev =>
      prev.map(o =>
        o.id === orderId ? { ...o, items: o.items.filter(i => i.id !== itemId) } : o
      )
    );

  const updateItem = (orderId: string, itemId: string, updates: Partial<OrderItem>) =>
    updateOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, items: o.items.map(i => i.id === itemId ? { ...i, ...updates } : i) }
          : o
      )
    );

  const collectSamples = (orderId: string, samples: SampleEntry[]) =>
    updateOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const updatedItems = o.items.map(item => {
          const s = samples.find(s => s.itemId === item.id);
          return s ? { ...item, sampleType: s.sampleType, container: s.container } : item;
        });
        return { ...o, items: updatedItems, status: 'sample_collected' as OrderStatus };
      })
    );

  const assignItem = (orderId: string, itemId: string, scientistId: string, scientistName: string) =>
    updateOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const updatedItems = o.items.map(i =>
          i.id === itemId
            ? { ...i, assignedTo: scientistId, assignedToName: scientistName }
            : i
        );
        // If order status is sample_collected and at least one item is now assigned, mark in_progress
        const anyAssigned = updatedItems.some(i => i.assignedTo);
        const newStatus: OrderStatus =
          o.status === 'sample_collected' && anyAssigned ? 'in_progress' : o.status;
        return { ...o, items: updatedItems, status: newStatus };
      })
    );

  const updateItemStatus = (orderId: string, itemId: string, status: ItemStatus) =>
    updateOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        const updatedItems = o.items.map(i =>
          i.id === itemId ? { ...i, status } : i
        );
        // Auto-complete order if all items are completed
        const allDone = updatedItems.every(i => i.status === 'completed');
        const newOrderStatus: OrderStatus = allDone ? 'completed' : o.status;
        return { ...o, items: updatedItems, status: newOrderStatus };
      })
    );

  const cancelOrder = (orderId: string) =>
    updateOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o)
    );

  return (
    <OrderContext.Provider value={{
      orders, addOrder, updateOrder, addItemToOrder, removeItemFromOrder,
      updateItem, collectSamples, assignItem, updateItemStatus, cancelOrder,
    }}>
      {children}
    </OrderContext.Provider>
  );
}
