"use client";

import { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import { RedirectComponent } from "@/components/RedirectComponent";
import SPAHeader from "@/components/SPAHeader";
import Translate from "@/components/page/Translate";
import Vocabulary from "@/components/page/Vocabulary";

const PWARouter = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydration エラーを防ぐため、初回レンダリングでは何も描画しない
  if (!mounted) {
    return null;
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/pwa/"
          element={<RedirectComponent to="/pwa/translate/" />}
        />
        <Route
          path="/pwa/translate/"
          element={<Translate Header={SPAHeader} />}
        />
        <Route
          path="/pwa/vocabulary/"
          element={<Vocabulary Header={SPAHeader} />}
        />
      </Routes>
    </Router>
  );
};
export default PWARouter;
