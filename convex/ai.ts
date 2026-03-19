// Eliminamos "use node" para usar el runtime nativo de Convex (V8)
// Esto resuelve el error de "ESM loader" en Windows.

import { action } from "./_generated/server";
import { v } from "convex/values";

async function callGemini(apiKey: string, prompt: string): Promise<string> {
    const models = [
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
    ];
    const baseUrl = "https://generativelanguage.googleapis.com/v1beta";
    let lastError = "";

    for (const model of models) {
        try {
            const response = await fetch(
                `${baseUrl}/models/${model}:generateContent?key=${apiKey}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1024,
                        },
                    }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) return text;
                lastError = "Respuesta vacía de la IA";
            } else {
                const errorText = await response.text().catch(() => "Unknown error");
                lastError = `Status ${response.status}: ${errorText}`;
                // Log only if it's not a standard 404 (we're trying several models)
                if (response.status !== 404) {
                    console.warn(`Modelo ${model} devolvió error ${response.status}`);
                }
            }
        } catch (e: any) {
            lastError = e.message;
        }
    }

    throw new Error(`La IA no pudo procesar la solicitud (último error: ${lastError}). Prueba en unos minutos.`);
}

function parseJSON(text: string): any {
    // Try to extract JSON from the text (Gemini may wrap it in markdown)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        return JSON.parse(jsonStr);
    }
    throw new Error("Could not parse JSON from AI response");
}

export const extractFromPRD = action({
    args: { prdText: v.string() },
    handler: async (ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

        const prompt = `Eres un asistente que analiza documentos de producto (PRD) en español.
Analiza el siguiente PRD y extrae la información para crear una página de lista de espera.

PRD:
${args.prdText}

Responde SOLO con un JSON válido con esta estructura exacta, sin markdown ni explicaciones:
{
  "name": "nombre corto del proyecto (máx 40 caracteres)",
  "description": "descripción corta del proyecto (máx 160 caracteres)",
  "slug": "slug-url-friendly-sin-acentos",
  "headline": "título atractivo para la página de espera (máx 80 caracteres)",
  "subtitle": "subtítulo que explique el valor del producto (máx 200 caracteres)"
}

El contenido debe ser en español. El headline debe ser llamativo y directo. El slug debe ser corto, sin acentos, solo letras minúsculas y guiones.`;

        const result = await callGemini(apiKey, prompt);
        return parseJSON(result);
    },
});

export const generateCopy = action({
    args: {
        name: v.string(),
        description: v.string(),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

        const prompt = `Eres un copywriter experto en español. Genera el copy para una página de lista de espera.

Proyecto: ${args.name}
Descripción: ${args.description}

Responde SOLO con un JSON válido con esta estructura exacta, sin markdown ni explicaciones:
{
  "headline": "título principal atractivo y directo (máx 80 caracteres)",
  "subtitle": "subtítulo que explique el valor y genere interés (máx 200 caracteres)"
}

El copy debe ser en español, profesional, conciso y orientado a la conversión. Debe generar curiosidad y urgencia para inscribirse en la lista de espera.`;

        const result = await callGemini(apiKey, prompt);
        return parseJSON(result);
    },
});

export const generateWithTone = action({
    args: {
        name: v.string(),
        description: v.string(),
        tone: v.string(),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

        const toneDescriptions: Record<string, string> = {
            profesional: "formal, serio, corporativo, que transmita confianza y autoridad",
            casual: "relajado, cercano, conversacional, como hablar con un amigo",
            urgente: "que genere sensación de urgencia, escasez, FOMO, que motive a actuar ya",
            amigable: "cálido, acogedor, empático, que haga sentir bienvenido",
        };

        const toneDesc = toneDescriptions[args.tone] || args.tone;

        const prompt = `Eres un copywriter experto en español. Regenera el copy para una página de lista de espera con un tono ${args.tone}: ${toneDesc}.

Proyecto: ${args.name}
Descripción: ${args.description}

Responde SOLO con un JSON válido con esta estructura exacta, sin markdown ni explicaciones:
{
  "headline": "título principal con tono ${args.tone} (máx 80 caracteres)",
  "subtitle": "subtítulo con tono ${args.tone} (máx 200 caracteres)"
}

El copy debe ser en español, texto plano sin markdown.`;

        const result = await callGemini(apiKey, prompt);
        return parseJSON(result);
    },
});

export const refineCopy = action({
    args: {
        name: v.string(),
        description: v.string(),
        currentHeadline: v.string(),
        currentSubtitle: v.string(),
        instruction: v.string(),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

        const prompt = `Eres un copywriter experto en español. Refina el copy de una página de lista de espera siguiendo las instrucciones del usuario.

Proyecto: ${args.name}
Descripción: ${args.description}

Copy actual:
- Headline: ${args.currentHeadline}
- Subtítulo: ${args.currentSubtitle}

Instrucción del usuario: ${args.instruction}

Responde SOLO con un JSON válido con esta estructura exacta, sin markdown ni explicaciones:
{
  "headline": "headline refinado según la instrucción (máx 80 caracteres)",
  "subtitle": "subtítulo refinado según la instrucción (máx 200 caracteres)"
}

Mantén el copy en español, texto plano sin markdown.`;

        const result = await callGemini(apiKey, prompt);
        return parseJSON(result);
    },
});

export const testGemini = action({
    args: {},
    handler: async (ctx) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return "Error: GEMINI_API_KEY no configurada";

        try {
            const result = await callGemini(apiKey, "Saluda con un Hola Mundo corto.");
            return `Éxito: ${result}`;
        } catch (e: any) {
            return `Error: ${e.message}`;
        }
    },
});
