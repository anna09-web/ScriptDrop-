import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(await authHeader()),
  };

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Couldn't reach the server. Check your connection and try again.",
      0,
    );
  }

  let payload: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!res.ok) {
    const message =
      (payload as { error?: string } | null)?.error ??
      'Something went wrong. Please try again.';
    throw new ApiError(message, res.status);
  }

  return payload as T;
}

export interface Profile {
  email: string;
  credits: number;
  total_credits_purchased: number;
  total_generations: number;
  created_at: string;
}

export interface Script {
  title: string;
  visual_cue: string;
  script: string;
  word_count: number;
  estimated_duration: string;
}

export interface GenerateInput {
  product: string;
  platform: string;
  hookStyle: string;
  tone: string;
}

export const api = {
  getMe: () => request<Profile>('/api/me'),

  generate: (input: GenerateInput) =>
    request<{ scripts: Script[] }>('/api/generate', {
      method: 'POST',
      body: input,
    }),

  checkout: (packId: string) =>
    request<{ url: string }>('/api/checkout', {
      method: 'POST',
      body: { packId },
    }),
};
