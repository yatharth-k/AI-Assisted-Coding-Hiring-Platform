import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { Judge0Service } from './src/services/judge0Service';
import {
  createRateLimiters,
  validateCodeExecution,
  handleValidationErrors,
  securityHeaders,
  corsOptions,
  requestLogger,
  errorHandler,
  quotaMonitor,
  sanitizeRequest,
  optionalAuth
} from './src/middleware/security';
import { queryAI } from "./src/services/aiService";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const isProduction = process.env.NODE_ENV === 'production';

// Security middleware
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '100kb' })); // Limit request body size
app.use(sanitizeRequest);
app.use(requestLogger);

// Create rate limiters
const { generalLimiter, codeExecutionLimiter } = createRateLimiters();

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Apply quota monitoring
app.use(quotaMonitor);

const judge0Service = new Judge0Service();

// API endpoint for code execution with enhanced security
app.post('/api/run-code', 
  codeExecutionLimiter, // Stricter rate limiting for code execution
  optionalAuth, // Optional authentication (works with or without auth)
  validateCodeExecution, // Input validation
  handleValidationErrors, // Handle validation errors
  async (req, res) => {
    const { sourceCode, language, stdin } = req.body;
    
    try {
      // Log the execution attempt
      console.log(`[${new Date().toISOString()}] Code execution request:`, {
        language,
        codeLength: sourceCode.length,
        hasStdin: !!stdin,
        userId: req.user?.id || 'anonymous',
        ip: req.ip
      });

      const result = await judge0Service.executeCode(sourceCode, language, stdin);
      
      // Log successful execution
      console.log(`[${new Date().toISOString()}] Code execution successful:`, {
        language,
        status: result.status.description,
        userId: req.user?.id || 'anonymous'
      });

      res.json(result);
    } catch (err: unknown) {
      let message = 'Execution failed';
      if (err instanceof Error) message = err.message;
      
      // Log execution error
      console.error(`[${new Date().toISOString()}] Code execution failed:`, {
        language,
        error: message,
        userId: req.user?.id || 'anonymous',
        ip: req.ip
      });

      res.status(500).json({ error: message });
    }
  }
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API usage statistics endpoint (requires authentication)
app.get('/api/stats', optionalAuth, (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    user: req.user ? { id: req.user.id, email: req.user.email } : null,
    rateLimit: {
      remaining: res.getHeader('X-RateLimit-Remaining'),
      reset: res.getHeader('X-RateLimit-Reset')
    }
  });
});

// General AI endpoint (for custom prompts)
app.post("/api/ai", async (req, res) => {
  const { messages, model } = req.body;
  try {
    const result = await queryAI(messages, model);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: "AI API error", details: err.message });
  }
});

// Code Generation
app.post("/api/ai/code-generation", async (req, res) => {
  const { prompt, language } = req.body;
  const messages = [
    { role: "user", content: `Write a ${language} function: ${prompt}` }
  ];
  try {
    const result = await queryAI(messages);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: "AI API error", details: err.message });
  }
});

// Code Review
app.post("/api/ai/code-review", async (req, res) => {
  const { code } = req.body;
  const messages = [
    { role: "user", content: `Review this code for bugs and improvements:\n${code}` }
  ];
  try {
    const result = await queryAI(messages);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: "AI API error", details: err.message });
  }
});

// Test Case Generation
app.post("/api/ai/test-cases", async (req, res) => {
  const { code, count = 5 } = req.body;
  const messages = [
    { role: "user", content: `Generate ${count} test cases for this function:\n${code}` }
  ];
  try {
    const result = await queryAI(messages);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: "AI API error", details: err.message });
  }
});

// Code Explanation
app.post("/api/ai/explanation", async (req, res) => {
  const { code } = req.body;
  const messages = [
    { role: "user", content: `Explain what this code does:\n${code}` }
  ];
  try {
    const result = await queryAI(messages);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: "AI API error", details: err.message });
  }
});

// Bug Detection
app.post("/api/ai/bug-detection", async (req, res) => {
  const { code } = req.body;
  const messages = [
    { role: "user", content: `Find bugs or vulnerabilities in this code:\n${code}` }
  ];
  try {
    const result = await queryAI(messages);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: "AI API error", details: err.message });
  }
});

// Plagiarism Detection
app.post("/api/ai/plagiarism", async (req, res) => {
  const { code } = req.body;
  const messages = [
    { role: "user", content: `Does this code look similar to common solutions?\n${code}` }
  ];
  try {
    const result = await queryAI(messages);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: "AI API error", details: err.message });
  }
});

// Documentation Generation
app.post("/api/ai/documentation", async (req, res) => {
  const { code } = req.body;
  const messages = [
    { role: "user", content: `Write docstrings for this function:\n${code}` }
  ];
  try {
    const result = await queryAI(messages);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: "AI API error", details: err.message });
  }
});

// Multilingual Support
app.post("/api/ai/multilingual", async (req, res) => {
  const { prompt } = req.body;
  const messages = [
    { role: "user", content: prompt }
  ];
  try {
    const result = await queryAI(messages);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: "AI API error", details: err.message });
  }
});

// Conversational Assistant
app.post("/api/ai/assistant", async (req, res) => {
  const { question } = req.body;
  const messages = [
    { role: "user", content: question }
  ];
  try {
    const result = await queryAI(messages);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: "AI API error", details: err.message });
  }
});

// General Text Generation
app.post("/api/ai/text-generation", async (req, res) => {
  const { prompt } = req.body;
  const messages = [
    { role: "user", content: prompt }
  ];
  try {
    const result = await queryAI(messages);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: "AI API error", details: err.message });
  }
});

// Execute with Tests
app.post("/api/execute-with-tests", async (req, res) => {
  const { code, language, testCases } = req.body;
  if (!Array.isArray(testCases)) return res.status(400).json({ error: "testCases must be an array" });
  try {
    const results = await Promise.all(testCases.map(async (tc: { input: string, expected: string }) => {
      try {
        const result = await judge0Service.executeCode(code, language, tc.input);
        return {
          input: tc.input,
          expected: tc.expected,
          actual: result.stdout?.trim() || "",
          passed: (result.stdout?.trim() === tc.expected.trim())
        };
      } catch (e) {
        return { input: tc.input, expected: tc.expected, actual: "Error", passed: false };
      }
    }));
    res.json({ results });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Serve frontend only in production
if (isProduction) {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Catch-all route for SPA - must be last
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // In development, return 404 for non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.status(404).json({ 
        error: 'Not found', 
        message: 'Frontend is running separately in development mode. Please access the frontend at http://localhost:8080',
        apiEndpoints: [
          'GET /api/health',
          'POST /api/run-code',
          'GET /api/stats'
        ]
      });
    }
  });
}

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Secure server running on port ${PORT}`);
  console.log(`🔒 Security features enabled:`);
  console.log(`   - Rate limiting: 5 executions/minute per user/IP`);
  console.log(`   - Input validation: Code size limit ${process.env.MAX_CODE_SIZE || '100KB'}`);
  console.log(`   - Security headers: Helmet enabled`);
  console.log(`   - CORS: Configured for ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
  console.log(`   - Request logging: Enabled`);
  console.log(`   - Quota monitoring: Enabled`);
  console.log(`   - Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 API Endpoints:`);
  console.log(`   - GET  /api/health - Health check`);
  console.log(`   - POST /api/run-code - Code execution`);
  console.log(`   - GET  /api/stats - Usage statistics`);
}); 