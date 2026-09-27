"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function AuthRedirect({ to = "/login" }: { to?: string }) {
  return (
    <Suspense fallback={<Link href={to}>{to}</Link>}>
      <AuthRedirectInner to={to} />
    </Suspense>
  );
}

function AuthRedirectInner({ to = "/login" }: { to?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const href = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return <Link href={href}>{to}</Link>;
}
