

import multer from "multer";

// Use memory storage for serverless (Vercel) compatibility
const storage = multer.memoryStorage();

// Multer instance
const upload = multer({ storage });

export default upload;
