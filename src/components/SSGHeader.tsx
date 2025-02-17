"use client";

import React, { useRef } from "react";

import { useRouter } from "next/navigation";

import { Header } from "./Header";

export const SSGHeader = ({
  english,
  japanese,
}: {
  english: string;
  japanese: string;
}) => {
  const router = useRouter();
  const routerPushableRef = useRef(false);

  // アニメーションの描画完了後にルーティングする
  async function delayRoute(path: string) {
    let maxAttempts = 30;
    const delay = 100;

    while (!routerPushableRef.current && maxAttempts > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      maxAttempts--;
    }
    if (routerPushableRef.current) {
      router.push(path);
    }
  }

  return (
    <Header english={english} japanese={japanese} routeFunction={delayRoute} />
  );
};

SSGHeader.displayName = "Header";
export default SSGHeader;
