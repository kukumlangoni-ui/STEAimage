import React from "react";
import { Link } from "react-router-dom";

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  to: string;
  isNew?: boolean;
  key?: React.Key;
}

export default function ToolCard({
  title,
  description,
  icon: Icon,
  to,
  isNew,
}: ToolCardProps) {
  return (
    <Link
      to={to}
      className="group relative flex flex-col gap-4 rounded-3xl glass-card p-6 overflow-hidden"
    >
      <div className="absolute -inset-px bg-gradient-to-r from-amber-500/0 via-amber-500/0 to-amber-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-10 group-hover:from-amber-500/20 group-hover:via-yellow-500/20 group-hover:to-amber-500/20" />

      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 transition-transform duration-300 group-hover:scale-110 group-hover:bg-amber-500/20">
          <Icon size={24} />
        </div>
        {isNew && (
          <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-300">
            New
          </span>
        )}
      </div>

      <div>
        <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
          {title}
        </h3>
        <p className="mt-2 text-sm font-medium text-zinc-400 line-clamp-2">
          {description}
        </p>
      </div>
    </Link>
  );
}
