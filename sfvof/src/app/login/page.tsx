import { Suspense } from "react";
import SfvofLoginForm from "@sfvof/components/SfvofLoginForm";

export default function SfvofLoginPage() {
  return (
    <main className="min-h-screen bg-[#edf2ee] px-4 pb-10 pt-6">
      <div className="mx-auto max-w-3xl">
        <Suspense fallback={<div>Laddar...</div>}>
          <SfvofLoginForm />
        </Suspense>
      </div>
    </main>
  );
}
