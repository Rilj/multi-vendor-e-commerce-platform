import Link from "next/link";

export function AuthRedirect({ to = "/login" }: { to?: string }) {
  const { useRouter, useSearchParams } = require("next/navigation");
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const href = `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return <Link href={href}>{to}</Link>;
}
