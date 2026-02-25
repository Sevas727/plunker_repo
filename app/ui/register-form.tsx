'use client';

import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  UserIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useActionState } from 'react';
import { registerUser, RegisterState } from '@/app/lib/actions';

export default function RegisterForm() {
  const initialState: RegisterState = { message: '', errors: {} };
  const [state, formAction, isPending] = useActionState(registerUser, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex-1 rounded-lg bg-white/[0.03] px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>Create an account</h1>
        <div className="w-full">
          <div>
            <label className="mb-3 mt-5 block text-xs font-medium text-white/70" htmlFor="name">
              Name
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-white/10 bg-white/5 py-[9px] pl-10 text-sm text-white/90 outline-2 placeholder:text-white/30"
                id="name"
                type="text"
                name="name"
                placeholder="Enter your name"
                required
                minLength={2}
              />
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-white/60" />
            </div>
            {state.errors?.name && (
              <p className="mt-1 text-sm text-red-500">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="mt-4">
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
            {state.errors?.email && (
              <p className="mt-1 text-sm text-red-500">{state.errors.email[0]}</p>
            )}
          </div>
          <div className="mt-4">
            <label className="mb-3 mt-5 block text-xs font-medium text-white/70" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-white/10 bg-white/5 py-[9px] pl-10 text-sm text-white/90 outline-2 placeholder:text-white/30"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password (min 6 characters)"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-white/60" />
            </div>
            {state.errors?.password && (
              <p className="mt-1 text-sm text-red-500">{state.errors.password[0]}</p>
            )}
          </div>
        </div>
        <Button className="mt-4 w-full" aria-disabled={isPending}>
          Register <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
        <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
          {state.message && (
            <>
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{state.message}</p>
            </>
          )}
        </div>
        <p className="mt-4 text-center text-sm text-white/40">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-accent-cyan hover:text-accent-cyan">
            Log in
          </a>
        </p>
      </div>
    </form>
  );
}
