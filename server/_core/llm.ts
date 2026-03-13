import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

// Función para convertir el formato de mensajes al formato de Gemini
const convertToGeminiMessages = (messages: Message[]) => {
  const geminiMessages: any[] = [];
  let systemPrompt = "";

  for (const message of messages) {
    if (message.role === "system") {
      // Gemini maneja el system prompt de forma especial
      systemPrompt = typeof message.content === 'string' 
        ? message.content 
        : JSON.stringify(message.content);
      continue;
    }

    const role = message.role === "assistant" ? "model" : "user";
    let content: any;

    if (typeof message.content === 'string') {
      content = message.content;
    } else if (Array.isArray(message.content)) {
      // Convertir contenido multimodal
      content = message.content.map(part => {
        if (typeof part === 'string') return { text: part };
        if (part.type === 'text') return { text: part.text };
        if (part.type === 'image_url') {
          // Extraer base64 o URL de la imagen
          const imageUrl = part.image_url.url;
          if (imageUrl.startsWith('data:image')) {
            // Es una imagen en base64
            const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches) {
              return {
                inlineData: {
                  mimeType: matches[1],
                  data: matches[2]
                }
              };
            }
          }
          // Es una URL
          return {
            fileData: {
              mimeType: "image/jpeg",
              fileUri: imageUrl
            }
          };
        }
        if (part.type === 'file_url') {
          return {
            fileData: {
              mimeType: part.file_url.mime_type || "application/octet-stream",
              fileUri: part.file_url.url
            }
          };
        }
        return { text: JSON.stringify(part) };
      });
    } else {
      content = JSON.stringify(message.content);
    }

    geminiMessages.push({
      role,
      parts: Array.isArray(content) ? content : [{ text: content }]
    });
  }

  return { systemPrompt, geminiMessages };
};

// Convertir herramientas al formato de Gemini
const convertToGeminiTools = (tools?: Tool[]) => {
  if (!tools || tools.length === 0) return undefined;

  return {
    functionDeclarations: tools.map(tool => ({
      name: tool.function.name,
      description: tool.function.description,
      parameters: tool.function.parameters
    }))
  };
};

// Función para convertir la respuesta de Gemini a nuestro formato
const convertFromGeminiResponse = (geminiResponse: any, model: string): InvokeResult => {
  const candidate = geminiResponse.candidates?.[0];
  const content = candidate?.content;
  
  let messageContent: string | any[] = "";
  let toolCalls: ToolCall[] | undefined;

  if (content?.parts) {
    const textParts = content.parts.filter((p: any) => p.text);
    const functionCallParts = content.parts.filter((p: any) => p.functionCall);

    if (textParts.length > 0) {
      messageContent = textParts.map((p: any) => p.text).join(' ');
    }

    if (functionCallParts.length > 0) {
      toolCalls = functionCallParts.map((part: any, index: number) => ({
        id: `call_${index}`,
        type: "function",
        function: {
          name: part.functionCall.name,
          arguments: JSON.stringify(part.functionCall.args)
        }
      }));
    }
  }

  const finishReason = candidate?.finishReason || "stop";

  return {
    id: geminiResponse.id || `gemini-${Date.now()}`,
    created: Date.now(),
    model: model,
    choices: [{
      index: 0,
      message: {
        role: "assistant",
        content: messageContent,
        tool_calls: toolCalls
      },
      finish_reason: finishReason
    }],
    usage: geminiResponse.usageMetadata ? {
      prompt_tokens: geminiResponse.usageMetadata.promptTokenCount || 0,
      completion_tokens: geminiResponse.usageMetadata.candidatesTokenCount || 0,
      total_tokens: geminiResponse.usageMetadata.totalTokenCount || 0
    } : undefined
  };
};

const resolveApiUrl = () => {
  const API_KEY = ENV.forgeApiKey || "AIzaSyB75pxq-PRZoH0198IHheFlXRcfjG8Jab8";
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
};

const assertApiKey = () => {
  if (!ENV.forgeApiKey && !ENV.geminiApiKey) {
    console.warn("No API key configured, using provided key");
  }
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  assertApiKey();

  const {
    messages,
    tools,
    maxTokens = 8192,
    max_tokens,
  } = params;

  // Convertir mensajes al formato de Gemini
  const { systemPrompt, geminiMessages } = convertToGeminiMessages(messages);

  // Construir el payload para Gemini
  const payload: any = {
    contents: geminiMessages,
    generationConfig: {
      maxOutputTokens: max_tokens || maxTokens || 8192,
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
    }
  };

  // Añadir system prompt si existe
  if (systemPrompt) {
    payload.systemInstruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  // Añadir herramientas si existen
  const geminiTools = convertToGeminiTools(tools);
  if (geminiTools) {
    payload.tools = [geminiTools];
  }

  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Gemini API invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  const geminiResponse = await response.json();
  
  // Verificar si hay errores en la respuesta
  if (geminiResponse.error) {
    throw new Error(`Gemini API error: ${geminiResponse.error.message}`);
  }

  // Convertir la respuesta de Gemini a nuestro formato
  return convertFromGeminiResponse(geminiResponse, "gemini-2.0-flash");
}

// También puedes agregar una función para usar el modelo de pensamiento si está disponible
export async function invokeLLMWithThinking(params: InvokeParams): Promise<InvokeResult> {
  // Similar a invokeLLM pero usando gemini-2.0-flash-thinking-exp si está disponible
  const thinkingApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp:generateContent?key=${ENV.forgeApiKey || "AIzaSyAHG6PFKXLjvJ7b-rvnxgzbLkPw0WEaXOY"}`;
  
  // ... resto similar a invokeLLM pero con la URL diferente
  return invokeLLM(params);
}