import { TranscriptionResponse } from '../types';

export const uploadAudio = async (base64Audio: string, mimeType: string): Promise<{ id: string, fileName: string, url: string }> => {
  const response = await fetch('/api/audio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ base64Audio, mimeType }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error uploading audio: ${response.status}`);
  }

  return response.json();
};

export const deleteAudio = async (fileName: string): Promise<void> => {
  const response = await fetch(`/api/audio/${fileName}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Error deleting audio: ${response.status}`);
  }
};

export const transcribeAudio = async (
  audioFilename: string,
  mimeType: string,
  callCenter: string
): Promise<TranscriptionResponse> => {
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      audioFilename,
      mimeType,
      callCenter,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error del servidor: ${response.status}`);
  }

  return response.json();
};
