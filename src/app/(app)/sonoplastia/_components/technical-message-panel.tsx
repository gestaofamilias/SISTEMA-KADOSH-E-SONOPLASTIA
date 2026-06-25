"use client";

import { useState, useTransition } from "react";
import { Check, Copy, MessageSquareText, Send, Sparkles } from "lucide-react";
import { buildTechnicalScheduleMessage, copyToClipboard, type TechnicalScheduleMessageData } from "@/lib/utils";
import { sendTechnicalScheduleToN8n } from "../../automacoes/actions";

export function TechnicalMessagePanel({
  scheduleId,
  messageData,
  n8nSent,
  viewOnly = false,
}: {
  scheduleId: string;
  messageData: TechnicalScheduleMessageData;
  n8nSent: boolean;
  viewOnly?: boolean;
}) {
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  function handleGenerate() {
    setMessage(buildTechnicalScheduleMessage(messageData));
    setFeedback(null);
  }

  async function handleCopy() {
    if (!message) handleGenerate();
    await copyToClipboard(message || buildTechnicalScheduleMessage(messageData));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleSendN8n() {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await sendTechnicalScheduleToN8n(scheduleId);
        setMessage(result.message);
        setFeedback({ type: "ok", text: "Escala técnica enviada para o n8n com sucesso." });
      } catch (e) {
        setFeedback({ type: "error", text: e instanceof Error ? e.message : "Erro ao enviar escala técnica." });
      }
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-kadosh-burnt/10 bg-white/[0.01] p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-kadosh-beige-mid/70">
          Mensagem da Escala Técnica
        </p>
        {n8nSent && (
          <span className="kadosh-badge border-green-500/40 bg-green-500/10 text-green-400">
            Enviada n8n
          </span>
        )}
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={8}
        placeholder='Clique em "Gerar mensagem técnica" para montar o texto de WhatsApp para a técnica.'
        className="kadosh-input resize-none font-mono text-xs leading-relaxed"
      />

      {feedback && (
        <p
          className={`rounded-lg border px-3 py-2 text-xs ${
            feedback.type === "ok"
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleGenerate}
          className="kadosh-btn-secondary !py-2 !px-3 text-xs"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Gerar mensagem
        </button>
        <button
          onClick={handleCopy}
          className="kadosh-btn-secondary !py-2 !px-3 text-xs"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copiado!" : "Copiar"}
        </button>
        {!viewOnly && (
          <button
            onClick={handleSendN8n}
            disabled={pending}
            className="kadosh-btn-primary !py-2 !px-3 text-xs"
          >
            <Send className="h-3.5 w-3.5" />
            {pending ? "Enviando..." : "Enviar n8n"}
          </button>
        )}
      </div>
    </div>
  );
}
