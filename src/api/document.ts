import { Router } from 'express';
import multer from 'multer';
import { DocumentService } from '../services/documentService';
import { authMiddleware } from '../middleware/authMiddleware';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
export const documentRouter = Router();

documentRouter.use('/:tenantId', authMiddleware);

documentRouter.post('/:tenantId/documents/upload', upload.array('files', 5), async (req, res, next) => {
  try {
    const tenantId = req.params.tenantId;
    const files = req.files as Express.Multer.File[];
    if (!files || !files.length) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const result = await DocumentService.uploadFileDocuments(tenantId, files);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

documentRouter.post('/:tenantId/documents', async (req, res, next) => {
  try {
    const tenantId = req.params.tenantId;
    const payload = req.body;
    const documents = Array.isArray(payload) ? payload : [payload];
    const result = await DocumentService.uploadDocuments(tenantId, documents);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

documentRouter.get('/:tenantId/documents', async (req, res, next) => {
  try {
    const tenantId = req.params.tenantId;
    const docs = await DocumentService.listDocuments(tenantId);
    res.json(docs);
  } catch (error) {
    next(error);
  }
});

documentRouter.delete('/:tenantId/documents/:documentId', async (req, res, next) => {
  try {
    const { tenantId, documentId } = req.params;
    await DocumentService.deleteDocument(tenantId, documentId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
