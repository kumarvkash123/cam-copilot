"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Network, ScrollText, ArrowRight } from "lucide-react";
import { api, DocumentItem } from "@/lib/api";

export default function DashboardPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);

  useEffect(() => {
    api.listDocuments().then(setDocs).catch(() => setDocs([]));
  }, []);

  const total = docs.length;
  const uploaded = docs.filter((d) => d.status === "uploaded").length;
  const processed = docs.filter((d) => d.status === "processed").length;
  const failed = docs.filter((d) => d.status === "failed").length;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-1">Credit Officer Dashboard</h1>
      <p className="text-sm text-ink/50 mb-6"></p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <SummaryCard label="Documents" value={total} />
        <SummaryCard label="Uploaded" value={uploaded} />
        <SummaryCard label="CAM Ready" value={processed} />
        <SummaryCard label="Failed" value={failed} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Network size={16} className="text-accent" />
            <h2 className="text-sm font-semibold text-accent uppercase tracking-wide">Corporate Relationship Graph</h2>
          </div>
          <div className="flex items-center justify-center py-10 text-sm text-ink/40 border border-dashed border-line rounded-lg">
            Coming next — not built in this pass
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <ScrollText size={16} className="text-accent2" />
            <h2 className="text-sm font-semibold text-accent2 uppercase tracking-wide">Policy Copilot</h2>
          </div>
          <p className="text-sm text-ink/70 mb-3">Ask: "What is the applicable exposure limit?"</p>
          <ul className="text-xs text-ink/50 space-y-1 mb-4">
            <li>✓ Current policy version</li>
            <li>✓ Clause + page citation</li>
            <li>✓ Effective date</li>
          </ul>
          <div className="flex items-center justify-center py-6 text-sm text-ink/40 border border-dashed border-line rounded-lg">
            Coming next — not built in this pass
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-ink">Recent Documents</h2>
          <Link href="/cam" className="text-xs text-accent font-medium flex items-center gap-1 hover:underline">
            Go to CAM workspace <ArrowRight size={12} />
          </Link>
        </div>
        {docs.length === 0 ? (
          <div className="text-sm text-ink/40 py-6 text-center">No documents uploaded yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink/40 uppercase border-b border-line">
                <th className="pb-2 font-medium">Filename</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Chunks</th>
              </tr>
            </thead>
            <tbody>
              {docs.slice(0, 6).map((d) => (
                <tr key={d.id} className="border-b border-line last:border-0">
                  <td className="py-2.5 text-ink">{d.filename}</td>
                  <td className="py-2.5">
                    <span className={`badge badge-${d.status}`}>{d.status}</span>
                  </td>
                  <td className="py-2.5 text-ink/60">{d.chunk_count || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <div className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">{label}</div>
      <div className="text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}
