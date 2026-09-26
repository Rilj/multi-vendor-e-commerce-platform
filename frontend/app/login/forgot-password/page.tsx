import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Forgot Password</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter your email to receive a password reset link.
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" />
                </div>
                <Button className="w-full">Send Reset Link</Button>
                <Link href="/login" className="text-center text-sm text-muted-foreground hover:text-foreground">
                  Back to login
                </Link>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
