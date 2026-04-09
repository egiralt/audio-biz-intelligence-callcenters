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

export interface PersonProfile {
  name: string;
  roleInConversation: string; // e.g., 'Recepcionista', 'Llamante', 'Paciente', 'Familiar', 'Médico', 'Otro'
  roleDescription: string;
  identifications: Array<{
    type: 'DNI' | 'NIE' | 'Pasaporte' | 'Otro';
    value: string;
  }>;
  contact: {
    phones: string[];
    addresses: string[];
    emails: string[];
  };
  personalData: {
    dateOfBirth: string;
    age: string;
    otherInfo: string;
  };
}

export interface CallAnalysis {
  callCenter: string;
  peopleProfiles: PersonProfile[];
  serviceRequests: string[];
  appointmentRequest?: {
    isConfirmed: boolean;
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