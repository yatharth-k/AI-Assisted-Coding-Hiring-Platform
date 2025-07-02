import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { format } from "date-fns";
import { supabase } from "../../integrations/supabase/client";

interface Problem {
  id: number;
  title: string;
}

interface ContestFormProps {
  initialValues?: {
    name?: string;
    description?: string;
    start_time?: string;
    end_time?: string;
    problems?: number[];
  };
  onSave: (data: any) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export default function ContestForm({ initialValues = {}, onSave, onCancel, loading }: ContestFormProps) {
  const [name, setName] = useState(initialValues.name || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [startTime, setStartTime] = useState(initialValues.start_time || "");
  const [endTime, setEndTime] = useState(initialValues.end_time || "");
  const [selectedProblems, setSelectedProblems] = useState<number[]>(initialValues.problems || []);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [problemsLoading, setProblemsLoading] = useState(true);

  useEffect(() => {
    fetchProblems();
  }, []);

  async function fetchProblems() {
    setProblemsLoading(true);
    const { data } = await supabase.from("problems").select("id, title").order("title");
    setProblems(data || []);
    setProblemsLoading(false);
  }

  const handleProblemToggle = (id: number) => {
    setSelectedProblems((prev) => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      start_time: startTime,
      end_time: endTime,
      problems: selectedProblems,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-xl mx-auto">
      <div>
        <label className="block font-semibold mb-1">Contest Name</label>
        <Input value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label className="block font-semibold mb-1">Description</label>
        <Textarea value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Start Time</label>
          <Input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">End Time</label>
          <Input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required />
        </div>
      </div>
      <div>
        <label className="block font-semibold mb-1">Problems</label>
        {problemsLoading ? (
          <div>Loading problems...</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {problems.map((p) => (
              <Button
                key={p.id}
                type="button"
                variant={selectedProblems.includes(p.id) ? "default" : "outline"}
                size="sm"
                onClick={() => handleProblemToggle(p.id)}
              >
                {p.title}
              </Button>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-2 justify-end">
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Contest"}</Button>
      </div>
    </form>
  );
} 