import React from "react";
import { Link } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6 py-12">
      {/* Global Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-yellow-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <div className="text-3xl font-black tracking-tight">
              <span className="text-amber-400 text-glow">STEA</span>
              <span className="text-white">image</span>
            </div>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in to your account to continue
          </p>
        </div>

        <div className="rounded-3xl border border-white/5 bg-zinc-900/40 p-8 shadow-2xl backdrop-blur-xl">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  className="w-full rounded-full border border-white/5 bg-zinc-950 py-3 pl-11 pr-4 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-zinc-300">
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm font-medium text-amber-400 hover:text-amber-300"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  className="w-full rounded-full border border-white/5 bg-zinc-950 py-3 pl-11 pr-4 text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-4 py-3 font-bold text-zinc-950 transition hover:bg-amber-400"
            >
              Sign in
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-400">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-amber-400 hover:text-amber-300"
            >
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
