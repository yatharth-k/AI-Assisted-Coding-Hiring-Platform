import React, { useEffect, useState } from "react";
import ProblemForm from "../../components/admin/ProblemForm";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { supabase } from "../../integrations/supabase/client";

interface Problem {
  id: number;
  title: string;
  description: string;
  input_format?: string;
  output_format?: string;
  sample_cases?: { input: string; output: string }[];
  tags?: string[];
  difficulty?: string;
  created_at?: string;
  updated_at?: string;
}

export default function ProblemsAdminPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editing, setEditing] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch problems from Supabase
  useEffect(() => {
    fetchProblems();
  }, []);

  async function fetchProblems() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("problems")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    setProblems(data || []);
    setLoading(false);
  }

  // Create or update problem
  const handleSave = async (data: any) => {
    setFormLoading(true);
    if (editing) {
      // Update
      const { error } = await supabase
        .from("problems")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", editing.id);
      if (error) setError(error.message);
    } else {
      // Create
      const { error } = await supabase
        .from("problems")
        .insert([{ ...data }]);
      if (error) setError(error.message);
    }
    setShowForm(false);
    setEditing(null);
    setFormLoading(false);
    fetchProblems();
  };

  // Edit
  const handleEdit = (problem: Problem) => {
    setEditing(problem);
    setShowForm(true);
  };

  // Delete
  const handleDelete = async (id: number) => {
    setDeleteLoading(true);
    const { error } = await supabase.from("problems").delete().eq("id", id);
    if (error) setError(error.message);
    setDeleteId(null);
    setDeleteLoading(false);
    fetchProblems();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Problems Admin</CardTitle>
          <Button onClick={() => { setShowForm(true); setEditing(null); }}>+ Create Problem</Button>
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
                  <th className="py-2">Title</th>
                  <th className="py-2">Difficulty</th>
                  <th className="py-2">Tags</th>
                  <th className="py-2">Created</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-muted">
                    <td className="py-2 font-medium">{p.title}</td>
                    <td className="py-2">{p.difficulty}</td>
                    <td className="py-2">
                      {p.tags?.map((tag: string) => (
                        <span key={tag} className="inline-block bg-gray-200 text-xs rounded px-2 py-1 mr-1">{tag}</span>
                      ))}
                    </td>
                    <td className="py-2 text-xs text-gray-500">{p.created_at?.slice(0, 10)}</td>
                    <td className="py-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(p)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => setDeleteId(p.id)}>Delete</Button>
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
            <ProblemForm
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
            <div className="mb-4">Are you sure you want to delete this problem?</div>
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