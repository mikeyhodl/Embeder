/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// import { Form } from "@/app/(mainLayout)/form";
import { ResetPassword } from "@/lib/auth"; // Updated import
// import { SubmitButton } from "@/app/(mainLayout)/submit-button";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  // Updated function name
  const router = useRouter();
  const [email, setEmail] = useState(""); // Added state for email
  const [newPassword, setNewPassword] = useState(""); // Added state for newPassword
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (event: any) => {
    // Updated function name
    event.preventDefault();
    setIsLoading(true);
    try {
      // Call ResetPassword function with email and newPassword
      await ResetPassword(email, newPassword);
      toast.success("Password reset successfully");
      router.push("/auth/login");
    } catch {
      // console.error("Error resetting password:", error);
      toast.error("Error resetting password, please try again");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:grid-cols-2 h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Reset Password</h1>{" "}
            {/* Updated title */}
            <p className="text-balance text-muted-foreground">
              Enter your email and new password below to reset your password
            </p>
          </div>
          <form onSubmit={handleResetPassword}>
            {" "}
            {/* Updated form handler */}
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label> {/* Added email input */}
                <Input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newPassword">New Password</Label>{" "}
                {/* Added newPassword input */}
                <Input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            Remembered your password?{" "}
            <Link href="/auth/login" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="/img/pexels-john-tekeridis-21837-1072851.jpg"
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
