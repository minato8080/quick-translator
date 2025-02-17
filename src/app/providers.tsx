"use client";

import { Provider } from "react-redux";

import { FlashcardProvider } from "@/components/FlashcardHandler";
import { Toaster } from "@/components/ui/toaster";
import store from "@/global/store";
import { AlertProvider } from "@/provider/AlertProvider";

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
