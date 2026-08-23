import { SignInButton } from '@clerk/nextjs';

export default function WelcomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 text-center shadow-md dark:bg-gray-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            診療材料新規採用申請システム
          </h1>
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            病院内で新たに導入したい診療材料の採用申請および審査を行うシステムです。
          </p>
        </div>

        <div className="mt-8">
          <SignInButton forceRedirectUrl="/">
            <button className="w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer">
              ログイン・新規登録して始める
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
