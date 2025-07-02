import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function CompanyForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("companies").insert([{ name, description }]);
    setName("");
    setDescription("");
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Company Name" required />
      <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
      <button type="submit">Create Company</button>
    </form>
  );
}
