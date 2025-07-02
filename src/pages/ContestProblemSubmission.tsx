import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../integrations/supabase/client";
import CodeEditor from "../components/CodeEditor";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

// Props: contestId, problemId (can be made dynamic route later)
const contestId = 1;
const problemId = 1;

const languageOptions = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
];

export default function ContestProblemSubmission() {
  const { user } = useAuth();
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProblem();
  }, []);

  async function fetchProblem() {
    const { data, error } = await supabase.from("problems").select("*").eq("id", problemId).single();
    if (error) setError(error.message);
    setProblem(data);
    setCode(data?.starter_code || "");
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    setResult(null);
    if (!user) {
      setError("You must be logged in to submit.");
      setSubmitting(false);
      return;
    }
    // Insert submission row
    const { data: submission, error: subError } = await supabase.from("submissions").insert([
      {
        user_id: user.id,
        contest_id: contestId,
        problem_id: problemId,
        code,
        language,
      },
    ]).select().single();
    if (subError) {
      setError(subError.message);
      setSubmitting(false);
      return;
    }
    // Call judge API
    try {
      const res = await fetch("/api/execute-with-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, testCases: problem?.publicTestCases || [] }),
      });
      const judgeResult = await res.json();
      setResult(judgeResult);
      // Update submission with result
      await supabase.from("submissions").update({ result: judgeResult }).eq("id", submission.id);
    } catch (e: any) {
      setError(e.message);
    }
    setSubmitting(false);
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Contest Problem Submission</CardTitle>
        </CardHeader>
        <CardContent>
          {problem ? (
            <>
              <h2 className="text-xl font-bold mb-2">{problem.title}</h2>
              <div className="mb-4" dangerouslySetInnerHTML={{ __html: problem.description }} />
              <div className="mb-4 flex gap-2">
                <label className="font-semibold">Language:</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  {languageOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <CodeEditor
                value={code}
                language={language}
                onChange={setCode}
                className="min-h-[300px] mb-4"
              />
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
              {error && <div className="text-red-500 mt-2">{error}</div>}
              {result && (
                <div className="mt-4 bg-gray-100 p-4 rounded">
                  <h4 className="font-semibold mb-2">Result</h4>
                  <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                </div>
              )}
            </>
          ) : (
            <div>Loading problem...</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 