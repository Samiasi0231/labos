import { useContext } from "react";
import { OrderContext } from "./OrderContext";

export function useOrders() {
  return useContext(OrderContext);
}
