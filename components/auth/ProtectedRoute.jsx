
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      const loginUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
      return;
    }

    setIsChecking(false);
  }, [router, pathname]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
          <p className="text-sm text-gray-600">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return children;
}
