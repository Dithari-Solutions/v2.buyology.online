import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Reset your Buyology account password with a one-time code.",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <main>
      <AuthShell>
        <ForgotPasswordForm />
      </AuthShell>
    </main>
  );
}
