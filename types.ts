/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum Emotion {
  Happy = 'Happy',
  Sad = 'Sad',
  Angry = 'Angry',
  Neutral = 'Neutral'
}

export interface TranscriptionSegment {
  speaker: string;
  timestamp: string;
  content: string;
  language: string;
  translation?: string;
  emotion?: Emotion;
}

export interface CallAnalysis {
  receiverName: string;
  callerName: string;
  callerData: string;
  otherPeople: Array<{
    name: string;
    role: string;
    responsibilities: string;
  }>;
  identifications: Array<{
    type: 'DNI' | 'NIE' | 'Pasaporte' | 'Otro';
    value: string;
    owner: 'caller' | 'other';
  }>;
  serviceRequests: string[];
  appointmentRequest?: {
    date?: string;
    time?: string;
    clinic?: string;
    details?: string;
  };
  callType: 'informacion' | 'citas' | 'reclamacion' | 'equivocada' | 'otro';
  leadPotential: {
    isLead: boolean;
    requestedInfo: string;
  };
  contactDetails: {
    phones: string[];
    addresses: string[];
  };
  sentimentAnalysis: {
    score: number; // 0 to 10
    label: string;
    details: string;
  };
}

export interface TranscriptionResponse {
  summary: string;
  analysis: CallAnalysis;
  segments: TranscriptionSegment[];
}

export type AppStatus = 'idle' | 'recording' | 'processing' | 'success' | 'error';

export interface AudioData {
  blob: Blob;
  base64: string;
  mimeType: string;
}