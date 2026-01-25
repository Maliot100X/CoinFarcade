import { sdk } from "@farcaster/frame-sdk";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Launch } from "./pages/Launch";
import { Shop } from "./pages/Shop";
import { Profile } from "./pages/Profile";
import { More } from "./pages/More";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ fid: number; displayName?: string; username?: string; pfpUrl?: string } | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const context = await sdk.context;
        if (context.user) {
          setUser(context.user);
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsLoading(false);
        sdk.actions.ready();
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        Loading CoinFarcade...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/launch" element={<Launch />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/more" element={<More />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
