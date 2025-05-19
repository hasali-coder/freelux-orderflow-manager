import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ForgotPasswordFormProps {
  onResetSent: () => void;
}

export function ForgotPasswordForm({ onResetSent }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) return setError("Email is required");

    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      toast.success("Reset link sent!", {
        description: `We've sent a password reset link to ${email}`,
      });
      onResetSent();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending reset link..." : "Send reset link"}
      </Button>
    </form>
  );
}
