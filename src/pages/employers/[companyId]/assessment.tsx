import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, ArrowLeft } from "lucide-react";
import CodeEditor from "@/components/CodeEditor";

const companies = [
  { id: "1", name: "TechNova Solutions", question: "What is the time complexity of binary search?" },
  { id: "2", name: "FinEdge Analytics", question: "Explain the difference between supervised and unsupervised learning." },
  { id: "3", name: "HealthSync Systems", question: "How would you design a scalable REST API for patient records?" },
  { id: "4", name: "EduCore Labs", question: "Describe a method to detect plagiarism in code submissions." },
  { id: "5", name: "GreenGrid Energy", question: "How would you optimize energy consumption in IoT devices?" },
  { id: "6", name: "RetailXpert", question: "What database schema would you use for an e-commerce inventory system?" },
  { id: "7", name: "AutoMinds AI", question: "Explain the concept of reinforcement learning with an example." },
  { id: "8", name: "SecureNet", question: "How would you implement two-factor authentication in a web app?" },
  { id: "9", name: "AgroVision", question: "Design a sensor network for monitoring soil moisture in real time." },
  { id: "10", name: "UrbanMove Logistics", question: "How would you route delivery vehicles to minimize total travel time?" }
];

const defaultStarterCode = {
  python: `# Write your solution here\ndef solution():\n    pass`,
  javascript: `// Write your solution here\nfunction solution() {\n  \n}`,
  cpp: `// Write your solution here\n#include <iostream>\nusing namespace std;\nvoid solution() {\n  \n}`,
  java: `// Write your solution here\npublic class Solution {\n  public static void solution() {\n    \n  }\n}`
};

export default function CompanyAssessment() {
  const { companyId } = useParams<{ companyId: string }>();
  const company = useMemo(() => companies.find(c => c.id === companyId), [companyId]);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(defaultStarterCode["python"]);
  const [submitted, setSubmitted] = useState(false);

  if (!company) return <div className="p-8 text-center text-xl">Company not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="flex items-center space-x-4">
          <Link to="/employers">
            <Button variant="ghost" size="sm" className="text-white hover:text-purple-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <Code className="h-6 w-6 text-purple-400" />
            <span className="text-xl font-bold text-white">Assessment Editor</span>
          </div>
        </div>
      </nav>
      <div className="flex h-[calc(100vh-80px)]">
        {/* Problem Description */}
        <div className="w-1/2 border-r border-slate-700 overflow-y-auto">
          <div className="p-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-2xl">{company.name} Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <h2 className="text-lg font-semibold text-purple-300 mb-2">Assessment Question</h2>
                  <p className="text-slate-300 leading-relaxed mb-4">{company.question}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Code Editor */}
        <div className="w-1/2 flex flex-col">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center mb-4 gap-4">
              <Select value={language} onValueChange={val => { setLanguage(val); setCode(defaultStarterCode[val]); }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-h-[300px]">
              <CodeEditor
                value={code}
                language={language}
                onChange={setCode}
                placeholder="# Write your code here"
              />
            </div>
            <Button
              className="mt-6 w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => setSubmitted(true)}
              disabled={submitted}
            >
              {submitted ? "Submitted!" : "Submit Solution"}
            </Button>
            {submitted && <div className="mt-4 text-green-400 font-semibold text-center">Your solution has been submitted.</div>}
          </div>
        </div>
      </div>
    </div>
  );
} 