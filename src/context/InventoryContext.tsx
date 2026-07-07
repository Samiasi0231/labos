import { createContext, useState, type ReactNode } from "react";
import { inventory as initialInventory, type InventoryItem } from "@/data/mockData";

interface InventoryContextType {
  items: InventoryItem[];
  addItem: (item: InventoryItem) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const InventoryContext = createContext<InventoryContextType>({
  items: initialInventory,
  addItem: () => {},
});

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(initialInventory);
  const addItem = (item: InventoryItem) => setItems(prev => [...prev, item]);
  return (
    <InventoryContext.Provider value={{ items, addItem }}>
      {children}
    </InventoryContext.Provider>
  );
}
