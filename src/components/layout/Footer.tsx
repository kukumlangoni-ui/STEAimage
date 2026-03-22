import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-zinc-950 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block">
              <div className="text-2xl font-black tracking-tight">
                <span className="text-amber-400 text-glow">STEA</span>
                <span className="text-white">image</span>
              </div>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
              STEAimage inaleta tools za ku-compress, ku-resize, na ku-convert picha kwa urahisi na haraka — platform ya kwanza ya tech kwa Watanzania.
            </p>
            <p className="mt-6 text-xs font-bold text-amber-500/80 uppercase tracking-wider">
              By SwahiliTech Elite Academy
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white">Links</h4>
            <ul className="mt-4 space-y-3 text-sm text-zinc-400">
              <li>
                <Link to="/" className="hover:text-amber-400 transition">
                  About
                </Link>
              </li>
              <li>
                <Link to="/tools" className="hover:text-amber-400 transition">
                  Tools
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-amber-400 transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-400 transition">
                  Ingia (Admin)
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-semibold text-white">Mawasiliano</h4>
            <ul className="mt-4 space-y-3 text-sm text-zinc-400">
              <li>
                Email: <a href="mailto:swahilitecheliteacademy@gmail.com" className="hover:text-amber-400 transition">swahilitecheliteacademy@gmail.com</a>
              </li>
              <li>
                WhatsApp: <a href="https://wa.me/8619715852043" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition">+8619715852043</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-zinc-500">
            &copy; {new Date().getFullYear()} SwahiliTech Elite Academy. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
