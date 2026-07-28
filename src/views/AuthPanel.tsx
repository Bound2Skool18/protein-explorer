import { useState } from "react";

type AuthPanelProps = {
  error: string | null;
  onLogin: (email: string, password: string) => void;
  onRegister: (email: string, password: string) => void;
};

export function AuthPanel({ error, onLogin, onRegister }: AuthPanelProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    onLogin(email, password);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form
        onSubmit={handleLogin}
        className="mx-auto w-full max-w-sm space-y-4 p-8 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined fill">biotech</span>
          </div>
          <h1 className="font-heading text-lg font-bold text-on-surface">Protein Explorer</h1>
        </div>
        <p className="text-sm text-on-surface-variant">Sign in to save favorite proteins.</p>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-on-surface">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-on-surface focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm font-medium text-on-surface">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-lg border border-outline-variant px-3 py-2 text-on-surface focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-primary text-on-primary px-4 py-2 font-bold hover:opacity-90 transition-opacity"
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => onRegister(email, password)}
            className="rounded-lg border border-outline-variant px-4 py-2 text-on-surface hover:bg-surface-container-low transition-colors"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}
