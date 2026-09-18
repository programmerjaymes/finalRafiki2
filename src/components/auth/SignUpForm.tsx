"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import toast from "@/utils/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { isValidTzPhone } from "@/lib/phoneNumber";
import TanzaniaPhoneInput from "@/components/form/input/TanzaniaPhoneInput";
import { useLocale } from "@/lib/useLocale";

// Define signup schema with validation
const createSignupSchema = (sw: boolean) => z.object({
  name: z.string().min(2, sw ? "Jina lazima liwe na angalau herufi 2" : "Name must be at least 2 characters"),
  phone: z.string().optional().or(z.literal('')).refine(
    (val) => !val || isValidTzPhone(val),
    { message: sw ? "Tafadhali weka namba sahihi ya simu yenye tarakimu 9" : "Please enter a valid 9-digit phone number" },
  ),
  email: z.string().email(sw ? "Tafadhali weka anuani sahihi ya barua pepe" : "Please enter a valid email address").optional().or(z.literal('')),
  password: z.string().min(6, sw ? "Nenosiri lazima liwe na angalau herufi 6" : "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: sw ? "Lazima ukubali masharti na sera ya faragha" : "You must accept the terms and privacy policy",
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: sw ? "Manenosiri hayalingani" : "Passwords do not match",
  path: ["confirmPassword"],
}).refine(data => data.email || data.phone, {
  message: sw ? "Tafadhali weka barua pepe au namba ya simu" : "Please provide either an email address or phone number",
  path: ["phone"],
});

type SignupFormValues = z.infer<ReturnType<typeof createSignupSchema>>;

export default function SignUpForm() {
  const sw = useLocale() === "sw";
  const text = (english: string, swahili: string) => sw ? swahili : english;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const signupSchema = useMemo(() => createSignupSchema(sw), [sw]);

  const { handleSubmit, formState: { errors }, setValue, watch } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const acceptTerms = watch("acceptTerms");
  const phoneValue = watch("phone");

  const handleTermsChange = (checked: boolean) => {
    setValue("acceptTerms", checked);
  };

  const onSubmit = async (values: SignupFormValues) => {
    const confirmation = await toast.confirm(
      text("Create your account?", "Fungua akaunti yako?"),
      text(
        `Please confirm that the details for ${values.name} are correct before creating the account.`,
        `Tafadhali thibitisha kuwa taarifa za ${values.name} ni sahihi kabla ya kufungua akaunti.`,
      ),
      "question",
      text("Yes, create account", "Ndiyo, fungua akaunti"),
      text("Review details", "Kagua taarifa"),
    );

    if (!confirmation.isConfirmed) return;

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
          email: values.email || undefined,
          phone: values.phone || undefined,
          password: values.password,
          role: "BUSINESS_OWNER",
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
      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get('callbackUrl');
      if (callbackUrl && callbackUrl.startsWith('/')) {
        router.push(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      } else {
        router.push('/signin');
      }
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
          {text("Back to Home", "Rudi Nyumbani")}
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
              {text("Join Rafiki Today", "Jiunge na Rafiki Leo")}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              {text(
                "Register your business and connect with customers across Tanzania",
                "Sajili biashara yako na uunganishwe na wateja kote Tanzania",
              )}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800/40 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6">
                <div>
                  <Label>
                    {text("Full Name", "Jina Kamili")} <span className="text-error-500">*</span>
                  </Label>
                  <Input 
                    placeholder={text("John Doe", "Jina lako kamili")}
                    type="text" 
                    name="name"
                    onChange={(e) => setValue("name", e.target.value)}
                    error={!!errors.name}
                    hint={errors.name?.message}
                  />
                </div>
                
                <div>
                  <Label>
                    {text("Phone Number", "Namba ya Simu")} <span className="text-error-500">*</span>
                  </Label>
                  <TanzaniaPhoneInput
                    name="phone"
                    value={phoneValue}
                    onChange={(e) => setValue("phone", e.target.value, { shouldValidate: true })}
                    error={!!errors.phone}
                    hint={errors.phone?.message}
                  />
                </div>

                <div>
                  <Label>
                    {text("Email", "Barua Pepe")} <span className="text-gray-400 text-xs font-normal">({text("optional", "si lazima")})</span>
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
                    {text("Password", "Nenosiri")} <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={text("Create a strong password", "Weka nenosiri imara")}
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
                    {text("Confirm Password", "Thibitisha Nenosiri")} <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={text("Confirm your password", "Thibitisha nenosiri lako")}
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
                    {text("I agree to Rafiki's", "Ninakubali")} {" "}
                    <Link href="/terms" className="text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline">
                      {text("Terms of Service", "Masharti ya Huduma ya Rafiki")}
                    </Link>{" "}
                    {text("and", "na")} {" "}
                    <Link href="/privacy" className="text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline">
                      {text("Privacy Policy", "Sera ya Faragha")}
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
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {text("Creating Account...", "Inafungua Akaunti...")}
                      </div>
                    ) : text("Create Account", "Fungua Akaunti")}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
                {text("Already have an account?", "Tayari una akaunti?")} {" "}
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
                      {text("Redirecting...", "Inaelekeza...")}
                    </span>
                  ) : text("Sign In", "Ingia")}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
