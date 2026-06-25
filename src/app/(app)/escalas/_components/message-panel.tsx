"use client";

import { useState, useTransition } from "react";
import { Check, Copy, MessageSquareText, Send, Sparkles } from "lucide-react";
import { buildScheduleMessage, copyToClipboard, type ScheduleMessageData } from "@/lib/utils";
import { sendScheduleToN8n } from "../../automacoes/actions";

export function MessagePanel({
  scheduleId,
  messageData,
  initialMessage,
  n8nSent,
}: {
  scheduleId: string;
  messageData: ScheduleMessageData;
  initialMessage: string | null;
  n8nSent: boolean;
}) {
  const [message, setMessage] = useState(initialMessage ?? "");
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  function handleGenerate() {
    setMessage(buildScheduleMessage(messageData));
    setFeedback(null);
  }

  async function handleCopy() {
    if (!message) handleGenerate();
    await copyToClipboard(message || buildScheduleMessage(messageData));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleSendN8n() {
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await sendScheduleToN8n(scheduleId);
        setMessage(result.message);
        setFeedback({ type: "ok", text: "Escala enviada para o n8n com sucesso." });
      } catch (e) {
        setFeedback({ type: "error", text: e instanceof Error ? e.message : "Erro ao enviar." });
      }
    });
  }

  return (
    <div className="kadosh-card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <p className="kadosh-section-title">
          <MessageSquareText className="h-5 w-5 text-kadosh-fire" />
          Mensagem da escala
        </p>
        {n8nSent && (
          <span className="kadosh-badge border-green-500/40 bg-green-500/10 text-green-400">
            Enviado ao n8n
          </span>
        )}
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={14}
        placeholder='Clique em "Gerar mensagem" para montar o texto pronto para o WhatsApp.'
        className="kadosh-input resize-none font-mono text-xs leading-relaxed"
      />

      {feedback && (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            feedback.type === "ok"
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {feedback.text}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button onClick={handleGenerate} className="kadosh-btn-secondary">
          <Sparkles className="h-4 w-4" />
          Gerar mensagem da escala
        </button>
        <button onClick={handleCopy} className="kadosh-btn-secondary">
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado!" : "Copiar mensagem"}
        </button>
        <button onClick={handleSendN8n} disabled={pending} className="kadosh-btn-primary">
          <Send className="h-4 w-4" />
          {pending ? "Enviando..." : "Enviar para n8n"}
        </button>
      </div>
    </div>
  );
}
