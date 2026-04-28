import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing.tsx";
import { AppShell } from "./components/layout/AppShell";
import WarRoom from "./pages/WarRoom.tsx";
import Propagation from "./pages/Propagation.tsx";
import LeakAttribution from "./pages/LeakAttribution.tsx";
import Conversion from "./pages/Conversion.tsx";
import ActionCenter from "./pages/ActionCenter.tsx";
import Prediction from "./pages/Prediction.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HotToaster
        position="top-center"
        toastOptions={{
          style: {
            background: "hsl(var(--bg-elevated))",
            color: "hsl(var(--text-primary))",
            border: "1px solid hsl(var(--border-glow))",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "12px",
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<AppShell />}>
            <Route path="/war-room" element={<WarRoom />} />
            <Route path="/propagation" element={<Propagation />} />
            <Route path="/leak-attribution" element={<LeakAttribution />} />
            <Route path="/conversion" element={<Conversion />} />
            <Route path="/action-center" element={<ActionCenter />} />
            <Route path="/prediction" element={<Prediction />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/app" element={<Navigate to="/war-room" replace />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
