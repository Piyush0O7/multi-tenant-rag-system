import * as pdfParse from 'pdf-parse';

export async function extractTextFromUpload(file: Express.Multer.File) {
  if (file.mimetype === 'application/pdf') {
    const parsed = await (pdfParse as any)(file.buffer);
    return parsed.text.trim();
  }

  if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
    return file.buffer.toString('utf-8').trim();
  }

  throw new Error(`Unsupported file type: ${file.mimetype}`);
}
