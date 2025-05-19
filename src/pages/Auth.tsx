import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Circle } from "lucide-react";
import backgroundImage from "/assets/freelancer-workspace.jpg";

export default function Auth() {
  const [view, setView] = useState<"login" | "register" | "forgot-password">("login");
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT SIDE - IMAGE */}
      <div
        className="hidden md:flex w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="bg-black/40 w-full p-12 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-white">
            <Circle className="h-8 w-8 fill-white stroke-primary" />
            <span className="text-2xl font-heading font-bold">ClikTrack</span>
          </div>
          <div className="text-white max-w-md mt-auto">
            <h1 className="text-4xl font-heading font-bold mb-4">Manage your freelance business with confidence</h1>
            <p className="text-white/80">Track clients, projects, finances and more in one intuitive dashboard.</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - FORM */}
      <div className="w-full md:w-1/2 flex flex-col">
        <header className="flex justify-between items-center p-4 md:p-6">
          <div className="md:hidden flex items-center gap-2">
            <Circle className="h-6 w-6 fill-primary stroke-primary-foreground" />
            <span className="text-xl font-heading font-bold">ClikTrack</span>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 flex items-center justify-center px-4 md:px-6 py-8">
          <div className="w-full max-w-md space-y-8">
            {view === "login" && (
              <>
                <div className="text-center">
                  <h2 className="text-3xl font-heading font-bold">Welcome back</h2>
                  <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
                </div>
                <LoginForm 
                  onLogin={handleLogin} 
                  onForgotPassword={() => setView("forgot-password")} 
                />
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button onClick={() => setView("register")} className="text-primary font-semibold hover:underline">
                    Sign up
                  </button>
                </p>
              </>
            )}

            {view === "register" && (
              <>
                <div className="text-center">
                  <h2 className="text-3xl font-heading font-bold">Create an account</h2>
                  <p className="text-muted-foreground mt-2">Enter your details to get started</p>
                </div>
                <RegisterForm onRegisterSuccess={() => setView("login")} />
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => setView("login")} className="text-primary font-semibold hover:underline">
                    Sign in
                  </button>
                </p>
              </>
            )}

            {view === "forgot-password" && (
              <>
                <div className="text-center">
                  <h2 className="text-3xl font-heading font-bold">Reset your password</h2>
                  <p className="text-muted-foreground mt-2">We'll email you a link to reset it</p>
                </div>
                <ForgotPasswordForm onResetSent={() => setView("login")} />
                <div className="text-center">
                  <button onClick={() => setView("login")} className="text-sm font-semibold text-primary hover:underline">
                    Back to login
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
