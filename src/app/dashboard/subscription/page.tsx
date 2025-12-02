"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SubscriptionPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to pricing page which now handles payments via Paybill
    router.push("/dashboard/pricing");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
        <p className="text-secondary">Redirecting to pricing page...</p>
      </div>
    </div>
  );
}
