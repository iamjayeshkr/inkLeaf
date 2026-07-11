import { AIProviderConfig } from "../types";

export function cleanAIResponse(text: string): string {
  let clean = text.trim();
  
  // Strip starting markdown code block wrapper if present
  if (clean.startsWith("```")) {
    const lines = clean.split("\n");
    if (lines[0].startsWith("```")) {
      lines.shift();
    }
    if (lines[lines.length - 1] === "```") {
      lines.pop();
    }
    clean = lines.join("\n").trim();
  }
  
  return clean;
}

export async function generateAICopilotText(
  config: AIProviderConfig,
  prompt: string,
  context: string = ""
): Promise<string> {
  const systemPrompt = `You are a helpful AI writing assistant integrated into a Markdown document editor.
Your task is to generate and return clean, well-formatted Markdown text.
Do NOT wrap your entire response in markdown code blocks (like \`\`\`markdown ... \`\`\`). Simply return the prose and markdown tags directly.
Ensure correct alignment and standard markdown headers.`;

  const fullPrompt = context
    ? `System Context:\nThe user is editing a document. The active text or selection is:\n"${context}"\n\nUser Request:\n${prompt}`
    : prompt;

  const endpoint = config.endpoint;
  const model = config.model;

  if (config.id === "ollama") {
    // Ollama chat completions
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: fullPrompt }
        ],
        options: {
          temperature: 0.7,
        },
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama returned status ${response.status}`);
    }

    const data = await response.json();
    return cleanAIResponse(data.message?.content || data.response || "");
  }

  if (config.id === "openai") {
    if (!config.apiKey) throw new Error("API Key is missing for OpenAI");

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: fullPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API returned status ${response.status}`);
    }

    const data = await response.json();
    return cleanAIResponse(data.choices?.[0]?.message?.content || "");
  }

  if (config.id === "claude") {
    if (!config.apiKey) throw new Error("API Key is missing for Claude");

    // Standard Anthropic messages API
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
        "dangerously-allow-browser": "true", // Client side fetch allow
      } as any,
      body: JSON.stringify({
        model: model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          { role: "user", content: fullPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API returned status ${response.status}`);
    }

    const data = await response.json();
    return cleanAIResponse(data.content?.[0]?.text || "");
  }

  if (config.id === "gemini") {
    if (!config.apiKey) throw new Error("API Key is missing for Gemini");

    // Standard Google Gemini API
    const url = `${endpoint}?key=${config.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\n${fullPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    return cleanAIResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "");
  }

  throw new Error("Unsupported AI Provider");
}
