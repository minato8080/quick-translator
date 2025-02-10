"use client";

import { useEffect, useState } from "react";
import React from "react";

import { motion, useAnimation } from "framer-motion";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * テキストをアニメーションで表示するコンポーネント
 * @param english - 英語のテキスト
 * @param japanese - 日本語のテキスト
 * @returns アニメーションされたテキストを含む JSX 要素
 */
const TranslateAnimation = ({
  english,
  japanese,
}: {
  english: string;
  japanese: string;
}) => {
  const [displayText, setDisplayText] = useState(english);
  const [currentTitle, setCurrentTitle] = useState(english);

  useEffect(() => {
    // 英語のアニメーション
    if (/^[A-Za-z]+$/.test(currentTitle)) {
      let currentText = currentTitle;
      const interval = setInterval(() => {
        if (currentText.length > 0) {
          currentText = currentText.slice(1);
          setDisplayText(currentText);
        } else {
          clearInterval(interval);
        }
      }, 50); // 100ミリ秒ごとに文字を削除

      return () => {
        clearInterval(interval);
      };
    } else {
      // 日本語のアニメーション
      let currentIndex = 0;
      const targetTitle = currentTitle;
      const interval = setInterval(() => {
        if (currentIndex <= targetTitle.length) {
          setDisplayText(targetTitle.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
        }
      }, 50); // 100ミリ秒ごとに文字を追加

      return () => {
        clearInterval(interval);
      };
    }
  }, [currentTitle]); // テキストが変更されたときにエフェクトを再実行

  useEffect(() => {
    // 表示テキストが空になったら日本語に切り替え
    if (displayText === "") {
      setCurrentTitle(japanese);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayText]);

  return (
    <span className="inline-block">
      {displayText.split("").map((char, index) => (
        <motion.span key={index}>{char}</motion.span>
      ))}
    </span>
  );
};

/**
 * ヘッダーコンポーネント
 *
 * @param english - 英語のタイトル
 * @param japanese - 日本語のタイトル
 * @returns ヘッダーUIをレンダリングするReactコンポーネント
 */
export const Header = React.memo(
  ({
    english,
    japanese,
    routerPushableRef,
    children,
  }: {
    english: string;
    japanese: string;
    routerPushableRef?: React.MutableRefObject<boolean>;
    children: React.ReactNode;
  }) => {
    const [mounted, setMounted] = useState(false);

    // クライアント側でのみ `BrowserRouter` を表示
    useEffect(() => {
      setMounted(true);
    }, []);

    const quickControls = useAnimation();
    useEffect(() => {
      (async () => {
        await quickControls.start({
          rotate: 360 * 3,
          transition: { duration: 0.6, ease: "easeInOut" },
        });
        await quickControls.start({
          rotate: 360 * 3,
          transition: { duration: 1.2, ease: "easeOut" },
        });
        // レンダリングの完了を待ってからrouterを有効にする
        await new Promise((resolve) => setTimeout(resolve, 3000));
        if (routerPushableRef) {
          routerPushableRef.current = true;
        }
      })();
    }, [quickControls, routerPushableRef]);

    // Hydration エラーを防ぐため、初回レンダリングでは何も描画しない
    if (!mounted) {
      return null;
    }

    return (
      <div className="bg-blue-600 text-white p-2 pr-4 pl-4 flex justify-between items-center">
        {/* アプリケーションのタイトル */}
        <h1 className="text-2xl font-bold flex items-center">
          <motion.span animate={quickControls} className="inline-block mr-2">
            Quick
          </motion.span>
          <TranslateAnimation english={english} japanese={japanese} />
        </h1>
        <div className="flex items-center space-x-2">
          {/* ドロップダウンメニュー */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-blue-700 p-3 transition-all duration-200 ease-in-out"
              >
                <Menu size={24} />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">{children}</DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }
);

Header.displayName = "Header";
