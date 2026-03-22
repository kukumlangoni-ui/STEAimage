import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap, Search, ChevronDown, User } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  const navGroups = [
    { name: 'Home', path: '/' },
    { name: 'All Tools', path: '/tools' },
    {
      name: 'Compress',
      path: '/tools/compress',
      items: [
        { name: 'Compress Image', path: '/tools/compress' },
        { name: 'Bulk Compress', path: '/tools/compress' },
        { name: 'Resize by KB', path: '/tools/resize' },
      ]
    },
    {
      name: 'Convert',
      path: '/tools/convert-to-jpg',
      items: [
        { name: 'Convert to JPG', path: '/tools/convert-to-jpg' },
        { name: 'Convert from JPG', path: '/tools/convert-from-jpg' },
        { name: 'WEBP Converter', path: '/tools/convert-to-jpg' },
      ]
    },
    {
      name: 'PDF Tools',
      path: '/tools/image-to-pdf',
      items: [
        { name: 'Image to PDF', path: '/tools/image-to-pdf' },
        { name: 'Merge Images to PDF', path: '/tools/image-to-pdf' },
      ]
    },
    {
      name: 'More Tools',
      path: '#',
      items: [
        { name: 'Image to URL', path: '/tools/image-to-url' },
        { name: 'Resize Image', path: '/tools/resize' },
        { name: 'Crop Image', path: '/tools/crop' },
        { name: 'Rotate Image', path: '/tools/rotate' },
        { name: 'Flip Image', path: '/tools/flip' },
        { name: 'Watermark Image', path: '/tools/watermark' },
      ]
    },
  ];

  const toggleMobileGroup = (name: string) => {
    if (mobileExpanded === name) {
      setMobileExpanded(null);
    } else {
      setMobileExpanded(name);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-zinc-950">
            <Zap size={20} className="fill-zinc-950" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black leading-none text-white tracking-tight">STEA<span className="text-amber-400">image</span></span>
            <span className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-wider">By SwahiliTech Elite Academy</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full bg-zinc-900/80 p-1 border border-white/5">
          {navGroups.map((group) => {
            const isActive = location.pathname === group.path || (group.path !== '/' && group.path !== '#' && location.pathname.startsWith(group.path));
            
            if (!group.items) {
              return (
                <Link
                  key={group.name}
                  to={group.path}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-amber-400 text-zinc-950' 
                      : 'text-zinc-300 hover:text-amber-400 hover:bg-white/5'
                  }`}
                >
                  {group.name}
                </Link>
              );
            }

            return (
              <div key={group.name} className="relative group">
                <button
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-amber-400 text-zinc-950' 
                      : 'text-zinc-300 hover:text-amber-400 hover:bg-white/5'
                  }`}
                >
                  {group.name}
                  <ChevronDown size={14} className="opacity-50 transition-transform group-hover:rotate-180" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="w-48 rounded-2xl border border-white/10 bg-zinc-900/95 p-2 shadow-xl backdrop-blur-xl">
                    {group.items.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        className="block rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-amber-400 transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 border border-white/5 text-zinc-400 hover:text-amber-400 transition-colors">
            <Search size={18} />
          </button>
          
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link 
                  to="/admin/dashboard" 
                  className="flex items-center gap-2 rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-zinc-950 transition hover:bg-amber-500 shadow-lg shadow-amber-500/20"
                >
                  <User size={16} /> Dashboard
                </Link>
              )}
              <Link 
                to="/login" 
                className="flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-zinc-800"
              >
                {user.displayName || user.email?.split('@')[0] || 'Akaunti'}
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login" 
                className="rounded-full px-5 py-2 text-sm font-bold text-zinc-300 transition hover:text-white hover:bg-white/5"
              >
                Ingia
              </Link>
              <Link 
                to="/signup" 
                className="rounded-full bg-amber-400 px-5 py-2 text-sm font-bold text-zinc-950 transition hover:bg-amber-500 shadow-lg shadow-amber-500/20"
              >
                Jisajili
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-zinc-300 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden border-t border-white/5 bg-zinc-900/95 backdrop-blur-xl px-6 py-4 flex flex-col gap-2 max-h-[80vh] overflow-y-auto">
          {navGroups.map((group) => {
            if (!group.items) {
              return (
                <Link
                  key={group.name}
                  to={group.path}
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-300 hover:text-amber-400 py-3 font-bold text-lg"
                >
                  {group.name}
                </Link>
              );
            }

            return (
              <div key={group.name} className="flex flex-col">
                <button
                  onClick={() => toggleMobileGroup(group.name)}
                  className="flex items-center justify-between text-zinc-300 hover:text-amber-400 py-3 font-bold text-lg"
                >
                  {group.name}
                  <ChevronDown size={18} className={`transition-transform ${mobileExpanded === group.name ? 'rotate-180' : ''}`} />
                </button>
                
                {mobileExpanded === group.name && (
                  <div className="flex flex-col gap-1 pl-4 pb-2 border-l-2 border-white/5 ml-2">
                    {group.items.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className="text-zinc-400 hover:text-amber-400 py-2 font-medium"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          
          <hr className="border-white/5 my-4" />
          <div className="flex flex-col gap-3 mb-4">
             <button className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zinc-800 border border-white/5 text-zinc-400 hover:text-amber-400 transition-colors">
              <Search size={20} /> Search
            </button>
            
            {user ? (
              <div className="flex flex-col gap-2">
                {isAdmin && (
                  <Link 
                    to="/admin/dashboard" 
                    onClick={() => setIsOpen(false)}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 font-bold text-zinc-950 transition hover:bg-amber-500"
                  >
                    <User size={20} /> Dashboard
                  </Link>
                )}
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-800 font-bold text-white transition hover:bg-zinc-700"
                >
                  {user.displayName || user.email?.split('@')[0] || 'Akaunti Yangu'}
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-800 font-bold text-white transition hover:bg-zinc-700"
                >
                  Ingia
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setIsOpen(false)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 font-bold text-zinc-950 transition hover:bg-amber-500"
                >
                  Jisajili Sasa
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
