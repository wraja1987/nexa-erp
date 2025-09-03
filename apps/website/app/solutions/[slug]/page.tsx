import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MODULES } from "@nexa/registry";
import ModuleCard from "@/components/ModuleCard";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const mod = MODULES.find(m => m.slug === params.slug);
  if (!mod) return { title: "Module not found • Nexa" };
  return {
    title: `${mod.name} • Nexa`,
    description: mod.blurb,
    alternates: { canonical: `https://www.nexaai.co.uk/solutions/${mod.slug}` },
  };
}

export default function ModulePage({ params }: Props) {
  const mod = MODULES.find(m => m.slug === params.slug);
  if (!mod) return notFound();
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <ModuleCard mod={mod} />
      <div className="prose prose-zinc mt-8">
        <h2>What it does</h2>
        <p>{mod.blurb}</p>
        <h3>Coming next</h3>
        <ul>
          <li>Deeper walkthrough, screenshots, and FAQs.</li>
        </ul>
      </div>
    </main>
  );
}
