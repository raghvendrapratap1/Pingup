import express from 'express';
import { chatWithAI } from '../controller/geminiController.js';
import { validateChatRequest, checkValidationResult, geminiRateLimit } from '../middleware/geminiValidate.js';

const router = express.Router();

// Chat conversation with AI (main endpoint used by frontend)
router.post('/chat', 
    geminiRateLimit, 
    validateChatRequest, 
    checkValidationResult, 
    chatWithAI
);

export default router;
