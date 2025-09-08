

import multer from "multer";

// Use memory storage for serverless (Vercel) compatibility
const storage = multer.memoryStorage();

// Multer instance with size limits to avoid 413 and protect memory
const upload = multer({ 
    storage,
    limits: {
        fileSize: 60 * 1024 * 1024, // 60MB
        fields: 10,
        files: 10
    }
});

export default upload;
