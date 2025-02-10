"use client";

import React, { useRef } from "react";

import { ArrowRightLeft, Book } from "lucide-react";
import { useRouter } from "next/navigation";

import { Header } from "./Header";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export const SSGHeader = React.memo(
  ({ english, japanese }: { english: string; japanese: string }) => {
    const router = useRouter();
    const routerPushableRef = useRef(false);

    async function attemptRouterPush(path: string) {
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
      <Header
        english={english}
        japanese={japanese}
        routerPushableRef={routerPushableRef}
      >
        <DropdownMenuItem
          className="text-lg py-3 px-4 hover:bg-gray-300"
          onClick={async () => attemptRouterPush("translate")}
        >
          <ArrowRightLeft className="mr-3 h-6 w-6" />
          <span>Translate</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-lg py-3 px-4 hover:bg-gray-300"
          onClick={async () => attemptRouterPush("vocabulary")}
        >
          <Book className="mr-3 h-6 w-6" />
          <span>Vocabulary</span>
        </DropdownMenuItem>
      </Header>
    );
  }
);

SSGHeader.displayName = "Header";
export default SSGHeader;
