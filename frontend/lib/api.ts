const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export type DocumentItem = {
  id: string;
  filename: string;
  status: "uploaded" | "processing" | "processed" | "failed";
  chunk_count: number;
  uploaded_at: string;
};

export type Evidence = { filename: string; page: number; score: number; snippet: string };
export type AskResponse = { answer: string; evidence: Evidence[] };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listDocuments: () => request<DocumentItem[]>("/documents"),

  uploadDocument: async (file: File): Promise<DocumentItem> => {
    const formData = new FormData();
    formData.append("file", file);
    return request<DocumentItem>("/documents/upload", { method: "POST", body: formData });
  },

  startCAM: () => request<{ message: string; processed: number }>("/documents/start-cam", { method: "POST" }),

  ask: (query: string) =>
    request<AskResponse>("/documents/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }),
};
