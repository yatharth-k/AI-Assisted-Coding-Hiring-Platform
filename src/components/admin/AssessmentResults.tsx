import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AssessmentResults({ companyId }: { companyId: string }) {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("assessments").select("*").eq("company_id", companyId).then(({ data }) => setAssessments(data || []));
  }, [companyId]);

  async function loadCandidates(assessmentId: string) {
    const { data } = await supabase.from("assessment_candidates").select("*, users(username, email)").eq("assessment_id", assessmentId);
    setCandidates(data || []);
    setSelectedAssessment(assessmentId);
    // Optionally load submissions for all candidates
  }

  async function loadSubmissions(candidateId: string) {
    const { data } = await supabase.from("submissions").select("*").eq("user_id", candidateId).eq("assessment_id", selectedAssessment);
    setSubmissions(data || []);
  }

  return (
    <div>
      <h3>Assessments</h3>
      <ul>
        {assessments.map(a => (
          <li key={a.id}>
            <button onClick={() => loadCandidates(a.id)}>{a.title}</button>
          </li>
        ))}
      </ul>
      <h3>Candidates</h3>
      <ul>
        {candidates.map(c => (
          <li key={c.user_id}>
            <button onClick={() => loadSubmissions(c.user_id)}>{c.users?.username || c.users?.email}</button>
          </li>
        ))}
      </ul>
      <h3>Submissions</h3>
      <ul>
        {submissions.map(s => (
          <li key={s.id}>
            <pre>{s.code}</pre>
            <div>Time: {s.created_at}</div>
            <div>Passed: {s.result?.passed ? 'Yes' : 'No'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
