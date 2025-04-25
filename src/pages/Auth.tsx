import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (isLogin) {
        console.log("Attempting login with:", form.email);
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: form.email, 
          password: form.password 
        });
        
        if (error) {
          console.error("Login error:", error);
          setError(error.message);
          toast.error("Login failed", {
            description: error.message
          });
        } else if (data.user) {
          console.log("Login successful for:", data.user.email);
          toast.success("Logged in successfully!");
          navigate("/");
        }
      } else {
        console.log("Attempting signup with:", form.email);
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { 
            data: { full_name: form.name },
          },
        });
        
        if (error) {
          console.error("Signup error:", error);
          setError(error.message);
          toast.error("Registration failed", {
            description: error.message
          });
        } else if (data.user) {
          console.log("Signup successful for:", data.user.email);
          
          // Check if email confirmation is required
          if (data.session) {
            // No email confirmation required
            toast.success("Registration successful! You're now logged in.");
            navigate("/");
          } else {
            // Email confirmation required
            toast.success("Registration successful! Please check your email to verify your account.");
            setIsLogin(true);
          }
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An unexpected error occurred");
      toast.error("Authentication error", {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Sign In" : "Sign Up"}</CardTitle>
          <CardDescription>
            {isLogin ? "Log in to your account" : "Create a new account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <Input
                placeholder="Full Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                disabled={loading}
              />
            )}
            <Input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
              disabled={loading}
            />
            <Input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              disabled={loading}
              minLength={6}
            />
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                isLogin ? "Sign In" : "Sign Up"
              )}
            </Button>
          </form>
          <div className="text-center mt-4">
            <button 
              type="button" 
              className="text-primary underline text-sm" 
              onClick={toggleMode}
              disabled={loading}
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
