import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function InviteCandidate({ assessmentId }: { assessmentId: string }) {
  const [email, setEmail] = useState("");

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    // Find user by email
    const { data: user } = await supabase.from("users").select("id").eq("email", email).single();
    if (user) {
      await supabase.from("assessment_candidates").insert([{ assessment_id: assessmentId, user_id: user.id }]);
      setEmail("");
      // Optionally refresh candidate list
    } else {
      alert("User not found");
    }
  }

  return (
    <form onSubmit={handleInvite}>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Candidate Email" required />
      <button type="submit">Invite</button>
    </form>
  );
}
