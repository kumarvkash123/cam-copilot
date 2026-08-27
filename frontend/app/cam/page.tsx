"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, FileText, Loader2, Sparkles, Send, CheckCircle2 } from "lucide-react";
import { api, DocumentItem, AskResponse } from "@/lib/api";

type Turn = { query: string; response: AskResponse | null; error?: string };

export default function CAMPage() {
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [query, setQuery] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [asking, setAsking] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  function loadDocs() {
    api.listDocuments().then(setDocs).catch(() => {});
  }

  useEffect(() => {
    loadDocs();
    // poll while anything is still uploaded/processing, so status updates without a manual refresh
    const interval = setInterval(() => {
      loadDocs();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await api.uploadDocument(file);
      }
      loadDocs();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function startCAM() {
    setProcessing(true);
    try {
      const res = await api.startCAM();
      loadDocs();
      if (res.processed === 0) alert(res.message);
    } catch (err: any) {
      alert(`Processing failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  }

  async function ask() {
    if (!query.trim() || asking) return;
    const q = query;
    setQuery("");
    setAsking(true);
    setTurns((prev) => [...prev, { query: q, response: null }]);
    try {
      const res = await api.ask(q);
      setTurns((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { query: q, response: res };
        return copy;
      });
    } catch (err: any) {
      setTurns((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { query: q, response: null, error: err.message };
        return copy;
      });
    } finally {
      setAsking(false);
    }
  }

  const hasUnprocessed = docs.some((d) => d.status === "uploaded");
  const hasProcessed = docs.some((d) => d.status === "processed");

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold text-ink mb-1">CAM Copilot</h1>
      <p className="text-sm text-ink/50 mb-6">Upload documents, start CAM to chunk &amp; index them, then ask anything about them.</p>

      <div className="grid grid-cols-5 gap-6">
        {/* Left: upload + doc list + start CAM */}
        <div className="col-span-2 space-y-4">
          <div
            className="card border-dashed border-2 p-6 text-center cursor-pointer hover:bg-gray-50/60"
            onClick={() => fileInput.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleUpload(e.dataTransfer.files);
            }}
          >
            <input ref={fileInput} type="file" multiple accept=".pdf" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-ink/50 text-sm">
                <Loader2 size={16} className="animate-spin" /> Uploading…
              </div>
            ) : (
              <>
                <Upload className="mx-auto mb-2 text-ink/30" size={22} />
                <p className="text-sm text-ink/60">Drop PDFs here, or click to browse</p>
              </>
            )}
          </div>

          <div className="card divide-y divide-line">
            {docs.length === 0 && <div className="p-5 text-center text-sm text-ink/40">No files uploaded yet.</div>}
            {docs.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                <FileText size={15} className="text-ink/40 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-ink truncate">{d.filename}</div>
                  {d.status === "processed" && <div className="text-[11px] text-ink/40">{d.chunk_count} chunks indexed</div>}
                </div>
                <StatusBadge status={d.status} />
              </div>
            ))}
          </div>

          <button onClick={startCAM} disabled={processing || !hasUnprocessed} className="btn-primary w-full flex items-center justify-center gap-2">
            {processing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {hasUnprocessed ? "Start CAM (chunk & index new files)" : "All files processed"}
          </button>
        </div>

        {/* Right: ask panel */}
        <div className="col-span-3 flex flex-col h-[calc(100vh-200px)]">
          <div className="flex-1 overflow-y-auto space-y-5 pr-1">
            {turns.length === 0 && (
              <div className="text-sm text-ink/50">
                {hasProcessed
                  ? "Ask anything about your uploaded documents — answers are grounded in the indexed chunks and generated by Groq."
                  : "Upload files and click \"Start CAM\" before asking questions."}
              </div>
            )}
            {turns.map((t, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-end">
                  <div className="bg-accent text-white text-sm rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[85%]">{t.query}</div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[90%] w-full">
                    {!t.response && !t.error && (
                      <div className="flex items-center gap-2 text-ink/40 text-sm px-1">
                        <Loader2 size={14} className="animate-spin" /> Retrieving evidence &amp; asking Groq…
                      </div>
                    )}
                    {t.error && <div className="text-sm text-red-600 px-1">Error: {t.error}</div>}
                    {t.response && (
                      <div className="card p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 size={13} className="text-emerald-600" />
                          <span className="text-[11px] text-ink/50">{t.response.evidence.length} evidence chunks used</span>
                        </div>
                        <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">{t.response.answer}</p>
                        {t.response.evidence.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-line space-y-2">
                            {t.response.evidence.map((e, idx) => (
                              <div key={idx} className="text-xs bg-gray-50 rounded-lg px-3 py-2 border border-line">
                                <div className="flex justify-between text-ink/50 mb-1">
                                  <span className="font-medium text-ink/70">
                                    {e.filename} · p.{e.page}
                                  </span>
                                  <span>{Math.round(e.score * 100)}% match</span>
                                </div>
                                <p className="text-ink/60 line-clamp-2">{e.snippet}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-line mt-4 flex items-center gap-2">
            <input
              className="input"
              placeholder="Ask about your uploaded documents…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              disabled={!hasProcessed}
            />
            <button onClick={ask} disabled={asking || !hasProcessed} className="btn-primary flex items-center justify-center w-10 h-10 !px-0 shrink-0">
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = { uploaded: "Uploaded", processing: "Processing…", processed: "CAM Ready", failed: "Failed" };
  return <span className={`badge badge-${status} shrink-0`}>{labels[status] || status}</span>;
}
