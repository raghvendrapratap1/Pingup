import express from 'express';
import { getChatMessage, sendMessage, clearChat } from '../controller/messageController.js';
import upload from '../config/multer.js';
import auth from '../middleware/auth.js';

const messageRouter = express.Router();
messageRouter.post('/send',upload.single('image'),auth,sendMessage);
messageRouter.post('/get',auth,getChatMessage);
messageRouter.delete('/clear-chat/:to_user_id',auth,clearChat);

export default messageRouter;
