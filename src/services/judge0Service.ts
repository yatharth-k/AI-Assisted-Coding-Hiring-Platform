
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

class Judge0Service {
  private readonly baseUrl = 'https://judge0-ce.p.rapidapi.com';
  private readonly apiKey = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // Judge0 API key
  
  private readonly languageMap: Record<string, number> = {
    javascript: 63, // Node.js
    python: 71,     // Python 3
    java: 62,       // Java
    cpp: 54,        // C++17
    c: 50,          // C
    typescript: 74, // TypeScript
  };

  async submitCode(data: SubmissionData): Promise<string> {
    const response = await fetch(`${this.baseUrl}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify({
        source_code: btoa(data.source_code), // Base64 encode
        language_id: data.language_id,
        stdin: data.stdin ? btoa(data.stdin) : null,
        expected_output: data.expected_output ? btoa(data.expected_output) : null,
      })
    });

    if (!response.ok) {
      throw new Error(`Judge0 submission failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.token;
  }

  async getResult(token: string): Promise<ExecutionResult> {
    const response = await fetch(`${this.baseUrl}/submissions/${token}`, {
      headers: {
        'X-RapidAPI-Key': this.apiKey,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get result: ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      stdout: result.stdout ? atob(result.stdout) : null,
      stderr: result.stderr ? atob(result.stderr) : null,
      compile_output: result.compile_output ? atob(result.compile_output) : null,
      status: result.status,
      time: result.time,
      memory: result.memory
    };
  }

  async executeCode(
    sourceCode: string,
    language: string,
    stdin?: string,
    expectedOutput?: string
  ): Promise<ExecutionResult> {
    const languageId = this.languageMap[language.toLowerCase()];
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const token = await this.submitCode({
      source_code: sourceCode,
      language_id: languageId,
      stdin,
      expected_output: expectedOutput
    });

    // Poll for result
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      
      const result = await this.getResult(token);
      
      // Status 1 = "In Queue", Status 2 = "Processing"
      if (result.status.id !== 1 && result.status.id !== 2) {
        return result;
      }
      
      attempts++;
    }
    
    throw new Error('Execution timeout - code took too long to execute');
  }

  getLanguageId(language: string): number {
    return this.languageMap[language.toLowerCase()] || 71; // Default to Python
  }
}

export const judge0Service = new Judge0Service();
