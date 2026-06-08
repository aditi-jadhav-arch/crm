"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "../../lib/hooks/useAuth";
import { registerSchema } from "../../lib/validations";
import { Lock, Mail, User } from "lucide-react";
import { z } from "zod";

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      await signUpWithEmail(data.name, data.email, data.password);
      toast.success("Account created successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle();
      toast.success("Successfully registered with Google!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Google registration failed.");
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-xl p-8 animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xl mx-auto mb-3 shadow-md">
            C
          </div>
          <h2 className="text-2xl font-bold text-foreground">Create account</h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Get started by creating your CRM profile
          </p>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                {...register("name")}
                placeholder="John Doe"
                className="w-full bg-background border border-border text-foreground pl-9 pr-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive font-semibold mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                {...register("email")}
                placeholder="john@company.com"
                className="w-full bg-background border border-border text-foreground pl-9 pr-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive font-semibold mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                {...register("password")}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full bg-background border border-border text-foreground pl-9 pr-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-destructive font-semibold mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                {...register("confirmPassword")}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full bg-background border border-border text-foreground pl-9 pr-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-destructive font-semibold mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isGoogleSubmitting}
            className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-md hover:opacity-90 disabled:opacity-50 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 text-sm mt-6"
          >
            {isSubmitting ? (
              <span className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
            ) : null}
            <span>Sign Up</span>
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <span className="relative bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider">
            or continue with
          </span>
        </div>

        {/* Google Register */}
        <button
          onClick={handleGoogleSignIn}
          type="button"
          disabled={isSubmitting || isGoogleSubmitting}
          className="w-full py-2.5 border border-border bg-card text-foreground font-semibold rounded-md hover:bg-muted disabled:opacity-50 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2 text-sm"
        >
          {isGoogleSubmitting ? (
            <span className="h-4 w-4 border-2 border-t-transparent border-foreground rounded-full animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
          )}
          <span>Sign Up with Google</span>
        </button>

        {/* Signin Redirect */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-bold transition-all">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
