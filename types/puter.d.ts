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

interface PuterAI {
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
}

export {};
