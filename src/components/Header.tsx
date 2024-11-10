"use client";

import { useEffect, useState } from "react";
import React from "react";

import { motion, useAnimation } from "framer-motion";
import { ArrowRightLeft, Menu, Book } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
export const Header = React.memo(({
  english,
  japanese,
}: {
  english: string;
  japanese: string;
}) => {
  const router = useRouter();
  const quickControls = useAnimation();

  useEffect(() => {
    const animateQuick = async () => {
      await quickControls.start({
        rotate: 360 * 3,
        transition: { duration: 0.6, ease: "easeInOut" },
      });
      await quickControls.start({
        rotate: 360 * 3,
        transition: { duration: 1.2, ease: "easeOut" },
      });
    };
    animateQuick();
  }, [quickControls]);

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
          <DropdownMenuContent align="end">
            {/* 翻訳画面への切り替え */}
            <DropdownMenuItem
              onClick={() => router.push("/translate")}
              className="text-lg py-3 px-4 hover:bg-gray-300"
            >
              <ArrowRightLeft className="mr-3 h-6 w-6" />
              <span>Translate</span>
            </DropdownMenuItem>
            {/* ボキャブラリー画面への切り替え */}
            <DropdownMenuItem
              onClick={() => router.push("/vocabulary")}
              className="text-lg py-3 px-4 hover:bg-gray-300"
            >
              <Book className="mr-3 h-6 w-6" />
              <span>Vocabulary</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

Header.displayName = "Header";