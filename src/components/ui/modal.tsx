"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

export function Modal({
  title,
  open,
  onClose,
  children,
  maxWidth = "max-w-lg",
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-8 backdrop-blur-sm">
      <div className={`kadosh-card w-full ${maxWidth} p-6`}>
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-kadosh-beige-light">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-kadosh-beige-mid/70 hover:bg-kadosh-burnt/10 hover:text-kadosh-beige-light"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
