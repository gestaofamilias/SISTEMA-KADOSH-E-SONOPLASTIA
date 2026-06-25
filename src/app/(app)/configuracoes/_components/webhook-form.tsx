"use client";

import { useState, useTransition } from "react";
import { Check, Save } from "lucide-react";
import { setN8nWebhookUrl } from "../../automacoes/actions";

export function WebhookForm({ initialUrl }: { initialUrl: string }) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSubmit(formData: FormData) {
    setSaved(false);
    startTransition(async () => {
      await setN8nWebhookUrl(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-3">
      <div>
        <label className="kadosh-label" htmlFor="webhook_url">URL do webhook n8n</label>
        <input
          id="webhook_url"
          name="webhook_url"
          type="url"
          defaultValue={initialUrl}
          placeholder="https://seu-n8n.com/webhook/kadosh-escalas"
          className="kadosh-input"
        />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="kadosh-btn-primary">
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {pending ? "Salvando..." : saved ? "Salvo!" : "Salvar webhook"}
        </button>
        <p className="text-xs text-kadosh-beige-mid/50">
          Usado pelo botão &quot;Enviar para n8n&quot; dentro de cada escala.
        </p>
      </div>
    </form>
  );
}
