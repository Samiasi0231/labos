import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routers } from "./router";
import { OrderProvider } from "./context/OrderContext";
import { RoleProvider } from "./context/RoleContext";

const queryClient = new QueryClient();

const App = () => {
  const router = createBrowserRouter(routers);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <RoleProvider>
          <OrderProvider>
            <RouterProvider router={router} />
          </OrderProvider>
        </RoleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
