import { Flame, Lock, Mail } from "lucide-react";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen w-full items-center justify-center px-4">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-kadosh-fire/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-kadosh-brown-dark/20 blur-3xl" />
      </div>

      <div className="kadosh-card w-full max-w-md p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-kadosh-fire to-kadosh-fire-dark shadow-[0_8px_24px_rgba(197,89,24,0.4)]">
            <Flame className="h-7 w-7 text-kadosh-beige-light" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-kadosh-beige-light">
            Sistema Kadosh
          </h1>
          <p className="mt-1 text-sm text-kadosh-beige-mid/70">
            Gestão de Louvor, Banda e Sonoplastia
          </p>
        </div>

        <form action={login} className="space-y-4">
          <div>
            <label className="kadosh-label" htmlFor="email">
              E-mail
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kadosh-beige-mid/50" />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="voce@kadosh.com"
                className="kadosh-input pl-10"
              />
            </div>
          </div>

          <div>
            <label className="kadosh-label" htmlFor="password">
              Senha
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-kadosh-beige-mid/50" />
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="kadosh-input pl-10"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          <button type="submit" className="kadosh-btn-primary w-full">
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-kadosh-beige-mid/50">
          Acesso restrito à equipe do Grupo Kadosh. Fale com um administrador para
          receber suas credenciais.
        </p>
      </div>
    </div>
  );
}
