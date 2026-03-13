import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type MessageContent = string | { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } };

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type InvokeParams = {
  messages: Message[];
  maxTokens?: number;
  outputSchema?: any;
  output_schema?: any;     // Añadimos esto
  responseFormat?: any;    // Añadimos esto
  response_format?: any;   // Añadimos esto
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

// LIMPIEZA DE LA URL: Google prefiere la API Key en la URL para evitar errores 404
const resolveApiUrl = () => {
  const apiKey = ENV.forgeApiKey;
  return `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions?key=${apiKey}`;
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  if (!ENV.forgeApiKey) {
    throw new Error("API Key de Gemini no configurada en Railway");
  }

  const { messages } = params;

  // PAYLOAD SIMPLIFICADO: Eliminamos 'thinking' y modelos inexistentes
  const payload = {
    model: "gemini-1.5-flash",
    messages: messages.map(msg => ({
      role: msg.role === "assistant" ? "assistant" : msg.role === "system" ? "system" : "user",
      content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content)
    })),
    temperature: 0.7,
  };

  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("DEBUG Google Error:", JSON.stringify(data));
    throw new Error(
      `Error de IA (${response.status}): ${data.error?.message || "Fallo desconocido"}`
    );
  }

  return data as InvokeResult;
  }
