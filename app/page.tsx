"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="mb-6 text-5xl font-bold text-gray-900">
          AI Assistant for Your Inbox
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          Streamline your email workflow with intelligent automation and
          insights.
        </p>
        {session ? (
          <Link
            href="/dashboard"
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        ) : (
          <Link
            href="/auth/signin"
            className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Sign in to Get Started
          </Link>
        )}
      </div>
    </main>
  );
}

