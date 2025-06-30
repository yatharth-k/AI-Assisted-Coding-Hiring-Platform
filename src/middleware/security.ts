import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

// Security configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const MAX_CODE_SIZE = parseInt(process.env.MAX_CODE_SIZE || '100000'); // 100KB
const MAX_STDIN_SIZE = parseInt(process.env.MAX_STDIN_SIZE || '10000'); // 10KB

// Rate limiting configuration
export const createRateLimiters = () => {
  // General API rate limiter
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Code execution rate limiter (more restrictive)
  const codeExecutionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 code executions per minute
    message: {
      error: 'Too many code executions. Please wait before trying again.',
      retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      // Use user ID if authenticated, otherwise use IP
      return req.user?.id || req.ip;
    },
  });

  // Authentication rate limiter
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 login attempts per 15 minutes
    message: {
      error: 'Too many authentication attempts. Please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  return {
    generalLimiter,
    codeExecutionLimiter,
    authLimiter
  };
};

// Input validation for code execution
export const validateCodeExecution = [
  body('sourceCode')
    .isString()
    .withMessage('Source code must be a string')
    .isLength({ min: 1, max: MAX_CODE_SIZE })
    .withMessage(`Source code must be between 1 and ${MAX_CODE_SIZE} characters`)
    .custom((value) => {
      // Check for potentially malicious patterns
      const dangerousPatterns = [
        /eval\s*\(/i,
        /Function\s*\(/i,
        /setTimeout\s*\(/i,
        /setInterval\s*\(/i,
        /process\.env/i,
        /require\s*\(/i,
        /import\s*\(/i,
        /fs\./i,
        /child_process/i,
        /exec\s*\(/i,
        /spawn\s*\(/i,
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          throw new Error('Code contains potentially dangerous patterns');
        }
      }
      return true;
    }),

  body('language')
    .isString()
    .withMessage('Language must be a string')
    .isIn(['javascript', 'python', 'java', 'cpp', 'c', 'typescript'])
    .withMessage('Invalid programming language'),

  body('stdin')
    .optional()
    .isString()
    .withMessage('Stdin must be a string')
    .isLength({ max: MAX_STDIN_SIZE })
    .withMessage(`Stdin must be less than ${MAX_STDIN_SIZE} characters`),

  body('expectedOutput')
    .optional()
    .isString()
    .withMessage('Expected output must be a string')
    .isLength({ max: MAX_STDIN_SIZE })
    .withMessage(`Expected output must be less than ${MAX_STDIN_SIZE} characters`),
];

// Input validation for authentication
export const validateAuth = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

// Authentication middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Please log in to access this resource'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; iat: number };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      message: 'Please log in again'
    });
  }
};

// Optional authentication middleware (for endpoints that work with or without auth)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; iat: number };
      req.user = decoded;
    } catch (error) {
      // Token is invalid, but we continue without authentication
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://judge029.p.rapidapi.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true,
  frameguard: { action: 'deny' },
});

// CORS configuration
export const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${logData.timestamp}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    }

    // TODO: Send to logging service in production
    // logger.info('API Request', logData);
  });

  next();
};

// Error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: isDevelopment ? err.message : 'Invalid input data'
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication token'
    });
  }

  if (err.name === 'RateLimitExceeded') {
    return res.status(429).json({
      error: 'Rate Limit Exceeded',
      message: 'Too many requests, please try again later'
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong'
  });
};

// Quota monitoring middleware
export const quotaMonitor = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement quota checking against Judge0/RapidAPI limits
  // This would check current usage against limits and potentially
  // implement fallback strategies or user notifications
  
  const currentUsage = 0; // Get from external service
  const maxUsage = 1000; // Get from external service
  
  if (currentUsage >= maxUsage * 0.9) { // 90% of quota
    console.warn('API quota nearly exhausted:', { currentUsage, maxUsage });
    // Could implement fallback or notify users
  }
  
  next();
};

// Request sanitization middleware
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Remove potentially dangerous headers
  delete req.headers['x-forwarded-for'];
  delete req.headers['x-real-ip'];
  
  // Sanitize body if present
  if (req.body) {
    // Remove any properties that shouldn't be in the request
    delete req.body.__proto__;
    delete req.body.constructor;
  }
  
  next();
};

// Export all middleware
export const securityMiddleware = {
  createRateLimiters,
  validateCodeExecution,
  validateAuth,
  authenticateToken,
  optionalAuth,
  handleValidationErrors,
  securityHeaders,
  corsOptions,
  requestLogger,
  errorHandler,
  quotaMonitor,
  sanitizeRequest,
}; 