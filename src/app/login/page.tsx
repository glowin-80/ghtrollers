import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="px-4 pb-10 pt-6">
      <div className="mx-auto max-w-3xl">
        <Suspense fallback={<div>Laddar...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}