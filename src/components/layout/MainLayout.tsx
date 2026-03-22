import React from "react";
import { UpdateBanner } from "../InstallPrompt";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-200">
      {/* Global Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-yellow-600/5 blur-[100px]" />
      </div>

      <Navbar />

      <main className="flex-1 relative z-10 flex flex-col">
        <Outlet />
      </main>

      <Footer />
      <UpdateBanner />
    </div>
  );
}
