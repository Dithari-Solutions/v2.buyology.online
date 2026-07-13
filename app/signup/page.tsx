import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Buyology account and start shopping the future.",
};

export default function SignupPage() {
  return (
    <main>
      <AuthShell>
        <SignupForm />
      </AuthShell>
    </main>
  );
}
