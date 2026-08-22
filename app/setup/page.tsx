'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createUserAction } from './actions';

export default function SetupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    department: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    // トリム済みの値をローカル変数に確定させる
    const name = formData.name.trim();
    const department = formData.department.trim();
    
    // バリデーション：空文字・スペースのみの入力を弾く
    if (!name || !department) {
      setErrorMessage('氏名と所属は必須項目です。');
      return;
    }

    startTransition(async () => {
      try {
        await createUserAction({ name, department });
        // 登録成功後、ルートへ移動し、roleに応じた画面（一般なら /requests、管理者なら /admin/requests）へ交通整理させる
        router.push('/');
        router.refresh();
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('予期せぬエラーが発生しました。');
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <div>
          <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            初期プロフィール設定
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            氏名と所属を入力してください。
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4 rounded-md shadow-xs">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                氏名 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                disabled={isPending}
                placeholder="例：山田 太郎"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-xs focus:border-indigo-500 focus:outline-hidden focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                所属 <span className="text-red-500">*</span>
              </label>
              <input
                id="department"
                name="department"
                type="text"
                required
                disabled={isPending}
                placeholder="例：循環器内科、看護部"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-xs focus:border-indigo-500 focus:outline-hidden focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isPending ? '登録中...' : '登録して進む'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
