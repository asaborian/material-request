import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';

// Server Action の「失敗結果」を表す型
export type ActionErrorResult = {
  success: false;
  rootError?: string; // フォーム根本（全体）のエラー（未認証、二重登録など）
  fieldErrors?: Record<string, string[] | undefined>; // 各入力欄（フィールド）のエラー
};

/**
 * Server Action の失敗結果（result）を、react-hook-form のエラー状態に自動反映する関数
 * - fieldErrors があれば各入力欄にエラーメッセージを表示
 * - rootError があればフォーム全体の root にエラーメッセージを表示
 */
export function handleActionError<T extends FieldValues>(
  setError: UseFormSetError<T>,
  result: ActionErrorResult
) {
  // 1. 各入力欄のエラーがある場合
  if (result.fieldErrors) {
    for (const [fieldName, errorMessages] of Object.entries(
      result.fieldErrors
    )) {
      if (errorMessages && errorMessages[0]) {
        setError(fieldName as Path<T>, { message: errorMessages[0] });
      }
    }
  }

  // 2. 根本（全体）のエラーがある場合
  if (result.rootError) {
    setError('root', { message: result.rootError });
  }
}
