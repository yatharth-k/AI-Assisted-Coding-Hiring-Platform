import React, { useState } from "react";
import CodeEditor from "./CodeEditor";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";

const languageOptions = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
];

const themeOptions = [
  { value: "vs-code", label: "VS Code Dark" },
  { value: "dark", label: "Dark" },
  { value: "light", label: "Light" },
];

const defaultCode = {
  javascript: `// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Test the function
console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(\`fib(\${i}) = \${fibonacci(i)}\`);
}`,
  python: `# Python Example
def fibonacci(n):
    """Calculate the nth Fibonacci number."""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Test the function
print("Fibonacci sequence:")
for i in range(10):
    print(f"fib({i}) = {fibonacci(i)}")`,
  cpp: `// C++ Example
#include <iostream>
#include <vector>

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    std::cout << "Fibonacci sequence:" << std::endl;
    for (int i = 0; i < 10; i++) {
        std::cout << "fib(" << i << ") = " << fibonacci(i) << std::endl;
    }
    return 0;
}`,
  java: `// Java Example
public class Fibonacci {
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
    
    public static void main(String[] args) {
        System.out.println("Fibonacci sequence:");
        for (int i = 0; i < 10; i++) {
            System.out.println("fib(" + i + ") = " + fibonacci(i));
        }
    }
}`,
};

export default function CodeEditorExample() {
  const [code, setCode] = useState(defaultCode.javascript);
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState<"light" | "dark" | "vs-code">("vs-code");
  const [isReadOnly, setIsReadOnly] = useState(false);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(defaultCode[newLanguage as keyof typeof defaultCode] || "");
  };

  const handleRunCode = () => {
    console.log("Running code:", code);
    // Here you would typically send the code to your backend for execution
    // For now, we'll just log it
  };

  const handleResetCode = () => {
    setCode(defaultCode[language as keyof typeof defaultCode] || "");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🚀 Advanced Code Editor</span>
            <Badge variant="secondary">VS Code-like</Badge>
          </CardTitle>
          <CardDescription>
            A feature-rich code editor with syntax highlighting, multiple themes, and language support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={theme} onValueChange={(value: "light" | "dark" | "vs-code") => setTheme(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent>
                  {themeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsReadOnly(!isReadOnly)}
              >
                {isReadOnly ? "🔓 Enable Edit" : "🔒 Read Only"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopyCode}>
                📋 Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetCode}>
                🔄 Reset
              </Button>
              <Button onClick={handleRunCode}>
                ▶️ Run Code
              </Button>
            </div>
          </div>
          
          {/* Editor */}
          <div className="border rounded-lg overflow-hidden">
            <CodeEditor 
              value={code} 
              language={language} 
              onChange={setCode}
              placeholder={`// Write your ${language} code here`}
              className="min-h-[500px]"
              theme={theme}
              readOnly={isReadOnly}
            />
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Language: <Badge variant="outline">{language}</Badge></span>
              <span>Theme: <Badge variant="outline">{theme}</Badge></span>
              <span>Mode: <Badge variant="outline">{isReadOnly ? "Read Only" : "Editable"}</Badge></span>
            </div>
            <div className="flex items-center gap-4">
              <span>Characters: {code.length}</span>
              <span>Lines: {code.split('\n').length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>✨ Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold">🎨 Theming</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• VS Code Dark Theme</li>
                <li>• Light Theme</li>
                <li>• Custom Color Schemes</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">🔤 Languages</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• JavaScript/TypeScript</li>
                <li>• Python</li>
                <li>• C++</li>
                <li>• Java</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">⚡ Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Syntax Highlighting</li>
                <li>• Line Numbers</li>
                <li>• Active Line Highlighting</li>
                <li>• Code Folding</li>
                <li>• Bracket Matching</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 