"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define signup schema with validation
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and privacy policy",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const acceptTerms = watch("acceptTerms");

  const handleTermsChange = (checked: boolean) => {
    setValue("acceptTerms", checked);
  };

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      // Call the API to register the user
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
          role: "BUSINESS_OWNER", // Default role from schema
        }),
      });
      
      // Parse the response JSON once and store it
      const data = await response.json();
      
      if (!response.ok) {
        // Use the already parsed data
        throw new Error(data.error || "Registration failed");
      }
      
      // Show success message
      toast.success(data.message || "Registration successful");
      
      // Redirect to login page or dashboard
      router.push("/signin");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToSignin = () => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push('/signin');
    }, 500);
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to Home
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-brand-600">
                  <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h1 className="mb-2 font-bold text-gray-800 text-2xl dark:text-white/90">
              Join Rafiki Today
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Register your business and connect with customers across Tanzania
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800/40 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div>
                  <Label>
                    Full Name <span className="text-error-500">*</span>
                  </Label>
                  <Input 
                    placeholder="John Doe" 
                    type="text" 
                    name="name"
                    onChange={(e) => setValue("name", e.target.value)}
                    error={!!errors.name}
                    hint={errors.name?.message}
                  />
                </div>
                
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input 
                    placeholder="youremail@example.com" 
                    type="email" 
                    name="email"
                    onChange={(e) => setValue("email", e.target.value)}
                    error={!!errors.email}
                    hint={errors.email?.message}
                  />
                </div>
                
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
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
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                
                <div>
                  <Label>
                    Confirm Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      name="confirmPassword"
                      onChange={(e) => setValue("confirmPassword", e.target.value)}
                      error={!!errors.confirmPassword}
                      hint={errors.confirmPassword?.message}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Checkbox checked={!!acceptTerms} onChange={handleTermsChange} />
                  <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                    I agree to Rafiki's{" "}
                    <Link href="/terms" className="text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </div>
                {errors.acceptTerms && (
                  <p className="mt-1 text-sm text-error-500">{errors.acceptTerms.message}</p>
                )}
                
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
                        Creating Account...
                      </div>
                    ) : "Create Account"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
                Already have an account?{" "}
                <button
                  onClick={handleNavigateToSignin}
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline focus:outline-none"
                  disabled={isNavigating}
                >
                  {isNavigating ? (
                    <span className="inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Redirecting...
                    </span>
                  ) : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
