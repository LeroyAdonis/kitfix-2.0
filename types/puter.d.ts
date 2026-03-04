/**
 * Minimal type declarations for Puter.js v2 (loaded via CDN script).
 * Only covers the puter.ai.chat() API surface used in this project.
 * @see https://docs.puter.com/AI/chat/
 */

interface PuterAIChatOptions {
  model?: string;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

interface PuterAIChatMessage {
  role: string;
  content: string;
}

interface PuterAIChatResponse {
  message: PuterAIChatMessage;
}

/** A single chunk emitted when streaming is enabled via { stream: true }. */
interface PuterAIStreamChunk {
  text: string;
}

interface PuterAI {
  /** Streaming overload — returns an async iterable of text chunks. */
  chat(
    prompt: string,
    image: string | string[] | File,
    options: PuterAIChatOptions & { stream: true },
  ): Promise<AsyncIterable<PuterAIStreamChunk>>;

  /** Non-streaming overload (default) — returns the full response. */
  chat(
    prompt: string,
    imageOrOptions?: string | string[] | File | PuterAIChatOptions,
    options?: PuterAIChatOptions,
  ): Promise<PuterAIChatResponse>;
}

interface Puter {
  ai: PuterAI;
}

declare global {
  var puter: Puter | undefined;
  interface Window {
    puter?: Puter;
  }
}

export {};
