import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackToTools() {
  const [label, setLabel] = useState("Back to Tools");

  useEffect(() => {
    const savedTitle = sessionStorage.getItem("lastSectionTitle");
    if (savedTitle) {
      setLabel(`Back to ${savedTitle}`);
    }
  }, []);

  return (
    <div className="sticky top-4 z-50 mb-8">
      <Link
        to="/tools"
        className="inline-flex items-center gap-2 rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-bold text-zinc-400 backdrop-blur-md transition hover:text-white border border-white/5"
      >
        <ArrowLeft size={18} />
        {label}
      </Link>
    </div>
  );
}
