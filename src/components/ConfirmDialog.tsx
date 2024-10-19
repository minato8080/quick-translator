import type { RefAttributes } from "react";
import { cloneElement } from "react";

import type { ButtonProps } from "./ui/button";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * ConfirmDialogコンポーネント
 *
 * このコンポーネントは、ユーザーに確認を求めるダイアログを表示します。
 *
 * @param children - トリガーボタンの要素
 * @param title - ダイアログのタイトル
 * @param description - ダイアログの説明（オプション）
 * @param ok - OKボタンのラベル（デフォルトは"OK"）
 * @param cancel - キャンセルボタンのラベル（デフォルトは"Cancel"）
 *
 * @returns 確認ダイアログを追加したボタン
 */
export const ConfirmDialog = ({
  children,
  title,
  description,
  ok = "OK",
  cancel = "Cancel",
}: {
  title: string;
  description?: string;
  ok?: string;
  cancel?: string;
  children: React.ReactElement<ButtonProps & RefAttributes<HTMLButtonElement>>;
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger disabled={children.props.disabled} asChild>
        {cloneElement(children, { onClick: undefined })}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={(e) => children.props.onClick?.(e)}>
            {ok}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
