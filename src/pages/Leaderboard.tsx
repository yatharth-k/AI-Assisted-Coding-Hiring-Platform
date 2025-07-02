import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LeaderboardRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/contests/1/leaderboard", { replace: true });
  }, [navigate]);
  return null;
}
