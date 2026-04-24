import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-muted-foreground text-sm">Use your email and password.</p>
      </div>
      <LoginForm />
    </div>
  );
}
