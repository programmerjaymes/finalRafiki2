"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Icon from "@/components/icons/Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signIn } from "next-auth/react";
import { t } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

// Define login schema with validation
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function SignInForm() {
  const locale = useLocale();
  const messages = t(locale);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const isChecked = watch("rememberMe");

  const handleCheckboxChange = (checked: boolean) => {
    setValue("rememberMe", checked);
  };

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // Use NextAuth's signIn function with direct redirect to business dashboard for business owners
      const result = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });
      
      if (!result?.ok) {
        // Handle error
        throw new Error(result?.error || "Login failed");
      }
      
      // Show success message
      toast.success(messages.auth.loginSuccess);
      
      // Get the user session to determine role
      const response = await fetch('/api/auth/session');
      const session = await response.json();
      
      // Wait for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect based on user role
      if (session?.user?.role === "ADMIN") {
        router.push("/dashboard");
      } else if (session?.user?.role === "BUSINESS_OWNER") {
        console.log("Redirecting business owner to dashboard");
        // Force a hard navigation to ensure the middleware picks up the session
        window.location.href = "/business-dashboard";
      } else {
        // Default redirect for other roles
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : messages.auth.loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToSignup = () => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push('/signup');
    }, 500);
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M12.7083 5L7.5 10.2083L12.7083 15.4167"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
          </svg>
          {messages.auth.backHome}
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-brand-600">
                  <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
                  <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
                </svg>
              </div>
            </div>
            <h1 className="mb-2 font-bold text-gray-800 text-2xl dark:text-white/90">
              {messages.auth.welcomeTitle}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {messages.auth.welcomeSubtitle}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800/40 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div>
                  <Label>
                    {messages.auth.email} <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input 
                    placeholder={messages.auth.emailPlaceholder}
                    type="email" 
                    name="email"
                    onChange={(e) => setValue("email", e.target.value)}
                    error={!!errors.email}
                    hint={errors.email?.message}
                  />
                </div>
                <div>
                  <Label>
                    {messages.auth.password} <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={messages.auth.passwordPlaceholder}
                      name="password"
                      onChange={(e) => setValue("password", e.target.value)}
                      error={!!errors.password}
                      hint={errors.password?.message}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <Icon 
                          Icon={EyeIcon} 
                          fallback={<span>👁️</span>}
                          className="fill-gray-500 dark:fill-gray-400" 
                        />
                      ) : (
                        <Icon 
                          Icon={EyeCloseIcon} 
                          fallback={<span>👁️‍🗨️</span>}
                          className="fill-gray-500 dark:fill-gray-400" 
                        />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={!!isChecked} onChange={handleCheckboxChange} />
                    <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                      {messages.auth.keepLoggedIn}
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    {messages.auth.forgotPassword}
                  </Link>
                </div>
                <div>
                  <Button 
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white" 
                    size="sm" 
                    onClick={() => handleSubmit(onSubmit)()}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {messages.auth.signingIn}
                      </div>
                    ) : messages.auth.signIn}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
                {messages.auth.noAccount} {""}
                <button
                  onClick={handleNavigateToSignup}
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline focus:outline-none"
                  disabled={isNavigating}
                >
                  {isNavigating ? (
                    <span className="inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {messages.auth.redirecting}
                    </span>
                  ) : messages.auth.signUp}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
