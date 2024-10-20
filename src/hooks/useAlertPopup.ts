import { useContext } from "react";

import { AlertContext } from "@/provider/AlertProvier";

/**
 * アラートポップアップを使用するためのカスタムフック
 * @returns アラートコンテキスト
 * @throws アラートプロバイダー内で使用されていない場合にエラーをスロー
 */
export const useAlertPopup = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlertPopup must be used within an AlertProvider");
  }
  return context;
};
