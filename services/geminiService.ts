/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Type } from "@google/genai";
import { TranscriptionSegment, Emotion, TranscriptionResponse } from "../types";

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
  mimeType: string,
  callCenter: string
): Promise<TranscriptionResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Using gemini-3-flash-preview for fast multimodal processing
  const modelId = "gemini-3-flash-preview";

  const prompt = `
    Eres un experto asistente de transcripción y análisis de llamadas médicas para la clínica GomerMedi en Canarias.
    Procesa el archivo de audio proporcionado y genera una transcripción detallada junto con una ficha de análisis de la llamada.
    
    El Call Center seleccionado para esta llamada es: "${callCenter}".
    
    REQUISITOS IMPORTANTES:
    1. NO traduzcas la conversación al inglés. Todo el contenido debe estar en Español.
    2. Identifica claramente a los hablantes (Recepcionista vs Paciente/Llamante).
    3. Proporciona marcas de tiempo precisas para cada segmento (Formato: MM:SS).
    4. Realiza un análisis exhaustivo para completar la "ficha" de la llamada con los siguientes puntos:
       - Call Center (debe ser "${callCenter}").
       - Fichas de Personas (peopleProfiles): Crea una ficha detallada para CADA persona que participe o sea mencionada en la llamada (Recepcionista, Llamante, Paciente, Familiares, Médicos, etc.). Extrae TODOS sus datos personales (fecha de nacimiento, edad, dirección, teléfono, DNI/NIE/Pasaporte, email) y asócialos correctamente a la persona correspondiente. Identifica su rol en la conversación.
       - Servicios solicitados.
       - Datos de cita (fecha, hora, clínica). IMPORTANTE: Debes discernir si la cita fue REALMENTE APROBADA y CONFIRMADA por el paciente. Si solo se proponen fechas pero el paciente no confirma claramente, marca 'isConfirmed' como false o no generes la cita. Además, no confundas lugares generales con las clínicas. Las ÚNICAS clínicas válidas de GomerMedi son:
         * TENERIFE: Centro Médico Ramón y Cajal, CRC Olímpico (en Tomé Cano), Tejina, Centro Médico Candelaria, Las Chafiras, CRC Los Cristianos.
         * GRAN CANARIA: Centro Médico Santa Brígida, Centro Médico Vecindario, Centro Médico Telde San Gregorio, Centro de Fisioterapia Telde, Centro Médico Las Palmas.
         * FUERTEVENTURA: CRC Puerto del Rosario, Centro Médico Puerto del Rosario.
         * LA GOMERA: Centro Médico San Sebastián, Centro de Fisioterapia San Sebastián.
       - Categoría de la llamada (información, citas, reclamación, equivocada, otro).
       - Detección de leads (interés en precios o servicios).
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
                callCenter: { type: Type.STRING },
                peopleProfiles: {
                  type: Type.ARRAY,
                  description: "Fichas detalladas de todas las personas participantes o mencionadas en la llamada.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      roleInConversation: { type: Type.STRING, description: "Ej: Recepcionista, Llamante, Paciente, Familiar, Médico, Otro" },
                      roleDescription: { type: Type.STRING, description: "Descripción más detallada del rol o relación." },
                      identifications: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            type: { type: Type.STRING, enum: ["DNI", "NIE", "Pasaporte", "Otro"] },
                            value: { type: Type.STRING }
                          }
                        }
                      },
                      contact: {
                        type: Type.OBJECT,
                        properties: {
                          phones: { type: Type.ARRAY, items: { type: Type.STRING } },
                          addresses: { type: Type.ARRAY, items: { type: Type.STRING } },
                          emails: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                      },
                      personalData: {
                        type: Type.OBJECT,
                        properties: {
                          dateOfBirth: { type: Type.STRING },
                          age: { type: Type.STRING },
                          otherInfo: { type: Type.STRING }
                        }
                      }
                    },
                    required: ["name", "roleInConversation"]
                  }
                },
                serviceRequests: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                appointmentRequest: {
                  type: Type.OBJECT,
                  description: "Datos de la cita. Generar solo si se discute una cita.",
                  properties: {
                    isConfirmed: { type: Type.BOOLEAN, description: "True SOLO SI el paciente confirmó definitivamente la cita. False si quedó pendiente, no fue claro, o solo fue una propuesta." },
                    date: { type: Type.STRING },
                    time: { type: Type.STRING },
                    clinic: { type: Type.STRING },
                    details: { type: Type.STRING }
                  },
                  required: ["isConfirmed"]
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
                sentimentAnalysis: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    label: { type: Type.STRING },
                    details: { type: Type.STRING }
                  }
                }
              },
              required: ["callCenter", "peopleProfiles", "callType", "sentimentAnalysis"]
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