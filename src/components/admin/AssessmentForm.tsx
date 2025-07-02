import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AssessmentForm({ companyId }: { companyId: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [problems, setProblems] = useState<any[]>([]);
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("problems").select("*").then(({ data }) => setProblems(data || []));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: assessment } = await supabase.from("assessments").insert([{ company_id: companyId, title, description }]).select().single();
    if (assessment) {
      await Promise.all(selectedProblems.map(pid =>
        supabase.from("assessment_problems").insert([{ assessment_id: assessment.id, problem_id: pid }])
      ));
    }
    setTitle("");
    setDescription("");
    setSelectedProblems([]);
    // Optionally refresh assessments list
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Assessment Title" required />
      <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
      <div>
        <label>Select Problems:</label>
        <select multiple value={selectedProblems} onChange={e => setSelectedProblems(Array.from(e.target.selectedOptions, o => o.value))}>
          {problems.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>
      <button type="submit">Create Assessment</button>
    </form>
  );
}
