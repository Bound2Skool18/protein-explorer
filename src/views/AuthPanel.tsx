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
    <form onSubmit={handleLogin} className="mx-auto max-w-sm space-y-4 p-6">
      <h1 className="text-xl font-medium">Protein Explorer</h1>
      <p className="text-sm text-gray-600">Sign in to save favorite proteins.</p>

      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          className="w-full rounded border px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded border px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button type="submit" className="rounded bg-black px-4 py-2 text-white">
          Log in
        </button>
        <button
          type="button"
          onClick={() => onRegister(email, password)}
          className="rounded border px-4 py-2"
        >
          Register
        </button>
      </div>
    </form>
  );
}
