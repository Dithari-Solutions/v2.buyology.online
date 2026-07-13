import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Buyology account.",
};

export default function LoginPage() {
  return (
    <main>
      <AuthShell>
        <LoginForm />
      </AuthShell>
    </main>
  );
}
