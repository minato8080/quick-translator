"use client";

import { Provider } from "react-redux";

import { FlashcardProvider } from "@/components/FlashcardHandler";
import { Toaster } from "@/components/ui/toaster";
import store from "@/global/store";
import { AlertProvider } from "@/provider/AlertProvider";

// サービスワーカーの登録
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js")
    .then((registration) => {
      console.log(
        "ServiceWorker registration successful with scope: ",
        registration.scope
      );
    })
    .catch((err) => {
      console.error("ServiceWorker registration failed: ", err);
    });
}

export default function Providers({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AlertProvider>
      <Provider store={store}>
        <FlashcardProvider>{children}</FlashcardProvider>
      </Provider>
      <Toaster />
    </AlertProvider>
  );
}
