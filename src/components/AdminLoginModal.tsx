import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { X, Lock, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const [email, setEmail] = useState("alabade@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (isOpen && user && isAdmin) {
      navigate({ to: "/admin" });
      onClose();
    }
  }, [isOpen, user, isAdmin, navigate, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      // Check admin status
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .single();

      onClose();
      navigate({ to: "/admin" });
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "فشل تسجيل الدخول. يرجى التحقق من البريد وكلمة المرور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-surface/95 border border-border/80 backdrop-blur-2xl p-8 rounded-sm shadow-2xl shadow-black/80 space-y-6"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "scale-up 0.25s var(--ease-cine)" }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 end-5 p-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
          aria-label="إغلاق / Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-3">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="font-display text-2xl tracking-[0.2em] text-foreground">
            ALABAD
          </h3>
          <p className="type-meta text-xs text-accent">
            لوحة تحكم الإدارة / Admin Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-sm text-xs type-meta text-center leading-relaxed">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 pt-2">
          <div>
            <label className="type-meta text-xs text-muted-foreground block mb-1.5">
              البريد الإلكتروني / Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@alabad.com"
              className="w-full bg-background border border-border px-3.5 py-2.5 rounded-sm text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
              autoFocus
            />
          </div>

          <div>
            <label className="type-meta text-xs text-muted-foreground block mb-1.5">
              كلمة المرور / Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-background border border-border px-3.5 py-2.5 rounded-sm text-sm text-foreground focus:border-accent focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-background py-3 rounded-sm type-meta text-xs font-semibold flex items-center justify-center gap-2 hover:bg-foreground transition-all duration-200 disabled:opacity-50 mt-2 shadow-lg shadow-accent/10"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري التحقق...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                دخول لوحة التحكم / Sign In
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-border/50">
          <p className="type-meta text-[11px] text-muted-foreground/60">
            بوابة الإدارة الخاصة بموقع ALABAD (عبدالكريم فيصل)
          </p>
        </div>
      </div>
    </div>
  );
}
