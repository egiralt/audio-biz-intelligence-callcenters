/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Type } from "@google/genai";
import { TranscriptionSegment, Emotion } from "../types";

const parseJson = (text: string) => {
    try {
        const cleanText = text.replace(/```json\n|\n```/g, "").trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("Failed to parse JSON response:", e);
        return [];
    }
};

export const transcribeAudio = async (
  base64Audio: string,
  mimeType: string
): Promise<{ segments: TranscriptionSegment[]; summary: string }> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Using gemini-3-flash-preview for fast multimodal processing
  const modelId = "gemini-3-flash-preview";

  const prompt = `
    Eres un experto asistente de transcripción y análisis de llamadas médicas para la clínica GomerMedi en Canarias.
    Procesa el archivo de audio proporcionado y genera una transcripción detallada junto con una ficha de análisis de la llamada.
    
    REQUISITOS IMPORTANTES:
    1. NO traduzcas la conversación al inglés. Todo el contenido debe estar en Español.
    2. Identifica claramente a los hablantes (Recepcionista vs Paciente/Llamante).
    3. Proporciona marcas de tiempo precisas para cada segmento (Formato: MM:SS).
    4. Realiza un análisis exhaustivo para completar la "ficha" de la llamada con los siguientes puntos:
       - Nombre del receptor (personal de la clínica).
       - Nombre del llamante y datos inferidos.
       - Otras personas mencionadas (médicos, enfermeras, etc.) con sus roles.
       - Identificaciones (DNI, NIE, Pasaporte) diferenciando si son del llamante o de terceros.
       - Servicios solicitados.
       - Datos de cita (fecha, hora, clínica) si se mencionan. IMPORTANTE: No confundas lugares generales con las clínicas. Las ÚNICAS clínicas válidas de GomerMedi son:
         * TENERIFE: Centro Médico Ramón y Cajal, CRC Olímpico (en Tomé Cano), Tejina, Centro Médico Candelaria, Las Chafiras, CRC Los Cristianos.
         * GRAN CANARIA: Centro Médico Santa Brígida, Centro Médico Vecindario, Centro Médico Telde San Gregorio, Centro de Fisioterapia Telde, Centro Médico Las Palmas.
         * FUERTEVENTURA: CRC Puerto del Rosario, Centro Médico Puerto del Rosario.
         * LA GOMERA: Centro Médico San Sebastián, Centro de Fisioterapia San Sebastián.
       - Categoría de la llamada (información, citas, reclamación, equivocada, otro).
       - Detección de leads (interés en precios o servicios).
       - Datos de contacto (teléfonos, direcciones).
       - Análisis de sentimiento detallado (puntuación 0-10 y descripción).

    Output Format: JSON object con la estructura definida en el schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "Resumen conciso de la llamada en español.",
            },
            analysis: {
              type: Type.OBJECT,
              properties: {
                receiverName: { type: Type.STRING },
                callerName: { type: Type.STRING },
                callerData: { type: Type.STRING, description: "Datos adicionales inferidos del llamante." },
                otherPeople: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      role: { type: Type.STRING },
                      responsibilities: { type: Type.STRING }
                    }
                  }
                },
                identifications: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, enum: ["DNI", "NIE", "Pasaporte", "Otro"] },
                      value: { type: Type.STRING },
                      owner: { type: Type.STRING, enum: ["caller", "other"] }
                    }
                  }
                },
                serviceRequests: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                appointmentRequest: {
                  type: Type.OBJECT,
                  properties: {
                    date: { type: Type.STRING },
                    time: { type: Type.STRING },
                    clinic: { type: Type.STRING },
                    details: { type: Type.STRING }
                  }
                },
                callType: { 
                  type: Type.STRING, 
                  enum: ["informacion", "citas", "reclamacion", "equivocada", "otro"] 
                },
                leadPotential: {
                  type: Type.OBJECT,
                  properties: {
                    isLead: { type: Type.BOOLEAN },
                    requestedInfo: { type: Type.STRING }
                  }
                },
                contactDetails: {
                  type: Type.OBJECT,
                  properties: {
                    phones: { type: Type.ARRAY, items: { type: Type.STRING } },
                    addresses: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                },
                sentimentAnalysis: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    label: { type: Type.STRING },
                    details: { type: Type.STRING }
                  }
                }
              },
              required: ["receiverName", "callerName", "callType", "sentimentAnalysis"]
            },
            segments: {
              type: Type.ARRAY,
              description: "Lista de segmentos transcritos.",
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  timestamp: { type: Type.STRING },
                  content: { type: Type.STRING },
                  language: { type: Type.STRING },
                  language_code: { type: Type.STRING },
                  emotion: { 
                    type: Type.STRING, 
                    enum: Object.values(Emotion)
                  },
                },
                required: ["speaker", "timestamp", "content", "language", "language_code", "emotion"],
              },
            },
          },
          required: ["summary", "analysis", "segments"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text received from Gemini.");

    const data = parseJson(text);
    return data;

  } catch (error) {
    console.error("Gemini Transcription Error:", error);
    throw error;
  }
};