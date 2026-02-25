'use client';

import { lusitana } from '@/app/ui/fonts';
import { AtSymbolIcon, KeyIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@repo/ui';
import { useActionState } from 'react';
import { authenticate, signInWithGitHub } from '@/app/lib/actions';
import { useSearchParams } from 'next/navigation';

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/todos';
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <div className="flex-1 rounded-lg bg-white/[0.03] px-6 pb-4 pt-8">
          <h1 className={`${lusitana.className} mb-3 text-2xl`}>Please log in to continue.</h1>
          <div className="w-full">
            <div>
              <label className="mb-3 mt-5 block text-xs font-medium text-white/70" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-white/10 bg-white/5 py-[9px] pl-10 text-sm text-white/90 outline-2 placeholder:text-white/30"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  required
                />
                <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-white/60" />
              </div>
            </div>
            <div className="mt-4">
              <label
                className="mb-3 mt-5 block text-xs font-medium text-white/70"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-white/10 bg-white/5 py-[9px] pl-10 text-sm text-white/90 outline-2 placeholder:text-white/30"
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
                <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-white/60" />
              </div>
            </div>
          </div>
          <input type="hidden" name="redirectTo" value={callbackUrl} />
          <Button className="mt-4 w-full" aria-disabled={isPending}>
            Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
          </Button>
          <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
            {errorMessage && (
              <>
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{errorMessage}</p>
              </>
            )}
          </div>
        </div>
      </form>

      {/* Divider */}
      <div className="relative flex items-center px-6">
        <div className="flex-grow border-t border-white/10" />
        <span className="mx-3 flex-shrink text-xs text-white/30">or</span>
        <div className="flex-grow border-t border-white/10" />
      </div>

      {/* GitHub OAuth */}
      <form action={signInWithGitHub} className="px-6 pb-4">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <GitHubIcon className="h-5 w-5" />
          Continue with GitHub
        </button>
      </form>

      <p className="px-6 text-center text-sm text-white/40">
        Don&apos;t have an account?{' '}
        <a href="/register" className="font-medium text-accent-cyan hover:text-accent-cyan">
          Register
        </a>
      </p>
    </div>
  );
}
