"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteMember } from "../actions";

export function DeleteMemberButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-kadosh-beige-mid/70">Excluir {name}?</span>
        <button
          onClick={() =>
            startTransition(async () => {
              await deleteMember(id);
              router.push("/equipe");
            })
          }
          disabled={pending}
          className="kadosh-btn-secondary !border-red-500/40 !text-red-400"
        >
          {pending ? "Excluindo..." : "Confirmar"}
        </button>
        <button onClick={() => setConfirming(false)} className="kadosh-btn-ghost">
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirming(true)} className="kadosh-btn-secondary !border-red-500/30 !text-red-400">
      <Trash2 className="h-4 w-4" />
      Excluir
    </button>
  );
}
