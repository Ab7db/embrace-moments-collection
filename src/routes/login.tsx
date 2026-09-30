import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  // If already logged in and admin, redirect to admin
  if (user && isAdmin) {
    navigate({ to: "/admin" });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // AuthContext will detect the change and update state
      navigate({ to: "/admin" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="absolute inset-0 film-grain opacity-50" style={{ pointerEvents: "none" }} />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-surface/80" style={{ pointerEvents: "none" }} />
      
      <div className="relative z-10 w-full max-w-md bg-surface/50 border border-border backdrop-blur-xl p-8 rounded-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-foreground tracking-widest">ALABAD</h1>
          <p className="type-meta text-accent mt-2">Admin Portal</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 text-sm rounded-sm text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="type-meta text-muted-foreground block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-sm px-4 py-3 text-foreground focus:border-accent focus:outline-none transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="type-meta text-muted-foreground block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-sm px-4 py-3 text-foreground focus:border-accent focus:outline-none transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-background py-3 rounded-sm type-meta hover:bg-foreground transition-colors disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
