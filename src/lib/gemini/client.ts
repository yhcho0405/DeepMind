import { getSettings } from "../storage";
import { type AnalysisResult, AnalysisResultSchema, type CreativeResult, CreativeResultSchema } from "../schemas";
import type { ZodSchema } from "zod";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// ── Generic Gemini JSON call with Zod validation + retry ───────────

export async function callGeminiJSON<T>(
  model: string,
  parts: GeminiPart[],
  zodSchema: ZodSchema<T>,
  jsonSchema?: Record<string, unknown>,
  retryCount = 0,
): Promise<T> {
  const settings = getSettings();
  if (!settings.apiKey) throw new Error("API 키가 설정되지 않았습니다. Settings에서 Gemini API 키를 입력해주세요.");

  const url = `${BASE_URL}/${model}:generateContent?key=${settings.apiKey}`;

  const body: Record<string, unknown> = {
    contents: [{ parts }],
    generationConfig: {
      response_mime_type: "application/json",
      ...(jsonSchema ? { response_schema: jsonSchema } : {}),
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API 오류 (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("Gemini API에서 텍스트 응답이 없습니다.");

  try {
    const parsed = JSON.parse(text);
    const validated = zodSchema.parse(parsed);
    return validated;
  } catch (e) {
    if (retryCount < 1) {
      // Retry with corrective prompt
      const retryParts: GeminiPart[] = [
        ...parts,
        { text: "\n\n[SYSTEM CORRECTION] Your previous response was not valid JSON matching the required schema. Return ONLY valid JSON matching the exact schema. No extra text." },
      ];
      return callGeminiJSON(model, retryParts, zodSchema, jsonSchema, retryCount + 1);
    }
    throw new Error(`JSON 파싱/검증 실패: ${e instanceof Error ? e.message : String(e)}`);
  }
}

// ── Analysis call ──────────────────────────────────────────────────

export async function callAnalysis(imageBase64: string, mimeType: string): Promise<AnalysisResult> {
  const { analysisModel } = getSettings();

  const parts: GeminiPart[] = [
    {
      inline_data: {
        mime_type: mimeType,
        data: imageBase64,
      },
    },
    { text: ANALYSIS_PROMPT },
  ];

  return callGeminiJSON(
    analysisModel,
    parts,
    AnalysisResultSchema,
    undefined, // Let model follow prompt instructions
  );
}

// ── Creative call ──────────────────────────────────────────────────

export async function callCreative(
  promptText: string,
): Promise<CreativeResult> {
  const { analysisModel } = getSettings();

  const parts: GeminiPart[] = [{ text: promptText }];

  return callGeminiJSON(analysisModel, parts, CreativeResultSchema);
}

// ── Image generation ───────────────────────────────────────────────

export async function callGeminiImage(prompt: string): Promise<Blob> {
  const settings = getSettings();
  if (!settings.apiKey) throw new Error("API 키가 설정되지 않았습니다.");

  const url = `${BASE_URL}/${settings.imageModel}:generateContent?key=${settings.apiKey}`;

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      response_modalities: ["IMAGE", "TEXT"],
      response_mime_type: "image/png",
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`이미지 생성 오류 (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const imgPart = data?.candidates?.[0]?.content?.parts?.find(
    (p: { inline_data?: { mime_type: string; data: string } }) => p.inline_data?.mime_type?.startsWith("image/")
  );

  if (!imgPart?.inline_data?.data) {
    throw new Error("이미지 생성 결과가 없습니다.");
  }

  // Decode base64 to Blob
  const binary = atob(imgPart.inline_data.data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: imgPart.inline_data.mime_type || "image/png" });
}

// ── TTS call ───────────────────────────────────────────────────────

export async function callGeminiTTS(ssml: string): Promise<Blob> {
  const settings = getSettings();
  if (!settings.apiKey) throw new Error("API 키가 설정되지 않았습니다.");

  const url = `${BASE_URL}/${settings.ttsModel}:generateContent?key=${settings.apiKey}`;

  const body = {
    contents: [
      {
        parts: [{ text: ssml }],
      },
    ],
    generationConfig: {
      response_modalities: ["AUDIO"],
      speech_config: {
        voice_config: {
          prebuilt_voice_config: {
            voice_name: settings.ttsVoice,
          },
        },
      },
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`TTS 오류 (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const audioPart = data?.candidates?.[0]?.content?.parts?.find(
    (p: { inline_data?: { mime_type: string; data: string } }) => p.inline_data?.mime_type?.startsWith("audio/")
  );

  if (!audioPart?.inline_data?.data) {
    throw new Error("TTS 오디오 생성 결과가 없습니다.");
  }

  const binary = atob(audioPart.inline_data.data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: audioPart.inline_data.mime_type || "audio/wav" });
}

// ── Helper: File to base64 ─────────────────────────────────────────

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Types ──────────────────────────────────────────────────────────

interface GeminiPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

// ── Analysis Prompt (imported inline) ──────────────────────────────

const ANALYSIS_PROMPT = `You are an expert urban infrastructure inspector AI. Analyze the provided photo for infrastructure defects or hazards.

## CRITICAL RULES
1. Return ONLY valid JSON. No extra text, no markdown.
2. Be CONSERVATIVE with scores. Most issues are 20-60 range. Only severe issues (deep sinkholes, collapsed structures) deserve 70+.
3. Every evidence point must describe something VISIBLE in the photo. No speculation.
4. Choose exactly ONE primary issue_type from the enum.

## SCORING RUBRIC
| Score Range | Inconvenience | Risk |
|-------------|---------------|------|
| 0-19        | Minor cosmetic, barely noticeable | No safety concern |
| 20-39       | Noticeable but walkable/drivable | Minor trip hazard |
| 40-59       | Causes detours or slowdowns | Moderate injury potential |
| 60-79       | Significant daily disruption | Serious injury likely without fix |
| 80-100      | Area unusable, emergency | Life-threatening, immediate danger |

## FEW-SHOT EXAMPLES
- Small sidewalk crack (2cm): inconvenience=15, risk=10
- Medium pothole on road (10cm deep): inconvenience=45, risk=40
- Large sinkhole blocking lane: inconvenience=75, risk=80
- Broken streetlight in dark alley: inconvenience=35, risk=50

## OUTPUT JSON SCHEMA
{
  "analysis_id": "string (generate a unique short ID like 'SEOUL-2026-XXXX')",
  "issue_name_ko": "string (Korean name of the issue, e.g., '도로 균열')",
  "issue_name_en": "string (English name)",
  "issue_type": "pothole|crack|sinkhole|broken_sidewalk|damaged_guardrail|faulty_streetlight|water_leak|debris|broken_sign|accessibility_obstacle|other",
  "inconvenience": "integer 0-100",
  "risk": "integer 0-100",
  "confidence": "float 0-1 (how confident you are in analysis)",
  "evidence": ["2-4 short sentences describing VISIBLE damage, no speculation"]
}`;

