import { Toaster } from "@/components/ui/sonner";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routers } from "./router";
import { SWRProvider } from "./provider/swr-provider";
import { StoreProvider } from "./hooks/use-store";

const App = () => {
  const router = createBrowserRouter(routers);
  return (
    <SWRProvider>
      <StoreProvider>
        <Toaster />
        <RouterProvider router={router} />
      </StoreProvider>
    </SWRProvider>
  );
};

export default App;
