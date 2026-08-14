import Link from "next/link";
import type { Metadata } from "next";
import { ShaderHero } from "@/views/ShaderHero";

export const metadata: Metadata = {
  title: "Protein Explorer",
  description: "Search proteins via UniProt, ask an AI assistant, and explore molecules in 3D.",
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08090f]">
      <ShaderHero />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <span className="material-symbols-outlined fill mb-4 text-5xl text-white/90">biotech</span>
        <h1 className="font-heading text-4xl font-bold text-white drop-shadow-lg sm:text-6xl">
          Protein Explorer
        </h1>
        <p className="mt-4 max-w-xl text-lg text-white/85 drop-shadow">
          Search real UniProt data, ask an AI assistant about any protein, and explore molecular
          structure in 3D.
        </p>
        <Link
          href="/search"
          prefetch={false}
          className="mt-8 rounded-lg bg-white px-6 py-3 font-bold text-[#08090f] shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#08090f]"
        >
          Open the app
        </Link>
      </div>
    </main>
  );
}
