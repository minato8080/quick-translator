"use client";

import type { ReactNode } from "react";
import React, { useState, useCallback, createContext } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAlertPopup } from "@/hooks/useAlertPopup";

export type AlertType = "success" | "error" | "info";

/**
 * アラートのプロパティを定義する型
 */
export type AlertProps = {
  /** アラートの種類 */
  type: AlertType;
  /** アラートのタイトル */
  title: string;
  /** アラートの説明 */
  description: string;
};

/** アラートの種類に応じたアイコンを定義 */
const alertIcons = {
  success: CheckCircle2,
  error: XCircle,
  info: AlertCircle,
};
/** アラートの種類に応じたアイコンカラーを定義 */
const alertVariant = {
  success: "default",
  error: "destructive",
  info: "default",
} as const;

/** アラートの種類に応じた色を定義 */
const alertColors = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

/**
 * アラートコンテキストのプロパティを定義する型
 */
type AlertContextProps = {
  alert: AlertProps | null;
  showAlert: (type: AlertType, title: string, description: string) => void;
};

export const AlertContext = createContext<AlertContextProps | undefined>(
  undefined
);

/**
 * アラートポップアップコンポーネント
 * 現在のアラート情報に基づいてアラートを表示
 */
const AlertPopup = () => {
  const { alert } = useAlertPopup();
  const AlertIcon = alertIcons[alert?.type || "info"];

  return (
    <div className="fixed top-4 right-4 left-4 z-50 pointer-events-none flex justify-center">
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md pointer-events-auto"
          >
            <Alert
              className={`${alertColors[alert.type]} border shadow-lg`}
              variant={alertVariant[alert.type]}
            >
              <AlertIcon className="h-4 w-4" />
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * アラートプロバイダーコンポーネント
 * アラートコンテキストを提供し、アラートポップアップを表示
 * @param children 子要素
 */
export const AlertProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [alert, setAlert] = useState<AlertProps | null>(null);

  /**
   * アラートを表示する関数
   * @param type アラートの種類
   * @param title アラートのタイトル
   * @param description アラートの説明
   */
  const showAlert = useCallback(
    (type: AlertType, title: string, description: string) => {
      setAlert({ type, title, description });
      setTimeout(() => setAlert(null), 3000); // 3秒後にアラートを非表示
    },
    []
  );

  return (
    <AlertContext.Provider value={{ alert, showAlert }}>
      {children}
      <AlertPopup />
    </AlertContext.Provider>
  );
};
