interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

interface SubmissionData {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
}

interface Judge0Error {
  message: string;
  details?: string;
  statusCode?: number;
}

class Judge0Service {
  // Use our secure backend instead of direct Judge0 API
  private readonly baseUrl = '/api';
  
  private readonly languageMap: Record<string, number> = {
    javascript: 63, // Node.js
    python: 71,     // Python 3
    java: 62,       // Java
    cpp: 54,        // C++17
    c: 50,          // C
    typescript: 74, // TypeScript
  };

  private log(message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    console.log(`[Judge0Service ${timestamp}] ${message}`, data || '');
  }

  private handleApiError(response: Response, context: string): Judge0Error {
    const statusCode = response.status;
    let message = `Backend API error (${statusCode})`;
    let details = '';

    switch (statusCode) {
      case 400:
        message = 'Invalid request parameters';
        details = 'Check your source code and language selection';
        break;
      case 401:
        message = 'Authentication failed';
        details = 'Please log in to execute code';
        break;
      case 429:
        message = 'Rate limit exceeded';
        details = 'Too many requests, please wait before trying again';
        break;
      case 403:
        message = 'Access forbidden';
        details = 'Code execution blocked due to security policy';
        break;
      case 500:
        message = 'Server error';
        details = 'The code execution service is temporarily unavailable';
        break;
      default:
        details = `Unexpected error occurred (${statusCode})`;
    }

    this.log(`API Error in ${context}: ${message}`, { statusCode, details });
    return { message, details, statusCode };
  }

  private validateInput(data: SubmissionData): Judge0Error | null {
    if (!data.source_code || data.source_code.trim().length === 0) {
      return { message: 'Source code cannot be empty' };
    }

    if (!data.language_id || !Object.values(this.languageMap).includes(data.language_id)) {
      return { message: 'Invalid or unsupported language' };
    }

    if (data.source_code.length > 100000) { // 100KB limit
      return { message: 'Source code too large (max 100KB)' };
    }

    return null;
  }

  async executeCode(
    sourceCode: string,
    language: string,
    stdin?: string,
    expectedOutput?: string
  ): Promise<ExecutionResult> {
    this.log('Starting code execution', { 
      language, 
      codeLength: sourceCode.length,
      hasStdin: !!stdin,
      hasExpectedOutput: !!expectedOutput 
    });

    const languageId = this.languageMap[language.toLowerCase()];
    if (!languageId) {
      const supportedLanguages = Object.keys(this.languageMap).join(', ');
      throw new Error(`Unsupported language: ${language}. Supported languages: ${supportedLanguages}`);
    }

    // Validate input
    const validationError = this.validateInput({
      source_code: sourceCode,
      language_id: languageId,
      stdin,
      expected_output: expectedOutput
    });
    if (validationError) {
      throw new Error(validationError.message);
    }

    try {
      const response = await fetch(`${this.baseUrl}/run-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceCode,
          language,
          stdin,
          expectedOutput
        })
      });

      if (!response.ok) {
        const error = this.handleApiError(response, 'executeCode');
        throw new Error(error.message);
      }

      const result = await response.json();
      
      // Validate result structure
      if (!result.status || typeof result.status.id !== 'number') {
        throw new Error('Invalid result format from backend');
      }

      this.log('Code executed successfully', { 
        statusId: result.status.id, 
        statusDescription: result.status.description 
      });

      return result;
    } catch (error) {
      if (error instanceof Error) {
        this.log('Code execution failed', { error: error.message });
        throw error;
      }
      throw new Error('Unknown error during code execution');
    }
  }

  // Utility method to get supported languages
  getSupportedLanguages(): string[] {
    return Object.keys(this.languageMap);
  }

  // Utility method to get language ID
  getLanguageId(language: string): number | null {
    return this.languageMap[language.toLowerCase()] || null;
  }

  // Utility method to check if language is supported
  isLanguageSupported(language: string): boolean {
    return language.toLowerCase() in this.languageMap;
  }
}

export { Judge0Service };
