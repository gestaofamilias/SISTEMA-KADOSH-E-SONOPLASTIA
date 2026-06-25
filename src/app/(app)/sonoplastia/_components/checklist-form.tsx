"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Save, AlertCircle, Loader2 } from "lucide-react";
import type { TechnicalChecklist, ChecklistStatus } from "@/lib/database.types";
import { saveTechnicalChecklist } from "../actions";
import { CHECKLIST_STATUSES } from "@/lib/constants";

export function ChecklistForm({
  scheduleId,
  eventId,
  checklist,
  viewOnly = false,
}: {
  scheduleId: string;
  eventId: string;
  checklist: TechnicalChecklist | null;
  viewOnly?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [soundChecked, setSoundChecked] = useState(checklist?.sound_checked ?? false);
  const [microphonesChecked, setMicrophonesChecked] = useState(checklist?.microphones_checked ?? false);
  const [datashowChecked, setDatashowChecked] = useState(checklist?.datashow_checked ?? false);
  const [lyricsReady, setLyricsReady] = useState(checklist?.lyrics_ready ?? false);
  const [playbackChecked, setPlaybackChecked] = useState(checklist?.playback_checked ?? false);
  const [cablesChecked, setCablesChecked] = useState(checklist?.cables_checked ?? false);
  const [notes, setNotes] = useState(checklist?.notes ?? "");
  const [status, setStatus] = useState<ChecklistStatus>(checklist?.status ?? "Pendente");

  function handleSave() {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await saveTechnicalChecklist({
          id: checklist?.id,
          schedule_id: scheduleId,
          event_id: eventId,
          sound_checked: soundChecked,
          microphones_checked: microphonesChecked,
          datashow_checked: datashowChecked,
          lyrics_ready: lyricsReady,
          playback_checked: playbackChecked,
          cables_checked: cablesChecked,
          notes,
          status,
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao salvar checklist.");
      }
    });
  }

  const items = [
    { label: "🎚️ Mesa de som testada", checked: soundChecked, setter: setSoundChecked },
    { label: "🎤 Microfones e pilhas testados", checked: microphonesChecked, setter: setMicrophonesChecked },
    { label: "🖥️ Datashow ligado e focado", checked: datashowChecked, setter: setDatashowChecked },
    { label: "🎵 Letras dos hinos prontas", checked: lyricsReady, setter: setLyricsReady },
    { label: "🎶 Playbacks organizados", checked: playbackChecked, setter: setPlaybackChecked },
    { label: "🔌 Cabos e palco organizados", checked: cablesChecked, setter: setCablesChecked },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-kadosh-beige-mid/70">
          Checklist Técnico
        </p>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ChecklistStatus)}
          className="kadosh-input !w-auto !py-1 !px-2.5 text-xs font-medium"
          disabled={pending || viewOnly}
        >
          {CHECKLIST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((item, idx) => (
          <label
            key={idx}
            className={`flex cursor-pointer items-center gap-3.5 rounded-xl border border-kadosh-burnt/10 bg-white/[0.02] p-3 text-sm transition-all hover:bg-white/[0.04] ${
              item.checked ? "border-kadosh-fire/20 bg-kadosh-fire/5 text-kadosh-beige-light" : "text-kadosh-beige-mid"
            }`}
          >
            <input
              type="checkbox"
              checked={item.checked}
              disabled={pending || viewOnly}
              onChange={(e) => item.setter(e.target.checked)}
              className="h-4 w-4 rounded border-kadosh-burnt/20 bg-kadosh-black text-kadosh-fire focus:ring-kadosh-fire/20"
            />
            {item.label}
          </label>
        ))}
      </div>

      <div>
        <label className="kadosh-label" htmlFor="checklist_notes">Observações do checklist</label>
        <textarea
          id="checklist_notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={pending || viewOnly}
          rows={2}
          placeholder="Problemas técnicos, pilhas fracas ou notas gerais..."
          className="kadosh-input resize-none"
        />
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {success && (
        <p className="flex items-center gap-1.5 text-xs text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          Checklist atualizado com sucesso!
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={pending || viewOnly}
        className="kadosh-btn-primary w-full !py-2 text-xs"
      >
        {pending ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Salvando checklist...
          </>
        ) : (
          <>
            <Save className="h-3.5 w-3.5" />
            Salvar Checklist
          </>
        )}
      </button>
    </div>
  );
}
