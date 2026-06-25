"use client";

import { useState, useTransition } from "react";
import { Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { updateTechnicalNotes } from "../../escalas/actions";

export function TechnicalNotesForm({
  scheduleId,
  initialNotes,
  viewOnly = false,
}: {
  scheduleId: string;
  initialNotes: string | null;
  viewOnly?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSave() {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await updateTechnicalNotes(scheduleId, notes || null);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao salvar observações técnicas.");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="kadosh-label" htmlFor="technical_notes">
          Observações Técnicas (Som / Datashow)
        </label>
        <textarea
          id="technical_notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={pending || viewOnly}
          rows={3}
          placeholder="Ex: Microfone 3 está falhando no palco, Datashow precisa ajustar cor, hino 3 tem playback no canal esquerdo..."
          className="kadosh-input resize-none"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="min-h-5">
          {error && (
            <p className="flex items-center gap-1 text-[11px] text-red-400">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
          {success && (
            <p className="flex items-center gap-1 text-[11px] text-green-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Observações salvas!
            </p>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={pending || viewOnly}
          className="kadosh-btn-secondary !py-2 !px-3.5 text-xs font-semibold shrink-0"
        >
          {pending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" />
              Salvar Observações
            </>
          )}
        </button>
      </div>
    </div>
  );
}
