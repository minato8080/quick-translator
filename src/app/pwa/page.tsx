"use client";

import { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import SPAHeader from "@/components/SPAHeader";
import Translate from "@/components/page/Translate";
import Vocabulary from "@/components/page/Vocabulary";

export const SPARouter = () => {
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
        <Route path="/pwa" element={<Translate Header={SPAHeader} />} />
        <Route
          path="/pwa/translate"
          element={<Translate Header={SPAHeader} />}
        />
        <Route
          path="/pwa/vocabulary"
          element={<Vocabulary Header={SPAHeader} />}
        />
      </Routes>
    </Router>
  );
};
export default SPARouter;
