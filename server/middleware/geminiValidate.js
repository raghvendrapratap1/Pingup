import { body, validationResult } from 'express-validator';

// Validation for chat conversation
export const validateChatRequest = [
    body('messages')
        .isArray({ min: 1 })
        .withMessage('Messages must be an array with at least one message'),
    
    body('messages.*.role')
        .isIn(['user', 'assistant'])
        .withMessage('Message role must be either "user" or "assistant"'),
    
    body('messages.*.content')
        .trim()
        .notEmpty()
        .withMessage('Message content is required')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message content must be between 1 and 1000 characters'),
];

// Check validation results
export const checkValidationResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Rate limiting for AI API calls
export const geminiRateLimit = (req, res, next) => {
    // Simple rate limiting - you can enhance this with Redis or other solutions
    const userId = req.userId || req.ip;
    const now = Date.now();
    
    // Store rate limit data in memory (in production, use Redis)
    if (!req.app.locals.geminiRateLimit) {
        req.app.locals.geminiRateLimit = new Map();
    }
    
    const userLimit = req.app.locals.geminiRateLimit.get(userId);
    
    if (userLimit && (now - userLimit.timestamp) < 60000) { // 1 minute window
        if (userLimit.count >= 10) { // 10 requests per minute
            return res.status(429).json({
                success: false,
                message: 'Rate limit exceeded. Please try again later.'
            });
        }
        userLimit.count++;
    } else {
        req.app.locals.geminiRateLimit.set(userId, {
            timestamp: now,
            count: 1
        });
    }
    
    next();
};
