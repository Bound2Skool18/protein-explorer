import { searchProteins } from "@/services/uniprot";

export const dynamic = "force-dynamic";

async function checkUniProt() {
  const startedAt = Date.now();
  try {
    const results = await searchProteins("insulin", 1);
    return {
      ok: true as const,
      latencyMs: Date.now() - startedAt,
      sample: results[0] ?? null,
    };
  } catch (err) {
    return {
      ok: false as const,
      latencyMs: Date.now() - startedAt,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

function checkEnv() {
  const required = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_DATABASE_URL",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  ];
  return required.map((key) => ({ key, present: Boolean(process.env[key]) }));
}

export default async function HealthPage() {
  const uniprot = await checkUniProt();
  const env = checkEnv();
  const envOk = env.every((e) => e.present);

  return (
    <main className="min-h-screen bg-background text-on-background p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="font-heading text-2xl font-bold">Health Check</h1>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-bold">UniProt API</h2>
            <span
              className={
                uniprot.ok
                  ? "text-sm font-medium text-secondary"
                  : "text-sm font-medium text-error"
              }
            >
              {uniprot.ok ? "OK" : "FAILED"}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mb-2">Latency: {uniprot.latencyMs}ms</p>
          {uniprot.ok ? (
            <pre className="text-xs bg-surface-container-low rounded-lg p-3 overflow-x-auto">
              {JSON.stringify(uniprot.sample, null, 2)}
            </pre>
          ) : (
            <p className="text-sm text-error">{uniprot.error}</p>
          )}
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-bold">Environment Variables</h2>
            <span
              className={
                envOk ? "text-sm font-medium text-secondary" : "text-sm font-medium text-error"
              }
            >
              {envOk ? "OK" : "MISSING"}
            </span>
          </div>
          <ul className="text-sm space-y-1">
            {env.map((e) => (
              <li key={e.key} className="flex justify-between">
                <span className="font-mono text-xs text-on-surface-variant">{e.key}</span>
                <span className={e.present ? "text-secondary" : "text-error"}>
                  {e.present ? "set" : "missing"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-xs text-on-surface-variant">
          Rendered server-side at {new Date().toISOString()}
        </p>
      </div>
    </main>
  );
}
