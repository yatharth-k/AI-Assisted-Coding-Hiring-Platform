import React, { useEffect, useState } from "react";
import ContestForm from "../../components/admin/ContestForm";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { supabase } from "../../integrations/supabase/client";

interface Contest {
  id: number;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_at?: string;
  problems?: number[];
}

export default function ContestsAdminPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editing, setEditing] = useState<Contest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchContests();
  }, []);

  async function fetchContests() {
    setLoading(true);
    setError(null);
    // Fetch contests
    const { data, error } = await supabase
      .from("contests")
      .select("*, contest_problems(problem_id)")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    // Map problems to array of ids
    const contestsWithProblems = (data || []).map((c: any) => ({
      ...c,
      problems: c.contest_problems?.map((cp: any) => cp.problem_id) || [],
    }));
    setContests(contestsWithProblems);
    setLoading(false);
  }

  // Create or update contest
  const handleSave = async (data: any) => {
    setFormLoading(true);
    let contestId = editing?.id;
    if (editing) {
      // Update contest
      const { error } = await supabase
        .from("contests")
        .update({
          name: data.name,
          description: data.description,
          start_time: data.start_time,
          end_time: data.end_time,
        })
        .eq("id", editing.id);
      if (error) setError(error.message);
    } else {
      // Create contest
      const { data: insertData, error } = await supabase
        .from("contests")
        .insert([{ name: data.name, description: data.description, start_time: data.start_time, end_time: data.end_time }])
        .select();
      if (error) setError(error.message);
      contestId = insertData?.[0]?.id;
    }
    // Update contest_problems
    if (contestId) {
      // Delete old links
      await supabase.from("contest_problems").delete().eq("contest_id", contestId);
      // Insert new links
      if (data.problems && data.problems.length > 0) {
        await supabase.from("contest_problems").insert(
          data.problems.map((pid: number) => ({ contest_id: contestId, problem_id: pid }))
        );
      }
    }
    setShowForm(false);
    setEditing(null);
    setFormLoading(false);
    fetchContests();
  };

  // Edit
  const handleEdit = (contest: Contest) => {
    setEditing(contest);
    setShowForm(true);
  };

  // Delete
  const handleDelete = async (id: number) => {
    setDeleteLoading(true);
    const { error } = await supabase.from("contests").delete().eq("id", id);
    if (error) setError(error.message);
    setDeleteId(null);
    setDeleteLoading(false);
    fetchContests();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contests Admin</CardTitle>
          <Button onClick={() => { setShowForm(true); setEditing(null); }}>+ Create Contest</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Name</th>
                  <th className="py-2">Start</th>
                  <th className="py-2">End</th>
                  <th className="py-2">Problems</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contests.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-muted">
                    <td className="py-2 font-medium">{c.name}</td>
                    <td className="py-2 text-xs text-gray-500">{c.start_time?.replace("T", " ").slice(0, 16)}</td>
                    <td className="py-2 text-xs text-gray-500">{c.end_time?.replace("T", " ").slice(0, 16)}</td>
                    <td className="py-2">
                      {c.problems?.length ? c.problems.length : 0}
                    </td>
                    <td className="py-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(c)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteId(c.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      {(showForm || editing) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <ContestForm
              initialValues={editing || {}}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditing(null); }}
              loading={formLoading}
            />
          </div>
        </div>
      )}
      {/* Delete confirmation */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
            <div className="mb-4">Are you sure you want to delete this contest?</div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button variant="destructive" loading={deleteLoading} onClick={() => handleDelete(deleteId!)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 