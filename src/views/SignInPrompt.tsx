import Link from "next/link";

type SignInPromptProps = {
  from: string;
  message: string;
};

export function SignInPrompt({ from, message }: SignInPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6 border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest">
      <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">lock</span>
      <p className="text-sm text-on-surface-variant max-w-sm mb-4">{message}</p>
      <Link
        href={`/login?from=${encodeURIComponent(from)}`}
        className="rounded-lg bg-primary text-on-primary px-4 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
      >
        Log in
      </Link>
    </div>
  );
}
