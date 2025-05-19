
import { useState } from "react";
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate email
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    
    // Simulate loading state
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      
      // In a real app, we would send password reset email here
      toast.success("Reset link sent!", {
        description: `We've sent a password reset link to ${email}`
      });
      onResetSent();
    }, 1000);
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
          autoComplete="email"
          required
        />
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Sending reset link..." : "Send reset link"}
      </Button>
    </form>
  );
}
