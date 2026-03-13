import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type Message = {
  role: Role;
  content: any;
  name?: string;
};

export type InvokeParams = {
  messages: Message[];
  maxTokens?: number;
  max_tokens?: number;
  response_format?: any;
  responseFormat?: any;
};

export type InvokeResult = {
  id: string;
  choices: Array<{
    message: {
      role: Role;
      content: string;
    };
  }>;
};

// Conexión directa a Google Gemini (Modo compatibilidad OpenAI)
const resolveApiUrl = () => {
  const apiKey = ENV.forgeApiKey;
  return `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions?key=${apiKey}`;
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  if (!ENV.forgeApiKey) {
    throw new Error("Falta la API Key en BUILT_IN_FORGE_API_KEY");
  }

  const { messages, response_format, responseFormat, max_tokens, maxTokens } = params;

  // Normalizamos los mensajes para que Google no se queje (Error 400)
  const normalizedMessages = messages.map(msg => {
    // Google prefiere 'system', 'user' o 'assistant'
    let role = msg.role;
    if (role === 'function' || role === 'tool') role = 'assistant';

    return {
      role: role,
      content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
    };
  });

  const payload: any = {
    model: "gemini-1.5-flash",
    messages: normalizedMessages,
    temperature: 0.7,
    max_tokens: max_tokens || maxTokens || 4000
  };

  // Si el scraper pide JSON, se lo indicamos correctamente
  const format = response_format || responseFormat;
  if (format) {
    payload.response_format = format;
  }

  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("DETALLE ERROR GOOGLE:", JSON.stringify(data));
    // Esto nos dirá exactamente qué palabra no le gusta a Google
    const msg = data.error?.message || "Error 400: Revisa el formato del prompt";
    throw new Error(`Error de IA (${response.status}): ${msg}`);
  }

  return data as InvokeResult;
}