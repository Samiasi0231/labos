import { useContext } from "react";
import { InventoryContext } from "./InventoryContext";

export function useInventory() {
  return useContext(InventoryContext);
}
