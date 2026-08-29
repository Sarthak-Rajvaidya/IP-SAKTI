import type {
  AssistantResponse,
  ClassificationAnswer,
  ClassificationResult,
  HistoryItem,
  Jurisdiction,
  ProductContext,
  ABSResult,
  Source,
  KnowledgeNode,
  KnowledgeEdge,
} from '../types';

// ---------------------------------------------------------------------------
// mockApi.ts
//
// Despite the filename (kept for continuity with the original frontend-only
// prototype), this file now calls the REAL FastAPI backend. It remains the
// ONLY place the frontend talks to the backend — every function here
// returns a Promise with the same shape the UI components already expect,
// so no component needed to change when the mock implementation was
// replaced with real `fetch()` calls.
//
// If the backend is unreachable, or a request fails, every function throws
// an `ApiError` with a human-readable message. Pages catch this and render
// an inline error state rather than crashing (see e.g. src/pages/Assistant.tsx).
// ---------------------------------------------------------------------------

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const REQUEST_TIMEOUT_MS = 30_000;

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(`Request to ${path} timed out. Is the IP-SAKTI backend running at ${API_BASE_URL}?`);
    }
    throw new ApiError(
      `Could not reach the IP-SAKTI backend at ${API_BASE_URL}. Make sure FastAPI is running (uvicorn app.main:app --reload --port 8000).`
    );
  }
  clearTimeout(timeout);

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      detail = body.detail || detail;
    } catch {
      // response wasn't JSON — keep statusText
    }
    throw new ApiError(detail, response.status);
  }

  return response.json() as Promise<T>;
}

export async function askAssistant(
  query: string,
  jurisdiction: Jurisdiction,
  context?: Partial<ProductContext>,
  language: string = 'en'
): Promise<AssistantResponse> {
  return apiFetch<AssistantResponse>('/api/assistant/ask', {
    method: 'POST',
    body: JSON.stringify({ query, jurisdiction, context, language }),
  });
}

export async function classifyProduct(
  answers: ClassificationAnswer[]
): Promise<ClassificationResult> {
  return apiFetch<ClassificationResult>('/api/classification', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}

export async function getSources(): Promise<Source[]> {
  const res = await apiFetch<{ india: Source[]; international: Source[] }>('/api/sources');
  return [...res.india, ...res.international];
}

export async function getSourcesByJurisdiction(): Promise<{ india: Source[]; international: Source[] }> {
  return apiFetch('/api/sources');
}

export async function getKnowledgeGraph(): Promise<{ nodes: KnowledgeNode[]; edges: KnowledgeEdge[] }> {
  return apiFetch('/api/knowledge-graph');
}

export async function getHistory(): Promise<HistoryItem[]> {
  return apiFetch<HistoryItem[]>('/api/history');
}

export async function assessABS(input: {
  resource: string;
  origin: string;
  commercialIntent: boolean;
  entityType: string;
  useType: string;
}): Promise<ABSResult> {
  return apiFetch<ABSResult>('/api/abs/assess', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function escalateToHuman(payload: {
  query: string;
  areaOfConcern: string;
  jurisdiction: string;
  contactPreference: string;
}): Promise<{ ticketId: string; status: 'pending-review' }> {
  return apiFetch('/api/escalate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getHealth(): Promise<{
  status: string;
  gemini: string;
  qdrant: string;
  embeddings: string;
  collection?: string;
  vectorCount?: number;
}> {
  return apiFetch('/api/health');
}

export async function getConfig(): Promise<{
  appEnv: string;
  geminiConfigured: boolean;
  qdrantConfigured: boolean;
  embeddingModel: string;
  geminiModel: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  debugMode: boolean;
}> {
  return apiFetch('/api/config');
}
