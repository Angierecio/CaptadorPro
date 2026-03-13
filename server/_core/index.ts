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
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4";
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

export type ToolChoice = ToolChoicePrimitive | ToolChoiceByName | ToolChoiceExplicit;

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

// Función para convertir mensajes al formato de Gemini
const convertToGeminiMessages = (messages: Message[]) => {
  const geminiMessages: any[] = [];
  let systemPrompt = "";

  for (const message of messages) {
    if (message.role === "system") {
      systemPrompt = typeof message.content === 'string' 
        ? message.content 
        : JSON.stringify(message.content);
      continue;
    }

    const role = message.role === "assistant" ? "model" : "user";
    let content: any;

    if (typeof message.content === 'string') {
      content = [{ text: message.content }];
    } else if (Array.isArray(message.content)) {
      content = message.content.map(part => {
        if (typeof part === 'string') return { text: part };
        if (part.type === 'text') return { text: part.text };
        if (part.type === 'image_url') {
          const imageUrl = part.image_url.url;
          if (imageUrl.startsWith('data:image')) {
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
      content = [{ text: JSON.stringify(message.content) }];
    }

    geminiMessages.push({
      role,
      parts: content
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

// Función para convertir respuesta de Gemini a nuestro formato
const convertFromGeminiResponse = (geminiResponse: any, model: string): InvokeResult => {
  const candidate = geminiResponse.candidates?.[0];
  const content = candidate?.content;
  
  let messageContent: string = "";
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
  if (!ENV.forgeApiKey) {
    throw new Error("forgeApiKey no está configurada en las variables de entorno");
  }
  return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${ENV.forgeApiKey}`;
};

const assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("API key de Gemini no está configurada");
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

  const { systemPrompt, geminiMessages } = convertToGeminiMessages(messages);

  const payload: any = {
    contents: geminiMessages,
    generationConfig: {
      maxOutputTokens: max_tokens || maxTokens || 8192,
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
    }
  };

  if (systemPrompt) {
    payload.systemInstruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  const geminiTools = convertToGeminiTools(tools);
  if (geminiTools) {
    payload.tools = [geminiTools];
  }

  try {
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
    
    if (geminiResponse.error) {
      throw new Error(`Gemini API error: ${geminiResponse.error.message}`);
    }

    return convertFromGeminiResponse(geminiResponse, "gemini-2.0-flash");
  } catch (error) {
    console.error("Error en invokeLLM:", error);
    throw error;
  }
}