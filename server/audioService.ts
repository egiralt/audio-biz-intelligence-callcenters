import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const saveAudio = (base64Data: string, mimeType: string) => {
  const id = crypto.randomUUID();
  const ext = mimeType.split('/')[1]?.split(';')[0] || 'webm';
  const fileName = `${id}.${ext}`;
  const filePath = path.join(UPLOADS_DIR, fileName);
  
  const base64Clean = base64Data.replace(/^data:audio\/\w+;base64,/, '');
  
  fs.writeFileSync(filePath, Buffer.from(base64Clean, 'base64'));
  
  return {
    id,
    fileName,
    url: `/api/audio/${fileName}`
  };
};

export const getAudioPath = (fileName: string) => {
  return path.join(UPLOADS_DIR, fileName);
};

export const deleteAudio = (fileName: string) => {
  const filePath = path.join(UPLOADS_DIR, fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
